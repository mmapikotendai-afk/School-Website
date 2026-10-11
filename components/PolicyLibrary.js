'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BedDouble, BookOpenCheck, ClipboardCheck, FileSearch, LockKeyhole, Scale, Search, ShieldCheck, X } from 'lucide-react';

const icons = { Scale, BookOpenCheck, BedDouble, ShieldCheck, ClipboardCheck, LockKeyhole };

export default function PolicyLibrary({ categories, policies }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const reduceMotion = useReducedMotion();
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return policies.filter(policy => {
      const matchesCategory = category === 'all' || policy.category === category;
      const searchable = [policy.title, policy.description, ...(policy.keywords || [])].join(' ').toLowerCase();
      return matchesCategory && (!term || searchable.includes(term));
    });
  }, [category, policies, query]);
  const clear = () => { setQuery(''); setCategory('all'); };
  const hasFilters = Boolean(query.trim()) || category !== 'all';

  return <>
    <section className="policy-directory section" aria-labelledby="policy-categories-title"><div className="container">
      <div className="policy-section-heading"><div><span className="eyebrow">Policy directory</span><h2 id="policy-categories-title">Find the guidance you need.</h2></div><p>Browse by subject, then search the school-approved documents currently available to the public.</p></div>
      <div className="policy-category-list">{categories.map((item, index) => {
        const Icon = icons[item.icon];
        const count = policies.filter(policy => policy.category === item.id).length;
        return <motion.article key={item.id} className="policy-category" whileHover={reduceMotion ? undefined : { x: 5 }} transition={{ duration: .18 }}>
          <span className="policy-category-number">{String(index + 1).padStart(2, '0')}</span><span className="policy-category-icon"><Icon aria-hidden="true" /></span>
          <div><h3>{item.title}</h3><p>{item.description}</p></div>
          <button type="button" onClick={() => { setCategory(item.id); document.getElementById('policy-results')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }} aria-label={`Show ${item.title} policies`}>Explore <ArrowRight size={17} aria-hidden="true" /><span className="sr-only"> — {count} published</span></button>
        </motion.article>;
      })}</div>
    </div></section>

    <section className="policy-library section section-paper" id="policy-results" aria-labelledby="policy-library-title"><div className="container">
      <div className="policy-library-head"><div><span className="eyebrow">Official documents</span><h2 id="policy-library-title">Published policies</h2></div><p>Only current documents approved for public access are listed here.</p></div>
      <div className="policy-tools" role="search">
        <label className="policy-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Search policies</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by policy or keyword" /></label>
        <label className="policy-select"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
        {hasFilters && <button className="policy-clear" type="button" onClick={clear}><X size={16} aria-hidden="true" /> Clear filters</button>}
      </div>
      <p className="policy-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'policy' : 'policies'} available</p>
      {filtered.length > 0 ? <div className="policy-results-list">{filtered.map(policy => <article key={policy.id}><div><span>{categories.find(item => item.id === policy.category)?.title}</span><h3><Link href={`/about/policies/${policy.slug}/`}>{policy.title}</Link></h3><p>{policy.description}</p></div><Link href={`/about/policies/${policy.slug}/`} className="text-link">View policy <ArrowRight size={17} aria-hidden="true" /></Link></article>)}</div> : <div className="policy-empty"><FileSearch size={42} aria-hidden="true" /><h3>{hasFilters ? 'No published policies match your search.' : 'School-approved documents are being prepared.'}</h3><p>{hasFilters ? 'Try a different keyword or category, or reset the filters to see all published policies.' : 'No official policy documents have been supplied for publication yet. Please contact the school if you need guidance in the meantime.'}</p>{hasFilters ? <button type="button" className="button button-primary" onClick={clear}>Clear filters</button> : <Link href="/contact/?topic=General" className="button button-primary">Contact the school <ArrowRight size={18} aria-hidden="true" /></Link>}</div>}
    </div></section>
  </>;
}
