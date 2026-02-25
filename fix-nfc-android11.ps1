# =============================================================================
# fix-nfc-android11.ps1
# Aplica el parche de compatibilidad Android 11+ al plugin NFC
# Usa IntentCompat para getParcelableExtra y fallback manual para getParcelableArrayExtra
# Ejecutar desde la raiz del proyecto:
#   powershell -NoProfile -ExecutionPolicy Bypass -File fix-nfc-android11.ps1
# =============================================================================

$pluginRelativePath = "node_modules\@exxili\capacitor-nfc\android\src\main\kotlin\com\exxili\capacitornfc\NFCPlugin.kt"
$pluginFile = Join-Path $PSScriptRoot $pluginRelativePath

# Si no aparece en la ruta esperada, intentar localizarlo automaticamente
if (-not (Test-Path $pluginFile)) {
    $pluginBaseDir = Join-Path $PSScriptRoot "node_modules\@exxili\capacitor-nfc"
    if (Test-Path $pluginBaseDir) {
        $foundFile = Get-ChildItem -Path $pluginBaseDir -Filter "NFCPlugin.kt" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($foundFile) {
            $pluginFile = $foundFile.FullName
            Write-Host "Ruta detectada automaticamente: $pluginFile" -ForegroundColor Cyan
        }
    }
}

# Verificar que el archivo existe
if (-not (Test-Path $pluginFile)) {
    Write-Host "ERROR: No se encontro el archivo del plugin." -ForegroundColor Red
    Write-Host "Ruta esperada: $pluginFile" -ForegroundColor Yellow
    Write-Host "Asegurate de haber ejecutado 'npm install' primero." -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivo encontrado: $pluginFile" -ForegroundColor Cyan
Write-Host "Leyendo NFCPlugin.kt..." -ForegroundColor Cyan
$content = Get-Content $pluginFile -Raw -Encoding UTF8

# ---- Verificar si el parche ya fue aplicado (deteccion especifica) ----
if ($content -match "IntentCompat\.getParcelableExtra") {
    Write-Host "El parche IntentCompat ya esta aplicado. No se requieren cambios." -ForegroundColor Green
    exit 0
}

$changes = 0

# ---- Paso 1: Agregar import androidx.core.content.IntentCompat ----
if ($content -notmatch [regex]::Escape("import androidx.core.content.IntentCompat")) {
    # Buscar un import existente de android para insertar despues
    if ($content -match "import android\.nfc\.NfcAdapter") {
        $content = $content -replace [regex]::Escape("import android.nfc.NfcAdapter"), "import android.nfc.NfcAdapter`r`nimport androidx.core.content.IntentCompat"
        Write-Host "  [OK] import IntentCompat agregado (junto a NfcAdapter)" -ForegroundColor Green
        $changes++
    } elseif ($content -match "import android\.app\.Activity") {
        $content = $content -replace [regex]::Escape("import android.app.Activity"), "import android.app.Activity`r`nimport androidx.core.content.IntentCompat"
        Write-Host "  [OK] import IntentCompat agregado (junto a Activity)" -ForegroundColor Green
        $changes++
    } else {
        Write-Host "  [!!] No se encontro un import android conocido para insertar IntentCompat." -ForegroundColor Red
        Write-Host "       Agrega manualmente: import androidx.core.content.IntentCompat" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [--] import IntentCompat ya existe" -ForegroundColor Yellow
}

# ---- Paso 2: Agregar import android.os.Build (si no existe) ----
if ($content -notmatch [regex]::Escape("import android.os.Build")) {
    if ($content -match "import android\.nfc\.NfcAdapter") {
        $content = $content -replace [regex]::Escape("import android.nfc.NfcAdapter"), "import android.nfc.NfcAdapter`r`nimport android.os.Build"
        Write-Host "  [OK] import android.os.Build agregado" -ForegroundColor Green
        $changes++
    }
} else {
    Write-Host "  [--] import android.os.Build ya existe" -ForegroundColor Yellow
}

# ---- Paso 3: Reemplazar getParcelableExtra para Tag ----
# Patron: intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
$tagPattern = 'intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)'
$tagReplacement = 'IntentCompat.getParcelableExtra(intent, NfcAdapter.EXTRA_TAG, Tag::class.java)'

$tagMatches = ([regex]::Matches($content, [regex]::Escape($tagPattern))).Count
if ($tagMatches -gt 0) {
    $content = $content -replace [regex]::Escape($tagPattern), $tagReplacement
    Write-Host "  [OK] getParcelableExtra(Tag) reemplazado con IntentCompat ($tagMatches ocurrencia(s))" -ForegroundColor Green
    $changes++
} else {
    Write-Host "  [!!] No se encontro el patron getParcelableExtra para Tag." -ForegroundColor Yellow
    Write-Host "       Patron buscado: $tagPattern" -ForegroundColor Yellow
}

# ---- Paso 4: Reemplazar getParcelableArrayExtra para NdefMessage ----
# Patron: intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES, NdefMessage::class.java)
# Tambien puede aparecer con EXTRA_NDEF_MESSAGES directamente (sin NfcAdapter.)
$ndefPattern1 = 'intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES, NdefMessage::class.java)'
$ndefPattern2 = 'intent.getParcelableArrayExtra(EXTRA_NDEF_MESSAGES, NdefMessage::class.java)'

$ndefReplacement = @'
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES, NdefMessage::class.java)
            } else {
                @Suppress("DEPRECATION")
                (intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES) as? Array<*>)?.filterIsInstance<NdefMessage>()?.toTypedArray()
            }
