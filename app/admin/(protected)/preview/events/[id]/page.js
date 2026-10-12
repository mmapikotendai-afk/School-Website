import { notFound } from 'next/navigation';
import PreviewContent from '@/components/admin/PreviewContent';
import { requireStaff } from '@/lib/cms/auth';
import { getAdminRecord } from '@/lib/cms/queries';
export default async function EventPreview({ params }) { const { id } = await params; const [, record] = await Promise.all([requireStaff(), getAdminRecord('events', id)]); if (!record) notFound(); return <PreviewContent type="events" record={record}/>; }
