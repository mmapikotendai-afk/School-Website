import { pageInfo, news } from '@/lib/content';
import { siteOrigin } from '@/lib/site-config';
export const dynamic = 'force-static';
export default function sitemap() {
  return ['',...Object.keys(pageInfo).filter(s=>s!=='portal'),...news.filter(n=>n.approved&&n.status==='published').map(n=>`news/${n.slug}`)].map(slug=>({url:`${siteOrigin}/${slug ? slug+'/' : ''}`}));
}
