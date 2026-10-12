import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
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
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isLogin = path === '/admin/login' || path === '/admin/login/';
  if (path.startsWith('/admin') && !isLogin && !user) {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }
  if (isLogin && user) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = '/admin/dashboard';
    return NextResponse.redirect(dashboard);
  }
  return response;
}
