-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faq_id UUID NOT NULL,
  contact_info TEXT,
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved'))
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all feedback" 
ON public.feedback 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add index for better performance
CREATE INDEX idx_feedback_faq_id ON public.feedback(faq_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);