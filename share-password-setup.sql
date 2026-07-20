-- ============================================================
-- Add share_password support and update get_team_plan_by_token RPC
-- Run this in your Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Add share_password column to public.team_plans if not exists
alter table public.team_plans add column if not exists share_password text;

-- 2. Drop the old function
drop function if exists public.get_team_plan_by_token(text);

-- 3. Create the updated function with password protection support
create or replace function public.get_team_plan_by_token(p_token text, p_password text default null)
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
    token_type        text,
    password_required boolean,
    password_correct  boolean
)
language plpgsql security definer as $$
declare
    v_plan public.team_plans%rowtype;
begin
    select * into v_plan
    from public.team_plans tp
    where tp.edit_token = p_token or tp.read_token = p_token
    limit 1;
    
    if not found then
        return;
    end if;
    
    -- Check if password is set
    if v_plan.share_password is null or v_plan.share_password = '' then
        return query
        select
            v_plan.id, v_plan.owner_id, v_plan.duty_key, v_plan.name, v_plan.party, v_plan.mits,
            v_plan.custom_mechanics, v_plan.selected_variants, v_plan.edit_token, v_plan.read_token,
            v_plan.created_at, v_plan.updated_at,
            case when v_plan.edit_token = p_token then 'edit'::text else 'read'::text end,
            false, true;
    else
        -- If password matches (case-insensitive and trimmed)
        if upper(trim(p_password)) = upper(trim(v_plan.share_password)) then
            return query
            select
                v_plan.id, v_plan.owner_id, v_plan.duty_key, v_plan.name, v_plan.party, v_plan.mits,
                v_plan.custom_mechanics, v_plan.selected_variants, v_plan.edit_token, v_plan.read_token,
                v_plan.created_at, v_plan.updated_at,
                case when v_plan.edit_token = p_token then 'edit'::text else 'read'::text end,
                true, true;
        else
            -- Password is required but incorrect or not provided: return metadata only (empty plan contents!)
            return query
            select
                v_plan.id, v_plan.owner_id, v_plan.duty_key, v_plan.name, 
                array[]::text[], '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, 
                v_plan.edit_token, v_plan.read_token,
                v_plan.created_at, v_plan.updated_at,
                case when v_plan.edit_token = p_token then 'edit'::text else 'read'::text end,
                true, false;
        end if;
    end if;
end;
$$;
