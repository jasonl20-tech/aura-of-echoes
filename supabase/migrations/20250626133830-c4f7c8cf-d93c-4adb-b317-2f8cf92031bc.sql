
-- 1. Admin-Rolle für den spezifischen Benutzer hinzufügen (falls noch nicht vorhanden)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'lohrejason5@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);

-- 2. Alle bestehenden RLS-Policies für free_access_periods löschen
DROP POLICY IF EXISTS "Admins can insert free access periods" ON public.free_access_periods;
DROP POLICY IF EXISTS "Admins can update free access periods" ON public.free_access_periods;
DROP POLICY IF EXISTS "Admins can delete free access periods" ON public.free_access_periods;
DROP POLICY IF EXISTS "Admins can select free access periods" ON public.free_access_periods;
DROP POLICY IF EXISTS "Users can view active free access periods" ON public.free_access_periods;

-- 3. Neue vereinfachte RLS-Policies erstellen, die die is_admin Funktion verwenden
CREATE POLICY "Admins can manage all free access periods"
  ON public.free_access_periods
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. Policy für normale User, um aktive Freischaltungen zu sehen
CREATE POLICY "Users can view active free access periods"
  ON public.free_access_periods
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    OR 
    (active = true AND start_time <= now() AND end_time > now())
  );
