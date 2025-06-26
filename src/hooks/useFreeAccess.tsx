import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FreeAccessPeriod {
  id: string;
  woman_id: string;
  user_id?: string;
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
          ),
          profiles:user_id (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching free access periods:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateFreeAccess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      womanId, 
      endTime, 
      userId 
    }: { 
      womanId: string; 
      endTime: string; 
      userId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      console.log('Creating free access with data:', {
        woman_id: womanId,
        user_id: userId || null,
        end_time: endTime,
        created_by: user.id,
      });
      
      const { data, error } = await supabase
        .from('free_access_periods')
        .insert({
          woman_id: womanId,
          user_id: userId || null,
          end_time: endTime,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating free access:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Free access created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeAccessPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['freeAccess'] });
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

export function useCheckFreeAccess(womanId: string, specificUserId?: string) {
  return useQuery({
    queryKey: ['freeAccess', womanId, specificUserId],
    queryFn: async () => {
      if (!womanId) return false;
      
      const { data, error } = await supabase.rpc('has_free_access', {
        woman_id: womanId,
        specific_user_id: specificUserId || null
      });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!womanId,
  });
}
