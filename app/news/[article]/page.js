import Link from 'next/link';
import { notFound } from 'next/navigation';
import { news } from '@/lib/content';
const published = news.filter(n => n.status === 'published' && n.approved);
export const dynamicParams = false;
export function generateStaticParams() {return published.length ? published.map(n=>({article:n.slug})) : [{article:'no-published-stories'}];}
export async function generateMetadata({params}) {const {article}=await params;const item=published.find(n=>n.slug===article);return {title:item?.title || 'Story not found',description:item?.excerpt};}
export default async function NewsArticle({params}) {
  const {article}=await params;const item=published.find(n=>n.slug===article);if(!item) notFound();
  return <article><section className="page-hero"><div className="container"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/news/">News & Events</Link></nav><h1>{item.title}</h1><p>{item.excerpt}</p><p className="meta">{item.category} · <time dateTime={item.date}>{new Date(item.date).toLocaleDateString('en-GB',{timeZone:'UTC'})}</time> · {item.author}</p></div></section><section className="section"><div className="container privacy-prose prose">{item.image && <img src={item.image.src} alt={item.image.alt} width="1000" height="600"/>}{item.body.map((paragraph,i)=><p key={i}>{paragraph}</p>)}<Link className="text-link" href="/news/">Back to news & events</Link></div></section></article>;
}
