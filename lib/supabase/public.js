import { createClient } from '@supabase/supabase-js';
import { timedSupabaseFetch } from '@/lib/supabase/fetch';

export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: timedSupabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
