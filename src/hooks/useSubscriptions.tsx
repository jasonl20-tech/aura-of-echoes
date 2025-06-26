
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
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          woman_id: womanId,
          active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useCheckSubscription(womanId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', user?.id, womanId],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('woman_id', womanId)
        .eq('active', true)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!womanId,
  });
}
