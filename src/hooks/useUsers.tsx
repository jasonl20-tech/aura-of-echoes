
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export function useUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
    enabled: !!user,
  });
}
