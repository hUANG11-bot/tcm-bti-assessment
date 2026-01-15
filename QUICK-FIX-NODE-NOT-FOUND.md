# 快速修复：找不到 node 命令

## ❌ 错误信息

```
"node"不是内部或外部命令,也不是可运行的程序或批处理文件。
```

## 🔍 问题原因

Node.js 没有安装，或者没有添加到系统的 PATH 环境变量中。

---

## ✅ 解决方案

### 方案1：安装 Node.js（如果未安装）

#### 步骤1：下载 Node.js

1. 访问：https://nodejs.org/zh-cn/
2. 下载 **LTS 版本**（推荐 18.x 或 20.x）
3. 选择 **Windows Installer (.msi)** 64-bit

#### 步骤2：安装 Node.js

1. 运行下载的 `.msi` 文件
2. 按照安装向导完成安装
3. **重要**：确保勾选 "Add to PATH" 选项

#### 步骤3：验证安装

**关闭当前 CMD 窗口，重新打开新的 CMD 窗口**，然后运行：

```cmd
node --version
npm --version
```

如果显示版本号（例如：`v20.19.6`），说明安装成功！

#### 步骤4：安装 pnpm

```cmd
npm install -g pnpm
```

#### 步骤5：验证 pnpm

```cmd
pnpm --version
```

#### 步骤6：安装项目依赖并编译

```cmd
cd d:\tcm-bti-assessment
pnpm install
pnpm dev:weapp
```

---

### 方案2：如果 Node.js 已安装但找不到命令

#### 步骤1：找到 Node.js 安装路径

**在 PowerShell 中运行**（不是 CMD）：

```powershell
where.exe node
```

**常见安装路径**：
- `C:\Program Files\nodejs\node.exe`
- `C:\Program Files (x86)\nodejs\node.exe`

#### 步骤2：临时添加到 PATH（当前 CMD 会话）

**在 CMD 中运行**（根据实际路径修改）：

```cmd
set PATH=%PATH%;C:\Program Files\nodejs
cd d:\tcm-bti-assessment
pnpm dev:weapp
```

#### 步骤3：永久添加到 PATH（推荐）

1. **按 `Win + R`**
2. **输入 `sysdm.cpl` 并按回车**
3. **点击"高级"标签**
4. **点击"环境变量"按钮**
5. **在"系统变量"中找到 `Path`**
6. **点击"编辑"**
7. **点击"新建"**
8. **添加 Node.js 安装路径**（例如：`C:\Program Files\nodejs`）
9. **点击"确定"保存所有更改**
10. **关闭并重新打开 CMD**

---

### 方案3：使用 PowerShell（如果 PowerShell 可以找到 node）

**在 PowerShell 中运行**：

```powershell
# 临时更改执行策略（如果需要）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 切换到项目目录
cd d:\tcm-bti-assessment

# 运行编译
pnpm dev:weapp
```

---

## 🎯 快速检查

### 检查1：Node.js 是否已安装

**在 PowerShell 中运行**：

```powershell
node --version
```

- **如果显示版本号**：Node.js 已安装，但 CMD 找不到（使用方案2或方案3）
- **如果显示错误**：Node.js 未安装（使用方案1）

### 检查2：找到 Node.js 安装路径

**在 PowerShell 中运行**：

```powershell
where.exe node
```

这会显示 Node.js 的完整路径。

---

## 📝 推荐操作流程

### 如果 Node.js 未安装：

1. 下载并安装 Node.js（方案1）
2. 安装 pnpm：`npm install -g pnpm`
3. 安装项目依赖：`pnpm install`
4. 编译项目：`pnpm dev:weapp`

### 如果 Node.js 已安装但 CMD 找不到：

1. 在 PowerShell 中检查：`node --version`
2. 如果 PowerShell 可以找到，使用 PowerShell 运行命令（方案3）
3. 如果 PowerShell 也找不到，找到安装路径并添加到 PATH（方案2）

---

## ⚠️ 重要提示

1. **安装 Node.js 后必须重新打开 CMD**：环境变量更改需要新窗口才能生效
2. **推荐使用 LTS 版本**：更稳定，兼容性更好
3. **确保勾选 "Add to PATH"**：安装时一定要勾选这个选项

---

## 🚀 完成后的下一步

安装并配置好 Node.js 后：

1. **安装项目依赖**：
   ```cmd
   cd d:\tcm-bti-assessment
   pnpm install
   ```

2. **编译小程序**：
   ```cmd
   pnpm dev:weapp
   ```

3. **在微信开发者工具中打开 `dist` 目录**

---

**请先检查 Node.js 是否已安装，然后告诉我结果，我会帮您选择最合适的解决方案！**
