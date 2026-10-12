import { notFound } from 'next/navigation';
import ContentForm from '@/components/admin/ContentForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireStaff } from '@/lib/cms/auth';
import { getAdminRecord } from '@/lib/cms/queries';

export const metadata = { title: 'Edit article' };

export default async function EditNewsPage({ params }) {
  const { id } = await params;
  const [staff, record] = await Promise.all([requireStaff(), getAdminRecord('news_articles', id)]);
  if (!record) notFound();
  return <><header className="admin-page-head"><div><h1>Edit article</h1><p>Update the content, image and publication settings.</p></div>{staff.role === 'admin' && <DeleteButton id={record.id} type="news" label={record.title}/>}</header><ContentForm type="news" record={record}/></>;
}
