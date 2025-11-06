import { useState, useEffect, useCallback } from 'react';
import { AudioConfig, getAudioConfig } from '@/config/audioConfigs';
import { toast } from 'sonner';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface NFCTag {
  id: string;
  ndefMessage?: {
    records: Array<{
      payload: number[];
    }>;
  };
}

interface NFCError {
  code: string;
  message: string;
}

interface NFCReaderPlugin {
  initialize(): Promise<{ value: boolean }>;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  addListener(
    eventName: 'nfcTagDetected',
    listenerFunc: (tag: NFCTag) => void
  ): Promise<any>;
  addListener(
    eventName: 'nfcError',
    listenerFunc: (error: NFCError) => void
  ): Promise<any>;
  removeAllListeners(): Promise<void>;
}

const NfcReader = registerPlugin<NFCReaderPlugin>('CapacitorNfcReader');

interface NFCScan {
  id: string;
  timestamp: number;
  audioConfig: AudioConfig;
}

export const useNFC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scans, setScans] = useState<NFCScan[]>([]);
  const [currentAudio, setCurrentAudio] = useState<AudioConfig | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    const initNFC = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsSupported(true);
        
        try {
          await NfcReader.initialize();
          console.log('NFC initialized successfully');
          
          NfcReader.addListener('nfcTagDetected', (event: any) => {
            console.log('NFC Tag detected:', event);
            
            try {
              const audioId = parseNdefMessage(event);
              
              if (audioId) {
                const config = getAudioConfig(audioId);
                
                if (config) {
                  saveScan(config);
                  playAudio(config);
                  toast.success(`🎵 ${config.title}`);
                } else {
                  toast.warning('Tag no reconocido: ' + audioId);
                }
              }
            } catch (error) {
              console.error('Error processing NFC tag:', error);
              toast.error('Error al leer el tag');
            }
          });
          
          NfcReader.addListener('nfcError', (error: any) => {
            console.error('NFC Error:', error);
            toast.error('Error al leer tag NFC');
          });
          
          await NfcReader.startScanning();
          setIsScanning(true);
          setPermissionStatus('granted');
          toast.success('NFC activado - Acerca un tag');
          
        } catch (error: any) {
          console.error('Error initializing NFC:', error);
          setIsSupported(false);
          setPermissionStatus('denied');
          toast.error('Error al inicializar NFC');
        }
      } else {
        setIsSupported(false);
        console.log('NFC only supported on native platforms');
      }
    };

    initNFC();
    loadScansFromStorage();
  }, []);

  const parseNdefMessage = (event: any): string | null => {
    try {
      if (event.ndefMessage && event.ndefMessage.records) {
        const textDecoder = new TextDecoder();
        const firstRecord = event.ndefMessage.records[0];
        
        if (firstRecord && firstRecord.payload) {
          const payload = new Uint8Array(firstRecord.payload);
          let audioId = textDecoder.decode(payload);
          
          audioId = audioId.replace(/^\x02en/, '').replace(/^\x03/, '').trim();
          
          return audioId;
        }
      }
    } catch (error) {
      console.error('Error parsing NDEF message:', error);
    }
    return null;
  };

  const stopScan = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await NfcReader.stopScanning();
      }
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
    }
  };

  const loadScansFromStorage = () => {
    const savedScans = localStorage.getItem('pudis-scans');
    if (savedScans) {
      try {
        setScans(JSON.parse(savedScans));
      } catch (e) {
        console.error('Failed to load scans:', e);
      }
    }
  };

  const saveScan = useCallback((audioConfig: AudioConfig) => {
    const newScan: NFCScan = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      audioConfig,
    };

    setScans((prev) => {
      const updated = [newScan, ...prev].slice(0, 10); // Keep only last 10
      localStorage.setItem('pudis-scans', JSON.stringify(updated));
      return updated;
    });

    setCurrentAudio(audioConfig);
  }, []);

  const openUrl = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const simulateScan = useCallback((audioId: string) => {
    const config = getAudioConfig(audioId);
    if (config) {
      saveScan(config);
      
      // Open appropriate URL if available
      if (config.type === 'spotify' && config.spotifyUrl) {
        openUrl(config.spotifyUrl);
      } else if (config.type === 'youtube' && config.youtubeUrl) {
        openUrl(config.youtubeUrl);
      } else if (config.type === 'newsletter' && config.newsletterUrl) {
        openUrl(config.newsletterUrl);
      }
    }
  }, [saveScan, openUrl]);

  const clearHistory = useCallback(() => {
    setScans([]);
    localStorage.removeItem('pudis-scans');
  }, []);

  const playAudio = useCallback((audioConfig: AudioConfig) => {
    setCurrentAudio(audioConfig);
    
    if (audioConfig.type === 'spotify' && audioConfig.spotifyUrl) {
      openUrl(audioConfig.spotifyUrl);
    } else if (audioConfig.type === 'youtube' && audioConfig.youtubeUrl) {
      openUrl(audioConfig.youtubeUrl);
    } else if (audioConfig.type === 'newsletter' && audioConfig.newsletterUrl) {
      openUrl(audioConfig.newsletterUrl);
    }
  }, [openUrl]);

  return {
    isSupported,
    isScanning,
    scans,
    currentAudio,
    permissionStatus,
    saveScan,
    simulateScan,
    clearHistory,
    playAudio,
    stopScan,
  };
};
