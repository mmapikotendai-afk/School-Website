import { isPublicLaunch, siteOrigin } from '@/lib/site-config';
export const dynamic = 'force-static';
export default function robots() { return { rules: isPublicLaunch ? {userAgent:'*',allow:'/',disallow:['/admin/','/api/','/portal/','/thank-you/']} : {userAgent:'*',disallow:'/'}, sitemap: new URL('/sitemap.xml',siteOrigin).href }; }
