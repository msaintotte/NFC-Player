import { useState, useEffect, useCallback } from 'react';
import { AudioConfig, getAudioConfig } from '@/config/audioConfigs';

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

  useEffect(() => {
    // Check if NFC is supported
    if ('NDEFReader' in window) {
      setIsSupported(true);
    }

    // Load scans from localStorage
    const savedScans = localStorage.getItem('pudis-scans');
    if (savedScans) {
      try {
        setScans(JSON.parse(savedScans));
      } catch (e) {
        console.error('Failed to load scans:', e);
      }
    }
  }, []);

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
    saveScan,
    simulateScan,
    clearHistory,
    playAudio,
  };
};
