
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
    mutationFn: async ({ womanId, womanName, price }: { womanId: string; womanName?: string; price?: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create Stripe checkout session with additional data
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          womanId,
          womanName: womanName || 'AI Companion',
          price: price || 3.99
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    },
  });
}

export function useCheckSubscription(womanId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', user?.id, womanId],
    queryFn: async () => {
      if (!user || !womanId) return { 
        hasAccess: false, 
        hasSubscription: false, 
        hasFreeAccess: false,
        hasStripeSubscription: false,
        subscriptionType: null
      };
      
      // Verwende die neue kombinierte Funktion
      const { data: hasAccess, error } = await supabase.rpc('has_subscription_or_free_access', {
        user_id: user.id,
        woman_id: womanId
      });
      
      if (error) {
        console.error('Error checking access:', error);
        throw error;
      }
      
      // Separate Checks für UI-Anzeige
      const { data: hasSubscription } = await supabase.rpc('has_subscription', {
        user_id: user.id,
        woman_id: womanId
      });
      
      const { data: hasFreeAccess } = await supabase.rpc('has_free_access', {
        woman_id: womanId,
        specific_user_id: user.id
      });

      // Prüfe ob es ein Stripe-Abonnement ist
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, stripe_customer_id')
        .eq('user_id', user.id)
        .eq('woman_id', womanId)
        .eq('active', true)
        .single();

      const hasStripeSubscription = !!(subscriptionData?.stripe_subscription_id);
      
      let subscriptionType = null;
      if (hasStripeSubscription) {
        subscriptionType = 'stripe';
      } else if (hasSubscription) {
        subscriptionType = 'direct';
      } else if (hasFreeAccess) {
        subscriptionType = 'free';
      }
      
      return {
        hasAccess: hasAccess || false,
        hasSubscription: hasSubscription || false,
        hasFreeAccess: hasFreeAccess || false,
        hasStripeSubscription,
        subscriptionType
      };
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
