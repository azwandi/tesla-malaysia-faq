import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  tags: string[];
  affected_models: string[];
  category: string;
  competitor_info?: {
    comparison?: string;
    [key: string]: any;
  };
  is_published?: boolean;
  featured?: boolean;
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

// Fetch all unique tags from published FAQs
export const fetchAllTags = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('tags')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Extract and flatten all tags, then get unique ones
  const allTags = (data || []).flatMap(faq => faq.tags || []);
  return [...new Set(allTags)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

// Search FAQs by tag
export const searchFAQsByTag = async (tag: string): Promise<FAQ[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching FAQs by tag:', error);
    return [];
  }

  return (data || []).map(faq => ({
    ...faq,
    competitor_info: faq.competitor_info as FAQ['competitor_info']
  }));
};

// Search FAQs by category
export const searchFAQsByCategory = async (category: string): Promise<FAQ[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching FAQs by category:', error);
    return [];
  }

  return (data || []).map(faq => ({
    ...faq,
    competitor_info: faq.competitor_info as FAQ['competitor_info']
  }));
};

// Fetch featured FAQs for homepage
export const fetchFeaturedFAQs = async (): Promise<FAQ[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .eq('featured', true)
    .order('updated_at', { ascending: false })
    .limit(9);

  if (error) {
    console.error('Error fetching featured FAQs:', error);
    return [];
  }

  return (data || []).map(faq => ({
    ...faq,
    competitor_info: faq.competitor_info as FAQ['competitor_info']
  }));
};

export const faqCategories = [
  "Buying & Ownership",
  "Charging & Battery", 
  "Driving & Features",
  "Maintenance & Service",
  "Safety & Security",
  "Models & Variants",
  "Costs & Savings",
  "Fun & Extras"
];

// Fetch total count of published FAQs
export const fetchFAQsCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('faqs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching FAQ count:', error);
    return 0;
  }

  return count || 0;
};

// Fetch FAQ count by category
export const fetchFAQsCountByCategory = async (category: string): Promise<number> => {
  const { count, error } = await supabase
    .from('faqs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .eq('category', category);

  if (error) {
    console.error('Error fetching FAQ count by category:', error);
    return 0;
  }

  return count || 0;
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