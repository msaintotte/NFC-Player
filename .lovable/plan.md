
# Plan de Mejoras PUDIS - Android 11 Compatible

## Compatibilidad con Android 11 (API 30)

La app PUEDE funcionar en Android 11. La configuración ya tiene `minSdkVersion = 23` y `targetSdkVersion = 35`, lo que cubre Android 11. El único riesgo real es el método `getParcelableExtra` del plugin NFC, que fue deprecado en Android 11 (API 30) y puede lanzar warnings o crashes al escanear tags. Dado que el usuario no pudo aplicar el parche anteriormente, este plan propone mejoras que sí son posibles desde Lovable.

---

## Problemas encontrados en la revisión

### 1. CRITICO - Listeners NFC duplicados
`Settings.tsx` y `Tags.tsx` llaman a `useNFC()` completo. Eso registra `NFC.onRead` y `NFC.onError` una vez más cada vez que el usuario navega a esas páginas. Con 3 páginas usando el hook, un tag puede activar el audio 3 veces simultáneamente.

Páginas afectadas:
- `src/pages/Index.tsx` - usa `useNFC()` completo
- `src/pages/Tags.tsx` - usa `useNFC()` solo por `simulateScan`
- `src/pages/Settings.tsx` - usa `useNFC()` solo por `clearHistory` y `scans`

### 2. CRITICO - Autoplay con `setTimeout(100ms)` es frágil
En `CurrentPlayer.tsx` línea 32, el autoplay usa `setTimeout(() => play(), 100)`. En dispositivos Android 11 con almacenamiento lento o archivos .m4a de gran tamaño, 100ms puede no ser suficiente para que el audio cargue. El `play()` falla silenciosamente sin mostrar error al usuario.

### 3. MEDIO - Ruta `/nfc-debug` sin protección
`NFCDebug.tsx` no tiene ninguna verificación de autenticación. Cualquier persona con el link puede acceder al panel de debug con información del sistema NFC en producción.

### 4. BAJO - UI mezclada español/inglés
La interfaz mezcla ambos idiomas sin consistencia:

| Componente | Texto en inglés actual |
|---|---|
| `Tags.tsx` línea 21 | "My Tags" |
| `Tags.tsx` línea 22 | "Manage your NFC tags..." |
| `Tags.tsx` línea 89 | "Test Scan" |
| `Tags.tsx` línea 104 | "Add New Tag" |
| `Settings.tsx` línea 34 | "Settings" |
| `Settings.tsx` línea 35 | "Manage your PUDIS preferences" |
| `Settings.tsx` línea 48 | "Keep Screen Awake" |
| `Settings.tsx` línea 49 | "Prevent screen from turning off..." |
| `Settings.tsx` línea 62 | "About" |
| `Settings.tsx` línea 63 | "App Version" |
| `Settings.tsx` línea 75 | "History" |
| `Settings.tsx` línea 78 | "Recent Scans" |
| `Settings.tsx` línea 93 | "Clear History" |
| `RecentMagic.tsx` línea 26 | "Just now", "m ago", "h ago", "d ago" |
| `RecentMagic.tsx` línea 35 | "No recent scans" |
| `RecentMagic.tsx` línea 36 | "Tap an NFC tag to get started" |
| `RecentMagic.tsx` línea 46 | "Recent Magic" |
| `CurrentPlayer.tsx` línea 109 | "No audio playing" |
| `Settings.tsx` línea 17 | "History cleared successfully" (toast) |

### 5. BAJO - APK release sin minificación
`android/app/build.gradle` línea 21 tiene `minifyEnabled false`. El APK de producción no está ofuscado, lo que aumenta el tamaño y expone código fuente.

---

## Solución propuesta

### Mejora A - NFCContext global (resuelve listeners duplicados)

Crear `src/contexts/NFCContext.tsx` que instancia el hook UNA sola vez, y proveerlo en `App.tsx`. `Tags.tsx` y `Settings.tsx` consumen el contexto en lugar de instanciar `useNFC()`.

```text
Antes:
  Index.tsx  → useNFC() → registra listener NFC #1
  Tags.tsx   → useNFC() → registra listener NFC #2  (DUPLICADO)
  Settings.tsx → useNFC() → registra listener NFC #3 (DUPLICADO)

Después:
  App.tsx → NFCProvider (1 sola instancia, 1 solo listener)
    ├── Index.tsx    → useNFCContext()
    ├── Tags.tsx     → useNFCContext()
    └── Settings.tsx → useNFCContext()
```

### Mejora B - Autoplay con evento `canplaythrough`

Cambiar el `setTimeout(100ms)` por el evento nativo del navegador `canplaythrough`, que se dispara exactamente cuando el audio tiene suficientes datos para reproducirse sin interrupciones.

```text
Antes: loadAudio(url) → setTimeout(100ms) → play()  [puede fallar]
Después: loadAudio(url) → evento 'canplaythrough' → play()  [siempre funciona]
```

### Mejora C - Proteger `/nfc-debug` con guard de admin

Agregar la misma verificación de autenticación/rol que tiene `Admin.tsx`:
- Si no está autenticado → redirige a `/auth`
- Si está autenticado pero no es admin → muestra "Acceso Denegado"
- Si es admin → muestra el panel de debug

### Mejora D - Unificar UI al español

Traducir todos los textos en inglés identificados en la tabla anterior.

### Mejora E - Habilitar minificación en release

Cambiar `minifyEnabled false` a `minifyEnabled true` en `build.gradle`.

---

## Archivos que se modificarán

| Archivo | Cambio |
|---|---|
| `src/contexts/NFCContext.tsx` | NUEVO - Context global para NFC |
| `src/App.tsx` | Envolver rutas en `NFCProvider` |
| `src/pages/Index.tsx` | Usar `useNFCContext()` |
| `src/pages/Tags.tsx` | Usar `useNFCContext()` + textos en español |
| `src/pages/Settings.tsx` | Usar `useNFCContext()` + textos en español |
| `src/components/CurrentPlayer.tsx` | Autoplay con `canplaythrough` + texto en español |
| `src/components/RecentMagic.tsx` | Textos en español |
| `src/pages/NFCDebug.tsx` | Guard de autenticación admin |
| `android/app/build.gradle` | `minifyEnabled true` |

---

## Sobre Android 11

Con estas mejoras aplicadas, la app es más estable en Android 11 porque:
- Un solo listener NFC evita condiciones de carrera al leer tags
- El autoplay con `canplaythrough` es más robusto en hardware lento
- El plugin NFC sigue siendo el mismo (`@exxili/capacitor-nfc`), y su compatibilidad con Android 11 depende del parche de `NFCPlugin.kt` que requiere hacerlo desde Android Studio localmente (no desde Lovable)
