-- ============================================================
-- 更新日誌 (Changelog) 資料表
-- 在 Supabase Dashboard > SQL Editor 執行
--
-- 前端「版本號」點擊後會讀取此表最近 10 筆，顯示給一般使用者。
-- content 每一行 = 一條更新項目（用換行分隔）。
-- 只放「一般使用者看得懂的功能更新」，不要放上報/除錯/bug 修復等。
-- 之後發新版時，直接在此表新增一筆對應版本號的資料即可（也可直接編輯 content）。
-- ============================================================

create table if not exists public.changelog (
    id          uuid primary key default gen_random_uuid(),
    version     text not null,
    released_at timestamptz not null default now(),
    content     text not null default '',
    created_at  timestamptz not null default now()
);

create index if not exists changelog_released_at_idx on public.changelog (released_at desc);

-- 所有人（含未登入）皆可讀取；寫入僅限 Dashboard / service_role（不開放前端）
alter table public.changelog enable row level security;
drop policy if exists "changelog public read" on public.changelog;
create policy "changelog public read" on public.changelog for select using (true);

-- ── 初始種子資料（僅一般使用者功能，可自行增修）──
insert into public.changelog (version, released_at, content) values
('1.4.0', '2026-07-22 15:00+08',
'點擊標題列版本號可查看更新日誌'),
('1.3.0', '2026-07-22 13:38+08',
'FFLogs 匯入可選擇「全部匯入」或「指定單一職業」
調整隊伍某位置職業前，會先提醒將清空該位置的排軸'),
('1.2.0', '2026-07-21 22:09+08',
'新增副本快速選擇卡片，選副本更直覺
FFLogs 匯入時自動匹配對應副本'),
('1.1.0', '2026-07-21 14:52+08',
'職業技能面板可標記「收合時要顯示哪些技能」'),
('1.0.0', '2026-07-21 09:36+08',
'標題列顯示目前版本號
右下角新增版本更新通知，有新版時提醒重新整理');
