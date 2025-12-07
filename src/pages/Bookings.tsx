import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Loader2, CreditCard, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  scheduled_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  payment_link: string | null;
  notes: string | null;
  psychologists: {
    session_fee: number;
    profiles: {
      full_name: string;
    } | null;
  } | null;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        scheduled_at,
        status,
        payment_link,
        notes,
        psychologists (
          session_fee,
          profiles (
            full_name
          )
        )
      `)
      .order('scheduled_at', { ascending: false });

    if (data && !error) {
      setBookings(data as Booking[]);
    }
    setIsLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled.",
      });
      fetchBookings();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-serenica-sage text-primary-foreground';
      case 'PENDING':
        return 'bg-serenica-lavender text-primary-foreground';
      case 'CANCELLED':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted';
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.scheduled_at) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'CANCELLED' || new Date(b.scheduled_at) < new Date()
  );

  // Check user role
  const isPatient = user?.user_metadata?.role === 'patient';

  return (
    <Layout>
      <div className="min-h-screen py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-serenica-teal-light text-serenica-teal text-sm font-medium mb-4">
                <Calendar className="w-4 h-4" />
                Your Sessions
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                My Bookings
              </h1>
              <p className="text-muted-foreground">
                Manage your upcoming and past therapy sessions.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <Card variant="elevated" className="text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isPatient ? "Book your first session with a therapist." : "No upcoming sessions scheduled."}
                  </p>
                  {isPatient && (
                    <Link to="/therapists">
                      <Button variant="hero">Find a Therapist</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Upcoming Bookings */}
                {upcomingBookings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                      Upcoming Sessions
                    </h2>
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <Card key={booking.id} variant="elevated">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  Session with{' '}
                                  {booking.psychologists?.profiles?.full_name || 'Therapist'}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(booking.scheduled_at), 'EEEE, MMMM d')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {format(new Date(booking.scheduled_at), 'h:mm a')}
                                  </span>
                                </div>
                                {booking.notes && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Notes: {booking.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                                
                                {/* PAY BUTTON: Only visible to PATIENTS if status is PENDING */}
                                {isPatient && booking.status === 'PENDING' && (
                                  <Link to={`/pay/${booking.id}`}>
                                    <Button variant="hero" size="sm">
                                      Pay Now
                                      <CreditCard className="w-3 h-3 ml-1" />
                                    </Button>
                                  </Link>
                                )}

                                {booking.status !== 'CANCELLED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancel(booking.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Bookings */}
                {pastBookings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-display font-semibold text-muted-foreground mb-4">
                      Past Sessions
                    </h2>
                    <div className="space-y-4">
                      {pastBookings.map((booking) => (
                        <Card key={booking.id} className="opacity-60">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  {booking.psychologists?.profiles?.full_name || 'Therapist'}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(booking.scheduled_at), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}