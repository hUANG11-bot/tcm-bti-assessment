# 国内AI服务配置指南

## 🎯 支持的AI服务

由于无法访问 forge.manus.im，我已经为您添加了国内可用的AI服务支持：

1. **DeepSeek**（推荐，国内可用，OpenAI兼容）
2. **通义千问**（阿里云）
3. **OpenAI**（如果能访问）
4. **自定义API**（支持任何OpenAI兼容的API）

## 🚀 快速开始（推荐：DeepSeek）

### 步骤1：注册DeepSeek账号

1. 访问：https://platform.deepseek.com
2. 使用邮箱注册账号
3. 登录后，进入"API Keys"页面
4. 创建新的API密钥
5. 复制密钥（类似：`sk-xxxxxxxxxxxxx`）

### 步骤2：配置环境变量

在 `.env` 文件中添加：

```env
# AI服务配置（使用DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek API密钥
```

### 步骤3：重启服务

```bash
pnpm dev
```

## 📋 其他AI服务配置

### 选项1：通义千问（阿里云）

1. **注册阿里云账号**
   - 访问：https://www.aliyun.com
   - 注册并实名认证

2. **开通通义千问服务**
   - 进入：控制台 → 人工智能 → 通义千问
   - 开通服务并获取API密钥

3. **配置环境变量**
   ```env
   AI_PROVIDER=qwen
   AI_API_KEY=你的通义千问API密钥
   ```

### 选项2：OpenAI（如果能访问）

1. **注册OpenAI账号**
   - 访问：https://platform.openai.com
   - 注册并获取API密钥

2. **配置环境变量**
   ```env
   AI_PROVIDER=openai
   AI_API_KEY=你的OpenAI API密钥
   AI_API_URL=https://api.openai.com/v1/chat/completions
   ```

### 选项3：自定义API（支持任何OpenAI兼容的API）

```env
AI_PROVIDER=custom
AI_API_KEY=你的API密钥
AI_API_URL=https://你的API地址/v1/chat/completions
```

## 💰 费用说明

### DeepSeek
- 有免费额度
- 价格相对便宜
- 国内访问速度快

### 通义千问
- 按使用量付费
- 价格适中
- 需要阿里云账号

### OpenAI
- 按使用量付费
- 价格较高
- 需要能访问国外网站

## 📝 完整的 .env 配置示例

```env
# AI服务配置（推荐DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=sk-你的DeepSeek密钥

# 或者使用通义千问
# AI_PROVIDER=qwen
# AI_API_KEY=你的通义千问密钥

# 或者使用OpenAI
# AI_PROVIDER=openai
# AI_API_KEY=你的OpenAI密钥
# AI_API_URL=https://api.openai.com/v1/chat/completions

# 其他配置...
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret
JWT_SECRET=你的JWT密钥
```

## 🔧 如何切换AI服务

只需修改 `.env` 文件中的 `AI_PROVIDER` 和 `AI_API_KEY`：

```env
# 切换到DeepSeek
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek密钥

# 切换到通义千问
AI_PROVIDER=qwen
AI_API_KEY=你的通义千问密钥
```

然后重启服务即可。

## ⚠️ 注意事项

1. **API密钥安全**：不要泄露API密钥
2. **费用控制**：在服务商后台设置使用量限制
3. **网络访问**：确保服务器能访问AI服务API地址

## 🎉 推荐配置

**对于国内用户，推荐使用DeepSeek**：
- ✅ 国内可访问
- ✅ 有免费额度
- ✅ 价格便宜
- ✅ OpenAI兼容，无需修改代码

配置示例：
```env
AI_PROVIDER=deepseek
AI_API_KEY=sk-你的DeepSeek密钥
```
