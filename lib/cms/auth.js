import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const getStaff = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('staff_users').select('id,email,display_name,role,active').eq('id', user.id).eq('active', true).maybeSingle();
  return data ? { ...data, user } : null;
});

export async function requireStaff(roles = ['admin', 'editor']) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login?error=unauthorised');
  if (!roles.includes(staff.role)) redirect('/admin/dashboard?error=forbidden');
  return staff;
}

export async function getStaffForRoute() {
  const staff = await getStaff();
  if (!staff) return { staff: null, response: Response.json({ error: 'Unauthorised' }, { status: 401 }) };
  return { staff, response: null };
}
