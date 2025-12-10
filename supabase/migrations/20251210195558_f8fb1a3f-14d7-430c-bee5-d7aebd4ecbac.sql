-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own audio files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own audio files
CREATE POLICY "Users can view their own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own audio files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access since bucket is public (for playback)
CREATE POLICY "Public can read audio files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio-recordings');