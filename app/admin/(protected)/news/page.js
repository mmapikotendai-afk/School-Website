import ContentList from '@/components/admin/ContentList';
import { requireStaff } from '@/lib/cms/auth';
import { listAdminContent } from '@/lib/cms/queries';

export const metadata = { title: 'News' };
export default async function AdminNewsPage({ searchParams }) {
  const params = await searchParams; const staff = await requireStaff();
  const query = String(params?.q || ''); const status = String(params?.status || 'all');
  const items = await listAdminContent('news_articles', { query, status });
  return <ContentList type="news" items={items} staff={staff} query={query} status={status} deleted={params?.deleted === '1'}/>;
}
