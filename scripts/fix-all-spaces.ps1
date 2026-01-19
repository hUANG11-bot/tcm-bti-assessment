# PowerShell 脚本：修复 dist 目录中所有文件的 API URL 空格问题

param(
    [string]$DistPath = "dist"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "开始修复 API URL 空格问题..." -ForegroundColor Green
Write-Host "目标目录: $DistPath" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $DistPath)) {
    Write-Host "错误: 目录不存在 $DistPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "使用方法:" -ForegroundColor Yellow
    Write-Host "  .\scripts\fix-all-spaces.ps1 [dist目录路径]"
    Write-Host ""
    Write-Host "例如:" -ForegroundColor Yellow
    Write-Host "  .\scripts\fix-all-spaces.ps1 `"D:\your-project\dist`""
    exit 1
}

$fixedFiles = 0
$totalReplacements = 0

# 获取所有 .js 文件
$jsFiles = Get-ChildItem -Path $DistPath -Filter "*.js" -Recurse -File

Write-Host "找到 $($jsFiles.Count) 个 .js 文件" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileReplacements = 0
        
        # 统计修复前的空格数量
        $beforeMatches = [regex]::Matches($content, "er1\.store\s+")
        if ($beforeMatches.Count -gt 0) {
            Write-Host "处理: $($file.FullName)" -ForegroundColor Yellow
            Write-Host "  发现 $($beforeMatches.Count) 处包含空格的 URL" -ForegroundColor Gray
            
            # 修复所有可能的空格情况
            # 1. 修复 er1.store 后的空格
            $content = $content -replace "https://er1\.store\s+", "https://er1.store"
            $fileReplacements += ([regex]::Matches($originalContent, "https://er1\.store\s+")).Count
            
            # 2. 修复引号内的空格
            $content = $content -replace '("https://er1\.store)\s+(")', '$1$2'
            $content = $content -replace "('https://er1\.store)\s+(')", '$1$2'
            
            # 3. 修复变量赋值中的空格
            $content = $content -replace '(\w+\s*[:=]\s*["'']https://er1\.store)\s+(["''])', '$1$2'
            
            # 4. 修复 apiBaseUrl 配置中的空格
            $content = $content -replace '(apiBaseUrl\s*[:=]\s*["'']https://er1\.store)\s+(["''])', '$1$2'
            
            # 5. 修复 URL 拼接中的空格
            $content = $content -replace '("https://er1\.store)\s+(/["''])', '$1$2'
            
            # 6. 修复模板字符串中的空格
            $content = $content -replace '(`https://er1\.store)\s+(/)', '$1$2'
            
            # 7. 修复 %20 编码的空格（URL编码）
            $content = $content -replace "er1\.store%20", "er1.store"
            
            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
                $fixedFiles++
                
                # 验证修复
                $afterMatches = [regex]::Matches($content, "er1\.store\s+")
                if ($afterMatches.Count -eq 0) {
                    Write-Host "  ✓ 已修复所有空格 ($fileReplacements 处)" -ForegroundColor Green
                } else {
                    Write-Host "  ⚠ 警告: 仍有 $($afterMatches.Count) 处包含空格的 URL" -ForegroundColor Red
                }
                $totalReplacements += $fileReplacements
            }
        }
    } catch {
        Write-Host "  ✗ 错误处理文件 $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
if ($fixedFiles -gt 0) {
    Write-Host "✓ 修复完成！" -ForegroundColor Green
    Write-Host "  修复了 $fixedFiles 个文件" -ForegroundColor Cyan
    Write-Host "  共替换了 $totalReplacements 处空格" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 在微信开发者工具中清除缓存（工具 → 清除缓存 → 清除全部）"
    Write-Host "2. 重新编译项目"
    Write-Host "3. 检查控制台，确认 URL 不再包含 %20"
} else {
    Write-Host "⚠ 未发现需要修复的文件" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. dist 目录路径不正确"
    Write-Host "2. 文件已经被修复"
    Write-Host "3. 空格可能在其他位置（环境变量、配置文件等）" -Encoding UTF8
}
