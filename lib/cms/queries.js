import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import { timedCms } from '@/lib/cms/perf';
import { DEFAULT_A_LEVEL_REQUIREMENTS } from '@/lib/academics';

const NEWS_FIELDS = 'id,slug,title,summary,content,category,author_name,featured_image_url,featured_image_alt,publish_at,created_at';
const EVENT_FIELDS = 'id,slug,title,summary,description,cover_image_url,cover_image_alt,start_at,end_at,venue,registration_url,event_status,publish_at,created_at';
const NEWS_LIST_FIELDS = 'id,slug,title,summary,category,author_name,featured_image_url,featured_image_alt,publish_at,created_at';
const EVENT_LIST_FIELDS = 'id,slug,title,summary,cover_image_url,cover_image_alt,start_at,end_at,venue,registration_url,event_status,publish_at,created_at';
const ADMIN_LIST_FIELDS = {
  news_articles: 'id,title,slug,status,category,updated_at',
  events: 'id,title,slug,status,start_at,updated_at',
};

function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

async function listNewsRaw({ page = 1, category = '', pageSize = 9 } = {}) {
  if (!configured()) return { items: [], count: 0 };
  const supabase = createPublicClient();
  let query = supabase.from('news_articles').select(NEWS_LIST_FIELDS, { count: 'exact' })
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

async function getRelatedNewsRaw(id, category, limit) {
  if (!configured()) return [];
  const supabase = createPublicClient();
  const { data } = await supabase.from('news_articles').select('id,slug,title,summary,category,featured_image_url,featured_image_alt,publish_at')
    .neq('id', id).eq('category', category).in('status', ['published', 'scheduled'])
    .lte('publish_at', new Date().toISOString()).is('archived_at', null).order('publish_at', { ascending: false }).limit(limit);
  return data || [];
}
const cachedRelatedNews = unstable_cache(getRelatedNewsRaw, ['published-related-news'], { revalidate: 60, tags: ['news'] });
export async function getRelatedNews(article, limit = 3) {
  return article ? cachedRelatedNews(article.id, article.category, limit) : [];
}

async function listEventsRaw() {
  if (!configured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('events').select(EVENT_LIST_FIELDS)
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

async function listGalleryRaw() {
  if (!configured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('media_assets')
    .select('id,public_url,alt_text,caption,gallery_category,width,height,published_at')
    .eq('is_gallery', true).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false });
  if (error) { console.error('Unable to load gallery:', error.message); return []; }
  return data || [];
}
export const listPublishedGallery = unstable_cache(listGalleryRaw, ['published-gallery'], { revalidate: 60, tags: ['gallery'] });

export async function listAdminContent(table, { query = '', status = 'all', page = 1, pageSize = 25 } = {}) {
  if (!ADMIN_LIST_FIELDS[table]) throw new Error('Unsupported content type.');
  const supabase = await createClient();
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 25));
  const from = (safePage - 1) * safePageSize;
  let request = supabase.from(table).select(ADMIN_LIST_FIELDS[table], { count: 'exact' }).order('updated_at', { ascending: false }).range(from, from + safePageSize - 1);
  if (status !== 'all') request = request.eq('status', status);
  if (query) request = request.ilike('title', `%${query.replace(/[%_]/g, '')}%`);
  const { data, count, error } = await timedCms('content.list', () => request, { table, page: safePage });
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pages: Math.max(1, Math.ceil((count || 0) / safePageSize)) };
}

export async function getAdminRecord(table, id) {
  const supabase = await createClient();
  const { data, error } = await timedCms('content.record', () => supabase.from(table).select('*').eq('id', id).maybeSingle(), { table });
  if (error) throw new Error(error.message);
  return data;
}

export async function listMedia({ page = 1, pageSize = 24 } = {}) {
  const supabase = await createClient();
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(48, Math.max(1, Number(pageSize) || 24));
  const from = (safePage - 1) * safePageSize;
  const { data, count, error } = await timedCms('media.list', () => supabase.from('media_assets')
    .select('id,public_url,alt_text,original_name,width,height,optimized_bytes,created_at', { count: 'exact' })
    .order('created_at', { ascending: false }).range(from, from + safePageSize - 1), { page: safePage });
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pages: Math.max(1, Math.ceil((count || 0) / safePageSize)) };
}

async function getPublishedALevelDataRaw() {
  if (!configured()) return { requirements: DEFAULT_A_LEVEL_REQUIREMENTS, combinations: [] };
  const supabase = createPublicClient();
  const [settings, combinations] = await Promise.all([
    supabase.from('a_level_settings').select('internal_attendance_requirement,internal_minimum_a_grades,external_minimum_a_grades').eq('id', 'current').maybeSingle(),
    supabase.from('a_level_combinations').select('id,name,pathway,subjects,available_places,availability_note,sort_order').eq('published', true).order('sort_order').order('name'),
  ]);
  if (settings.error || combinations.error) {
    console.error('Unable to load A-Level CMS data:', settings.error?.message || combinations.error?.message);
    return { requirements: DEFAULT_A_LEVEL_REQUIREMENTS, combinations: [] };
  }
  return {
    requirements: settings.data || DEFAULT_A_LEVEL_REQUIREMENTS,
    combinations: combinations.data || [],
  };
}

export const getPublishedALevelData = unstable_cache(getPublishedALevelDataRaw, ['published-a-level-data'], { revalidate: 60, tags: ['academics'] });

export async function getAdminALevelData() {
  const supabase = await createClient();
  const [settings, combinations] = await Promise.all([
    timedCms('academics.settings', () => supabase.from('a_level_settings').select('internal_attendance_requirement,internal_minimum_a_grades,external_minimum_a_grades').eq('id', 'current').maybeSingle()),
    timedCms('academics.combinations', () => supabase.from('a_level_combinations').select('id,name,pathway,subjects,available_places,availability_note,published,sort_order,updated_at').order('sort_order').order('name')),
  ]);
  const error = settings.error || combinations.error;
  if (error) throw new Error(error.message);
  return { requirements: settings.data || DEFAULT_A_LEVEL_REQUIREMENTS, combinations: combinations.data || [] };
}
