# 执行 Git 提交和推送
cd d:\tcm-bti-assessment

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

Write-Host "提交更改..." -ForegroundColor Yellow
git commit -m "feat: 添加 MiniMax AI 支持并修复相关配置

- 添加 MiniMax AI 提供商支持
- 更新 llm-chinese.ts 以支持 minimax.io 和 minimaxi.com 端点
- 修复路径别名导入问题（@shared -> 相对路径）
- 修复 ES 模块导入问题（添加 .js 扩展名）
- 更新 .gitignore 以排除敏感文件"

Write-Host "推送到远程仓库..." -ForegroundColor Yellow
git push

Write-Host "完成！" -ForegroundColor Green
