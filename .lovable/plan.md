
Objetivo
- Corregir el crash en Android 11 del plugin NFC aplicando un parche real de compatibilidad (no solo detección de “ya parchado”).

Diagnóstico confirmado (revisión del código actual)
1) El archivo del plugin en este proyecto (`node_modules/@exxili/capacitor-nfc/.../NFCPlugin.kt`) usa llamadas API 33+ directamente:
   - `intent.getParcelableExtra(..., Tag::class.java)` (aparece en lectura y escritura)
   - `intent.getParcelableArrayExtra(..., NdefMessage::class.java)`
2) En Android 11/12 esas firmas no existen → `NoSuchMethodError` (exactamente lo que reporta Android Studio).
3) El script `fix-nfc-android11.ps1` actual no corrige este caso porque:
   - Tiene un “early exit” demasiado genérico: si encuentra `Build.VERSION.SDK_INT` asume parche aplicado.
   - Busca un patrón viejo (`getParcelableExtra<Tag>(...)`) que ya no coincide con la versión actual del plugin.

Plan de implementación (archivos a cambiar)
1) `fix-nfc-android11.ps1` (cambio principal)
   - Quitar la validación falsa de “ya está aplicado” basada en `Build.VERSION.SDK_INT`.
   - Cambiar detección a algo específico de compatibilidad real:
     - presencia de `IntentCompat.getParcelableExtra(...)`
     - y bloque compatible para `EXTRA_NDEF_MESSAGES`.
   - Agregar import seguro:
     - `import androidx.core.content.IntentCompat`
   - Reemplazar ambas llamadas de `Tag` por versión compatible:
     - de `intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)`
     - a `IntentCompat.getParcelableExtra(intent, NfcAdapter.EXTRA_TAG, Tag::class.java)`
   - Reemplazar lectura tipada de mensajes NDEF con bloque backward-compatible:
     - API 33+: usa firma tipada
     - API < 33: usa firma antigua + cast seguro a `NdefMessage`.
   - Eliminar (o neutralizar) `@RequiresApi(Build.VERSION_CODES.TIRAMISU)` en métodos de flujo NFC (`handleOnNewIntent`, `handleWriteTag`, `handleReadTag`) para no marcar esos métodos como “solo 33+” cuando ya tendrán código compatible.
   - Mejorar salida del script:
     - mostrar cuántos reemplazos hizo por cada bloque
     - fallar con mensaje claro si no encontró patrones esperados (incluyendo ruta real encontrada).

2) `NFC_ANDROID_FIX.md` (alinear documentación con fix real)
   - Actualizar “Antes/Después” a la estrategia `IntentCompat` + fallback para array extra.
   - Agregar verificación de éxito con comandos CMD (`findstr`) para confirmar que el parche quedó escrito en `NFCPlugin.kt`.
   - Mantener instrucciones para ejecutar desde CMD (Windows) y recompilar limpio.

3) (Opcional recomendado) `package.json`
   - Agregar script explícito para Windows:
     - `"nfc:patch": "powershell -NoProfile -ExecutionPolicy Bypass -File .\\fix-nfc-android11.ps1"`
   - No forzar `postinstall` por ahora para evitar romper instalaciones en entornos no-Windows.

Detalles técnicos (sección dedicada)
- Reemplazo de `Tag`:
  - `intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)`
  - → `IntentCompat.getParcelableExtra(intent, NfcAdapter.EXTRA_TAG, Tag::class.java)`
- Reemplazo de mensajes NDEF:
  - `intent.getParcelableArrayExtra(EXTRA_NDEF_MESSAGES, NdefMessage::class.java)`
  - → bloque con `if (SDK_INT >= TIRAMISU)` + fallback deprecado y cast seguro para Android < 13.
- Resultado esperado:
  - mismo plugin funciona en Android 11/12/13+ sin `NoSuchMethodError`.

Plan de validación (CMD, compatible con Símbolo del sistema)
1) Ejecutar parche:
   - `powershell -NoProfile -ExecutionPolicy Bypass -File "%cd%\fix-nfc-android11.ps1"`
2) Verificar que quedó aplicado:
   - `findstr /N /C:"IntentCompat.getParcelableExtra" node_modules\@exxili\capacitor-nfc\android\src\main\kotlin\com\exxili\capacitornfc\NFCPlugin.kt`
   - `findstr /N /C:"getParcelableArrayExtra(EXTRA_NDEF_MESSAGES, NdefMessage::class.java)" node_modules\@exxili\capacitor-nfc\android\src\main\kotlin\com\exxili\capacitornfc\NFCPlugin.kt`
3) Rebuild nativo limpio:
   - `npm run build`
   - `npx cap sync android`
   - `cd android && gradlew.bat clean && cd ..`
   - `npx cap open android`
4) Prueba real end-to-end:
   - Ejecutar en Android 11 físico/emulador con NFC
   - Escanear tag y confirmar:
     - no crash
     - evento `nfcTag` llega a la app
     - audio se reproduce según configuración.

Riesgos y mitigación
- Si el proveedor del plugin cambia estructura interna, el script puede no encontrar patrones:
  - mitigación: fallback en script con mensaje de bloque manual exacto.
- `node_modules` se regenera tras `npm install`:
  - mitigación: comando `nfc:patch` documentado y repetible.

Resultado esperado final
- El parche deja de depender de patrones obsoletos y corrige específicamente la incompatibilidad de API 33+ que está rompiendo Android 11.
