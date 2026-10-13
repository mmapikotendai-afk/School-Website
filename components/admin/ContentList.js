import Link from 'next/link';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import DeleteButton from './DeleteButton';
import { formatDateTime } from '@/lib/cms/config';

export default function ContentList({ type, items, staff, query, status, deleted = false, page = 1, pages = 1, count = 0 }) {
  const news = type === 'news';
  const singular = news ? 'news' : 'event';
  const pageHref = number => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status !== 'all') params.set('status', status);
    if (number > 1) params.set('page', String(number));
    const suffix = params.toString();
    return `/admin/${type}/${suffix ? `?${suffix}` : ''}`;
  };

  return <>
    <header className="admin-page-head"><div><h1>{news ? 'News' : 'Events'}</h1><p>{news ? 'Create, schedule and publish stories from the school community.' : 'Manage upcoming dates, registrations and archived events.'}</p></div><Link href={`/admin/${type}/new/`} className="button button-primary"><Plus size={17}/>New {news ? 'article' : 'event'}</Link></header>
    {deleted && <p className="admin-success" role="status">The {news ? 'article' : 'event'} was permanently deleted.</p>}
    <form className="admin-list-filters"><label><span className="sr-only">Search</span><input type="search" name="q" defaultValue={query} placeholder={`Search ${type}`}/></label><label><span className="sr-only">Status</span><select name="status" defaultValue={status}><option value="all">All statuses</option>{['draft', 'scheduled', 'published', 'cancelled', 'archived'].filter(item => news ? item !== 'cancelled' : true).map(item => <option key={item}>{item}</option>)}</select></label><button className="button button-outline">Filter</button></form>
    <section className="admin-panel admin-table-wrap">
      {items.length ? <table className="admin-table"><thead><tr><th>Title</th><th>Status</th><th>{news ? 'Category' : 'Starts'}</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><strong>{item.title}</strong><small>/{news ? 'news' : 'events'}/{item.slug}</small></td><td><span className={`status-badge status-${item.status}`}>{item.status}</span></td><td>{news ? item.category : formatDateTime(item.start_at)}</td><td>{formatDateTime(item.updated_at)}</td><td><div className="admin-row-actions"><Link className="admin-icon-button" href={`/admin/${type}/${item.id}/edit/`} aria-label={`Edit ${item.title}`}><Pencil size={17}/></Link><Link className="admin-icon-button" href={`/admin/preview/${type}/${item.id}/`} target="_blank" aria-label={`Preview ${item.title}`}><ExternalLink size={17}/></Link>{staff.role === 'admin' && <DeleteButton id={item.id} type={singular} label={item.title}/>}</div></td></tr>)}</tbody></table> : <div className="admin-empty"><h2>No {type} found.</h2><p>Create the first item or adjust the current filters.</p></div>}
    </section>
    {pages > 1 && <nav className="pagination admin-pagination" aria-label={`${news ? 'News' : 'Events'} pages`}>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <Link key={number} href={pageHref(number)} aria-current={number === page ? 'page' : undefined}>{number}</Link>)}</nav>}
    {count > 0 && <p className="admin-result-count">Showing page {page} of {pages} · {count} {count === 1 ? (news ? 'article' : 'event') : type}</p>}
  </>;
}
