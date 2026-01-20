# Create New Dist Directory Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create New Dist Directory" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Close WeChat DevTools
Write-Host "[1/5] Closing WeChat DevTools..." -ForegroundColor Yellow
$processes = Get-Process -Name "wechatdevtools" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Host "  OK: WeChat DevTools closed" -ForegroundColor Green
} else {
    Write-Host "  OK: WeChat DevTools not running" -ForegroundColor Green
}

# 2. Create new directory
Write-Host "[2/5] Creating new dist directory..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$newDistPath = "d:\tcm-bti-assessment-dist-$timestamp"
New-Item -ItemType Directory -Path $newDistPath -Force | Out-Null
Write-Host "  OK: Created $newDistPath" -ForegroundColor Green

# 3. Rebuild project
Write-Host "[3/5] Rebuilding project..." -ForegroundColor Yellow
Set-Location "d:\tcm-bti-assessment"
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm build:weapp:prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Build successful" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Build failed" -ForegroundColor Red
    exit 1
}

# 4. Copy to new directory
Write-Host "[4/5] Copying to new directory..." -ForegroundColor Yellow
Copy-Item -Recurse -Force dist\* $newDistPath
Write-Host "  OK: Copied to $newDistPath" -ForegroundColor Green

# 5. Update project config
Write-Host "[5/5] Updating project config..." -ForegroundColor Yellow
$configPath = Join-Path $newDistPath "project.config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $config.projectname = "tcm-bti-assessment-$timestamp"
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    Write-Host "  OK: Project config updated" -ForegroundColor Green
} else {
    Write-Host "  WARNING: project.config.json not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "New project directory: $newDistPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open WeChat DevTools" -ForegroundColor White
Write-Host "2. Import project: $newDistPath" -ForegroundColor White
Write-Host "3. Enter AppID: wx9811089020af2ae3" -ForegroundColor White
Write-Host "4. Click Compile" -ForegroundColor White
Write-Host ""
