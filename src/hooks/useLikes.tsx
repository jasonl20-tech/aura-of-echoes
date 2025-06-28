
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface UserLike {
  id: string;
  user_id: string;
  woman_id: string;
  created_at: string;
  woman: {
    id: string;
    name: string;
    age: number;
    image_url: string;
    images: any;
    description: string;
    interests: string[];
    height?: number;
    origin?: string;
    nsfw?: boolean;
    price: number;
    pricing_interval: string;
  };
}

export const useLikes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's likes
  const { data: likes, isLoading, error } = useQuery({
    queryKey: ['likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_likes')
        .select(`
          *,
          woman:women(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserLike[];
    },
    enabled: !!user,
  });

  // Add like mutation
  const addLikeMutation = useMutation({
    mutationFn: async ({ womanId }: { womanId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_likes')
        .insert({
          user_id: user.id,
          woman_id: womanId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error adding like:', error);
      toast({
        title: "Fehler",
        description: "Like konnte nicht gespeichert werden",
        variant: "destructive",
      });
    },
  });

  // Remove like mutation
  const removeLikeMutation = useMutation({
    mutationFn: async ({ womanId }: { womanId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('woman_id', womanId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error removing like:', error);
      toast({
        title: "Fehler",
        description: "Like konnte nicht entfernt werden",
        variant: "destructive",
      });
    },
  });

  // Check if woman is liked
  const isLiked = (womanId: string) => {
    return likes?.some(like => like.woman_id === womanId) || false;
  };

  return {
    likes: likes || [],
    isLoading,
    error,
    addLike: addLikeMutation.mutateAsync,
    removeLike: removeLikeMutation.mutateAsync,
    isLiked,
    addLikeAsync: addLikeMutation.mutateAsync,
    removeLikeAsync: removeLikeMutation.mutateAsync,
  };
};
