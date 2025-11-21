# Deploy Angular App to S3 + CloudFront
# Uso: .\deploy-s3.ps1 -BucketName "hoteles-front" -DistributionId "E1234567890ABC"

param(
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "hoteles-front",
    
    [Parameter(Mandatory=$false)]
    [string]$DistributionId = "E1DNWZEORDPBPC",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipInvalidation = $false
)

# Colores
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host "`n🚀 Deployment Script para Angular → S3 + CloudFront" -ForegroundColor $InfoColor
Write-Host "================================================`n" -ForegroundColor $InfoColor

# Verificar AWS CLI
Write-Host "🔍 Verificando AWS CLI..." -ForegroundColor $WarningColor
try {
    $awsVersion = aws --version 2>&1
    Write-Host "   ✅ AWS CLI instalado: $awsVersion" -ForegroundColor $SuccessColor
} catch {
    Write-Host "   ❌ AWS CLI no encontrado. Instala desde: https://aws.amazon.com/cli/" -ForegroundColor $ErrorColor
    exit 1
}

# Verificar credenciales AWS
Write-Host "🔍 Verificando credenciales AWS..." -ForegroundColor $WarningColor
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ No hay credenciales configuradas. Ejecuta: aws configure" -ForegroundColor $ErrorColor
        exit 1
    }
    Write-Host "   ✅ Credenciales AWS válidas" -ForegroundColor $SuccessColor
} catch {
    Write-Host "   ❌ Error al verificar credenciales AWS" -ForegroundColor $ErrorColor
    exit 1
}

# Build del proyecto
if (-not $SkipBuild) {
    Write-Host "`n📦 Construyendo proyecto Angular..." -ForegroundColor $WarningColor
    npm run build -- --configuration=production
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error en el build del proyecto" -ForegroundColor $ErrorColor
        exit 1
    }
    Write-Host "   ✅ Build completado exitosamente" -ForegroundColor $SuccessColor
} else {
    Write-Host "`n⏭️  Saltando build (--SkipBuild)" -ForegroundColor $WarningColor
}

# Verificar que existe el directorio de build
$buildPath = "dist\project-hotel-front\browser"
if (-not (Test-Path $buildPath)) {
    Write-Host "   ❌ No se encontró el directorio de build: $buildPath" -ForegroundColor $ErrorColor
    Write-Host "   💡 Ejecuta sin --SkipBuild o verifica la configuración de Angular" -ForegroundColor $WarningColor
    exit 1
}

# Contar archivos a subir
$fileCount = (Get-ChildItem -Path $buildPath -Recurse -File).Count
Write-Host "`n📊 Archivos a subir: $fileCount" -ForegroundColor $InfoColor

# Confirmar antes de continuar
Write-Host "`n⚠️  Vas a subir archivos a: s3://$BucketName" -ForegroundColor $WarningColor
$confirm = Read-Host "¿Continuar? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "   ❌ Deployment cancelado por el usuario" -ForegroundColor $ErrorColor
    exit 0
}

# Sincronizar con S3
Write-Host "`n☁️  Subiendo archivos a S3..." -ForegroundColor $WarningColor
Write-Host "   Bucket: s3://$BucketName" -ForegroundColor $InfoColor

try {
    # Usar --delete para eliminar archivos que ya no existen
    # Usar --size-only para acelerar la comparación
    aws s3 sync $buildPath s3://$BucketName --delete --size-only
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al subir archivos a S3" -ForegroundColor $ErrorColor
        exit 1
    }
    Write-Host "   ✅ Archivos subidos exitosamente a S3" -ForegroundColor $SuccessColor
} catch {
    Write-Host "   ❌ Error durante la sincronización con S3: $_" -ForegroundColor $ErrorColor
    exit 1
}

# Invalidar cache de CloudFront
if (-not $SkipInvalidation -and $DistributionId -ne "") {
    Write-Host "`n🔄 Invalidando cache de CloudFront..." -ForegroundColor $WarningColor
    Write-Host "   Distribution ID: $DistributionId" -ForegroundColor $InfoColor
    
    try {
        $invalidationResult = aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" --output json | ConvertFrom-Json
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Error al invalidar cache de CloudFront" -ForegroundColor $ErrorColor
            exit 1
        }
        
        $invalidationId = $invalidationResult.Invalidation.Id
        Write-Host "   ✅ Invalidación creada: $invalidationId" -ForegroundColor $SuccessColor
        Write-Host "   ⏳ La invalidación puede tardar 5-10 minutos en completarse" -ForegroundColor $WarningColor
    } catch {
        Write-Host "   ❌ Error al invalidar cache: $_" -ForegroundColor $ErrorColor
        Write-Host "   💡 Puedes invalidar manualmente desde la consola de AWS" -ForegroundColor $WarningColor
    }
} elseif ($DistributionId -eq "") {
    Write-Host "`n⏭️  Saltando invalidación de CloudFront (no se proporcionó Distribution ID)" -ForegroundColor $WarningColor
    Write-Host "   💡 Uso: .\deploy-s3.ps1 -DistributionId E1234567890ABC" -ForegroundColor $InfoColor
} else {
    Write-Host "`n⏭️  Saltando invalidación de CloudFront (--SkipInvalidation)" -ForegroundColor $WarningColor
}

# Resumen final
Write-Host "`n✅ ¡Deployment completado exitosamente!" -ForegroundColor $SuccessColor
Write-Host "================================================" -ForegroundColor $InfoColor
Write-Host "📊 Resumen:" -ForegroundColor $InfoColor
Write-Host "   • Bucket S3: s3://$BucketName" -ForegroundColor $InfoColor
Write-Host "   • Archivos subidos: $fileCount" -ForegroundColor $InfoColor

if ($DistributionId -ne "" -and -not $SkipInvalidation) {
    Write-Host "   • CloudFront invalidado: $DistributionId" -ForegroundColor $InfoColor
}

Write-Host "`n🌐 Tu aplicación debería estar disponible en:" -ForegroundColor $InfoColor
Write-Host "   https://albadev.me" -ForegroundColor $SuccessColor

Write-Host "`n💡 Comandos útiles:" -ForegroundColor $InfoColor
Write-Host "   • Ver archivos: aws s3 ls s3://$BucketName/" -ForegroundColor $InfoColor
Write-Host "   • Ver invalidaciones: aws cloudfront list-invalidations --distribution-id $DistributionId" -ForegroundColor $InfoColor
Write-Host "   • Test HTTPS: curl -I https://albadev.me" -ForegroundColor $InfoColor
Write-Host "`n"
