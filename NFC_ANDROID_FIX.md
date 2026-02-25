# Fix NFC Plugin - Android 11+ Compatibility

## Problema
El plugin `@exxili/capacitor-nfc` v0.0.12 usa `getParcelableExtra(key, Class)` y
`getParcelableArrayExtra(key, Class)` que solo existen desde Android 13 (API 33).
En Android 11/12 esto causa `NoSuchMethodError` y la app crashea al leer un tag NFC.

---

## Solución: Script PowerShell (Windows)

El script `fix-nfc-android11.ps1` modifica `NFCPlugin.kt` directamente en `node_modules`
para hacerlo compatible con Android 11+.

### Qué hace el script

1. **Agrega** `import androidx.core.content.IntentCompat`
2. **Reemplaza** `intent.getParcelableExtra(EXTRA_TAG, Tag::class.java)`
   → `IntentCompat.getParcelableExtra(intent, EXTRA_TAG, Tag::class.java)`
   (funciona en **todas** las versiones de Android)
3. **Reemplaza** `intent.getParcelableArrayExtra(EXTRA_NDEF_MESSAGES, NdefMessage::class.java)`
   → bloque condicional con `Build.VERSION.SDK_INT >= TIRAMISU` + fallback deprecado para API < 33
4. **Elimina** `@RequiresApi(Build.VERSION_CODES.TIRAMISU)` de los métodos afectados

---

## Pasos completos

### 1. Clonar el proyecto y preparar

```cmd
git clone <tu-repositorio>
cd <nombre-proyecto>
npm install
```

### 2. Ejecutar el script de parche

Desde el **Símbolo del Sistema (CMD)**, en la raíz del proyecto:

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -File "%cd%\fix-nfc-android11.ps1"
```

El script muestra cada cambio aplicado y cuántas ocurrencias reemplazó.

### 3. Verificar que el parche se aplicó

```cmd
findstr /N /C:"IntentCompat.getParcelableExtra" node_modules\@exxili\capacitor-nfc\android\src\main\kotlin\com\exxili\capacitornfc\NFCPlugin.kt
```

Deberías ver líneas con `IntentCompat.getParcelableExtra(intent, ...)`.

### 4. Compilar y sincronizar

```cmd
npm run build
npx cap sync android
cd android && gradlew.bat clean && cd ..
npx cap open android
```

### 5. En Android Studio

- Build → Clean Project
- Build → Rebuild Project
- Run → Run 'app'

---

## Antes / Después

### getParcelableExtra (Tag)

**Antes (solo API 33+, crashea en Android 11/12):**
```kotlin
val tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
```

**Después (todas las versiones):**
```kotlin
import androidx.core.content.IntentCompat

val tag = IntentCompat.getParcelableExtra(intent, NfcAdapter.EXTRA_TAG, Tag::class.java)
```

### getParcelableArrayExtra (NdefMessage)

**Antes (solo API 33+):**
```kotlin
intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES, NdefMessage::class.java)
```

**Después (compatible con todas las versiones):**
```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES, NdefMessage::class.java)
} else {
    @Suppress("DEPRECATION")
    (intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES) as? Array<*>)
        ?.filterIsInstance<NdefMessage>()?.toTypedArray()
}
```

---

## Si el script no encuentra los patrones

El plugin puede tener un formato diferente. El script mostrará instrucciones para
aplicar los cambios manualmente en Android Studio.

---

## Notas importantes

- **El script debe re-ejecutarse cada vez que hagas `npm install`** (npm borra node_modules)
- Si actualizas el plugin, los patrones pueden cambiar → revisar la salida del script
- Este fix es solo necesario para la build nativa de Android; no afecta la versión web
- `IntentCompat` viene de `androidx.core` que ya está incluida en proyectos Capacitor
