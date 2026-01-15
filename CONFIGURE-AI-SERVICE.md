# 配置 AI 服务（解决 AI 功能不可用问题）

## 🚨 问题确认

从运行日志看到：
```
[AI Chat] Error: AI服务配置错误：AI_API_KEY 和 BUILT_IN_FORGE_API_KEY 都未配置。请至少配置其中一个。
[AI Chat] 国内AI服务失败: AI_API_KEY 未配置，请在 .env 文件中设置
```

这说明：
- ❌ `AI_API_KEY` 环境变量未配置
- ❌ AI 功能无法使用

---

## 🚀 解决方案

### 步骤1：获取 AI API 密钥

根据您的配置，您使用的是 **DeepSeek** AI 服务。

#### 如何获取 DeepSeek API Key：

1. **访问 DeepSeek 官网**：https://platform.deepseek.com
2. **注册/登录账号**
3. **进入 API 密钥管理页面**
4. **创建新的 API Key**
5. **复制 API Key**（格式类似：`sk-xxxxxxxxxxxxxxxxxxxxx`）

---

### 步骤2：在微信云托管中配置环境变量

1. **登录微信云托管控制台**
2. **进入服务管理** → **服务列表**
3. **点击您的服务名称**（如 `tci`）
4. **点击"服务设置"标签**
5. **找到"环境变量"部分**

---

### 步骤3：添加 AI_API_KEY 环境变量

1. **点击"添加环境变量"**（或"编辑"按钮）

2. **添加以下环境变量**：

#### 变量名：`AI_API_KEY`

#### 变量值：
```
您的 DeepSeek API Key（例如：sk-xxxxxxxxxxxxxxxxxxxxx）
```

**注意**：
- 直接粘贴 API Key，不要添加引号
- 确保没有多余的空格
- 保持密钥的完整性

---

### 步骤4：添加 AI_PROVIDER 环境变量（可选）

如果还没有配置，建议添加：

#### 变量名：`AI_PROVIDER`

#### 变量值：
```
deepseek
```

---

### 步骤5：保存配置

1. **点击"保存"按钮**
2. **确认环境变量已添加**

---

### 步骤6：重新部署服务

1. **返回"部署发布"页面**
2. **点击"发布"按钮**
3. **等待部署完成**（通常几分钟）

---

### 步骤7：验证配置

1. **查看服务运行日志**
2. **查看是否有 AI 相关的错误**

**成功标志**：
- 不再有 "AI_API_KEY 未配置" 错误
- AI 功能可以正常使用

**失败标志**：
- 仍然显示 "AI_API_KEY 未配置"
- 或者显示 "API Key 无效" 等错误

---

## 📋 完整的环境变量清单

确保以下环境变量都已配置：

### 必需的环境变量：

```
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret
JWT_SECRET=你的JWT密钥（至少32个字符）
DATABASE_URL=mysql://root:Huangte991%2C%2C@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
AI_API_KEY=你的DeepSeek API Key（例如：sk-xxxxxxxxxxxxxxxxxxxxx）
```

### 可选的环境变量：

```
AI_PROVIDER=deepseek（默认值，建议显式配置）
AI_API_URL=（DeepSeek不需要，留空即可）
PORT=3000（默认值）
NODE_ENV=production（默认值）
OAUTH_SERVER_URL=（可选，如果需要OAuth功能）
```

---

## ⚠️ 重要注意事项

### 关于 AI_API_KEY

- **必须配置**：AI 功能需要此密钥才能工作
- **格式正确**：确保 API Key 完整且没有多余字符
- **安全保护**：不要将 API Key 提交到代码仓库

---

### 关于 AI_PROVIDER

- **默认值**：如果不配置，默认使用 `deepseek`
- **建议显式配置**：明确指定使用的 AI 服务提供商

---

### 关于 OAUTH_SERVER_URL

- **可选配置**：如果不需要 OAuth 功能，可以忽略此警告
- **如果需要**：设置为您的 OAuth 服务器地址（通常是后端服务的地址）

---

## 🔍 验证方法

### 方法1：查看运行日志

1. **在微信云托管控制台**
2. **进入服务详情** → **运行日志**
3. **查看是否有 AI 相关的错误**

**成功标志**：
- 不再有 "AI_API_KEY 未配置" 错误
- 服务正常启动

**失败标志**：
- 仍然显示 "AI_API_KEY 未配置"
- 或者显示 API Key 相关的错误

---

### 方法2：测试 AI 功能

1. **在小程序中打开 AI 咨询页面**
2. **尝试发送一条消息**
3. **查看是否能正常收到 AI 回复**

---

## 🎯 现在请

1. **获取 DeepSeek API Key**：
   - 访问 https://platform.deepseek.com
   - 注册/登录并创建 API Key

2. **在微信云托管控制台中配置环境变量**：
   - 添加 `AI_API_KEY` 环境变量
   - 值：您的 DeepSeek API Key
   - 可选：添加 `AI_PROVIDER=deepseek`

3. **保存配置**

4. **重新部署服务**

5. **查看运行日志**：
   - 确认不再有 "AI_API_KEY 未配置" 错误
   - 确认服务正常启动

6. **测试 AI 功能**：
   - 在小程序中测试 AI 咨询功能
   - 确认能正常使用

7. **如果还有问题**：
   - 查看具体的错误信息
   - 告诉我错误详情

---

## 💡 提示

- **API Key 格式**：DeepSeek 的 API Key 通常以 `sk-` 开头
- **密钥安全**：不要在代码中硬编码 API Key，使用环境变量
- **需要重新部署**：修改环境变量后必须重新部署服务
- **查看日志**：如果配置失败，查看运行日志了解具体错误

**请按照上述步骤配置 AI_API_KEY，然后告诉我结果！**
