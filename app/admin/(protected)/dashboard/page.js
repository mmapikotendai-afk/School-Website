import Link from 'next/link';
import { ArrowRight, CalendarDays, Image, Newspaper } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/cms/auth';
import { formatDateTime } from '@/lib/cms/config';

export const metadata = { title: 'Dashboard' };
export default async function DashboardPage() {
  const staff = await requireStaff(); const supabase = await createClient();
  const [news, events, media, activity] = await Promise.all([
    supabase.from('news_articles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('media_assets').select('*', { count: 'exact', head: true }),
    staff.role === 'admin' ? supabase.from('audit_logs').select('id,action,entity_type,details,created_at').order('created_at', { ascending: false }).limit(8) : Promise.resolve({ data: [] }),
  ]);
  const cards = [[news.count || 0, 'News articles', Newspaper, '/admin/news'], [events.count || 0, 'Events', CalendarDays, '/admin/events'], [media.count || 0, 'Media items', Image, '/admin/media']];
  return <><header className="admin-page-head"><div><h1>Good to see you, {staff.display_name?.split(' ')[0] || 'editor'}.</h1><p>Manage the stories and dates shown on the school website.</p></div><Link href="/admin/news/new" className="button button-primary">Create news <ArrowRight size={17}/></Link></header><section className="admin-stats">{cards.map(([count,label,Icon,href]) => <Link href={href} key={label}><Icon size={22}/><strong>{count}</strong><span>{label}</span><ArrowRight size={17}/></Link>)}</section><section className="admin-panel admin-activity"><div className="admin-panel-head"><h2>Recent activity</h2>{staff.role !== 'admin' && <span>Visible to administrators</span>}</div>{activity.data?.length ? <ul>{activity.data.map(item => <li key={item.id}><span><strong>{item.action}</strong> {item.details?.title || item.entity_type.replace('_', ' ')}</span><time dateTime={item.created_at}>{formatDateTime(item.created_at)}</time></li>)}</ul> : <div className="admin-empty"><p>{staff.role === 'admin' ? 'Changes will appear here as the team works.' : 'Your role can create and edit content. Administrators retain the full audit history.'}</p></div>}</section></>;
}
