
-- Fix user_roles RLS: only admins can INSERT/UPDATE/DELETE roles
-- This prevents privilege escalation (users assigning themselves admin)

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix storage: restrict UPDATE on audio-files to admins only
DROP POLICY IF EXISTS "Allow authenticated users to update audio files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update audio files" ON storage.objects;

CREATE POLICY "Only admins can update audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
