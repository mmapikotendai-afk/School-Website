'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Image, LayoutDashboard, LogOut, Newspaper } from 'lucide-react';
import { logoutAction } from '@/lib/cms/actions';

const links = [
  ['/admin/dashboard/', 'Dashboard', LayoutDashboard],
  ['/admin/news/', 'News', Newspaper],
  ['/admin/events/', 'Events', CalendarDays],
  ['/admin/media/', 'Media', Image],
];
export default function AdminNav({ staff }) {
  const pathname = `${usePathname().replace(/\/+$/, '')}/`;
  return <aside className="admin-sidebar"><div className="admin-brand"><img src="/images/school-crest.jpeg" alt="" width="44" height="44"/><span>Presbyterian High School<small>Website CMS</small></span></div><nav aria-label="Administration">{links.map(([href,label,Icon]) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined}><Icon size={19}/>{label}</Link>)}</nav><div className="admin-account"><span>{staff.display_name || staff.email}<small>{staff.role}</small></span><form action={logoutAction}><button type="submit"><LogOut size={17}/>Sign out</button></form></div></aside>;
}
