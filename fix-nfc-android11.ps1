# =============================================================================
# fix-nfc-android11.ps1
# Aplica el parche de compatibilidad Android 11+ al plugin NFC
# Ejecutar desde la raiz del proyecto: powershell -ExecutionPolicy Bypass -File fix-nfc-android11.ps1
# =============================================================================

$pluginFile = "node_modules\@exxili\capacitor-nfc\android\src\main\kotlin\com\exxili\capacitornfc\NFCPlugin.kt"

# Verificar que el archivo existe
if (-not (Test-Path $pluginFile)) {
    Write-Host "ERROR: No se encontro el archivo del plugin." -ForegroundColor Red
    Write-Host "Asegurate de haber ejecutado 'npm install' primero." -ForegroundColor Yellow
    exit 1
}

Write-Host "Leyendo NFCPlugin.kt..." -ForegroundColor Cyan
$content = Get-Content $pluginFile -Raw -Encoding UTF8

# ---- Verificar si el parche ya fue aplicado ----
if ($content -match "Build\.VERSION\.SDK_INT") {
    Write-Host "El parche ya esta aplicado. No se requieren cambios." -ForegroundColor Green
    exit 0
}

# ---- Paso 1: Agregar import android.os.Build ----
$importTarget  = "import android.app.Activity"
$importReplace = "import android.app.Activity`r`nimport android.os.Build"

if ($content -notmatch [regex]::Escape("import android.os.Build")) {
    $content = $content -replace [regex]::Escape($importTarget), $importReplace
    Write-Host "  [OK] import android.os.Build agregado" -ForegroundColor Green
} else {
    Write-Host "  [--] import android.os.Build ya existe" -ForegroundColor Yellow
}

# ---- Paso 2: Reemplazar getParcelableExtra deprecado ----
# Patron original (con o sin espacios/tabs variables)
$oldCode = 'val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)'
$newCode = @'
val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
        }
'@

if ($content -match [regex]::Escape($oldCode)) {
    $content = $content -replace [regex]::Escape($oldCode), $newCode
    Write-Host "  [OK] getParcelableExtra reemplazado con version compatible Android 11+" -ForegroundColor Green
} else {
    Write-Host "" 
    Write-Host "AVISO: No se encontro el patron exacto para reemplazar." -ForegroundColor Yellow
    Write-Host "El plugin puede haber cambiado su codigo interno." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Busca manualmente en $pluginFile la linea:" -ForegroundColor Cyan
    Write-Host "  intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)" -ForegroundColor White
    Write-Host "Y reemplazala por:" -ForegroundColor Cyan
    Write-Host @'
  val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
  } else {
      @Suppress("DEPRECATION")
      intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
  }
'@ -ForegroundColor White
    exit 2
}

# ---- Guardar el archivo modificado ----
$content | Set-Content $pluginFile -Encoding UTF8 -NoNewline
Write-Host ""
Write-Host "Parche aplicado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. npm run build" -ForegroundColor White
Write-Host "  2. npx cap sync android" -ForegroundColor White
Write-Host "  3. npx cap open android  (compilar desde Android Studio)" -ForegroundColor White
