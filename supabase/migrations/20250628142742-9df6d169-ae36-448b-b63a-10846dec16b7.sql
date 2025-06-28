
-- Add exclusive_label column to women table
ALTER TABLE public.women 
ADD COLUMN exclusive_label text NOT NULL DEFAULT 'EXCLUSIVE';
