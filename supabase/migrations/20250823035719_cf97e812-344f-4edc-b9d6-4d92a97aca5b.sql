-- Update the SELECT policy to allow authenticated users to see all FAQs
-- while still restricting non-authenticated users to only published FAQs
DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON public.faqs;

CREATE POLICY "Public can view published FAQs, authenticated users can view all" 
ON public.faqs 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN true  -- Authenticated users see everything
    ELSE is_published = true               -- Public users only see published
  END
);