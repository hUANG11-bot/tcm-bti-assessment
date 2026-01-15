# 微信一键登录功能修复指南

## 📋 问题诊断

微信一键登录功能无法使用，可能的原因有：

1. **API地址配置错误**
2. **后端服务未运行**
3. **微信开发者工具域名校验**
4. **微信AppID或AppSecret配置错误**
5. **网络连接问题**

---

## 🔍 快速诊断步骤

### 步骤1：检查后端服务

**确认后端服务是否正在运行：**

```bash
# 检查服务是否运行
# 应该看到类似输出：
# Server running on http://localhost:3000/
```

**如果服务未运行：**
```bash
# 启动后端服务
pnpm dev
```

### 步骤2：检查API地址配置

**查看前端API地址配置：**

1. **检查 `config/index.js`**：
   ```javascript
   TARO_APP_API_URL: JSON.stringify(
     process.env.TARO_APP_API_URL || 
     (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://er1.store')
   )
   ```

2. **检查 `.env` 文件**：
   ```env
   TARO_APP_API_URL=https://er1.store
   # 或
   TARO_APP_API_URL=http://localhost:3000
   ```

3. **检查前端代码**（`src/pages/profile/index.tsx`）：
   ```typescript
   const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
   ```

### 步骤3：检查微信配置

**确认微信配置正确：**

```bash
# 运行配置检查
pnpm check-env
```

**应该看到：**
```
✅ WX_APPID: 已配置
✅ WX_SECRET: 已配置
```

---

## 🔧 修复方案

### 方案1：修复API地址配置（最常见）

#### 问题：API地址指向错误

**症状：**
- 点击"微信一键登录"后提示"网络错误"或"无法连接"
- 控制台显示 `request:fail` 错误

**解决方法：**

1. **确认后端服务地址**
   - 如果使用云托管：`https://er1.store` 或云托管地址
   - 如果本地开发：`http://localhost:3000`

2. **修改配置**

   **方法A：修改 `config/index.js`**
   ```javascript
   defineConstants: {
     TARO_APP_API_URL: JSON.stringify(
       process.env.TARO_APP_API_URL || 'https://er1.store'  // 改为实际地址
     )
   }
   ```

   **方法B：使用环境变量**
   ```bash
   # 在 .env 文件中添加
   TARO_APP_API_URL=https://er1.store
   ```

3. **重新编译小程序**
   ```bash
   # 停止当前编译（Ctrl+C）
   # 重新编译
   pnpm dev:weapp
   ```

4. **清除微信开发者工具缓存**
   - 微信开发者工具 → 编译 → 清除缓存 → 清除所有缓存

---

### 方案2：修复微信开发者工具设置

#### 问题：域名校验阻止请求

**症状：**
- 提示 `request:fail url not in domain list`
- 提示 `不在以下 request 合法域名列表中`

**解决方法：**

1. **开发环境（临时解决）**
   - 微信开发者工具 → 右上角"详情"
   - 本地设置 → 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
   - 重新编译小程序

2. **生产环境（必须配置）**
   - 登录微信公众平台：https://mp.weixin.qq.com
   - 开发 → 开发管理 → 开发设置 → 服务器域名
   - 在"request合法域名"中添加：
     - `https://er1.store`
     - 或您的实际API地址

---

### 方案3：修复微信AppID/AppSecret配置

#### 问题：微信API调用失败

**症状：**
- 提示"AppID 无效"或"AppSecret 无效"
- 后端日志显示 `errcode: 40013` 或 `errcode: 40125`

**解决方法：**

1. **检查 `.env` 文件**
   ```env
   WX_APPID=wx04a7af67c8f47620
   WX_SECRET=你的AppSecret（确保没有多余空格）
   ```

2. **验证AppSecret**
   - 登录微信公众平台
   - 开发 → 开发管理 → 开发设置
   - 检查AppSecret是否已生成
   - 如果未生成或忘记，点击"重置"生成新的

3. **重启后端服务**
   ```bash
   # 停止服务（Ctrl+C）
   # 重新启动
   pnpm dev
   ```

---

### 方案4：检查后端路由注册

#### 问题：路由未正确注册

**检查 `server/_core/index.ts`：**

```typescript
// 应该包含以下代码
import wechatLoginRouter from "../api/wechat-login";

// 在 app 配置中
app.use("/api/wechat", wechatLoginRouter);
```

**如果缺少，添加后重启服务。**

---

## 🧪 测试步骤

### 步骤1：测试后端接口

**在浏览器或Postman中测试：**

```bash
# 测试健康检查
curl https://er1.store/api/trpc/system.health?input={"json":{"timestamp":1234567890}}

# 或
curl http://localhost:3000/api/trpc/system.health?input={"json":{"timestamp":1234567890}}
```

**应该返回：**
```json
{"json":{"ok":true}}
```

### 步骤2：测试微信登录接口

**注意：** 微信登录接口需要有效的 `code`，不能直接测试。

**检查接口是否存在：**
```bash
# 应该能访问（虽然会返回错误，但说明接口存在）
curl -X POST https://er1.store/api/wechat/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}'
```

**应该返回：**
```json
{"success":false,"message":"微信登录凭证 code 不能为空"}
```

### 步骤3：在小程序中测试

1. **打开微信开发者工具**
2. **打开"我的"页面**
3. **点击"微信一键登录"按钮**
4. **查看控制台日志**（调试器 → Console）

**查看日志：**
- 应该看到 `[WeChat Login] Calling WeChat API with AppID: ...`
- 如果有错误，会显示具体错误信息

