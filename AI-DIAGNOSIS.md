# AI中医功能诊断指南

## 🔍 快速诊断

如果AI中医功能无法使用，请按以下步骤诊断：

### 步骤1：检查环境变量配置

运行配置检查命令：

```bash
pnpm check-env
```

确认以下配置：
- ✅ `AI_API_KEY` 已配置（用于国内AI服务）
- ✅ 或 `BUILT_IN_FORGE_API_KEY` 已配置（用于备用服务）

### 步骤2：测试AI服务连接

运行AI服务测试：

```bash
# 测试基础AI服务
pnpm test-ai

# 测试完整的AI对话功能（推荐）
pnpm test-ai-chat
```

### 步骤3：查看后端日志

启动后端服务：

```bash
pnpm dev
```

在控制台查看错误信息，常见错误：

- `AI_API_KEY 未配置` → 需要在 `.env` 中添加 `AI_API_KEY`
- `DeepSeek API调用失败: 401` → API密钥无效
- `DeepSeek API调用失败: 429` → 请求次数超限
- `所有AI服务都不可用` → 两个服务都配置失败

## 🛠️ 常见问题及解决方案

### 问题1：提示"AI服务暂时不可用"

**可能原因**：
1. API密钥未配置
2. API密钥无效
3. API调用次数超限
4. 网络连接问题

**解决步骤**：

1. **检查配置**：
   ```bash
   pnpm check-env
   ```

2. **测试API连接**：
   ```bash
   pnpm test-ai-chat
   ```

3. **根据错误信息处理**：
   - 如果提示"未配置"：在 `.env` 文件中添加相应的API密钥
   - 如果提示"401"：检查API密钥是否正确，登录控制台验证
   - 如果提示"429"：检查使用量，等待限制重置或充值

### 问题2：国内AI服务和备用服务都失败

**可能原因**：
- 两个服务都没有正确配置
- 网络问题导致无法访问API

**解决方案**：

#### 方案A：配置国内AI服务（推荐）

1. **获取DeepSeek API密钥**：
   - 访问 https://platform.deepseek.com
   - 注册/登录账号
   - 在控制台创建API密钥

2. **配置环境变量**：
   在 `.env` 文件中添加：
   ```env
   AI_PROVIDER=deepseek
   AI_API_KEY=你的DeepSeek密钥
   ```

3. **测试配置**：
   ```bash
   pnpm test-ai-chat
   ```

#### 方案B：配置备用服务（Forge API）

1. **获取Forge API密钥**：
   - 访问 https://forge.manus.im
   - 注册/登录账号
   - 获取API密钥

2. **配置环境变量**：
   在 `.env` 文件中添加：
   ```env
   BUILT_IN_FORGE_API_URL=https://forge.manus.im
   BUILT_IN_FORGE_API_KEY=你的Forge密钥
   ```

3. **测试配置**：
   ```bash
   pnpm test-ai-chat
   ```

### 问题3：小程序中无法使用AI功能

**可能原因**：
1. 后端服务未运行
2. API地址配置错误
3. 域名白名单限制

**解决步骤**：

1. **确认后端服务运行**：
   ```bash
   pnpm dev
   ```
   应该看到服务启动信息，端口通常是 3000

2. **检查小程序配置**：
   - 在微信开发者工具中关闭域名校验
   - 详情 → 本地设置 → 勾选"不校验合法域名"

3. **检查API地址**：
   - 确认 `.env` 中的 `TARO_APP_API_URL` 与后端端口一致
   - 默认应该是 `http://localhost:3000`

4. **查看小程序控制台**：
   - 在微信开发者工具中打开"调试器"
   - 查看 Console 标签中的错误信息

## 📋 完整检查清单

### 后端配置
- [ ] `.env` 文件存在
- [ ] `AI_API_KEY` 或 `BUILT_IN_FORGE_API_KEY` 已配置
- [ ] 运行 `pnpm check-env` 无错误
- [ ] 运行 `pnpm test-ai-chat` 测试通过
- [ ] 后端服务正在运行（`pnpm dev`）
- [ ] 后端控制台无错误日志

### 小程序配置
- [ ] 微信开发者工具中关闭了域名校验
- [ ] `.env` 中的 `TARO_APP_API_URL` 与后端端口一致
- [ ] 小程序已重新编译
- [ ] 微信开发者工具中清除了缓存

### 网络连接
- [ ] 后端服务可以访问（浏览器打开 `http://localhost:3000`）
- [ ] 可以访问AI服务API（DeepSeek或Forge）
- [ ] 没有防火墙阻止连接

## 🔧 调试命令

```bash
# 检查环境变量配置
pnpm check-env

# 测试AI服务连接
pnpm test-ai

# 测试完整AI对话功能
pnpm test-ai-chat

# 启动后端服务（查看详细日志）
pnpm dev
```

## 📞 获取帮助

如果以上步骤都无法解决问题：

1. **查看详细错误**：
   - 后端控制台的完整错误信息
   - 小程序控制台的错误信息

2. **检查文档**：
   - `DEEPSEEK-SETUP.md` - DeepSeek配置指南
   - `AI-TROUBLESHOOTING.md` - 故障排除指南
   - `DEBUG-AI-CHAT.md` - 调试指南

3. **验证API密钥**：
   - 登录对应的控制台（DeepSeek或Forge）
   - 检查密钥是否有效
   - 查看使用量和余额
