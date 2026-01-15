# 更新 .env 文件用于开发环境

## ✅ 已修复

**已修改 `.env` 文件**：
- 将 `TARO_APP_API_URL` 从 `https://er1.store` 改为 `http://localhost:3000`

## 🔍 问题原因

`.env` 文件中设置了 `TARO_APP_API_URL=https://er1.store`，这会覆盖 `config/index.js` 中的开发环境默认值。

## 🚀 立即操作

### 步骤1：重新编译小程序

**在运行 `pnpm dev:weapp` 的 PowerShell 窗口中**：

由于修改了 `.env` 文件，需要重新编译小程序。

**按 `Ctrl+C` 停止当前编译**，然后重新运行：

```powershell
pnpm dev:weapp
```

### 步骤2：在微信开发者工具中关闭域名校验

**如果还没有关闭**：

1. 在微信开发者工具中，点击右上角的"详情"按钮
2. 切换到"本地设置"标签
3. ✅ **勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"**
4. 关闭设置窗口

### 步骤3：重新编译小程序

**在微信开发者工具中**：
1. 点击"编译"按钮
2. 或者点击"编译"旁边的下拉箭头，选择"清除缓存" → "清除所有缓存"，然后重新编译

### 步骤4：验证修复

**重新编译后，在控制台中应该看到**：

```
[tRPC] API Base URL: http://localhost:3000
```

而不是 `https://er1.store`。

---

## 📋 当前配置

### 开发环境（.env 文件）

```env
TARO_APP_API_URL=http://localhost:3000
```

### 生产环境

如果需要部署到生产环境，可以：
1. 修改 `.env` 文件：`TARO_APP_API_URL=https://er1.store`
2. 或者设置环境变量：`set TARO_APP_API_URL=https://er1.store`

---

## ⚠️ 重要提示

### 需要同时运行两个进程

1. **后端服务器**：`pnpm dev`（运行在 `localhost:3000`）✅ 已在运行
2. **小程序编译**：`pnpm dev:weapp`（需要重新编译）

### 开发环境配置

- **API 地址**：`http://localhost:3000`
- **需要关闭域名校验**：在微信开发者工具中关闭域名校验

---

## 🚀 立即操作

**在运行 `pnpm dev:weapp` 的窗口中**：

1. 按 `Ctrl+C` 停止当前编译
2. 重新运行：`pnpm dev:weapp`
3. 等待编译完成
4. 在微信开发者工具中关闭域名校验
5. 重新编译小程序
6. 检查控制台，应该看到 `[tRPC] API Base URL: http://localhost:3000`

---

**完成以上步骤后，小程序应该可以正常连接到本地后端服务器了！**
