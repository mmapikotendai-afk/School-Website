'use client';
import { useActionState } from 'react';
import { loginAction } from '@/lib/cms/actions';

const initialState = { error: '' };
export default function LoginForm({ next = '' }) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="admin-login-form">
    <input type="hidden" name="next" value={next} />
    <label>Email address<input type="email" name="email" autoComplete="username" required /></label>
    <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
    {state?.error && <p className="admin-error" role="alert">{state.error}</p>}
    <button type="submit" className="button button-primary" disabled={pending}>{pending ? 'Signing in…' : 'Sign in securely'}</button>
  </form>;
}
