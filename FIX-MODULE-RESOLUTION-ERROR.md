# 修复模块解析错误

## ❌ 错误信息

```
Cannot find module '@tanstack/react-query'
Field 'browser' doesn't contain a valid alias configuration
ELIFECYCLE Command failed with exit code 1
```

## 🔍 问题原因

1. **依赖未安装**：`node_modules` 目录可能不存在或依赖未正确安装
2. **缺少依赖**：`package.json` 中可能缺少 `@tanstack/react-query` 依赖

---

## ✅ 解决方案

### 步骤1：检查 node_modules 是否存在

**在 PowerShell 中运行**：

```powershell
Test-Path node_modules
```

如果返回 `False`，说明依赖未安装。

### 步骤2：安装项目依赖

**在 PowerShell 中运行**：

```powershell
cd d:\tcm-bti-assessment
pnpm install
```

这会：
- 读取 `package.json`
- 安装所有依赖到 `node_modules` 目录
- 可能需要几分钟时间

### 步骤3：验证安装

**检查 node_modules 是否存在**：

```powershell
Test-Path node_modules
```

应该返回 `True`。

**检查 @tanstack/react-query 是否存在**：

```powershell
Test-Path node_modules\@tanstack\react-query
```

### 步骤4：重新编译

**安装完成后，重新运行编译**：

```powershell
pnpm dev:weapp
```

---

## 🔍 如果仍然失败

### 检查 package.json 中是否有 @tanstack/react-query

**查看 package.json**：

```powershell
Get-Content package.json | Select-String "@tanstack"
```

如果找不到，需要添加依赖。

### 添加缺失的依赖

**如果 package.json 中缺少 `@tanstack/react-query`**，需要添加：

```powershell
pnpm add @tanstack/react-query
```

或者手动编辑 `package.json`，在 `dependencies` 中添加：

```json
"@tanstack/react-query": "^5.0.0"
```

然后运行：

```powershell
pnpm install
```

---

## 📋 完整操作流程

### 1. 停止当前编译（如果有）

按 `Ctrl+C` 停止当前编译。

### 2. 清理并重新安装依赖

```powershell
# 删除 node_modules（可选，如果安装有问题）
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 删除 lock 文件（可选）
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue

# 重新安装依赖
pnpm install
```

### 3. 验证安装

```powershell
# 检查 node_modules 是否存在
Test-Path node_modules

# 检查 @tanstack/react-query 是否存在
Test-Path node_modules\@tanstack\react-query
```

### 4. 重新编译

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

### Q3: 仍然找不到模块

**解决**：
- 确认 `node_modules` 目录存在
- 确认 `@tanstack/react-query` 在 `package.json` 中
- 尝试删除 `node_modules` 和 `pnpm-lock.yaml`，然后重新安装

---

## 🚀 立即操作

**在当前的 PowerShell 窗口中运行**：

```powershell
# 1. 停止当前编译（按 Ctrl+C，如果还在运行）

# 2. 安装项目依赖
cd d:\tcm-bti-assessment
pnpm install

# 3. 等待安装完成（可能需要几分钟）

# 4. 重新编译
pnpm dev:weapp
```

---

**完成以上步骤后，编译应该可以正常进行了！**
