# Fix para NFC Plugin - Android 11+ Compatibility

## Problema
El plugin `@exxili/capacitor-nfc` versión 0.0.12 usa una API deprecada de Android (`getParcelableExtra`) que causa problemas en Android 11+.

## Solución Implementada
Se usa `patch-package` para mantener un parche persistente que maneja correctamente las diferentes versiones de Android.

---

## Pasos para Completar la Implementación

### 1. Agregar Script Postinstall (REQUERIDO)

**Edita manualmente el archivo `package.json`** y agrega esta línea en la sección `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview",
  "postinstall": "patch-package"  // ← AGREGAR ESTA LÍNEA
}
```

### 2. Exportar Proyecto y Clonar en Local

```bash
# Exporta el proyecto a GitHub usando el botón "Export to Github"
# Luego clona el repositorio en tu máquina:
git clone <tu-repositorio>
cd <nombre-proyecto>
npm install
```

### 3. Modificar el Archivo del Plugin

**Abre el archivo:**
```
node_modules/@exxili/capacitor-nfc/android/src/main/java/com/exxili/capacitornfc/NFCPlugin.kt
```

**Paso 3.1: Agregar import**
Al inicio del archivo, después de los otros imports, agrega:
```kotlin
import android.os.Build
```

**Paso 3.2: Modificar la función handleWriteTag()**
Busca la línea que dice:
```kotlin
val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
```

Y reemplázala por:
```kotlin
val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
} else {
    @Suppress("DEPRECATION")
    intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
}
```

### 4. Generar el Patch

Ejecuta este comando en la raíz del proyecto:
```bash
npx patch-package @exxili/capacitor-nfc
```

Esto creará automáticamente el archivo `patches/@exxili+capacitor-nfc+0.0.12.patch`.

### 5. Verificar el Patch

Comprueba que se creó el directorio `patches/` con el archivo del patch dentro.

### 6. Agregar Plataforma Android (si no la tienes)

```bash
npx cap add android
```

### 7. Remover Configuración de Desarrollo

**Edita `capacitor.config.ts`** y remueve la sección `server`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pudis.app',
  appName: 'PUDIS',
  webDir: 'dist'
  // Remover la sección server para app nativa
};

export default config;
```

### 8. Compilar y Sincronizar

```bash
npm run build
npx cap sync android
```

### 9. Ejecutar en Dispositivo Android 11+

```bash
npx cap run android
```

O abre el proyecto en Android Studio:
```bash
npx cap open android
```

---

## Verificación del Fix

✅ **El patch está aplicado si:**
1. Existe el directorio `patches/` en la raíz
2. Existe el archivo `patches/@exxili+capacitor-nfc+0.0.12.patch`
3. El script `postinstall` está en `package.json`
4. Al ejecutar `npm install`, ves el mensaje "patch-package" en la consola

✅ **El fix funciona si:**
1. La app se compila sin errores en Android 11+
2. El plugin NFC lee tags correctamente
3. No hay crashes al escanear tags NFC

---

## Mantenimiento

### Si actualizas el plugin NFC:
1. Elimina el archivo patch anterior
2. Repite los pasos 3-4 con la nueva versión
3. El nombre del patch cambiará (por ejemplo: `@exxili+capacitor-nfc+0.0.13.patch`)

### Si otro miembro del equipo clona el proyecto:
El patch se aplicará automáticamente al ejecutar `npm install` (gracias al script postinstall).

---

## Consideraciones Importantes

⚠️ **Android Studio**: Necesitas tener Android Studio instalado para compilar y ejecutar en Android.

⚠️ **Versiones de Android**: Este fix es específicamente para Android 11+ (API 30+) donde la API `getParcelableExtra` fue deprecada.

⚠️ **Alternativas**: Considera buscar un plugin NFC más mantenido a largo plazo, como:
- `@capacitor-community/nfc` (si está disponible)
- O reporta el issue al repositorio oficial del plugin

---

## Troubleshooting

**Error: "patch-package not found"**
- Ejecuta: `npm install`

**El patch no se aplica**
- Verifica que el script `postinstall` esté en `package.json`
- Ejecuta manualmente: `npx patch-package`

**La app no compila en Android**
- Ejecuta: `npx cap sync android`
- Limpia el build: En Android Studio -> Build -> Clean Project

**El NFC sigue sin funcionar**
- Verifica permisos en `AndroidManifest.xml`
- Revisa logs de Android Studio (Logcat)
- Prueba en un dispositivo físico (no emulador)
