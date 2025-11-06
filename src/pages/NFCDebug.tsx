import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff, Play, Square, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { NFC, NDEFMessagesTransformable, NFCError } from '@exxili/capacitor-nfc';

export default function NFCDebug() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastRead, setLastRead] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const checkSupport = async () => {
    try {
      addLog('🔍 Checking NFC support...');
      
      if (!Capacitor.isNativePlatform()) {
        addLog('❌ Not on native platform (web browser)');
        setIsSupported(false);
        toast.error('Only works on native Android/iOS');
        return;
      }

      const result = await NFC.isSupported();
      addLog(`✅ isSupported() returned: ${JSON.stringify(result)}`);
      setIsSupported(result.supported);
      
      if (result.supported) {
        toast.success('NFC is supported on this device!');
      } else {
        toast.error('NFC not supported on this device');
      }
    } catch (error: any) {
      addLog(`❌ Error checking support: ${error.message || error}`);
      setIsSupported(false);
      toast.error('Error: ' + (error.message || 'Unknown error'));
    }
  };

  const startScanning = async () => {
    try {
      addLog('▶️ Starting NFC scan...');
      
      // Register listeners
      NFC.onRead((data: NDEFMessagesTransformable) => {
        const timestamp = new Date().toLocaleTimeString();
        addLog(`📖 Tag read at ${timestamp}`);
        
        try {
          const asString = data.string();
          const payload = asString.messages?.[0]?.records?.[0]?.payload || 'No payload';
          addLog(`📝 Payload: ${payload}`);
          setLastRead(payload);
          toast.success('Tag detected!');
        } catch (err) {
          addLog(`⚠️ Parse error: ${err}`);
        }
      });

      NFC.onError((error: NFCError) => {
        addLog(`❌ NFC Error: ${JSON.stringify(error)}`);
        setLastError(JSON.stringify(error));
        toast.error('NFC Error');
      });

      // En Android, el escaneo es automático después de registrar listeners
      if (Capacitor.getPlatform() === 'android') {
        setIsScanning(true);
        addLog('✅ Listeners registered (Android scans automatically)');
        toast.success('Escaneo activo (automático en Android)');
      } else {
        await NFC.startScan();
        setIsScanning(true);
        addLog('✅ Scan started successfully');
        toast.success('Scanning started - tap an NFC tag');
      }
    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      
      // En Android, el error "does not require startScan" es esperado
      if (Capacitor.getPlatform() === 'android' && 
          (errorMsg.includes('does not require') || errorMsg.includes('startScan'))) {
        addLog('ℹ️ Android: escaneo automático activo (no requiere startScan)');
        setIsScanning(true);
        toast.info('Android: escaneo automático activo');
        return;
      }
      
      addLog(`❌ startScan() error: ${errorMsg}`);
      setLastError(errorMsg);
      toast.error('Failed to start scan: ' + errorMsg);
    }
  };

  const stopScanning = async () => {
    try {
      addLog('⏹️ Stopping NFC scan...');
      await NFC.cancelScan();
      setIsScanning(false);
      addLog('✅ Scan stopped');
      toast.info('Scanning stopped');
    } catch (error: any) {
      addLog(`❌ cancelScan() error: ${error.message || error}`);
      toast.error('Failed to stop scan');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">NFC Debug Console</h1>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={Capacitor.isNativePlatform() ? "default" : "secondary"}>
                {Capacitor.isNativePlatform() ? `${Capacitor.getPlatform().toUpperCase()}` : 'Web'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">NFC Support</CardTitle>
            </CardHeader>
            <CardContent>
              {isSupported === null ? (
                <Badge variant="outline">Unknown</Badge>
              ) : isSupported ? (
                <Badge variant="default" className="bg-green-500">
                  <Wifi className="w-3 h-3 mr-1" />
                  Supported
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Not Supported
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scan Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <Badge variant="default" className="animate-pulse bg-blue-500">
                  <Play className="w-3 h-3 mr-1" />
                  Scanning
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Square className="w-3 h-3 mr-1" />
                  Stopped
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Test NFC plugin functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={checkSupport} className="w-full" variant="outline">
              <Smartphone className="w-4 h-4 mr-2" />
              Check NFC Support
            </Button>
            
            {!isScanning ? (
              <Button onClick={startScanning} className="w-full" disabled={isSupported === false}>
                <Play className="w-4 h-4 mr-2" />
                Start Scan
              </Button>
            ) : (
              <Button onClick={stopScanning} className="w-full" variant="secondary">
                <Square className="w-4 h-4 mr-2" />
                {Capacitor.getPlatform() === 'android' ? 'Escaneo activo (automático)' : 'Stop Scan'}
              </Button>
            )}
            
            {Capacitor.getPlatform() === 'android' && (
              <p className="text-xs text-muted-foreground text-center">
                💡 En Android el escaneo es automático al abrir la app
              </p>
            )}
          </CardContent>
        </Card>

        {/* Last Results */}
        {(lastRead || lastError) && (
          <Card>
            <CardHeader>
              <CardTitle>Last Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastRead && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Last Tag Read:
                  </p>
                  <code className="text-xs text-green-600 dark:text-green-400 break-all">
                    {lastRead}
                  </code>
                </div>
              )}
              
              {lastError && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-md">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Last Error:
                  </p>
                  <code className="text-xs text-red-600 dark:text-red-400 break-all">
                    {lastError}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>Real-time NFC plugin events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-md p-4 h-64 overflow-y-auto font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No events yet. Use the controls above to test.
                </p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-foreground">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
