import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Brain, LogOut, User, Calendar, BookOpen } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-semibold text-foreground">Serenica</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/therapists" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Find Therapists</span>
          </Link>
          <Link to="/journal" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Mood Journal</span>
          </Link>
          {user && (
            <Link to="/bookings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}