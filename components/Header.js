'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { navigation } from '@/lib/content';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); } }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return <>
    <div className="utility"><div className="container utility-inner"><span>Mhondoro, Zimbabwe</span><div><Link href="/gallery/">Gallery</Link><Link href="/alumni/">Alumni</Link><Link href="/contact/">Contact</Link><Link href="/portal/" className="utility-portal">Student / Staff Portal <ArrowUpRight size={13} aria-hidden="true" /></Link></div></div></div>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" aria-label="Presbyterian High School home"><img src="/images/school-crest.jpeg" width="57" height="57" alt="" /><span>Presbyterian<span>High School</span></span></Link>
      <button id="menu-toggle" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="main-navigation" aria-label="Main navigation" className={open ? 'main-nav is-open' : 'main-nav'}>{navigation.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href || pathname === href.slice(0,-1) ? 'page' : undefined}>{label}</Link>)}<Link href="/contact/" className="header-contact">Get in touch <ArrowUpRight size={16} /></Link><div className="mobile-secondary"><Link href="/gallery/">Gallery</Link><Link href="/alumni/">Alumni</Link><Link href="/portal/">Student / Staff Portal <ArrowUpRight size={15} /></Link></div></nav>
    </div></header>
  </>;
}
