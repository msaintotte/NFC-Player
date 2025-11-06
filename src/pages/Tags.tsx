import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tag, Plus } from 'lucide-react';
import { getAllConfigs } from '@/config/audioConfigs';
import { useNFC } from '@/hooks/useNFC';
import { cn } from '@/lib/utils';

const Tags = () => {
  const configs = getAllConfigs();
  const { simulateScan } = useNFC();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">My Tags</h1>
          <p className="text-muted-foreground">
            Manage your NFC tags and test audio configurations
          </p>
        </div>

        <div className="space-y-4">
          {configs.map((config) => {
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
              <div
                key={config.id}
                className="bg-card rounded-lg p-4 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={config.albumArt}
                    alt={config.title}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate">{config.title}</h3>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold text-white flex-shrink-0",
                        getTypeColor(config.type)
                      )}>
                        {config.type}
                      </span>
                    </div>
                    {config.artist && (
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {config.artist}
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => simulateScan(config.id)}
                      className="w-full sm:w-auto"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Test Scan
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full mt-6"
          variant="outline"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Tag
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Tags;
