# 如何创建 deploy.zip

## 📍 deploy.zip 的位置

**`deploy.zip` 需要您自己创建**，创建后会出现在项目根目录：
```
d:\tcm-bti-assessment\deploy.zip
```

---

## 🚀 快速创建方法

### 方法1：使用 PowerShell 命令（推荐）

**在项目根目录打开 PowerShell，执行：**

```powershell
# 1. 先构建代码
pnpm build

# 2. 创建压缩包（包含 Dockerfile）
Compress-Archive -Path dist,server,shared,package.json,pnpm-lock.yaml,Dockerfile -DestinationPath deploy.zip -Force
```

**完成后，`deploy.zip` 会出现在项目根目录。**

---

### 方法2：使用脚本

**在项目根目录执行：**

```powershell
.\create-deploy.ps1
```

**如果提示"无法执行脚本"，先执行：**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后再执行脚本。

---

### 方法3：手动创建（最简单）

1. **先构建代码**：
   ```bash
   pnpm build
   ```

2. **在文件管理器中**：
   - 进入项目目录：`d:\tcm-bti-assessment`
   - 选择以下文件和文件夹：
     - `dist` 文件夹
     - `server` 文件夹
     - `shared` 文件夹
     - `package.json` 文件
     - `pnpm-lock.yaml` 文件
     - `Dockerfile` 文件（**必需**）

3. **右键点击选中的文件** → **发送到** → **压缩(zipped)文件夹**

4. **重命名为** `deploy.zip`

5. **完成！** `deploy.zip` 现在在项目根目录。

---

## ✅ 验证压缩包

创建后，确认压缩包包含：

- ✅ `dist/index.js`（服务器入口文件）
- ✅ `package.json`（项目配置）
- ✅ `server/`（服务器源代码）
- ✅ `shared/`（共享代码）
- ✅ `pnpm-lock.yaml`（依赖锁定文件）
- ✅ `Dockerfile`（**必需**，云托管需要）

**不要包含**：
- ❌ `node_modules/`（云托管会自动安装）
- ❌ `.env`（环境变量在控制台配置）

---

## 📍 压缩包位置

创建成功后，`deploy.zip` 位于：

```
d:\tcm-bti-assessment\deploy.zip
```

---

## 🚀 下一步

1. **上传到云托管**：
   - 登录微信公众平台
   - 进入：**云服务** → **云开发** → **云托管** → **部署发布**
   - 上传 `deploy.zip`
   - 设置端口为 `3000`
   - 点击发布

2. **配置环境变量**：
   - 在服务设置中配置环境变量
   - 重启服务

---

## ❓ 常见问题

### Q: 找不到 deploy.zip？

**A**: 
- `deploy.zip` 需要您自己创建，不会自动生成
- 按照上面的方法创建后，会在项目根目录找到

### Q: 压缩包应该多大？

**A**: 
- 通常几MB到几十MB
- 如果超过100MB，可能包含了 `node_modules/`，需要排除

### Q: 构建失败怎么办？

**A**: 
- 先执行 `pnpm install` 安装依赖
- 检查是否有错误信息
- 确认 Node.js 版本正确
