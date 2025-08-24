import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  tags: string[];
  affected_models: string[];
  competitor_info?: {
    comparison?: string;
    [key: string]: any;
  };
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fetch FAQs from Supabase
export const fetchFAQs = async (): Promise<FAQ[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }

  return (data || []).map(faq => ({
    ...faq,
    competitor_info: faq.competitor_info as FAQ['competitor_info']
  }));
};

export const searchFAQs = async (query: string): Promise<FAQ[]> => {
  if (!query.trim()) {
    return fetchFAQs();
  }
  
  const searchTerm = query.toLowerCase();
  
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching FAQs:', error);
    return [];
  }

  return (data || []).map(faq => ({
    ...faq,
    competitor_info: faq.competitor_info as FAQ['competitor_info']
  }));
};

export const getFAQBySlug = async (slug: string): Promise<FAQ | null> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching FAQ by slug:', error);
    return null;
  }

  return data ? {
    ...data,
    competitor_info: data.competitor_info as FAQ['competitor_info']
  } : null;
};

export const popularSearchTerms = [
  "charging cost",
  "Model 3 and Model Y",
  "maintenance cost",
  "Autopilot",
  "warranty",
  "insurance",
  "tax",
  "FSD",
  "battery",
  "range",
  "safety"
];