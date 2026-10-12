'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { Check, ImagePlus, LoaderCircle, Upload, X } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, GALLERY_CATEGORIES, MAX_IMAGE_BYTES } from '@/lib/cms/config';

const TARGET_BYTES = 300 * 1024;
const MAX_DIMENSION = 1920;
const MAX_PIXELS = 40_000_000;

function size(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function savedPercent(original, compressed) {
  return Math.max(0, Math.round((1 - compressed / original) * 100));
}

function updateItem(setItems, id, changes) {
  setItems(current => current.map(item => item.id === id ? { ...item, ...changes } : item));
}

async function decodeDimensions(file) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('decode failed'));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function validateAndCompress(file, onProgress) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error('Unsupported format. Choose a JPEG, PNG, WebP or AVIF image.');
  if (file.size < 1) throw new Error('This file is empty. Choose another image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('The original image must be 15 MB or smaller.');

  let dimensions;
  try {
    dimensions = await decodeDimensions(file);
  } catch {
    throw new Error('This image is corrupted or cannot be decoded by your browser.');
  }
  if (!dimensions.width || !dimensions.height) throw new Error('The image has invalid dimensions.');
  if (dimensions.width * dimensions.height > MAX_PIXELS) throw new Error('The image dimensions are too large. Use an image smaller than 40 megapixels.');

  const compressed = await imageCompression(file, {
    maxSizeMB: TARGET_BYTES / 1024 / 1024,
    maxWidthOrHeight: MAX_DIMENSION,
    initialQuality: 0.8,
    fileType: 'image/webp',
    useWebWorker: true,
    preserveExif: false,
    alwaysKeepResolution: false,
    onProgress,
  });
  if (!compressed?.size || compressed.type !== 'image/webp') throw new Error('The browser could not create an optimised WebP image.');
  const outputDimensions = await decodeDimensions(compressed);
  if (outputDimensions.width > MAX_DIMENSION || outputDimensions.height > MAX_DIMENSION) throw new Error('The browser could not resize this image to the safe upload dimensions.');
  if (outputDimensions.width > dimensions.width || outputDimensions.height > dimensions.height) throw new Error('The browser attempted to upscale this image, so it was not uploaded.');

  return {
    file: new File([compressed], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp', lastModified: Date.now() }),
    dimensions,
    outputDimensions,
  };
}

function uploadImage(item, alt, onProgress) {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.set('image', item.compressedFile);
    body.set('originalName', item.originalName);
    body.set('originalBytes', String(item.originalBytes));
    body.set('alt', alt);
    if (item.publishToGallery) {
      body.set('publishToGallery', 'true');
      body.set('caption', item.caption);
      body.set('category', item.category);
    }
    const request = new XMLHttpRequest();
    request.open('POST', '/api/admin/media');
    request.responseType = 'json';
    request.upload.addEventListener('progress', event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener('load', () => {
      const result = request.response || {};
      if (request.status >= 200 && request.status < 300) resolve(result);
      else reject(new Error(result.error || 'The upload was rejected by the server.'));
    });
    request.addEventListener('error', () => reject(new Error('The network connection failed during upload. Try again.')));
    request.addEventListener('abort', () => reject(new Error('The upload was cancelled.')));
    request.send(body);
  });
}

