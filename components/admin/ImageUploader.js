'use client';
import { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/cms/config';

function size(bytes) { return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
async function compress(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const max = 2200; const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale); const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  canvas.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, width, height); bitmap.close();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image compression failed.')), 'image/webp', .82));
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
}

export default function ImageUploader({ urlName, altName, initialUrl = '', initialAlt = '' }) {
  const [url, setUrl] = useState(initialUrl); const [alt, setAlt] = useState(initialAlt);
  const [stats, setStats] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const input = useRef(null);
  async function choose(event) {
    const file = event.target.files?.[0]; if (!file) return;
    setError('');
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return setError('Choose a JPEG, PNG, WebP or AVIF image.');
    if (file.size > MAX_IMAGE_BYTES) return setError('The original image must be 15 MB or smaller.');
    setBusy(true);
    try {
      const optimized = await compress(file);
      const body = new FormData(); body.set('image', optimized); body.set('originalName', file.name); body.set('originalBytes', String(file.size)); body.set('alt', alt);
      const response = await fetch('/api/admin/media', { method: 'POST', body });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Upload failed.');
      setUrl(result.publicUrl); setStats({ original: file.size, client: optimized.size, stored: result.optimizedBytes, width: result.width, height: result.height });
    } catch (reason) { setError(reason.message || 'The image could not be processed.'); }
    finally { setBusy(false); event.target.value = ''; }
  }
  return <div className="image-uploader"><div className="image-uploader-preview">{url ? <img src={url} alt={alt || 'Selected image preview'}/> : <ImagePlus size={34}/>}</div><div className="image-uploader-controls"><input type="hidden" name={urlName} value={url}/><label>Image description (required when an image is used)<input name={altName} value={alt} onChange={event => setAlt(event.target.value)} maxLength="220" required={Boolean(url)}/></label><input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={choose}/><div className="admin-inline-actions"><button type="button" className="button button-outline" onClick={() => input.current?.click()} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17}/> Optimising…</> : <><ImagePlus size={17}/> {url ? 'Replace image' : 'Choose image'}</>}</button>{url && <button type="button" className="admin-text-button" onClick={() => {setUrl(''); setStats(null);}}><X size={16}/>Remove</button>}</div>{stats && <p className="compression-result">Original {size(stats.original)} → stored {size(stats.stored)} · {stats.width} × {stats.height}px ({Math.max(0, Math.round((1 - stats.stored / stats.original) * 100))}% smaller)</p>}{error && <p className="admin-error" role="alert">{error}</p>}<p className="field-help">Images are resized in your browser, then validated, rotated and compressed again on the server before storage.</p></div></div>;
}
