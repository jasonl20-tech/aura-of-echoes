
-- Add Stripe-related columns to the subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_customer_id TEXT;

-- Add index for better performance when querying by Stripe subscription ID
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
