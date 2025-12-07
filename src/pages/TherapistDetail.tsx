import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BookingForm } from '@/components/BookingForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Star, Clock, Award, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

interface Psychologist {
  id: string;
  profile_id: string;
  license_number: string;
  session_fee: number;
  specializations: string[];
  bio: string;
  years_experience: number;
  available_days: string[];
  profile?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function TherapistDetail() {
  const { id } = useParams<{ id: string }>();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Get user to check role

  useEffect(() => {
    if (id) {
      fetchPsychologist();
    }
  }, [id]);

  const fetchPsychologist = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('psychologists')
      .select(`
        id,
        profile_id,
        license_number,
        session_fee,
        specializations,
        bio,
        years_experience,
        available_days,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (data && !error) {
      const transformed = {
        ...data,
        profile: data.profiles
      };
      setPsychologist(transformed as Psychologist);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!psychologist) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">
              Therapist not found
            </h1>
            <Link to="/therapists">
              <Button variant="soft">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to therapists
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isPatient = user?.user_metadata?.role === 'patient';

  return (
    <Layout>
      <div className="min-h-screen py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <Link
            to="/therapists"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to therapists
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="elevated">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-serenica-teal-light to-serenica-lavender-light flex items-center justify-center flex-shrink-0 overflow-hidden shadow-soft">
                      {psychologist.profile?.avatar_url ? (
                        <img
                          src={psychologist.profile.avatar_url}
                          alt={psychologist.profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-display font-bold text-serenica-teal">
                          {psychologist.profile?.full_name?.charAt(0) || 'T'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                        {psychologist.profile?.full_name || 'Therapist'}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {psychologist.years_experience}+ years experience
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500" />
                          4.9 rating
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-serenica-teal" />
                          Licensed
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-4">
                        License: {psychologist.license_number}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {psychologist.specializations?.map((spec, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-serenica-sage-light text-serenica-sage"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                    About
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {psychologist.bio || 'No biography available.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Availability
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (day) => {
                        const isAvailable = psychologist.available_days?.includes(day);
                        return (
                          <Badge
                            key={day}
                            variant={isAvailable ? 'default' : 'secondary'}
                            className={
                              isAvailable
                                ? 'bg-serenica-teal text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {day.slice(0, 3)}
                          </Badge>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Section - ONLY FOR PATIENTS */}
            <div>
              {isPatient ? (
                <BookingForm psychologist={psychologist} />
              ) : (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p>Only patients can book sessions.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}