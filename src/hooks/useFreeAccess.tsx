
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FreeAccessPeriod {
  id: string;
  woman_id: string;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  active: boolean;
}

export function useFreeAccessPeriods() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['freeAccessPeriods'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('free_access_periods')
        .select(`
          *,
          women:woman_id (
            id,
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateFreeAccess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ womanId, endTime }: { womanId: string; endTime: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('free_access_periods')
        .insert({
          woman_id: womanId,
          end_time: endTime,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeAccessPeriods'] });
    },
  });
}

export function useDeactivateFreeAccess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (accessId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('free_access_periods')
        .update({ active: false })
        .eq('id', accessId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeAccessPeriods'] });
    },
  });
}

export function useCheckFreeAccess(womanId: string) {
  return useQuery({
    queryKey: ['freeAccess', womanId],
    queryFn: async () => {
      if (!womanId) return false;
      
      const { data, error } = await supabase.rpc('has_free_access', {
        woman_id: womanId
      });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!womanId,
  });
}
