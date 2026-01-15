# Git 命令（可直接执行）

## ✅ 步骤1：初始化 Git 仓库

在 Cursor 的终端中运行（一行一行执行）：

```powershell
cd d:\tcm-bti-assessment
git init
```

---

## ✅ 步骤2：配置 Git（首次使用需要）

```powershell
git config --global user.name "您的名字"
git config --global user.email "您的邮箱"
```

---

## ✅ 步骤3：添加文件

```powershell
git add .
```

或者只添加重要文件：

```powershell
git add .github/workflows/docker-build.yml
git add Dockerfile
git add package.json
git add dist/index.js
git add server/
git add shared/
```

---

## ✅ 步骤4：提交文件

```powershell
git commit -m "Add Docker build workflow"
```

---

## ✅ 步骤5：创建 GitHub 仓库

1. 访问：https://github.com
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`tcm-bti-assessment`
4. 选择 **Public**
5. **不要**勾选任何初始化选项
6. 点击 "Create repository"

---

## ✅ 步骤6：连接 GitHub 并推送

**替换 `YOUR_USERNAME` 为您的 GitHub 用户名**：

```powershell
git remote add origin https://github.com/YOUR_USERNAME/tcm-bti-assessment.git
git branch -M main
git push -u origin main
```

**注意**：首次推送可能需要登录 GitHub。

---

## ✅ 步骤7：查看 GitHub Actions

1. 在浏览器中打开您的 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看构建结果

---

## 💡 如果遇到问题

### 问题1：git 命令找不到

**解决**：
1. 重启 Cursor（让 Git 路径生效）
2. 或使用 Cursor 的源代码管理界面（图形界面）

### 问题2：推送需要认证

**解决**：
1. GitHub 会提示登录
2. 或使用 Personal Access Token

### 问题3：想使用图形界面

**使用 Cursor 的源代码管理界面**：
1. 按 `Ctrl+Shift+G` 打开源代码管理
2. 点击 "+" 暂存文件
3. 输入提交消息
4. 点击 "✓" 提交
5. 点击 "..." → "Push" 推送

---

## 🚀 快速命令（复制粘贴）

**一次性执行所有步骤**（替换 YOUR_USERNAME）：

```powershell
cd d:\tcm-bti-assessment
git init
git add .
git commit -m "Add Docker build workflow"
git remote add origin https://github.com/YOUR_USERNAME/tcm-bti-assessment.git
git branch -M main
git push -u origin main
```

**注意**：需要先创建 GitHub 仓库，然后替换 YOUR_USERNAME。
