-- Add featured column to faqs table
ALTER TABLE public.faqs 
ADD COLUMN featured boolean NOT NULL DEFAULT false;