# AI中医对话功能接入指南（小白版）

## 📋 功能说明

在测评结果页面最后，添加一个"AI中医咨询"按钮，点击后可以实时与AI中医进行对话，询问关于体质、调理、健康等方面的问题。

## 🎯 实现方案

### 方案1：使用现有的LLM服务（推荐，最简单）

项目已经集成了LLM功能，可以直接使用。

### 方案2：使用国内AI服务（如通义千问、文心一言）

如果需要使用国内AI服务，需要额外配置。

## 🚀 快速开始（使用现有LLM服务）

### 步骤1：检查环境变量

查看 `server/_core/env.ts`，确认AI服务配置：

```typescript
// 需要配置 BUILT_IN_FORGE_API_URL 和 BUILT_IN_FORGE_API_KEY
```

在 `.env` 文件中添加：

```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的API密钥
```

### 步骤2：创建AI对话页面

我已经为您创建了AI对话页面，位于 `src/pages/ai-chat/index.tsx`

### 步骤3：在结果页面添加入口

在结果页面底部添加"AI中医咨询"按钮。

### 步骤4：测试功能

启动服务后，点击按钮即可使用AI对话功能。

## 📝 详细步骤

### 1. 配置AI服务（如果还没有）

#### 选项A：使用Forge API（项目已集成）

1. 注册账号：访问 https://forge.manus.im
2. 获取API密钥
3. 在 `.env` 文件中配置：

```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的API密钥
```

#### 选项B：使用OpenAI API

1. 注册OpenAI账号：https://platform.openai.com
2. 获取API密钥
3. 修改 `server/_core/llm.ts` 中的API地址

#### 选项C：使用国内AI服务（通义千问）

需要修改代码以适配国内API，详见后续说明。

### 2. 创建后端API接口

我已经创建了 `server/routers.ts` 中的 `ai.chat` 接口。

### 3. 创建前端对话组件

我已经创建了适合小程序的AI对话组件。

### 4. 在结果页面添加入口

在结果页面底部添加按钮，跳转到AI对话页面。

## 💡 使用说明

1. 用户完成测评后，在结果页面底部看到"AI中医咨询"按钮
2. 点击按钮，进入AI对话页面
3. 可以询问关于体质、调理、健康等问题
4. AI会根据用户的体质类型提供专业建议

## 🔧 常见问题

### Q1: 如何获取API密钥？

**Forge API**：
- 访问 https://forge.manus.im
- 注册账号并获取API密钥

**OpenAI**：
- 访问 https://platform.openai.com
- 注册账号并获取API密钥

### Q2: 如何测试AI功能？

1. 确保后端服务运行：`pnpm dev`
2. 确保小程序运行：`pnpm dev:weapp`
3. 完成一次测评
4. 在结果页面点击"AI中医咨询"
5. 输入问题测试

### Q3: 如何自定义AI提示词？

修改 `server/routers.ts` 中的 `ai.chat` 接口，调整system message。

## 📚 相关文件

- 后端AI接口：`server/routers.ts`（ai.chat）
- 前端对话页面：`src/pages/ai-chat/index.tsx`
- AI服务配置：`server/_core/llm.ts`
- 环境变量：`.env`
