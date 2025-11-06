import { useState, useEffect, useCallback } from 'react';
import { AudioConfig, getAudioConfig } from '@/config/audioConfigs';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { NFC, NDEFMessagesTransformable, NFCError } from '@exxili/capacitor-nfc';

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
      if (!Capacitor.isNativePlatform()) {
        setIsSupported(false);
        console.log('NFC only supported on native platforms');
        return;
      }

      try {
        const { supported } = await NFC.isSupported();
        setIsSupported(supported);
        
        if (!supported) {
          setPermissionStatus('denied');
          toast.error('NFC no está disponible en este dispositivo');
          return;
        }

        NFC.onRead((data: NDEFMessagesTransformable) => {
          console.log('NFC Tag detected:', data);
          
          try {
            const audioId = parseNdefMessage(data);
            
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

        NFC.onError((error: NFCError) => {
          console.error('NFC Error:', error);
          toast.error('Error al leer tag NFC');
        });
        
        await NFC.startScan();
        setIsScanning(true);
        setPermissionStatus('granted');
        toast.success('NFC activado - Acerca un tag');
          
      } catch (error: any) {
        console.error('Error initializing NFC:', error);
        setIsSupported(false);
        setPermissionStatus('denied');
        toast.error('Error al inicializar NFC');
      }
    };

    initNFC();
    loadScansFromStorage();
  }, []);

  const parseNdefMessage = (data: NDEFMessagesTransformable): string | null => {
    try {
      const asString = data.string();
      
      if (!asString.messages || asString.messages.length === 0) return null;
      
      const firstMessage = asString.messages[0];
      if (!firstMessage?.records || firstMessage.records.length === 0) return null;
      
      const firstRecord = firstMessage.records[0];
      if (!firstRecord?.payload) return null;

      let audioId = firstRecord.payload;
      audioId = audioId.replace(/^\x02en/, '').replace(/^\x03/, '').trim();

      return audioId;
    } catch (error) {
      console.error('Error parsing NDEF message:', error);
      return null;
    }
  };

  const stopScan = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await NFC.cancelScan();
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
