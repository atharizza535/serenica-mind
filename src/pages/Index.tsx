import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Heart, Calendar, Sparkles, ArrowRight, Shield, Users, BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--serenica-teal)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--serenica-lavender)/0.08),transparent_50%)]" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-[10%] w-20 h-20 rounded-full bg-serenica-teal/10 blur-2xl animate-float" />
        <div className="absolute bottom-1/3 right-[15%] w-32 h-32 rounded-full bg-serenica-lavender/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-serenica-teal-light text-serenica-teal text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Mental Wellness
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6 animate-slide-up">
              Your Journey to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-serenica-teal to-serenica-sage">
                Mental Wellness
              </span>{' '}
              Starts Here
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Connect with licensed therapists, track your emotional wellbeing with AI insights, and take control of your mental health journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/therapists">
                <Button variant="hero" size="xl">
                  Find a Therapist
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/journal">
                <Button variant="soft" size="xl">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Try Mood Journal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-serenica-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Compassionate Care, Modern Approach
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine traditional therapy with cutting-edge AI to provide personalized mental health support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center p-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-serenica-teal-light flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-serenica-teal" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                Expert Therapists
              </h3>
              <p className="text-muted-foreground">
                Connect with licensed psychologists specializing in various areas of mental health.
              </p>
            </Card>

            <Card variant="elevated" className="text-center p-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-serenica-lavender-light flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-serenica-lavender" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                AI Mood Analysis
              </h3>
              <p className="text-muted-foreground">
                Journal your thoughts and receive compassionate AI-powered insights and suggestions.
              </p>
            </Card>

            <Card variant="elevated" className="text-center p-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-serenica-sage-light flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-serenica-sage" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                Easy Booking
              </h3>
              <p className="text-muted-foreground">
                Book sessions with your preferred therapist at times that work for you.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-serenica-teal-light/30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Card variant="glass" className="max-w-4xl mx-auto p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary flex items-center justify-center mb-6 shadow-glow">
              <Heart className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Take the first step towards better mental health. Our platform makes it easy to get started.
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-serenica-teal" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-serenica-sage" />
              <span>Licensed Therapists</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-serenica-lavender" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Serenica. Your mental health matters.</p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;