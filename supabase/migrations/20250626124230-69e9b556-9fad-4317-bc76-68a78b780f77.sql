
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create women/characters table
CREATE TABLE public.women (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  description TEXT,
  personality TEXT,
  image_url TEXT,
  webhook_url TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  woman_id UUID REFERENCES public.women(id) ON DELETE CASCADE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, woman_id)
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  woman_id UUID REFERENCES public.women(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.women ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Create function to check if user has subscription to woman
CREATE OR REPLACE FUNCTION public.has_subscription(user_id UUID, woman_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriptions.user_id = $1 
    AND subscriptions.woman_id = $2 
    AND active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for women
CREATE POLICY "Anyone can view women" ON public.women
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage women" ON public.women
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for chats
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create chats for subscribed women" ON public.chats
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    public.has_subscription(auth.uid(), woman_id)
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages from own chats" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own chats" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- Create trigger function for profile creation
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
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample women data
INSERT INTO public.women (name, age, description, personality, image_url, webhook_url, interests, price) VALUES
('Emma', 24, 'Ich liebe es, neue Orte zu entdecken und Menschen kennenzulernen. Fitness ist meine Leidenschaft und ich koche gerne für Freunde.', 'Lebensfroh, abenteuerlustig und immer für Spaß zu haben!', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop', 'https://api.example.com/emma', ARRAY['Fitness', 'Reisen', 'Kochen', 'Musik', 'Yoga'], 9.99),
('Sophie', 22, 'Kreative Seele mit einer Leidenschaft für Fotografie und Kunst. Verbringe gerne Zeit in Cafés mit einem guten Buch.', 'Nachdenklich, kreativ und ein bisschen verträumt.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop', 'https://api.example.com/sophie', ARRAY['Kunst', 'Fotografie', 'Kaffee', 'Bücher'], 9.99),
('Lisa', 26, 'Tänzerin mit einer Vorliebe für Mode und Wellness. Liebe es, gemütliche Filmabende zu verbringen.', 'Elegant, selbstbewusst und voller Energie.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop', 'https://api.example.com/lisa', ARRAY['Tanzen', 'Mode', 'Wellness', 'Filme'], 9.99),
('Anna', 23, 'Naturliebhaberin, die gerne wandert und Zeit mit Tieren verbringt. Meditation hilft mir, zur Ruhe zu kommen.', 'Ruhig, naturverbunden und sehr einfühlsam.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop', 'https://api.example.com/anna', ARRAY['Natur', 'Wandern', 'Tiere', 'Meditation'], 9.99),
('Mia', 25, 'Tech-begeisterte Gamerin mit einer Schwäche für Anime. Programmiere in meiner Freizeit und liebe komplexe Herausforderungen.', 'Intelligent, verspielt und immer neugierig auf neue Technologien.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop', 'https://api.example.com/mia', ARRAY['Gaming', 'Technologie', 'Anime', 'Coding'], 9.99),
('Julia', 27, 'Erfolgreiche Unternehmerin mit einer Leidenschaft für guten Wein und Reisen. Networking ist mein zweiter Vorname.', 'Ambitioniert, charismatisch und weltoffen.', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop', 'https://api.example.com/julia', ARRAY['Business', 'Networking', 'Wine', 'Travel'], 9.99);
