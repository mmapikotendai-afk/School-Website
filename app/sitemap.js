import { pageInfo } from '@/lib/content';
import { publicPolicies } from '@/lib/policies';
import { siteOrigin } from '@/lib/site-config';
import { listPublishedEvents, listPublishedNews } from '@/lib/cms/queries';

export const revalidate = 60;
export default async function sitemap() {
  const [{ items: news }, events] = await Promise.all([listPublishedNews({ page: 1, pageSize: 1000 }), listPublishedEvents()]);
  const slugs = ['', ...Object.keys(pageInfo).filter(slug => !['portal', 'news'].includes(slug)), 'news', 'events', 'about/policies', ...publicPolicies.map(policy => `about/policies/${policy.slug}`), ...news.map(item => `news/${item.slug}`), ...events.map(item => `events/${item.slug}`)];
  return slugs.map(slug => ({ url: `${siteOrigin}/${slug ? `${slug}/` : ''}` }));
}
