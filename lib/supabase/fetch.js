import { timedCms } from '@/lib/cms/perf';

// Measure upstream wait separately from rendering. Never log query parameters,
// headers, tokens or request/response bodies (which may contain private records).
export async function timedSupabaseFetch(input, init) {
  const url = new URL(typeof input === 'string' ? input : input.url || input.toString());
  const segments = url.pathname.split('/').filter(Boolean);
  const context = {
    service: segments[0],
    resource: segments[0] === 'rest' ? segments[2] : segments[0],
  };
  return timedCms('supabase.request', async () => {
    try {
      const response = await fetch(input, init);
      context.status = response.status;
      return response;
    } catch (error) {
      context.error = error.name;
      throw error;
    }
  }, context);
}
