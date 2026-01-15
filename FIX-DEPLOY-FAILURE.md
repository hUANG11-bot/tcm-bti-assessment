# 修复部署失败问题

## 🔍 问题诊断

**错误信息**：`check_build_image : fail`

**问题位置**：Docker 镜像构建阶段失败

从日志看，文件解压成功，但在构建 Docker 镜像时失败。

---

## 🚀 解决方案

### 方案1：修复 Dockerfile（推荐）

当前 Dockerfile 可能存在问题，尝试以下修复：

#### 修复1：使用更稳定的基础镜像

```dockerfile
# 使用官方 Node.js LTS 版本
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm（使用官方方法）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖（生产环境）
RUN pnpm install --frozen-lockfile --prod

# 复制应用代码
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "dist/index.js"]
```

#### 修复2：如果修复1不行，尝试安装所有依赖

```dockerfile
# 使用官方 Node.js LTS 版本
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装所有依赖（包括开发依赖，因为某些构建工具可能需要）
RUN pnpm install --frozen-lockfile

# 复制应用代码
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "dist/index.js"]
```

---

### 方案2：检查必需文件

确认压缩包包含所有必需文件：

**必需文件清单**：
- ✅ `Dockerfile`（根目录）
- ✅ `package.json`（根目录）
- ✅ `pnpm-lock.yaml`（根目录）
- ✅ `dist/index.js`（构建后的入口文件）
- ✅ `dist/` 目录（完整的构建输出）
- ✅ `server/` 目录（服务器源代码）
- ✅ `shared/` 目录（共享代码）

**检查方法**：
1. 解压 `deploy.zip`
2. 确认所有文件都在
3. 确认 `dist/index.js` 存在且可执行

---

### 方案3：简化 Dockerfile（如果上述方案不行）

尝试最简化的 Dockerfile：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 先复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --prod

# 复制代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动
CMD ["node", "dist/index.js"]
```

---

## 🔧 详细排查步骤

### 步骤1：检查本地构建

**在本地测试 Dockerfile**：

```bash
# 1. 确保已构建代码
pnpm build

# 2. 测试 Dockerfile（如果本地有 Docker）
docker build -t test-image .
docker run -p 3000:3000 test-image
```

如果本地构建失败，说明 Dockerfile 有问题。

---

### 步骤2：检查压缩包内容

**重新创建压缩包，确保包含所有文件**：

```powershell
# 1. 构建代码
pnpm build

# 2. 确认 dist/index.js 存在
dir dist\index.js

# 3. 创建压缩包
Compress-Archive -Path dist,server,shared,package.json,pnpm-lock.yaml,Dockerfile -DestinationPath deploy.zip -Force

# 4. 验证压缩包内容
# 解压 deploy.zip，检查所有文件是否都在
```

---

### 步骤3：检查 package.json

**确认 `start` 脚本正确**：

```json
{
  "scripts": {
    "start": "set NODE_ENV=production && node dist/index.js"
  }
}
```

**在 Dockerfile 中，应该直接使用**：
```dockerfile
CMD ["node", "dist/index.js"]
```

（不需要 `set` 命令，因为 Dockerfile 中已经设置了 `ENV NODE_ENV=production`）

---

### 步骤4：检查 Node.js 版本

**确认 Dockerfile 中的 Node.js 版本**：

当前使用：`node:20-alpine`

如果项目需要特定版本，可以尝试：
- `node:18-alpine`（LTS）
- `node:20-alpine`（当前）
- `node:22-alpine`（最新）

---

## 📋 更新的 Dockerfile（推荐使用）

**创建新的 Dockerfile，替换现有的**：

```dockerfile
# 使用官方 Node.js LTS 版本
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖（如果需要）
RUN apk add --no-cache \
    python3 \
    make \
    g++

# 启用 corepack（pnpm 支持）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（生产环境）
RUN pnpm install --frozen-lockfile --prod

# 复制应用代码
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 创建非 root 用户（安全最佳实践）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
```

---

## 🚀 快速修复步骤

### 1. 更新 Dockerfile

使用上面推荐的 Dockerfile 替换现有的。

### 2. 重新创建压缩包

```powershell
# 构建代码
pnpm build

# 创建压缩包（包含更新的 Dockerfile）
Compress-Archive -Path dist,server,shared,package.json,pnpm-lock.yaml,Dockerfile -DestinationPath deploy.zip -Force
```

### 3. 重新上传部署

1. 删除旧的部署版本
2. 上传新的 `deploy.zip`
3. 设置端口为 `3000`
4. 点击"重新部署"

---

## 🔍 常见失败原因

### 原因1：pnpm 安装失败

**症状**：`pnpm install` 失败

**解决**：
- 使用 `corepack` 安装 pnpm（推荐）
- 或使用 `npm install -g pnpm`

### 原因2：缺少系统依赖

**症状**：某些 native 模块编译失败

**解决**：
- 在 Dockerfile 中添加系统依赖：
  ```dockerfile
  RUN apk add --no-cache python3 make g++
  ```

### 原因3：dist/index.js 不存在

**症状**：启动时找不到文件

**解决**：
- 确认已执行 `pnpm build`
- 确认 `dist/index.js` 在压缩包中

### 原因4：端口配置错误

**症状**：服务无法启动

**解决**：
- 确认 Dockerfile 中 `EXPOSE 3000`
- 确认云托管中端口设置为 `3000`

---

## ✅ 检查清单

### 部署前
- [ ] 已执行 `pnpm build` 构建代码
- [ ] 已确认 `dist/index.js` 存在
- [ ] Dockerfile 已更新（使用推荐的版本）
- [ ] 压缩包包含所有必需文件
- [ ] 压缩包大小合理（<100MB）

### 部署时
- [ ] 端口设置为 `3000`
- [ ] 已上传包含 Dockerfile 的压缩包
- [ ] 查看部署日志，确认文件解压成功

### 如果仍然失败
- [ ] 查看完整的部署日志
- [ ] 检查是否有具体的错误信息
- [ ] 尝试使用简化的 Dockerfile
- [ ] 联系云开发客服

---

## 📞 需要帮助？

如果问题仍然存在：

1. **查看完整日志**：
   - 在部署页面查看完整的错误日志
   - 查找具体的错误信息

2. **提供信息**：
   - 部署日志的完整内容
   - Dockerfile 内容
   - package.json 内容

3. **联系支持**：
   - 云开发客服
   - 或提供错误信息，我可以进一步帮助
