# 修复 npm 执行策略错误

## ✅ 好消息

Node.js 已成功安装！`node --version` 显示 `v24.13.0`。

## ❌ 当前问题

`npm --version` 报错：
```
npm: 无法加载文件 C:\Program Files\nodejs\npm.ps1, 
因为在此系统上禁止运行脚本。
```

## 🔍 问题原因

这是新的 PowerShell 窗口，之前设置的执行策略（`-Scope Process`）已经失效。需要重新设置执行策略。

---

## ✅ 解决方案

### 方案1：临时更改执行策略（当前会话）

**在当前 PowerShell 窗口中运行**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

**然后验证 npm**：

```powershell
npm --version
```

**说明**：
- 只对当前 PowerShell 会话生效
- 关闭窗口后需要重新设置

---

### 方案2：永久更改执行策略（推荐）

**在 PowerShell 中运行**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**然后验证 npm**：

```powershell
npm --version
```

**说明**：
- 只对当前用户生效
- 不需要管理员权限
- 永久生效，以后不需要再设置

---

## 🎯 推荐操作流程

### 步骤1：永久更改执行策略（推荐）

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

输入 `Y` 确认。

### 步骤2：验证 npm

```powershell
npm --version
```

应该显示版本号（例如：`10.9.2`）。

### 步骤3：安装 pnpm

```powershell
npm install -g pnpm
```

### 步骤4：验证 pnpm

```powershell
pnpm --version
```

### 步骤5：安装项目依赖并编译

```powershell
cd d:\tcm-bti-assessment
pnpm install
pnpm dev:weapp
```

---

## 📝 为什么需要设置执行策略？

PowerShell 默认不允许运行未签名的脚本，这是 Windows 的安全设置。`npm.ps1` 和 `pnpm.ps1` 都是 PowerShell 脚本，需要更改执行策略才能运行。

---

## ⚠️ 常见问题

### Q1: 提示"需要管理员权限"

**解决**：
- 使用 `-Scope CurrentUser` 而不是 `-Scope LocalMachine`
- `CurrentUser` 不需要管理员权限

### Q2: 设置后还是不能运行

**检查**：
- 确认命令拼写正确
- 确认使用的是 PowerShell，不是 CMD
- 尝试关闭并重新打开 PowerShell

### Q3: 想恢复默认设置

**运行**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser
```

---

## 🚀 立即操作

**在当前的 PowerShell 窗口中运行**：

```powershell
# 1. 永久更改执行策略（推荐）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. 验证 npm
npm --version

# 3. 安装 pnpm
npm install -g pnpm

# 4. 验证 pnpm
pnpm --version

# 5. 安装项目依赖
cd d:\tcm-bti-assessment
pnpm install

# 6. 编译小程序
pnpm dev:weapp
```

---

## 💡 提示

- **推荐使用方案2**：永久更改执行策略，以后不需要再设置
- **如果只是临时使用**：可以使用方案1，只对当前会话生效
- **最简单的方法**：使用 CMD 而不是 PowerShell（不受执行策略限制）

---

**完成以上步骤后，您就可以正常使用 npm 和 pnpm 了！**
