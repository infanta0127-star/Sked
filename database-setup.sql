-- ============================================================
-- FFXIV Battle Timeline - Optimized Supabase Schema
-- Run this in your Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop old tables if they exist (clean slate)
drop table if exists public.bookmarks cascade;
drop table if exists public.individual_plans cascade;
drop table if exists public.team_plans cascade;
drop table if exists public.profiles cascade;

-- ── 1. profiles（User Profiles synced via Discord OAuth） ──
create table public.profiles (
    id              uuid references auth.users on delete cascade primary key,
    discord_id      text,
    discord_username text not null default '',
    discord_avatar  text,
    created_at      timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "profiles_self" on public.profiles
    for all using (auth.uid() = id);

-- ── 2. team_plans（Tab 1 - Team Mitigation Plans） ──
create table public.team_plans (
    id                uuid        default gen_random_uuid() primary key,
    owner_id          uuid        references public.profiles(id) on delete cascade not null,
    duty_key          text        not null,
    name              text        not null default '未命名團隊減排',
    party             text[]      not null,
    mits              jsonb       not null default '[]',
    custom_mechanics  jsonb       not null default '[]',
    selected_variants jsonb       not null default '{}',
    edit_token        text        unique not null default encode(gen_random_bytes(16), 'hex'),
    read_token        text        unique not null default encode(gen_random_bytes(20), 'hex'),
    created_at        timestamptz default now(),
    updated_at        timestamptz default now()
);
alter table public.team_plans enable row level security;

create policy "team_plans_owner" on public.team_plans
    for all using (auth.uid() = owner_id);

-- ── 3. individual_plans（Tab 2 - Individual Rotation Plans） ──
create table public.individual_plans (
    id            uuid        default gen_random_uuid() primary key,
    owner_id      uuid        references public.profiles(id) on delete cascade not null,
    team_plan_id  uuid        references public.team_plans(id) on delete set null,
    job_id        text        not null,
    name          text        not null default '未命名個人排軸',
    skills        jsonb       not null default '[]',
    gcd           numeric(3,2) not null default 2.50,
    edit_token    text        unique not null default encode(gen_random_bytes(16), 'hex'),
    read_token    text        unique not null default encode(gen_random_bytes(20), 'hex'),
    created_at    timestamptz default now(),
    updated_at    timestamptz default now()
);
alter table public.individual_plans enable row level security;

create policy "individual_plans_owner" on public.individual_plans
    for all using (auth.uid() = owner_id);

-- ── 4. bookmarks（My Bookmarks for both Team and Individual plans） ──
create table public.bookmarks (
    id          uuid        default gen_random_uuid() primary key,
    user_id     uuid        references public.profiles(id) on delete cascade not null,
    plan_type   text        not null check (plan_type in ('team', 'individual')),
    plan_id     uuid        not null,
    token       text        not null,
    token_type  text        not null check (token_type in ('edit', 'read')),
    created_at  timestamptz default now(),
    unique (user_id, plan_id)
);
alter table public.bookmarks enable row level security;

create policy "bookmarks_self" on public.bookmarks
    for all using (auth.uid() = user_id);

-- ── 5. Auto-update updated_at Trigger ──
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger team_plans_set_updated_at
    before update on public.team_plans
    for each row execute procedure public.set_updated_at();

create trigger individual_plans_set_updated_at
    before update on public.individual_plans
    for each row execute procedure public.set_updated_at();

-- ── 6. Discord OAuth Post-Signup Profile Creator ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
    insert into public.profiles (id, discord_id, discord_username, discord_avatar)
    values (
        new.id,
        new.raw_user_meta_data->>'provider_id',
        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'user_name',
            ''
        ),
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ── 7. Token-based RPC helper functions (bypasses RLS for shared URLs) ──

-- 7a. Team Plan RPCs
create or replace function public.get_team_plan_by_token(p_token text)
returns table (
    id                uuid,
    owner_id          uuid,
    duty_key          text,
    name              text,
    party             text[],
    mits              jsonb,
    custom_mechanics  jsonb,
    selected_variants jsonb,
    edit_token        text,
    read_token        text,
    created_at        timestamptz,
    updated_at        timestamptz,
    token_type        text
)
language sql security definer as $$
    select
        tp.id, tp.owner_id, tp.duty_key, tp.name, tp.party, tp.mits,
        tp.custom_mechanics, tp.selected_variants, tp.edit_token, tp.read_token,
        tp.created_at, tp.updated_at,
        case when tp.edit_token = p_token then 'edit' else 'read' end
    from public.team_plans tp
    where tp.edit_token = p_token or tp.read_token = p_token
    limit 1;
$$;

create or replace function public.update_team_plan_by_edit_token(
    p_token            text,
    p_name             text,
    p_party            text[],
    p_mits             jsonb,
    p_custom_mechanics jsonb,
    p_selected_variants jsonb
)
returns void
language sql security definer as $$
    update public.team_plans
    set
        name = coalesce(p_name, name),
        party = coalesce(p_party, party),
        mits = coalesce(p_mits, mits),
        custom_mechanics = coalesce(p_custom_mechanics, custom_mechanics),
        selected_variants = coalesce(p_selected_variants, selected_variants)
    where edit_token = p_token;
$$;

-- 7b. Individual Plan RPCs
create or replace function public.get_individual_plan_by_token(p_token text)
returns table (
    id            uuid,
    owner_id      uuid,
    team_plan_id  uuid,
    job_id        text,
    name          text,
    skills        jsonb,
    gcd           numeric(3,2),
    edit_token    text,
    read_token    text,
    created_at    timestamptz,
    updated_at    timestamptz,
    token_type    text
)
language sql security definer as $$
    select
        ip.id, ip.owner_id, ip.team_plan_id, ip.job_id, ip.name, ip.skills, ip.gcd,
        ip.edit_token, ip.read_token, ip.created_at, ip.updated_at,
        case when ip.edit_token = p_token then 'edit' else 'read' end
    from public.individual_plans ip
    where ip.edit_token = p_token or ip.read_token = p_token
    limit 1;
$$;

create or replace function public.update_individual_plan_by_edit_token(
    p_token       text,
    p_name        text,
    p_skills      jsonb,
    p_gcd         numeric(3,2),
    p_team_plan_id uuid default null
)
returns void
language sql security definer as $$
    update public.individual_plans
    set
        name = coalesce(p_name, name),
        skills = coalesce(p_skills, skills),
        gcd = coalesce(p_gcd, gcd),
        team_plan_id = coalesce(p_team_plan_id, team_plan_id)
    where edit_token = p_token;
$$;

-- ── 8. RPC: Fetch Bookmarked Plans ──
create or replace function public.fetch_bookmarked_plans(p_user_id uuid, p_plan_type text)
returns table (
    plan_id     uuid,
    duty_key    text,
    job_id      text,
    name        text,
    token       text,
    token_type  text,
    updated_at  timestamptz,
    owner_id    uuid
)
language plpgsql security definer as $$
begin
    if p_plan_type = 'team' then
        return query
        select
            tp.id as plan_id,
            tp.duty_key,
            null::text as job_id,
            tp.name,
            b.token,
            b.token_type,
            tp.updated_at,
            tp.owner_id
        from public.bookmarks b
        join public.team_plans tp on tp.id = b.plan_id
        where b.user_id = p_user_id and b.plan_type = 'team'
        order by tp.updated_at desc;
    else
        return query
        select
            ip.id as plan_id,
            null::text as duty_key,
            ip.job_id,
            ip.name,
            b.token,
            b.token_type,
            ip.updated_at,
            ip.owner_id
        from public.bookmarks b
        join public.individual_plans ip on ip.id = b.plan_id
        where b.user_id = p_user_id and b.plan_type = 'individual'
        order by ip.updated_at desc;
    end if;
end;
$$;

-- Indexes for performance
create index if not exists team_plans_owner_id_idx  on public.team_plans(owner_id);
create index if not exists team_plans_edit_token_idx on public.team_plans(edit_token);
create index if not exists team_plans_read_token_idx on public.team_plans(read_token);
create index if not exists individual_plans_owner_id_idx  on public.individual_plans(owner_id);
create index if not exists individual_plans_edit_token_idx on public.individual_plans(edit_token);
create index if not exists individual_plans_read_token_idx on public.individual_plans(read_token);
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
