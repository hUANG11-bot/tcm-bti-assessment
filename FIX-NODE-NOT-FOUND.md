# 修复 "node" 不是内部或外部命令错误

## 🚨 问题确认

错误信息：
```
"node"不是内部或外部命令,也不是可运行的程序 或批处理文件。
```

这说明 Node.js 没有添加到系统的 PATH 环境变量中，或者 CMD 无法找到 `node` 命令。

---

## 🔍 问题原因

可能的原因：
1. **Node.js 已安装，但没有添加到 PATH**
2. **Node.js 安装在非标准位置**
3. **CMD 和 PowerShell 的环境变量不同**

---

## 🚀 解决方案

### 方案1：在 PowerShell 中运行（推荐，最简单）

**如果 PowerShell 可以找到 `node`**，可以：

1. **打开 PowerShell**（不是 CMD）
2. **临时更改执行策略**：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```
3. **切换到项目目录**：
   ```powershell
   cd d:\tcm-bti-assessment
   ```
4. **运行编译命令**：
   ```powershell
   pnpm build:weapp
   ```

---

### 方案2：找到 Node.js 安装路径并添加到 PATH

#### 步骤1：找到 Node.js 安装路径

**在 PowerShell 中运行**：

```powershell
where.exe node
```

**或者**：

```powershell
Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
```

**常见安装路径**：
- `C:\Program Files\nodejs\node.exe`
- `C:\Program Files (x86)\nodejs\node.exe`
- `C:\Users\你的用户名\AppData\Roaming\npm\node.exe`

---

#### 步骤2：临时添加到 PATH（当前 CMD 会话）

**在 CMD 中运行**（假设 Node.js 安装在 `C:\Program Files\nodejs`）：

```cmd
set PATH=%PATH%;C:\Program Files\nodejs
```

**然后运行编译命令**：

```cmd
pnpm build:weapp
```

---

#### 步骤3：永久添加到 PATH（系统环境变量）

1. **按 `Win + R`**
2. **输入 `sysdm.cpl` 并按回车**
3. **点击"高级"标签**
4. **点击"环境变量"按钮**
5. **在"系统变量"中找到 `Path`**
6. **点击"编辑"**
7. **点击"新建"**
8. **添加 Node.js 安装路径**（例如：`C:\Program Files\nodejs`）
9. **点击"确定"保存所有更改**
10. **重新打开 CMD**

---

### 方案3：使用完整路径运行

**如果知道 Node.js 的安装路径**，可以直接使用完整路径：

**在 CMD 中运行**（假设 Node.js 在 `C:\Program Files\nodejs`）：

```cmd
cd d:\tcm-bti-assessment
"C:\Program Files\nodejs\npm.cmd" run build:weapp
```

**或者使用 pnpm 的完整路径**（如果知道）：

```cmd
cd d:\tcm-bti-assessment
"C:\Users\Administrator\AppData\Roaming\npm\pnpm.cmd" build:weapp
```

---

### 方案4：使用 nvm-windows（如果安装了）

**如果使用 nvm-windows 管理 Node.js**：

```cmd
nvm use 20
cd d:\tcm-bti-assessment
pnpm build:weapp
```

---

## 📝 推荐操作步骤

### 步骤1：检查 PowerShell 是否可以找到 node

**在 PowerShell 中运行**：

```powershell
node --version
```

**如果显示版本号**（例如：`v20.19.6`），说明 PowerShell 可以找到 node。

**然后**：
1. **临时更改执行策略**：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```
2. **切换到项目目录**：
   ```powershell
   cd d:\tcm-bti-assessment
   ```
3. **运行编译命令**：
   ```powershell
   pnpm build:weapp
   ```

---

### 步骤2：如果 PowerShell 也找不到 node

**找到 Node.js 安装路径**：

**在 PowerShell 中运行**：

```powershell
where.exe node
```

**或者检查常见路径**：

```powershell
Test-Path "C:\Program Files\nodejs\node.exe"
Test-Path "C:\Program Files (x86)\nodejs\node.exe"
```

---

### 步骤3：临时添加到 PATH（快速解决）

**在 CMD 中运行**（根据实际路径修改）：

```cmd
set PATH=%PATH%;C:\Program Files\nodejs
cd d:\tcm-bti-assessment
pnpm build:weapp
```

---

## 🔍 验证 Node.js 是否可用

**在 CMD 中运行**：

```cmd
node --version
```

**如果显示版本号**，说明 node 可用。

---

## 💡 提示

- **推荐使用 PowerShell**：如果 PowerShell 可以找到 node，这是最简单的方案
- **临时添加到 PATH**：如果只是临时使用，可以用 `set PATH` 命令
- **永久添加到 PATH**：如果需要长期使用，建议永久添加到系统环境变量

---

## 🎯 现在请

1. **在 PowerShell 中检查 node 是否可用**：
   ```powershell
   node --version
   ```

2. **如果可用**：
   - 临时更改执行策略：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`
   - 切换到项目目录：`cd d:\tcm-bti-assessment`
   - 运行编译：`pnpm build:weapp`

3. **如果不可用**：
   - 找到 Node.js 安装路径：`where.exe node`（在 PowerShell 中）
   - 在 CMD 中临时添加到 PATH：`set PATH=%PATH%;你的Node.js路径`
   - 然后运行编译：`pnpm build:weapp`

---

**请先检查 PowerShell 是否可以找到 node，然后告诉我结果！**
