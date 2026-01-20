# Git 提交和推送脚本
Write-Host "=== 准备提交代码到 Git ===" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 状态
Write-Host "1. 检查 Git 状态..." -ForegroundColor Yellow
git status --short | Select-Object -First 30

Write-Host ""
Write-Host "2. 添加修改的文件..." -ForegroundColor Yellow

# 添加重要的代码文件
git add .gitignore
git add server/_core/llm-chinese.ts
git add server/_core/
git add src/
git add shared/
git add package.json
git add tsconfig.json
git add babel.config.cjs
git add scripts/test-ai.ts

Write-Host "✅ 文件已添加到暂存区" -ForegroundColor Green

Write-Host ""
Write-Host "3. 提交更改..." -ForegroundColor Yellow
git commit -m "feat: 添加 MiniMax AI 支持并修复相关配置

- 添加 MiniMax AI 提供商支持
- 更新 llm-chinese.ts 以支持 minimax.io 和 minimaxi.com 端点
- 修复路径别名导入问题（@shared -> 相对路径）
- 修复 ES 模块导入问题（添加 .js 扩展名）
- 更新 .gitignore 以排除敏感文件"

Write-Host ""
Write-Host "4. 推送到远程仓库..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "✅ 完成！代码已推送到 Git" -ForegroundColor Green
