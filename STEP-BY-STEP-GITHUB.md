# 逐步设置 GitHub Actions

## ✅ 步骤1：初始化 Git 仓库（如果还没有）

在 Cursor 的终端中运行：

```powershell
cd d:\tcm-bti-assessment
git init
```

---

## ✅ 步骤2：提交文件

### 方法1：使用 Cursor 界面（推荐）

1. **打开源代码管理**：
   - 点击左侧的源代码管理图标（或按 `Ctrl+Shift+G`）
   - 您会看到所有未跟踪的文件

2. **暂存文件**：
   - 点击 **"+"** 按钮（暂存所有更改）
   - 或选择以下重要文件：
     - `.github/workflows/docker-build.yml`
     - `Dockerfile`
     - `package.json`
     - `dist/index.js`
     - `server/` 目录
     - `shared/` 目录

3. **提交**：
   - 在消息框中输入：`Add Docker build workflow`
   - 点击 **"✓"** 按钮（提交）

### 方法2：使用命令行

在 Cursor 的终端中运行：

```powershell
cd d:\tcm-bti-assessment
git add .
git commit -m "Add Docker build workflow"
```

---

## ✅ 步骤3：创建 GitHub 仓库

1. **访问 GitHub**：https://github.com
2. **登录您的账号**
3. **创建新仓库**：
   - 点击右上角 **"+"** → **"New repository"**
   - **仓库名称**：`tcm-bti-assessment`（或您喜欢的名称）
   - **描述**（可选）：`TCM BTI Assessment Backend`
   - **选择 Public**（免费使用 GitHub Actions）
   - **不要**勾选以下选项：
     - ❌ "Add a README file"
     - ❌ "Add .gitignore"
     - ❌ "Choose a license"
   - 点击 **"Create repository"**

---

## ✅ 步骤4：连接本地仓库到 GitHub

### 方法1：使用 Cursor 界面

1. **在源代码管理面板**：
   - 点击 **"..."** 菜单（三个点）
   - 选择 **"Remote"** → **"Add Remote"**
   - **远程名称**：`origin`
   - **远程 URL**：`https://github.com/YOUR_USERNAME/tcm-bti-assessment.git`
     （替换 `YOUR_USERNAME` 为您的 GitHub 用户名）

2. **推送代码**：
   - 点击 **"..."** 菜单
   - 选择 **"Push"** → **"Push to..."**
   - 选择 `origin` 和 `main` 分支
   - 如果提示，选择 **"Publish Branch"**

### 方法2：使用命令行

在 Cursor 的终端中运行：

```powershell
cd d:\tcm-bti-assessment

# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/tcm-bti-assessment.git

# 重命名分支为 main（如果需要）
git branch -M main

# 推送代码
git push -u origin main
```

**注意**：首次推送可能需要登录 GitHub。

---

## ✅ 步骤5：触发 GitHub Actions

### 方法1：自动触发（推荐）

**推送代码后，GitHub Actions 会自动运行**。

### 方法2：手动触发

1. **在浏览器中打开您的 GitHub 仓库**
2. **点击 "Actions" 标签**
3. **选择 "Docker Build Test" 工作流**
4. **点击 "Run workflow" 按钮**
5. **选择分支**（通常是 `main`）
6. **点击 "Run workflow"**

---

## ✅ 步骤6：查看构建日志

1. **在 GitHub 仓库页面**
2. **点击 "Actions" 标签**
3. **点击最新的工作流运行**（显示为黄色或红色圆点）
4. **点击 "build" 任务**
5. **展开构建步骤**，查看完整日志

**您会看到**：
- ✅ `npm install` 的完整输出
- ✅ 任何错误信息
- ✅ 失败发生的具体步骤

---

## 📝 需要的信息

**如果构建失败，请复制以下信息给我**：

1. **完整的构建日志**（从 GitHub Actions 复制）
2. **特别是 `npm install` 部分的输出**
3. **任何错误信息**（`ERROR`、`FAILED`、`npm ERR!`）

**我可以根据具体错误修复 Dockerfile**。

---

## ✅ 已准备的文件

我已经为您创建了：

1. ✅ **`.github/workflows/docker-build.yml`** - GitHub Actions 工作流文件
2. ✅ **`Dockerfile`** - 优化的 Dockerfile（使用国内镜像源）
3. ✅ **`Dockerfile.minimal`** - 最简化的版本（备用）

**这些文件已经准备好，只需要推送到 GitHub 即可！**

---

## 🚀 现在开始

**请按照上述步骤操作**，然后告诉我：

1. **是否成功推送到 GitHub？**
2. **GitHub Actions 是否运行？**
3. **构建结果如何？**（成功或失败）
4. **如果失败，请提供构建日志**

有了具体的错误信息，我可以快速修复问题！
