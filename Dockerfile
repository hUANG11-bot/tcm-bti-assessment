FROM node:20

WORKDIR /app

# 使用国内 npm 镜像源（解决网络问题）
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json ./

# 安装依赖（不使用 --production，确保所有运行时依赖都被安装）
# 注意：express 等包可能不在 dependencies 中，需要安装所有依赖
RUN npm install --legacy-peer-deps --timeout=600000 || \
    npm install --no-optional --legacy-peer-deps --timeout=600000 || \
    npm install --timeout=600000 || \
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
