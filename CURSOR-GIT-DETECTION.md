# 解决 Cursor 检测不到 Git 的问题

## 🚨 当前情况

Cursor 的源代码管理面板显示需要下载 Git for Windows，但您已经安装了 Git。

---

## ✅ 解决方案

### 方案1：点击 "Download Git for Windows"（推荐）

**即使您已经安装了 Git，也可以点击这个按钮**：

1. **点击蓝色的 "Download Git for Windows" 按钮**
2. **如果检测到已安装的 Git**：
   - 可能会提示重新安装或修复
   - 或者会检测到现有安装并配置路径

3. **安装完成后**：
   - 点击提示中的 **"Reload"**（重新加载）
   - 或关闭并重新打开 Cursor

---

### 方案2：重启 Cursor

1. **完全关闭 Cursor**（确保所有窗口都关闭）
2. **重新打开 Cursor**
3. **重新打开项目**：`d:\tcm-bti-assessment`
4. **再次打开源代码管理**（`Ctrl+Shift+G`）

这通常可以让 Cursor 检测到已安装的 Git。

---

### 方案3：使用 GitHub 网页上传文件（最简单）

**如果 Git 配置有问题，可以直接在 GitHub 网页上传文件**：

#### 步骤1：准备文件

需要上传的关键文件：
- `.github/workflows/docker-build.yml`
- `Dockerfile`
- `package.json`
- `dist/index.js`
- `server/` 目录（所有文件）
- `shared/` 目录（所有文件）

#### 步骤2：在 GitHub 网页上传

1. **打开您的仓库**：https://github.com/hUANG11-bot/tcm-bti-assessment
2. **点击 "Add file" → "Upload files"**
3. **拖拽或选择文件上传**：
   - 先创建 `.github/workflows/` 目录
   - 上传 `docker-build.yml` 到 `.github/workflows/`
   - 上传 `Dockerfile` 到根目录
   - 上传其他文件

4. **提交**：
   - 在页面底部输入提交消息：`Add Docker build workflow`
   - 点击 **"Commit changes"**

#### 步骤3：触发 GitHub Actions

1. **点击 "Actions" 标签**
2. **选择 "Docker Build Test" 工作流**
3. **点击 "Run workflow"**

---

### 方案4：手动配置 Git 路径

1. **找到 Git 安装位置**（通常在）：
   - `C:\Program Files\Git\cmd\`
   - 或 `C:\Program Files (x86)\Git\cmd\`

2. **在 Cursor 中配置**：
   - 打开设置（`Ctrl+,`）
   - 搜索 `git.path`
   - 输入 Git 的完整路径（如 `C:\Program Files\Git\cmd\git.exe`）

---

## 🚀 推荐操作顺序

### 优先级1：点击 "Download Git for Windows"

**即使已安装，也可以点击**，可能会：
- 检测到现有安装
- 修复路径配置
- 或重新安装并正确配置

### 优先级2：使用 GitHub 网页上传

**如果 Git 配置有问题，这是最简单的方法**：
- 不需要 Git 命令
- 直接在网页上传文件
- 可以立即触发 GitHub Actions

### 优先级3：重启 Cursor

**如果方案1不行，尝试重启 Cursor**。

---

## ✅ 已准备的文件

我已经为您创建了：

1. ✅ **`.github/workflows/docker-build.yml`** - GitHub Actions 工作流文件
2. ✅ **`Dockerfile`** - 优化的 Dockerfile（使用国内镜像源）
3. ✅ **`Dockerfile.minimal`** - 最简化的版本（备用）

**这些文件已经准备好，只需要上传到 GitHub 即可！**

---

## 📝 下一步

**建议操作**：

1. **先点击 "Download Git for Windows" 按钮**（即使已安装）
2. **如果不行，使用 GitHub 网页上传文件**（最简单）
3. **上传后触发 GitHub Actions**
4. **查看构建日志**

**完成后告诉我结果！**
