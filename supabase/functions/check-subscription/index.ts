
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { womanId } = await req.json();
    if (!womanId) throw new Error("Woman ID is required");
    logStep("Checking subscription for woman", { womanId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find customer in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found in Stripe");
      return new Response(JSON.stringify({ hasSubscription: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Customer found", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    // Check if any subscription matches our woman
    const activeSubscription = subscriptions.data.find(sub => 
      sub.metadata.woman_id === womanId
    );

    if (activeSubscription) {
      logStep("Active subscription found", { subscriptionId: activeSubscription.id });
      
      // Update or create subscription in database
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        woman_id: womanId,
        stripe_subscription_id: activeSubscription.id,
        stripe_customer_id: customerId,
        active: true,
        expires_at: new Date(activeSubscription.current_period_end * 1000).toISOString(),
      }, { 
        onConflict: 'user_id,woman_id'
      });

      return new Response(JSON.stringify({ 
        hasSubscription: true,
        expiresAt: new Date(activeSubscription.current_period_end * 1000).toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("No active subscription found");
      
      // Update subscription status in database
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        woman_id: womanId,
        stripe_customer_id: customerId,
        active: false,
        expires_at: null,
      }, { 
        onConflict: 'user_id,woman_id'
      });

      return new Response(JSON.stringify({ hasSubscription: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
