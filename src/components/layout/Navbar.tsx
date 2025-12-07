import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Brain, LogOut, User, Calendar, BookOpen } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const role = user?.user_metadata?.role;
  const isTherapist = role === 'psychologist';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO: Uses 'font-display' (Playfair) */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground tracking-tight">
            Serenica
          </span>
        </Link>

        {/* NAVIGATION LINKS: Use 'font-sans' (Inter) - Implicit default */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/journal" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Mood Journal</span>
          </Link>
          
          {!isTherapist && (
            <Link to="/therapists" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Find Therapists</span>
            </Link>
          )}

          {user && (
            <Link to="/bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>My Schedule</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none font-sans">
                  {user.email}
                </span>
                {/* STATUS BADGE: Clean sans font */}
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5 font-sans">
                  {role === 'psychologist' ? 'Therapist' : 'Patient'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
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