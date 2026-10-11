import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import PolicyDetail from '@/components/PolicyDetail';
import { getPolicy, getPolicyCategory, publishedPolicies } from '@/lib/policies';

export const dynamicParams = false;
export function generateStaticParams() { return publishedPolicies.length ? publishedPolicies.map(policy => ({ slug: policy.slug })) : [{ slug: 'no-published-policies' }]; }
export async function generateMetadata({ params }) { const { slug } = await params; const policy = getPolicy(slug); return policy ? { title: policy.title, description: policy.description } : { title: 'Policy not found', robots: { index: false } }; }

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();
  const category = getPolicyCategory(policy.category);
  const related = publishedPolicies.filter(item => item.category === policy.category && item.slug !== policy.slug).slice(0, 3);
  return <><section className="page-hero policy-detail-hero"><div className="container"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><ChevronRight size={13} aria-hidden="true" /><Link href="/about/">About Us</Link><ChevronRight size={13} aria-hidden="true" /><Link href="/about/policies/">School Policies</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{policy.title}</span></nav><span className="eyebrow">{category?.title}</span><h1>{policy.title}</h1></div><span className="page-hero-rule" aria-hidden="true" /></section><PolicyDetail policy={policy} related={related} /></>;
}
