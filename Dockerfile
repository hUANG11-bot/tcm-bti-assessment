FROM node:20

WORKDIR /app

# 使用国内 npm 镜像源（解决网络问题）
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json ./

# 安装依赖（多重备用方案，添加超时设置）
RUN npm install --production --legacy-peer-deps --timeout=600000 || \
    npm install --production --no-optional --legacy-peer-deps --timeout=600000 || \
    npm install --production --timeout=600000 || \
    (echo "ERROR: All npm install attempts failed" && exit 1)

# 复制应用代码
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 验证文件存在
RUN test -f dist/index.js || (echo "ERROR: dist/index.js not found!" && exit 1)

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