export default function ImageUploader({ urlName, altName, initialUrl = '', initialAlt = '', multiple = false }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [alt, setAlt] = useState(initialAlt);
  const [items, setItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const input = useRef(null);
  const itemsRef = useRef([]);
  itemsRef.current = items;

  useEffect(() => () => {
    itemsRef.current.forEach(item => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
  }, []);

  async function choose(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;
    const incoming = selected.map(file => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      originalName: file.name,
      originalBytes: file.size,
      status: 'compressing',
      compressionProgress: 0,
      uploadProgress: 0,
      alt: '',
      caption: '',
      category: GALLERY_CATEGORIES[0],
      publishToGallery: false,
      error: '',
    }));
    if (!multiple) {
      items.forEach(item => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
      setItems(incoming.slice(0, 1));
    } else {
      setItems(current => [...current, ...incoming]);
    }
    setProcessing(true);

    for (const [index, selectedItem] of incoming.entries()) {
      if (!multiple && index > 0) break;
      const file = selected[index];
      try {
        const result = await validateAndCompress(file, progress => updateItem(setItems, selectedItem.id, { compressionProgress: progress }));
        const previewUrl = URL.createObjectURL(result.file);
        updateItem(setItems, selectedItem.id, {
          compressedFile: result.file,
          compressedBytes: result.file.size,
          previewUrl,
          sourceWidth: result.dimensions.width,
          sourceHeight: result.dimensions.height,
          outputWidth: result.outputDimensions.width,
          outputHeight: result.outputDimensions.height,
          compressionProgress: 100,
          status: 'ready',
        });
      } catch (reason) {
        updateItem(setItems, selectedItem.id, { status: 'error', error: reason.message || 'The image could not be compressed.' });
      }
    }
    setProcessing(false);
  }

  function removeItem(item) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (!multiple && item.status === 'uploaded') setUrl('');
    setItems(current => current.filter(candidate => candidate.id !== item.id));
  }

  async function uploadReady() {
    const ready = items.filter(item => item.status === 'ready');
    if (!ready.length) return;
    const missingMetadata = ready.find(item => multiple && item.publishToGallery && (!item.alt.trim() || !item.caption.trim()));
    if (missingMetadata) {
      updateItem(setItems, missingMetadata.id, { error: 'Add a caption and image description before publishing this image to the Gallery.' });
      return;
    }
    setUploading(true);
    let uploaded = 0;
    for (const item of ready) {
      updateItem(setItems, item.id, { status: 'uploading', uploadProgress: 0, error: '' });
      try {
        const result = await uploadImage(item, multiple ? item.alt : alt, progress => updateItem(setItems, item.id, { uploadProgress: progress }));
        updateItem(setItems, item.id, {
          status: 'uploaded', uploadProgress: 100, publicUrl: result.publicUrl,
          storedBytes: result.optimizedBytes, width: result.width, height: result.height,
          publishedToGallery: result.publishedToGallery,
        });
        if (!multiple) setUrl(result.publicUrl);
        uploaded += 1;
      } catch (reason) {
        updateItem(setItems, item.id, { status: 'error', error: reason.message || 'The image could not be uploaded.' });
      }
    }
    setUploading(false);
    if (uploaded && multiple) router.refresh();
  }

  const readyCount = items.filter(item => item.status === 'ready').length;
  const previewItem = !multiple ? items[0] : null;

  return <div className={`image-uploader${multiple ? ' image-uploader-batch' : ''}`}>
    {!multiple && <div className="image-uploader-preview">
      {previewItem?.previewUrl ? <img src={previewItem.previewUrl} alt="Compressed image preview"/> : url ? <img src={url} alt={alt || 'Current image preview'}/> : <ImagePlus size={34}/>}
    </div>}
    <div className="image-uploader-controls">
      <input type="hidden" name={urlName} value={url}/>
      {!multiple && <label>Image description (required when an image is used)<input name={altName} value={alt} onChange={event => setAlt(event.target.value)} maxLength="220" required={Boolean(url)}/></label>}
      <input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} onChange={choose}/>
      <div className="admin-inline-actions">
        <button type="button" className="button button-outline" onClick={() => input.current?.click()} disabled={processing || uploading}>
          {processing ? <><LoaderCircle className="spin" size={17}/> Compressing…</> : <><ImagePlus size={17}/> {multiple ? 'Select images' : url || items.length ? 'Choose another image' : 'Choose image'}</>}
        </button>
        {readyCount > 0 && <button type="button" className="button button-primary" onClick={uploadReady} disabled={processing || uploading}>
          {uploading ? <><LoaderCircle className="spin" size={17}/> Uploading…</> : <><Upload size={17}/> Upload {multiple ? `${readyCount} ${readyCount === 1 ? 'image' : 'images'}` : 'compressed image'}</>}
        </button>}
        {!multiple && url && !items.length && <button type="button" className="admin-text-button" onClick={() => setUrl('')}><X size={16}/>Remove</button>}
      </div>

      {items.length > 0 && <div className="compression-queue" aria-live="polite">
        {items.map(item => <article className={`compression-item compression-${item.status}`} key={item.id}>
          <div className="compression-thumb">{item.previewUrl ? <img src={item.previewUrl} alt=""/> : <ImagePlus size={24}/>}</div>
          <div className="compression-details">
            <div className="compression-title"><strong>{item.originalName}</strong><span>{item.status === 'uploaded' ? <><Check size={14}/> Uploaded</> : item.status === 'ready' ? 'Ready to upload' : item.status === 'error' ? 'Needs attention' : item.status === 'uploading' ? 'Uploading' : 'Compressing'}</span></div>
            {item.status === 'compressing' && <><div className="compression-progress"><span style={{ width: `${item.compressionProgress}%` }}/></div><small>Compression {item.compressionProgress}%</small></>}
            {item.compressedBytes && <p>Original <strong>{size(item.originalBytes)}</strong> → WebP <strong>{size(item.compressedBytes)}</strong> · <strong>{savedPercent(item.originalBytes, item.compressedBytes)}% saved</strong></p>}
            {item.sourceWidth && <small>{item.sourceWidth} × {item.sourceHeight}px source → {item.outputWidth} × {item.outputHeight}px compressed</small>}
            {multiple && item.status !== 'error' && <div className="gallery-publish-fields">
              <label className="gallery-publish-choice"><input type="checkbox" checked={item.publishToGallery} onChange={event => updateItem(setItems, item.id, { publishToGallery: event.target.checked, error: '' })} disabled={item.status === 'uploading' || item.status === 'uploaded'}/><span>Publish to the public Gallery</span></label>
              <label>Image description {item.publishToGallery ? '(required)' : '(optional)'}<input value={item.alt} onChange={event => updateItem(setItems, item.id, { alt: event.target.value, error: '' })} maxLength="220" placeholder="Describe the image for accessibility" required={item.publishToGallery} disabled={item.status === 'uploading' || item.status === 'uploaded'}/></label>
              {item.publishToGallery && <div className="gallery-metadata-grid"><label>Caption<input value={item.caption} onChange={event => updateItem(setItems, item.id, { caption: event.target.value, error: '' })} maxLength="180" required disabled={item.status === 'uploading' || item.status === 'uploaded'}/></label><label>Gallery category<select value={item.category} onChange={event => updateItem(setItems, item.id, { category: event.target.value })} disabled={item.status === 'uploading' || item.status === 'uploaded'}>{GALLERY_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label></div>}
            </div>}
            {item.status === 'uploading' && <><div className="compression-progress upload-progress"><span style={{ width: `${item.uploadProgress}%` }}/></div><small>Upload {item.uploadProgress}%</small></>}
            {item.status === 'uploaded' && item.storedBytes && <small>Server validated · stored {size(item.storedBytes)} · {item.width} × {item.height}px{item.publishedToGallery ? ' · published to Gallery' : ''}</small>}
            {item.error && <p className="admin-error" role="alert">{item.error}</p>}
          </div>
          {item.status !== 'uploading' && <button type="button" className="compression-remove" onClick={() => removeItem(item)} aria-label={`Remove ${item.originalName}`}><X size={16}/></button>}
        </article>)}
      </div>}
      <p className="field-help">Images are converted to WebP, stripped of metadata and reduced to a maximum width of 1920px before upload. The server validates and optimises them again before storage.</p>
    </div>
  </div>;
}
