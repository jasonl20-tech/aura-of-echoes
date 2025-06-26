
-- Lösche die bestehende Policy und erstelle eine neue
DROP POLICY IF EXISTS "Admins can manage free access periods" ON public.free_access_periods;

-- Erstelle eine neue Policy für das Einfügen von Freischaltungen
CREATE POLICY "Admins can insert free access periods"
  ON public.free_access_periods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Erstelle eine Policy für das Aktualisieren von Freischaltungen
CREATE POLICY "Admins can update free access periods"
  ON public.free_access_periods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Erstelle eine Policy für das Löschen von Freischaltungen
CREATE POLICY "Admins can delete free access periods"
  ON public.free_access_periods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy für SELECT bleibt unverändert
CREATE POLICY "Admins can select free access periods"
  ON public.free_access_periods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    (active = true AND start_time <= now() AND end_time > now())
  );
