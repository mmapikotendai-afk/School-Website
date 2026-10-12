alter table public.media_assets
  add column if not exists caption text,
  add column if not exists gallery_category text,
  add column if not exists is_gallery boolean not null default false,
  add column if not exists published_at timestamptz;

alter table public.media_assets drop constraint if exists media_gallery_metadata;
alter table public.media_assets add constraint media_gallery_metadata check (
  not is_gallery or (
    nullif(trim(caption), '') is not null
    and nullif(trim(alt_text), '') is not null
    and gallery_category in ('Campus','Classrooms','Sports','Ceremonies','Boarding','Student Life','School Identity')
    and published_at is not null
  )
);

create index if not exists media_public_gallery_idx
  on public.media_assets (published_at desc)
  where is_gallery = true;

drop policy if exists "Public read published gallery media" on public.media_assets;
create policy "Public read published gallery media" on public.media_assets
  for select to anon, authenticated
  using ((is_gallery = true and published_at <= now()) or public.is_staff());
