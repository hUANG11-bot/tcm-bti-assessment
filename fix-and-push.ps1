# 修复 Git 状态并推送
cd d:\tcm-bti-assessment

Write-Host "=== 检查 Git 状态 ===" -ForegroundColor Cyan
Write-Host ""

# 检查当前状态
Write-Host "1. 检查未暂存的更改..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "2. 添加所有更改到暂存区..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3. 检查是否有需要提交的更改..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "✅ 有需要提交的更改" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "4. 提交更改..." -ForegroundColor Yellow
    git commit -m "feat: 添加 MiniMax AI 支持并修复相关配置" -m "- 添加 MiniMax AI 提供商支持" -m "- 更新 llm-chinese.ts 以支持 minimax.io 和 minimaxi.com 端点" -m "- 修复路径别名导入问题" -m "- 修复 ES 模块导入问题" -m "- 更新 .gitignore 以排除敏感文件"
} else {
    Write-Host "⚠️ 没有需要提交的更改" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. 拉取远程更改（使用 rebase）..." -ForegroundColor Yellow
git pull --rebase origin main

Write-Host ""
Write-Host "6. 推送到远程仓库..." -ForegroundColor Yellow
$pushResult = git push --set-upstream origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 完成！代码已推送到 Git" -ForegroundColor Green
} else {
    Write-Host "⚠️ 推送时出现问题" -ForegroundColor Yellow
    Write-Host $pushResult
}
