import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, LogOut, FileText, MessageSquare, CheckCircle, ExternalLink, Search, Tag, Filter, X, Car } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { fetchAllTags } from '@/data/faqs';
import { AdminHeader } from '@/components/AdminHeader';

interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  tags: string[];
  affected_models: string[];
  category: string;
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
const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'faq' | 'feedback'; id: string | null }>({
    open: false,
    type: 'faq',
    id: null,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    
    // Restore search filters from navigation state if available
    const adminState = location.state as { searchQuery?: string; selectedTag?: string; publishedFilter?: string } | undefined;
    if (adminState) {
      if (adminState.searchQuery) setSearchQuery(adminState.searchQuery);
      if (adminState.selectedTag) setSelectedTag(adminState.selectedTag);
      if (adminState.publishedFilter) setPublishedFilter(adminState.publishedFilter as 'all' | 'published' | 'draft');
      // Clear the state after restoring
      window.history.replaceState({}, document.title);
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
      logError('Failed to load tags:', error);
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

  const confirmDelete = () => {
    if (!deleteDialog.id) return;
    if (deleteDialog.type === 'faq') {
      handleDeleteFAQ(deleteDialog.id);
    } else {
      deleteFeedback(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: 'faq', id: null });
  };

  const deleteFeedback = async (feedbackId: string) => {
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
      logError('Error updating FAQ featured status:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update FAQ featured status",
        variant: "destructive" 
      });
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
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Dashboard Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
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
                    <span className="text-sm font-medium">Filter by Tags:</span>
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
                    <TableHead className="w-[30%]">Question</TableHead>
                    <TableHead className="w-[15%]">Category</TableHead>
                    <TableHead className="w-[15%]">Tags</TableHead>
                    <TableHead className="w-[15%]">Models</TableHead>
                    <TableHead className="w-[8%] text-center">Published</TableHead>
                    <TableHead className="w-[8%] text-center">Featured</TableHead>
                    <TableHead className="w-[9%] text-center">Actions</TableHead>
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
                        <Badge variant="default" className="text-xs">
                          {faq.category}
                        </Badge>
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
                          <Link 
                            to={`/admin/faq/edit/${faq.slug}`}
                            state={{
                              searchQuery,
                              selectedTag,
                              publishedFilter
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit FAQ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => setDeleteDialog({ open: true, type: 'faq', id: faq.id })}
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
                          onClick={() => setDeleteDialog({ open: true, type: 'feedback', id: fb.id })}
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

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(d => ({ ...d, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteDialog.type === 'faq' ? 'FAQ' : 'feedback'}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;