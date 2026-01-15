# 修复 "url not in domain list" 错误

## 🔍 问题说明

错误 `request:fail url not in domain list` 表示小程序尝试访问的域名没有在微信公众平台配置为合法域名。

## ✅ 解决方案（开发环境）

### 方法1：关闭域名校验（推荐，仅开发时使用）

在微信开发者工具中：

1. 点击右上角的 **"详情"** 按钮
2. 在 **"本地设置"** 标签页中
3. 勾选 **"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"**
4. 重新编译小程序

这样在开发时就可以访问 `http://localhost:3000` 了。

### 方法2：使用内网穿透（如果需要真机调试）

如果需要在真机上测试，可以使用内网穿透工具：

1. **使用 ngrok**：
   ```bash
   ngrok http 3000
   ```
   会生成一个 HTTPS 地址，例如：`https://xxxx.ngrok.io`

2. **更新配置**：
   ```env
   TARO_APP_API_URL=https://xxxx.ngrok.io
   ```

3. **在微信公众平台配置域名**：
   - 登录 https://mp.weixin.qq.com
   - 进入：开发 → 开发管理 → 开发设置
   - 在"服务器域名"中添加：`https://xxxx.ngrok.io`

## 🚀 生产环境配置

### 必须配置服务器域名

在生产环境，必须在微信公众平台配置合法域名：

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用小程序账号登录

2. **配置服务器域名**
   - 进入：**开发** → **开发管理** → **开发设置**
   - 找到 **"服务器域名"** 部分
   - 点击 **"修改"** 按钮
   - 在 **"request合法域名"** 中添加您的后端 API 域名

3. **域名要求**
   - ✅ 必须使用 HTTPS（不能使用 HTTP）
   - ✅ 必须通过 ICP 备案（国内服务器）
   - ✅ 不能使用 IP 地址
   - ✅ 不能使用端口号（默认 443）
   - ✅ 格式：`https://api.yourdomain.com`

4. **配置示例**
   ```
   request合法域名：
   https://api.yourdomain.com
   ```

5. **更新环境变量**
   ```env
   TARO_APP_API_URL=https://api.yourdomain.com
   ```

6. **重新编译**
   ```bash
   pnpm build:weapp
   ```

## 📝 检查清单

### 开发环境
- [ ] 在微信开发者工具中关闭域名校验
- [ ] 后端服务运行在 `http://localhost:3000`
- [ ] `.env` 中配置了 `TARO_APP_API_URL=http://localhost:3000`

### 生产环境
- [ ] 在微信公众平台配置了服务器域名
- [ ] 域名使用 HTTPS
- [ ] 域名已通过 ICP 备案
- [ ] `.env` 中配置了生产环境 API 地址
- [ ] 重新编译了小程序

## ⚠️ 注意事项

1. **开发环境**：可以关闭域名校验，方便本地开发
2. **生产环境**：必须配置合法域名，否则无法访问 API
3. **真机调试**：需要使用内网穿透或配置测试域名
4. **域名限制**：每个小程序最多配置 20 个 request 合法域名

## 🔗 相关文档

- [MINIPROGRAM-PUBLISH-GUIDE.md](./MINIPROGRAM-PUBLISH-GUIDE.md) - 发布指南
- [WECHAT-LOGIN-GUIDE.md](./WECHAT-LOGIN-GUIDE.md) - 微信登录配置
