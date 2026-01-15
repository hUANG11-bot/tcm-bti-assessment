# 修复 localhost:3000 仍然出现的问题

## 🚨 问题确认

从控制台日志看到：
```
POST http://localhost:3000/api/wechat/login net::ERR_CONNECTION_REFUSED
```

这说明：
- ❌ 小程序中仍有代码在尝试连接 `localhost:3000`
- ❌ 可能是编译缓存问题
- ❌ 或者 `TARO_APP_API_URL` 常量没有被正确编译

---

## 🚀 解决方案

### 步骤1：完全清除编译缓存和 dist 目录

1. **关闭微信开发者工具**

2. **删除 dist 目录**：
   ```powershell
   # 在 PowerShell 中执行
   Remove-Item -Recurse -Force dist
   ```

3. **清除 node_modules/.cache**（如果存在）：
   ```powershell
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   ```

---

### 步骤2：确认源代码已更新

检查以下文件确保没有 `localhost:3000`：

#### 1. `config/index.js`

应该看到：
```javascript
defineConstants: {
  TARO_APP_API_URL: JSON.stringify(
    process.env.TARO_APP_API_URL || 'https://er1.store'
  )
}
```

**不应该有**：
```javascript
process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '...'
```

#### 2. `src/lib/trpc.ts`

应该看到：
```typescript
const API_BASE_URL = 'https://er1.store'
```

**不应该有**：
```typescript
const API_BASE_URL = 'http://localhost:3000'
```

#### 3. `src/pages/profile/index.tsx`

应该看到：
```typescript
const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
```

---

### 步骤3：重新编译小程序

1. **在 PowerShell 中执行**：
   ```powershell
   pnpm build:weapp
   ```

2. **等待编译完成**

3. **确认 dist 目录已重新生成**

---

### 步骤4：在微信开发者工具中清除所有缓存

1. **打开微信开发者工具**

2. **点击"编译"按钮旁边的下拉箭头**

3. **选择"清除缓存"**

4. **选择"清除所有缓存"**（包括：
   - 编译缓存
   - 文件缓存
   - 数据缓存
   - 网络缓存）

---

### 步骤5：重新加载项目

1. **在微信开发者工具中**

2. **点击"编译"按钮**（或按 `Ctrl+B`）

3. **等待编译完成**

---

### 步骤6：验证配置

1. **打开"调试器" → "Console"标签**

2. **查看日志**，应该看到：
   ```
   [tRPC] API Base URL: https://er1.store
   ```

3. **不应该看到**：
   ```
   [tRPC] API Base URL: http://localhost:3000
   ```

---

### 步骤7：测试登录

1. **在小程序中点击"微信一键登录"按钮**

2. **查看控制台**，应该看到：
   ```
   POST https://er1.store/api/wechat/login
   ```

3. **不应该看到**：
   ```
   POST http://localhost:3000/api/wechat/login
   ```

---

## 🔍 如果仍然看到 localhost:3000

### 方法1：检查编译后的代码

1. **打开 `dist/pages/profile/index.js`**（编译后的文件）

2. **搜索 `localhost:3000`**

3. **如果找到**：
   - 说明编译时使用了旧的配置
   - 需要重新检查 `config/index.js`
   - 确保没有环境变量覆盖了配置

---

### 方法2：检查环境变量

1. **在 PowerShell 中检查**：
   ```powershell
   $env:TARO_APP_API_URL
   ```

2. **如果设置了 `localhost:3000`**：
   ```powershell
   # 清除环境变量
   Remove-Item Env:\TARO_APP_API_URL
   ```

3. **重新编译**：
   ```powershell
   pnpm build:weapp
   ```

---

### 方法3：强制使用生产域名

如果上述方法都不行，可以临时在代码中硬编码：

#### 修改 `src/pages/profile/index.tsx`

将：
```typescript
const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
```

改为：
```typescript
const API_BASE_URL = 'https://er1.store'
```

然后重新编译。

---

## ⚠️ 重要提示

### 关于编译缓存

- **必须清除缓存**：微信开发者工具和 Taro 都会缓存编译结果
- **必须删除 dist**：确保使用最新的源代码编译
- **必须重新编译**：修改配置后必须重新编译

---

### 关于环境变量

- **检查环境变量**：确保没有设置 `TARO_APP_API_URL=http://localhost:3000`
- **使用生产编译**：使用 `pnpm build:weapp`（不是 `dev:weapp`）

---

### 关于微信开发者工具

- **清除所有缓存**：包括编译缓存、文件缓存、数据缓存
- **重新加载项目**：清除缓存后必须重新编译

---

## 📋 完整操作清单

- [ ] 关闭微信开发者工具
- [ ] 删除 `dist` 目录
- [ ] 检查 `config/index.js` 配置正确
- [ ] 检查 `src/lib/trpc.ts` 配置正确
- [ ] 检查 `src/pages/profile/index.tsx` 配置正确
- [ ] 清除环境变量 `TARO_APP_API_URL`（如果设置了）
- [ ] 运行 `pnpm build:weapp` 重新编译
- [ ] 打开微信开发者工具
- [ ] 清除所有缓存
- [ ] 重新编译小程序
- [ ] 查看控制台，确认没有 `localhost:3000`
- [ ] 测试登录功能

---

## 🎯 现在请

1. **完全清除缓存和 dist 目录**

2. **确认源代码配置正确**

3. **重新编译小程序**

4. **在微信开发者工具中清除所有缓存**

5. **重新加载项目**

6. **查看控制台，确认没有 `localhost:3000`**

7. **测试登录功能**

8. **告诉我结果**

---

## 💡 提示

- **彻底清除**：必须删除 dist 目录和所有缓存
- **使用生产编译**：使用 `build:weapp` 而不是 `dev:weapp`
- **检查环境变量**：确保没有环境变量覆盖配置
- **验证编译结果**：检查 dist 目录中的文件，确认没有 `localhost:3000`

**请按照上述步骤彻底清除缓存并重新编译，然后告诉我结果！**
