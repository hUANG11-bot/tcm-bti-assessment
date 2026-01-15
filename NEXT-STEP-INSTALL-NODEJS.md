# 下一步：安装 Node.js

## ✅ 已解决的问题

PowerShell 执行策略问题已经解决！您已经成功运行了：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

## ❌ 当前问题

现在出现新错误：
```
无法将"node.exe"项识别为 cmdlet、函数、脚本文件或可运行程序的名称。
```

这说明：**Node.js 还没有安装，或者没有正确添加到 PATH 环境变量中**。

---

## 🚀 立即操作：安装 Node.js

### 步骤1：下载 Node.js

1. **访问官网**：https://nodejs.org/zh-cn/
2. **下载 LTS 版本**（推荐 20.x 或 18.x）
3. **选择 Windows Installer (.msi)** 64-bit

### 步骤2：安装 Node.js

1. **运行下载的 `.msi` 文件**
2. **按照安装向导完成安装**
3. **重要**：确保勾选 **"Add to PATH"** 选项
4. **完成安装**

### 步骤3：验证安装

**关闭当前 PowerShell 窗口，重新打开新的 PowerShell 窗口**，然后运行：

```powershell
node --version
npm --version
```

如果显示版本号（例如：`v20.19.6`），说明安装成功！

### 步骤4：安装 pnpm

```powershell
npm install -g pnpm
```

### 步骤5：验证 pnpm

```powershell
pnpm --version
```

### 步骤6：安装项目依赖并编译

```powershell
cd d:\tcm-bti-assessment
pnpm install
pnpm dev:weapp
```

---

## ⚠️ 重要提示

1. **安装后必须重新打开 PowerShell**：
   - 环境变量更改需要新窗口才能生效
   - 关闭当前 PowerShell，重新打开新的

2. **确保勾选 "Add to PATH"**：
   - 安装时一定要勾选这个选项
   - 这样系统才能找到 `node.exe`

3. **推荐使用 LTS 版本**：
   - 更稳定，兼容性更好
   - 推荐 20.x 或 18.x

---

## 📋 完整操作流程

### 1. 安装 Node.js
- 下载：https://nodejs.org/zh-cn/
- 安装：运行 `.msi` 文件，勾选 "Add to PATH"
- 验证：关闭并重新打开 PowerShell，运行 `node --version`

### 2. 安装 pnpm
```powershell
npm install -g pnpm
```

### 3. 安装项目依赖
```powershell
cd d:\tcm-bti-assessment
pnpm install
```

### 4. 编译小程序
```powershell
pnpm dev:weapp
```

---

## 🎯 当前状态

- ✅ PowerShell 执行策略已解决
- ❌ Node.js 未安装（需要立即安装）

---

## 💡 提示

安装 Node.js 后，所有问题都会解决：
- `node.exe` 可以找到
- `pnpm` 可以正常运行
- 项目可以正常编译

---

**请先安装 Node.js，安装完成后告诉我，我会继续协助您完成后续步骤！**
