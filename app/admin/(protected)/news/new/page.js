import ContentForm from '@/components/admin/ContentForm';
import { requireStaff } from '@/lib/cms/auth';
export const metadata = { title: 'New article' };
export default async function NewNewsPage() { await requireStaff(); return <><header className="admin-page-head"><div><h1>New article</h1><p>Draft a school story, then publish now or schedule it for later.</p></div></header><ContentForm type="news"/></>; }
