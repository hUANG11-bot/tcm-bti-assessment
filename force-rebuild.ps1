# 强制清理并重新编译脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "强制清理并重新编译微信小程序" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查并关闭微信开发者工具
Write-Host "[1/6] 检查微信开发者工具进程..." -ForegroundColor Yellow
$processes = Get-Process -Name "wechatdevtools" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "  发现运行中的微信开发者工具进程，正在关闭..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "  ✓ 已关闭微信开发者工具" -ForegroundColor Green
} else {
    Write-Host "  ✓ 微信开发者工具未运行" -ForegroundColor Green
}

# 2. 清理微信开发者工具缓存
Write-Host "[2/6] 清理微信开发者工具缓存..." -ForegroundColor Yellow
$cachePath = "$env:APPDATA\微信开发者工具"
if (Test-Path $cachePath) {
    Remove-Item -Recurse -Force "$cachePath\*" -ErrorAction SilentlyContinue
    Write-Host "  ✓ 已清理微信开发者工具缓存: $cachePath" -ForegroundColor Green
} else {
    Write-Host "  ✓ 缓存目录不存在" -ForegroundColor Green
}

# 3. 清理项目缓存
Write-Host "[3/6] 清理项目缓存..." -ForegroundColor Yellow
Set-Location "d:\tcm-bti-assessment"
if (Test-Path .wx) {
    Remove-Item -Recurse -Force .wx -ErrorAction SilentlyContinue
    Write-Host "  ✓ 已清理项目缓存 (.wx)" -ForegroundColor Green
} else {
    Write-Host "  ✓ 项目缓存不存在" -ForegroundColor Green
}

# 4. 清理 dist 目录
Write-Host "[4/6] 清理 dist 目录..." -ForegroundColor Yellow
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
    Write-Host "  ✓ 已清理 dist 目录" -ForegroundColor Green
} else {
    Write-Host "  ✓ dist 目录不存在" -ForegroundColor Green
}

# 5. 重新编译
Write-Host "[5/6] 重新编译项目..." -ForegroundColor Yellow
Write-Host "  执行: pnpm build:weapp:prod" -ForegroundColor Gray
pnpm build:weapp:prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 编译成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 编译失败，请检查错误信息" -ForegroundColor Red
    exit 1
}

# 6. 更新所有文件时间戳
Write-Host "[6/6] 更新所有文件时间戳..." -ForegroundColor Yellow
$files = Get-ChildItem -Path dist -Recurse -File -ErrorAction SilentlyContinue
if ($files) {
    $now = Get-Date
    $files | ForEach-Object { 
        $_.LastWriteTime = $now
        $_.LastAccessTime = $now
    }
    Write-Host "  ✓ 已更新 $($files.Count) 个文件的时间戳" -ForegroundColor Green
} else {
    Write-Host "  ⚠ 未找到编译文件" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host "1. 打开微信开发者工具" -ForegroundColor White
Write-Host "2. 删除当前项目（如果已存在）" -ForegroundColor White
Write-Host "3. 重新导入项目：d:\tcm-bti-assessment\dist" -ForegroundColor White
Write-Host "4. 填写 AppID: wx9811089020af2ae3" -ForegroundColor White
Write-Host "5. 点击编译" -ForegroundColor White
Write-Host ""
