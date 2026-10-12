import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timedCms } from '@/lib/cms/perf';

export const getStaff = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await timedCms('auth.getClaims', () => supabase.auth.getClaims());
  const userId = claimData?.claims?.sub;
  if (claimError || !userId) return null;
  const { data } = await timedCms('staff.lookup', () => supabase.from('staff_users').select('id,email,display_name,role,active').eq('id', userId).eq('active', true).maybeSingle(), { user_id: userId });
  return data ? { ...data, user: { id: userId, email: claimData.claims.email || data.email } } : null;
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
