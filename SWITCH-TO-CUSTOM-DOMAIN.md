# 切换到自定义域名（证书已生效）

## ✅ 证书状态

- ✅ **证书已签发**：SSL 证书已成功签发
- ✅ **绑定域名**：`er1.store` 和 `www.er1.store`
- ✅ **有效期**：到 2026-04-14

---

## 🚀 切换到自定义域名

### 步骤1：测试 HTTPS 访问

1. **打开浏览器**（Chrome、Edge 等）
2. **清除浏览器缓存**（重要！）
3. **访问**：`https://er1.store`
4. **查看是否能正常访问**（不显示证书警告）

**成功标志**：
- 浏览器能够访问
- 地址栏显示锁图标（表示 HTTPS 正常）
- 不显示证书警告

**如果仍然显示证书警告**：
- 等待几分钟（证书可能需要时间部署到云托管）
- 清除浏览器缓存后重试

---

### 步骤2：更新代码使用自定义域名

如果 HTTPS 访问正常，更新代码：

#### 修改 `src/lib/trpc.ts`：

```typescript
// 使用自定义域名
const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
```

#### 修改 `src/pages/profile/index.tsx`：

```typescript
// 使用自定义域名
const API_BASE_URL = 'https://er1.store'
```

#### 修改 `config/index.js`：

```javascript
TARO_APP_API_URL: JSON.stringify(
  process.env.TARO_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://er1.store')
)
```

---

### 步骤3：重新编译小程序

1. **关闭微信开发者工具**

2. **删除 dist 目录**：
   ```powershell
   cd d:\tcm-bti-assessment
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   ```

3. **使用生产模式重新编译**：
   ```powershell
   npm run build:weapp
   ```

4. **打开微信开发者工具**

5. **清除所有缓存**

6. **重新编译小程序**

---

### 步骤4：验证配置

1. **打开"调试器" → "Console"标签**
2. **查看日志**，应该看到：
   ```
   [tRPC] API Base URL: https://er1.store
   ```

---

### 步骤5：测试小程序连接

1. **在小程序中打开 AI 咨询页面**
2. **尝试发送一条消息**（例如："你好"）
3. **查看是否能正常收到 AI 回复**

---

## ⚠️ 重要提示

### 关于证书部署

- **证书已签发**：但可能需要时间部署到云托管
- **等待几分钟**：证书签发后可能需要几分钟才能完全生效
- **清除浏览器缓存**：确保使用最新的证书信息

### 关于代码更新

- **必须重新编译**：修改代码后必须重新编译
- **必须清除缓存**：确保使用最新的编译结果
- **使用生产模式**：确保使用正确的 API 地址

---

## 🎯 现在请

1. **测试 HTTPS 访问**：
   - 清除浏览器缓存
   - 访问 `https://er1.store`
   - 告诉我是否能正常访问（不显示证书警告）

2. **如果 HTTPS 访问正常**：
   - 我可以帮您更新代码使用 `https://er1.store`
   - 然后重新编译小程序

3. **如果仍然显示证书警告**：
   - 等待几分钟后重试
   - 或者告诉我具体的错误信息

---

## 💡 提示

- **证书已签发**：SSL 证书已成功签发
- **等待部署**：证书可能需要几分钟部署到云托管
- **清除缓存**：确保使用最新的证书信息
- **测试访问**：先测试 HTTPS 访问，再更新代码

**请先测试 HTTPS 访问，然后告诉我结果。如果访问正常，我可以帮您更新代码使用自定义域名！**
