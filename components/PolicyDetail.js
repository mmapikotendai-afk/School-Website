import Link from 'next/link';
import { AlertCircle, ArrowUpRight, CalendarDays, Download, FileText, Phone } from 'lucide-react';
import { getPolicyCategory } from '@/lib/policies';
import { school } from '@/lib/content';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-ZW', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function PolicyDetail({ policy, related }) {
  const category = getPolicyCategory(policy.category);
  const draft = policy.status === 'draft';
  return <>
    <section className="policy-detail-intro section"><div className="container policy-detail-grid">
      <div><span className="eyebrow">{category?.title}</span><h2>{policy.description}</h2>{draft && <div className="policy-draft-notice"><AlertCircle size={20} aria-hidden="true" /><p><strong>Draft for school review.</strong> This interim guidance has not yet been adopted as an official Presbyterian High School, Mhondoro policy and may change after review.</p></div>}</div>
      <dl className="policy-meta"><div><dt><FileText size={17} aria-hidden="true" /> Status</dt><dd>{draft ? 'Draft — awaiting school approval' : 'Published and approved'}</dd></div><div><dt><CalendarDays size={17} aria-hidden="true" /> Published</dt><dd>{policy.publishedAt ? <time dateTime={policy.publishedAt}>{formatDate(policy.publishedAt)}</time> : 'Not yet published'}</dd></div><div><dt><CalendarDays size={17} aria-hidden="true" /> Last updated</dt><dd>{policy.updatedAt ? <time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time> : 'To be confirmed'}</dd></div></dl>
    </div></section>
    <section className="policy-readable section section-paper" aria-labelledby="policy-guidance-title"><div className="container policy-reading-layout">
      <div><span className="eyebrow">{draft ? 'Interim guidance' : 'Policy contents'}</span><h2 id="policy-guidance-title">{policy.title}</h2><div className="policy-prose">{policy.sections.map(section => <section key={section.title}><h3>{section.title}</h3>{section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>}</section>)}</div></div>
      <aside className="policy-download-panel"><FileText size={32} aria-hidden="true" /><span>{draft ? 'Review copy' : 'Official document'}</span><h2>PDF version</h2><p>Open the document in your browser or download a copy for offline reference.</p><a href={policy.pdfUrl} target="_blank" rel="noreferrer" className="button button-primary">View {draft ? 'Draft' : 'Policy'} <ArrowUpRight size={17} aria-hidden="true" /></a><a href={policy.pdfUrl} download={policy.fileName || true} className="button button-outline">Download PDF <Download size={17} aria-hidden="true" /></a></aside>
    </div></section>
    <section className="policy-document section" aria-labelledby="policy-document-title"><div className="container">
      <div className="policy-document-head"><div><span className="eyebrow">Document viewer</span><h2 id="policy-document-title">Read the PDF</h2></div></div>
      <div className="policy-pdf"><object data={`${policy.pdfUrl}#view=FitH`} type="application/pdf" aria-label={`${policy.title} PDF document`}><div className="policy-pdf-fallback"><FileText size={42} aria-hidden="true" /><p>Your browser cannot display this PDF here.</p><a href={policy.pdfUrl} target="_blank" rel="noreferrer" className="text-link">Open the document in a new tab <ArrowUpRight size={16} aria-hidden="true" /></a></div></object></div>
    </div></section>
    <section className="section"><div className="container policy-aftercare">
      <div><span className="eyebrow">Related guidance</span><h2>Related policies</h2>{related.length ? <div className="related-policies">{related.map(item => <Link href={`/about/policies/${item.slug}/`} key={item.id}>{item.title}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div> : <p className="policy-muted">No other documents are currently available in this category.</p>}</div>
      <aside className="policy-enquiries"><Phone aria-hidden="true" /><h2>Policy enquiries</h2><p>For clarification or feedback about this {draft ? 'draft' : 'document'}, contact the school office and identify it by name.</p>{school.telephones.map(item => <p key={item.label}><span>{item.label}</span><a href={`tel:+${item.number.replace(/\D/g, '')}`}>{item.number}</a></p>)}<Link href="/contact/?topic=General" className="text-link">Contact page <ArrowUpRight size={16} aria-hidden="true" /></Link></aside>
    </div></section>
  </>;
}
