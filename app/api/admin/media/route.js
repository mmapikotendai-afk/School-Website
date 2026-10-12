import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { getStaffForRoute } from '@/lib/cms/auth';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, slugify } from '@/lib/cms/config';

export const runtime = 'nodejs';

export async function POST(request) {
  const { staff, response } = await getStaffForRoute();
  if (response) return response;
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return Response.json({ error: 'Unsupported image format.' }, { status: 415 });
    if (file.size < 1 || file.size > MAX_IMAGE_BYTES) return Response.json({ error: 'The image must be between 1 byte and 15 MB.' }, { status: 413 });

    const input = Buffer.from(await file.arrayBuffer());
    const probe = sharp(input, { failOn: 'warning', limitInputPixels: 40_000_000 });
    const metadata = await probe.metadata();
    if (!['jpeg', 'png', 'webp', 'avif'].includes(metadata.format)) return Response.json({ error: 'The file is not a valid supported image.' }, { status: 415 });

    const output = await sharp(input, { failOn: 'warning', limitInputPixels: 40_000_000 })
      .rotate().resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, smartSubsample: true }).toBuffer({ resolveWithObject: true });
    const originalName = String(formData.get('originalName') || file.name || 'image').slice(0, 180);
    const originalBytes = Math.max(Number(formData.get('originalBytes')) || file.size, file.size);
    const path = `${new Date().getUTCFullYear()}/${String(new Date().getUTCMonth() + 1).padStart(2, '0')}/${slugify(originalName.replace(/\.[^.]+$/, ''))}-${randomUUID().slice(0, 8)}.webp`;
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage.from('cms-media').upload(path, output.data, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from('cms-media').getPublicUrl(path);
    const asset = {
      storage_path: path, public_url: publicData.publicUrl, original_name: originalName,
      alt_text: String(formData.get('alt') || '').trim().slice(0, 220) || null,
      mime_type: 'image/webp', width: output.info.width, height: output.info.height,
      original_bytes: originalBytes, optimized_bytes: output.info.size, uploaded_by: staff.id,
    };
    const { data, error } = await supabase.from('media_assets').insert(asset).select('id').single();
    if (error) { await supabase.storage.from('cms-media').remove([path]); throw error; }
    return Response.json({ id: data.id, publicUrl: publicData.publicUrl, optimizedBytes: output.info.size, width: output.info.width, height: output.info.height });
  } catch (error) {
    console.error('Media upload failed:', error);
    return Response.json({ error: 'The image could not be validated and stored. Try another image.' }, { status: 400 });
  }
}
