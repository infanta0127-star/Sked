-- ============================================================
-- 副本 Downtime 待處理上報表 (duty_downtime_reports)
-- 在 Supabase Dashboard > SQL Editor 執行
--
-- 當使用者從 FFLogs 匯入時，若發現該副本在 static 資源中尚無預設 Downtime，
-- 前端會自動 Insert 一筆紀錄至此表，供開發者於管理後台查閱並擴充至 data/duties/*.json。
-- ============================================================

create table if not exists public.duty_downtime_reports (
    id                uuid primary key default gen_random_uuid(),
    duty_key          text not null,
    duty_name         text not null,
    encounter_id      integer,
    downtime_periods  jsonb not null default '[]'::jsonb,
    fflogs_url        text,
    status            text not null default 'pending', -- 'pending' | 'completed' | 'ignored'
    notes             text,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

create index if not exists duty_downtime_reports_status_idx on public.duty_downtime_reports (status, duty_key);

-- 所有人（含未登入）皆可新增上報；所有人皆可讀取
alter table public.duty_downtime_reports enable row level security;

drop policy if exists "downtime_reports_public_insert" on public.duty_downtime_reports;
create policy "downtime_reports_public_insert" on public.duty_downtime_reports
    for insert with check (true);

drop policy if exists "downtime_reports_public_select" on public.duty_downtime_reports;
create policy "downtime_reports_public_select" on public.duty_downtime_reports
    for select using (true);

-- 管理員更新狀態 RPC
create or replace function public.admin_update_downtime_report_status(
    p_id uuid,
    p_status text
)
returns boolean
language plpgsql security definer as $$
begin
    if not exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    ) then
        raise exception 'Unauthorized: admin only';
    end if;

    update public.duty_downtime_reports
    set status = p_status,
        updated_at = now()
    where id = p_id;

    return true;
end;
$$;
