# 快速设置 GitHub Actions

## ✅ 好消息

您已经在 Cursor 上安装了 GitHub，可以直接使用 GitHub Actions 测试 Dockerfile！

---

## 🚀 快速步骤

### 步骤1：检查 Git 仓库状态

我已经检查了您的 Git 仓库状态。如果还没有初始化，可以：

```powershell
cd d:\tcm-bti-assessment
git init
git add .
git commit -m "Initial commit"
```

### 步骤2：创建 GitHub 仓库

1. **访问 GitHub**：https://github.com
2. **创建新仓库**：
   - 点击右上角 "+" → "New repository"
   - 仓库名称：`tcm-bti-assessment`（或您喜欢的名称）
   - 选择 **Public**（免费使用 GitHub Actions）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

### 步骤3：连接本地仓库到 GitHub

**如果还没有连接远程仓库**：

```powershell
cd d:\tcm-bti-assessment

# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/tcm-bti-assessment.git

# 推送代码
git branch -M main
git push -u origin main
```

**如果已经连接了远程仓库**：

```powershell
# 确保所有文件都已提交
git add .
git commit -m "Add Docker build workflow"
git push
```

### 步骤4：触发 GitHub Actions

**方法1：自动触发（推送代码后）**
- 推送代码后，GitHub Actions 会自动运行

**方法2：手动触发**
1. 在 GitHub 仓库页面
2. 点击 **"Actions"** 标签
3. 选择 **"Docker Build Test"** 工作流
4. 点击 **"Run workflow"** 按钮
5. 选择分支（通常是 `main`）
6. 点击 **"Run workflow"**

### 步骤5：查看构建日志

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

1. **创建 GitHub 仓库**（如果还没有）
2. **推送代码到 GitHub**
3. **触发 GitHub Actions**
4. **查看构建日志**
5. **告诉我结果**

有了具体的错误信息，我可以快速修复问题！
