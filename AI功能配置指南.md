# AI中医功能配置指南

## 问题诊断

如果AI中医功能无法使用，请先运行诊断脚本：

```bash
npm run test-ai
```

## 配置步骤

### 1. 创建 .env 文件

在项目根目录创建 `.env` 文件（如果不存在）。

### 2. 配置AI服务

#### 方案A：使用 DeepSeek（推荐，国内可用）

1. 访问 [DeepSeek 平台](https://platform.deepseek.com)
2. 注册账号并获取 API Key
3. 在 `.env` 文件中添加：

```env
AI_PROVIDER=deepseek
AI_API_KEY=sk-your-deepseek-api-key-here
```

#### 方案B：使用通义千问

1. 访问 [阿里云 DashScope](https://dashscope.console.aliyun.com)
2. 开通服务并获取 API Key
3. 在 `.env` 文件中添加：

```env
AI_PROVIDER=qwen
AI_API_KEY=your-qwen-api-key-here
```

#### 方案C：使用 OpenAI

1. 访问 [OpenAI Platform](https://platform.openai.com)
2. 获取 API Key
3. 在 `.env` 文件中添加：

```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key-here
```

#### 方案D：使用自定义API（OpenAI兼容）

```env
AI_PROVIDER=custom
AI_API_KEY=your-api-key-here
AI_API_URL=https://your-api-endpoint.com/v1/chat/completions
```

### 3. 备用服务配置（可选）

如果国内AI服务失败，系统会自动尝试使用备用服务。配置备用服务：

```env
BUILT_IN_FORGE_API_KEY=your-forge-api-key-here
BUILT_IN_FORGE_API_URL=https://forge.manus.im  # 可选，默认使用官方地址
```

### 4. 验证配置

运行诊断脚本验证配置：

```bash
npm run test-ai
```

如果看到 `✅ 国内AI服务: 正常`，说明配置成功。

## 常见问题

### Q1: 提示 "AI_API_KEY 未配置"

**原因**：`.env` 文件中没有设置 `AI_API_KEY`

**解决**：
1. 检查项目根目录是否有 `.env` 文件
2. 确认 `.env` 文件中包含 `AI_API_KEY=your-key`
3. 重启开发服务器

### Q2: 提示 "API密钥无效" 或 "401 Unauthorized"

**原因**：API Key 不正确或已过期

**解决**：
1. 登录对应的AI服务平台
2. 重新生成 API Key
3. 更新 `.env` 文件中的 `AI_API_KEY`
4. 重启服务

### Q3: 提示 "账户余额不足"

**原因**：AI服务账户没有足够余额

**解决**：
1. 登录对应的AI服务平台
2. 充值账户余额
3. 确认账户有足够额度

### Q4: 提示 "网络连接超时"

**原因**：网络连接问题或API服务不可用

**解决**：
1. 检查网络连接
2. 确认API服务是否正常（访问对应平台状态页面）
3. 如果使用国内服务，检查是否需要配置代理

### Q5: 小程序中无法使用AI功能

**原因**：后端服务未运行或配置错误

**解决**：
1. 确认后端服务正在运行（`npm run dev` 或 `npm start`）
2. 检查小程序配置的API地址是否正确
3. 运行 `npm run test-ai` 验证后端AI服务是否正常

## 完整 .env 示例

```env
# AI服务配置（必需）
AI_PROVIDER=deepseek
AI_API_KEY=sk-your-api-key-here

# 备用AI服务配置（可选）
BUILT_IN_FORGE_API_KEY=your-forge-api-key-here
BUILT_IN_FORGE_API_URL=https://forge.manus.im

# 其他配置...
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
# ...
```

## 获取API Key的详细步骤

### DeepSeek

1. 访问 https://platform.deepseek.com
2. 点击右上角"登录"或"注册"
3. 登录后，进入"API Keys"页面
4. 点击"创建新的API Key"
5. 复制生成的Key（只显示一次，请妥善保存）
6. 将Key添加到 `.env` 文件的 `AI_API_KEY` 中

### 通义千问

1. 访问 https://dashscope.console.aliyun.com
2. 使用阿里云账号登录
3. 开通"通义千问"服务
4. 在"API-KEY管理"中创建新的Key
5. 复制Key并添加到 `.env` 文件

## 测试

配置完成后，运行以下命令测试：

```bash
# 诊断AI功能
npm run test-ai

# 启动开发服务器
npm run dev
```

然后在小程序或Web界面中测试AI中医咨询功能。
