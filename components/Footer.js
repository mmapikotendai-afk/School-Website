import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function AdmissionCTA() {
  return <section className="admission-cta"><div className="container cta-inner"><div><h2>A new chapter.<br /><em>A place to begin.</em></h2><p>Explore your next step at Presbyterian High School.</p></div><Link href="/admissions/" className="button button-light">Explore admissions <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>;
}

export default function Footer() {
  return <footer className="footer"><div className="container"><div className="footer-top"><div className="footer-identity"><Link href="/" className="footer-brand">Presbyterian<br />High School<span>Mhondoro, Zimbabwe</span></Link><p>Nectamen consumebatur.<br /><span>Yet it was not consumed.</span></p></div><div><h2>Discover</h2><Link href="/about/">About our school</Link><Link href="/about/policies/">School policies</Link><Link href="/academics/">Academics</Link><Link href="/school-life/">School life</Link><Link href="/gallery/">Gallery</Link></div><div><h2>Connect</h2><Link href="/admissions/">Admissions</Link><Link href="/news/">News &amp; events</Link><Link href="/alumni/">Alumni &amp; development</Link><Link href="/contact/">Contact us</Link></div><div className="footer-portal"><h2>Already part of our school?</h2><p>Access the separate results portal with your existing account.</p><Link href="/portal/">Student / Staff Portal <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Presbyterian High School</span><div className="footer-utility-links"><span>School review edition</span><Link href="/privacy/">Privacy notice</Link></div></div></div></footer>;
}
