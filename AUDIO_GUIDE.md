# 🎵 Guía de Gestión de Audios

Esta guía te explica cómo agregar y gestionar archivos de audio en tu aplicación Pudis NFC usando el **sistema de administración integrado** o editando código directamente.

## 📋 Tabla de Contenidos

### Opción A: Sistema de Administración (Recomendado)
1. [¿Por qué usar el sistema de administración?](#por-qué-usar-el-sistema-de-administración)
2. [Pasos para subir audios](#pasos-para-subir-audios)
3. [Gestionar audios existentes](#gestionar-audios-existentes)
4. [Configurar etiquetas NFC](#configurar-etiquetas-nfc-con-el-panel-de-administración)

### Opción B: Edición Manual de Código
1. [Preparar el archivo de audio](#1-preparar-el-archivo-de-audio)
2. [Agregar el archivo al proyecto](#2-agregar-el-archivo-al-proyecto)
3. [Migración a la base de datos](#3-migración-a-la-base-de-datos)
4. [Configurar etiqueta NFC](#4-configurar-etiqueta-nfc)
5. [Compilar y sincronizar](#5-compilar-y-sincronizar)
6. [Testing](#6-testing)
7. [Solución de problemas](#7-solución-de-problemas)

---

## Opción A: Sistema de Administración (Recomendado)

### ¿Por qué usar el sistema de administración?

✅ **Sin código**: Sube audios directamente desde la app  
✅ **Almacenamiento en la nube**: Los archivos se guardan en Lovable Cloud  
✅ **Base de datos**: Configuraciones almacenadas en PostgreSQL  
✅ **Interfaz visual**: Formulario intuitivo para gestionar audios  
✅ **Eliminar y editar**: Gestiona tu biblioteca desde la app  

### Pasos para subir audios

1. **Accede al panel de administración**
   - Abre la app en el navegador: `https://tu-app.lovable.app/admin`
   - O navega desde la app móvil: Tags → "Agregar Tag"

2. **Completa el formulario de subida**
   
   **Tipo de audio**: Selecciona entre:
   - `Local`: Archivo de audio que subirás desde tu dispositivo
   - `Spotify`: URL de Spotify
   - `YouTube`: URL de YouTube
   - `Newsletter`: URL de newsletter/podcast
   
   **Archivo** (solo para tipo Local):
   - Formatos soportados: MP3, M4A, WAV, OGG, WebM
   - Tamaño máximo: 50MB
   - El archivo se sube automáticamente al almacenamiento en la nube
   
   **Información del audio**:
   - **Título** (requerido): Nombre del audio
   - **Artista** (opcional): Autor o intérprete
   - **Descripción** (opcional): Breve descripción del contenido
   - **URL de imagen** (opcional): Link de portada (usa Unsplash por defecto)
   - **Duración** (opcional): Formato MM:SS o H:MM:SS
   - **ID único** (opcional): Se genera automáticamente si no lo especificas

3. **Subir el audio**
   - Haz clic en "Subir Audio"
   - Verás una barra de progreso mientras se sube
   - Una vez completado, el audio aparecerá en la lista

### Gestionar audios existentes

- Todos los audios aparecen en la parte inferior del panel `/admin`
- Puedes eliminar audios haciendo clic en el ícono de basura
- El ID del audio se muestra para configurar tus etiquetas NFC

### Configurar etiquetas NFC con el panel de administración

Una vez que hayas subido un audio:

1. **Copia el ID del audio** (se muestra en la tarjeta del audio)
2. **Escribe ese ID en tu etiqueta NFC** usando una app de escritura NFC:
   - **Android**: "NFC Tools" o similar
   - **iOS**: Shortcuts app con escritura NFC

3. **Escanea la etiqueta** con tu app Pudis para probar

**Ejemplo**: Si tu audio tiene ID `meditacion-guiada`, escribe exactamente:
```
meditacion-guiada
```

---

## Opción B: Edición Manual de Código

Si prefieres gestionar los audios editando el código directamente, sigue estos pasos:

### 1. Preparar el archivo de audio

#### Formatos Soportados
- **MP3** ✅ (Recomendado - máxima compatibilidad)
- **M4A/AAC** ✅ (Buena calidad, menor tamaño)
- **WAV** ✅ (Alta calidad pero archivos grandes)
- **OGG** ✅ (Buena compresión, menor compatibilidad)

#### Recomendaciones
- **Tamaño**: Preferiblemente < 10MB para carga rápida
- **Bitrate**: 128-192 kbps para podcasts/voz, 256-320 kbps para música
- **Nomenclatura**: Usa minúsculas y guiones, ejemplo: `mi-audio-2024.mp3`

---

### 2. Agregar el archivo al proyecto

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

### 3. Migración a la base de datos

**Importante**: Con el nuevo sistema de administración, los audios ahora se almacenan en una base de datos PostgreSQL en lugar de un archivo estático.

Si necesitas agregar audios manualmente a la base de datos, puedes hacerlo de dos formas:

#### Opción 3A: Usar el panel de administración (`/admin`)
Es la forma más fácil - simplemente sube el audio desde la interfaz web.

#### Opción 3B: SQL directo (avanzado)

Si quieres insertar datos directamente en la base de datos (desde el Cloud tab):

```sql
INSERT INTO public.audio_configs (id, title, artist, description, album_art, duration, type, audio_url)
VALUES (
  'meditacion',
  'Meditación Guiada',
  'Jon Kabat-Zinn',
  'Sesión de meditación mindfulness de 10 minutos',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
  '10:00',
  'local',
  '/audio/meditacion.mp3'
);
```

**Nota**: El archivo estático `src/config/audioConfigs.ts` se mantiene solo como referencia inicial.

---

### 4. Configurar etiqueta NFC

Tu etiqueta NFC debe escribirse con el **ID** del audio que configuraste.

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

### 5. Compilar y sincronizar

#### Para Desarrollo Web (navegador)

```bash
npm run dev
```

Accede a `http://localhost:5173` y prueba desde la página `/tags`

#### Para Android

1. **Hacer git pull del proyecto**:
   ```bash
   git pull
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Compilar el frontend**:
   ```bash
   npm run build
   ```

4. **Sincronizar con Capacitor**:
   ```bash
   npx cap sync android
   ```

5. **Abrir en Android Studio**:
   ```bash
   npx cap open android
   ```

6. **Instalar en dispositivo**:
   - Conecta tu dispositivo Android
   - En Android Studio: `Run > Run 'app'`

---

### 6. Testing

#### Opción A: Test Manual en la App

1. Abre la app
2. Ve a la pestaña **"Tags"** (icono de etiqueta)
3. Busca tu audio en la lista
4. Presiona **"Test Scan"**
5. Verifica que:
   - Se carga el reproductor
   - Se muestra el album art
   - El audio reproduce correctamente
   - Los controles funcionan (play/pause, seek)

#### Opción B: Escanear Etiqueta NFC

1. Asegúrate de tener permisos NFC habilitados
2. Acerca tu dispositivo a la etiqueta NFC
3. La app debe abrir automáticamente y reproducir el audio

---

### 7. Solución de problemas

**❌ El audio no se reproduce**
- Verifica que el archivo existe en `public/audio/`
- Revisa la consola del navegador (F12) para errores
- Confirma que la ruta en `audioUrl` es correcta
- Verifica que el audio está en la base de datos (Cloud tab)

**❌ No aparece en el panel de administración**
- Verifica que tienes conexión a internet
- Recarga la página `/admin`
- Revisa la consola del navegador para errores

**❌ La etiqueta NFC no funciona**
- Verifica que el ID en la etiqueta coincide exactamente con el ID en la base de datos
- Comprueba que la app tiene permisos NFC en Configuración del dispositivo
- Prueba primero con "Test Scan" en la página `/tags`

**❌ Error al subir archivo**
- Verifica que el archivo es menor a 50MB
- Confirma que el formato es soportado (MP3, M4A, WAV, OGG, WebM)
- Comprueba tu conexión a internet

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  ├── /admin (panel de administración)  │
│  ├── /tags (listado de audios)         │
│  └── useAudioConfigs (hook para CRUD)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Lovable Cloud (Backend)                │
│  ├── PostgreSQL Database                │
│  │   └── audio_configs (tabla)         │
│  └── Storage Bucket                     │
│      └── audio-files (archivos)        │
└─────────────────────────────────────────┘
```

---

## 🚀 Ventajas del Nuevo Sistema

### Con Panel de Administración:
✅ **No requiere código**: Cualquiera puede agregar audios  
✅ **Almacenamiento en la nube**: Archivos accesibles desde cualquier dispositivo  
✅ **Base de datos**: Gestión escalable y flexible  
✅ **CRUD completo**: Crear, leer, actualizar y eliminar audios  
✅ **URLs públicas**: Los audios tienen URLs permanentes

### Con Audios Locales (Opción B):
✅ **Offline-first**: Los audios funcionan sin conexión  
✅ **Control total**: No dependes de servicios externos  
✅ **Rendimiento**: Carga instantánea desde almacenamiento local  
✅ **Multiplataforma**: Funciona en web y Android sin cambios

---

## 📚 Recursos Adicionales

- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
- [Capacitor Audio Docs](https://capacitorjs.com/docs/apis/audio)
- [HTML5 Audio API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [NFC Tools App](https://www.wakdev.com/en/apps/nfc-tools-android.html)

---

**¿Necesitas ayuda?** Consulta el README.md o accede al panel de administración en `/admin`
