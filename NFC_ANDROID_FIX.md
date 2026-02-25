# Fix NFC Plugin - Android 11+ Compatibility

## Problema
El plugin `@exxili/capacitor-nfc` v0.0.12 usa `getParcelableExtra<Tag>()` que fue deprecado
en Android 13 (API 33) y puede causar warnings o crashes en Android 11+.

---

## Solución: Script PowerShell (recomendado en Windows)

En lugar de patch-package (que requiere el diff exacto del archivo original),
se incluye un script PowerShell que modifica el archivo directamente.

### Pasos

**1. Exportar y clonar el proyecto**
```
# Desde el botón "Export to Github" en Lovable, luego:
git clone <tu-repositorio>
cd <nombre-proyecto>
npm install
```

**2. Ejecutar el script de parche**

Desde el Símbolo del Sistema (cmd), ir a la raíz del proyecto y ejecutar:
```
powershell -ExecutionPolicy Bypass -File fix-nfc-android11.ps1
```

El script:
- Agrega `import android.os.Build` al archivo del plugin
- Reemplaza `intent.getParcelableExtra<Tag>(...)` con lógica condicional por versión de Android
- Muestra instrucciones si no puede encontrar el patrón exacto (versión diferente del plugin)

**3. Compilar y sincronizar**
```
npm run build
npx cap sync android
npx cap open android
```

**4. Compilar en Android Studio**

En Android Studio:
- Build → Clean Project
- Build → Rebuild Project
- Run → Run 'app'

---

## Qué hace el parche exactamente

### Antes (código deprecado):
```kotlin
val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
```

### Después (compatible Android 11+):
```kotlin
import android.os.Build  // ← import agregado

val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)  // API 33+
} else {
    @Suppress("DEPRECATION")
    intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)  // API < 33
}
```

---

## Si el script no encuentra el patrón

Significa que la versión del plugin tiene código diferente al esperado.
El script mostrará las instrucciones para hacer el cambio manualmente en Android Studio:

1. Abre el archivo en Android Studio:
   ```
   node_modules/@exxili/capacitor-nfc/android/src/main/kotlin/com/exxili/capacitornfc/NFCPlugin.kt
   ```
2. Busca la línea con `getParcelableExtra<Tag>`
3. Aplica el reemplazo mostrado por el script

---

## Verificación

El script fue aplicado correctamente si:
- No hay errores al compilar en Android Studio
- La app lee tags NFC en dispositivos Android 11, 12 y 13
- No aparecen crashes en Logcat al escanear un tag

---

## Notas importantes

- **El script debe re-ejecutarse cada vez que hagas `npm install`** (npm borra node_modules)
- Si actualizas el plugin a una versión nueva, el patrón puede cambiar → revisar el script
- Este fix es solo necesario para la build nativa de Android; no afecta la versión web
