
-- RLS-Policies für die chats Tabelle erstellen
CREATE POLICY "Users can create their own chats"
  ON public.chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chats"
  ON public.chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
  ON public.chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON public.chats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS-Policies für die messages Tabelle erstellen
CREATE POLICY "Users can insert messages in their chats"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their chats"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- RLS für messages Tabelle aktivieren (falls noch nicht aktiviert)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS für chats Tabelle aktivieren (falls noch nicht aktiviert)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
