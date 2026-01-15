# AI对话功能故障排除

## 🔍 常见错误及解决方案

### 错误1：`request:fail url not in domain list`

**原因**：小程序域名白名单限制

**解决**：
1. 在微信开发者工具中：
   - 点击右上角"详情"
   - 切换到"本地设置"
   - 勾选"不校验合法域名..."
2. 重新编译小程序

详细说明：[FIX-DOMAIN-ERROR.md](./FIX-DOMAIN-ERROR.md)

---

### 错误2：`request:fail`（无具体错误信息）

**可能原因**：
1. 后端服务未启动
2. API 地址配置错误
3. 网络连接问题

**解决步骤**：

#### 步骤1：检查后端服务

确认后端服务正在运行：

```bash
# 检查端口 3000
netstat -ano | findstr :3000

# 或检查端口 3001（如果 3000 被占用）
netstat -ano | findstr :3001
```

如果服务未运行，启动后端：

```bash
pnpm dev
```

看到以下信息说明启动成功：
```
Server running on http://localhost:3001/
```

#### 步骤2：检查 API 地址配置

确认 `.env` 文件中的配置：

```env
TARO_APP_API_URL=http://localhost:3000
```

**注意**：如果后端运行在 3001 端口，需要改为：
```env
TARO_APP_API_URL=http://localhost:3001
```

#### 步骤3：重新编译小程序

修改 `.env` 后，需要重新编译：

```bash
# 停止当前编译（Ctrl+C）
# 重新启动
pnpm dev:weapp
```

#### 步骤4：在微信开发者工具中测试

1. 打开微信开发者工具
2. 点击"编译"按钮
3. 打开"调试器"（Console）
4. 查看是否有错误信息

---

### 错误3：`AbortController is not defined`

**原因**：小程序环境不支持 AbortController

**解决**：已修复，确保重新编译小程序

---

### 错误4：`addEventListener is not a function`

**原因**：AbortSignal polyfill 不完整

**解决**：已修复，确保重新编译小程序

---

### 错误5：AI 对话无响应

**可能原因**：
1. 后端 AI 服务配置错误
2. API 密钥无效
3. 网络连接问题

**解决步骤**：

#### 步骤1：检查后端日志

查看后端控制台的错误信息：

```bash
pnpm dev
```

常见错误：
- `AI_API_KEY 未配置` - 检查 `.env` 中的 `AI_API_KEY`
- `DeepSeek API调用失败: 401` - API 密钥无效
- `DeepSeek API调用失败: 429` - 请求次数超限

#### 步骤2：验证 AI 配置

运行配置检查：

```bash
pnpm check-env
```

确认：
- `AI_PROVIDER=deepseek`
- `AI_API_KEY` 已配置且有效

#### 步骤3：测试 API 连接

在后端控制台查看是否有 AI 调用的日志输出。

---

## 🛠️ 完整检查清单

### 后端服务
- [ ] 后端服务正在运行（`pnpm dev`）
- [ ] 服务运行在正确的端口（3000 或 3001）
- [ ] `.env` 文件配置正确
- [ ] AI 服务配置正确（`AI_PROVIDER`、`AI_API_KEY`）

### 小程序配置
- [ ] 在微信开发者工具中关闭了域名校验
- [ ] `.env` 中的 `TARO_APP_API_URL` 与后端端口一致
- [ ] 小程序已重新编译
- [ ] 微信开发者工具中清除了缓存

### 网络连接
- [ ] 后端服务可以访问（浏览器打开 `http://localhost:3000`）
- [ ] 小程序可以访问后端 API
- [ ] 没有防火墙阻止连接

## 🔍 调试方法

### 1. 查看小程序控制台

在微信开发者工具中：
1. 点击"调试器"
2. 切换到"Console"标签
3. 查看错误信息

### 2. 查看后端日志

后端服务会输出详细的日志，包括：
- API 请求信息
- AI 调用结果
- 错误详情

### 3. 测试 API 端点

在浏览器中测试后端 API：

```
http://localhost:3000/api/trpc/ai.chat
```

## 📝 常见问题

### Q: 为什么需要关闭域名校验？

A: 开发环境使用 `localhost`，不在微信的合法域名列表中。关闭校验后可以在开发时访问本地服务器。

### Q: 生产环境怎么办？

A: 必须在微信公众平台配置合法域名，使用 HTTPS 地址。

### Q: 如何查看详细的错误信息？

A: 在微信开发者工具的"调试器" → "Console"中查看。

## 🔗 相关文档

- [FIX-DOMAIN-ERROR.md](./FIX-DOMAIN-ERROR.md) - 域名错误修复
- [AI-TROUBLESHOOTING.md](./AI-TROUBLESHOOTING.md) - AI 服务故障排除
- [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md) - DeepSeek 配置
