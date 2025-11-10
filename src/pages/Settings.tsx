import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, Info, Smartphone } from 'lucide-react';
import { useNFC } from '@/hooks/useNFC';
import { useKeepAwakeSettings } from '@/hooks/useKeepAwakeSettings';
import { toast } from 'sonner';

const Settings = () => {
  const { clearHistory, scans } = useNFC();
  const { isKeepAwakeEnabled, toggleKeepAwake } = useKeepAwakeSettings();

  const handleClearHistory = () => {
    clearHistory();
    toast.success('History cleared successfully');
  };

  const handleToggleKeepAwake = () => {
    toggleKeepAwake();
    toast.success(
      isKeepAwakeEnabled 
        ? 'La pantalla ahora puede apagarse durante la reproducción' 
        : 'La pantalla permanecerá activa durante la reproducción'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your PUDIS preferences
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Playback
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Keep Screen Awake</p>
                <p className="text-sm text-muted-foreground">
                  Prevent screen from turning off during playback
                </p>
              </div>
              <Switch
                checked={isKeepAwakeEnabled}
                onCheckedChange={handleToggleKeepAwake}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">App Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">App ID</span>
                <span className="font-mono text-xs">com.pudis.app</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">History</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Recent Scans</p>
                  <p className="text-sm text-muted-foreground">
                    {scans.length} {scans.length === 1 ? 'scan' : 'scans'} saved
                  </p>
                </div>
              </div>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleClearHistory}
                disabled={scans.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">About PUDIS</p>
              <p className="text-muted-foreground">
                PUDIS is a magical music player that uses NFC technology to instantly play your favorite music. Just tap a tag and enjoy!
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
