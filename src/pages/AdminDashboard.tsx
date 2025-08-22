import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, LogOut, Save, X, Upload, FileText } from 'lucide-react';

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

const AdminDashboard = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    fetchFAQs();
  }, [user, navigate]);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch FAQs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFAQ = () => {
    setEditingFaq({
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
    setIsCreating(true);
  };

  const handleSaveFAQ = async (faq: FAQ) => {
    try {
      if (isCreating) {
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
      } else {
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
      }

      setEditingFaq(null);
      setIsCreating(false);
      fetchFAQs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "FAQ deleted successfully" });
      fetchFAQs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse CSV header
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const requiredHeaders = ['slug', 'question', 'answer'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const csvData = [];
      
      // Parse each row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length !== headers.length) continue;
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Process the data
        const faqData = {
          slug: row.slug,
          question: row.question,
          answer: row.answer,
          tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
          affected_models: row.affected_models ? row.affected_models.split(';').map((m: string) => m.trim()).filter(Boolean) : [],
          is_published: row.is_published === 'true' || row.is_published === '1' || !row.is_published,
          competitor_info: row.competitor_info ? JSON.parse(row.competitor_info) : null,
        };

        csvData.push(faqData);
      }

      // Process upserts
      let createdCount = 0;
      let updatedCount = 0;

      for (const faqData of csvData) {
        // Check if FAQ exists
        const { data: existingFaq, error: checkError } = await supabase
          .from('faqs')
          .select('id')
          .eq('slug', faqData.slug)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing FAQ:', checkError);
          continue;
        }

        if (existingFaq) {
          // Update existing FAQ
          const { error: updateError } = await supabase
            .from('faqs')
            .update(faqData)
            .eq('slug', faqData.slug);

          if (updateError) {
            console.error('Error updating FAQ:', updateError);
          } else {
            updatedCount++;
          }
        } else {
          // Insert new FAQ
          const { error: insertError } = await supabase
            .from('faqs')
            .insert([faqData]);

          if (insertError) {
            console.error('Error inserting FAQ:', insertError);
          } else {
            createdCount++;
          }
        }
      }

      toast({
        title: "Success",
        description: `CSV processed: ${createdCount} created, ${updatedCount} updated`,
      });

      fetchFAQs();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process CSV",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tesla-dark via-background to-tesla-dark/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tesla-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tesla-dark via-background to-tesla-dark/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-tesla-accent to-tesla-accent/80 bg-clip-text text-transparent">
              FAQ Management Dashboard
            </h1>
            <p className="text-muted-foreground">Manage Tesla Malaysia FAQ content</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              CSV format: slug, question, answer, tags (semicolon-separated), affected_models (semicolon-separated), is_published (true/false)
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button
              onClick={() => document.getElementById('csv-upload')?.click()}
              variant="outline"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </>
              )}
            </Button>
            <Button onClick={handleCreateFAQ} variant="tesla">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="grid gap-6">
          {faqs.map((faq) => (
            <Card key={faq.id} className="bg-background/95 backdrop-blur-sm border-tesla-accent/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{faq.question}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {faq.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {faq.affected_models.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => setEditingFaq(faq)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {faq.answer.substring(0, 200)}...
                </p>
                <div className="mt-2">
                  <Badge variant={faq.is_published ? "default" : "destructive"}>
                    {faq.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        {editingFaq && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-background">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {isCreating ? 'Create New FAQ' : 'Edit FAQ'}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setEditingFaq(null);
                      setIsCreating(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={editingFaq.slug}
                    onChange={(e) => setEditingFaq({ ...editingFaq, slug: e.target.value })}
                    placeholder="unique-slug-for-url"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Input
                    value={editingFaq.question}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    placeholder="Enter the FAQ question"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Answer</label>
                  <Textarea
                    value={editingFaq.answer}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    placeholder="Enter the detailed answer (Markdown supported)"
                    rows={10}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={editingFaq.tags.join(', ')}
                    onChange={(e) => setEditingFaq({ 
                      ...editingFaq, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="charging, cost, government"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Affected Models (comma-separated)</label>
                  <Input
                    value={editingFaq.affected_models.join(', ')}
                    onChange={(e) => setEditingFaq({ 
                      ...editingFaq, 
                      affected_models: e.target.value.split(',').map(model => model.trim()).filter(Boolean)
                    })}
                    placeholder="Model 3, Model Y, Model S"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={editingFaq.is_published}
                    onChange={(e) => setEditingFaq({ ...editingFaq, is_published: e.target.checked })}
                  />
                  <label htmlFor="published" className="text-sm font-medium">
                    Published
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleSaveFAQ(editingFaq)} variant="tesla">
                    <Save className="w-4 h-4 mr-2" />
                    {isCreating ? 'Create' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingFaq(null);
                      setIsCreating(false);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;