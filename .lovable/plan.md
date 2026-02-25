

## Corrección del script fix-nfc-android11.ps1

### Problema
El script tiene la ruta incorrecta del archivo `NFCPlugin.kt`:
- **Ruta en el script**: `...\java\com\exxili\capacitornfc\NFCPlugin.kt`
- **Ruta real**: `...\kotlin\com\exxili\capacitornfc\NFCPlugin.kt`

### Solución
Cambiar `java` por `kotlin` en la variable `$pluginFile` del script `fix-nfc-android11.ps1`.

### Archivo a modificar
| Archivo | Cambio |
|---|---|
| `fix-nfc-android11.ps1` | Corregir ruta: `java` → `kotlin` |
| `NFC_ANDROID_FIX.md` | Actualizar la ruta en la documentación |

Es un cambio de una sola línea en cada archivo.

### Después de aplicar
El usuario ejecutará de nuevo:
```
powershell -ExecutionPolicy Bypass -File fix-nfc-android11.ps1
```

