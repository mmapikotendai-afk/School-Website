'use client';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
export default function MobileCTA(){const path=usePathname();return path==='/'?<div className="mobile-cta"><Link className="button button-primary" href="/admissions/">Explore admissions</Link></div>:null;}
