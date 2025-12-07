import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    
    if (path === "reserve") {
      // SOA Task Layer: Orchestrating reservation & payment token generation
      const { psychologistId, scheduledAt, notes } = await req.json();

      if (!psychologistId || !scheduledAt) {
        return new Response(
          JSON.stringify({ error: "psychologistId and scheduledAt are required" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user from auth header
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Auth error:", authError);
        return new Response(
          JSON.stringify({ error: "Invalid authorization" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("Creating booking for user:", user.id, "with psychologist:", psychologistId);

      // Check if slot is available (no existing confirmed booking at that time)
      const scheduledDate = new Date(scheduledAt);
      const { data: existingBookings, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("psychologist_id", psychologistId)
        .eq("scheduled_at", scheduledDate.toISOString())
        .in("status", ["PENDING", "CONFIRMED"]);

      if (checkError) {
        console.error("Error checking existing bookings:", checkError);
        throw new Error("Failed to check slot availability");
      }

      if (existingBookings && existingBookings.length > 0) {
        return new Response(
          JSON.stringify({ error: "This time slot is no longer available" }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate mock payment link (in production, integrate with Stripe/PayPal)
      const paymentId = crypto.randomUUID().substring(0, 8);
      const paymentLink = `https://mock-payment-gateway.com/pay/${paymentId}`;

      // Create the booking
      const { data: booking, error: insertError } = await supabase
        .from("bookings")
        .insert({
          patient_id: user.id,
          psychologist_id: psychologistId,
          scheduled_at: scheduledDate.toISOString(),
          status: "PENDING",
          payment_link: paymentLink,
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating booking:", insertError);
        throw new Error("Failed to create booking");
      }

      console.log("Booking created successfully:", booking.id);

      return new Response(
        JSON.stringify({
          success: true,
          booking: {
            id: booking.id,
            status: booking.status,
            scheduledAt: booking.scheduled_at,
            paymentUrl: paymentLink,
          },
          message: "Booking reserved. Complete payment to confirm.",
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (path === "webhook") {
      // Handle payment webhook (mock implementation)
      const { bookingId, paymentStatus } = await req.json();

      if (!bookingId || !paymentStatus) {
        return new Response(
          JSON.stringify({ error: "bookingId and paymentStatus are required" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("Processing payment webhook for booking:", bookingId, "status:", paymentStatus);

      const newStatus = paymentStatus === "success" ? "CONFIRMED" : "CANCELLED";

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        throw new Error("Failed to update booking status");
      }

      console.log("Booking status updated to:", newStatus);

      return new Response(
        JSON.stringify({
          success: true,
          bookingId,
          status: newStatus,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Unknown endpoint" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error("Error in booking function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Booking operation failed" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});