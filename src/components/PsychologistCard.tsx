import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PsychologistCardProps {
  id: string;
  name: string;
  specializations: string[];
  yearsExperience: number;
  sessionFee: number;
  bio: string;
  avatarUrl?: string;
}

export function PsychologistCard({
  id,
  name,
  specializations,
  yearsExperience,
  sessionFee,
  bio,
  avatarUrl,
}: PsychologistCardProps) {
  return (
    <Card variant="interactive" className="overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-serenica-teal-light to-serenica-lavender-light flex items-center justify-center flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-display font-bold text-serenica-teal">
                {name.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-foreground truncate">
              {name}
            </h3>
            
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {yearsExperience}+ years
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                4.9
              </span>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {specializations.slice(0, 3).map((spec, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-serenica-sage-light text-serenica-sage">
                  {spec}
                </Badge>
              ))}
              {specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{specializations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
          {bio}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Session fee</p>
            <p className="text-lg font-bold text-primary">${sessionFee}</p>
          </div>
          <Link to={`/therapists/${id}`}>
            <Button variant="soft" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              Book Session
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}