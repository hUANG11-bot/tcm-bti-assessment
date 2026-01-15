# 运行命令指南

## ⚠️ 重要：必须在项目目录中运行命令

错误提示 `No package.json was found` 说明您不在项目目录中。

## 正确的步骤

### 1. 打开命令行（PowerShell 或 CMD）

### 2. 进入项目目录

```cmd
cd d:\tcm-bti-assessment
```

### 3. 确认在正确的目录

```cmd
dir package.json
```

应该能看到 `package.json` 文件。

### 4. 安装依赖（如果还没安装）

```cmd
pnpm install
```

### 5. 编译小程序

```cmd
pnpm dev:weapp
```

## 完整命令序列

复制以下命令，**一行一行**执行：

```cmd
cd d:\tcm-bti-assessment
```

```cmd
pnpm install
```

```cmd
pnpm dev:weapp
```

## 注意事项

- ❌ **不要**复制代码块标记（```powershell 或 ```cmd）
- ✅ **只复制**命令本身
- ✅ 确保在项目目录 `d:\tcm-bti-assessment` 中运行
- ✅ 每行命令执行完后再执行下一行

## 如果 pnpm 还是找不到

先安装 pnpm：

```cmd
npm install -g pnpm
```

然后再执行上面的步骤。
