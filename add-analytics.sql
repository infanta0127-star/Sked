-- ── 1. Create analytics_events Table ──
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id     TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_name     TEXT NOT NULL,
    event_data     JSONB DEFAULT '{}'::jsonb
);

-- ── 2. Enable Row Level Security (RLS) ──
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ── 3. Drop existing policies if they exist ──
DROP POLICY IF EXISTS "analytics_events_insert_all" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_select_admin" ON public.analytics_events;

-- ── 4. Create Security Policies ──
-- Allow anyone (public/authenticated) to insert analytics records
CREATE POLICY "analytics_events_insert_all"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- Only administrator users (role = 'admin' in public.profiles table) can select records
CREATE POLICY "analytics_events_select_admin"
    ON public.analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
