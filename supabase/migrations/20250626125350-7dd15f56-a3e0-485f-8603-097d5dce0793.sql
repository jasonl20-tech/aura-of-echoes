
-- Update women table to set standard price of 3.99 for all existing women
UPDATE public.women SET price = 3.99;

-- Create function to check if user is admin based on email
CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT user_email = 'lohrejason5@gmail.com';
$$;

-- Update the existing is_admin function to also check email
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = $1 AND auth.users.email = 'lohrejason5@gmail.com'
  );
$$;

-- Update handle_new_user function to automatically assign admin role for specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Add default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Add admin role if email matches
  IF NEW.email = 'lohrejason5@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update women table default price for new entries
ALTER TABLE public.women ALTER COLUMN price SET DEFAULT 3.99;
