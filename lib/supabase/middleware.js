import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cmsTimingHeader } from '@/lib/cms/perf';

export async function updateSession(request) {
  const startedAt = performance.now();
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const path = request.nextUrl.pathname;
  const isLogin = path === '/admin/login' || path === '/admin/login/';
  if (isLogin) return response;

  const authStartedAt = performance.now();
  const { data, error } = await supabase.auth.getClaims();
  const authDuration = performance.now() - authStartedAt;
  if (error || !data?.claims?.sub) {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.searchParams.set('next', path);
    const redirectResponse = NextResponse.redirect(login);
    redirectResponse.headers.set('Server-Timing', cmsTimingHeader({ auth: authDuration, middleware: performance.now() - startedAt }));
    return redirectResponse;
  }
  response.headers.set('Server-Timing', cmsTimingHeader({ auth: authDuration, middleware: performance.now() - startedAt }));
  return response;
}
