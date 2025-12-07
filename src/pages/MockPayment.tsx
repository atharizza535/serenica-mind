import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react';

export default function MockPayment() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulate payment processing
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Call your Edge Function "webhook" logic to update DB
      // We reuse the 'booking' function but hit the 'webhook' path logic via invoke
      // Note: Since invoke URLs are fixed, we manually construct the body as the function expects
      const { data, error } = await supabase.functions.invoke('booking/webhook', {
        body: { 
          bookingId: bookingId, 
          paymentStatus: 'success' 
        }
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Your session has been confirmed!",
      });

      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);

    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8 animate-slide-up border-green-200 bg-green-50">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Confirmed!</h2>
            <p className="text-green-700">Redirecting you to your bookings...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4 gradient-hero">
        <Card variant="elevated" className="max-w-md w-full animate-slide-up">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Secure Mock Gateway</span>
            </div>
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>Enter any details to simulate a payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="0000 0000 0000 0000" className="pl-9 font-mono" defaultValue="4242 4242 4242 4242" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" defaultValue="12/25" />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input placeholder="123" defaultValue="123" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input placeholder="John Doe" defaultValue="Test User" />
              </div>

              <Button type="submit" variant="hero" className="w-full mt-4" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                This is a mock page. No real money will be deducted.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}