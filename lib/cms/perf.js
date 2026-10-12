const enabled = process.env.CMS_PERF_LOG === 'true';

export async function timedCms(operation, callback, context = {}) {
  const startedAt = performance.now();
  try {
    return await callback();
  } finally {
    if (enabled) {
      console.info(JSON.stringify({
        type: 'cms-performance',
        operation,
        duration_ms: Number((performance.now() - startedAt).toFixed(1)),
        ...context,
      }));
    }
  }
}

export function cmsTimingHeader(metrics) {
  return Object.entries(metrics).map(([name, duration]) => `${name};dur=${Number(duration).toFixed(1)}`).join(', ');
}
