# Git 配置检查和推送脚本
cd d:\tcm-bti-assessment

Write-Host "=== Git 配置检查 ===" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 用户配置
Write-Host "1. 检查 Git 用户配置..." -ForegroundColor Yellow
$userName = git config user.name
$userEmail = git config user.email
if ($userName) {
    Write-Host "   用户名: $userName" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ 未配置用户名" -ForegroundColor Yellow
}
if ($userEmail) {
    Write-Host "   邮箱: $userEmail" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ 未配置邮箱" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. 检查远程仓库..." -ForegroundColor Yellow
$remote = git remote -v
if ($remote) {
    Write-Host "   $remote" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ 未配置远程仓库" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. 检查当前 Git 状态..." -ForegroundColor Yellow
git status --short | Select-Object -First 20

Write-Host ""
Write-Host "=== 开始提交和推送 ===" -ForegroundColor Cyan
Write-Host ""

# 添加文件到暂存区
Write-Host "添加文件到暂存区..." -ForegroundColor Yellow
git add .gitignore
git add server/_core/llm-chinese.ts
git add server/_core/
git add src/
git add shared/
git add package.json
git add tsconfig.json
git add babel.config.cjs
git add scripts/test-ai.ts

$status = git status --short
if ($status) {
    Write-Host "✅ 文件已添加到暂存区" -ForegroundColor Green
    Write-Host ""
    
    # 提交更改
    Write-Host "提交更改..." -ForegroundColor Yellow
    git commit -m "feat: 添加 MiniMax AI 支持并修复相关配置" -m "- 添加 MiniMax AI 提供商支持" -m "- 更新 llm-chinese.ts 以支持 minimax.io 和 minimaxi.com 端点" -m "- 修复路径别名导入问题" -m "- 修复 ES 模块导入问题" -m "- 更新 .gitignore 以排除敏感文件"
    
    Write-Host ""
    Write-Host "拉取远程更改..." -ForegroundColor Yellow
    git pull --rebase origin main
    
    Write-Host ""
    Write-Host "推送到远程仓库..." -ForegroundColor Yellow
    $pushResult = git push --set-upstream origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 完成！代码已推送到 Git" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 推送时出现问题" -ForegroundColor Yellow
        Write-Host $pushResult
        Write-Host ""
        Write-Host "如果遇到冲突，请手动解决后执行: git push --set-upstream origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ 没有需要提交的文件" -ForegroundColor Yellow
}
