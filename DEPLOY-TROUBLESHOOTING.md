# 部署故障排除指南

## 🔍 当前问题

**状态**：
- ✅ 文件解压成功
- ✅ `dist/index.js` 存在
- ✅ Dockerfile 存在
- ❌ **Docker 镜像构建失败**：`check_build_image : fail`

---

## 🚀 解决方案

### 已优化的 Dockerfile

我已经优化了 Dockerfile，主要改进：

1. **添加 `libc6-compat`**（某些模块需要）
2. **添加 `--shamefully-hoist`**（解决依赖解析问题）
3. **添加 npm fallback**（如果 pnpm 失败）
4. **添加详细的调试输出**

---

## ✅ 下一步操作

### 步骤1：重新创建压缩包（包含更新的 Dockerfile）

```powershell
# 在项目根目录执行
$tempDir = "deploy-temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path "$tempDir\dist" | Out-Null
Copy-Item "dist\index.js" "$tempDir\dist\"
Copy-Item -Recurse server $tempDir\
Copy-Item -Recurse shared $tempDir\
Copy-Item package.json $tempDir\
Copy-Item pnpm-lock.yaml $tempDir\
Copy-Item Dockerfile $tempDir\
Compress-Archive -Path "$tempDir\*" -DestinationPath deploy.zip -Force
Remove-Item -Recurse -Force $tempDir
Write-Host "完成！" -ForegroundColor Green
```

### 步骤2：重新上传部署

1. 上传新的 `deploy.zip`
2. 确认端口设置为 `3000`
3. 点击发布

---

## 🔧 如果仍然失败

### 方案1：查看详细日志

在部署页面查看**完整的构建日志**，查找：
- `pnpm install` 的错误信息
- 依赖安装失败的具体原因
- 是否有模块编译失败

### 方案2：尝试使用 npm 而不是 pnpm

如果 pnpm 有问题，可以修改 Dockerfile：

```dockerfile
# 不使用 pnpm，直接使用 npm
FROM node:20-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache python3 make g++ libc6-compat || true

# 复制文件
COPY package.json pnpm-lock.yaml ./
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 使用 npm 安装依赖
RUN npm install --production --legacy-peer-deps

# 暴露端口
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
```

### 方案3：检查依赖问题

某些依赖可能需要特殊处理：

1. **检查是否有 native 模块**：
   - 查看 `package.json` 中的依赖
   - 某些模块需要编译（如 `bcrypt`、`sharp` 等）

2. **尝试移除可选依赖**：
   - 在 Dockerfile 中使用 `--no-optional`

3. **检查 Node.js 版本兼容性**：
   - 某些依赖可能需要特定版本的 Node.js

---

## 📋 更新的 Dockerfile 内容

当前 Dockerfile 已优化为：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    || true

# 安装 pnpm
RUN npm install -g pnpm@latest && \
    pnpm --version

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（多重 fallback）
RUN pnpm install --frozen-lockfile --prod --shamefully-hoist || \
    (echo "pnpm install failed, trying npm..." && \
     npm install --production --legacy-peer-deps || \
     npm install --production)

# 复制应用代码
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 验证文件
RUN echo "=== Checking files ===" && \
    ls -la && \
    ls -la dist/ && \
    test -f dist/index.js || (echo "ERROR: dist/index.js not found!" && ls -la dist/ && exit 1) && \
    echo "=== Files OK ==="

# 暴露端口
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
```

---

## 🔍 调试步骤

### 1. 查看完整日志

在部署页面：
- 展开构建日志
- 查找 `pnpm install` 或 `npm install` 的输出
- 查找具体的错误信息

### 2. 检查常见问题

**问题1：依赖安装失败**
- 查看是否有特定的包安装失败
- 检查是否需要额外的系统依赖

**问题2：内存不足**
- 某些构建过程需要较多内存
- 可能需要优化依赖或使用更小的基础镜像

**问题3：网络问题**
- 依赖下载失败
- 可能需要配置镜像源

---

## 📞 需要帮助？

如果问题仍然存在，请提供：

1. **完整的构建日志**（从部署页面复制）
2. **具体的错误信息**（特别是 `pnpm install` 或 `npm install` 的错误）
3. **package.json 中的依赖列表**（如果有特殊依赖）

我可以根据具体错误进一步优化 Dockerfile。

---

## 💡 临时解决方案

如果急需部署，可以尝试：

1. **使用更简单的基础镜像**：
   ```dockerfile
   FROM node:20-slim
   # 而不是 node:20-alpine
   ```

2. **只安装必需的依赖**：
   - 检查哪些依赖是运行时必需的
   - 只安装这些依赖

3. **联系云开发客服**：
   - 如果所有方法都失败
   - 可以联系技术支持获取帮助
