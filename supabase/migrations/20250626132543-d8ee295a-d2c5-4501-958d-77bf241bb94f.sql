
-- Erweitere die free_access_periods Tabelle um user_id Spalte für spezifische User-Freischaltungen
ALTER TABLE public.free_access_periods 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Aktualisiere die has_free_access Funktion um spezifische User zu unterstützen
CREATE OR REPLACE FUNCTION public.has_free_access(woman_id uuid, specific_user_id uuid DEFAULT NULL)
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
    AND (
      -- Entweder für alle User (user_id ist NULL)
      user_id IS NULL 
      OR 
      -- Oder für den spezifischen User
      ($2 IS NOT NULL AND user_id = $2)
    )
  );
$$;

-- Aktualisiere die has_subscription_or_free_access Funktion
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
    -- Oder Frau ist kostenlos freigeschaltet (allgemein oder spezifisch für diesen User)
    public.has_free_access($2, $1)
  );
$$;
