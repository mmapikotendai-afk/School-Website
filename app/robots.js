import { isPublicLaunch, siteOrigin } from '@/lib/site-config';
export default function robots() {return isPublicLaunch ? {rules:{userAgent:'*',allow:'/',disallow:'/portal/'},sitemap:`${siteOrigin}/sitemap.xml`} : {rules:{userAgent:'*',disallow:'/'}};}
export const dynamic = 'force-static';
