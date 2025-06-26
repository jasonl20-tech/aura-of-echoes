
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useCreateStripeCheckout() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (womanId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { womanId },
      });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCheckStripeSubscription() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (womanId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { womanId },
      });
      
      if (error) throw error;
      return data;
    },
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
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Kunde Portal konnte nicht geöffnet werden",
        variant: "destructive",
      });
    },
  });
}
