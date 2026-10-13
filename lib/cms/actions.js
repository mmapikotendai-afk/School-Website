'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/cms/auth';
import { EVENT_STATUSES, NEWS_STATUSES, parseSiteDateTime, slugify } from '@/lib/cms/config';
import { timedCms } from '@/lib/cms/perf';
import { A_LEVEL_SUBJECTS } from '@/lib/academics';

function clean(value, max = 10000) { return String(value || '').trim().slice(0, max); }
function optionalUrl(value) {
  const candidate = clean(value, 2000);
  if (!candidate) return null;
  const parsed = new URL(candidate);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP or HTTPS links are allowed.');
  return parsed.toString();
}
function dateValue(value, required = false) {
  const input = clean(value, 40);
  if (!input && !required) return null;
  const date = parseSiteDateTime(input);
  if (Number.isNaN(date.getTime())) throw new Error('Enter a valid date and time.');
  return date.toISOString();
}
async function uniqueSlug(supabase, table, title, id) {
  const base = slugify(title); let candidate = base; let suffix = 2;
  while (true) {
    let query = supabase.from(table).select('id').eq('slug', candidate);
    if (id) query = query.neq('id', id);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}
function readJson(value) {
  try { const parsed = JSON.parse(String(value || '')); return parsed?.type === 'doc' ? parsed : { type: 'doc', content: [] }; }
  catch { return { type: 'doc', content: [] }; }
}
function publishAtFor(status, value) {
  if (status === 'draft' || status === 'archived' || status === 'cancelled') return null;
  return dateValue(value) || new Date().toISOString();
}

export async function loginAction(_previous, formData) {
  const email = clean(formData.get('email'), 254).toLowerCase();
  const password = String(formData.get('password') || '');
  const next = clean(formData.get('next'), 300);
  if (!email || !password) return { error: 'Enter your email address and password.' };
  const supabase = await createClient();
  const { data, error } = await timedCms('auth.signInWithPassword', () => supabase.auth.signInWithPassword({ email, password }));
  if (error || !data.user) return { error: 'The email address or password is incorrect.' };
  const { data: staff } = await timedCms('login.staff-authorization', () => supabase.from('staff_users').select('active').eq('id', data.user.id).eq('active', true).maybeSingle(), { user_id: data.user.id });
  if (!staff) { await supabase.auth.signOut(); return { error: 'This account is not authorised to manage the website.' }; }
  // Keep the redirect on the admin site and go directly to the canonical URL.
  const destination = new URL(next.startsWith('/admin/') ? next : '/admin/dashboard/', 'https://cms.invalid');
  if (!destination.pathname.startsWith('/admin/')) redirect('/admin/dashboard/');
  destination.pathname = `${destination.pathname.replace(/\/+$/, '')}/`;
  redirect(`${destination.pathname}${destination.search}`);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login/');
}

async function persistNews(formData) {
  const staff = await requireStaff();
  const supabase = await createClient();
  const id = clean(formData.get('id'), 60) || null;
  const title = clean(formData.get('title'), 180);
  const status = clean(formData.get('status'), 20);
  if (!title) throw new Error('A title is required.');
  if (!NEWS_STATUSES.includes(status)) throw new Error('Invalid publication status.');
  const payload = {
    title, slug: await uniqueSlug(supabase, 'news_articles', title, id),
    summary: clean(formData.get('summary'), 400), category: clean(formData.get('category'), 80),
    author_name: clean(formData.get('author_name'), 120) || staff.display_name || staff.email,
    content: readJson(formData.get('content')), status, publish_at: publishAtFor(status, formData.get('publish_at')),
    featured_image_url: optionalUrl(formData.get('featured_image_url')),
    featured_image_alt: clean(formData.get('featured_image_alt'), 220) || null,
    archived_at: status === 'archived' ? new Date().toISOString() : null,
    updated_by: staff.id,
  };
  if (!payload.summary || !payload.category) throw new Error('A summary and category are required.');
  const result = id
    ? await supabase.from('news_articles').update(payload).eq('id', id).select('id').single()
    : await supabase.from('news_articles').insert({ ...payload, created_by: staff.id }).select('id').single();
  if (result.error) throw new Error(result.error.message);
  revalidateTag('news'); revalidatePath('/news'); revalidatePath('/admin/news');
}

export async function saveNewsAction(_previousState, formData) {
  try { await persistNews(formData); }
  catch (error) { return { error: error?.message || 'The article could not be saved.' }; }
  redirect('/admin/news/?saved=1');
}

async function persistEvent(formData) {
  const staff = await requireStaff();
  const supabase = await createClient();
  const id = clean(formData.get('id'), 60) || null;
  const title = clean(formData.get('title'), 180);
  const status = clean(formData.get('status'), 20);
  if (!title) throw new Error('A title is required.');
  if (!EVENT_STATUSES.includes(status)) throw new Error('Invalid event status.');
  const startAt = dateValue(formData.get('start_at'), true);
  const endAt = dateValue(formData.get('end_at'));
  if (endAt && endAt < startAt) throw new Error('The end time must be after the start time.');
  const payload = {
    title, slug: await uniqueSlug(supabase, 'events', title, id), summary: clean(formData.get('summary'), 400),
    description: readJson(formData.get('description')), venue: clean(formData.get('venue'), 220),
    start_at: startAt, end_at: endAt, registration_url: optionalUrl(formData.get('registration_url')),
    cover_image_url: optionalUrl(formData.get('cover_image_url')), cover_image_alt: clean(formData.get('cover_image_alt'), 220) || null,
    status, event_status: clean(formData.get('event_status'), 30) || 'scheduled',
    publish_at: publishAtFor(status, formData.get('publish_at')),
    archived_at: status === 'archived' ? new Date().toISOString() : null, updated_by: staff.id,
  };
  if (!payload.summary || !payload.venue) throw new Error('A summary and venue are required.');
  const result = id
    ? await supabase.from('events').update(payload).eq('id', id).select('id').single()
    : await supabase.from('events').insert({ ...payload, created_by: staff.id }).select('id').single();
  if (result.error) throw new Error(result.error.message);
  revalidateTag('events'); revalidatePath('/events'); revalidatePath('/admin/events');
}

export async function saveEventAction(_previousState, formData) {
  try { await persistEvent(formData); }
  catch (error) { return { error: error?.message || 'The event could not be saved.' }; }
  redirect('/admin/events/?saved=1');
}

export async function deleteContentAction(formData) {
  await requireStaff(['admin']);
  const type = clean(formData.get('type'), 10);
  const id = clean(formData.get('id'), 60);
  const table = type === 'news' ? 'news_articles' : type === 'event' ? 'events' : null;
  if (!table || !id) throw new Error('Invalid deletion request.');
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateTag(type === 'news' ? 'news' : 'events');
  const listPath = `/admin/${type === 'news' ? 'news' : 'events'}/`;
  revalidatePath(listPath);
  redirect(`${listPath}?deleted=1`);
}

export async function deleteMediaAction(formData) {
  await requireStaff(['admin']);
  const id = clean(formData.get('id'), 60);
  const supabase = await createClient();
  const { data } = await supabase.from('media_assets').select('storage_path').eq('id', id).single();
  if (!data) throw new Error('Media item not found.');
  const { error: storageError } = await supabase.storage.from('cms-media').remove([data.storage_path]);
  if (storageError) throw new Error(storageError.message);
  const { error } = await supabase.from('media_assets').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateTag('gallery');
  revalidatePath('/gallery');
  revalidatePath('/admin/media');
}

function revalidateAcademics() {
  revalidateTag('academics');
  revalidatePath('/academics/');
  revalidatePath('/admissions/');
  revalidatePath('/admin/academics/');
}

export async function saveALevelSettingsAction(_previousState, formData) {
  try {
    const staff = await requireStaff();
    const attendance = clean(formData.get('internal_attendance_requirement'), 500);
    const internalGrades = Number(formData.get('internal_minimum_a_grades'));
    const externalGrades = Number(formData.get('external_minimum_a_grades'));
    if (!attendance) throw new Error('Enter the internal applicant attendance requirement.');
    if (!Number.isInteger(internalGrades) || internalGrades < 0 || internalGrades > 20 || !Number.isInteger(externalGrades) || externalGrades < 0 || externalGrades > 20) throw new Error('Grade requirements must be whole numbers from 0 to 20.');
    const supabase = await createClient();
    const { error } = await supabase.from('a_level_settings').update({
      internal_attendance_requirement: attendance,
      internal_minimum_a_grades: internalGrades,
      external_minimum_a_grades: externalGrades,
      updated_by: staff.id,
    }).eq('id', 'current');
    if (error) throw new Error(error.message);
    revalidateAcademics();
    return { success: 'Entry requirements saved.' };
  } catch (error) { return { error: error?.message || 'Entry requirements could not be saved.' }; }
}

export async function saveALevelCombinationAction(_previousState, formData) {
  try {
    const staff = await requireStaff();
    const id = clean(formData.get('id'), 60) || null;
    const name = clean(formData.get('name'), 160);
    const pathway = clean(formData.get('pathway'), 30);
    const subjects = formData.getAll('subjects').map(subject => clean(subject, 100));
    const approvedSubjects = A_LEVEL_SUBJECTS[pathway];
    if (!name) throw new Error('Enter the approved combination name.');
    if (!approvedSubjects) throw new Error('Select a valid academic pathway.');
    if (!subjects.length || subjects.some(subject => !approvedSubjects.includes(subject))) throw new Error('Select at least one subject from the chosen pathway.');
    const placesInput = clean(formData.get('available_places'), 10);
    const availablePlaces = placesInput === '' ? null : Number(placesInput);
    if (availablePlaces !== null && (!Number.isInteger(availablePlaces) || availablePlaces < 0)) throw new Error('Available places must be a whole number of zero or more, or left blank.');
    const payload = {
      name,
      pathway,
      subjects: [...new Set(subjects)],
      available_places: availablePlaces,
      availability_note: clean(formData.get('availability_note'), 300) || null,
      published: formData.get('published') === 'on',
      sort_order: Number(formData.get('sort_order')) || 0,
      updated_by: staff.id,
    };
    const supabase = await createClient();
    const result = id
      ? await supabase.from('a_level_combinations').update(payload).eq('id', id).select('id').single()
      : await supabase.from('a_level_combinations').insert({ ...payload, created_by: staff.id }).select('id').single();
    if (result.error) throw new Error(result.error.message);
    revalidateAcademics();
    return { success: id ? 'Combination updated.' : 'Combination added.' };
  } catch (error) { return { error: error?.message || 'The combination could not be saved.' }; }
}

export async function deleteALevelCombinationAction(formData) {
  await requireStaff(['admin']);
  const id = clean(formData.get('id'), 60);
  if (!id) throw new Error('Invalid combination.');
  const supabase = await createClient();
  const { error } = await supabase.from('a_level_combinations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateAcademics();
  redirect('/admin/academics/?deleted=1');
}
