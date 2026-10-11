import { pageInfo, news } from '@/lib/content';
import { publicPolicies } from '@/lib/policies';
import { siteOrigin } from '@/lib/site-config';
export const dynamic = 'force-static';
export default function sitemap() {
  return ['',...Object.keys(pageInfo).filter(s=>s!=='portal'),'about/policies',...publicPolicies.map(policy=>`about/policies/${policy.slug}`),...news.filter(n=>n.approved&&n.status==='published').map(n=>`news/${n.slug}`)].map(slug=>({url:`${siteOrigin}/${slug ? slug+'/' : ''}`}));
}
