-- Add unique constraint on slug column to enable proper upsert operations
ALTER TABLE public.faqs 
ADD CONSTRAINT faqs_slug_unique UNIQUE (slug);