const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://presbyterian-high-school-mhondoro.earlyvenus6.chatgpt.site';
const parsedOrigin = new URL(configuredOrigin);
if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.username || parsedOrigin.password) throw new Error('Configure a valid public HTTP(S) site URL.');
export const siteOrigin = parsedOrigin.origin;
export const isPublicLaunch = process.env.NEXT_PUBLIC_PUBLIC_LAUNCH === 'true';
