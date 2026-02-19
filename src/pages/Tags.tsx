import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tag, Plus, Loader2 } from 'lucide-react';
import { useAudioConfigs } from '@/hooks/useAudioConfigs';
import { useNFCContext } from '@/contexts/NFCContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Tags = () => {
  const { configs, isLoading } = useAudioConfigs();
  const { simulateScan } = useNFCContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mis Tags</h1>
          <p className="text-muted-foreground">
            Gestiona tus tags NFC y prueba las configuraciones de audio
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No hay audios configurados aún</p>
            <Button onClick={() => navigate('/admin')}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar tu primer audio
            </Button>
          </div>
        ) : (
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
                      Probar scan
                    </Button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        <Button
          className="w-full mt-6"
          variant="outline"
          size="lg"
          onClick={() => navigate('/admin')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar nuevo tag
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Tags;
