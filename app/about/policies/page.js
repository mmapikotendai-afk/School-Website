import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PolicyLibrary from '@/components/PolicyLibrary';
import { policyCategories, publishedPolicies } from '@/lib/policies';

export const metadata = { title: 'School Policies & Guidelines', description: 'Access important school rules, procedures and official documents from Presbyterian High School, Mhondoro.' };

export default function PoliciesPage() {
  return <><section className="page-hero policy-page-hero"><div className="container"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><ChevronRight size={13} aria-hidden="true" /><Link href="/about/">About Us</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">School Policies</span></nav><h1>School Policies &amp; Guidelines</h1><p>Access important school rules, procedures and official documents.</p></div><span className="page-hero-rule" aria-hidden="true" /></section><PolicyLibrary categories={policyCategories} policies={publishedPolicies} /></>;
}
