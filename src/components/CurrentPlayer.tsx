import { Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioConfig } from '@/config/audioConfigs';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CurrentPlayerProps {
  audio: AudioConfig | null;
}

export const CurrentPlayer = ({ audio }: CurrentPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

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
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/3 transition-all duration-300" />
          </div>
          {audio.duration && (
            <span className="text-xs text-muted-foreground">{audio.duration}</span>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-600"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6" fill="currentColor" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
