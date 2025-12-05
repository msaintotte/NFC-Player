-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing permissive policies on audio_configs
DROP POLICY IF EXISTS "Anyone can delete audio configs" ON public.audio_configs;
DROP POLICY IF EXISTS "Anyone can insert audio configs" ON public.audio_configs;
DROP POLICY IF EXISTS "Anyone can update audio configs" ON public.audio_configs;
DROP POLICY IF EXISTS "Anyone can view audio configs" ON public.audio_configs;

-- Create new secure policies for audio_configs
-- SELECT: Everyone can read (needed for app to work)
CREATE POLICY "Anyone can view audio configs"
ON public.audio_configs
FOR SELECT
USING (true);

-- INSERT: Only admins
CREATE POLICY "Only admins can insert audio configs"
ON public.audio_configs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- UPDATE: Only admins
CREATE POLICY "Only admins can update audio configs"
ON public.audio_configs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- DELETE: Only admins
CREATE POLICY "Only admins can delete audio configs"
ON public.audio_configs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for audio-files bucket
-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Anyone can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view audio files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete audio files" ON storage.objects;

-- SELECT: Everyone can read audio files (needed for playback)
CREATE POLICY "Anyone can view audio files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-files');

-- INSERT: Only admins can upload
CREATE POLICY "Only admins can upload audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files' AND public.has_role(auth.uid(), 'admin'));

-- DELETE: Only admins can delete
CREATE POLICY "Only admins can delete audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio-files' AND public.has_role(auth.uid(), 'admin'));