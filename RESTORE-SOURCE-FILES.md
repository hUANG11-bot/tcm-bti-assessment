# 恢复源代码文件

## ❌ 当前问题

`src` 目录和 `config` 目录已被删除，导致无法编译。

## 🔍 检查 Git 仓库

**在 PowerShell 中运行**：

```powershell
# 检查 Git 状态
git status

# 查看最近的提交
git log --oneline -5

# 恢复所有被删除的文件
git checkout HEAD -- src/ config/
```

---

## ✅ 解决方案

### 方案1：从 Git 恢复（如果有 Git 仓库）

**在 PowerShell 中运行**：

```powershell
cd d:\tcm-bti-assessment

# 恢复所有被删除的文件
git checkout HEAD -- src/
git checkout HEAD -- config/

# 如果还有未提交的更改，使用强制恢复
git checkout HEAD -- src/ config/ --force
```

### 方案2：清理 dist 并重新编译

**如果文件已恢复**：

```powershell
# 清理 dist 目录
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 重新编译
pnpm dev:weapp
```

### 方案3：如果 Git 仓库不存在

**需要**：
1. 从备份恢复文件
2. 或重新创建项目结构

---

## 🚀 立即操作

**在 PowerShell 中运行**：

```powershell
# 1. 检查 Git 状态
git status

# 2. 如果 Git 仓库存在，恢复文件
git checkout HEAD -- src/ config/

# 3. 清理 dist 目录
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 4. 重新编译
pnpm dev:weapp
```

---

**请先运行 `git status` 检查 Git 仓库状态，然后告诉我结果！**
