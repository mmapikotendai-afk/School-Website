import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content">{children}</main><Footer/></body></html>;
}
