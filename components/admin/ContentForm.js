'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Eye, Save } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import ImageUploader from './ImageUploader';
import { EVENT_STATUSES, NEWS_CATEGORIES, NEWS_STATUSES, toLocalInputValue } from '@/lib/cms/config';
import { saveEventAction, saveNewsAction } from '@/lib/cms/actions';

export default function ContentForm({ type, record }) {
  const news = type === 'news';
  const statuses = news ? NEWS_STATUSES : EVENT_STATUSES;
  const [status, setStatus] = useState(record?.status || 'draft');
  const action = news ? saveNewsAction : saveEventAction;
  const [formState, formAction, pending] = useActionState(action, { error: '' });
  const listPath = news ? '/admin/news' : '/admin/events';
  const publishLabel = status === 'scheduled' ? 'Publication date and time' : 'Published at';
  return <form action={formAction} className="content-form">
    {record?.id && <input type="hidden" name="id" value={record.id}/>}<div className="content-form-main">
      <section className="admin-panel"><label>Title<input name="title" required maxLength="180" defaultValue={record?.title || ''} placeholder={news ? 'Article headline' : 'Event name'}/></label><label>Summary<textarea name="summary" required maxLength="400" rows="3" defaultValue={record?.summary || ''} placeholder="A concise introduction shown on listing cards."/></label>{news && <label>Category<input name="category" list="news-categories" required maxLength="80" defaultValue={record?.category || ''}/><datalist id="news-categories">{NEWS_CATEGORIES.map(item => <option key={item} value={item}/>)}</datalist></label>}{news && <label>Author<input name="author_name" maxLength="120" defaultValue={record?.author_name || ''} placeholder="Defaults to the signed-in editor"/></label>}
      {!news && <div className="admin-form-grid"><label>Starts<input type="datetime-local" name="start_at" required defaultValue={toLocalInputValue(record?.start_at)}/></label><label>Ends (optional)<input type="datetime-local" name="end_at" defaultValue={toLocalInputValue(record?.end_at)}/></label></div>}{!news && <label>Venue<input name="venue" required maxLength="220" defaultValue={record?.venue || ''}/></label>}{!news && <div className="admin-form-grid"><label>Event state<select name="event_status" defaultValue={record?.event_status || 'scheduled'}><option value="scheduled">Scheduled</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label>Registration link (optional)<input type="url" name="registration_url" defaultValue={record?.registration_url || ''} placeholder="https://…"/></label></div>}
      </section>
      <section className="admin-panel"><RichTextEditor name={news ? 'content' : 'description'} label={news ? 'Article content' : 'Event description'} value={record?.[news ? 'content' : 'description']}/></section>{formState?.error && <p className="admin-error" role="alert">{formState.error}</p>}
      <section className="admin-panel"><h2>{news ? 'Featured image' : 'Event poster or cover'}</h2><ImageUploader urlName={news ? 'featured_image_url' : 'cover_image_url'} altName={news ? 'featured_image_alt' : 'cover_image_alt'} initialUrl={record?.[news ? 'featured_image_url' : 'cover_image_url'] || ''} initialAlt={record?.[news ? 'featured_image_alt' : 'cover_image_alt'] || ''}/></section>
    </div>
    <aside className="content-form-side"><section className="admin-panel publication-panel"><h2>Publication</h2><label>Status<select name="status" value={status} onChange={event => setStatus(event.target.value)}>{statuses.map(item => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>{['published','scheduled'].includes(status) && <label>{publishLabel}<input type="datetime-local" name="publish_at" defaultValue={toLocalInputValue(record?.publish_at || (status === 'published' ? new Date().toISOString() : ''))} required={status === 'scheduled'}/><span className="field-help">Times use the school website timezone.</span></label>}<button className="button button-primary" type="submit" disabled={pending}><Save size={17}/>{pending ? 'Saving…' : record ? 'Save changes' : 'Create content'}</button>{record && <Link className="button button-outline" href={`/admin/preview/${news ? 'news' : 'events'}/${record.id}`} target="_blank"><Eye size={17}/>Secure preview</Link>}<Link className="admin-cancel" href={listPath}>Cancel</Link></section>{status === 'scheduled' && <div className="admin-note"><CalendarClock size={19}/><p>This item stays private until the scheduled publication time.</p></div>}</aside>
  </form>;
}
