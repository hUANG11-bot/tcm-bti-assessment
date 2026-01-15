# 修复 Taro CLI 问题

## 问题：pnpm dev:weapp 没找到

### 解决方案

#### 方法1：确保依赖已安装（推荐）

```bash
# 1. 安装所有依赖
pnpm install

# 2. 然后运行编译命令
pnpm dev:weapp
```

#### 方法2：使用 pnpm exec

如果直接运行 `taro` 命令找不到，可以使用：

```bash
# 开发模式
pnpm exec taro build --type weapp --watch

# 生产模式
pnpm exec taro build --type weapp
```

#### 方法3：使用 npx

```bash
# 开发模式
npx taro build --type weapp --watch

# 生产模式
npx taro build --type weapp
```

#### 方法4：检查 Taro CLI 是否安装

```bash
# 检查 Taro CLI
pnpm list @tarojs/cli

# 如果没有安装，手动安装
pnpm add -D @tarojs/cli
```

## 完整安装步骤

1. **确保 Node.js 版本正确**（建议 16+）：
   ```bash
   node -v
   ```

2. **安装所有依赖**：
   ```bash
   pnpm install
   ```

3. **验证 Taro CLI 安装**：
   ```bash
   pnpm exec taro --version
   ```
   应该显示版本号，例如：`3.6.0`

4. **运行编译**：
   ```bash
   pnpm dev:weapp
   ```

## 如果仍然失败

### 检查 package.json

确保 `package.json` 中有以下内容：

```json
{
  "scripts": {
    "dev:weapp": "taro build --type weapp --watch",
    "build:weapp": "taro build --type weapp"
  },
  "devDependencies": {
    "@tarojs/cli": "^3.6.0",
    "@tarojs/plugin-platform-weapp": "^3.6.0",
    "@tarojs/plugin-framework-react": "^3.6.0",
    "@tarojs/webpack5-runner": "^3.6.0",
    "@tarojs/taro-loader": "^3.6.0"
  }
}
```

### 重新安装依赖

如果问题持续，尝试：

```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install

# 再次尝试
pnpm dev:weapp
```

## Windows PowerShell 用户

如果使用 PowerShell，可能需要使用不同的语法：

```powershell
# 使用 pnpm exec
pnpm exec taro build --type weapp --watch

# 或者先进入项目目录
cd d:\tcm-bti-assessment
pnpm dev:weapp
```
