# 修复 React 模块找不到错误

## ❌ 错误信息

```
resolve 'react/jsx-runtime' in 'D:\tcm-bti-assessment\src'
D:\tcm-bti-assessment\node_modules\react doesn't exist
ELIFECYCLE Command failed with exit code 1
```

## 🔍 问题原因

`react` 依赖没有正确安装，或者 `node_modules` 目录有问题。

---

## ✅ 解决方案

### 步骤1：检查 node_modules 是否存在

**在 PowerShell 中运行**：

```powershell
Test-Path node_modules
```

如果返回 `False`，说明依赖未安装。

### 步骤2：检查 react 是否已安装

**在 PowerShell 中运行**：

```powershell
Test-Path node_modules\react
```

如果返回 `False`，说明 `react` 未安装。

### 步骤3：清理并重新安装依赖（推荐）

**在 PowerShell 中运行**：

```powershell
# 停止当前编译（按 Ctrl+C，如果还在运行）

# 删除 node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 删除 lock 文件
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue

# 重新安装依赖
pnpm install

# 等待安装完成（可能需要几分钟）
```

### 步骤4：验证安装

**检查 react 是否已安装**：

```powershell
Test-Path node_modules\react
```

应该返回 `True`。

**检查 react/jsx-runtime 是否存在**：

```powershell
Test-Path node_modules\react\jsx-runtime.js
```

### 步骤5：重新编译

```powershell
pnpm dev:weapp
```

---

## 🔍 如果仍然失败

### 检查 package.json 中是否有 react

**查看 package.json**：

```powershell
Get-Content package.json | Select-String '"react"'
```

如果找不到，需要添加依赖。

### 手动添加 react 依赖

**如果 package.json 中缺少 `react`**，需要添加：

```powershell
pnpm add react
```

或者手动编辑 `package.json`，在 `dependencies` 中添加：

```json
"react": "^18.3.1"
```

然后运行：

```powershell
pnpm install
```

---

## 📋 完整操作流程

### 1. 停止当前编译

按 `Ctrl+C` 停止当前编译。

### 2. 清理并重新安装

```powershell
# 删除 node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 删除 lock 文件
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue

# 重新安装依赖
pnpm install
```

### 3. 等待安装完成

安装可能需要几分钟，请耐心等待。

### 4. 验证安装

```powershell
# 检查 node_modules 是否存在
Test-Path node_modules

# 检查 react 是否存在
Test-Path node_modules\react

# 检查 react/jsx-runtime 是否存在
Test-Path node_modules\react\jsx-runtime.js
```

### 5. 重新编译

```powershell
pnpm dev:weapp
```

---

## ⚠️ 常见问题

### Q1: pnpm install 很慢

**这是正常的**：
- 首次安装需要下载所有依赖
- 可能需要几分钟时间
- 请耐心等待

### Q2: 安装失败

**检查**：
- 网络连接是否正常
- 是否有足够的磁盘空间
- 查看错误信息

### Q3: 仍然找不到 react

**解决**：
- 确认 `node_modules` 目录存在
- 确认 `react` 在 `package.json` 中
- 尝试删除 `node_modules` 和 `pnpm-lock.yaml`，然后重新安装

---

## 🚀 立即操作

**在当前的 PowerShell 窗口中运行**：

```powershell
# 1. 停止当前编译（按 Ctrl+C）

# 2. 清理并重新安装依赖
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install

# 3. 等待安装完成（可能需要几分钟）

# 4. 验证安装
Test-Path node_modules\react

# 5. 重新编译
pnpm dev:weapp
```

---

## 💡 提示

- **清理安装**：如果依赖有问题，清理后重新安装通常能解决
- **耐心等待**：首次安装可能需要几分钟
- **检查网络**：确保网络连接正常

---

**完成以上步骤后，编译应该可以正常进行了！**
