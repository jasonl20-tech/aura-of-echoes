
-- Create storage bucket for women images
INSERT INTO storage.buckets (id, name, public)
VALUES ('women-images', 'women-images', true);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload women images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'women-images');

-- Create policy to allow public access to view images
CREATE POLICY "Public access to women images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'women-images');

-- Create policy to allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete women images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'women-images');
