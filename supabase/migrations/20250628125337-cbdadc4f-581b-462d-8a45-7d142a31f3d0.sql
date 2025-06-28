
-- Add verification status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN id_document_url text,
ADD COLUMN verification_requested_at timestamp with time zone,
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN verified_by uuid REFERENCES auth.users(id);

-- Create table for profile applications from verified users
CREATE TABLE public.profile_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18),
  description text,
  personality text,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  interests text[] DEFAULT '{}',
  price numeric DEFAULT 3.99,
  pricing_interval text DEFAULT 'monthly' CHECK (pricing_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
  height integer,
  origin text,
  nsfw boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  rejection_reason text
);

-- Enable RLS for profile applications
ALTER TABLE public.profile_applications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own applications
CREATE POLICY "Users can view their own profile applications" 
ON public.profile_applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create their own profile applications" 
ON public.profile_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all profile applications" 
ON public.profile_applications 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('id-documents', 'id-documents', false);

-- Create RLS policy for ID documents - only authenticated users can upload their own
CREATE POLICY "Users can upload their own ID documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'id-documents' AND auth.role() = 'authenticated');

-- Admins can view all ID documents
CREATE POLICY "Admins can view all ID documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'id-documents' AND public.is_admin(auth.uid()));

-- Users can view their own ID documents
CREATE POLICY "Users can view their own ID documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'id-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
