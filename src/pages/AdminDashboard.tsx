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
import { Plus, Edit2, Trash2, LogOut, Save, X, Upload, FileText, MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface Feedback {
  id: string;
  faq_id: string;
  contact_info: string | null;
  feedback_text: string;
  status: 'new' | 'reviewed' | 'resolved';
  created_at: string;
  faqs?: {
    question: string;
    slug: string;
  };
}

const AdminDashboard = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
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
    fetchFeedback();
  }, [user, navigate]);

  const fetchFeedback = async () => {
    try {
      // Fetch feedback first
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // If we have feedback, fetch the related FAQ data
      if (feedbackData && feedbackData.length > 0) {
        const faqIds = [...new Set(feedbackData.map(fb => fb.faq_id))];
        
        const { data: faqData, error: faqError } = await supabase
          .from('faqs')
          .select('id, question, slug')
          .in('id', faqIds);

        if (faqError) throw faqError;

        // Create a map for quick lookup
        const faqMap = new Map(faqData?.map(faq => [faq.id, faq]) || []);

        // Enhance feedback with FAQ data
        const enhancedFeedback = feedbackData.map(fb => ({
          ...fb,
          faqs: faqMap.get(fb.faq_id)
        })) as Feedback[];

        setFeedback(enhancedFeedback);
      } else {
        setFeedback([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      });
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, status: 'new' | 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', feedbackId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Feedback marked as ${status}`,
      });
      
      fetchFeedback();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      });
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
      
      fetchFeedback();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      });
    }
  };

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

  const handleTogglePublished = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_published: !faq.is_published })
        .eq('id', faq.id);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `FAQ ${!faq.is_published ? 'published' : 'unpublished'} successfully` 
      });
      fetchFAQs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update FAQ status",
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to upload FAQs",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Function to parse CSV line properly handling quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        // Add the last field
        result.push(current.trim());
        return result;
      };

      // Parse CSV header
      const headers = parseCSVLine(lines[0]);
      const requiredHeaders = ['slug', 'question', 'answer'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const csvData = [];
      const slugsInCSV = new Set<string>();
      const errors: string[] = [];
      
      // Parse each row and check for duplicates within CSV
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
          continue;
        }
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Validate required fields
        if (!row.slug || !row.question || !row.answer) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Check for duplicate slugs within the CSV
        if (slugsInCSV.has(row.slug)) {
          errors.push(`Row ${i + 1}: Duplicate slug '${row.slug}' found in CSV`);
          continue;
        }
        slugsInCSV.add(row.slug);

        try {
          // Process the data
          const faqData = {
            slug: row.slug,
            question: row.question,
            answer: row.answer,
            tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
            affected_models: row.affected_models ? row.affected_models.split(';').map((m: string) => m.trim()).filter(Boolean) : [],
            is_published: row.is_published === 'true' || row.is_published === '1' || !row.is_published,
            competitor_info: row.competitor_info ? (row.competitor_info.trim() ? JSON.parse(row.competitor_info) : null) : null,
          };

          csvData.push({ ...faqData, rowNumber: i + 1 });
        } catch (parseError) {
          errors.push(`Row ${i + 1}: Invalid JSON in competitor_info`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`CSV validation errors:\n${errors.join('\n')}`);
      }

      // Get all existing FAQs to check for conflicts
      const { data: existingFaqs, error: fetchError } = await supabase
        .from('faqs')
        .select('slug')
        .in('slug', Array.from(slugsInCSV));

      if (fetchError) {
        throw new Error(`Failed to check existing FAQs: ${fetchError.message}`);
      }

      const existingSlugs = new Set(existingFaqs?.map(f => f.slug) || []);

      // Process upserts using Supabase's native upsert functionality
      let createdCount = 0;
      let updatedCount = 0;
      const processingErrors: string[] = [];

      // Process in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (const faqData of batch) {
          const { rowNumber, ...faqRecord } = faqData;
          
          try {
            // Use upsert with on_conflict to handle duplicates
            const { data, error } = await supabase
              .from('faqs')
              .upsert(faqRecord, { 
                onConflict: 'slug',
                ignoreDuplicates: false 
              })
              .select('id');

            if (error) {
              processingErrors.push(`Row ${rowNumber}: ${error.message}`);
            } else {
              // Check if this was an insert or update by seeing if slug existed
              const wasExisting = existingSlugs.has(faqRecord.slug);
              if (wasExisting) {
                updatedCount++;
              } else {
                createdCount++;
              }
            }
          } catch (error) {
            processingErrors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      const successMessage = `CSV processed: ${createdCount} created, ${updatedCount} updated`;
      const errorMessage = processingErrors.length > 0 ? `\n\nErrors:\n${processingErrors.slice(0, 5).join('\n')}${processingErrors.length > 5 ? '\n...and more' : ''}` : '';

      toast({
        title: processingErrors.length === 0 ? "Success" : "Partially Completed",
        description: successMessage + errorMessage,
        variant: processingErrors.length === 0 ? "default" : "destructive",
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

  if (isLoading || isFeedbackLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage Tesla Malaysia FAQ content and feedback</p>
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
            <Button onClick={handleCreateFAQ} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
            <Button 
              onClick={() => window.open('/', '_blank')} 
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faqs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              FAQs ({faqs.length})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback ({feedback.filter(f => f.status === 'new').length} new)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="mt-6">
            {/* FAQ List */}
            <div className="grid gap-6">
              {faqs.map((faq) => (
                <Card key={faq.id} className="bg-card border-border">
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
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant={faq.is_published ? "default" : "destructive"}>
                        {faq.is_published ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Quick toggle:</span>
                        <Switch
                          checked={faq.is_published}
                          onCheckedChange={() => handleTogglePublished(faq)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            {/* Feedback List */}
            <div className="grid gap-4">
              {feedback.map((fb) => (
                <Card key={fb.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={fb.status === 'new' ? 'destructive' : fb.status === 'reviewed' ? 'secondary' : 'default'}
                          >
                            {fb.status.charAt(0).toUpperCase() + fb.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-muted-foreground">FAQ: </span>
                          <span className="text-sm text-foreground">{fb.faqs?.question}</span>
                        </div>
                        {fb.contact_info && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Contact: </span>
                            <span className="text-sm text-foreground">{fb.contact_info}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {fb.status !== 'reviewed' && (
                          <Button
                            onClick={() => updateFeedbackStatus(fb.id, 'reviewed')}
                            variant="outline"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {fb.status !== 'resolved' && (
                          <Button
                            onClick={() => updateFeedbackStatus(fb.id, 'resolved')}
                            variant="default"
                            size="sm"
                          >
                            Resolve
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteFeedback(fb.id)}
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
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {fb.feedback_text}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {feedback.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback received yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
                  <Button onClick={() => handleSaveFAQ(editingFaq)} variant="default">
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