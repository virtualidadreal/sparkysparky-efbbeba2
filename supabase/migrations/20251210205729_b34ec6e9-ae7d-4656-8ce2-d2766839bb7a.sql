-- Add preferences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{
  "notifications": {
    "task_reminders": true,
    "weekly_summary": true,
    "product_updates": false
  },
  "theme": "light"
}'::jsonb;

-- Create avatars storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for avatar uploads
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for avatar updates
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for viewing avatars (public)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Create storage policy for deleting own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);