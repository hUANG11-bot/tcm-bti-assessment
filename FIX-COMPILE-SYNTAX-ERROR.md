# 修复编译语法错误

## ❌ 错误信息

```
Error: file: pages/profile/index.js
unknown: Missing semicolon. (1:13013)
```

## 🔍 问题原因

1. **源代码文件被删除**：`src/pages/profile/index.tsx` 已被删除
2. **dist 目录中有旧的编译文件**：导致编译错误
3. **代码压缩问题**：编译后的代码在压缩时出现语法错误

---

## ✅ 解决方案

### 步骤1：清理 dist 目录

**在 PowerShell 中运行**：

```powershell
cd d:\tcm-bti-assessment

# 删除 dist 目录
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

### 步骤2：检查源代码是否存在

**检查 profile 页面源代码**：

```powershell
# 检查文件是否存在
Test-Path src\pages\profile\index.tsx
```

**如果文件不存在**，需要：
1. 从 Git 恢复文件（如果有版本控制）
2. 或重新创建文件

### 步骤3：从 Git 恢复文件（如果有 Git 仓库）

```powershell
# 恢复被删除的文件
git checkout HEAD -- src/pages/profile/index.tsx
```

### 步骤4：重新编译

```powershell
# 重新编译小程序
pnpm dev:weapp
```

---

## 🔍 如果源代码文件不存在

### 方案1：从 Git 恢复

```powershell
# 查看 Git 状态
git status

# 恢复所有被删除的文件
git checkout HEAD -- src/
```

### 方案2：检查是否有备份

检查是否有其他位置的备份文件。

### 方案3：重新创建文件

如果文件无法恢复，需要重新创建 `src/pages/profile/index.tsx`。

---

## 🚀 立即操作

**在 PowerShell 中运行**：

```powershell
# 1. 清理 dist 目录
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 2. 检查源代码是否存在
Test-Path src\pages\profile\index.tsx

# 3. 如果文件不存在，尝试从 Git 恢复
# git checkout HEAD -- src/pages/profile/index.tsx

# 4. 重新编译
pnpm dev:weapp
```

---

## ⚠️ 重要提示

1. **不要删除源代码文件**：只删除 `dist` 目录
2. **使用 Git 恢复**：如果有 Git 仓库，可以从 Git 恢复被删除的文件
3. **重新编译**：清理 dist 后需要重新编译

---

**请先清理 dist 目录，然后告诉我源代码文件是否存在，我会帮您恢复或重新创建！**
