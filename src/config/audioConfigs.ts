export interface AudioConfig {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  albumArt?: string;
  duration?: string;
  type: 'local' | 'spotify' | 'youtube' | 'newsletter';
  audioUrl?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  newsletterUrl?: string;
}

export const audioConfigs: Record<string, AudioConfig> = {
  totoro: {
    id: 'totoro',
    title: 'My Neighbor Totoro - Lullaby',
    artist: 'Joe Hisaishi',
    description: 'Peaceful lullaby from the beloved Studio Ghibli film',
    albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    duration: '3:45',
    type: 'local',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  podcast1: {
    id: 'podcast1',
    title: 'The Daily - Morning Briefing',
    artist: 'The New York Times',
    description: 'Today\'s most important stories in 20 minutes',
    albumArt: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618',
    duration: '20:15',
    type: 'spotify',
    spotifyUrl: 'https://open.spotify.com/episode/3kxYzDQ1xqXrJmq8GZG7Gf',
  },
  marcos: {
    id: 'marcos',
    title: 'Meditations - Book 1',
    artist: 'Marcus Aurelius',
    description: 'Timeless wisdom from the Roman Emperor',
    albumArt: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    duration: '45:30',
    type: 'local',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  chill: {
    id: 'chill',
    title: 'Lo-fi Beats to Relax',
    artist: 'Various Artists',
    description: 'Perfect background music for studying or working',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    duration: '2:15:00',
    type: 'spotify',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
  },
  jazz: {
    id: 'jazz',
    title: 'Blue in Green',
    artist: 'Miles Davis',
    description: 'Classic jazz from Kind of Blue',
    albumArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f',
    duration: '5:37',
    type: 'local',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  youtube1: {
    id: 'youtube1',
    title: 'Video de Prueba',
    artist: 'YouTube',
    description: 'Video de prueba para NFC',
    albumArt: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
    duration: '3:30',
    type: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=hPrDqHFQdZo',
  },
  spotify1: {
    id: 'spotify1',
    title: 'Canción de Prueba',
    artist: 'Spotify',
    description: 'Canción de prueba para NFC',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
    duration: '4:20',
    type: 'spotify',
    spotifyUrl: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
  },
  marcopolo: {
    id: 'marcopolo',
    title: 'Marco Aurelio - Meditaciones',
    artist: 'Marco Aurelio',
    description: 'Sabiduría estoica del emperador romano',
    albumArt: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    duration: '45:30',
    type: 'local',
    audioUrl: '/audio/marco-polo.m4a',
  },
};

export const getAudioConfig = (id: string): AudioConfig | undefined => {
  return audioConfigs[id];
};

export const getAllConfigs = (): AudioConfig[] => {
  return Object.values(audioConfigs);
};
