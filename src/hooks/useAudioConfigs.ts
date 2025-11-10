import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AudioConfig } from '@/config/audioConfigs';
import { toast } from 'sonner';

export const useAudioConfigs = () => {
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['audio-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audio_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert snake_case to camelCase for TypeScript
      return (data || []).map((item: any) => ({
        ...item,
        albumArt: item.album_art,
        audioUrl: item.audio_url,
        spotifyUrl: item.spotify_url,
        youtubeUrl: item.youtube_url,
        newsletterUrl: item.newsletter_url,
      })) as AudioConfig[];
    },
  });

  const uploadAudio = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error) => {
      toast.error('Error al subir el archivo', {
        description: error.message,
      });
    },
  });

  const createConfig = useMutation({
    mutationFn: async (config: Omit<AudioConfig, 'created_at' | 'updated_at'>) => {
      // Convert camelCase to snake_case for database
      const dbConfig = {
        ...config,
        album_art: config.albumArt,
        audio_url: config.audioUrl,
        spotify_url: config.spotifyUrl,
        youtube_url: config.youtubeUrl,
        newsletter_url: config.newsletterUrl,
      };
      
      // Remove camelCase properties
      const { albumArt, audioUrl, spotifyUrl, youtubeUrl, newsletterUrl, ...rest } = dbConfig as any;
      
      const { error } = await supabase
        .from('audio_configs')
        .insert([rest]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-configs'] });
      toast.success('Audio agregado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear la configuración', {
        description: error.message,
      });
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AudioConfig> & { id: string }) => {
      const { error } = await supabase
        .from('audio_configs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-configs'] });
      toast.success('Audio actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar la configuración', {
        description: error.message,
      });
    },
  });

  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('audio_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-configs'] });
      toast.success('Audio eliminado correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar la configuración', {
        description: error.message,
      });
    },
  });

  return {
    configs,
    isLoading,
    uploadAudio,
    createConfig,
    updateConfig,
    deleteConfig,
  };
};

export const getAudioConfigById = async (id: string): Promise<AudioConfig | null> => {
  const { data, error } = await supabase
    .from('audio_configs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching audio config:', error);
    return null;
  }

  if (!data) return null;

  // Convert snake_case to camelCase for TypeScript
  return {
    ...data,
    albumArt: data.album_art,
    audioUrl: data.audio_url,
    spotifyUrl: data.spotify_url,
    youtubeUrl: data.youtube_url,
    newsletterUrl: data.newsletter_url,
  } as AudioConfig;
};
