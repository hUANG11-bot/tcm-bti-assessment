# 微信一键登录实现说明

## ✅ 功能已实现

微信一键登录功能已经完整实现，包括前端和后端。

## 📍 功能位置

**前端**：`src/pages/profile/index.tsx` - "我的"页面中的"微信一键登录"按钮

**后端**：`server/api/wechat-login.ts` - `/api/wechat/login` 接口

## 🔄 登录流程

### 1. 用户点击"微信一键登录"按钮

### 2. 前端获取微信登录凭证

```typescript
// 调用 Taro.login() 获取 code
const loginRes = await Taro.login()
```

### 3. 获取用户信息（可选）

```typescript
// 尝试获取用户信息（需要用户授权）
const userProfile = await Taro.getUserProfile({
  desc: '用于完善用户资料',
})
```

### 4. 发送到后端

前端将 `code` 和 `userInfo` 发送到后端：

```typescript
Taro.request({
  url: `${API_BASE_URL}/api/wechat/login`,
  method: 'POST',
  data: {
    code: loginRes.code,
    userInfo: userProfile.userInfo, // 可选
  },
})
```

### 5. 后端处理

后端执行以下步骤：

1. **使用 code 换取 openid**
   ```typescript
   // 调用微信 API
   https://api.weixin.qq.com/sns/jscode2session
   ?appid=WX_APPID
   &secret=WX_SECRET
   &js_code=code
   &grant_type=authorization_code
   ```

2. **创建或更新用户**
   ```typescript
   await db.upsertUser({
     openId: openid,
     name: userInfo?.nickName || null,
     loginMethod: 'wechat_miniprogram',
   })
   ```

3. **创建 session token**
   ```typescript
   const sessionToken = await sdk.createSessionToken(openid, {
     name: userInfo?.nickName || '',
     expiresInMs: ONE_YEAR_MS,
   })
   ```

4. **设置 cookie**
   ```typescript
   res.cookie(COOKIE_NAME, sessionToken, {
     maxAge: ONE_YEAR_MS
   })
   ```

### 6. 返回成功

前端收到成功响应后，刷新用户信息，登录完成。

## ⚙️ 配置要求

### 1. 后端环境变量

在 `.env` 文件中配置：

```env
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret
```

### 2. 前端 API 地址

在 `config/index.js` 中已配置，或通过环境变量设置：

```bash
set TARO_APP_API_URL=http://localhost:3000 && pnpm dev:weapp
```

## 🎯 快速开始

### 步骤 1：获取 AppSecret

1. 访问 https://mp.weixin.qq.com
2. 进入：**开发** → **开发管理** → **开发设置**
3. 找到 **AppSecret（小程序密钥）**
4. 如果未设置，点击"生成"并保存

### 步骤 2：配置环境变量

在项目根目录创建 `.env` 文件：

```env
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret
```

### 步骤 3：启动服务

```bash
# 启动后端服务器
pnpm dev

# 启动小程序开发（新开终端）
pnpm dev:weapp
```

### 步骤 4：测试登录

1. 在微信开发者工具中打开小程序
2. 点击"我的"标签
3. 点击"微信一键登录"按钮
4. 授权后即可登录成功

## 🔍 代码位置

### 前端登录逻辑

**文件**：`src/pages/profile/index.tsx`

**关键函数**：`handleWechatLogin()`

**主要步骤**：
1. `Taro.login()` - 获取 code
2. `Taro.getUserProfile()` - 获取用户信息（可选）
3. `Taro.request()` - 发送到后端
4. `refresh()` - 刷新用户信息

### 后端登录接口

**文件**：`server/api/wechat-login.ts`

**路由**：`POST /api/wechat/login`

**主要步骤**：
1. 验证 code
2. 调用微信 API 换取 openid
3. 创建/更新用户
4. 创建 session token
5. 设置 cookie

## 🛠️ 错误处理

### 用户拒绝授权

如果用户拒绝授权，系统会：
- 只使用 `code` 进行登录（匿名登录）
- 不获取用户昵称和头像
- 仍然可以正常登录

### 常见错误

1. **INVALID_TOKEN** - AppSecret 配置错误
   - 解决：检查 `.env` 文件中的 `WX_SECRET`

2. **code 已过期** - code 只能使用一次，有效期约5分钟
   - 解决：重新点击登录按钮

3. **网络错误** - 无法连接到后端
   - 解决：检查后端服务器是否运行，API 地址是否正确

## 📝 注意事项

1. **AppSecret 安全**
   - 不要在前端代码中暴露 AppSecret
   - 只在后端使用
   - 不要提交到代码仓库

2. **code 使用**
   - code 只能使用一次
   - code 有效期很短（约5分钟）
   - 每次登录都需要获取新的 code

3. **用户信息授权**
   - `getUserProfile` 需要用户主动授权
   - 如果用户拒绝，仍可使用 code 登录（匿名）

4. **开发环境**
   - 在微信开发者工具中，需要勾选"不校验合法域名"
   - 生产环境必须配置合法域名

## 🔗 相关文档

- [微信登录快速开始](./QUICK-START-WECHAT-LOGIN.md)
- [微信登录详细指南](./WECHAT-LOGIN-GUIDE.md)
- [微信登录错误排查](./WECHAT-LOGIN-TROUBLESHOOTING.md)

## 💡 总结

微信一键登录功能已经完整实现，只需要：

1. ✅ 配置 AppSecret（`.env` 文件）
2. ✅ 启动后端服务器
3. ✅ 启动小程序开发
4. ✅ 点击"微信一键登录"按钮

就这么简单！🎉
