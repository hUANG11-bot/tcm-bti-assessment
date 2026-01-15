# 修复 AI 服务错误

## ✅ API 地址问题已解决

从错误信息看，小程序已经能连接到后端了，但 AI 服务配置有问题。

错误提示：
```
AI服务暂时不可用
可能原因:
1. 账户余额不足
2. API密钥配置错误
```

---

## 🔍 问题原因

AI 服务需要以下环境变量配置：
- `AI_API_KEY`：AI API 密钥（必需）
- `AI_PROVIDER`：AI 服务提供商（可选，默认 deepseek）
- `AI_API_URL`：AI API 地址（可选）

---

## 🚀 解决方案

### 步骤1：获取 AI API 密钥

#### 选项1：DeepSeek（推荐，国内可用）

1. **访问**：https://platform.deepseek.com
2. **注册账号**（使用邮箱）
3. **登录后，进入"API Keys"页面**
4. **创建新的 API 密钥**
5. **复制密钥**（格式类似：`sk-xxxxxxxxxxxxx`）

**优点**：
- ✅ 国内可访问
- ✅ 有免费额度
- ✅ 价格便宜
- ✅ OpenAI 兼容

---

#### 选项2：通义千问（阿里云）

1. **访问**：https://www.aliyun.com
2. **注册并实名认证**
3. **进入控制台** → **人工智能** → **通义千问**
4. **开通服务并获取 API 密钥**

---

#### 选项3：OpenAI（如果能访问）

1. **访问**：https://platform.openai.com
2. **注册账号**
3. **获取 API 密钥**

---

### 步骤2：在微信云托管中配置环境变量

1. **登录微信云托管控制台**
2. **进入服务管理** → **服务列表**
3. **点击您的服务名称**
4. **点击"服务设置"标签**
5. **找到"环境变量"部分**
6. **添加以下环境变量**：

#### 如果使用 DeepSeek（推荐）：

```
AI_PROVIDER=deepseek
AI_API_KEY=sk-你的DeepSeek密钥
```

#### 如果使用通义千问：

```
AI_PROVIDER=qwen
AI_API_KEY=你的通义千问密钥
AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

#### 如果使用 OpenAI：

```
AI_PROVIDER=openai
AI_API_KEY=你的OpenAI密钥
AI_API_URL=https://api.openai.com/v1/chat/completions
```

---

### 步骤3：重新部署服务

1. **保存环境变量**
2. **在服务设置页面，点击"发布"按钮**
3. **等待部署完成**

---

### 步骤4：验证配置

1. **查看服务运行日志**
2. **在小程序中测试 AI 功能**
3. **如果还有问题，查看后端日志**

---

## 🔍 诊断方法

### 方法1：查看后端日志

1. **在微信云托管控制台**
2. **进入服务详情** → **运行日志**
3. **查看是否有 AI 相关的错误信息**

---

### 方法2：运行诊断命令（本地）

如果您在本地有项目代码，可以运行：

```bash
pnpm test-ai-chat
```

这会测试 AI 服务配置是否正确。

---

## 📋 完整的环境变量清单

确保以下环境变量都已配置：

### 必需的环境变量：

```
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret
JWT_SECRET=你的JWT密钥（至少32个字符）
DATABASE_URL=mysql://user:password@host:port/database
AI_API_KEY=你的AI API密钥
```

### 可选的环境变量：

```
AI_PROVIDER=deepseek（默认值，可选：qwen, openai）
AI_API_URL=（可选，DeepSeek不需要）
PORT=3000（默认值）
NODE_ENV=production（默认值）
```

---

## 💡 推荐配置

**对于国内用户，推荐使用 DeepSeek**：

```
AI_PROVIDER=deepseek
AI_API_KEY=sk-你的DeepSeek密钥
```

**优点**：
- ✅ 国内可访问
- ✅ 有免费额度
- ✅ 价格便宜
- ✅ 无需配置 AI_API_URL

---

## ⚠️ 常见问题

### Q1: 如何获取 DeepSeek API 密钥？

1. 访问：https://platform.deepseek.com
2. 注册并登录
3. 进入"API Keys"页面
4. 创建新密钥并复制

---

### Q2: 账户余额不足怎么办？

1. **DeepSeek**：登录后台充值
2. **通义千问**：在阿里云控制台充值
3. **OpenAI**：在 OpenAI 后台充值

---

### Q3: API 密钥配置错误怎么办？

1. **检查密钥格式**：
   - DeepSeek：`sk-` 开头
   - 通义千问：通常是数字和字母组合
   - OpenAI：`sk-` 开头

2. **检查环境变量名称**：
   - 必须是 `AI_API_KEY`（大写）
   - 不能有空格或特殊字符

3. **检查是否已保存**：
   - 确保在云托管控制台中已保存环境变量
   - 确保已重新部署服务

---

## 🎯 现在请

1. **获取 AI API 密钥**（推荐使用 DeepSeek）

2. **在微信云托管控制台中配置环境变量**：
   - `AI_PROVIDER=deepseek`
   - `AI_API_KEY=你的密钥`

3. **重新部署服务**

4. **测试 AI 功能**

5. **如果还有问题**：
   - 查看后端运行日志
   - 告诉我具体的错误信息

---

## 💡 提示

- **推荐使用 DeepSeek**：国内可用，有免费额度
- **检查环境变量**：确保在云托管控制台中已正确配置
- **重新部署**：修改环境变量后必须重新部署服务
- **查看日志**：如果还有问题，查看后端运行日志

**请按照上述步骤配置 AI 服务，然后告诉我结果！**
