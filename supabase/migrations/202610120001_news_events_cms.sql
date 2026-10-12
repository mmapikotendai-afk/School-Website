create extension if not exists pgcrypto;

do $$ begin
  create type public.staff_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.content_status as enum ('draft', 'scheduled', 'published', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.event_content_status as enum ('draft', 'scheduled', 'published', 'cancelled', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.staff_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.staff_role not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null check (char_length(summary) between 1 and 400),
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  category text not null check (char_length(category) between 1 and 80),
  author_name text not null,
  featured_image_url text,
  featured_image_alt text,
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.staff_users(id),
  updated_by uuid references public.staff_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_publish_date check (status in ('draft','archived') or publish_at is not null),
  constraint news_image_alt check (featured_image_url is null or nullif(trim(featured_image_alt), '') is not null)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null check (char_length(summary) between 1 and 400),
  description jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  cover_image_url text,
  cover_image_alt text,
  start_at timestamptz not null,
  end_at timestamptz,
  venue text not null,
  registration_url text,
  event_status text not null default 'scheduled' check (event_status in ('scheduled','ongoing','completed','cancelled')),
  status public.event_content_status not null default 'draft',
  publish_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.staff_users(id),
  updated_by uuid references public.staff_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_dates check (end_at is null or end_at >= start_at),
  constraint event_publish_date check (status in ('draft','archived','cancelled') or publish_at is not null),
  constraint event_image_alt check (cover_image_url is null or nullif(trim(cover_image_alt), '') is not null)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  original_name text not null,
  alt_text text,
  mime_type text not null default 'image/webp',
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  original_bytes bigint not null check (original_bytes > 0),
  optimized_bytes bigint not null check (optimized_bytes > 0),
  uploaded_by uuid not null references public.staff_users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists news_public_idx on public.news_articles (publish_at desc) where archived_at is null;
create index if not exists news_category_idx on public.news_articles (category, publish_at desc);
create index if not exists events_public_idx on public.events (start_at) where archived_at is null;
create index if not exists audit_recent_idx on public.audit_logs (created_at desc);

create or replace function public.is_staff(allowed_roles public.staff_role[] default array['admin','editor']::public.staff_role[])
returns boolean language sql stable security definer set search_path = public set row_security = off as $$
  select exists(select 1 from public.staff_users where id = auth.uid() and active = true and role = any(allowed_roles));
$$;
revoke all on function public.is_staff(public.staff_role[]) from public;
grant execute on function public.is_staff(public.staff_role[]) to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

create or replace function public.audit_cms_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare record_id text; safe_details jsonb;
begin
  record_id := coalesce(new.id::text, old.id::text);
  safe_details := jsonb_build_object(
    'title', coalesce(to_jsonb(new)->>'title', to_jsonb(old)->>'title', to_jsonb(new)->>'original_name', to_jsonb(old)->>'original_name'),
    'status', coalesce(to_jsonb(new)->>'status', to_jsonb(old)->>'status')
  );
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
  values(auth.uid(), lower(tg_op), tg_table_name, record_id, jsonb_strip_nulls(safe_details));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

drop trigger if exists staff_touch_updated_at on public.staff_users;
create trigger staff_touch_updated_at before update on public.staff_users for each row execute function public.touch_updated_at();
drop trigger if exists news_touch_updated_at on public.news_articles;
create trigger news_touch_updated_at before update on public.news_articles for each row execute function public.touch_updated_at();
drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at before update on public.events for each row execute function public.touch_updated_at();

drop trigger if exists news_audit on public.news_articles;
create trigger news_audit after insert or update or delete on public.news_articles for each row execute function public.audit_cms_change();
drop trigger if exists events_audit on public.events;
create trigger events_audit after insert or update or delete on public.events for each row execute function public.audit_cms_change();
drop trigger if exists media_audit on public.media_assets;
create trigger media_audit after insert or update or delete on public.media_assets for each row execute function public.audit_cms_change();

alter table public.staff_users enable row level security;
alter table public.news_articles enable row level security;
alter table public.events enable row level security;
alter table public.media_assets enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Staff can read own profile" on public.staff_users;
create policy "Staff can read own profile" on public.staff_users for select to authenticated using (id = auth.uid() and active = true);
drop policy if exists "Admins manage staff" on public.staff_users;
create policy "Admins manage staff" on public.staff_users for all to authenticated using (public.is_staff(array['admin']::public.staff_role[])) with check (public.is_staff(array['admin']::public.staff_role[]));

drop policy if exists "Public read published news" on public.news_articles;
create policy "Public read published news" on public.news_articles for select to anon, authenticated using (
  status in ('published','scheduled') and publish_at <= now() and archived_at is null
  or public.is_staff()
);
drop policy if exists "Staff create news" on public.news_articles;
create policy "Staff create news" on public.news_articles for insert to authenticated with check (public.is_staff() and created_by = auth.uid());
drop policy if exists "Staff update news" on public.news_articles;
create policy "Staff update news" on public.news_articles for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Admins delete news" on public.news_articles;
create policy "Admins delete news" on public.news_articles for delete to authenticated using (public.is_staff(array['admin']::public.staff_role[]));

drop policy if exists "Public read published events" on public.events;
create policy "Public read published events" on public.events for select to anon, authenticated using (
  status in ('published','scheduled') and publish_at <= now() and archived_at is null
  or public.is_staff()
);
drop policy if exists "Staff create events" on public.events;
create policy "Staff create events" on public.events for insert to authenticated with check (public.is_staff() and created_by = auth.uid());
drop policy if exists "Staff update events" on public.events;
create policy "Staff update events" on public.events for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Admins delete events" on public.events;
create policy "Admins delete events" on public.events for delete to authenticated using (public.is_staff(array['admin']::public.staff_role[]));

drop policy if exists "Staff manage media records" on public.media_assets;
drop policy if exists "Staff read media records" on public.media_assets;
create policy "Staff read media records" on public.media_assets for select to authenticated using (public.is_staff());
drop policy if exists "Staff create media records" on public.media_assets;
create policy "Staff create media records" on public.media_assets for insert to authenticated with check (public.is_staff() and uploaded_by = auth.uid());
drop policy if exists "Staff update own media records" on public.media_assets;
create policy "Staff update own media records" on public.media_assets for update to authenticated using (public.is_staff() and (uploaded_by = auth.uid() or public.is_staff(array['admin']::public.staff_role[]))) with check (public.is_staff() and (uploaded_by = auth.uid() or public.is_staff(array['admin']::public.staff_role[])));
drop policy if exists "Admins delete media records" on public.media_assets;
create policy "Admins delete media records" on public.media_assets for delete to authenticated using (public.is_staff(array['admin']::public.staff_role[]));
drop policy if exists "Admins read audits" on public.audit_logs;
create policy "Admins read audits" on public.audit_logs for select to authenticated using (public.is_staff(array['admin']::public.staff_role[]));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', true, 8388608, array['image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read CMS media" on storage.objects;
create policy "Public read CMS media" on storage.objects for select to public using (bucket_id = 'cms-media');
drop policy if exists "Staff upload CMS media" on storage.objects;
create policy "Staff upload CMS media" on storage.objects for insert to authenticated with check (bucket_id = 'cms-media' and public.is_staff());
drop policy if exists "Staff update CMS media" on storage.objects;
create policy "Staff update CMS media" on storage.objects for update to authenticated using (bucket_id = 'cms-media' and public.is_staff()) with check (bucket_id = 'cms-media' and public.is_staff());
drop policy if exists "Admins delete CMS media" on storage.objects;
create policy "Admins delete CMS media" on storage.objects for delete to authenticated using (bucket_id = 'cms-media' and public.is_staff(array['admin']::public.staff_role[]));

-- Bootstrap deliberately remains manual. Create a user in Supabase Authentication,
-- then explicitly authorise that UUID. Never trigger staff access on sign-up.
-- insert into public.staff_users (id, email, display_name, role)
-- values ('AUTH-USER-UUID', 'admin@example.com', 'Website Administrator', 'admin');
