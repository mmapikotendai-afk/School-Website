import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Download, FileText, Phone } from 'lucide-react';
import { getPolicyCategory } from '@/lib/policies';
import { school } from '@/lib/content';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-ZW', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function PolicyDetail({ policy, related }) {
  const category = getPolicyCategory(policy.category);
  return <>
    <section className="policy-detail-intro section"><div className="container policy-detail-grid">
      <div><span className="eyebrow">{category?.title}</span><h2>{policy.description}</h2></div>
      <dl className="policy-meta"><div><dt><CalendarDays size={17} aria-hidden="true" /> Published</dt><dd><time dateTime={policy.publishedAt}>{formatDate(policy.publishedAt)}</time></dd></div><div><dt><CalendarDays size={17} aria-hidden="true" /> Last updated</dt><dd><time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time></dd></div></dl>
    </div></section>
    <section className="policy-document section section-paper" aria-labelledby="policy-document-title"><div className="container">
      <div className="policy-document-head"><div><span className="eyebrow">Official document</span><h2 id="policy-document-title">Read the policy</h2></div><div className="policy-actions"><a href={policy.pdfUrl} target="_blank" rel="noreferrer" className="button button-primary">View Policy <ArrowUpRight size={17} aria-hidden="true" /></a><a href={policy.pdfUrl} download={policy.fileName || true} className="button button-outline">Download PDF <Download size={17} aria-hidden="true" /></a></div></div>
      <div className="policy-pdf"><object data={`${policy.pdfUrl}#view=FitH`} type="application/pdf" aria-label={`${policy.title} PDF document`}><div className="policy-pdf-fallback"><FileText size={42} aria-hidden="true" /><p>Your browser cannot display this PDF here.</p><a href={policy.pdfUrl} target="_blank" rel="noreferrer" className="text-link">Open the policy in a new tab <ArrowUpRight size={16} aria-hidden="true" /></a></div></object></div>
    </div></section>
    <section className="section"><div className="container policy-aftercare">
      <div><span className="eyebrow">Related guidance</span><h2>Related policies</h2>{related.length ? <div className="related-policies">{related.map(item => <Link href={`/about/policies/${item.slug}/`} key={item.id}>{item.title}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div> : <p className="policy-muted">No other published policies are currently available in this category.</p>}</div>
      <aside className="policy-enquiries"><Phone aria-hidden="true" /><h2>Policy enquiries</h2><p>For clarification about this document, contact the school office and identify the policy by name.</p>{school.telephones.map(item => <p key={item.label}><span>{item.label}</span><a href={`tel:+${item.number.replace(/\D/g, '')}`}>{item.number}</a></p>)}<Link href="/contact/?topic=General" className="text-link">Contact page <ArrowUpRight size={16} aria-hidden="true" /></Link></aside>
    </div></section>
  </>;
}
