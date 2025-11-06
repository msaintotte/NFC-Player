import { Smartphone, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFCBannerProps {
  isSupported: boolean;
  isScanning: boolean;
  permissionStatus?: 'unknown' | 'granted' | 'denied';
  errorMessage?: string;
}

export const NFCBanner = ({ isSupported, isScanning, permissionStatus, errorMessage }: NFCBannerProps) => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-8 text-center">
      <div className={cn(
        "inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-4",
        isScanning && "animate-pulse"
      )}>
        <Wifi className="w-12 h-12 text-primary-foreground" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {isScanning ? 'Esperando Tag NFC...' : isSupported ? 'NFC Listo' : 'NFC No Disponible'}
      </h2>
      
      <p className="text-muted-foreground mb-4">
        {isScanning 
          ? 'Acerca un tag NFC para reproducir música' 
          : isSupported 
          ? 'El escaneo NFC está listo para usar'
          : 'Este dispositivo no soporta NFC o el plugin no está configurado'}
      </p>
      
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
          <p className="text-destructive text-sm font-medium mb-1">
            ⚠️ Error de NFC
          </p>
          <p className="text-destructive/80 text-xs">
            {errorMessage}
          </p>
        </div>
      )}
      
      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span className={cn(
            "font-medium",
            isSupported ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}>
            Dispositivo: {isSupported ? '✓ Compatible' : '✗ No soportado'}
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className={cn(
            "font-medium",
            isScanning ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
          )}>
            Escaneo: {isScanning ? '⚡ Activo' : '○ Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
};
