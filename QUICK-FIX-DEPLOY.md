# 快速修复部署失败

## 🚨 当前问题

**部署失败原因**：压缩包中缺少 `dist/index.js`（后端服务器入口文件）

---

## ✅ 快速修复步骤

### 步骤1：构建后端代码（必须）

```powershell
# 在项目根目录执行
pnpm build
```

**等待构建完成**，应该看到类似输出：
```
✓ built in XXXms
```

### 步骤2：验证文件存在

```powershell
# 检查 dist/index.js 是否存在
dir dist\index.js
```

**应该显示文件信息**，如果显示"找不到文件"，说明构建失败。

### 步骤3：使用脚本创建压缩包（推荐）

```powershell
# 使用更新后的脚本（会自动验证文件存在）
.\create-deploy.ps1
```

**脚本会自动**：
- ✅ 验证 `dist/index.js` 存在
- ✅ 只复制后端需要的文件
- ✅ 排除小程序前端文件
- ✅ 创建正确的压缩包

### 步骤4：重新部署

1. 上传新的 `deploy.zip`
2. 确认端口设置为 `3000`
3. 点击发布

---

## 🔍 如果构建失败

### 检查1：确认 Node.js 版本

```powershell
node --version
# 应该是 v18 或 v20
```

### 检查2：安装依赖

```powershell
pnpm install
```

### 检查3：查看构建错误

```powershell
pnpm build
# 查看完整的错误信息
```

---

## 📋 正确的文件结构

**构建后，`dist/` 目录应该包含**：
- ✅ `dist/index.js`（后端入口，必需）

**压缩包应该包含**：
- ✅ `dist/index.js`
- ✅ `Dockerfile`
- ✅ `package.json`
- ✅ `pnpm-lock.yaml`
- ✅ `server/` 目录
- ✅ `shared/` 目录

**不需要包含**：
- ❌ `dist/pages/`（小程序页面）
- ❌ `dist/app.js`（小程序入口）

---

## 🚀 一键修复命令

**复制以下命令到 PowerShell 执行**：

```powershell
# 1. 构建后端
Write-Host "构建后端代码..." -ForegroundColor Green
pnpm build

# 2. 验证文件存在
if (-not (Test-Path "dist\index.js")) {
    Write-Host "❌ 构建失败：dist/index.js 不存在" -ForegroundColor Red
    Write-Host "请检查构建错误信息" -ForegroundColor Yellow
    exit 1
}

# 3. 创建压缩包
Write-Host "创建部署压缩包..." -ForegroundColor Green
$tempDir = "deploy-temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 创建 dist 目录并复制 index.js
New-Item -ItemType Directory -Path "$tempDir\dist" | Out-Null
Copy-Item "dist\index.js" "$tempDir\dist\"

# 复制其他文件
Copy-Item -Recurse server $tempDir\
Copy-Item -Recurse shared $tempDir\
Copy-Item package.json $tempDir\
Copy-Item pnpm-lock.yaml $tempDir\
Copy-Item Dockerfile $tempDir\

# 创建压缩包
Compress-Archive -Path "$tempDir\*" -DestinationPath deploy.zip -Force

# 清理
Remove-Item -Recurse -Force $tempDir

Write-Host "✅ 完成！压缩包：deploy.zip" -ForegroundColor Green
```

---

## ❓ 常见问题

### Q: `pnpm build` 失败怎么办？

**A**: 
1. 检查 Node.js 版本：`node --version`
2. 重新安装依赖：`pnpm install`
3. 查看具体错误信息

### Q: `dist/index.js` 不存在？

**A**: 
- 说明构建没有成功
- 检查 `pnpm build` 的输出
- 确认没有错误信息

### Q: 压缩包仍然缺少文件？

**A**: 
- 使用脚本 `.\create-deploy.ps1`（已更新，会自动验证）
- 或使用上面的一键修复命令

---

## 📞 需要帮助？

如果问题仍然存在，请提供：
1. `pnpm build` 的完整输出
2. `dir dist\index.js` 的结果
3. 压缩包解压后的文件列表
