import { pageInfo } from '@/lib/content';
import { publicPolicies } from '@/lib/policies';
import { siteOrigin } from '@/lib/site-config';
import { listPublishedEvents, listPublishedNews } from '@/lib/cms/queries';

export const revalidate = 60;
export default async function sitemap() {
  const [first, events] = await Promise.all([listPublishedNews({ page: 1, pageSize: 1000 }), listPublishedEvents()]);
  const news = [...first.items];
  for (let page=2; news.length < first.count; page++) { const batch=await listPublishedNews({page,pageSize:1000}); if(!batch.items.length) break; news.push(...batch.items); }
  const slugs = ['', 'privacy-policy', 'terms', ...Object.keys(pageInfo).filter(slug => !['portal', 'news', 'privacy'].includes(slug)), 'news', 'events', 'about/policies', ...publicPolicies.map(policy => `about/policies/${policy.slug}`), ...news.map(item => `news/${item.slug}`), ...events.map(item => `events/${item.slug}`)];
  return [...new Set(slugs)].map(slug => { const item = [...news, ...events].find(item => slug === `news/${item.slug}` || slug === `events/${item.slug}`); return { url: `${siteOrigin}/${slug ? `${slug}/` : ''}`, ...(item?.updated_at ? {lastModified:item.updated_at} : {}) }; });
}
