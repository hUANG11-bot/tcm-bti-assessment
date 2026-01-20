# 清理微信开发者工具缓存

## ❌ 当前问题

微信开发者工具报错：
```
Error: file: pages/profile/index.js
unknown: Missing semicolon. (1:13013)
```

**错误信息中显示的代码**：
```
loginFn=function(){setLoading(!0);var k=p(f().m((
```

**但当前编译后的代码中没有 `loginFn`**，说明微信开发者工具可能在使用**缓存的旧编译文件**。

## ✅ 解决方案

### 步骤1：清理微信开发者工具缓存

1. **关闭微信开发者工具**
2. **删除缓存目录**（如果存在）：
   - Windows: `%APPDATA%\微信开发者工具\`
   - 或项目目录下的 `.wx` 文件夹（如果存在）

### 步骤2：清理 dist 目录并重新编译

**在 PowerShell 中运行**：

```powershell
cd d:\tcm-bti-assessment

# 清理 dist 目录
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 重新编译
pnpm build:weapp:prod
```

### 步骤3：在微信开发者工具中重新加载

1. **重新打开微信开发者工具**
2. **选择项目目录**：`d:\tcm-bti-assessment\dist`
3. **点击"编译"按钮**
4. **或使用快捷键** `Ctrl + R` 刷新

---

## 🔍 验证

**检查编译后的文件**：

```powershell
# 检查文件是否存在
Test-Path dist\pages\profile\index.js

# 检查文件大小
(Get-Item dist\pages\profile\index.js).Length
```

**应该返回**：
- `True`
- 文件大小约 9303 字节

---

## ⚠️ 如果问题仍然存在

**请提供**：
1. 完整的错误信息
2. 微信开发者工具的版本号
3. 是否清理了缓存

---

**请先清理微信开发者工具缓存，然后重新编译！**
