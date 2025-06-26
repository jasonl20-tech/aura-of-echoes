
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WomanApiKey {
  id: string;
  woman_id: string;
  api_key: string;
  created_at: string;
  last_used_at: string | null;
  active: boolean;
}

export function useWomenApiKeys() {
  return useQuery({
    queryKey: ['women-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('women_api_keys')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WomanApiKey[];
    },
  });
}

export function useWomanApiKey(womanId: string) {
  return useQuery({
    queryKey: ['woman-api-key', womanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('women_api_keys')
        .select('*')
        .eq('woman_id', womanId)
        .eq('active', true)
        .single();
      
      if (error) throw error;
      return data as WomanApiKey;
    },
    enabled: !!womanId,
  });
}
