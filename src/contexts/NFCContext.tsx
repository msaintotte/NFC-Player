import { createContext, useContext, ReactNode } from 'react';
import { useNFC } from '@/hooks/useNFC';
import { AudioConfig } from '@/config/audioConfigs';

interface NFCScan {
  id: string;
  timestamp: number;
  audioConfig: AudioConfig;
}

interface NFCContextValue {
  isSupported: boolean;
  isScanning: boolean;
  scans: NFCScan[];
  currentAudio: AudioConfig | null;
  permissionStatus: 'unknown' | 'granted' | 'denied';
  errorMessage: string;
  saveScan: (audioConfig: AudioConfig) => void;
  simulateScan: (audioId: string) => Promise<void>;
  clearHistory: () => void;
  playAudio: (audioConfig: AudioConfig) => void;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
}

const NFCContext = createContext<NFCContextValue | null>(null);

export const NFCProvider = ({ children }: { children: ReactNode }) => {
  const nfc = useNFC();

  return (
    <NFCContext.Provider value={nfc}>
      {children}
    </NFCContext.Provider>
  );
};

export const useNFCContext = (): NFCContextValue => {
  const ctx = useContext(NFCContext);
  if (!ctx) {
    throw new Error('useNFCContext must be used inside <NFCProvider>');
  }
  return ctx;
};
