-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/ogg', 'audio/webm']
);

-- Create storage policies for audio files
CREATE POLICY "Anyone can view audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');

CREATE POLICY "Anyone can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "Anyone can update their audio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio-files');

CREATE POLICY "Anyone can delete audio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio-files');

-- Create table for audio configurations
CREATE TABLE public.audio_configs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  description TEXT,
  album_art TEXT,
  duration TEXT,
  type TEXT NOT NULL CHECK (type IN ('local', 'spotify', 'youtube', 'newsletter')),
  audio_url TEXT,
  spotify_url TEXT,
  youtube_url TEXT,
  newsletter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audio_configs
ALTER TABLE public.audio_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for audio_configs (public read, anyone can manage for now)
CREATE POLICY "Anyone can view audio configs"
ON public.audio_configs FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert audio configs"
ON public.audio_configs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update audio configs"
ON public.audio_configs FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete audio configs"
ON public.audio_configs FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_audio_configs_updated_at
BEFORE UPDATE ON public.audio_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing configurations from the static file
INSERT INTO public.audio_configs (id, title, artist, description, album_art, duration, type, audio_url, spotify_url, youtube_url, newsletter_url)
VALUES
  ('totoro', 'My Neighbor Totoro - Lullaby', 'Joe Hisaishi', 'Peaceful lullaby from the beloved Studio Ghibli film', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d', '3:45', 'local', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', NULL, NULL, NULL),
  ('podcast1', 'The Daily - Morning Briefing', 'The New York Times', 'Today''s most important stories in 20 minutes', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618', '20:15', 'spotify', NULL, 'https://open.spotify.com/episode/3kxYzDQ1xqXrJmq8GZG7Gf', NULL, NULL),
  ('marcos', 'Meditations - Book 1', 'Marcus Aurelius', 'Timeless wisdom from the Roman Emperor', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', '45:30', 'local', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', NULL, NULL, NULL),
  ('chill', 'Lo-fi Beats to Relax', 'Various Artists', 'Perfect background music for studying or working', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', '2:15:00', 'spotify', NULL, 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn', NULL, NULL),
  ('jazz', 'Blue in Green', 'Miles Davis', 'Classic jazz from Kind of Blue', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f', '5:37', 'local', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', NULL, NULL, NULL),
  ('youtube1', 'Video de Prueba', 'YouTube', 'Video de prueba para NFC', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0', '3:30', 'youtube', NULL, NULL, 'https://www.youtube.com/watch?v=hPrDqHFQdZo', NULL),
  ('spotify1', 'Canción de Prueba', 'Spotify', 'Canción de prueba para NFC', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17', '4:20', 'spotify', NULL, 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp', NULL, NULL),
  ('marcopolo', 'Marco Aurelio - Meditaciones', 'Marco Aurelio', 'Sabiduría estoica del emperador romano', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', '45:30', 'local', '/audio/marco-polo.m4a', NULL, NULL, NULL);