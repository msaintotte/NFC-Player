import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pudis.app',
  appName: 'PUDIS',
  webDir: 'dist',
  server: {
    url: 'https://2d0b62aa-e26c-4763-9bcc-6732686d810f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
