# 手动上传代码包到云托管

## 📋 概述

如果您不想使用GitHub仓库绑定，可以手动上传代码包到云托管。这种方式适合：
- ✅ 不想将代码推送到GitHub
- ✅ GitHub授权有问题
- ✅ 想直接上传本地代码
- ✅ 需要快速测试部署

---

## 🚀 手动上传步骤

### 步骤1：准备代码包

#### 1.1 构建后端代码

**在项目根目录执行：**

```bash
# 构建后端代码
pnpm build
```

**构建完成后会生成：**
- `dist/` 目录：包含编译后的服务器代码
- `dist/index.js`：服务器入口文件

#### 1.2 准备上传文件

**需要包含的文件和目录：**

```
tcm-bti-assessment/
├── dist/              # 构建后的代码（必需）
│   └── index.js       # 服务器入口
├── server/            # 服务器源代码（如果使用）
├── shared/            # 共享代码（如果使用）
├── package.json       # 项目配置（必需）
├── pnpm-lock.yaml     # 依赖锁定文件（推荐）
└── .env.example       # 环境变量示例（可选）
```

**不需要包含的文件：**
- `node_modules/`（云托管会自动安装）
- `.env`（环境变量在云托管控制台配置）
- `dist/` 中的前端构建文件（小程序相关）
- `.git/`、`.vscode/` 等开发文件

---

### 步骤2：创建压缩包

#### 方式1：使用命令行（推荐）

**在项目根目录执行：**

```bash
# Windows PowerShell
Compress-Archive -Path dist,server,shared,package.json,pnpm-lock.yaml -DestinationPath deploy.zip -Force

# 或者使用 tar（如果安装了 Git Bash）
tar -czf deploy.zip dist server shared package.json pnpm-lock.yaml
```

#### 方式2：使用文件管理器

1. **选择需要上传的文件和目录**：
   - `dist/`
   - `server/`
   - `shared/`
   - `package.json`
   - `pnpm-lock.yaml`

2. **右键点击 → 发送到 → 压缩(zipped)文件夹**
   - 或使用压缩软件（如7-Zip、WinRAR）

3. **重命名压缩包**（可选）：
   - 例如：`tcm-api-deploy.zip`

---

### 步骤3：在云托管中上传

#### 3.1 进入部署页面

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 进入：**云服务** → **云开发** → **云托管**

2. **进入部署发布页面**
   - 选择您的服务（如：`Zhongyiti`）
   - 点击 **"部署发布"** 标签

#### 3.2 选择上传方式

1. **在"选择方式"部分**
   - 如果当前显示"绑定 GitHub 仓库"
   - 查找是否有 **"上传代码包"** 或 **"手动上传"** 选项
   - 点击切换到上传代码包模式

2. **如果没有看到切换选项**
   - 查看页面是否有其他上传入口
   - 或查看"高级设置"中是否有上传选项

#### 3.3 上传代码包

1. **点击"选择文件"或"上传"按钮**
   - 选择您创建的压缩包（如：`deploy.zip`）

2. **等待上传完成**
   - 上传进度会显示在页面上
   - 上传完成后，系统会自动解压

#### 3.4 配置端口

**重要：设置端口为 `3000`**

1. **找到"端口"输入框**
   - 将默认的 `80` 改为 `3000`

2. **确认端口设置**
   - 确保显示为 `3000`

---

### 步骤4：配置环境变量

**如果上传页面有环境变量配置选项：**

1. **展开"高级设置"**（如果有）

2. **添加环境变量**：
   ```env
   WX_APPID=您的微信小程序AppID
   WX_SECRET=您的微信小程序AppSecret
   AI_PROVIDER=deepseek
   AI_API_KEY=您的DeepSeek API密钥
   JWT_SECRET=您的JWT密钥（随机字符串）
   NODE_ENV=production
   PORT=3000
   ```

**注意**：如果上传时无法配置环境变量，可以在部署后到"服务设置"中配置。

---

### 步骤5：发布部署

1. **检查配置**
   - ✅ 代码包已上传
   - ✅ 端口设置为 `3000`
   - ✅ 环境变量已配置（可选）

2. **点击"发布"按钮**
   - 开始部署流程

3. **等待部署完成**
   - 部署过程可能需要几分钟
   - 可以查看部署日志了解进度

---

## 📋 部署后配置

### 配置环境变量（如果部署时未配置）

1. **进入服务管理**
   - 部署完成后，进入服务详情页

2. **找到"环境变量"或"配置"选项**
   - 通常在"服务设置"或"配置"标签中

3. **添加环境变量**
   ```env
   WX_APPID=您的微信小程序AppID
   WX_SECRET=您的微信小程序AppSecret
   AI_PROVIDER=deepseek
   AI_API_KEY=您的DeepSeek API密钥
   JWT_SECRET=您的JWT密钥（随机字符串）
   NODE_ENV=production
   PORT=3000
   ```

