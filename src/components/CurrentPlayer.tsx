import { Play, Pause, Music, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioConfig } from '@/config/audioConfigs';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface CurrentPlayerProps {
  audio: AudioConfig | null;
}

export const CurrentPlayer = ({ audio }: CurrentPlayerProps) => {
  const { isPlaying, currentTime, duration, togglePlay, seek, loadAudio } = useAudioPlayer();

  useEffect(() => {
    if (audio?.type === 'local' && audio.audioUrl) {
      loadAudio(audio.audioUrl);
    }
  }, [audio?.audioUrl, loadAudio, audio?.type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(duration * percentage);
  };

  const openExternalLink = () => {
    if (audio?.type === 'spotify' && audio.spotifyUrl) {
      window.open(audio.spotifyUrl, '_blank');
    } else if (audio?.type === 'youtube' && audio.youtubeUrl) {
      window.open(audio.youtubeUrl, '_blank');
    } else if (audio?.type === 'newsletter' && audio.newsletterUrl) {
      window.open(audio.newsletterUrl, '_blank');
    }
  };

  if (!audio) {
    return (
      <div className="bg-card rounded-lg p-8 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No audio playing</p>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'spotify':
        return 'bg-spotify';
      case 'youtube':
        return 'bg-youtube';
      case 'newsletter':
        return 'bg-newsletter';
      default:
        return 'bg-pudis';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <img
            src={audio.albumArt}
            alt={audio.title}
            className="w-24 h-24 rounded-md object-cover"
          />
          <div className={cn(
            "absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold text-white",
            getTypeColor(audio.type)
          )}>
            {audio.type}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate mb-1">
            {audio.title}
          </h3>
          {audio.artist && (
            <p className="text-sm text-muted-foreground mb-2">{audio.artist}</p>
          )}
          {audio.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {audio.description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {audio.type === 'local' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(currentTime)}
              </span>
              <div 
                className="flex-1 h-2 bg-muted rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-primary transition-all duration-100" 
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6" fill="currentColor" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center pt-2">
            <Button
              onClick={openExternalLink}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en {audio.type === 'spotify' ? 'Spotify' : audio.type === 'youtube' ? 'YouTube' : 'externa'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
