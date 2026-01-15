# 通过 Cursor 设置 GitHub Actions

## ✅ 好消息

您已经在 Cursor 上安装了 GitHub，可以直接使用！

---

## 🚀 快速步骤（通过 Cursor）

### 步骤1：在 Cursor 中初始化 Git（如果还没有）

1. **打开 Cursor**
2. **打开项目**：`d:\tcm-bti-assessment`
3. **查看源代码管理**：
   - 点击左侧的源代码管理图标（或按 `Ctrl+Shift+G`）
   - 如果显示"Initialize Repository"，点击它

### 步骤2：提交文件

1. **在源代码管理面板**：
   - 您会看到所有未跟踪的文件
   - 点击 **"+"** 按钮（暂存所有更改）
   - 或选择特定文件暂存

2. **提交更改**：
   - 在消息框中输入：`Add Docker build workflow`
   - 点击 **"✓"** 按钮（提交）

### 步骤3：创建 GitHub 仓库

1. **访问 GitHub**：https://github.com
2. **创建新仓库**：
   - 点击右上角 **"+"** → **"New repository"**
   - 仓库名称：`tcm-bti-assessment`（或您喜欢的名称）
   - 选择 **Public**（免费使用 GitHub Actions）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 **"Create repository"**

### 步骤4：在 Cursor 中连接 GitHub

1. **在 Cursor 的源代码管理面板**：
   - 点击 **"..."** 菜单（三个点）
   - 选择 **"Remote"** → **"Add Remote"**
   - 输入远程名称：`origin`
   - 输入远程 URL：`https://github.com/YOUR_USERNAME/tcm-bti-assessment.git`
     （替换 `YOUR_USERNAME` 为您的 GitHub 用户名）

2. **推送代码**：
   - 点击 **"..."** 菜单
   - 选择 **"Push"** → **"Push to..."**
   - 选择 `origin` 和 `main` 分支
   - 如果提示，选择 **"Publish Branch"**

### 步骤5：触发 GitHub Actions

**方法1：自动触发**
- 推送代码后，GitHub Actions 会自动运行

**方法2：手动触发**
1. 在浏览器中打开您的 GitHub 仓库
2. 点击 **"Actions"** 标签
3. 选择 **"Docker Build Test"** 工作流
4. 点击 **"Run workflow"** 按钮
5. 选择分支（通常是 `main`）
6. 点击 **"Run workflow"**

### 步骤6：查看构建日志

1. 在 GitHub 仓库页面
2. 点击 **"Actions"** 标签
3. 点击最新的工作流运行（显示为黄色或红色圆点）
4. 点击 **"build"** 任务
5. **展开构建步骤**，查看完整日志

**您会看到**：
- ✅ `npm install` 的完整输出
- ✅ 任何错误信息
- ✅ 失败发生的具体步骤

---

## 📝 已准备的文件

我已经为您创建了：

1. ✅ **`.github/workflows/docker-build.yml`** - GitHub Actions 工作流文件
2. ✅ **`Dockerfile`** - 优化的 Dockerfile（使用国内镜像源）
3. ✅ **`Dockerfile.minimal`** - 最简化的版本（备用）

**这些文件已经准备好，只需要推送到 GitHub 即可！**

---

## 🔍 如果构建失败

**请复制以下信息给我**：

1. **完整的构建日志**（从 GitHub Actions 复制）
2. **特别是 `npm install` 部分的输出**
3. **任何错误信息**（`ERROR`、`FAILED`、`npm ERR!`）

**我可以根据具体错误修复 Dockerfile**。

---

## ✅ 优势

**使用 GitHub Actions 的优势**：

1. ✅ **完全免费**（公开仓库）
2. ✅ **可以看到完整日志**
3. ✅ **不需要本地 Docker**
4. ✅ **Linux 环境**（与云托管相同）
5. ✅ **可以反复测试**

---

## 🚀 下一步

1. **在 Cursor 中提交文件**
2. **创建 GitHub 仓库**
3. **连接并推送代码**
4. **触发 GitHub Actions**
5. **查看构建日志**
6. **告诉我结果**

有了具体的错误信息，我可以快速修复问题！

---

## 💡 提示

**如果 Cursor 的 Git 功能有问题**，也可以：

1. **使用 GitHub Desktop**（图形界面）
2. **使用 GitHub 网页上传文件**
3. **使用其他 Git 客户端**

**最重要的是**：将 `.github/workflows/docker-build.yml` 和 `Dockerfile` 上传到 GitHub，然后触发 Actions。
