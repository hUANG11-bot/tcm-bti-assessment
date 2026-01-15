# 安装指南

## 问题：pnpm install 没找到

这说明系统中没有安装 Node.js 或 pnpm。请按照以下步骤安装：

## 步骤1：安装 Node.js

### Windows 用户

1. **下载 Node.js**：
   - 访问：https://nodejs.org/
   - 下载 LTS 版本（推荐 18.x 或 20.x）
   - 选择 Windows Installer (.msi) 64-bit

2. **安装 Node.js**：
   - 运行下载的 .msi 文件
   - 按照安装向导完成安装
   - **重要**：确保勾选 "Add to PATH" 选项

3. **验证安装**：
   打开新的命令行窗口（PowerShell 或 CMD），运行：
   ```bash
   node --version
   npm --version
   ```
   应该显示版本号，例如：
   ```
   v18.17.0
   9.6.7
   ```

## 步骤2：安装 pnpm

安装 Node.js 后，使用 npm 安装 pnpm：

```bash
# 使用 npm 安装 pnpm（全局安装）
npm install -g pnpm

# 验证安装
pnpm --version
```

应该显示版本号，例如：`8.15.0`

## 步骤3：安装项目依赖

安装完 pnpm 后，在项目目录中运行：

```bash
# 进入项目目录
cd d:\tcm-bti-assessment

# 安装依赖
pnpm install
```

## 步骤4：编译小程序项目

```bash
# 开发模式
pnpm dev:weapp

# 或使用
pnpm exec taro build --type weapp --watch
```

## 替代方案：使用 npm

如果不想安装 pnpm，也可以使用 npm：

```bash
# 安装依赖
npm install

# 编译小程序（需要修改 package.json 中的脚本）
npm run dev:weapp
```

但需要注意，项目配置了 `packageManager` 字段，推荐使用 pnpm。

## 快速检查清单

- [ ] Node.js 已安装（运行 `node --version`）
- [ ] npm 已安装（运行 `npm --version`）
- [ ] pnpm 已安装（运行 `pnpm --version`）
- [ ] 项目依赖已安装（运行 `pnpm install`）
- [ ] 可以编译项目（运行 `pnpm dev:weapp`）

## 常见问题

### Q: 安装 Node.js 后还是找不到命令
**A:** 
- 关闭并重新打开命令行窗口
- 检查环境变量 PATH 中是否包含 Node.js 安装路径
- 可能需要重启电脑

### Q: pnpm 安装失败
**A:**
- 确保 npm 可以正常使用
- 尝试使用管理员权限运行命令行
- 或使用：`npm install -g pnpm@latest`

### Q: 安装依赖很慢
**A:**
- 使用国内镜像源：
  ```bash
  pnpm config set registry https://registry.npmmirror.com
  ```

## 安装完成后

1. **验证安装**：
   ```bash
   node --version
   npm --version
   pnpm --version
   ```

2. **安装项目依赖**：
   ```bash
   cd d:\tcm-bti-assessment
   pnpm install
   ```

3. **编译小程序**：
   ```bash
   pnpm dev:weapp
   ```

4. **在微信开发者工具中打开 `dist` 目录**
