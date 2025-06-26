
-- Tabelle für zeitbasierte Freischaltungen durch Admins
CREATE TABLE public.free_access_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  woman_id UUID REFERENCES public.women(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- RLS aktivieren
ALTER TABLE public.free_access_periods ENABLE ROW LEVEL SECURITY;

-- Policy für Admins (können alle sehen und bearbeiten)
CREATE POLICY "Admins can manage free access periods"
  ON public.free_access_periods
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy für normale User (können nur aktive Freischaltungen sehen)
CREATE POLICY "Users can view active free access periods"
  ON public.free_access_periods
  FOR SELECT
  USING (
    active = true 
    AND start_time <= now() 
    AND end_time > now()
  );

-- Funktion um zu prüfen ob eine Frau kostenlos verfügbar ist
CREATE OR REPLACE FUNCTION public.has_free_access(woman_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.free_access_periods
    WHERE free_access_periods.woman_id = $1
    AND active = true
    AND start_time <= now()
    AND end_time > now()
  );
$$;

-- Aktualisierte Subscription-Check Funktion die auch Freischaltungen berücksichtigt
CREATE OR REPLACE FUNCTION public.has_subscription_or_free_access(user_id uuid, woman_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (
    -- Hat aktives Abonnement
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.user_id = $1 
      AND subscriptions.woman_id = $2 
      AND active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
    )
    OR 
    -- Oder Frau ist kostenlos freigeschaltet
    public.has_free_access($2)
  );
$$;
