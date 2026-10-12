import ContentList from '@/components/admin/ContentList';
import { requireStaff } from '@/lib/cms/auth';
import { listAdminContent } from '@/lib/cms/queries';

export const metadata = { title: 'Events' };
export default async function AdminEventsPage({ searchParams }) {
  const params = await searchParams; const staff = await requireStaff();
  const query = String(params?.q || ''); const status = String(params?.status || 'all');
  const items = await listAdminContent('events', { query, status });
  return <ContentList type="events" items={items} staff={staff} query={query} status={status} deleted={params?.deleted === '1'}/>;
}
