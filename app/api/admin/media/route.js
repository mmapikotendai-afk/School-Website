import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getStaffForRoute } from '@/lib/cms/auth';
import { GALLERY_CATEGORIES, MAX_IMAGE_BYTES, slugify } from '@/lib/cms/config';

export const runtime = 'nodejs';

const MAX_CLIENT_UPLOAD_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1920;
const TARGET_BYTES = 300 * 1024;

async function optimiseForStorage(input) {
  let output;
  for (const quality of [80, 76, 72, 68, 64]) {
    output = await sharp(input, { failOn: 'warning', limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    if (output.info.size <= TARGET_BYTES) break;
  }
  return output;
}

export async function POST(request) {
  const { staff, response } = await getStaffForRoute();
  if (response) return response;
  let stage = 'validation';
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (file.type !== 'image/webp') return Response.json({ error: 'Upload rejected: images must be compressed to WebP in the browser first.' }, { status: 415 });
    if (file.size < 1 || file.size > MAX_CLIENT_UPLOAD_BYTES) return Response.json({ error: 'The compressed image must be between 1 byte and 1 MB.' }, { status: 413 });

    const input = Buffer.from(await file.arrayBuffer());
    const probe = sharp(input, { failOn: 'warning', limitInputPixels: 40_000_000 });
    const metadata = await probe.metadata();
    if (metadata.format !== 'webp') return Response.json({ error: 'The uploaded file is not a valid WebP image.' }, { status: 415 });
    if (!metadata.width || !metadata.height) return Response.json({ error: 'The image has invalid dimensions.' }, { status: 400 });
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) return Response.json({ error: 'The compressed image exceeds the maximum 1920px dimensions.' }, { status: 413 });
    if ((metadata.pages || 1) > 1) return Response.json({ error: 'Animated images are not supported.' }, { status: 415 });

    const output = await optimiseForStorage(input);
    const originalName = String(formData.get('originalName') || file.name || 'image').slice(0, 180);
    const reportedOriginalBytes = Number(formData.get('originalBytes'));
    const originalBytes = Number.isFinite(reportedOriginalBytes)
      ? Math.min(MAX_IMAGE_BYTES, Math.max(file.size, reportedOriginalBytes))
      : file.size;
    const publishToGallery = formData.get('publishToGallery') === 'true';
    const caption = String(formData.get('caption') || '').trim().slice(0, 180);
    const category = String(formData.get('category') || '').trim();
    const altText = String(formData.get('alt') || '').trim().slice(0, 220);
    if (publishToGallery && (!caption || !altText || !GALLERY_CATEGORIES.includes(category))) {
      return Response.json({ error: 'Gallery images require a caption, description and valid category.' }, { status: 400 });
    }
    const path = `${new Date().getUTCFullYear()}/${String(new Date().getUTCMonth() + 1).padStart(2, '0')}/${slugify(originalName.replace(/\.[^.]+$/, ''))}-${randomUUID().slice(0, 8)}.webp`;
    stage = 'storage';
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage.from('cms-media').upload(path, output.data, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from('cms-media').getPublicUrl(path);
    const asset = {
      storage_path: path, public_url: publicData.publicUrl, original_name: originalName,
      alt_text: altText || null,
      mime_type: 'image/webp', width: output.info.width, height: output.info.height,
      original_bytes: originalBytes, optimized_bytes: output.info.size, uploaded_by: staff.id,
    };
    if (publishToGallery) Object.assign(asset, { caption, gallery_category: category, is_gallery: true, published_at: new Date().toISOString() });
    const { data, error } = await supabase.from('media_assets').insert(asset).select('id').single();
    if (error) { await supabase.storage.from('cms-media').remove([path]); throw error; }
    if (publishToGallery) {
      revalidateTag('gallery');
      revalidatePath('/gallery');
    }
    return Response.json({ id: data.id, publicUrl: publicData.publicUrl, optimizedBytes: output.info.size, width: output.info.width, height: output.info.height, publishedToGallery: publishToGallery });
  } catch (error) {
    console.error('Media upload failed:', error);
    if (stage === 'validation') return Response.json({ error: 'The image is corrupted or could not be safely decoded. Choose another image.' }, { status: 400 });
    return Response.json({ error: 'The compressed image passed validation, but storage failed. Try uploading it again.' }, { status: 502 });
  }
}
