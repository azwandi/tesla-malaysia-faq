import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Plus, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const AdminHeader = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/admin" className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">JomTesla Admin</span>
            </Link>
            
            <nav className="flex items-center space-x-1">
              
              <Button
                variant={isActive('/admin/faq/new') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/admin/faq/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New FAQ
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" target="_blank">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};