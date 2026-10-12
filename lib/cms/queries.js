import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';

const NEWS_FIELDS = 'id,slug,title,summary,content,category,author_name,featured_image_url,featured_image_alt,publish_at,created_at';
const EVENT_FIELDS = 'id,slug,title,summary,description,cover_image_url,cover_image_alt,start_at,end_at,venue,registration_url,event_status,publish_at,created_at';

function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

async function listNewsRaw({ page = 1, category = '', pageSize = 9 } = {}) {
  if (!configured()) return { items: [], count: 0 };
  const supabase = createPublicClient();
  let query = supabase.from('news_articles').select(NEWS_FIELDS, { count: 'exact' })
    .in('status', ['published', 'scheduled']).lte('publish_at', new Date().toISOString()).is('archived_at', null)
    .order('publish_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  if (category) query = query.eq('category', category);
  const { data, count, error } = await query;
  if (error) { console.error('Unable to load news:', error.message); return { items: [], count: 0 }; }
  return { items: data || [], count: count || 0 };
}

export const listPublishedNews = unstable_cache(listNewsRaw, ['published-news'], { revalidate: 60, tags: ['news'] });

async function listNewsCategoriesRaw() {
  if (!configured()) return [];
  const supabase = createPublicClient();
  const { data } = await supabase.from('news_articles').select('category').in('status', ['published', 'scheduled']).lte('publish_at', new Date().toISOString()).is('archived_at', null);
  return [...new Set((data || []).map(item => item.category))].sort();
}
export const listPublishedNewsCategories = unstable_cache(listNewsCategoriesRaw, ['published-news-categories'], { revalidate: 60, tags: ['news'] });

async function getNewsRaw(slug) {
  if (!configured()) return null;
  const supabase = createPublicClient();
  const { data } = await supabase.from('news_articles').select(NEWS_FIELDS)
    .eq('slug', slug).in('status', ['published', 'scheduled']).lte('publish_at', new Date().toISOString()).is('archived_at', null).maybeSingle();
  return data;
}
export const getPublishedNews = unstable_cache(getNewsRaw, ['published-news-detail'], { revalidate: 60, tags: ['news'] });

export async function getRelatedNews(article, limit = 3) {
  if (!configured() || !article) return [];
  const supabase = createPublicClient();
  const { data } = await supabase.from('news_articles').select('id,slug,title,summary,category,featured_image_url,featured_image_alt,publish_at')
    .neq('id', article.id).eq('category', article.category).in('status', ['published', 'scheduled'])
    .lte('publish_at', new Date().toISOString()).is('archived_at', null).order('publish_at', { ascending: false }).limit(limit);
  return data || [];
}

async function listEventsRaw() {
  if (!configured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('events').select(EVENT_FIELDS)
    .in('status', ['published', 'scheduled']).lte('publish_at', new Date().toISOString()).is('archived_at', null)
    .order('start_at', { ascending: true });
  if (error) { console.error('Unable to load events:', error.message); return []; }
  return data || [];
}
export const listPublishedEvents = unstable_cache(listEventsRaw, ['published-events'], { revalidate: 60, tags: ['events'] });

async function getEventRaw(slug) {
  if (!configured()) return null;
  const supabase = createPublicClient();
  const { data } = await supabase.from('events').select(EVENT_FIELDS)
    .eq('slug', slug).in('status', ['published', 'scheduled']).lte('publish_at', new Date().toISOString()).is('archived_at', null).maybeSingle();
  return data;
}
export const getPublishedEvent = unstable_cache(getEventRaw, ['published-event-detail'], { revalidate: 60, tags: ['events'] });

export async function listAdminContent(table, { query = '', status = 'all' } = {}) {
  const supabase = await createClient();
  let request = supabase.from(table).select('*').order('updated_at', { ascending: false });
  if (status !== 'all') request = request.eq('status', status);
  if (query) request = request.ilike('title', `%${query.replace(/[%_]/g, '')}%`);
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminRecord(table, id) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listMedia() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
