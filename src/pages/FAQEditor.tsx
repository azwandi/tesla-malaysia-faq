import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  tags: string[];
  affected_models: string[];
  competitor_info?: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const FAQEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [modelsInput, setModelsInput] = useState('');
  const isEditing = !!slug;
  
  // localStorage key for persisting form data
  const storageKey = `faq-editor-${isEditing ? slug : 'new'}`;

  // Save form data to localStorage whenever faq changes
  useEffect(() => {
    if (faq && !loading) {
      localStorage.setItem(storageKey, JSON.stringify(faq));
    }
  }, [faq, storageKey, loading]);

  // Sync input states with FAQ data
  useEffect(() => {
    if (faq) {
      setTagsInput(faq.tags.join(', '));
      setModelsInput(faq.affected_models.join(', '));
    }
  }, [faq]);

  // Clear localStorage on unmount or when navigating away
  useEffect(() => {
    return () => {
      // Don't clear if we're just switching tabs, only on navigation
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    if (isEditing) {
      fetchFAQ();
    } else {
      // Check for saved draft in localStorage first
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setFaq(parsedDraft);
          setLoading(false);
          toast({
            title: "Draft Restored",
            description: "Your unsaved changes have been restored.",
          });
          return;
        } catch (error) {
          // Invalid saved data, proceed with new FAQ
          localStorage.removeItem(storageKey);
        }
      }
      
      // Create new FAQ
      setFaq({
        id: '',
        slug: '',
        question: '',
        answer: '',
        tags: [],
        affected_models: [],
        competitor_info: null,
        is_published: true,
        created_at: '',
        updated_at: '',
      });
      setLoading(false);
    }
  }, [user, navigate, slug, isEditing, storageKey, toast]);

  const fetchFAQ = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      // Check if there's a saved draft for this FAQ
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setFaq(parsedDraft);
          toast({
            title: "Draft Restored",
            description: "Your unsaved changes have been restored.",
          });
        } catch (error) {
          // Invalid saved data, use original data
          localStorage.removeItem(storageKey);
          setFaq(data);
        }
      } else {
        setFaq(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch FAQ",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!faq) return;

    setSaving(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('faqs')
          .update({
            slug: faq.slug,
            question: faq.question,
            answer: faq.answer,
            tags: faq.tags,
            affected_models: faq.affected_models,
            competitor_info: faq.competitor_info,
            is_published: faq.is_published,
          })
          .eq('id', faq.id);

        if (error) throw error;
        toast({ title: "Success", description: "FAQ updated successfully" });
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([{
            slug: faq.slug,
            question: faq.question,
            answer: faq.answer,
            tags: faq.tags,
            affected_models: faq.affected_models,
            competitor_info: faq.competitor_info,
            is_published: faq.is_published,
          }]);

        if (error) throw error;
        toast({ title: "Success", description: "FAQ created successfully" });
      }

      // Clear localStorage after successful save
      localStorage.removeItem(storageKey);
      navigate('/admin');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear localStorage when canceling
    localStorage.removeItem(storageKey);
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FAQ editor...</p>
        </div>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">FAQ not found</p>
          <Link to="/admin">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit FAQ' : 'Create New FAQ'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update the FAQ information below' : 'Fill in the details to create a new FAQ'}
            </p>
          </div>
          <Link to="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        {/* Editor Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              FAQ Details
              <div className="flex items-center space-x-2">
                <Switch
                  checked={faq.is_published}
                  onCheckedChange={(checked) => setFaq({ ...faq, is_published: checked })}
                />
                <label className="text-sm font-medium">
                  {faq.is_published ? 'Published' : 'Draft'}
                </label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Slug</label>
              <Input
                value={faq.slug}
                onChange={(e) => setFaq({ ...faq, slug: e.target.value })}
                placeholder="unique-slug-for-url"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used in the URL: /faq/{faq.slug || 'your-slug-here'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Input
                value={faq.question}
                onChange={(e) => setFaq({ ...faq, question: e.target.value })}
                placeholder="Enter the FAQ question"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Answer</label>
              <Textarea
                value={faq.answer}
                onChange={(e) => setFaq({ ...faq, answer: e.target.value })}
                placeholder="Enter the detailed answer (Markdown supported)"
                rows={12}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports Markdown formatting for rich text content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onBlur={() => setFaq({ 
                    ...faq, 
                    tags: tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="charging, cost, government"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Affected Models (comma-separated)</label>
                <Input
                  value={modelsInput}
                  onChange={(e) => setModelsInput(e.target.value)}
                  onBlur={() => setFaq({ 
                    ...faq, 
                    affected_models: modelsInput.split(',').map(model => model.trim()).filter(Boolean)
                  })}
                  placeholder="Model 3, Model Y, Model S"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Competitor Info (JSON)</label>
              <Textarea
                value={faq.competitor_info ? JSON.stringify(faq.competitor_info, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                    setFaq({ ...faq, competitor_info: parsed });
                  } catch {
                    // Invalid JSON, keep typing
                  }
                }}
                placeholder='{"advantage": "Tesla offers better range", "comparison": "30% more efficient"}'
                rows={4}
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional JSON object for competitive advantage information
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="min-w-24"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create FAQ')}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQEditor;
