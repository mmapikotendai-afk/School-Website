import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { getPublishedEvent } from '@/lib/cms/queries';
import { RichText } from '@/lib/cms/rich-text';
import { formatDateTime } from '@/lib/cms/config';

export const revalidate = 60;
export async function generateMetadata({ params }) { const { slug } = await params; const item = await getPublishedEvent(slug); return item ? { title: item.title, description: item.summary, openGraph: { title: item.title, description: item.summary, images: item.cover_image_url ? [{ url: item.cover_image_url, alt: item.cover_image_alt || '' }] : [] } } : { title: 'Event not found', robots: { index: false } }; }
export default async function EventDetailPage({ params }) {
  const { slug } = await params; const item = await getPublishedEvent(slug); if (!item) notFound();
  return <article><header className="public-detail-head event-detail-head"><div className="container"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/events/">Events</Link></nav><span className="meta">{item.event_status}</span><h1>{item.title}</h1><p>{item.summary}</p><div className="event-facts"><span><CalendarDays size={19}/><span><strong>{formatDateTime(item.start_at)}</strong>{item.end_at && <> to {formatDateTime(item.end_at)}</>}</span></span><span><MapPin size={19}/>{item.venue}</span></div></div></header>{item.cover_image_url && <div className="container public-cover"><img src={item.cover_image_url} alt={item.cover_image_alt || ''}/></div>}<section className="section article-body"><div className="container event-detail-layout"><div className="article-prose"><RichText value={item.description}/><Link className="text-link article-back" href="/events/"><ArrowLeft size={17}/>Back to all events</Link></div>{item.registration_url && item.event_status !== 'cancelled' && <aside className="event-registration"><h2>Registration</h2><p>Use the organiser’s registration page for attendance details.</p><a href={item.registration_url} target="_blank" rel="noopener noreferrer" className="button button-primary">Register for this event <ArrowUpRight size={17}/></a></aside>}</div></section></article>;
}
