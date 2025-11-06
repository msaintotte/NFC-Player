import { useState, useEffect, useCallback } from 'react';
import { AudioConfig, getAudioConfig } from '@/config/audioConfigs';
import { toast } from 'sonner';

interface NFCScan {
  id: string;
  timestamp: number;
  audioConfig: AudioConfig;
}

declare global {
  interface Window {
    NDEFReader: any;
  }
}

export const useNFC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scans, setScans] = useState<NFCScan[]>([]);
  const [currentAudio, setCurrentAudio] = useState<AudioConfig | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    const initNFC = async () => {
      if ('NDEFReader' in window) {
        setIsSupported(true);
        
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'nfc' as PermissionName });
          
          if (permissionStatus.state === 'granted') {
            setPermissionStatus('granted');
            await startAutoScan();
          } else if (permissionStatus.state === 'prompt') {
            setPermissionStatus('unknown');
            await startAutoScan();
          } else {
            setPermissionStatus('denied');
          }
          
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state as any);
          };
        } catch (error) {
          console.log('Permissions API not supported, attempting scan anyway');
          await startAutoScan();
        }
      }
    };

    initNFC();
    loadScansFromStorage();
  }, []);

  const startAutoScan = async () => {
    try {
      const ndef = new window.NDEFReader();
      setIsScanning(true);
      
      await ndef.scan();
      setPermissionStatus('granted');
      toast.success('NFC activado - Acerca un tag');
      
      ndef.onreading = (event: any) => {
        console.log('NFC Tag detected:', event);
        
        try {
          const message = event.message;
          
          if (message && message.records && message.records.length > 0) {
            const textDecoder = new TextDecoder();
            const firstRecord = message.records[0];
            
            let audioId = '';
            
            if (firstRecord.recordType === 'text') {
              const textData = firstRecord.data;
              const decoded = textDecoder.decode(textData);
              audioId = decoded.replace(/^\x02en/, '').trim();
            } else if (firstRecord.recordType === 'url') {
              audioId = textDecoder.decode(firstRecord.data);
            }
            
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
          }
        } catch (error) {
          console.error('Error processing NFC tag:', error);
          toast.error('Error al leer el tag');
        }
      };
      
      ndef.onreadingerror = () => {
        toast.error('Error al leer el tag NFC');
      };
      
    } catch (error: any) {
      console.error('Error starting NFC scan:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionStatus('denied');
        toast.error('Permisos NFC denegados');
      } else {
        toast.error('Error al iniciar escaneo NFC');
      }
      
      setIsScanning(false);
    }
  };

  const stopScan = async () => {
    setIsScanning(false);
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
