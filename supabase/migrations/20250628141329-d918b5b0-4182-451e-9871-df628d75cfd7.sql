
-- Add exclusive column to women table
ALTER TABLE public.women 
ADD COLUMN exclusive boolean NOT NULL DEFAULT false;

-- Create index for better performance when filtering exclusive women
CREATE INDEX idx_women_exclusive ON public.women(exclusive, created_at);
