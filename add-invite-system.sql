-- ============================================================
-- FFXIV Sked - Invite Code System Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. Update profiles table ──
alter table public.profiles
    add column if not exists is_active   boolean default true,
    add column if not exists role        text    default 'user',
    add column if not exists invite_code text;

-- ── 2. Update handle_new_user trigger to save invite_code from metadata ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
    insert into public.profiles (id, invite_code)
    values (
        new.id,
        new.raw_user_meta_data->>'invite_code'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

-- ── 3. Create invite_codes table ──
create table if not exists public.invite_codes (
    id         uuid        default gen_random_uuid() primary key,
    code       text        unique not null,
    is_active  boolean     default true,
    created_by uuid        references public.profiles(id),
    created_at timestamptz default now()
);
alter table public.invite_codes enable row level security;

-- Anyone can read active invite codes (for validation during signup)
drop policy if exists "invite_codes_read_active" on public.invite_codes;
create policy "invite_codes_read_active" on public.invite_codes
    for select using (is_active = true);

-- ── 4. Admin RPC: Get all users ──
create or replace function public.admin_get_all_users()
returns table (
    id          uuid,
    email       text,
    is_active   boolean,
    role        text,
    invite_code text,
    created_at  timestamptz
)
language plpgsql security definer as $$
begin
    if not exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    ) then
        raise exception 'Unauthorized: admin only';
    end if;

    return query
    select
        p.id,
        u.email,
        p.is_active,
        p.role,
        p.invite_code,
        p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

-- ── 5. Admin RPC: Toggle user active status ──
create or replace function public.admin_toggle_user(p_user_id uuid, p_is_active boolean)
returns void
language plpgsql security definer as $$
begin
    if not exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    ) then
        raise exception 'Unauthorized: admin only';
    end if;

    update public.profiles
    set is_active = p_is_active
    where id = p_user_id;
end;
$$;

-- ── 6. Admin RPC: Get all invite codes ──
create or replace function public.admin_get_invite_codes()
returns table (
    id         uuid,
    code       text,
    is_active  boolean,
    created_at timestamptz
)
language plpgsql security definer as $$
begin
    if not exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    ) then
        raise exception 'Unauthorized: admin only';
    end if;

    return query
    select ic.id, ic.code, ic.is_active, ic.created_at
    from public.invite_codes ic
    order by ic.created_at desc;
end;
$$;

-- ── 7. Admin RPC: Regenerate invite code ──
create or replace function public.admin_regenerate_invite_code()
returns text
language plpgsql security definer as $$
declare
    new_code text;
begin
    if not exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    ) then
        raise exception 'Unauthorized: admin only';
    end if;

    -- Deactivate all existing active codes
    update public.invite_codes set is_active = false where is_active = true;

    -- Generate new 6-char alphanumeric code
    new_code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 6));
    new_code := regexp_replace(new_code, '[^A-Z0-9]', '', 'g');
    while length(new_code) < 6 loop
        new_code := new_code || chr(65 + floor(random() * 26)::int);
    end loop;
    new_code := substring(new_code from 1 for 6);

    insert into public.invite_codes (code, created_by)
    values (new_code, auth.uid());

    return new_code;
end;
$$;

-- ── 8. Insert initial invite code ──
insert into public.invite_codes (code, is_active)
values ('A3F7K2', true)
on conflict (code) do nothing;
