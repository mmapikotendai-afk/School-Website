import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { RichText } from '@/lib/cms/rich-text';
import { formatDateTime } from '@/lib/cms/config';

export default function PreviewContent({ type, record }) {
  const news = type === 'news'; const image = record[news ? 'featured_image_url' : 'cover_image_url']; const alt = record[news ? 'featured_image_alt' : 'cover_image_alt'];
  return <div className="secure-preview"><div className="preview-banner"><span>Secure preview · {record.status}</span><Link href={`/admin/${news ? 'news' : 'events'}/${record.id}/edit`}><ArrowLeft size={16}/>Return to editor</Link></div><article><header className="public-detail-head"><div className="container"><span className="meta">{news ? record.category : record.event_status}</span><h1>{record.title}</h1><p>{record.summary}</p>{news ? <span className="meta">{record.author_name} · {record.publish_at ? formatDateTime(record.publish_at) : 'Unpublished'}</span> : <div className="event-facts"><span><CalendarDays size={18}/>{formatDateTime(record.start_at)}</span><span><MapPin size={18}/>{record.venue}</span></div>}</div></header>{image && <div className="container public-cover"><img src={image} alt={alt || ''}/></div>}<div className="container article-prose"><RichText value={record[news ? 'content' : 'description']}/></div></article></div>;
}
