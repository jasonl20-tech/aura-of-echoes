
-- Add images array to women table to support multiple images
ALTER TABLE public.women 
ADD COLUMN images JSONB DEFAULT '[]'::JSONB;

-- Update existing women to have their current image_url as first image in array
UPDATE public.women 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(jsonb_build_object('url', image_url, 'alt', name))
  ELSE '[]'::JSONB
END
WHERE images IS NULL OR images = '[]'::JSONB;
