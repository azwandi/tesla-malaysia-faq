-- Add category column to faqs table
ALTER TABLE public.faqs 
ADD COLUMN category TEXT;

-- Add check constraint to ensure only valid categories are used
ALTER TABLE public.faqs 
ADD CONSTRAINT faqs_category_check 
CHECK (
  category IN (
    'Buying & Ownership',
    'Charging & Battery', 
    'Driving & Features',
    'Maintenance & Service',
    'Safety & Security',
    'Models & Variants',
    'Costs & Savings',
    'Fun & Extras'
  )
);

-- Set a default category for existing FAQs (optional - can be updated later)
UPDATE public.faqs 
SET category = 'Buying & Ownership' 
WHERE category IS NULL;