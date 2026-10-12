import Link from 'next/link';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return <div className="admin-login-page"><div className="admin-login-brand"><img src="/images/school-crest.jpeg" alt="Presbyterian High School crest" width="92" height="92"/><p>Presbyterian High School</p><span>Website administration</span></div><div className="admin-login-card"><h1>Welcome back.</h1><p>Sign in with an authorised school account to manage news, events and media.</p>{params?.error === 'unauthorised' && <p className="admin-error" role="alert">Your session has expired or this account is not authorised.</p>}<LoginForm next={params?.next || ''}/><Link href="/">Return to the website</Link></div></div>;
}
