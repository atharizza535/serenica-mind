import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (path === "reserve") {
      const { psychologistId, scheduledAt, notes } = await req.json();
      const authHeader = req.headers.get("authorization");
      if (!authHeader) throw new Error("Missing auth header");

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) throw new Error("Invalid token");

      // Check availability
      const scheduledDate = new Date(scheduledAt);
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("psychologist_id", psychologistId)
        .eq("scheduled_at", scheduledDate.toISOString())
        .in("status", ["PENDING", "CONFIRMED"]);

      if (existing?.length) throw new Error("Slot taken");

      // Insert Booking
      const { data: booking, error: insertError } = await supabase
        .from("bookings")
        .insert({
          patient_id: user.id,
          psychologist_id: psychologistId,
          scheduled_at: scheduledDate.toISOString(),
          status: "PENDING",
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // --- CHANGE START: Generate Internal Link ---
      // We use the 'origin' header to point back to the frontend (localhost or production)
      const origin = req.headers.get("origin") || "http://localhost:8080";
      // We put the booking.id in the URL so the payment page knows what to pay for
      const paymentLink = `${origin}/pay/${booking.id}`; 
      
      // Update the booking with this new link
      await supabase
        .from("bookings")
        .update({ payment_link: paymentLink })
        .eq("id", booking.id);
      // --- CHANGE END ---

      return new Response(JSON.stringify({ 
        success: true, 
        booking: { ...booking, paymentUrl: paymentLink }, // Return the updated link
        message: "Booking reserved" 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (path === "webhook") {
      // Logic to confirm payment
      const { bookingId, paymentStatus } = await req.json();
      const newStatus = paymentStatus === "success" ? "CONFIRMED" : "CANCELLED";
      
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});