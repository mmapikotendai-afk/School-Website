import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { pageInfo } from '@/lib/content';
import * as Pages from '@/components/PageContent';
import { AdmissionCTA } from '@/components/Footer';

const views = {about: Pages.About, academics: Pages.Academics, admissions: Pages.Admissions, 'school-life': Pages.SchoolLife, news: Pages.News, gallery: Pages.Gallery, alumni: Pages.Alumni, contact: Pages.Contact, portal: Pages.Portal, privacy: Pages.Privacy};
export const dynamicParams = false;
export function generateStaticParams() {return Object.keys(pageInfo).map(slug => ({slug}));}
export async function generateMetadata({params}) {const {slug}=await params; const info=pageInfo[slug];return {title:info?.short,description:info?.description};}
export default async function InformationPage({params}) {
  const {slug}=await params; const info=pageInfo[slug]; const Content=views[slug]; if(!info || !Content) notFound();
  return <><section className={`page-hero ${slug === 'admissions' ? 'page-hero-admissions' : ''}`}><div className="container"><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><ChevronRight size={13}/><span aria-current="page">{info.short}</span></nav><h1>{info.title}</h1><p>{info.description}</p></div><span className="page-hero-rule" aria-hidden="true"/></section><Content/>{!['admissions','contact','portal','privacy'].includes(slug) && <AdmissionCTA/>}</>;
}
