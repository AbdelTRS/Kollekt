-- Create bucket for sealed product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('sealed-images', 'sealed-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access to sealed images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sealed images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own sealed images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own sealed images" ON storage.objects;

-- Create new policies for sealed-images bucket
CREATE POLICY "Public Access to sealed images"
ON storage.objects FOR SELECT
USING (bucket_id = 'sealed-images');

CREATE POLICY "Authenticated users can upload sealed images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'sealed-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own sealed images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'sealed-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'sealed-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own sealed images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'sealed-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Make sure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated; 