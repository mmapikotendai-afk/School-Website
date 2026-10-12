'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Download, Image as ImageIcon, Mail, Search, X } from 'lucide-react';
import { programmes, gallery, galleryCategories, news, events, school } from '@/lib/content';

export function HeroReveal({ children }) {
  const reduced = useReducedMotion();
  return <motion.div initial={false} animate={reduced ? {} : { clipPath: ['inset(0 0 5% 0)', 'inset(0 0 0% 0)'] }} transition={{ duration: .8, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
}

export function ProgrammeExplorer() {
  const [active, setActive] = useState(0);
  const current = programmes[active];
  const refs = useRef([]);
  function onKey(e, i) {
    let next;
    if (e.key === 'ArrowRight') next = (i + 1) % programmes.length;
    if (e.key === 'ArrowLeft') next = (i + programmes.length - 1) % programmes.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = programmes.length - 1;
    if (next !== undefined) { e.preventDefault(); setActive(next); refs.current[next]?.focus(); }
  }
  return <div className="programme-explorer"><div className="programme-tabs" role="tablist" aria-label="Academic pathways">{programmes.map((p, i) => <button key={p.id} id={`tab-${p.id}`} role="tab" aria-selected={i === active} aria-controls={`panel-${p.id}`} tabIndex={i === active ? 0 : -1} ref={el => { refs.current[i] = el; }} onKeyDown={e => onKey(e, i)} onClick={() => setActive(i)}><span>{p.years}</span>{p.name}<ArrowUpRight size={20} /></button>)}</div><div className="programme-panel" id={`panel-${current.id}`} role="tabpanel" aria-labelledby={`tab-${current.id}`} tabIndex="0"><div><h3>{current.title}</h3><p>{current.description}</p><Link href={`/admissions/?entry=${current.id === 'advanced' ? 'Lower Sixth' : current.id === 'ordinary' ? 'Other entry' : 'Form 1'}`} className="text-link">Enquire about this pathway <ArrowRight size={17} /></Link></div><div><ul className="check-list">{current.details.map(d => <li key={d}><Check size={17} aria-hidden="true" />{d}</li>)}</ul><p className="content-note">{current.note}</p></div></div></div>;
}

export function NewsExplorer() {
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('All');
  const [tab, setTab] = useState('News');
  const approved = news.filter(n => n.approved && n.status === 'published');
  const approvedEvents = events.filter(n => n.approved && n.status === 'published');
  const filtered = approved.filter(n => (category === 'All' || n.category === category) && `${n.title} ${n.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  return <div><div className="news-top"><div className="segmented" aria-label="Content type"><button aria-pressed={tab === 'News'} onClick={() => setTab('News')}>School news</button><button aria-pressed={tab === 'Events'} onClick={() => setTab('Events')}>Events calendar</button></div><label className="search-field"><Search size={18} /><span className="sr-only">Search school news</span><input type="search" placeholder="Search school news" value={query} onChange={e => setQuery(e.target.value)} disabled={tab === 'Events'} /></label></div>{tab === 'News' ? <><div className="filter-row" aria-label="News categories">{['All', 'Academics', 'Sports', 'Events', 'Admissions', 'School Life', 'Alumni'].map(c => <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}</div><div aria-live="polite">{filtered.length ? <div className="news-grid">{filtered.map(n => <article key={n.id}><span className="meta">{n.category} · {new Date(n.date).toLocaleDateString('en-GB', {timeZone:'UTC'})}</span><h3><Link href={`/news/${n.slug}/`}>{n.title}</Link></h3><p>{n.excerpt}</p></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={28} /></span><h2>{query || category !== 'All' ? 'No stories match just yet.' : 'Our next stories start here.'}</h2><p>{query || category !== 'All' ? 'Try another search or view all categories. School-approved stories will appear as they are published.' : 'News, achievements and announcements will appear here once approved by the school.'}</p>{(query || category !== 'All') && <button className="text-link" onClick={() => {setQuery(''); setCategory('All');}}>Clear filters <X size={16} /></button>}</div>}</div></> : <div aria-live="polite">{approvedEvents.length ? <div className="event-list">{approvedEvents.map(e => <article key={e.id}><time dateTime={e.date}>{new Date(e.date).toLocaleDateString('en-GB', {timeZone:'UTC'})}</time><div><h3>{e.title}</h3><p>{e.venue}</p><p>{e.description}</p>{e.enquiryUrl && <a href={e.enquiryUrl} className="text-link">Event enquiry <ArrowUpRight size={16}/></a>}</div></article>)}</div> : <div className="empty-state"><span className="empty-icon"><CalendarDays size={28} /></span><h2>Dates to look forward to.</h2><p>Confirmed school events and term notices will be listed here. No upcoming dates have been published yet.</p><Link href="/contact/?topic=School%20events" className="text-link">Enquire about school dates <ArrowRight size={16} /></Link></div>}</div>}</div>;
}

export function GalleryExplorer({ items = gallery }) {
  const [category, setCategory] = useState('All'); const [selected, setSelected] = useState(null);
  const dialog = useRef(null); const opener = useRef(null);
  const photos = items.filter(p => p.approved && (category === 'All' || p.category === category));
  function open(index, button) { opener.current = button; setSelected(index); }
  function close() { dialog.current?.close(); setSelected(null); opener.current?.focus(); }
  useEffect(() => { if (selected !== null && !dialog.current?.open) dialog.current?.showModal(); }, [selected]);
  useEffect(() => { if (selected !== null) { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; } }, [selected]);
  const photo = selected !== null ? photos[selected] : null;
  return <><div className="filter-row" aria-label="Gallery categories">{galleryCategories.map(c => <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}</div><div aria-live="polite" className="gallery-result">{photos.length ? <div className="gallery-grid">{photos.map((p,i) => <button key={p.id} className="gallery-item" onClick={e => open(i,e.currentTarget)}><div className="gallery-image"><img src={p.src} alt={p.alt} width="447" height="447" loading="lazy" /><span className="image-open"><ArrowUpRight size={22} /></span></div><span>{p.caption}<small>{p.category}</small></span></button>)}</div> : <div className="empty-state"><span className="empty-icon"><ImageIcon size={28}/></span><h2>A window into {category.toLowerCase()}.</h2><p>School-approved photographs for this collection are still to come.</p><button className="text-link" onClick={() => setCategory('All')}>View all collections <ArrowRight size={16}/></button></div>}</div><p className="gallery-note">Real moments. Our own community. Campus and school-life photography will be added with school approval.</p><dialog ref={dialog} className="lightbox" aria-label={photo?.caption || 'Image viewer'} onCancel={e => {e.preventDefault();close();}} onClick={e => {if(e.target === e.currentTarget) close();}} onKeyDown={e => {if(photos.length > 1 && e.key === 'ArrowRight') setSelected((selected+1)%photos.length); if(photos.length > 1 && e.key === 'ArrowLeft') setSelected((selected+photos.length-1)%photos.length);}}><button className="lightbox-close" onClick={close} aria-label="Close image"><X /></button>{photo && <figure><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption}<span>{selected+1} / {photos.length}</span></figcaption></figure>}{photos.length > 1 && <div className="lightbox-controls"><button aria-label="Previous image" onClick={() => setSelected((selected+photos.length-1)%photos.length)}><ChevronLeft /></button><button aria-label="Next image" onClick={() => setSelected((selected+1)%photos.length)}><ChevronRight /></button></div>}</dialog></>;
}

export function EnquiryForm({ admissions = false }) {
  const [topic, setTopic] = useState(admissions ? 'Form 1 admissions' : 'General enquiry');
  const [message, setMessage] = useState(''); const [feedback, setFeedback] = useState('');
  const form = useRef(null);
  useEffect(() => { const params = new URLSearchParams(window.location.search); const requested = params.get('topic') || (params.get('entry') ? `${params.get('entry')} admissions` : null); if(requested) setTopic(requested); },[]);
  const topics = ['General enquiry', 'Form 1 admissions', 'Lower Sixth admissions', 'Other entry admissions', 'Boarding', 'School events', 'Alumni', 'Academic subjects'];
  function draft(e) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    const body = `Presbyterian High School enquiry\n\nName: ${String(data.get('name')).trim()}\nEmail: ${String(data.get('email')).trim()}\nTopic: ${topic}\n\n${message.trim()}\n`;
    if(school.email) {window.location.href = `mailto:${school.email}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`; setFeedback('Your email app has been opened with your enquiry. Please review it and send it from there.');}
    else { const url = URL.createObjectURL(new Blob([body], {type:'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href=url; a.download='presbyterian-high-school-enquiry.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); setFeedback('Your enquiry draft has been downloaded. It has not been sent to the school.'); }
  }
  return <form ref={form} className="enquiry-form" onSubmit={draft}><h2>{admissions ? 'Take the first step.' : 'How can we help?'}</h2><p>{school.email ? 'Prepare your enquiry and send it using your email app.' : 'The school’s official enquiry address is being confirmed. You can prepare and download your enquiry in the meantime.'}</p><div className="form-grid"><label>Your name<input name="name" autoComplete="name" required maxLength={120} placeholder="Full name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label></div><label>What would you like to ask about?<select name="topic" value={topic} onChange={e => setTopic(e.target.value)}>{!topics.includes(topic) && <option>{topic}</option>}{topics.map(t => <option key={t}>{t}</option>)}</select></label><label>Your enquiry<textarea name="message" rows="5" required minLength={10} maxLength={3000} placeholder="Tell us how we can help…" value={message} onChange={e => setMessage(e.target.value)} /></label><div className="form-help"><span>Please leave out results, ID numbers and sensitive student information.</span><span>{message.length}/3000</span></div><label className="consent"><input type="checkbox" required /> <span>I understand this prepares an enquiry {school.email ? 'in my email app' : 'on my device'} and does not submit an application. <Link href="/privacy/">Privacy notice</Link></span></label><button className="button button-primary" type="submit">{school.email ? <>Open email enquiry <Mail size={17}/></> : <>Download enquiry draft <Download size={17}/></>}</button><p className="form-status" role="status">{feedback}</p></form>;
}
