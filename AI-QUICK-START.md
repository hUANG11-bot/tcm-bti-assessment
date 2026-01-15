# AI中医对话 - 5分钟快速开始

## 🎯 功能说明

在测评结果页面，用户可以看到"AI中医咨询"按钮，点击后可以与AI中医进行实时对话。

## ✅ 功能已实现

- ✅ AI对话页面已创建
- ✅ 结果页面已添加入口按钮
- ✅ 后端接口已配置
- ✅ 支持国内AI服务（DeepSeek、通义千问等）

## 🚀 只需3步即可使用

### 步骤1：获取API密钥（2分钟）

#### 方法1：使用DeepSeek（推荐，国内可用）⭐

1. 访问：https://platform.deepseek.com
2. 点击"注册"或"Sign Up"
3. 使用邮箱注册账号
4. 登录后，在控制台找到"API Keys"
5. 点击"Create API Key"
6. 复制API密钥（类似：`sk-xxxxxxxxxxxxx`）

**详细步骤**：查看 [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md)

#### 方法2：使用通义千问（阿里云）

1. 访问：https://www.aliyun.com
2. 注册并实名认证
3. 开通通义千问服务
4. 获取API密钥

#### 方法3：使用OpenAI（如果能访问）

1. 访问：https://platform.openai.com
2. 注册账号（需要国外邮箱或手机号）
3. 在"API Keys"页面创建新密钥
4. 复制API密钥

### 步骤2：配置密钥（1分钟）

在项目根目录的 `.env` 文件中添加：

#### 如果使用DeepSeek（推荐）：
```env
AI_PROVIDER=deepseek
AI_API_KEY=你刚才复制的DeepSeek API密钥
```

#### 如果使用通义千问：
```env
AI_PROVIDER=qwen
AI_API_KEY=你的通义千问API密钥
```

#### 如果使用OpenAI：
```env
AI_PROVIDER=openai
AI_API_KEY=你的OpenAI API密钥
AI_API_URL=https://api.openai.com/v1/chat/completions
```

**示例**：
```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sk-1234567890abcdefghijklmnop
```

### 步骤3：重启服务（1分钟）

```bash
# 1. 停止当前服务（如果正在运行）
# 按 Ctrl+C

# 2. 重新启动后端服务
pnpm dev
```

## ✅ 完成！

现在可以测试AI功能了：

1. 启动小程序：`pnpm dev:weapp`
2. 完成一次测评
3. 在结果页面点击"AI中医咨询"
4. 输入问题，例如："我的体质有什么特点？"
5. 查看AI回复

## 💡 测试问题示例

- "我的体质有什么特点？"
- "适合吃什么食物？"
- "有什么运动建议？"
- "需要注意什么？"
- "如何调理我的体质？"

## ⚠️ 如果遇到问题

### 问题1：提示"AI服务暂时不可用"

**解决**：
1. 检查 `.env` 文件中的 `AI_API_KEY` 是否正确
2. 确认 `AI_PROVIDER` 配置正确（deepseek、qwen、openai等）
3. 确认API密钥没有多余的空格
4. 重启后端服务
5. 查看后端控制台的错误信息

### 问题2：不知道如何获取API密钥

**解决**：
- 查看详细指南：`AI-INTEGRATION-GUIDE.md`
- 或联系技术支持

## 📝 重要提示

1. **不要泄露API密钥**：`.env` 文件不要提交到代码仓库
2. **费用说明**：大多数AI服务都有免费额度，超出后按使用量付费
3. **测试建议**：开发阶段可以先用免费额度测试

## 🎉 就这么简单！

配置完成后，用户就可以使用AI中医咨询功能了！
