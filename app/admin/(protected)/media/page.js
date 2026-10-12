import { ImagePlus } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireStaff } from '@/lib/cms/auth';
import { listMedia } from '@/lib/cms/queries';
import { formatDate } from '@/lib/cms/config';

export const metadata = { title: 'Media library' };
function fileSize(bytes) { return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
export default async function MediaPage() {
  const staff = await requireStaff(); const items = await listMedia();
  return <><header className="admin-page-head"><div><h1>Media library</h1><p>Every image here has passed server validation and automatic optimisation.</p></div></header><section className="admin-panel media-upload-panel"><div><ImagePlus size={25}/><h2>Upload an image</h2><p>Use this uploader for standalone media. Article and event forms include the same optimisation pipeline.</p></div><ImageUploader urlName="unused_url" altName="unused_alt"/></section>{items.length ? <section className="media-library">{items.map(item => <article key={item.id}><img src={item.public_url} alt={item.alt_text || ''}/><div><strong>{item.original_name}</strong><span>{item.width} × {item.height}px · {fileSize(item.optimized_bytes)}</span><span>{formatDate(item.created_at)}</span></div>{staff.role === 'admin' && <DeleteButton id={item.id} type="media" label={item.original_name}/>}</article>)}</section> : <div className="admin-panel admin-empty"><h2>No media yet.</h2><p>Optimised uploads will appear here for reuse.</p></div>}</>;
}
