import { Header } from '@/components/Header';
import { NFCBanner } from '@/components/NFCBanner';
import { CurrentPlayer } from '@/components/CurrentPlayer';
import { RecentMagic } from '@/components/RecentMagic';
import { BottomNav } from '@/components/BottomNav';
import { useNFCContext } from '@/contexts/NFCContext';

const Index = () => {
  const { isSupported, isScanning, scans, currentAudio, permissionStatus, errorMessage, playAudio } = useNFCContext();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 space-y-6">
        <NFCBanner 
          isSupported={isSupported} 
          isScanning={isScanning}
          permissionStatus={permissionStatus}
          errorMessage={errorMessage}
        />
        
        <CurrentPlayer audio={currentAudio} />
        
        <RecentMagic scans={scans} onPlay={playAudio} />
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
