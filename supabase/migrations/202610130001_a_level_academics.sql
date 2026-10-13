create table if not exists public.a_level_settings (
  id text primary key default 'current' check (id = 'current'),
  internal_attendance_requirement text not null,
  internal_minimum_a_grades smallint not null check (internal_minimum_a_grades between 0 and 20),
  external_minimum_a_grades smallint not null check (external_minimum_a_grades between 0 and 20),
  updated_by uuid references public.staff_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.a_level_combinations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  pathway text not null check (pathway in ('sciences', 'arts', 'commercials')),
  subjects text[] not null check (cardinality(subjects) > 0),
  available_places integer check (available_places is null or available_places >= 0),
  availability_note text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid not null references public.staff_users(id),
  updated_by uuid references public.staff_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.a_level_settings (id, internal_attendance_requirement, internal_minimum_a_grades, external_minimum_a_grades)
values ('current', 'Must have attended Presbyterian High School from Form 1 through Form 4.', 5, 7)
on conflict (id) do nothing;

create index if not exists a_level_combinations_public_idx on public.a_level_combinations (sort_order, name) where published = true;

drop trigger if exists a_level_settings_touch_updated_at on public.a_level_settings;
create trigger a_level_settings_touch_updated_at before update on public.a_level_settings for each row execute function public.touch_updated_at();
drop trigger if exists a_level_combinations_touch_updated_at on public.a_level_combinations;
create trigger a_level_combinations_touch_updated_at before update on public.a_level_combinations for each row execute function public.touch_updated_at();
drop trigger if exists a_level_settings_audit on public.a_level_settings;
create trigger a_level_settings_audit after insert or update or delete on public.a_level_settings for each row execute function public.audit_cms_change();
drop trigger if exists a_level_combinations_audit on public.a_level_combinations;
create trigger a_level_combinations_audit after insert or update or delete on public.a_level_combinations for each row execute function public.audit_cms_change();

alter table public.a_level_settings enable row level security;
alter table public.a_level_combinations enable row level security;

drop policy if exists "Public read A-Level settings" on public.a_level_settings;
create policy "Public read A-Level settings" on public.a_level_settings for select to anon, authenticated using (true);
drop policy if exists "Staff update A-Level settings" on public.a_level_settings;
create policy "Staff update A-Level settings" on public.a_level_settings for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Public read approved A-Level combinations" on public.a_level_combinations;
create policy "Public read approved A-Level combinations" on public.a_level_combinations for select to anon, authenticated using (published or public.is_staff());
drop policy if exists "Staff create A-Level combinations" on public.a_level_combinations;
create policy "Staff create A-Level combinations" on public.a_level_combinations for insert to authenticated with check (public.is_staff() and created_by = auth.uid());
drop policy if exists "Staff update A-Level combinations" on public.a_level_combinations;
create policy "Staff update A-Level combinations" on public.a_level_combinations for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Admins delete A-Level combinations" on public.a_level_combinations;
create policy "Admins delete A-Level combinations" on public.a_level_combinations for delete to authenticated using (public.is_staff(array['admin']::public.staff_role[]));

