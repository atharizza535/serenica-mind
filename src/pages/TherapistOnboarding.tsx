import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Stethoscope } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TherapistOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    license_number: '',
    session_fee: '',
    years_experience: '',
    bio: '',
    specializations: '', // Comma separated string
    available_days: [] as string[]
  });

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from('psychologists').insert({
        profile_id: user.id,
        license_number: formData.license_number,
        session_fee: parseFloat(formData.session_fee),
        years_experience: parseInt(formData.years_experience),
        bio: formData.bio,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
        available_days: formData.available_days
      });

      if (error) throw error;

      toast({
        title: "Profile Complete!",
        description: "You are now listed as a therapist.",
      });
      navigate('/');

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
        <div className="w-full max-w-2xl">
          <Card className="animate-slide-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-serenica-teal-light flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-serenica-teal" />
              </div>
              <CardTitle className="text-2xl">Complete Your Therapist Profile</CardTitle>
              <CardDescription>
                We need a few more details to showcase your profile to patients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number (STR)</Label>
                    <Input 
                      id="license" 
                      required 
                      placeholder="e.g. 123456789"
                      value={formData.license_number}
                      onChange={e => setFormData({...formData, license_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input 
                      id="experience" 
                      type="number" 
                      required 
                      placeholder="e.g. 5"
                      value={formData.years_experience}
                      onChange={e => setFormData({...formData, years_experience: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee">Session Fee ($)</Label>
                  <Input 
                    id="fee" 
                    type="number" 
                    required 
                    placeholder="e.g. 150"
                    value={formData.session_fee}
                    onChange={e => setFormData({...formData, session_fee: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations (comma separated)</Label>
                  <Input 
                    id="specializations" 
                    required 
                    placeholder="e.g. Anxiety, Depression, Trauma"
                    value={formData.specializations}
                    onChange={e => setFormData({...formData, specializations: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea 
                    id="bio" 
                    required 
                    className="min-h-[100px]"
                    placeholder="Tell patients about your approach..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 block">Available Days</Label>
                  <div className="flex flex-wrap gap-4">
                    {DAYS.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={day} 
                          checked={formData.available_days.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <label htmlFor={day} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {day.slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Complete Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}