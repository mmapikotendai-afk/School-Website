import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPublishedNews, getRelatedNews } from '@/lib/cms/queries';
import { RichText } from '@/lib/cms/rich-text';
import { formatDate } from '@/lib/cms/config';

export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { article } = await params; const item = await getPublishedNews(article);
  return item ? { title: item.title, description: item.summary, openGraph: { title: item.title, description: item.summary, images: item.featured_image_url ? [{ url: item.featured_image_url, alt: item.featured_image_alt || '' }] : [] } } : { title: 'Story not found', robots: { index: false } };
}
export default async function NewsArticle({ params }) {
  const { article } = await params; const item = await getPublishedNews(article); if (!item) notFound(); const related = await getRelatedNews(item);
  return <article><header className="public-detail-head"><div className="container"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/news/">News</Link></nav><span className="meta">{item.category}</span><h1>{item.title}</h1><p>{item.summary}</p><span className="meta"><time dateTime={item.publish_at}>{formatDate(item.publish_at)}</time> · {item.author_name}</span></div></header>{item.featured_image_url && <div className="container public-cover"><img src={item.featured_image_url} alt={item.featured_image_alt || ''}/></div>}<section className="section article-body"><div className="container article-layout"><div className="article-prose"><RichText value={item.content}/><Link className="text-link article-back" href="/news/"><ArrowLeft size={17}/>Back to all news</Link></div>{related.length > 0 && <aside className="related-content"><h2>Related news</h2>{related.map(story => <Link href={`/news/${story.slug}/`} key={story.id}><span>{story.category}</span><strong>{story.title}</strong><small>{formatDate(story.publish_at)}</small></Link>)}</aside>}</div></section></article>;
}
