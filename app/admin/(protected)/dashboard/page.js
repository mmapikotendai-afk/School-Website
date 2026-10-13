import Link from 'next/link';
import { ArrowRight, CalendarDays, Image, Newspaper } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/cms/auth';
import { formatDateTime } from '@/lib/cms/config';
import { timedCms } from '@/lib/cms/perf';

export const metadata = { title: 'Dashboard' };

async function loadDashboard(supabase) {
  if (process.env.CMS_DASHBOARD_RPC === 'true') {
    const { data, error } = await timedCms('dashboard.summary', () => supabase.rpc('cms_dashboard_summary'));
    if (!error && data) return data;
    console.error('Dashboard summary RPC unavailable; using parallel fallback:', error?.message);
  }

  const [news, events, media, activity] = await Promise.all([
    timedCms('dashboard.news-count', () => supabase.from('news_articles').select('id', { count: 'exact', head: true })),
    timedCms('dashboard.event-count', () => supabase.from('events').select('id', { count: 'exact', head: true })),
    timedCms('dashboard.media-count', () => supabase.from('media_assets').select('id', { count: 'exact', head: true })),
    timedCms('dashboard.activity', () => supabase.from('audit_logs').select('id,action,entity_type,details,created_at').order('created_at', { ascending: false }).limit(8)),
  ]);
  return { news_count: news.count || 0, event_count: events.count || 0, media_count: media.count || 0, activity: activity.data || [] };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [staff, dashboard] = await Promise.all([requireStaff(), loadDashboard(supabase)]);
  const activity = dashboard.activity || [];
  const cards = [[dashboard.news_count || 0, 'News articles', Newspaper, '/admin/news/'], [dashboard.event_count || 0, 'Events', CalendarDays, '/admin/events/'], [dashboard.media_count || 0, 'Media items', Image, '/admin/media/']];
  return <><header className="admin-page-head"><div><h1>Good to see you, {staff.display_name?.split(' ')[0] || 'editor'}.</h1><p>Manage the stories and dates shown on the school website.</p></div><Link href="/admin/news/new/" className="button button-primary">Create news <ArrowRight size={17}/></Link></header><section className="admin-stats">{cards.map(([count,label,Icon,href]) => <Link href={href} key={label}><Icon size={22}/><strong>{count}</strong><span>{label}</span><ArrowRight size={17}/></Link>)}</section><section className="admin-panel admin-activity"><div className="admin-panel-head"><h2>Recent activity</h2>{staff.role !== 'admin' && <span>Visible to administrators</span>}</div>{activity.length ? <ul>{activity.map(item => <li key={item.id}><span><strong>{item.action}</strong> {item.details?.title || item.entity_type.replace('_', ' ')}</span><time dateTime={item.created_at}>{formatDateTime(item.created_at)}</time></li>)}</ul> : <div className="admin-empty"><p>{staff.role === 'admin' ? 'Changes will appear here as the team works.' : 'Your role can create and edit content. Administrators retain the full audit history.'}</p></div>}</section></>;
}
