# Complete Reset WeChat DevTools Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete Reset WeChat DevTools" -ForegroundColor Cyan
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

# 2. Delete WeChat DevTools data
Write-Host "[2/5] Deleting WeChat DevTools data..." -ForegroundColor Yellow
$wechatAppData = Join-Path $env:APPDATA "微信开发者工具"
$wechatLocalData = Join-Path $env:LOCALAPPDATA "微信开发者工具"
$wechatRoaming = Join-Path $env:USERPROFILE "AppData\Roaming\微信开发者工具"
$wechatLocal = Join-Path $env:USERPROFILE "AppData\Local\微信开发者工具"

$paths = @($wechatAppData, $wechatLocalData, $wechatRoaming, $wechatLocal)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "  OK: Deleted $path" -ForegroundColor Green
    }
}

# 3. Clean project cache
Write-Host "[3/5] Cleaning project cache..." -ForegroundColor Yellow
Set-Location "d:\tcm-bti-assessment"
if (Test-Path .wx) {
    Remove-Item -Recurse -Force .wx -ErrorAction SilentlyContinue
    Write-Host "  OK: Project cache cleaned (.wx)" -ForegroundColor Green
} else {
    Write-Host "  OK: Project cache not found" -ForegroundColor Green
}

# 4. Rebuild project
Write-Host "[4/5] Rebuilding project..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm build:weapp:prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Build successful" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Build failed" -ForegroundColor Red
    exit 1
}

# 5. Update project config
Write-Host "[5/5] Updating project config..." -ForegroundColor Yellow
$configPath = "dist\project.config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $config | Add-Member -NotePropertyName "projectname" -NotePropertyValue ("tcm-bti-assessment-" + [DateTimeOffset]::Now.ToUnixTimeMilliseconds()) -Force
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
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Reopen WeChat DevTools (will reinitialize)" -ForegroundColor White
Write-Host "2. Import project: d:\tcm-bti-assessment\dist" -ForegroundColor White
Write-Host "3. Enter AppID: wx9811089020af2ae3" -ForegroundColor White
Write-Host "4. Click Compile" -ForegroundColor White
Write-Host ""
