# 生产环境问题修复指南

## 🚨 问题描述

上传正式发布测试后出现两个问题：
1. **微信无法一键登录**
2. **AI中医无法使用**

## ⚠️ 重要提示

**如果您使用微信云开发**，请查看：[CLOUD-DEVELOPMENT-SETUP.md](./CLOUD-DEVELOPMENT-SETUP.md)

云开发的配置方式与普通服务器不同，需要：
- 使用云托管或云函数
- 在云开发控制台配置环境变量
- 使用云开发的API地址

## 🔍 问题1：微信无法一键登录

### 可能原因

1. **服务器域名未配置**（最常见）
2. **API地址配置错误**（使用了HTTP或localhost）
3. **后端环境变量未配置**
4. **Cookie跨域问题**

### 解决步骤

#### 步骤1：配置服务器域名（必须）

**在微信公众平台配置：**

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入：**开发** → **开发管理** → **开发设置**
3. 找到 **"服务器域名"** 部分
4. 点击 **"修改"** 按钮
5. 在 **"request合法域名"** 中添加您的后端 API 域名

**域名要求：**
- ✅ 必须使用 **HTTPS**（不能使用 HTTP）
- ✅ 必须通过 **ICP 备案**（国内服务器）
- ✅ 不能使用 **IP 地址**
- ✅ 不能使用 **端口号**（默认 443）
- ✅ 格式：`https://api.yourdomain.com`

**示例：**
```
request合法域名：
https://api.yourdomain.com
```

#### 步骤2：检查后端环境变量

**在服务器上检查 `.env` 文件：**

```env
# 微信小程序配置（必须正确）
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret

# API地址（生产环境）
TARO_APP_API_URL=https://api.yourdomain.com

# 其他配置
NODE_ENV=production
JWT_SECRET=你的JWT密钥
```

**验证配置：**
```bash
# 在服务器上运行
pnpm check-env
```

#### 步骤3：检查API地址配置

**确认编译时使用了正确的API地址：**

```bash
# 重新编译生产版本（使用正确的API地址）
set TARO_APP_API_URL=https://api.yourdomain.com && pnpm build:weapp
```

**或者在 `config/index.js` 中修改：**
```javascript
defineConstants: {
  TARO_APP_API_URL: JSON.stringify(
    process.env.TARO_APP_API_URL || 'https://api.yourdomain.com'
  )
}
```

#### 步骤4：检查后端服务

**确认后端服务正常运行：**

1. **检查服务是否运行**：
   ```bash
   # 在服务器上检查
   curl https://api.yourdomain.com/api/wechat/login
   ```

2. **检查日志**：
   - 查看后端日志，确认是否有错误
   - 特别关注微信API调用相关的错误

3. **测试登录接口**：
   ```bash
   # 测试登录接口是否可访问
   curl -X POST https://api.yourdomain.com/api/wechat/login \
     -H "Content-Type: application/json" \
     -d '{"code":"test"}'
   ```

#### 步骤5：检查Cookie配置

**检查 `server/_core/cookies.ts` 中的Cookie配置：**

确保生产环境的Cookie配置正确：
- `domain` 应该设置为您的域名
- `secure` 应该设置为 `true`（HTTPS）
- `sameSite` 应该设置为 `'none'` 或 `'lax'`

### 常见错误及解决方案

#### 错误1：`url not in domain list`

**原因**：域名未在微信公众平台配置

**解决**：
1. 登录微信公众平台
2. 配置服务器域名（见步骤1）

#### 错误2：`INVALID_TOKEN` 或 `invalid credential`

**原因**：AppSecret 配置错误

**解决**：
1. 检查 `.env` 中的 `WX_SECRET` 是否正确
2. 确认 AppSecret 与微信公众平台中的一致
3. 重启后端服务

#### 错误3：`code 已过期`

**原因**：登录凭证过期（code只能使用一次，有效期约5分钟）

**解决**：这是正常情况，用户需要重新点击登录按钮

---

## 🔍 问题2：AI中医无法使用

### 可能原因

1. **API地址配置错误**
2. **AI服务未配置或余额不足**
3. **服务器域名未配置**
4. **网络连接问题**

### 解决步骤

#### 步骤1：检查API地址配置

**确认小程序编译时使用了正确的API地址：**

```bash
# 重新编译，使用生产环境API地址
set TARO_APP_API_URL=https://api.yourdomain.com && pnpm build:weapp
```

**验证编译后的代码：**
- 打开 `dist` 目录
- 检查编译后的代码中API地址是否正确

#### 步骤2：配置服务器域名

**在微信公众平台配置：**

1. 登录微信公众平台
2. 进入：**开发** → **开发管理** → **开发设置**
3. 在 **"request合法域名"** 中添加您的后端 API 域名
4. 确保使用 HTTPS

#### 步骤3：检查后端AI服务配置

**在服务器上检查 `.env` 文件：**

```env
# AI服务配置（至少配置一个）
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek密钥

# 或配置备用服务
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的Forge密钥
```

**测试AI服务：**
```bash
# 在服务器上运行
pnpm test-ai-chat
```

