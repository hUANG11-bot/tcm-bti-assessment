# 切换到生产环境配置

## ✅ 已切换到生产环境

**已修改 `.env` 文件**：
- `TARO_APP_API_URL=https://er1.store`

## 🚀 立即操作

### 步骤1：重新编译小程序（生产版本）

**在运行 `pnpm dev:weapp` 的 PowerShell 窗口中**：

1. **按 `Ctrl+C` 停止当前编译**
2. **运行生产编译**：

```powershell
pnpm build:weapp:prod
```

或者：

```powershell
pnpm build:weapp
```

### 步骤2：在微信开发者工具中配置合法域名

**重要**：生产环境必须配置合法域名，不能只关闭域名校验。

1. **登录微信公众平台**：https://mp.weixin.qq.com/
2. **进入您的小程序**
3. **开发** → **开发管理** → **开发设置**
4. **服务器域名** → **request 合法域名**
5. **添加**：`https://er1.store`
6. **保存**

### 步骤3：在微信开发者工具中打开项目

1. **打开微信开发者工具**
2. **选择项目目录**：`d:\tcm-bti-assessment\dist`
3. **填写 AppID**
4. **点击"编译"**

---

## 📋 当前配置

### 生产环境配置

- **`.env` 文件**：`TARO_APP_API_URL=https://er1.store`
- **`config/index.js`**：生产环境使用 `https://er1.store`
- **API 地址**：`https://er1.store`

---

## ⚠️ 重要提示

### 1. 确保后端服务已部署

- ✅ 确保 `https://er1.store` 可以正常访问
- ✅ 确保后端服务正在运行
- ✅ 确保 SSL 证书有效

### 2. 必须在微信公众平台配置合法域名

**不能只关闭域名校验**，生产环境必须：
- 在微信公众平台配置 `https://er1.store` 为合法域名
- 否则小程序无法访问 API

### 3. 开发环境切换

如果需要切换回开发环境：

```powershell
# 修改 .env 文件
TARO_APP_API_URL=http://localhost:3000

# 重新编译
pnpm dev:weapp
```

---

## 🚀 立即操作

**在 PowerShell 中运行**：

```powershell
# 1. 停止当前编译（如果还在运行）
# 按 Ctrl+C

# 2. 编译生产版本
pnpm build:weapp:prod

# 3. 等待编译完成
```

**然后在微信开发者工具中**：
1. 配置合法域名：`https://er1.store`
2. 打开 `dist` 目录
3. 重新编译

---

**完成以上步骤后，小程序将使用生产环境配置！**
