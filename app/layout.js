import AppChrome from '@/components/AppChrome';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { isPublicLaunch, siteOrigin } from '@/lib/site-config';

export const metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: 'Presbyterian High School | Mhondoro, Zimbabwe', template: '%s | Presbyterian High School' },
  description: 'Discover the learning, character and community of Presbyterian High School in Mhondoro, Zimbabwe.',
  robots: { index: isPublicLaunch, follow: isPublicLaunch },
  icons: { icon: '/images/school-crest.jpeg' },
};
export default function RootLayout({children}) {
  return <html lang="en"><body><AppChrome>{children}</AppChrome></body></html>;
}
