cd d:\tcm-bti-assessment
git add .gitignore server/_core/llm-chinese.ts server/_core/ src/ shared/ package.json tsconfig.json babel.config.cjs scripts/test-ai.ts
git commit -m "feat: 添加 MiniMax AI 支持并修复相关配置" -m "- 添加 MiniMax AI 提供商支持" -m "- 更新 llm-chinese.ts 以支持 minimax.io 和 minimaxi.com 端点" -m "- 修复路径别名导入问题" -m "- 修复 ES 模块导入问题" -m "- 更新 .gitignore 以排除敏感文件"
git push
