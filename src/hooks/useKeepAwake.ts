import { useEffect } from 'react';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';

export const useKeepAwake = (shouldKeepAwake: boolean, isEnabled: boolean) => {
  useEffect(() => {
    // Solo funciona en plataformas nativas
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const manageKeepAwake = async () => {
      // Solo activar si AMBOS están true: la funcionalidad está habilitada Y hay contenido reproduciéndose
      if (shouldKeepAwake && isEnabled) {
        try {
          await KeepAwake.keepAwake();
          console.log('✅ Keep Awake activado');
        } catch (error) {
          console.error('❌ Error al activar Keep Awake:', error);
        }
      } else {
        try {
          await KeepAwake.allowSleep();
          console.log('💤 Keep Awake desactivado - pantalla puede apagarse');
        } catch (error) {
          console.error('❌ Error al desactivar Keep Awake:', error);
        }
      }
    };

    manageKeepAwake();

    // Cleanup: asegurarse de permitir sleep cuando el componente se desmonta
    return () => {
      if (Capacitor.isNativePlatform()) {
        KeepAwake.allowSleep().catch(console.error);
      }
    };
  }, [shouldKeepAwake, isEnabled]);
};
