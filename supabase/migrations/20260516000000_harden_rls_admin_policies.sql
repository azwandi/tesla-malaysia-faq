-- Harden RLS: introduce admin_users table and restrict write access to admins only.
-- Previously, write policies granted access to all authenticated users, meaning
-- any account (including self-registered ones) could INSERT/UPDATE/DELETE FAQs.

-- 1. Create admin_users table keyed by auth.uid()
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view the admin_users table itself (bootstrapped via service role)
CREATE POLICY "Admins can view admin_users"
ON public.admin_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Replace is_admin() with a real check against admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- 3. Drop the overly-permissive write policies on faqs
DROP POLICY IF EXISTS "Authenticated users can insert FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Authenticated users can update FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Authenticated users can delete FAQs" ON public.faqs;

-- 4. Re-create write policies restricted to admins only
CREATE POLICY "Admins can insert FAQs"
ON public.faqs FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update FAQs"
ON public.faqs FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete FAQs"
ON public.faqs FOR DELETE
TO authenticated
USING (public.is_admin());

-- 5. Seed existing authenticated users as admins
-- IMPORTANT: After deploying this migration, insert your admin user(s) manually:
--   INSERT INTO public.admin_users (user_id) VALUES ('<your-auth-user-uuid>');
-- or via the Supabase dashboard: Table Editor → admin_users → Insert row.
