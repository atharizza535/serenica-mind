import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Heart, TrendingUp, Lightbulb } from 'lucide-react';

interface MoodAnalysis {
  mood_score: number;
  dominant_emotion: string;
  emotional_themes: string[];
  advice: string;
  self_care_suggestion: string;
}

export function MoodJournal() {
  const [journalText, setJournalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!journalText.trim()) {
      toast({
        title: "Empty journal",
        description: "Please write something in your journal first.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save and analyze your journal entries.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: { journal_text: journalText },
      });

      if (error) {
        console.error("Analysis error:", error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);

      // Save to database
      const { error: saveError } = await supabase
        .from('mood_logs')
        .insert({
          user_id: user.id,
          journal_text: journalText,
          ai_analysis: data,
        });

      if (saveError) {
        console.error("Save error:", saveError);
      } else {
        toast({
          title: "Journal saved",
          description: "Your mood entry has been saved successfully.",
        });
      }

    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'bg-serenica-sage';
    if (score >= 6) return 'bg-serenica-teal';
    if (score >= 4) return 'bg-serenica-lavender';
    return 'bg-destructive/70';
  };

  const getEmotionEmoji = (emotion: string) => {
    const emotions: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      calm: '😌',
      stressed: '😓',
      hopeful: '🌟',
      angry: '😤',
      grateful: '🙏',
      confused: '🤔',
      neutral: '😐',
    };
    return emotions[emotion.toLowerCase()] || '💭';
  };

  return (
    <div className="space-y-6">
      <Card variant="mood" className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-serenica-lavender" />
            How are you feeling today?
          </CardTitle>
          <CardDescription>
            Write about your thoughts and feelings. Our AI will provide supportive insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Today I'm feeling..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="min-h-[150px] resize-none bg-background/50 border-border/50 focus:border-primary/50"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !journalText.trim()}
            variant="hero"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing your mood...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze My Mood
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-serenica-sage" />
              Your Mood Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Score */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Mood Score</p>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getMoodColor(analysis.mood_score)} transition-all duration-1000`}
                    style={{ width: `${analysis.mood_score * 10}%` }}
                  />
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-foreground">
                {analysis.mood_score}/10
              </div>
            </div>

            {/* Dominant Emotion */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-serenica-teal-light">
              <span className="text-4xl">{getEmotionEmoji(analysis.dominant_emotion)}</span>
              <div>
                <p className="text-sm text-muted-foreground">Primary Emotion</p>
                <p className="text-lg font-semibold capitalize text-foreground">{analysis.dominant_emotion}</p>
              </div>
            </div>

            {/* Emotional Themes */}
            {analysis.emotional_themes && analysis.emotional_themes.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Emotional Themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotional_themes.map((theme, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-full text-sm bg-serenica-lavender-light text-serenica-lavender"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Advice */}
            <div className="p-4 rounded-xl bg-serenica-sage-light">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Supportive Insight
              </p>
              <p className="text-foreground">{analysis.advice}</p>
            </div>

            {/* Self-care Suggestion */}
            <div className="p-4 rounded-xl bg-serenica-peach">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Self-Care Suggestion
              </p>
              <p className="text-foreground">{analysis.self_care_suggestion}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}