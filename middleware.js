import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) { return updateSession(request); }

export const config = {
  matcher: ['/admin/:path*'],
};
