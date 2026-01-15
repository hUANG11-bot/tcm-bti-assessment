# 修复 localhost:3000 连接错误

## 🚨 问题确认

从错误信息看，小程序仍在使用：
```
http://localhost:3000
```

这说明配置还没有生效，需要重新编译小程序。

---

## 🔍 问题原因

可能的原因：
1. **使用了开发模式编译**（`dev:weapp`），会使用 `localhost:3000`
2. **虽然修改了配置，但还没有重新编译**
3. **小程序缓存了旧的配置**

---

## 🚀 解决方案

### 方案1：使用生产模式编译（推荐）

**在项目目录中运行**：

```bash
pnpm build:weapp
```

**这个命令会**：
- 设置 `NODE_ENV=production`
- 使用云托管地址：`https://tci-184647-5-1377481866.sh.run.tcloudbase.com`

---

### 方案2：直接设置环境变量编译

**在项目目录中运行**（Windows PowerShell）：

```powershell
$env:TARO_APP_API_URL="https://tci-184647-5-1377481866.sh.run.tcloudbase.com"; pnpm build:weapp
```

**或**（Windows CMD）：

```cmd
set TARO_APP_API_URL=https://tci-184647-5-1377481866.sh.run.tcloudbase.com && pnpm build:weapp
```

---

### 方案3：修改配置让开发模式也使用云托管地址

如果您想在开发模式下也测试云托管，可以修改 `config/index.js`：

**当前配置**（第 27 行）：
```javascript
(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://tci-184647-5-1377481866.sh.run.tcloudbase.com')
```

**修改为**（开发模式也使用云托管）：
```javascript
'https://tci-184647-5-1377481866.sh.run.tcloudbase.com'
```

这样无论开发还是生产环境，都使用云托管地址。

---

## 📝 操作步骤

### 步骤1：停止当前的编译（如果正在运行）

1. **在终端中按 `Ctrl+C`** 停止当前编译
2. **或关闭微信开发者工具中的编译**

---

### 步骤2：重新编译小程序

**推荐使用生产模式**：

```bash
pnpm build:weapp
```

**或者直接设置环境变量**：

```powershell
$env:TARO_APP_API_URL="https://tci-184647-5-1377481866.sh.run.tcloudbase.com"; pnpm build:weapp
```

---

### 步骤3：在微信开发者工具中重新加载

1. **打开微信开发者工具**
2. **如果项目已打开，点击"编译"按钮**
3. **或关闭并重新打开项目**

---

### 步骤4：清除缓存（重要）

1. **在微信开发者工具中**
2. **点击"编译"按钮旁边的下拉箭头**
3. **选择"清除缓存"**
4. **重新编译**

---

## 🔍 验证配置是否生效

### 方法1：查看控制台日志

1. **在微信开发者工具中**
2. **打开"调试器"**
3. **切换到"Console"标签**
4. **查看日志**，应该看到：
   ```
   [tRPC] API Base URL: https://tci-184647-5-1377481866.sh.run.tcloudbase.com
   ```

如果还是显示 `http://localhost:3000`，说明配置还没生效。

---

### 方法2：检查编译后的代码

1. **打开 `dist` 目录**
2. **搜索 `localhost`**
3. **如果找到 `localhost:3000`，说明配置没生效**
4. **如果找到云托管地址，说明配置已生效**

---

## ⚠️ 重要提示

### 不要使用 `dev:weapp` 命令

**`dev:weapp` 命令**：
- 使用 `NODE_ENV=development`
- 会使用 `http://localhost:3000`
- 适合本地开发（后端也在本地运行）

**`build:weapp` 命令**：
- 使用 `NODE_ENV=production`
- 会使用云托管地址
- 适合测试和发布

---

## 🎯 现在请

1. **停止当前编译**（如果正在运行）

2. **使用生产模式重新编译**：
   ```bash
   pnpm build:weapp
   ```

3. **在微信开发者工具中**：
   - 清除缓存
   - 重新编译
   - 重新加载小程序

4. **验证配置**：
   - 查看控制台日志
   - 确认 API 地址是云托管地址

5. **测试连接**：
   - 尝试使用 AI 功能
   - 查看是否能正常连接

---

## 💡 提示

- **必须重新编译**：修改配置后必须重新编译才能生效
- **清除缓存**：有时需要清除缓存才能看到新配置
- **使用生产模式**：`build:weapp` 会使用云托管地址

**请重新编译小程序，然后告诉我结果！**
