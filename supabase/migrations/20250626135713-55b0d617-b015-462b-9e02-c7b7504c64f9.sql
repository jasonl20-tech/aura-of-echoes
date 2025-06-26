
-- Erstelle Tabelle für automatisch generierte API Keys für jede Frau
CREATE TABLE public.women_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  woman_id UUID NOT NULL REFERENCES public.women(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Index für bessere Performance
CREATE INDEX idx_women_api_keys_woman_id ON public.women_api_keys(woman_id);
CREATE INDEX idx_women_api_keys_api_key ON public.women_api_keys(api_key);

-- RLS Policies für API Keys (nur Admins können diese sehen)
ALTER TABLE public.women_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view API keys" 
  ON public.women_api_keys 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage API keys" 
  ON public.women_api_keys 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Funktion zur automatischen API-Key Generierung
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Trigger zur automatischen API-Key Erstellung bei neuen Frauen
CREATE OR REPLACE FUNCTION public.handle_new_woman()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.women_api_keys (woman_id, api_key)
  VALUES (NEW.id, public.generate_api_key());
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_new_woman_api_key
  AFTER INSERT ON public.women
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_woman();

-- Erstelle API Keys für existierende Frauen
INSERT INTO public.women_api_keys (woman_id, api_key)
SELECT id, public.generate_api_key()
FROM public.women
WHERE id NOT IN (SELECT woman_id FROM public.women_api_keys);
