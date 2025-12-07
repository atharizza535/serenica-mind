import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PsychologistCard } from '@/components/PsychologistCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Users, Loader2 } from 'lucide-react';

interface Psychologist {
  id: string;
  profile_id: string;
  license_number: string;
  session_fee: number;
  specializations: string[];
  bio: string;
  years_experience: number;
  available_days: string[];
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export default function Therapists() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const specializations = [
    'Anxiety',
    'Depression',
    'Trauma',
    'Relationships',
    'Stress',
    'Grief',
    'ADHD',
    'Sleep',
  ];

  useEffect(() => {
    fetchPsychologists();
  }, []);

  const fetchPsychologists = async () => {
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
      `);

    if (data && !error) {
      setPsychologists(data as Psychologist[]);
    }
    setIsLoading(false);
  };

  const filteredPsychologists = psychologists.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specializations?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialization =
      !selectedSpecialization ||
      p.specializations?.includes(selectedSpecialization);

    return matchesSearch && matchesSpecialization;
  });

  return (
    <Layout>
      <div className="min-h-screen py-12">
        {/* Header */}
        <div className="bg-gradient-to-b from-serenica-teal-light/50 to-background pb-12">
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-serenica-teal-light text-serenica-teal text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Licensed Professionals
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Find Your Therapist
              </h1>
              <p className="text-muted-foreground">
                Connect with licensed mental health professionals who specialize in your needs.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={!selectedSpecialization ? 'hero' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSpecialization(null)}
                >
                  All
                </Button>
                {specializations.map((spec) => (
                  <Button
                    key={spec}
                    variant={selectedSpecialization === spec ? 'hero' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSpecialization(spec)}
                  >
                    {spec}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPsychologists.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                No therapists found
              </h3>
              <p className="text-muted-foreground mb-4">
                {psychologists.length === 0
                  ? "No therapists have joined the platform yet."
                  : "Try adjusting your search or filters."}
              </p>
              {psychologists.length > 0 && selectedSpecialization && (
                <Button variant="soft" onClick={() => setSelectedSpecialization(null)}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPsychologists.map((p) => (
                <PsychologistCard
                  key={p.id}
                  id={p.id}
                  name={p.profiles?.full_name || 'Unknown Therapist'}
                  specializations={p.specializations || []}
                  yearsExperience={p.years_experience}
                  sessionFee={p.session_fee}
                  bio={p.bio || 'No bio available.'}
                  avatarUrl={p.profiles?.avatar_url}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}