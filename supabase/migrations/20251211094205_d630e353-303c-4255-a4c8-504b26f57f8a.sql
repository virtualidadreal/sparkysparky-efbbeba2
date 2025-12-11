-- Make audio-recordings bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'audio-recordings';

-- Drop the public read policy
DROP POLICY IF EXISTS "Public can read audio files" ON storage.objects;

-- Create policy for authenticated users to read their own audio files
CREATE POLICY "Users can read their own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Keep existing upload policy (users can upload to their own folder)
-- If not exists, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Users can upload their own audio'
  ) THEN
    CREATE POLICY "Users can upload their own audio"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'audio-recordings' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Convert existing public URLs to file paths in ideas table
UPDATE ideas 
SET audio_url = regexp_replace(
  audio_url, 
  'https://[^/]+/storage/v1/object/public/audio-recordings/', 
  ''
) 
WHERE audio_url IS NOT NULL AND audio_url LIKE '%audio-recordings%';