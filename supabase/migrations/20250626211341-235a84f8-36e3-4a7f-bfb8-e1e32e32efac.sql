
-- Add message_type column to messages table
ALTER TABLE public.messages 
ADD COLUMN message_type text DEFAULT 'text' NOT NULL;

-- Add check constraint to ensure only valid message types
ALTER TABLE public.messages 
ADD CONSTRAINT check_message_type 
CHECK (message_type IN ('text', 'audio'));
