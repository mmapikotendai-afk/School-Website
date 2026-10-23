import { pageMetadata } from '@/lib/seo';
import { school } from '@/lib/content';
import AppChrome from '@/components/AppChrome';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { isPublicLaunch, siteOrigin } from '@/lib/site-config';

export const metadata = {
  ...pageMetadata('Presbyterian High School | Mhondoro, Zimbabwe', 'Discover the learning, character and community of Presbyterian High School in Mhondoro, Zimbabwe.', '/'),
  metadataBase: new URL(siteOrigin),
  title: { default: 'Presbyterian High School | Mhondoro, Zimbabwe', template: '%s | Presbyterian High School' },
  description: 'Discover the learning, character and community of Presbyterian High School in Mhondoro, Zimbabwe.',
  robots: { index: isPublicLaunch, follow: isPublicLaunch },
  icons: { icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }], apple: '/apple-icon.png' },
};
export default function RootLayout({children}) {
  return <html lang="en"><head>
    <link rel="preload" href="/fonts/playfair.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    <link rel="preload" href="/fonts/source-sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    <link rel="preload" href="/fonts/source-sans-semibold.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
  </head><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({'@context':'https://schema.org','@type':'School',name:school.name,url:siteOrigin,logo:new URL('/icon.png',siteOrigin).href,address:{'@type':'PostalAddress',streetAddress:school.physicalAddress,addressCountry:'ZW'},telephone:school.telephones.map(t=>t.number),geo:{'@type':'GeoCoordinates',latitude:school.coordinates[0],longitude:school.coordinates[1]}}).replace(/</g,'\u003c')}}/><AppChrome>{children}</AppChrome></body></html>;
}