'@

$ndefFound = $false
if ($content -match [regex]::Escape($ndefPattern1)) {
    $content = $content -replace [regex]::Escape($ndefPattern1), $ndefReplacement
    Write-Host "  [OK] getParcelableArrayExtra(NdefMessage) reemplazado con bloque compatible (patron con NfcAdapter.)" -ForegroundColor Green
    $changes++
    $ndefFound = $true
}
if ((-not $ndefFound) -and ($content -match [regex]::Escape($ndefPattern2))) {
    # Usar version sin NfcAdapter. en el fallback tambien
    $ndefReplacement2 = @'
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableArrayExtra(EXTRA_NDEF_MESSAGES, NdefMessage::class.java)
            } else {
                @Suppress("DEPRECATION")
                (intent.getParcelableArrayExtra(EXTRA_NDEF_MESSAGES) as? Array<*>)?.filterIsInstance<NdefMessage>()?.toTypedArray()
            }
'@
    $content = $content -replace [regex]::Escape($ndefPattern2), $ndefReplacement2
    Write-Host "  [OK] getParcelableArrayExtra(NdefMessage) reemplazado con bloque compatible (patron sin NfcAdapter.)" -ForegroundColor Green
    $changes++
    $ndefFound = $true
}
if (-not $ndefFound) {
    Write-Host "  [!!] No se encontro el patron getParcelableArrayExtra para NdefMessage." -ForegroundColor Yellow
    Write-Host "       Busca manualmente en el archivo la linea con getParcelableArrayExtra y NdefMessage" -ForegroundColor Yellow
}

# ---- Paso 5: Eliminar @RequiresApi(Build.VERSION_CODES.TIRAMISU) ----
$requiresApiPattern = '@RequiresApi(Build.VERSION_CODES.TIRAMISU)'
$requiresApiMatches = ([regex]::Matches($content, [regex]::Escape($requiresApiPattern))).Count
if ($requiresApiMatches -gt 0) {
    $content = $content -replace [regex]::Escape($requiresApiPattern), ''
    Write-Host "  [OK] @RequiresApi(TIRAMISU) eliminado ($requiresApiMatches ocurrencia(s))" -ForegroundColor Green
    $changes++
} else {
    Write-Host "  [--] No se encontro @RequiresApi(TIRAMISU) (puede que no exista en esta version)" -ForegroundColor Yellow
}

# ---- Resultado ----
if ($changes -eq 0) {
    Write-Host ""
    Write-Host "AVISO: No se pudo aplicar ningun cambio automaticamente." -ForegroundColor Red
    Write-Host "El plugin puede tener un formato diferente al esperado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Abre el archivo manualmente:" -ForegroundColor Cyan
    Write-Host "  $pluginFile" -ForegroundColor White
    Write-Host ""
    Write-Host "Y aplica estos cambios:" -ForegroundColor Cyan
    Write-Host "1. Agrega al inicio: import androidx.core.content.IntentCompat" -ForegroundColor White
    Write-Host "2. Reemplaza: intent.getParcelableExtra(...EXTRA_TAG, Tag::class.java)" -ForegroundColor White
    Write-Host "   Por:       IntentCompat.getParcelableExtra(intent, NfcAdapter.EXTRA_TAG, Tag::class.java)" -ForegroundColor White
    Write-Host "3. Reemplaza: intent.getParcelableArrayExtra(...EXTRA_NDEF_MESSAGES, NdefMessage::class.java)" -ForegroundColor White
    Write-Host "   Por un bloque if/else con Build.VERSION.SDK_INT >= TIRAMISU" -ForegroundColor White
    exit 2
}

# ---- Guardar el archivo modificado ----
$content | Set-Content $pluginFile -Encoding UTF8 -NoNewline
Write-Host ""
Write-Host "Parche aplicado correctamente! ($changes cambio(s) realizados)" -ForegroundColor Green
Write-Host ""
Write-Host "Verificacion (ejecutar en CMD):" -ForegroundColor Cyan
Write-Host '  findstr /N /C:"IntentCompat.getParcelableExtra" node_modules\@exxili\capacitor-nfc\android\src\main\kotlin\com\exxili\capacitornfc\NFCPlugin.kt' -ForegroundColor White
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. npm run build" -ForegroundColor White
Write-Host "  2. npx cap sync android" -ForegroundColor White
Write-Host "  3. cd android && gradlew.bat clean && cd .." -ForegroundColor White
Write-Host "  4. npx cap open android  (compilar desde Android Studio)" -ForegroundColor White
