import ContentForm from '@/components/admin/ContentForm';
import { requireStaff } from '@/lib/cms/auth';
export const metadata = { title: 'New event' };
export default async function NewEventPage() { await requireStaff(); return <><header className="admin-page-head"><div><h1>New event</h1><p>Add the date, venue, details and publication plan.</p></div></header><ContentForm type="events"/></>; }
