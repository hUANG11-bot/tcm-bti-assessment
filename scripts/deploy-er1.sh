#!/usr/bin/env bash
# 在 er1.store 服务器上执行的一键部署脚本
# 用法：SSH 登录后 cd 到项目目录，执行：bash scripts/deploy-er1.sh
# 指定分支：DEPLOY_BRANCH=restore-v1.4-closest bash scripts/deploy-er1.sh

set -e
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)
echo "[deploy] 项目目录: $PROJECT_ROOT"

# 1. 拉取最新代码（分支可从环境变量 DEPLOY_BRANCH 读取，默认 main）
BRANCH="${DEPLOY_BRANCH:-main}"
echo "[deploy] 拉取分支: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 2. 安装依赖（优先 pnpm，否则 npm）
if command -v pnpm &>/dev/null; then
  echo "[deploy] 使用 pnpm 安装依赖"
  pnpm install --prod
else
  echo "[deploy] 使用 npm 安装依赖"
  npm install --omit=dev --legacy-peer-deps
fi

# 3. 构建服务端
echo "[deploy] 构建服务端 dist/index.js"
npm run build:server

# 4. 重启进程（优先 pm2，否则直接后台运行 node）
if command -v pm2 &>/dev/null; then
  echo "[deploy] 使用 pm2 重启"
  pm2 restart tcm-bti-assessment 2>/dev/null || pm2 start dist/index.js --name tcm-bti-assessment
  pm2 save
else
  echo "[deploy] 未检测到 pm2，请手动启动: node dist/index.js"
  echo "  或安装 pm2: npm i -g pm2 && pm2 start dist/index.js --name tcm-bti-assessment"
fi

echo "[deploy] 完成。验证: curl -s -o /dev/null -w '%{http_code}' https://er1.store/api/trpc/auth.me?batch=1"
