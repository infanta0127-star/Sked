-- ============================================================
-- Add default_mit_party column to public.profiles table
-- Run this in your Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.profiles add column if not exists default_mit_party text[];
