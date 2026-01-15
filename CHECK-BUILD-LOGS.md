# 如何查看构建日志

## 🔍 重要：需要查看详细日志

**当前问题**：Docker 镜像构建失败，但看不到具体的错误信息。

**解决方案**：需要查看完整的构建日志才能诊断问题。

---

## 📋 如何查看构建日志

### 步骤1：进入部署页面

1. 登录微信公众平台
2. 进入：**云服务** → **云开发** → **云托管**
3. 点击您的服务（如：`Zhongyiti`）
4. 点击 **"部署发布"** 标签

### 步骤2：查看失败版本的日志

1. 找到失败的版本（如：`zhongyiti-010`）
2. 点击版本名称或"查看详情"
3. 找到 **"构建日志"** 或 **"部署日志"** 部分
4. 展开日志，查看完整内容

### 步骤3：查找关键信息

在日志中查找：

1. **`npm install` 的输出**：
   - 是否有特定的包安装失败？
   - 是否有编译错误？
   - 是否有网络错误？

2. **错误信息**：
   - 查找 `ERROR`、`FAILED`、`error` 等关键词
   - 查找具体的错误堆栈

3. **失败步骤**：
   - 是在 `npm install` 阶段失败？
   - 还是在文件验证阶段失败？
   - 还是在其他步骤失败？

---

## 📝 需要提供的信息

**请复制以下信息**：

1. **完整的构建日志**（从 `-----------构建zhongyiti-XXX-----------` 开始到结束）
2. **特别是 `npm install` 部分的输出**
3. **任何错误信息**（包含 `ERROR`、`FAILED`、`error` 的行）

---

## 🔧 常见错误类型

### 错误1：依赖安装失败

**症状**：
```
npm ERR! code XXX
npm ERR! ...
```

**可能原因**：
- 某个依赖包无法下载
- 依赖版本冲突
- 网络问题

### 错误2：编译失败

**症状**：
```
gyp ERR! build error
make: *** [xxx] Error 1
```

**可能原因**：
- native 模块编译失败
- 缺少系统依赖

### 错误3：文件不存在

**症状**：
```
ERROR: dist/index.js not found!
```

**可能原因**：
- 文件路径问题
- 文件未正确复制

---

## 💡 临时解决方案

如果无法查看详细日志，可以尝试：

### 方案1：使用最简化的 Dockerfile

我已经创建了 `Dockerfile.minimal`，可以尝试使用：

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package.json ./
COPY dist ./dist
COPY server ./server
COPY shared ./shared

RUN npm install --production --no-optional --legacy-peer-deps

RUN test -f dist/index.js || exit 1

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
```

### 方案2：联系云开发客服

如果所有方法都失败：
1. 提供构建日志
2. 询问是否有特殊要求
3. 询问是否有示例 Dockerfile

---

## 🚀 下一步

**请提供完整的构建日志**，我可以根据具体错误进一步优化 Dockerfile。

特别是：
- `npm install` 的完整输出
- 任何错误信息
- 失败发生的具体步骤
