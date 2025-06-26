
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ImageData {
  url: string;
  alt?: string;
}

interface CreateWomanData {
  name: string;
  age: number;
  description: string;
  personality: string;
  image_url: string;
  images: ImageData[];
  webhook_url: string;
  interests: string[];
  price: number;
  pricing_interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  height: number | null;
  origin: string;
  nsfw: boolean;
}

interface UpdateWomanData extends Partial<CreateWomanData> {
  id: string;
}

export function useCreateWoman() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (womanData: CreateWomanData) => {
      if (!user) throw new Error('Not authenticated');
      
      // Convert ImageData[] to JSON for database
      const dbData = {
        ...womanData,
        images: JSON.stringify(womanData.images || [])
      };
      
      const { data, error } = await supabase
        .from('women')
        .insert(dbData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateWoman() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateWomanData) => {
      if (!user) throw new Error('Not authenticated');
      
      // Prepare data for database, converting ImageData[] to JSON string if images are provided
      const dbData: any = { ...updateData };
      if (updateData.images) {
        dbData.images = JSON.stringify(updateData.images);
      }
      
      const { data, error } = await supabase
        .from('women')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteWoman() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (womanId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('women')
        .delete()
        .eq('id', womanId);
      
      if (error) throw error;
    },
  });
}

export function useIsAdmin() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      // Check if user has admin role or is the specific admin email
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });
}
