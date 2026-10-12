'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const admin = pathname.startsWith('/admin');
  if (admin) return <main id="main-content" className="admin-main">{children}</main>;
  return <><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content">{children}</main><Footer/></>;
}
