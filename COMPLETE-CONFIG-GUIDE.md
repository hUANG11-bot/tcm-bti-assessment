# 微信云托管完整配置指南

## 📋 配置清单总览

### ✅ 必需配置（必须配置才能运行）

1. **数据库连接** - `DATABASE_URL`
2. **微信小程序配置** - `WX_APPID`, `WX_SECRET`
3. **JWT 密钥** - `JWT_SECRET`
4. **AI 服务配置** - `AI_API_KEY`

### ⚙️ 可选配置（根据功能需要）

5. **AI 服务提供商** - `AI_PROVIDER`
6. **AI API URL** - `AI_API_URL`
7. **端口** - `PORT`
8. **环境** - `NODE_ENV`

---

## 🔧 详细配置说明

### 1. 数据库连接（必需）

**变量名**：`DATABASE_URL`

**格式**：
```
mysql://用户名:密码@主机:端口/数据库名
```

**示例**：
```
mysql://root:MyPassword123@cdb-abc123.sql.tencentcdb.com:3306/tcm_bti_assessment
```

**如何获取**：
- 如果您使用腾讯云数据库：在腾讯云控制台获取连接信息
- 如果您使用阿里云 RDS：在阿里云控制台获取连接信息
- 如果您使用其他云数据库：在对应服务商控制台获取

**配置位置**：微信云托管 → 服务设置 → 环境变量

---

### 2. 微信小程序配置（必需）

#### 2.1 微信 AppID

**变量名**：`WX_APPID`

**如何获取**：
1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 进入您的小程序
3. 在"开发" → "开发管理" → "开发设置"中
4. 找到"AppID(小程序ID)"

**示例**：
```
WX_APPID=wx04a7af67c8f47620
```

---

#### 2.2 微信 AppSecret

**变量名**：`WX_SECRET`

**如何获取**：
1. 在微信公众平台的"开发设置"中
2. 找到"AppSecret(小程序密钥)"
3. 点击"生成"或"重置"（如果还没生成）
4. **重要**：AppSecret 只显示一次，请妥善保存

**示例**：
```
WX_SECRET=your_app_secret_here
```

---

### 3. JWT 密钥（必需）

**变量名**：`JWT_SECRET`

**用途**：用于用户登录 token 加密

**如何生成**：
- 可以使用随机字符串生成器
- 或运行项目脚本：`pnpm generate-jwt`（本地）
- 或使用在线工具生成一个 32 位以上的随机字符串

**示例**：
```
JWT_SECRET=your_random_secret_key_here_at_least_32_characters
```

**要求**：
- 至少 32 个字符
- 使用随机字符串（不要使用简单密码）

---

### 4. AI 服务配置（必需）

#### 4.1 AI API 密钥

**变量名**：`AI_API_KEY`

**如何获取**：
- **DeepSeek**：https://platform.deepseek.com/
- **通义千问**：https://dashscope.aliyun.com/
- **OpenAI**：https://platform.openai.com/

**示例**：
```
AI_API_KEY=sk-your-api-key-here
```

---

#### 4.2 AI 服务提供商（可选，默认 deepseek）

**变量名**：`AI_PROVIDER`

**可选值**：
- `deepseek`（默认）
- `qwen`（通义千问）
- `openai`

**示例**：
```
AI_PROVIDER=deepseek
```

---

#### 4.3 AI API URL（可选）

**变量名**：`AI_API_URL`

**何时需要**：
- 使用自定义 AI 服务
- 或使用非标准 API 端点

**示例**（DeepSeek）：
```
AI_API_URL=https://api.deepseek.com
```

**示例**（通义千问）：
```
AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

---

### 5. 其他配置（可选）

#### 5.1 端口

**变量名**：`PORT`

**默认值**：`3000`

**何时需要**：
- 微信云托管通常会自动设置端口
- 一般不需要手动配置

**示例**：
```
PORT=3000
```

---

#### 5.2 环境

**变量名**：`NODE_ENV`

**默认值**：`production`（生产环境）

**可选值**：
- `production`（生产环境）
- `development`（开发环境）

**示例**：
```
NODE_ENV=production
```

---

## 📝 在微信云托管中配置步骤

### 步骤1：进入服务设置

1. **微信云托管控制台**
2. **服务管理** → **服务列表**
3. **点击您的服务名称**（如 `tci-001`）
4. **点击"服务设置"标签**

---

### 步骤2：添加环境变量

在"环境变量"部分，点击"添加环境变量"，逐个添加：

#### 必需配置

1. **`DATABASE_URL`**
   - 变量名：`DATABASE_URL`
   - 变量值：`mysql://用户名:密码@主机:3306/数据库名`

2. **`WX_APPID`**
   - 变量名：`WX_APPID`
   - 变量值：您的小程序 AppID

