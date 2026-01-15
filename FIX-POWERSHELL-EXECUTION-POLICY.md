# 修复 PowerShell 执行策略错误

## ❌ 错误信息

```
pnpm: 无法加载文件 C:\Users\Administrator\AppData\Roaming\npm\pnpm.ps1, 
因为在此系统上禁止运行脚本。
```

## 🔍 问题原因

PowerShell 的执行策略（Execution Policy）阻止了脚本运行。这是 Windows 的安全设置，默认情况下不允许运行未签名的脚本。

---

## ✅ 解决方案

### 方案1：临时更改执行策略（推荐，最简单）

**在当前 PowerShell 窗口中运行**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

**然后运行编译命令**：

```powershell
pnpm dev:weapp
```

**说明**：
- `-Scope Process`：只对当前 PowerShell 会话生效
- 关闭 PowerShell 窗口后，设置会恢复
- 这是最安全的方法，不会影响系统全局设置

---

### 方案2：永久更改执行策略（当前用户）

**在 PowerShell 中运行**（以管理员身份运行 PowerShell）：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**说明**：
- `-Scope CurrentUser`：只对当前用户生效
- 不需要管理员权限
- 永久生效，但只影响当前用户

---

### 方案3：使用 CMD 而不是 PowerShell

**打开 CMD（命令提示符）**，然后运行：

```cmd
cd d:\tcm-bti-assessment
pnpm dev:weapp
```

**说明**：
- CMD 不受 PowerShell 执行策略限制
- 如果 CMD 可以找到 `pnpm`，这是最简单的方案

---

### 方案4：使用 npx 直接运行（如果可用）

**在 PowerShell 中运行**：

```powershell
npx taro build --type weapp --watch
```

**或者使用 npm**：

```powershell
npm run dev:weapp
```

---

## 🎯 推荐操作流程

### 步骤1：临时更改执行策略

**在当前的 PowerShell 窗口中运行**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### 步骤2：验证 pnpm 是否可用

```powershell
pnpm --version
```

如果显示版本号，说明 pnpm 现在可以用了。

### 步骤3：运行编译命令

```powershell
cd d:\tcm-bti-assessment
pnpm dev:weapp
```

---

## 📝 详细说明

### 执行策略选项

- **Restricted**：不允许运行任何脚本（默认）
- **RemoteSigned**：允许运行本地脚本，远程脚本需要签名（推荐）
- **Unrestricted**：允许运行所有脚本（不安全）

### 作用域选项

- **Process**：只对当前 PowerShell 会话生效（最安全）
- **CurrentUser**：只对当前用户生效（推荐）
- **LocalMachine**：对所有用户生效（需要管理员权限）

---

## ⚠️ 常见问题

### Q1: 提示"需要管理员权限"

**解决**：
- 使用 `-Scope CurrentUser` 而不是 `-Scope LocalMachine`
- 或者使用方案1（临时更改，不需要管理员权限）

### Q2: 更改后还是不能运行

**检查**：
- 确认命令拼写正确
- 确认使用的是 PowerShell，不是 CMD
- 尝试关闭并重新打开 PowerShell

### Q3: 想恢复默认设置

**运行**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope Process
```

---

## 🚀 立即操作

**在当前的 PowerShell 窗口中运行**：

```powershell
# 1. 临时更改执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 2. 验证 pnpm 可用
pnpm --version

# 3. 运行编译
cd d:\tcm-bti-assessment
pnpm dev:weapp
```

---

## 💡 提示

- **推荐使用方案1**：临时更改执行策略，最安全
- **如果经常使用**：可以使用方案2，永久更改当前用户的执行策略
- **最简单的方法**：使用 CMD 而不是 PowerShell（方案3）

---

**完成以上步骤后，您就可以正常编译项目了！**
