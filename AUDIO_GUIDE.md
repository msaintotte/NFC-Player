# 🎵 Guía de Gestión de Audios Locales

Esta guía te explica cómo agregar y gestionar archivos de audio locales en tu aplicación NFC.

## 📋 Índice

1. [Preparar el Archivo de Audio](#1-preparar-el-archivo-de-audio)
2. [Agregar el Archivo al Proyecto](#2-agregar-el-archivo-al-proyecto)
3. [Registrar en audioConfigs.ts](#3-registrar-en-audioconfigsts)
4. [Configurar Etiqueta NFC](#4-configurar-etiqueta-nfc)
5. [Compilar y Sincronizar](#5-compilar-y-sincronizar)
6. [Testing](#6-testing)

---

## 1. Preparar el Archivo de Audio

### Formatos Soportados
- **MP3** ✅ (Recomendado - máxima compatibilidad)
- **M4A/AAC** ✅ (Buena calidad, menor tamaño)
- **WAV** ✅ (Alta calidad pero archivos grandes)
- **OGG** ✅ (Buena compresión, menor compatibilidad)

### Recomendaciones
- **Tamaño**: Preferiblemente < 10MB para carga rápida
- **Bitrate**: 128-192 kbps para podcasts/voz, 256-320 kbps para música
- **Nomenclatura**: Usa minúsculas y guiones, ejemplo: `mi-audio-2024.mp3`

---

## 2. Agregar el Archivo al Proyecto

1. Navega a la carpeta `public/audio/` en la raíz del proyecto
   - Si no existe, créala: `mkdir public/audio`

2. Copia tu archivo de audio a esta carpeta:
   ```bash
   cp /ruta/a/tu/audio.mp3 public/audio/mi-audio.mp3
   ```

3. Verifica que el archivo esté presente:
   ```bash
   ls public/audio/
   ```

**Nota**: Los archivos en `public/` se copian automáticamente a la app Android durante la compilación.

---

## 3. Registrar en audioConfigs.ts

1. Abre el archivo `src/config/audioConfigs.ts`

2. Dentro del objeto `audioConfigs`, agrega una nueva entrada:

```typescript
export const audioConfigs: Record<string, AudioConfig> = {
  // ... audios existentes ...
  
  miAudio: {
    id: 'miAudio',                          // ID único (camelCase)
    title: 'Título del Audio',              // Nombre que verá el usuario
    artist: 'Nombre del Artista',           // Opcional
    description: 'Descripción del audio',   // Breve descripción
    albumArt: 'https://...jpg',             // URL de imagen o placeholder
    duration: '45:30',                      // Duración estimada (MM:SS o HH:MM:SS)
    type: 'local',                          // Siempre 'local' para audios descargados
    audioUrl: '/audio/mi-audio.mp3',        // Ruta relativa desde public/
  },
};
```

3. Guarda el archivo

### Ejemplo Real

```typescript
marcopolo: {
  id: 'marcopolo',
  title: 'Marco Aurelio - Meditaciones',
  artist: 'Marco Aurelio',
  description: 'Sabiduría estoica del emperador romano',
  albumArt: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
  duration: '45:30',
  type: 'local',
  audioUrl: '/audio/marco-polo.m4a',
},
```

---

## 4. Configurar Etiqueta NFC

Tu etiqueta NFC debe escribirse con el **ID** del audio que configuraste en el paso anterior.

**Ejemplo**: Si tu audio tiene `id: 'miAudio'`, escribe en la etiqueta NFC:
```
miAudio
```

**Cómo escribir en una etiqueta NFC:**
- Usa una app como **NFC Tools** (Android/iOS)
- Selecciona "Escribir"
- Agrega un registro de tipo "Texto"
- Escribe el ID exacto: `miAudio`
- Acerca la etiqueta para escribir

---

## 5. Compilar y Sincronizar

### Para Desarrollo Web (navegador)

```bash
npm run dev
```

Accede a `http://localhost:5173` y prueba desde la página `/tags`

### Para Android

1. **Compilar el frontend**:
   ```bash
   npm run build
   ```

2. **Sincronizar con Capacitor**:
   ```bash
   npx cap sync android
   ```

3. **Abrir en Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Instalar en dispositivo**:
   - Conecta tu dispositivo Android
   - En Android Studio: `Run > Run 'app'`
   - O desde terminal:
     ```bash
     cd android
     ./gradlew assembleDebug
     adb install -r app/build/outputs/apk/debug/app-debug.apk
     ```

---

## 6. Testing

### Opción A: Test Manual en la App

1. Abre la app
2. Ve a la pestaña **"Tags"** (icono de etiqueta)
3. Busca tu audio en la lista
4. Presiona **"Test Scan"**
5. Verifica que:
   - Se carga el reproductor
   - Se muestra el album art
   - El audio reproduce correctamente
   - Los controles funcionan (play/pause, seek)

### Opción B: Escanear Etiqueta NFC

1. Asegúrate de tener permisos NFC habilitados
2. Acerca tu dispositivo a la etiqueta NFC
3. La app debe abrir automáticamente y reproducir el audio

### Troubleshooting

**❌ El audio no se reproduce**
- Verifica que el archivo existe en `public/audio/`
- Revisa la consola del navegador (F12) para errores
- Confirma que la ruta en `audioUrl` es correcta

**❌ La etiqueta NFC no funciona**
- Verifica que el ID en la etiqueta coincide exactamente con el ID en `audioConfigs`
- Comprueba que la app tiene permisos NFC en Configuración del dispositivo

**❌ El archivo es muy pesado**
- Comprime el audio con herramientas como Audacity o ffmpeg:
  ```bash
  ffmpeg -i input.mp3 -b:a 128k output.mp3
  ```

---

## 📂 Estructura Final del Proyecto

```
public/
├── audio/
│   ├── marco-polo.m4a
│   ├── mi-podcast.mp3
│   └── meditacion.mp3
├── images/
│   └── album-art/
│       └── custom-cover.jpg
└── robots.txt

src/
└── config/
    └── audioConfigs.ts

AUDIO_GUIDE.md
README.md
```

---

## 🚀 Ventajas del Sistema de Audios Locales

✅ **Offline-first**: Los audios funcionan sin conexión una vez instalada la app  
✅ **Control total**: No dependes de URLs externas que pueden caducar  
✅ **Rendimiento**: Carga instantánea desde el almacenamiento local  
✅ **Escalable**: Agrega tantos audios como necesites  
✅ **Multiplataforma**: Funciona en web y Android sin cambios

---

## 📚 Recursos Adicionales

- [Capacitor Audio Docs](https://capacitorjs.com/docs/apis/audio)
- [HTML5 Audio API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [NFC Tools App](https://www.wakdev.com/en/apps/nfc-tools-android.html)

---

**¿Necesitas ayuda?** Consulta el README.md o revisa los ejemplos en `src/config/audioConfigs.ts`
