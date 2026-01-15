# Node.js 安装指南（Windows）

## 快速安装步骤

### 1. 下载 Node.js

访问官网：https://nodejs.org/zh-cn/

- 选择 **LTS 版本**（长期支持版，推荐）
- 下载 **Windows Installer (.msi)** 64-bit

### 2. 安装 Node.js

1. 运行下载的 `.msi` 安装文件
2. 点击"下一步"
3. **重要**：勾选 "Automatically install the necessary tools"（自动安装必要工具）
4. 继续点击"下一步"完成安装

### 3. 验证安装

打开 **新的** PowerShell 或 CMD 窗口，运行：

```powershell
node --version
npm --version
```

如果显示版本号，说明安装成功！

### 4. 安装 pnpm

```powershell
npm install -g pnpm
```

### 5. 验证 pnpm

```powershell
pnpm --version
```

### 6. 安装项目依赖

```powershell
cd d:\tcm-bti-assessment
pnpm install
```

### 7. 编译小程序

```powershell
pnpm dev:weapp
```

## 如果安装后还是找不到命令

1. **关闭所有命令行窗口**
2. **重新打开 PowerShell 或 CMD**
3. **检查环境变量**：
   - 右键"此电脑" → "属性"
   - "高级系统设置" → "环境变量"
   - 在"系统变量"中找到 `Path`
   - 确认包含 Node.js 安装路径（通常是 `C:\Program Files\nodejs\`）

## 使用国内镜像加速（可选）

如果下载很慢，可以使用国内镜像：

```powershell
# 设置 npm 镜像
npm config set registry https://registry.npmmirror.com

# 设置 pnpm 镜像
pnpm config set registry https://registry.npmmirror.com
```

## 完成！

安装完成后，您就可以：
- ✅ 运行 `pnpm install` 安装项目依赖
- ✅ 运行 `pnpm dev:weapp` 编译小程序
- ✅ 在微信开发者工具中打开 `dist` 目录
