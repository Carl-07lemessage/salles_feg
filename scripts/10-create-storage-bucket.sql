-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view room images (public bucket)
CREATE POLICY "Public Access for room images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

-- Policy: Authenticated users can upload room images
CREATE POLICY "Authenticated users can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can update room images
CREATE POLICY "Authenticated users can update room images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'room-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete room images
CREATE POLICY "Authenticated users can delete room images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-images' 
  AND auth.role() = 'authenticated'
);
