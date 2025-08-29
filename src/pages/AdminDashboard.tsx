import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, LogOut, Upload, FileText, MessageSquare, CheckCircle, ExternalLink, Search, Tag, Filter, X, Car } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAllTags } from '@/data/faqs';
import { AdminHeader } from '@/components/AdminHeader';

interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  tags: string[];
  affected_models: string[];
  competitor_info?: any;
  is_published: boolean;
  featured: boolean;
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
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    fetchFAQs();
    fetchFeedback();
    loadTags();
  }, [user, navigate]);

  const loadTags = async () => {
    try {
      const tags = await fetchAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  // Filter FAQs whenever filters change
  useEffect(() => {
    let filtered = [...faqs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(faq => faq.tags.includes(selectedTag));
    }

    // Apply published status filter
    if (publishedFilter !== 'all') {
      filtered = filtered.filter(faq => 
        publishedFilter === 'published' ? faq.is_published : !faq.is_published
      );
    }

    setFilteredFaqs(filtered);
  }, [faqs, searchQuery, selectedTag, publishedFilter]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setPublishedFilter('all');
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleStatusFilter = (status: 'all' | 'published' | 'draft') => {
    setPublishedFilter(status);
  };

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

  const handleToggleFeatured = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ featured: !faq.featured })
        .eq('id', faq.id);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `FAQ ${!faq.featured ? 'featured' : 'unfeatured'} successfully` 
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ featured status:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update FAQ featured status",
        variant: "destructive" 
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
      <AdminHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground mb-1">Manage Tesla Malaysia FAQ content and feedback</p>
          <p className="text-xs text-muted-foreground/80">
            CSV format: slug, question, answer, tags (semicolon-separated), affected_models (semicolon-separated), is_published (true/false)
          </p>
        </div>

        {/* Upload CSV */}
        <div className="mb-6">
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
            className="mb-4"
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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faqs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger 
              value="faqs" 
              className="flex items-center gap-3 h-12 px-6 text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <FileText className="w-5 h-5" />
              FAQs ({faqs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="flex items-center gap-3 h-12 px-6 text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Feedback ({feedback.filter(f => f.status === 'new').length} new)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="mt-6">
            {/* FAQ Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Filter FAQs</h3>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={publishedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('all')}
                >
                  All ({faqs.length})
                </Button>
                <Button
                  variant={publishedFilter === 'published' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('published')}
                >
                  Published ({faqs.filter(f => f.is_published).length})
                </Button>
                <Button
                  variant={publishedFilter === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('draft')}
                >
                  Draft ({faqs.filter(f => !f.is_published).length})
                </Button>
              </div>

              {/* Tag Filters */}
              {availableTags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Filter by Topic:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {(searchQuery || selectedTag || publishedFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredFaqs.length} of {faqs.length} FAQs
              </div>
            </div>

            {/* FAQ Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40%]">Question</TableHead>
                    <TableHead className="w-[20%]">Tags</TableHead>
                    <TableHead className="w-[20%]">Models</TableHead>
                    <TableHead className="w-[8%] text-center">Published</TableHead>
                    <TableHead className="w-[8%] text-center">Featured</TableHead>
                    <TableHead className="w-[4%] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaqs.map((faq) => (
                    <TableRow key={faq.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <p className="truncate text-sm">{faq.question}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {faq.affected_models.map((model) => (
                            <Badge key={model} variant="outline" className="text-xs flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={faq.is_published}
                          onCheckedChange={() => handleTogglePublished(faq)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={faq.featured}
                          onCheckedChange={() => handleToggleFeatured(faq)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => window.open(`/faq/${faq.slug}`, '_blank')}
                            variant="ghost"
                            size="sm"
                            title="View FAQ page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Link to={`/admin/faq/edit/${faq.slug}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit FAQ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredFaqs.length === 0 && faqs.length > 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg mb-4">No FAQs match your current filters</p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
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

      </div>
    </div>
  );
};

export default AdminDashboard;