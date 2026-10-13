import Link from 'next/link';
import { ImagePlus } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireStaff } from '@/lib/cms/auth';
import { listMedia } from '@/lib/cms/queries';
import { formatDate } from '@/lib/cms/config';

export const metadata = { title: 'Media library' };

function fileSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Math.max(1, Number(params?.page) || 1);
  const [staff, result] = await Promise.all([requireStaff(), listMedia({ page: requestedPage })]);
  const { items, page, pages, count } = result;

  return <>
    <header className="admin-page-head"><div><h1>Media library</h1><p>Every image here has passed server validation and automatic optimisation.</p></div></header>
    <section className="admin-panel media-upload-panel"><div><ImagePlus size={25}/><h2>Prepare gallery images</h2><p>Select several photographs, review their compressed previews and savings, then upload only the approved WebP versions.</p></div><ImageUploader urlName="unused_url" altName="unused_alt" multiple/></section>
    {items.length ? <section className="media-library">{items.map(item => <article key={item.id}><img src={item.public_url} alt={item.alt_text || ''} loading="lazy"/><div><strong>{item.original_name}</strong><span>{item.width} × {item.height}px · {fileSize(item.optimized_bytes)}</span><span>{formatDate(item.created_at)}</span></div>{staff.role === 'admin' && <DeleteButton id={item.id} type="media" label={item.original_name}/>}</article>)}</section> : <div className="admin-panel admin-empty"><h2>No media yet.</h2><p>Optimised uploads will appear here for reuse.</p></div>}
    {pages > 1 && <nav className="pagination admin-pagination" aria-label="Media pages">{Array.from({ length: pages }, (_, index) => index + 1).map(number => <Link key={number} href={number > 1 ? `/admin/media/?page=${number}` : '/admin/media/'} aria-current={number === page ? 'page' : undefined}>{number}</Link>)}</nav>}
    {count > 0 && <p className="admin-result-count">Showing page {page} of {pages} · {count} media {count === 1 ? 'item' : 'items'}</p>}
  </>;
}
