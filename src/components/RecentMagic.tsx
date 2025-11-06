import { Clock } from 'lucide-react';
import { AudioConfig } from '@/config/audioConfigs';
import { cn } from '@/lib/utils';

interface NFCScan {
  id: string;
  timestamp: number;
  audioConfig: AudioConfig;
}

interface RecentMagicProps {
  scans: NFCScan[];
  onPlay: (audio: AudioConfig) => void;
}

export const RecentMagic = ({ scans, onPlay }: RecentMagicProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (scans.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No recent scans</p>
        <p className="text-sm text-muted-foreground">Tap an NFC tag to get started</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Magic
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {scans.map((scan) => (
          <button
            key={scan.id}
            onClick={() => onPlay(scan.audioConfig)}
            className="bg-card rounded-lg p-3 shadow-card hover:shadow-card-hover transition-all text-left"
          >
            <img
              src={scan.audioConfig.albumArt}
              alt={scan.audioConfig.title}
              className="w-full aspect-square rounded-md object-cover mb-2"
            />
            <h3 className="font-semibold text-sm truncate mb-1">
              {scan.audioConfig.title}
            </h3>
            {scan.audioConfig.artist && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                {scan.audioConfig.artist}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatTime(scan.timestamp)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
