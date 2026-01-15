# 如何创建 .env 文件

## 📍 .env 文件位置

`.env` 文件应该放在**项目根目录**，和 `package.json` 在同一级目录。

**完整路径**：`D:\tcm-bti-assessment\.env`

## 🚀 创建方法

### 方法1：使用文本编辑器创建（推荐）

1. **打开项目根目录**
   - 路径：`D:\tcm-bti-assessment`

2. **创建新文件**
   - 右键点击空白处
   - 选择"新建" → "文本文档"
   - 将文件名改为 `.env`（注意：文件名就是 `.env`，没有其他扩展名）

3. **如果Windows提示"如果改变文件扩展名，可能导致文件不可用"**
   - 点击"是"确认

4. **编辑文件内容**
   - 用记事本或其他文本编辑器打开 `.env` 文件
   - 复制以下内容并修改：

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信小程序AppSecret

# AI服务配置（推荐DeepSeek，国内可用）
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek API密钥

# JWT密钥（运行 pnpm generate-jwt 生成）
JWT_SECRET=你的JWT密钥

# API服务器地址（可选，默认 http://localhost:3000）
TARO_APP_API_URL=http://localhost:3000

# 数据库配置（可选）
# DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

5. **保存文件**

### 方法2：使用命令行创建（Windows CMD）

```bash
# 1. 进入项目目录
cd D:\tcm-bti-assessment

# 2. 创建 .env 文件
echo # 微信小程序配置 > .env
echo WX_APPID=wx04a7af67c8f47620 >> .env
echo WX_SECRET=你的微信小程序AppSecret >> .env
echo. >> .env
echo # AI服务配置 >> .env
echo BUILT_IN_FORGE_API_URL=https://forge.manus.im >> .env
echo BUILT_IN_FORGE_API_KEY=你的Forge API密钥 >> .env
```

然后使用文本编辑器打开 `.env` 文件，补充完整内容。

### 方法3：复制示例文件

我已经创建了 `.env.example` 文件作为模板：

1. 在项目根目录找到 `.env.example` 文件
2. 复制这个文件
3. 重命名为 `.env`
4. 打开 `.env` 文件，修改其中的配置值

## 📝 配置说明

### 必须配置的项（根据功能需要）

#### 1. 微信登录功能
```env
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret
```

#### 2. AI对话功能
```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的API密钥
```

#### 3. 数据库功能
```env
DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

### 可选配置

```env
JWT_SECRET=随机字符串（用于加密）
TARO_APP_API_URL=http://localhost:3000（开发环境默认值）
NODE_ENV=development
```

## ⚠️ 重要提示

1. **文件位置**：必须在项目根目录（和 `package.json` 同级）
2. **文件名**：必须是 `.env`（注意前面有点）
3. **不要提交**：`.env` 文件已经在 `.gitignore` 中，不会被提交到代码仓库
4. **敏感信息**：不要将 `.env` 文件分享给他人

## 🔍 如何确认文件创建成功

1. **查看文件**
   - 在项目根目录应该能看到 `.env` 文件
   - 如果看不到，可能是被隐藏了，需要在文件资源管理器中显示隐藏文件

2. **检查内容**
   - 用文本编辑器打开，确认内容正确

3. **测试配置**
   - 启动后端服务：`pnpm dev`
   - 查看控制台，确认没有配置错误提示

## 💡 快速创建模板

我已经创建了 `.env.example` 文件，您可以：

1. 复制 `.env.example` 文件
2. 重命名为 `.env`
3. 修改其中的配置值

## 📍 文件路径示例

```
D:\tcm-bti-assessment\          ← 项目根目录
├── package.json
├── .env                         ← 在这里创建！
├── .env.example                 ← 模板文件（已创建）
├── src\
├── server\
└── ...
```

## 🎯 最小配置（仅测试AI功能）

如果只想测试AI对话功能，最少需要配置：

```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的API密钥
```

其他配置可以暂时不填。
