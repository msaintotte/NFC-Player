import { Smartphone, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFCBannerProps {
  isSupported: boolean;
  isScanning: boolean;
}

export const NFCBanner = ({ isSupported, isScanning }: NFCBannerProps) => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-8 text-center">
      <div className={cn(
        "inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-4",
        isScanning && "animate-pulse"
      )}>
        <Wifi className="w-12 h-12 text-primary-foreground" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {isScanning ? 'Scanning...' : 'Ready to Scan'}
      </h2>
      
      <p className="text-muted-foreground mb-4">
        Tap an NFC tag to play your music
      </p>
      
      <div className="flex items-center justify-center gap-2 text-sm">
        <Smartphone className="w-4 h-4" />
        <span className={cn(
          "font-medium",
          isSupported ? "text-primary" : "text-muted-foreground"
        )}>
          {isSupported ? 'NFC Enabled' : 'NFC Not Available'}
        </span>
      </div>
    </div>
  );
};
