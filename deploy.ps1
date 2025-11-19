# Build de producción
Write-Host "🔨 Building production..." -ForegroundColor Cyan
npm run build -- --configuration=production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Configuración
$BUCKET_NAME = "hotel-frontend"  # Cambia esto por tu bucket
$DISTRIBUTION_ID = "YOUR_DISTRIBUTION_ID"  # Cambia esto después de crear CloudFront

# Subir a S3
Write-Host "☁️ Uploading to S3..." -ForegroundColor Cyan
aws s3 sync dist/project-hotel-front/browser/ s3://$BUCKET_NAME/ --delete

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ S3 upload failed!" -ForegroundColor Red
    exit 1
}

# Invalidar caché de CloudFront
Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Cyan
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ CloudFront invalidation failed (maybe distribution not created yet)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Deploy completed successfully!" -ForegroundColor Green
}
