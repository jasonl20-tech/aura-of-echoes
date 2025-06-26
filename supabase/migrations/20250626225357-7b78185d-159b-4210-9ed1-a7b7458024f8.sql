
-- Erweitere die women-Tabelle um neue Preisfelder
ALTER TABLE public.women 
ADD COLUMN pricing_interval text NOT NULL DEFAULT 'monthly',
ADD COLUMN height integer,
ADD COLUMN origin text,
ADD COLUMN nsfw boolean DEFAULT false;

-- Erstelle einen Check-Constraint für gültige Preisintervalle
ALTER TABLE public.women 
ADD CONSTRAINT pricing_interval_check 
CHECK (pricing_interval IN ('daily', 'weekly', 'monthly', 'yearly'));

-- Update bestehende Datensätze
UPDATE public.women 
SET pricing_interval = 'monthly', 
    nsfw = false 
WHERE pricing_interval IS NULL OR nsfw IS NULL;
