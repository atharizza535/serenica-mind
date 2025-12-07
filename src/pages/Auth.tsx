import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client'; // Add this import
import { Loader2, Brain, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'signup';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'psychologist'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Basic redirect if already logged in, but we allow handleSubmit to override specific destinations
    if (user) {
      // Optional: Add logic here to prevent redirecting if we are about to go to onboarding
      // For now, we rely on the speed of the handleSubmit logic or a second redirect from home if needed
      // If this causes issues, you can remove this useEffect and handle redirects solely in handleSubmit
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName || email.split('@')[0], role);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Try signing in instead.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Serenica.",
          });
          
          // Redirect logic for Sign Up
          if (role === 'psychologist') {
            navigate('/onboarding');
          } else {
            navigate('/');
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          // Check if onboarding is needed for existing psychologists
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (currentUser?.user_metadata?.role === 'psychologist') {
            const { data: psychologist } = await supabase
              .from('psychologists')
              .select('id')
              .eq('profile_id', currentUser.id)
              .maybeSingle();
            
            if (!psychologist) {
              toast({ 
                title: "Profile incomplete", 
                description: "Please complete your therapist profile to appear in search." 
              });
              navigate('/onboarding');
              return; 
            }
          }

          toast({
            title: "Welcome back!",
            description: "You're now signed in.",
          });
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>

          <Card variant="elevated" className="animate-slide-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-glow">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? 'Start your mental wellness journey today'
                  : 'Sign in to continue your journey'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Your name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={role === 'patient' ? 'hero' : 'outline'}
                        onClick={() => setRole('patient')}
                        className="h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-semibold">Patient</div>
                          <div className="text-xs opacity-80">Seeking support</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={role === 'psychologist' ? 'hero' : 'outline'}
                        onClick={() => setRole('psychologist')}
                        className="h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-semibold">Therapist</div>
                          <div className="text-xs opacity-80">Licensed provider</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                {isSignUp ? (
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/auth" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/auth?mode=signup" className="text-primary hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}