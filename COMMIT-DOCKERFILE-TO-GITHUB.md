# 如何提交 Dockerfile 到 GitHub

## 🚀 方法1：使用 Cursor 的源代码管理界面（推荐）

### 步骤1：打开源代码管理

1. **按 `Ctrl+Shift+G`**（或点击左侧的源代码管理图标）
2. **会显示所有更改的文件**

---

### 步骤2：暂存文件

1. **找到 `Dockerfile`**（应该显示为已修改）
2. **点击 `Dockerfile` 旁边的 "+" 按钮**（暂存更改）
   - 或点击 "Changes" 旁边的 "+" 按钮（暂存所有更改）

---

### 步骤3：提交

1. **在消息框中输入提交消息**：
   ```
   Fix: Remove --production flag to install all dependencies including express
   ```
   或中文：
   ```
   修复：移除 --production 标志，确保安装所有依赖包括 express
   ```

2. **点击 "✓" 按钮**（提交）

---

### 步骤4：推送到 GitHub

1. **点击 "..." 菜单**（在源代码管理面板顶部）
2. **选择 "Push"** → **"Push to..."**
3. **选择 `origin` 和 `main` 分支**
4. **等待推送完成**

---

## 🚀 方法2：使用 GitHub 网页直接编辑（最简单）

### 步骤1：打开 GitHub 仓库

1. **访问**：https://github.com/HUANG11-bot/tcm-bti-assessment
2. **导航到 `Dockerfile`**：
   - 点击仓库中的 `Dockerfile` 文件
   - 或直接访问：https://github.com/HUANG11-bot/tcm-bti-assessment/blob/main/Dockerfile

---

### 步骤2：编辑文件

1. **点击右上角的 "✏️ Edit" 按钮**（编辑文件）
2. **找到这一行**：
   ```dockerfile
   RUN npm install --production --legacy-peer-deps --timeout=600000 || \
   ```
3. **修改为**：
   ```dockerfile
   RUN npm install --legacy-peer-deps --timeout=600000 || \
   ```
   （移除 `--production` 标志）

4. **继续修改其他行**（如果有）：
   ```dockerfile
   npm install --production --no-optional --legacy-peer-deps --timeout=600000 || \
   npm install --production --timeout=600000 || \
   ```
   改为：
   ```dockerfile
   npm install --no-optional --legacy-peer-deps --timeout=600000 || \
   npm install --timeout=600000 || \
   ```

---

### 步骤3：提交更改

1. **滚动到页面底部**
2. **在 "Commit changes" 部分**：
   - **提交消息**：`Fix: Remove --production flag to install all dependencies`
   - **描述**（可选）：`确保 express 等运行时依赖被正确安装`
3. **选择 "Commit directly to the `main` branch"**
4. **点击绿色的 "Commit changes" 按钮**

---

### 步骤4：等待自动部署

**由于您使用 GitHub 仓库部署**：
- 提交后，微信云托管可能会自动触发重新部署
- 或需要手动在微信云托管控制台点击"重新部署"

---

## 🚀 方法3：使用 Git 命令行

### 步骤1：打开终端

1. **在 Cursor 中**，按 `` Ctrl+` ``（打开终端）
2. **或点击 "Terminal" → "New Terminal"**

---

### 步骤2：检查状态

```powershell
cd d:\tcm-bti-assessment
git status
```

**应该显示 `Dockerfile` 已修改**。

---

### 步骤3：暂存文件

```powershell
git add Dockerfile
```

---

### 步骤4：提交

```powershell
git commit -m "Fix: Remove --production flag to install all dependencies including express"
```

---

### 步骤5：推送

```powershell
git push origin main
```

---

## ✅ 推荐方法

**最简单的方法**：**方法2（GitHub 网页直接编辑）**

**优点**：
- ✅ 不需要 Git 命令
- ✅ 不需要配置
- ✅ 直接在浏览器中完成
- ✅ 可以立即看到结果

---

## 📋 完整的 Dockerfile 内容（供参考）

**修改后的完整 Dockerfile**：

```dockerfile
FROM node:20

WORKDIR /app

# 使用国内 npm 镜像源（解决网络问题）
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json ./

# 安装依赖（不使用 --production，确保所有运行时依赖都被安装）
# 注意：express 等包可能不在 dependencies 中，需要安装所有依赖
RUN npm install --legacy-peer-deps --timeout=600000 || \
    npm install --no-optional --legacy-peer-deps --timeout=600000 || \
    npm install --timeout=600000 || \
    (echo "ERROR: All npm install attempts failed" && exit 1)

# 复制应用代码
COPY dist ./dist
COPY server ./server
COPY shared ./shared

# 验证文件存在
RUN test -f dist/index.js || (echo "ERROR: dist/index.js not found!" && exit 1)

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
```

**关键修改**：
- 移除了所有 `npm install` 命令中的 `--production` 标志
- 确保安装所有依赖（包括 devDependencies）

---

## 🚀 现在开始

**推荐使用方法2（GitHub 网页直接编辑）**：

1. **访问**：https://github.com/HUANG11-bot/tcm-bti-assessment/blob/main/Dockerfile
2. **点击 "Edit" 按钮**
3. **移除所有 `--production` 标志**
4. **提交更改**
5. **等待自动部署或手动触发重新部署**

**完成后告诉我结果！**
