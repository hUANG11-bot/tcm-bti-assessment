# 解决 Git 命令找不到的问题

## 🚨 当前问题

**错误**：`无法将"git"项识别为 cmdlet、函数、脚本文件或可运行程序的名称`

这是因为 PowerShell 还没有识别到 Git 的路径。

---

## ✅ 解决方案

### 方案1：重启 Cursor（最简单）

1. **完全关闭 Cursor**
2. **重新打开 Cursor**
3. **重新打开终端**
4. **再次尝试 `git --version`**

这通常可以让 Git 路径生效。

---

### 方案2：使用 Cursor 的源代码管理界面（推荐）

**不需要命令行，使用图形界面**：

1. **打开源代码管理**：
   - 按 `Ctrl+Shift+G`
   - 或点击左侧的源代码管理图标

2. **初始化仓库**：
   - 如果显示 "Initialize Repository"，点击它
   - 如果没有显示，说明已经初始化了

3. **暂存文件**：
   - 点击 **"+"** 按钮（暂存所有更改）

4. **提交**：
   - 在消息框中输入：`Add Docker build workflow`
   - 点击 **"✓"** 按钮（提交）

5. **连接 GitHub**：
   - 点击 **"..."** 菜单
   - 选择 **"Remote"** → **"Add Remote"**
   - 远程名称：`origin`
   - 远程 URL：`https://github.com/YOUR_USERNAME/tcm-bti-assessment.git`
     （替换 `YOUR_USERNAME` 为您的 GitHub 用户名）

6. **推送**：
   - 点击 **"..."** 菜单
   - 选择 **"Push"** → **"Push to..."**
   - 选择 `origin` 和 `main` 分支

**这是最简单的方法，不需要命令行！**

---

### 方案3：手动刷新环境变量

在 PowerShell 中运行：

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git --version
```

---

### 方案4：检查 Git 安装路径

1. **找到 Git 安装位置**（通常在）：
   - `C:\Program Files\Git\cmd\`
   - 或 `C:\Program Files (x86)\Git\cmd\`

2. **手动添加到 PATH**：
   - 右键"此电脑" → "属性" → "高级系统设置" → "环境变量"
   - 在"系统变量"中找到 `Path`
   - 添加 Git 的路径（如 `C:\Program Files\Git\cmd\`）
   - 重启 Cursor

---

## 🚀 推荐操作

**最简单的方法**：使用 Cursor 的源代码管理界面（方案2）

1. 按 `Ctrl+Shift+G` 打开源代码管理
2. 点击 "Initialize Repository"（如果需要）
3. 点击 "+" 暂存所有文件
4. 输入提交消息并提交
5. 添加远程仓库并推送

**不需要命令行，全部在图形界面完成！**

---

## ✅ 下一步

**使用图形界面完成以下步骤**：

1. ✅ 初始化仓库
2. ✅ 提交文件
3. ✅ 创建 GitHub 仓库（在浏览器中）
4. ✅ 连接并推送代码
5. ✅ 查看 GitHub Actions 结果

**完成后告诉我结果！**
