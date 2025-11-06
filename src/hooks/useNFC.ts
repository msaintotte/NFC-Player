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
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const initNFC = async () => {
      console.log('🔧 [NFC Init] Platform:', Capacitor.getPlatform());
      console.log('🔧 [NFC Init] isNativePlatform:', Capacitor.isNativePlatform());
      
      if (!Capacitor.isNativePlatform()) {
        setIsSupported(false);
        console.log('NFC only supported on native platforms');
        return;
      }

      try {
        const { supported } = await NFC.isSupported();
        console.log('🔧 [NFC Init] isSupported result:', supported);
        setIsSupported(supported);
        
        if (!supported) {
          setPermissionStatus('unknown');
          setErrorMessage('NFC no está disponible en este dispositivo');
          console.log('NFC isSupported returned false');
          return;
        }

        NFC.onRead((data: NDEFMessagesTransformable) => {
          console.log('NFC Tag detected:', data);
          
          try {
            const content = parseNdefMessage(data);
            
            if (content) {
              const config = getAudioConfig(content);
              
              if (config) {
                // Tag reconocido en audioConfigs
                saveScan(config);
                playAudio(config);
                toast.success(`🎵 ${config.title}`);
              } else {
                // Tag no reconocido - verificar si es una URL directa
                const isYouTube = content.includes('youtube.com') || content.includes('youtu.be');
                const isSpotify = content.includes('spotify.com');
                
                if (isYouTube || isSpotify) {
                  // Crear config temporal para guardar en historial
                  const tempConfig: AudioConfig = {
                    id: `url_${Date.now()}`,
                    title: isYouTube ? 'YouTube Link' : 'Spotify Link',
                    artist: 'Direct URL',
                    description: content,
                    type: isYouTube ? 'youtube' : 'spotify',
                    youtubeUrl: isYouTube ? content : undefined,
                    spotifyUrl: isSpotify ? content : undefined,
                  };
                  
                  saveScan(tempConfig);
                  playAudio(tempConfig);
                  toast.success(`🎵 ${tempConfig.title}`);
                } else {
                  toast.warning('Tag no reconocido: ' + content);
                }
              }
            }
          } catch (error) {
            console.error('Error processing NFC tag:', error);
            toast.error('Error al leer el tag');
          }
        });

        NFC.onError((error: NFCError) => {
          console.error('NFC Error:', error);
          const errorMsg = JSON.stringify(error);
          
          // En Android, el error "does not require startScan" es informativo, no crítico
          if (Capacitor.getPlatform() === 'android' && 
              (errorMsg.includes('does not require') || errorMsg.includes('startScan'))) {
            console.log('ℹ️ Android: escaneo automático activo');
            toast.info('Android: escaneo automático activo');
            return;
          }
          
          setErrorMessage(`Error NFC: ${errorMsg}`);
          toast.error('Error al leer tag NFC');
        });
        
        // En Android, el escaneo es automático después de registrar los listeners
        setIsScanning(true);
        setPermissionStatus('granted');
        setErrorMessage('');
        toast.success('NFC activado - Acerca un tag');
          
      } catch (error: any) {
        console.error('Error initializing NFC:', error);
        const errorMsg = error.message || error.toString();
        
        // En Android, el error "does not require startScan" significa que el escaneo ya está activo
        if (Capacitor.getPlatform() === 'android' && 
            (errorMsg.includes('does not require') || errorMsg.includes('startScan'))) {
          console.log('ℹ️ Android: escaneo automático detectado');
          setIsScanning(true);
          setPermissionStatus('granted');
          setErrorMessage('');
          toast.info('Android: escaneo automático activo');
          return;
        }
        
        setErrorMessage(errorMsg);
        
        // Don't mark as "denied" if it's just plugin not implemented or device not supported
        if (errorMsg.includes('not implemented') || errorMsg.includes('not available')) {
          setPermissionStatus('unknown');
          setIsSupported(false);
        } else {
          setPermissionStatus('denied');
        }
        
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

      let content = firstRecord.payload;
      // Limpiar prefijos comunes de NDEF pero preservar URLs completas
      content = content.replace(/^\x02en/, '').replace(/^\x03/, '').trim();

      return content;
    } catch (error) {
      console.error('Error parsing NDEF message:', error);
      return null;
    }
  };

  const startScan = useCallback(async () => {
    // En Android, el escaneo es automático - solo actualizamos el estado
    setIsScanning(true);
    setPermissionStatus('granted');
    setErrorMessage('');
    toast.info('En Android el escaneo es automático');
  }, []);

  const stopScan = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await NFC.cancelScan();
      }
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
    }
  }, []);

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
    // No abrir en navegador - dejar que el CurrentPlayer maneje la reproducción
    console.log('URL detected but not opening in browser:', url);
  }, []);

  const playAudio = useCallback((audioConfig: AudioConfig) => {
    setCurrentAudio(audioConfig);
    // No abrir URLs automáticamente - el CurrentPlayer tiene el botón para abrir si el usuario quiere
  }, []);

  const simulateScan = useCallback((audioId: string) => {
    const config = getAudioConfig(audioId);
    if (config) {
      saveScan(config);
      playAudio(config);
    }
  }, [saveScan, playAudio]);

  const clearHistory = useCallback(() => {
    setScans([]);
    localStorage.removeItem('pudis-scans');
  }, []);

  return {
    isSupported,
    isScanning,
    scans,
    currentAudio,
    permissionStatus,
    errorMessage,
    saveScan,
    simulateScan,
    clearHistory,
    playAudio,
    startScan,
    stopScan,
  };
};
