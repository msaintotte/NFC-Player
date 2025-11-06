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
                    title: isYouTube ? 'YouTube Video' : 'Spotify Track',
                    artist: 'Escaneado desde NFC',
                    description: content,
                    type: isYouTube ? 'youtube' : 'spotify',
                    youtubeUrl: isYouTube ? content : undefined,
                    spotifyUrl: isSpotify ? content : undefined,
                    albumArt: isYouTube 
                      ? 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200' 
                      : 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200',
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
      
      // Manejar prefijos NDEF RTD_URI
      if (content.charCodeAt(0) <= 0x23) {
        const prefixCode = content.charCodeAt(0);
        const prefixMap: { [key: number]: string } = {
          0x00: '',
          0x01: 'http://www.',
          0x02: 'https://www.',
          0x03: 'http://',
          0x04: 'https://',
          0x05: 'tel:',
          0x06: 'mailto:',
          0x07: 'ftp://anonymous:anonymous@',
          0x08: 'ftp://ftp.',
          0x09: 'ftps://',
          0x0A: 'sftp://',
          0x0B: 'smb://',
          0x0C: 'nfs://',
          0x0D: 'ftp://',
          0x0E: 'dav://',
          0x0F: 'news:',
          0x10: 'telnet://',
          0x11: 'imap:',
          0x12: 'rtsp://',
          0x13: 'urn:',
          0x14: 'pop:',
          0x15: 'sip:',
          0x16: 'sips:',
          0x17: 'tftp:',
          0x18: 'btspp://',
          0x19: 'btl2cap://',
          0x1A: 'btgoep://',
          0x1B: 'tcpobex://',
          0x1C: 'irdaobex://',
          0x1D: 'file://',
          0x1E: 'urn:epc:id:',
          0x1F: 'urn:epc:tag:',
          0x20: 'urn:epc:pat:',
          0x21: 'urn:epc:raw:',
          0x22: 'urn:epc:',
          0x23: 'urn:nfc:',
        };
        
        const prefix = prefixMap[prefixCode];
        if (prefix !== undefined) {
          content = prefix + content.slice(1);
        }
      }
      
      // Limpiar prefijos de idioma comunes (ej: "\x02en")
      content = content.replace(/^\x02en/, '').trim();

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