3. **`WX_SECRET`**
   - 变量名：`WX_SECRET`
   - 变量值：您的小程序 AppSecret

4. **`JWT_SECRET`**
   - 变量名：`JWT_SECRET`
   - 变量值：随机生成的密钥（至少 32 字符）

5. **`AI_API_KEY`**
   - 变量名：`AI_API_KEY`
   - 变量值：您的 AI 服务 API 密钥

#### 可选配置

6. **`AI_PROVIDER`**（如果使用非 DeepSeek）
   - 变量名：`AI_PROVIDER`
   - 变量值：`deepseek` 或 `qwen` 或 `openai`

7. **`AI_API_URL`**（如果需要自定义 API 地址）
   - 变量名：`AI_API_URL`
   - 变量值：API 地址

8. **`NODE_ENV`**（通常不需要，默认为 production）
   - 变量名：`NODE_ENV`
   - 变量值：`production`

---

### 步骤3：保存并重新部署

1. **保存所有环境变量**
2. **返回"部署发布"页面**
3. **点击"发布"按钮**
4. **等待部署完成**

---

## 💻 实例配置建议

### 最小配置（测试/开发）

- **CPU**：0.5 核
- **内存**：512MB
- **最小实例数**：1
- **最大实例数**：2

### 推荐配置（生产环境）

- **CPU**：1 核
- **内存**：1GB
- **最小实例数**：1
- **最大实例数**：5

### 高性能配置（高并发）

- **CPU**：2 核
- **内存**：2GB
- **最小实例数**：2
- **最大实例数**：10

---

## 📋 完整配置示例

### 在微信云托管环境变量中配置

```
变量名：DATABASE_URL
变量值：mysql://root:MyPassword123@cdb-abc123.sql.tencentcdb.com:3306/tcm_bti_assessment

变量名：WX_APPID
变量值：wx04a7af67c8f47620

变量名：WX_SECRET
变量值：your_app_secret_here

变量名：JWT_SECRET
变量值：your_random_secret_key_at_least_32_characters_long

变量名：AI_API_KEY
变量值：sk-your-deepseek-api-key-here

变量名：AI_PROVIDER
变量值：deepseek

变量名：NODE_ENV
变量值：production
```

---

## ✅ 配置检查清单

在部署前，请确认：

### 必需配置
- [ ] `DATABASE_URL` 已配置（数据库连接字符串）
- [ ] `WX_APPID` 已配置（微信小程序 AppID）
- [ ] `WX_SECRET` 已配置（微信小程序 AppSecret）
- [ ] `JWT_SECRET` 已配置（JWT 密钥，至少 32 字符）
- [ ] `AI_API_KEY` 已配置（AI 服务 API 密钥）

### 可选配置
- [ ] `AI_PROVIDER` 已配置（如果需要非默认服务）
- [ ] `AI_API_URL` 已配置（如果需要自定义 API 地址）
- [ ] `NODE_ENV` 已配置（通常不需要，默认为 production）

### 实例配置
- [ ] CPU 至少 0.5 核
- [ ] 内存至少 512MB
- [ ] 最小实例数至少 1

---

## 🎯 快速开始

### 如果您还没有这些配置

1. **数据库**：
   - 创建腾讯云或阿里云 MySQL 数据库
   - 获取连接信息

2. **微信小程序**：
   - 在微信公众平台获取 AppID 和 AppSecret

3. **JWT 密钥**：
   - 使用随机字符串生成器生成（至少 32 字符）

4. **AI 服务**：
   - 注册 DeepSeek 或其他 AI 服务
   - 获取 API 密钥

5. **配置环境变量**：
   - 在微信云托管控制台的"服务设置"中
   - 添加所有必需的环境变量

6. **重新部署**：
   - 点击"发布"按钮
   - 等待部署完成

---

## 🔍 验证配置

配置完成后，查看运行日志：

1. **点击"运行日志"标签**
2. **查看是否有错误**

**常见错误**：
- `Error: Missing required environment variable` - 缺少必需的环境变量
- `Error: connect ECONNREFUSED` - 数据库连接失败
- `Error: Invalid API key` - AI API 密钥错误

---

## 💡 提示

1. **敏感信息**：
   - 不要将环境变量分享给他人
   - 不要在代码中硬编码密钥

2. **配置顺序**：
   - 先配置数据库（最重要）
   - 再配置微信和 AI 服务
   - 最后配置可选项

3. **测试配置**：
   - 配置后查看运行日志
   - 确认没有错误信息

---

## 🎯 现在请

1. **准备所有必需配置**：
   - 数据库连接信息
   - 微信 AppID 和 AppSecret
   - JWT 密钥
   - AI API 密钥

2. **在微信云托管控制台配置**：
   - 进入"服务设置"
   - 添加所有环境变量

3. **重新部署服务**

4. **查看运行日志**，确认配置正确

**完成后告诉我结果！**
