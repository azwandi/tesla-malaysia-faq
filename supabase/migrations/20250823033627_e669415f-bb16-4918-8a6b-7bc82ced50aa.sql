-- Add unique constraint on slug column to enable proper upsert operations
ALTER TABLE public.faqs 
ADD CONSTRAINT faqs_slug_unique UNIQUE (slug);

-- Create trigger for automatic timestamp updates on the faqs table
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();