import AdminNav from '@/components/admin/AdminNav';
import { requireStaff } from '@/lib/cms/auth';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }) {
  const staff = await requireStaff();
  return <div className="admin-shell"><AdminNav staff={staff}/><div className="admin-workspace">{children}</div></div>;
}