4. **保存并重启服务**
   - 保存环境变量后，需要重启服务使配置生效

---

## 🔧 常见问题

### Q1: 找不到"上传代码包"选项怎么办？

**A**: 
1. **检查云托管版本**：
   - 某些版本的云托管可能只支持GitHub绑定
   - 查看是否有其他上传入口

2. **使用CLI工具**：
   - 如果网页不支持，可以使用云托管CLI工具上传
   - 参考云托管CLI文档

3. **联系客服**：
   - 如果确实需要手动上传，联系云开发客服确认是否支持

---

### Q2: 压缩包应该包含哪些文件？

**A**: 
**必需文件**：
- `dist/` 目录（构建后的代码）
- `package.json`（项目配置）

**推荐文件**：
- `pnpm-lock.yaml`（锁定依赖版本）
- `server/`（如果代码需要运行时编译）

**不需要的文件**：
- `node_modules/`（云托管会自动安装）
- `.env`（在控制台配置）
- 前端构建文件（小程序相关）

---

### Q3: 上传后部署失败怎么办？

**A**: 
1. **查看部署日志**：
   - 在部署页面查看详细日志
   - 查找错误信息

2. **检查代码包**：
   - 确认 `dist/index.js` 存在
   - 确认 `package.json` 中的 `start` 脚本正确
   - 确认端口设置正确（3000）

3. **检查环境变量**：
   - 确认必需的环境变量已配置
   - 确认环境变量值正确

---

### Q4: 如何确认代码包正确？

**A**: 
**检查清单**：
- [ ] `dist/index.js` 文件存在
- [ ] `package.json` 存在且包含 `start` 脚本
- [ ] `package.json` 中的 `start` 脚本指向 `dist/index.js`
- [ ] 压缩包大小合理（通常几MB到几十MB，不包含node_modules）

**测试本地运行**：
```bash
# 在项目根目录
pnpm build
pnpm start
# 如果本地可以运行，代码包应该也没问题
```

---

### Q5: 压缩包大小限制是多少？

**A**: 
- 云托管通常支持最大 **100MB** 的代码包
- 如果超过限制：
  - 排除不必要的文件
  - 确认没有包含 `node_modules/`
  - 使用更高效的压缩格式

---

## 📝 快速上传脚本

**创建 `deploy.ps1`（Windows PowerShell）：**

```powershell
# 构建代码
Write-Host "构建代码..." -ForegroundColor Green
pnpm build

# 创建临时目录
$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 复制必需文件
Write-Host "准备文件..." -ForegroundColor Green
Copy-Item -Recurse dist $tempDir
Copy-Item -Recurse server $tempDir
Copy-Item -Recurse shared $tempDir
Copy-Item package.json $tempDir
Copy-Item pnpm-lock.yaml $tempDir

# 创建压缩包
Write-Host "创建压缩包..." -ForegroundColor Green
$zipFile = "deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# 清理临时目录
Remove-Item -Recurse -Force $tempDir

Write-Host "完成！压缩包：$zipFile" -ForegroundColor Green
```

**使用方法**：
```powershell
# 在项目根目录执行
.\deploy.ps1
```

---

## ✅ 完整检查清单

### 准备阶段
- [ ] 已执行 `pnpm build` 构建代码
- [ ] 已确认 `dist/index.js` 存在
- [ ] 已准备压缩包（包含必需文件）
- [ ] 已确认压缩包大小合理（<100MB）

### 上传阶段
- [ ] 已进入云托管部署页面
- [ ] 已切换到"上传代码包"模式（如果可用）
- [ ] 已上传压缩包
- [ ] 已设置端口为 `3000`
- [ ] 已配置环境变量（可选）

### 部署后
- [ ] 部署成功，服务正常运行
- [ ] 环境变量已配置（如果部署时未配置）
- [ ] 服务已重启（如果修改了环境变量）
- [ ] 已获取API地址
- [ ] 已查看运行日志，确认无错误

---

## 🚀 快速开始

### 1. 构建代码
```bash
pnpm build
```

### 2. 创建压缩包
```powershell
# Windows PowerShell
Compress-Archive -Path dist,server,shared,package.json,pnpm-lock.yaml -DestinationPath deploy.zip -Force
```

### 3. 上传到云托管
- 进入云托管部署页面
- 选择"上传代码包"（如果可用）
- 上传 `deploy.zip`
- 设置端口为 `3000`

### 4. 配置环境变量
- 在服务设置中配置环境变量
- 重启服务

### 5. 获取API地址
- 记录服务访问地址
- 用于后续配置

---

## 📞 需要帮助？

如果遇到问题：

1. **找不到上传选项**：检查云托管版本，或使用CLI工具
2. **部署失败**：查看部署日志，检查代码包和配置
3. **服务无法启动**：查看运行日志，检查环境变量和端口
4. **其他问题**：查看云托管文档或联系云开发客服
