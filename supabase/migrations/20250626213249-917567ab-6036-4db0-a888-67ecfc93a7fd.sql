
-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-messages', 'audio-messages', true);

-- Create RLS policy for audio bucket - allow authenticated users to upload
CREATE POLICY "Authenticated users can upload audio" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'audio-messages' AND auth.role() = 'authenticated');

-- Create RLS policy for audio bucket - allow public read access
CREATE POLICY "Public can view audio files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'audio-messages');

-- Add audio_url column to messages table
ALTER TABLE public.messages 
ADD COLUMN audio_url text;
