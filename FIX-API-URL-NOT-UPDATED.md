# 修复 API 地址未更新问题

## 🚨 问题确认

控制台仍然显示：
```
[tRPC] API Base URL: https://er1.store
```

这说明虽然代码已更新，但编译后的代码仍然使用旧配置。

---

## 🚀 解决方案

### 步骤1：删除 dist 目录（完全清除编译结果）

1. **关闭微信开发者工具**（确保没有文件被占用）

2. **在 PowerShell 中执行**：
   ```powershell
   cd d:\tcm-bti-assessment
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   ```

---

### 步骤2：确认使用生产模式编译

确保使用生产模式编译（`NODE_ENV=production`）：

在 PowerShell 中执行：
```powershell
cd d:\tcm-bti-assessment
$env:NODE_ENV="production"
pnpm build:weapp
```

或者直接使用：
```powershell
cd d:\tcm-bti-assessment
npm run build:weapp
```

---

### 步骤3：在微信开发者工具中清除所有缓存

1. **打开微信开发者工具**
2. **点击"编译"按钮旁边的下拉箭头**
3. **选择"清除缓存"**
4. **选择"清除所有缓存"**（包括：
   - 编译缓存
   - 文件缓存
   - 数据缓存
   - 网络缓存）

---

### 步骤4：重新编译小程序

1. **点击"编译"按钮**（或按 `Ctrl+B`）
2. **等待编译完成**

---

### 步骤5：验证配置

1. **打开"调试器" → "Console"标签**
2. **查看日志**，应该看到：
   ```
   [tRPC] API Base URL: https://tci-184647-5-1377481866.sh.run.tcloudbase.com
   ```
3. **不应该看到**：
   ```
   [tRPC] API Base URL: https://er1.store
   ```

---

## ⚠️ 重要提示

### 关于编译模式

- **必须使用生产模式**：`NODE_ENV=production`
- **开发模式会使用 localhost**：`NODE_ENV=development` 会使用 `http://localhost:3000`

### 关于缓存

- **必须删除 dist 目录**：确保使用最新的源代码编译
- **必须清除所有缓存**：确保使用最新的编译结果

---

## 🎯 现在请

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

7. **查看控制台**，确认 API 地址已更新

8. **测试 AI 功能**

---

## 💡 提示

- **删除 dist 目录**：这是关键步骤，确保使用最新代码编译
- **使用生产模式**：确保使用正确的 API 地址
- **清除所有缓存**：确保使用最新的编译结果

**请按照上述步骤操作，特别是删除 dist 目录，然后告诉我结果！**
