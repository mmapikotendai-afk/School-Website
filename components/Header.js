'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { navigation } from '@/lib/content';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef(null);
  const aboutButtonRef = useRef(null);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); setAboutOpen(false); }, [pathname]);
  useEffect(() => {
    function onKey(event) {
      if (event.key !== 'Escape') return;
      if (aboutOpen) { setAboutOpen(false); aboutButtonRef.current?.focus(); }
      else if (open) { setOpen(false); document.getElementById('menu-toggle')?.focus(); }
    }
    function onPointer(event) { if (aboutOpen && !aboutRef.current?.contains(event.target)) setAboutOpen(false); }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [aboutOpen, open]);
  const remainingNavigation = navigation.filter(([, href]) => href !== '/about/');
  const aboutCurrent = pathname === '/about' || pathname.startsWith('/about/');
  return <>
    <div className="utility"><div className="container utility-inner"><span>Mhondoro, Zimbabwe</span><div><Link href="/gallery/">Gallery</Link><Link href="/alumni/">Alumni</Link><Link href="/contact/">Contact</Link><Link href="/portal/" className="utility-portal">Student / Staff Portal <ArrowUpRight size={13} aria-hidden="true" /></Link><Link href="/admin/login/" className="utility-admin">Website administration</Link></div></div></div>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" aria-label="Presbyterian High School home"><img src="/images/school-crest.jpeg" width="57" height="57" alt="" /><span>Presbyterian<span>High School</span></span></Link>
      <button id="menu-toggle" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="main-navigation" aria-label="Main navigation" className={open ? 'main-nav is-open' : 'main-nav'}>
        <div className={`nav-group ${aboutOpen ? 'is-open' : ''}`} ref={aboutRef}>
          <div className="nav-group-trigger"><Link href="/about/" aria-current={aboutCurrent ? 'page' : undefined}>About</Link><button ref={aboutButtonRef} type="button" aria-label="Open About menu" aria-expanded={aboutOpen} aria-controls="about-submenu" onClick={() => setAboutOpen(value => !value)}><ChevronDown size={15} aria-hidden="true" /></button></div>
          <div className="nav-dropdown" id="about-submenu"><Link href="/about/">About our school</Link><Link href="/about/policies/">School Policies</Link></div>
        </div>
        {remainingNavigation.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href || pathname === href.slice(0,-1) || pathname.startsWith(href) ? 'page' : undefined}>{label}</Link>)}
        <Link href="/contact/" className="header-contact">Get in touch <ArrowUpRight size={16} aria-hidden="true" /></Link><div className="mobile-secondary"><Link href="/gallery/">Gallery</Link><Link href="/alumni/">Alumni</Link><Link href="/portal/">Student / Staff Portal <ArrowUpRight size={15} aria-hidden="true" /></Link><Link href="/admin/login/">Website administration</Link></div>
      </nav>
    </div></header>
  </>;
}
