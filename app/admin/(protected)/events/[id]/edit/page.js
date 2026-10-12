import { notFound } from 'next/navigation';
import ContentForm from '@/components/admin/ContentForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireStaff } from '@/lib/cms/auth';
import { getAdminRecord } from '@/lib/cms/queries';

export const metadata = { title: 'Edit event' };

export default async function EditEventPage({ params }) {
  const staff = await requireStaff();
  const { id } = await params;
  const record = await getAdminRecord('events', id);
  if (!record) notFound();
  return <><header className="admin-page-head"><div><h1>Edit event</h1><p>Keep event information and publication settings current.</p></div>{staff.role === 'admin' && <DeleteButton id={record.id} type="event" label={record.title}/>}</header><ContentForm type="events" record={record}/></>;
}
