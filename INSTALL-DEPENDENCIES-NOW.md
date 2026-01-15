# 立即安装依赖

## ✅ 已修复

**已在 `package.json` 中添加缺失的依赖**：
- `@tanstack/react-query`: `^5.0.0`

## 🚀 立即操作

**在 PowerShell 中运行**：

```powershell
# 1. 停止当前编译（按 Ctrl+C，如果还在运行）

# 2. 安装新添加的依赖
cd d:\tcm-bti-assessment
pnpm install

# 3. 等待安装完成（可能需要几分钟）

# 4. 重新编译
pnpm dev:weapp
```

---

## 📋 完整操作步骤

### 步骤1：安装依赖

```powershell
pnpm install
```

这会：
- 读取更新后的 `package.json`
- 安装 `@tanstack/react-query` 和其他缺失的依赖
- 可能需要几分钟时间

### 步骤2：验证安装

**检查 @tanstack/react-query 是否已安装**：

```powershell
Test-Path node_modules\@tanstack\react-query
```

应该返回 `True`。

### 步骤3：重新编译

```powershell
pnpm dev:weapp
```

---

## ⚠️ 如果仍然失败

### 清理并重新安装

如果安装后仍然有问题，可以清理并重新安装：

```powershell
# 删除 node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 删除 lock 文件
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue

# 重新安装
pnpm install

# 重新编译
pnpm dev:weapp
```

---

**请先运行 `pnpm install` 安装依赖，然后告诉我结果！**
