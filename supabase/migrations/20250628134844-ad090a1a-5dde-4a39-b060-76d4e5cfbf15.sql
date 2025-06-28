
-- Erstelle Tabelle für User-Likes
CREATE TABLE public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  woman_id UUID NOT NULL REFERENCES public.women(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, woman_id)
);

-- Aktiviere Row Level Security
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Likes sehen
CREATE POLICY "Users can view their own likes" 
  ON public.user_likes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen Likes erstellen
CREATE POLICY "Users can create their own likes" 
  ON public.user_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können nur ihre eigenen Likes löschen
CREATE POLICY "Users can delete their own likes" 
  ON public.user_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);
