
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Woman {
  id: string;
  name: string;
  age: number;
  description: string | null;
  personality: string | null;
  image_url: string | null;
  webhook_url: string;
  price: number;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useWomen() {
  return useQuery({
    queryKey: ['women'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('women')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Woman[];
    },
  });
}

export function useWoman(id: string) {
  return useQuery({
    queryKey: ['woman', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('women')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Woman;
    },
    enabled: !!id,
  });
}
