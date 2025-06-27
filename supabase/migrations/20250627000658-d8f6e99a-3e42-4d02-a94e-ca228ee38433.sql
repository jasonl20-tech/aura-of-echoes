
-- Erstelle eine RLS-Policy die es allen Benutzern (auch nicht-eingeloggten) erlaubt, Frauen-Profile zu lesen
CREATE POLICY "Allow public read access to women profiles"
  ON public.women
  FOR SELECT
  TO public
  USING (true);
