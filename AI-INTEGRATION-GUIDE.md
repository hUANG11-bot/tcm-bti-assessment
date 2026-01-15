# AI中医对话功能接入指南（小白版）

## 📋 功能说明

在测评结果页面，添加了"AI中医咨询"按钮。用户完成测评后，可以点击按钮与AI中医进行实时对话，询问关于体质、调理、健康等方面的问题。

## ✅ 已完成的工作

1. ✅ **后端AI接口**：`server/routers.ts` 中的 `ai.chat` 接口
2. ✅ **前端对话页面**：`src/pages/ai-chat/index.tsx`
3. ✅ **结果页面入口**：在结果页面添加了"AI中医咨询"按钮
4. ✅ **自动识别体质**：AI会自动获取用户的体质类型，提供个性化建议

## 🚀 快速开始（3步配置）

### 步骤1：获取AI服务API密钥

项目已经集成了LLM功能，您需要配置API密钥。

#### 选项A：使用Forge API（推荐，最简单）

1. **访问网站**：https://forge.manus.im
2. **注册账号**：使用邮箱注册
3. **获取API密钥**：登录后在控制台找到API密钥
4. **复制密钥**：保存好API密钥（类似：`sk-xxxxxxxxxxxxx`）

#### 选项B：使用OpenAI API

1. **访问网站**：https://platform.openai.com
2. **注册账号**：使用邮箱注册（需要国外邮箱或手机号）
3. **获取API密钥**：在API Keys页面创建新密钥
4. **复制密钥**：保存好API密钥

### 步骤2：配置环境变量

在项目根目录的 `.env` 文件中添加：

```env
# Forge API（推荐）
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的API密钥

# 或者使用OpenAI（需要修改代码中的API地址）
# OPENAI_API_KEY=你的OpenAI密钥
```

**示例**：
```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sk-1234567890abcdef
```

### 步骤3：重启服务

```bash
# 停止当前服务（按 Ctrl+C）
# 然后重新启动
pnpm dev
```

## 🎯 使用流程

1. **完成测评**：用户完成体质测评
2. **查看结果**：在结果页面看到"AI中医咨询"按钮
3. **点击按钮**：进入AI对话页面
4. **开始对话**：可以询问任何关于体质、健康的问题
5. **获得建议**：AI会根据用户的体质类型提供专业建议

## 💡 功能特点

- **智能识别**：自动获取用户体质类型，提供个性化建议
- **实时对话**：支持多轮对话，可以连续提问
- **快捷问题**：提供常见问题快捷入口
- **专业回答**：AI扮演中医专家角色，提供专业建议

## 🔧 如何测试

1. **启动后端**：
   ```bash
   pnpm dev
   ```

2. **启动小程序**：
   ```bash
   pnpm dev:weapp
   ```

3. **测试流程**：
   - 完成一次测评
   - 在结果页面点击"AI中医咨询"
   - 输入问题，例如："我的体质有什么特点？"
   - 查看AI回复

## ⚠️ 常见问题

### Q1: 提示"AI服务暂时不可用"

**原因**：API密钥未配置或配置错误

**解决**：
1. 检查 `.env` 文件中的 `BUILT_IN_FORGE_API_KEY` 是否正确
2. 确认API密钥有效（没有过期或被删除）
3. 重启后端服务

### Q2: 如何更换AI服务？

如果需要使用其他AI服务（如通义千问、文心一言），需要：

1. 修改 `server/_core/llm.ts` 中的API地址
2. 根据服务商的API格式调整请求参数
3. 更新环境变量配置

### Q3: AI回答不准确怎么办？

可以修改 `server/routers.ts` 中的系统提示词，让AI更专业：

```typescript
const systemMessage = {
  role: 'system',
  content: '你是一位经验丰富的中医专家...（修改这里的提示词）',
}
```

### Q4: 如何控制AI回答长度？

在 `server/routers.ts` 中修改提示词：

```typescript
content: `...回答要简洁明了，控制在200字以内。` // 修改这里的字数限制
```

## 📝 代码位置

- **后端AI接口**：`server/routers.ts`（第252-290行）
- **前端对话页面**：`src/pages/ai-chat/index.tsx`
- **结果页面入口**：`src/pages/result/index.tsx`（第367行）
- **AI服务配置**：`server/_core/llm.ts`

## 🎨 自定义提示词

在 `server/routers.ts` 的 `ai.chat` 接口中，可以修改系统提示词：

```typescript
const systemMessage: Message = {
  role: 'system',
  content: `你是一位经验丰富的中医专家，擅长体质辨识和健康调理。
${input.bodyType ? `当前咨询用户的体质类型是：${input.bodyType}。` : ''}
请用专业但易懂的语言回答用户的问题，提供实用的中医养生建议。
回答要简洁明了，控制在200字以内。`,
}
```

可以修改为：
- 更详细的角色描述
- 更具体的回答要求
- 不同的回答风格

## 💰 费用说明

- **Forge API**：通常有免费额度，超出后按使用量付费
- **OpenAI API**：按使用量付费，价格相对较高
- **建议**：开发阶段使用免费额度，生产环境根据实际使用量选择

## 🔒 安全提示

1. **不要泄露API密钥**：不要将 `.env` 文件提交到代码仓库
2. **限制使用量**：在AI服务商后台设置使用量限制
3. **监控费用**：定期检查API使用量和费用

## 📚 相关文档

- [AI服务配置](./AI-CHAT-SETUP.md)
- [LLM服务文档](./server/_core/llm.ts)

## 🎉 完成！

配置完成后，用户就可以在测评结果页面使用AI中医咨询功能了！
