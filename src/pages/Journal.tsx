import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MoodJournal } from '@/components/MoodJournal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface MoodLog {
  id: string;
  journal_text: string;
  ai_analysis: {
    mood_score: number;
    dominant_emotion: string;
    advice: string;
  } | null;
  created_at: string;
}

export default function Journal() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data && !error) {
      setLogs(data as MoodLog[]);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'bg-serenica-sage';
    if (score >= 6) return 'bg-serenica-teal';
    if (score >= 4) return 'bg-serenica-lavender';
    return 'bg-destructive/70';
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-serenica-lavender-light text-serenica-lavender text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                AI-Powered Insights
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Mood Journal
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Express your thoughts and feelings. Our AI provides compassionate analysis and personalized suggestions.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Journal Component */}
              <div className="lg:col-span-2">
                <MoodJournal />
              </div>

              {/* Recent Entries Sidebar */}
              <div className="space-y-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Recent Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!user ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sign in to view your journal history
                      </p>
                    ) : logs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No entries yet. Start journaling!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded-lg bg-muted/50 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'MMM d, h:mm a')}
                              </span>
                              {log.ai_analysis && (
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`w-2 h-2 rounded-full ${getMoodColor(log.ai_analysis.mood_score)}`}
                                  />
                                  <span className="text-xs font-medium">
                                    {log.ai_analysis.mood_score}/10
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">
                              {log.journal_text}
                            </p>
                            {log.ai_analysis && (
                              <span className="inline-block px-2 py-0.5 rounded text-xs bg-serenica-teal-light text-serenica-teal capitalize">
                                {log.ai_analysis.dominant_emotion}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card variant="mood">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-serenica-sage-light flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-serenica-sage" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Journaling Tip</h4>
                        <p className="text-sm text-muted-foreground">
                          Try to be specific about your emotions. Instead of "I feel bad," describe what triggered the feeling and where you feel it in your body.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}