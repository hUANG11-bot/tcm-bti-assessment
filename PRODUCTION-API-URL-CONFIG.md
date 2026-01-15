# 生产环境 API 地址配置指南

## 📋 当前配置说明

### 开发环境（当前）

- **`.env` 文件**：`TARO_APP_API_URL=http://localhost:3000`
- **`config/index.js`**：开发环境默认使用 `http://localhost:3000`
- **用途**：本地开发，连接本地后端服务器

### 生产环境

- **需要修改**：`.env` 文件或环境变量
- **`config/index.js`**：生产环境默认使用 `https://er1.store`
- **用途**：部署到生产环境，连接生产服务器

---

## ✅ 生产环境配置方法

### 方法1：修改 .env 文件（推荐，简单）

**编辑 `.env` 文件**，将：

```env
TARO_APP_API_URL=http://localhost:3000
```

**改为**：

```env
TARO_APP_API_URL=https://er1.store
```

**然后重新编译**：

```powershell
pnpm build:weapp
```

---

### 方法2：使用环境变量（推荐，灵活）

**在编译时设置环境变量**：

```powershell
# Windows PowerShell
$env:TARO_APP_API_URL="https://er1.store"; pnpm build:weapp

# 或者使用 package.json 中的脚本
pnpm build:weapp:prod
```

**或者修改 `package.json` 中的脚本**（已存在）：

```json
"build:weapp:prod": "set NODE_ENV=production && set TARO_APP_API_URL=https://er1.store && taro build --type weapp"
```

---

### 方法3：使用不同的 .env 文件

**创建 `.env.production` 文件**：

```env
TARO_APP_API_URL=https://er1.store
```

**然后在编译时指定**：

```powershell
# 需要修改编译脚本以支持 .env.production
```

---

## 🎯 推荐方案

### 开发环境

**保持 `.env` 文件为**：

```env
TARO_APP_API_URL=http://localhost:3000
```

### 生产环境

**使用环境变量编译**（不修改 `.env` 文件）：

```powershell
# Windows PowerShell
$env:TARO_APP_API_URL="https://er1.store"
$env:NODE_ENV="production"
pnpm build:weapp
```

**或者使用已有的脚本**：

```powershell
pnpm build:weapp:prod
```

---

## 📝 配置优先级

配置的优先级（从高到低）：

1. **环境变量** `TARO_APP_API_URL`（最高优先级）
2. **`.env` 文件**中的 `TARO_APP_API_URL`
3. **`config/index.js`** 中的默认值（根据 `NODE_ENV` 判断）

---

## 🔄 切换环境示例

### 开发环境

```powershell
# .env 文件
TARO_APP_API_URL=http://localhost:3000

# 编译
pnpm dev:weapp
```

### 生产环境

```powershell
# 方法1：修改 .env 文件
TARO_APP_API_URL=https://er1.store
pnpm build:weapp

# 方法2：使用环境变量（推荐，不修改 .env）
$env:TARO_APP_API_URL="https://er1.store"
pnpm build:weapp

# 方法3：使用已有脚本
pnpm build:weapp:prod
```

---

## ⚠️ 重要提示

### 1. 生产环境还需要配置微信公众平台

即使修改了 API 地址，还需要：

1. **登录微信公众平台**：https://mp.weixin.qq.com/
2. **进入您的小程序**
3. **开发** → **开发管理** → **开发设置**
4. **服务器域名** → **request 合法域名**
5. **添加**：`https://er1.store`

### 2. 确保后端服务已部署

- 确保 `https://er1.store` 可以正常访问
- 确保后端服务正在运行
- 确保 SSL 证书有效

### 3. 开发和生产环境分离

**推荐做法**：
- **开发环境**：使用 `.env` 文件配置 `http://localhost:3000`
- **生产环境**：使用环境变量或单独的配置文件配置 `https://er1.store`

这样可以在不同环境之间轻松切换，不会互相影响。

---

## 🚀 快速切换

### 切换到生产环境

```powershell
# 临时设置环境变量并编译
$env:TARO_APP_API_URL="https://er1.store"
pnpm build:weapp
```

### 切换回开发环境

```powershell
# 确保 .env 文件是开发配置
# TARO_APP_API_URL=http://localhost:3000
pnpm dev:weapp
```

---

## 📋 总结

**是的，生产环境需要修改为 `https://er1.store`**，但推荐使用环境变量的方式，而不是直接修改 `.env` 文件，这样可以：

1. ✅ 保持开发环境配置不变
2. ✅ 灵活切换环境
3. ✅ 避免误操作

---

**推荐使用 `pnpm build:weapp:prod` 或设置环境变量来编译生产版本！**
