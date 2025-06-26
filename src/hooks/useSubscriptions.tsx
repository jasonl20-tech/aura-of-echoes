
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  user_id: string;
  woman_id: string;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export function useSubscriptions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);
      
      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user,
  });
}

export function useSubscribeToWoman() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (womanId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { womanId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
    },
  });
}

export function useCheckSubscription(womanId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', user?.id, womanId],
    queryFn: async () => {
      if (!user || !womanId) return false;
      
      // First check local database
      const { data: localSub, error } = await supabase
        .from('subscriptions')
        .select('id, active, expires_at')
        .eq('user_id', user.id)
        .eq('woman_id', womanId)
        .eq('active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      // If we have a local subscription, also verify with Stripe
      if (localSub) {
        try {
          const { data: stripeCheck } = await supabase.functions.invoke('check-subscription', {
            body: { womanId },
          });
          return stripeCheck?.hasSubscription || false;
        } catch (stripeError) {
          console.warn('Stripe check failed, using local data:', stripeError);
          return true; // Fallback to local data if Stripe check fails
        }
      }
      
      return false;
    },
    enabled: !!user && !!womanId,
  });
}

export function useCustomerPortal() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Open customer portal in new tab
      window.open(data.url, '_blank');
    },
  });
}
