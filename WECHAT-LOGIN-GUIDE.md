# 微信一键登录功能实现指南

## 📋 功能概述

微信一键登录功能已经实现，包括：
- ✅ 前端：个人页面中的"微信一键登录"按钮
- ✅ 后端：`/api/wechat/login` 接口
- ✅ 自动创建/更新用户信息
- ✅ 设置登录 session

## 🔧 配置步骤

### 步骤 1：获取微信小程序 AppID 和 AppSecret

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用小程序管理员账号登录

2. **获取 AppID（小程序ID）**
   - 进入：开发 → 开发管理 → 开发设置
   - 在"账号信息"中可以看到 **AppID（小程序ID）**
   - 例如：`wx04a7af67c8f47620`

3. **获取 AppSecret（小程序密钥）**
   - 在同一个页面，找到 **AppSecret（小程序密钥）**
   - 如果未设置，点击"生成"按钮
   - ⚠️ **重要**：AppSecret 只显示一次，请妥善保存！

### 步骤 2：配置服务器环境变量

在服务器端配置环境变量：

#### 方法 1：使用 `.env` 文件（推荐）

在项目根目录创建或编辑 `.env` 文件：

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret密钥
```

#### 方法 2：在启动命令中设置

```bash
# Windows (CMD)
set WX_APPID=wx04a7af67c8f47620 && set WX_SECRET=你的AppSecret && npm start

# Windows (PowerShell)
$env:WX_APPID="wx04a7af67c8f47620"; $env:WX_SECRET="你的AppSecret"; npm start

# Linux/Mac
WX_APPID=wx04a7af67c8f47620 WX_SECRET=你的AppSecret npm start
```

#### 方法 3：在服务器配置中设置

如果使用 PM2、Docker 或其他部署工具，在相应配置文件中设置环境变量。

### 步骤 3：配置小程序 API 地址

在 `config/index.js` 中配置 API 服务器地址：

```javascript
defineConstants: {
  // 开发环境
  TARO_APP_API_URL: JSON.stringify(process.env.TARO_APP_API_URL || 'http://localhost:3000')
  // 生产环境请改为实际服务器地址
  // TARO_APP_API_URL: JSON.stringify('https://your-api-domain.com')
}
```

或者在启动编译时设置：

```bash
# Windows
set TARO_APP_API_URL=http://localhost:3000 && pnpm dev:weapp

# Linux/Mac
TARO_APP_API_URL=http://localhost:3000 pnpm dev:weapp
```

## 🚀 使用流程

### 1. 启动服务器

确保服务器正在运行，并且配置了 `WX_APPID` 和 `WX_SECRET`：

```bash
# 启动服务器（确保已配置环境变量）
npm start
# 或
pnpm start
```

### 2. 启动小程序开发

```bash
# 编译小程序
pnpm dev:weapp
```

### 3. 在微信开发者工具中测试

1. 打开微信开发者工具
2. 导入项目，选择 `dist` 目录
3. 点击"我的"标签
4. 点击"微信一键登录"按钮
5. 授权后即可登录

## 📝 登录流程说明

### 前端流程（`src/pages/profile/index.tsx`）

1. **获取登录凭证**
   ```javascript
   const loginRes = await Taro.login()  // 获取 code
   ```

2. **获取用户信息（可选）**
   ```javascript
   const userProfile = await Taro.getUserProfile({
     desc: '用于完善用户资料',
   })
   ```

3. **发送到后端**
   ```javascript
   Taro.request({
     url: `${API_BASE_URL}/api/wechat/login`,
     method: 'POST',
     data: {
       code: loginRes.code,
       userInfo: userProfile.userInfo,  // 可选
     },
   })
   ```

### 后端流程（`server/api/wechat-login.ts`）

1. **接收 code**
   - 验证 code 是否存在

2. **调用微信 API 换取 openid**
   ```javascript
   // 调用微信接口：https://api.weixin.qq.com/sns/jscode2session
   // 参数：appid, secret, js_code, grant_type
   ```

3. **创建/更新用户**
   - 使用 openid 作为用户唯一标识
   - 保存用户昵称、头像等信息

4. **创建 session token**
   - 生成 JWT token
   - 设置到 cookie 中

5. **返回成功响应**

## ⚠️ 注意事项

### 1. AppSecret 安全

- ⚠️ **绝对不要**将 AppSecret 提交到代码仓库
- ⚠️ **绝对不要**在前端代码中使用 AppSecret
- ✅ 只在服务器端使用环境变量存储

### 2. 网络请求配置

确保小程序可以访问你的 API 服务器：

- 在微信公众平台配置服务器域名
- 路径：开发 → 开发管理 → 开发设置 → 服务器域名
- 添加你的 API 服务器域名到"request合法域名"

### 3. 开发环境测试

- 开发环境可以使用 `http://localhost:3000`
- 但需要确保：
  - 微信开发者工具 → 设置 → 项目设置 → 不校验合法域名（开发时）
  - 或者配置本地域名映射

### 4. 用户授权

- `Taro.getUserProfile` 需要用户主动授权
- 如果用户拒绝授权，可以使用 code 进行匿名登录
- 代码已处理这种情况

## 🐛 常见问题

### Q1: 提示"服务器配置错误，请联系管理员"

**原因**：`WX_SECRET` 环境变量未配置

**解决**：
1. 检查 `.env` 文件是否存在且包含 `WX_SECRET`
2. 检查服务器启动时是否读取了环境变量
3. 重启服务器

### Q2: 提示"微信登录失败"或 "errcode: 40013"

**原因**：AppID 或 AppSecret 配置错误

**解决**：
1. 检查 AppID 是否正确
2. 检查 AppSecret 是否正确（注意不要有多余空格）
3. 确认 AppSecret 是否已启用（在微信公众平台检查）

### Q3: 网络请求失败

**原因**：API 服务器地址配置错误或网络不通

**解决**：
1. 检查 `TARO_APP_API_URL` 配置
2. 检查服务器是否正在运行
3. 检查微信开发者工具的"不校验合法域名"设置

### Q4: 登录成功但用户信息未更新

**原因**：前端未刷新用户信息

**解决**：
- 代码中已调用 `refresh()`，如果仍有问题，检查 `useAuth` hook 的实现

## 📚 相关文件

- 前端登录逻辑：`src/pages/profile/index.tsx`
- 后端登录接口：`server/api/wechat-login.ts`
- 路由注册：`server/_core/index.ts`
- 环境变量配置：`.env`（需要创建）
- Taro 配置：`config/index.js`

## 🔗 参考文档

- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [微信小程序 code2Session 接口](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)
- [Taro 登录 API](https://docs.taro.zone/docs/apis/open-api/login/wx.login)
