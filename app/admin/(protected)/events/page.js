import ContentList from '@/components/admin/ContentList';
import { requireStaff } from '@/lib/cms/auth';
import { listAdminContent } from '@/lib/cms/queries';

export const metadata = { title: 'Events' };
export default async function AdminEventsPage({ searchParams }) {
  const params = await searchParams;
  const query = String(params?.q || ''); const status = String(params?.status || 'all');
  const page = Math.max(1, Number(params?.page) || 1);
  const [staff, result] = await Promise.all([requireStaff(), listAdminContent('events', { query, status, page })]);
  return <ContentList type="events" {...result} staff={staff} query={query} status={status} deleted={params?.deleted === '1'}/>;
}
