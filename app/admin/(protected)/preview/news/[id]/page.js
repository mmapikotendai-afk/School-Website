import { notFound } from 'next/navigation';
import PreviewContent from '@/components/admin/PreviewContent';
import { requireStaff } from '@/lib/cms/auth';
import { getAdminRecord } from '@/lib/cms/queries';
export default async function NewsPreview({ params }) { await requireStaff(); const { id } = await params; const record = await getAdminRecord('news_articles', id); if (!record) notFound(); return <PreviewContent type="news" record={record}/>; }