---

## 📝 完整修复流程

### 1. 检查配置

```bash
# 检查环境变量
pnpm check-env

# 应该看到：
# ✅ WX_APPID: 已配置
# ✅ WX_SECRET: 已配置
```

### 2. 确认API地址

**查看当前配置：**
```bash
# 查看 config/index.js
cat config/index.js | grep TARO_APP_API_URL

# 查看 .env 文件
cat .env | grep TARO_APP_API_URL
```

**确认地址是否正确：**
- 开发环境：`http://localhost:3000`
- 生产环境：`https://er1.store` 或云托管地址

### 3. 修改配置（如果需要）

**如果API地址错误：**

```bash
# 编辑 config/index.js
# 修改 TARO_APP_API_URL 为正确的地址
```

**或使用环境变量：**

```bash
# 编辑 .env 文件
# 添加或修改：
TARO_APP_API_URL=https://er1.store
```

### 4. 重新编译

```bash
# 停止当前编译
# 重新编译小程序
pnpm dev:weapp
```

### 5. 清除缓存

**在微信开发者工具中：**
- 编译 → 清除缓存 → 清除所有缓存

### 6. 配置域名校验

**开发环境：**
- 详情 → 本地设置 → 勾选"不校验合法域名"

**生产环境：**
- 在微信公众平台配置合法域名

### 7. 测试登录

1. 打开"我的"页面
2. 点击"微信一键登录"
3. 授权登录
4. 查看是否成功

---

## ⚠️ 常见错误及解决

### 错误1：`request:fail url not in domain list`

**原因：** 域名未在微信公众平台配置

**解决：**
1. 开发环境：关闭域名校验（详情 → 本地设置）
2. 生产环境：在微信公众平台配置合法域名

### 错误2：`服务器配置错误，请联系管理员`

**原因：** `WX_SECRET` 未配置

**解决：**
1. 检查 `.env` 文件中的 `WX_SECRET`
2. 确认没有多余空格
3. 重启后端服务

### 错误3：`AppID 无效` (errcode: 40013)

**原因：** AppID 配置错误

**解决：**
1. 检查 `.env` 文件中的 `WX_APPID`
2. 确认与微信开发者工具中的 AppID 一致
3. 确认是小程序的 AppID，不是公众号的

### 错误4：`AppSecret 无效` (errcode: 40125)

**原因：** AppSecret 配置错误或未启用

**解决：**
1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置
3. 检查 AppSecret 是否已生成
4. 如果未生成，点击"生成"或"重置"
5. 更新 `.env` 文件中的 `WX_SECRET`
6. 重启后端服务

### 错误5：`登录凭证已过期` (errcode: 40029)

**原因：** code 已过期（code 有效期约5分钟）

**解决：**
- 重新点击"微信一键登录"按钮
- 获取新的 code

### 错误6：`无法连接到服务器`

**原因：** API地址配置错误或服务未运行

**解决：**
1. 检查后端服务是否运行
2. 检查 API 地址配置
3. 检查网络连接

---

## 🔍 调试方法

### 方法1：查看后端日志

**启动后端服务后，查看控制台输出：**

```bash
pnpm dev
```

**应该看到：**
```
[WeChat Login] Calling WeChat API with AppID: wx04a7af67c8f47620
[WeChat Login] Code length: 32
```

**如果有错误：**
```
[WeChat Login] WeChat API error: {
  errcode: 40013,
  errmsg: 'invalid appid',
  ...
}
```

### 方法2：查看小程序控制台

**在微信开发者工具中：**
1. 打开"调试器"
2. 切换到"Console"标签
3. 点击"微信一键登录"
4. 查看错误信息

**常见日志：**
```
微信登录失败: request:fail url not in domain list
微信登录失败: 服务器配置错误，请联系管理员
微信登录失败: AppID 无效，请检查配置
```

### 方法3：测试API连接

**在浏览器中测试：**

```bash
# 测试健康检查
https://er1.store/api/trpc/system.health?input={"json":{"timestamp":1234567890}}

# 应该返回：{"json":{"ok":true}}
```

---

## ✅ 检查清单

完成以下步骤后，微信登录应该可以正常工作：

- [ ] 后端服务正在运行
- [ ] `WX_APPID` 已配置且正确
- [ ] `WX_SECRET` 已配置且正确
- [ ] API地址配置正确（`TARO_APP_API_URL`）
- [ ] 小程序已重新编译
- [ ] 微信开发者工具缓存已清除
- [ ] 开发环境：已关闭域名校验
- [ ] 生产环境：已在微信公众平台配置合法域名
- [ ] 后端路由已正确注册（`/api/wechat/login`）
- [ ] 测试登录功能正常

---

## 💡 快速修复命令

```bash
# 1. 检查配置
pnpm check-env

# 2. 启动后端服务
pnpm dev

# 3. 重新编译小程序（在另一个终端）
pnpm dev:weapp

# 4. 在微信开发者工具中清除缓存并重新编译
```

---

## 📚 相关文档

- [微信登录实现说明](./WECHAT-LOGIN-IMPLEMENTATION.md)
- [微信登录配置指南](./WECHAT-LOGIN-GUIDE.md)
- [微信登录错误排查](./WECHAT-LOGIN-TROUBLESHOOTING.md)
- [API地址配置](./FIX-API-ADDRESS.md)

---

完成以上步骤后，微信一键登录功能应该可以正常使用了！🎉