#### 步骤4：检查后端服务日志

**查看后端日志，确认AI调用是否成功：**

1. **查看错误信息**：
   - `AI_API_KEY 未配置` → 需要配置AI服务
   - `余额不足` → 需要充值或配置备用服务
   - `API调用失败` → 检查网络连接

2. **测试AI接口**：
   ```bash
   curl -X POST https://api.yourdomain.com/api/trpc/ai.chat \
     -H "Content-Type: application/json" \
     -d '{"json":{"messages":[{"role":"user","content":"你好"}]}}'
   ```

### 常见错误及解决方案

#### 错误1：`无法连接到服务器`

**原因**：API地址配置错误或域名未配置

**解决**：
1. 确认 `TARO_APP_API_URL` 配置正确
2. 在微信公众平台配置服务器域名
3. 重新编译小程序

#### 错误2：`AI服务暂时不可用`

**原因**：AI服务配置错误或余额不足

**解决**：
1. 运行 `pnpm test-ai-chat` 测试AI服务
2. 如果余额不足，充值或配置备用服务
3. 检查后端日志查看详细错误

---

## 📋 完整检查清单

### 微信登录问题

- [ ] 在微信公众平台配置了服务器域名（request合法域名）
- [ ] 服务器域名使用 HTTPS
- [ ] 服务器域名已通过 ICP 备案
- [ ] `.env` 中配置了正确的 `WX_APPID` 和 `WX_SECRET`
- [ ] 编译时使用了正确的 `TARO_APP_API_URL`（HTTPS地址）
- [ ] 后端服务正常运行
- [ ] 后端可以访问微信API（`https://api.weixin.qq.com`）

### AI中医问题

- [ ] 在微信公众平台配置了服务器域名
- [ ] 编译时使用了正确的 `TARO_APP_API_URL`（HTTPS地址）
- [ ] 后端 `.env` 中配置了AI服务（`AI_API_KEY` 或 `BUILT_IN_FORGE_API_KEY`）
- [ ] 运行 `pnpm test-ai-chat` 测试通过
- [ ] 后端服务可以访问AI API
- [ ] 后端日志无AI相关错误

### 通用配置

- [ ] 后端服务使用 HTTPS
- [ ] 后端服务正常运行
- [ ] 后端环境变量配置正确
- [ ] 小程序重新编译（使用生产环境配置）
- [ ] 清除小程序缓存并重新加载

---

## 🛠️ 快速修复步骤

### 1. 配置服务器域名（最重要）

```bash
# 1. 登录微信公众平台
# 2. 开发 → 开发管理 → 开发设置
# 3. 配置 request合法域名：https://api.yourdomain.com
```

### 2. 更新后端环境变量

```env
# 在服务器 .env 文件中
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret
TARO_APP_API_URL=https://api.yourdomain.com
AI_PROVIDER=deepseek
AI_API_KEY=你的AI密钥
```

### 3. 重新编译小程序

```bash
# 使用生产环境API地址编译
set TARO_APP_API_URL=https://api.yourdomain.com && pnpm build:weapp
```

### 4. 重启后端服务

```bash
# 在服务器上
pnpm start
# 或
pm2 restart your-app
```

### 5. 重新上传小程序

1. 在微信开发者工具中打开编译后的 `dist` 目录
2. 点击"上传"按钮
3. 填写版本号和备注
4. 上传后在小程序中测试

---

## 🔧 调试方法

### 查看小程序日志

1. 在微信开发者工具中打开"调试器"
2. 切换到"Console"标签
3. 查看错误信息

### 查看后端日志

```bash
# 如果使用 PM2
pm2 logs your-app

# 如果直接运行
# 查看终端输出
```

### 测试接口

```bash
# 测试登录接口
curl -X POST https://api.yourdomain.com/api/wechat/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}'

# 测试AI接口
curl -X POST https://api.yourdomain.com/api/trpc/ai.chat \
  -H "Content-Type: application/json" \
  -d '{"json":{"messages":[{"role":"user","content":"你好"}]}}'
```

---

## 💡 重要提示

1. **生产环境必须使用 HTTPS**：微信小程序要求所有API必须使用HTTPS
2. **必须配置服务器域名**：未配置的域名无法访问
3. **域名必须备案**：国内服务器必须通过ICP备案
4. **重新编译小程序**：修改配置后必须重新编译
5. **清除缓存**：上传后清除小程序缓存并重新加载

---

## 📞 获取帮助

如果按照以上步骤仍然无法解决：

1. **查看详细错误**：
   - 小程序控制台（调试器 → Console）
   - 后端服务日志

2. **运行诊断工具**：
   ```bash
   pnpm check-env      # 检查配置
   pnpm test-ai-chat   # 测试AI服务
   ```

3. **检查文档**：
   - `WECHAT-LOGIN-TROUBLESHOOTING.md` - 微信登录问题排查
   - `AI-DIAGNOSIS.md` - AI功能诊断指南
   - `MINIPROGRAM-PUBLISH-GUIDE.md` - 发布指南
