import { GraduationCap } from 'lucide-react';
import AcademicsManager from '@/components/admin/AcademicsManager';
import { requireStaff } from '@/lib/cms/auth';
import { getAdminALevelData } from '@/lib/cms/queries';

export const metadata = { title: 'A-Level Academics' };

export default async function AdminAcademicsPage({ searchParams }) {
  const [staff, data, params] = await Promise.all([requireStaff(), getAdminALevelData(), searchParams]);
  return <><header className="admin-page-head"><div><h1>A-Level academics</h1><p>Manage approved entry requirements, subject combinations and available places.</p></div><GraduationCap size={35} aria-hidden="true"/></header>{params?.deleted && <p className="admin-success" role="status">Combination deleted.</p>}<AcademicsManager data={data} role={staff.role}/></>;
}

