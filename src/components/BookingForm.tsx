import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';

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

interface BookingFormProps {
  psychologist: Psychologist;
  onSuccess?: () => void;
}

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export function BookingForm({ psychologist, onSuccess }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [notes, setNotes] = useState('');
  const { user, session } = useAuth();
  const { toast } = useToast();

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !user || !session) {
      toast({
        title: "Incomplete booking",
        description: "Please select a date, time, and ensure you're signed in.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking/reserve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            psychologistId: psychologist.id,
            scheduledAt: scheduledAt.toISOString(),
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      toast({
        title: "Booking reserved!",
        description: `Your session is scheduled for ${format(scheduledAt, 'PPP')} at ${selectedTime}. Complete payment to confirm.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime(null);
      setNotes('');
      
      onSuccess?.();

    } catch (err) {
      console.error("Booking error:", err);
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const dayName = format(date, 'EEEE');
    const isInPast = date < new Date();
    const isAvailable = psychologist.available_days?.includes(dayName);
    return isInPast || !isAvailable;
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Book a Session
        </CardTitle>
        <CardDescription>
          ${psychologist.session_fee} per session with {psychologist.profile?.full_name || 'Therapist'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Select a Date</p>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={isDateDisabled}
            fromDate={new Date()}
            toDate={addDays(new Date(), 30)}
            className="rounded-xl border shadow-soft"
          />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select a Time
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "hero" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedTime && (
          <div className="animate-fade-in">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Notes for the therapist (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any topics you'd like to discuss..."
              className="w-full p-3 rounded-lg border border-input bg-background text-foreground resize-none h-20"
            />
          </div>
        )}

        {/* Summary & Book Button */}
        {selectedDate && selectedTime && (
          <div className="animate-fade-in space-y-4">
            <div className="p-4 rounded-xl bg-serenica-teal-light">
              <p className="text-sm text-muted-foreground">Session Summary</p>
              <p className="font-semibold text-foreground">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                ${psychologist.session_fee}
              </p>
            </div>

            <Button
              onClick={handleBooking}
              disabled={isBooking || !user}
              variant="hero"
              size="lg"
              className="w-full"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reserving...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Reserve Session
                </>
              )}
            </Button>

            {!user && (
              <p className="text-sm text-center text-muted-foreground">
                Please sign in to book a session
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}