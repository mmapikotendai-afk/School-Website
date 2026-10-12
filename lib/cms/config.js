export const SITE_TIME_ZONE = process.env.NEXT_PUBLIC_SITE_TIME_ZONE || 'Africa/Harare';
export const NEWS_CATEGORIES = ['Academics', 'Sports', 'Events', 'Admissions', 'School Life', 'Alumni', 'Announcements'];
export const NEWS_STATUSES = ['draft', 'scheduled', 'published', 'archived'];
export const EVENT_STATUSES = ['draft', 'scheduled', 'published', 'cancelled', 'archived'];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function formatDate(value, options = {}) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-ZW', {
    timeZone: SITE_TIME_ZONE,
    day: 'numeric', month: 'long', year: 'numeric', ...options,
  }).format(new Date(value));
}

export function formatDateTime(value) {
  return formatDate(value, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function toLocalInputValue(value) {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = type => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function parseSiteDateTime(value) {
  if (!value) return null;
  if (/Z$|[+-]\d\d:\d\d$/.test(value)) return new Date(value);
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return new Date(NaN);
  const [, year, month, day, hour, minute] = match.map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  const offsetAt = instant => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
    const part = type => Number(parts.find(item => item.type === type)?.value);
    return Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second')) - instant;
  };
  let utc = wallClock - offsetAt(wallClock);
  utc = wallClock - offsetAt(utc);
  return new Date(utc);
}

export function slugify(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'untitled';
}
