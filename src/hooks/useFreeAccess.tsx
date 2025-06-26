
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
      
      console.log('Fetching free access periods for user:', user.id);
      
      // Hole zunächst nur die free_access_periods ohne Joins
      const { data: periods, error } = await supabase
        .from('free_access_periods')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching free access periods:', error);
        throw error;
      }

      console.log('Free access periods fetched:', periods);

      // Hole die Frauen-Daten separat
      const womanIds = [...new Set(periods?.map(p => p.woman_id) || [])];
      const { data: women } = await supabase
        .from('women')
        .select('id, name, image_url')
        .in('id', womanIds);

      // Hole die User-Profile separat (nur wenn user_id nicht null ist)
      const userIds = [...new Set(periods?.filter(p => p.user_id).map(p => p.user_id) || [])];
      const { data: profiles } = userIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds) : { data: [] };

      // Kombiniere die Daten manuell
      const enrichedPeriods = periods?.map(period => ({
        ...period,
        women: women?.find(w => w.id === period.woman_id),
        profiles: period.user_id ? profiles?.find(p => p.id === period.user_id) : null
      }));

      return enrichedPeriods || [];
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
      
      console.log('Current user:', user);
      console.log('Creating free access with data:', {
        woman_id: womanId,
        user_id: userId || null,
        end_time: endTime,
        created_by: user.id,
      });

      // Prüfe zuerst, ob der User Admin ist
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (roleError) {
        console.error('Error checking user role:', roleError);
        throw new Error('Fehler beim Überprüfen der Benutzerrolle');
      }

      console.log('User roles:', userRoles);

      if (!userRoles || userRoles.length === 0) {
        throw new Error('Du hast keine Berechtigung, Freischaltungen zu erstellen. Nur Admins können dies tun.');
      }
      
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
