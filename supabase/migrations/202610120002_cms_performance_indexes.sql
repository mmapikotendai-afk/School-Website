create extension if not exists pg_trgm;

create index if not exists news_admin_updated_idx
  on public.news_articles (updated_at desc);
create index if not exists news_admin_status_updated_idx
  on public.news_articles (status, updated_at desc);
create index if not exists news_admin_title_search_idx
  on public.news_articles using gin (title gin_trgm_ops);

create index if not exists events_admin_updated_idx
  on public.events (updated_at desc);
create index if not exists events_admin_status_updated_idx
  on public.events (status, updated_at desc);
create index if not exists events_admin_title_search_idx
  on public.events using gin (title gin_trgm_ops);

create index if not exists media_admin_created_idx
  on public.media_assets (created_at desc);

create or replace function public.cms_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  recent_activity jsonb := '[]'::jsonb;
begin
  if not public.is_staff() then
    raise exception 'Unauthorised' using errcode = '42501';
  end if;

  if public.is_staff(array['admin']::public.staff_role[]) then
    select coalesce(jsonb_agg(to_jsonb(entry) order by entry.created_at desc), '[]'::jsonb)
      into recent_activity
      from (
        select id, action, entity_type, details, created_at
        from public.audit_logs
        order by created_at desc
        limit 8
      ) entry;
  end if;

  return jsonb_build_object(
    'news_count', (select count(*) from public.news_articles),
    'event_count', (select count(*) from public.events),
    'media_count', (select count(*) from public.media_assets),
    'activity', recent_activity
  );
end;
$$;

revoke all on function public.cms_dashboard_summary() from public;
grant execute on function public.cms_dashboard_summary() to authenticated;
