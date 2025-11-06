-- Script pour configurer les politiques RLS du bucket room-images
-- Exécutez ce script dans l'éditeur SQL de Supabase après avoir créé le bucket manuellement

-- Activer RLS sur storage.objects si ce n'est pas déjà fait
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Public read access for room images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload room images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update room images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete room images" ON storage.objects;

-- Politique 1: Lecture publique des images de salles
CREATE POLICY "Public read access for room images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'room-images');

-- Politique 2: Les admins peuvent uploader des images
CREATE POLICY "Admins can upload room images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'room-images' 
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Politique 3: Les admins peuvent mettre à jour des images
CREATE POLICY "Admins can update room images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'room-images'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'room-images'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Politique 4: Les admins peuvent supprimer des images
CREATE POLICY "Admins can delete room images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'room-images'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Vérifier que les politiques ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
