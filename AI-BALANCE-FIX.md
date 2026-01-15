# AI服务余额不足问题解决方案

## 🔍 问题诊断

如果测试时出现以下错误：
```
DeepSeek API调用失败: 402 Payment Required
Insufficient Balance（余额不足）
```

这说明：
- ✅ API密钥配置正确（否则会是401错误）
- ❌ 账户余额不足，无法使用服务

## 🛠️ 解决方案

### 方案1：充值DeepSeek账户（推荐）

1. **登录DeepSeek控制台**
   - 访问：https://platform.deepseek.com
   - 使用您的账号登录

2. **查看余额**
   - 在控制台查看当前账户余额
   - 确认余额是否充足

3. **充值账户**
   - 按照DeepSeek的充值流程进行充值
   - 充值完成后，等待几分钟让系统更新

4. **重新测试**
   ```bash
   pnpm test-ai-chat
   ```

### 方案2：配置备用服务（Forge API）

如果暂时无法充值DeepSeek，可以配置备用服务：

1. **获取Forge API密钥**
   - 访问：https://forge.manus.im
   - 注册/登录账号
   - 获取API密钥

2. **配置环境变量**
   在 `.env` 文件中添加：
   ```env
   BUILT_IN_FORGE_API_URL=https://forge.manus.im
   BUILT_IN_FORGE_API_KEY=你的Forge密钥
   ```

3. **测试配置**
   ```bash
   pnpm test-ai-chat
   ```

   系统会优先使用DeepSeek，如果失败会自动切换到Forge API。

### 方案3：使用其他AI服务

项目支持多种AI服务提供商，您也可以切换到其他服务：

#### 使用通义千问（Qwen）

1. **获取API密钥**
   - 访问：https://dashscope.aliyun.com
   - 注册/登录账号
   - 获取API密钥

2. **配置环境变量**
   ```env
   AI_PROVIDER=qwen
   AI_API_KEY=你的通义千问密钥
   ```

#### 使用OpenAI

1. **获取API密钥**
   - 访问：https://platform.openai.com
   - 注册/登录账号
   - 获取API密钥

2. **配置环境变量**
   ```env
   AI_PROVIDER=openai
   AI_API_KEY=你的OpenAI密钥
   AI_API_URL=https://api.openai.com/v1/chat/completions
   ```

## 📋 检查清单

在充值或配置备用服务后，请确认：

- [ ] DeepSeek账户已充值（如果使用DeepSeek）
- [ ] 或已配置备用服务（Forge API）
- [ ] 运行 `pnpm test-ai-chat` 测试通过
- [ ] 后端服务可以正常调用AI服务

## 🔧 验证步骤

1. **检查配置**
   ```bash
   pnpm check-env
   ```

2. **测试AI服务**
   ```bash
   pnpm test-ai-chat
   ```

3. **启动后端服务**
   ```bash
   pnpm dev
   ```

4. **测试AI对话功能**
   - 在小程序中完成测评
   - 点击"AI中医咨询"按钮
   - 发送测试消息，确认可以正常使用

## 💡 提示

- DeepSeek提供免费额度，但可能已用完
- 建议同时配置备用服务，确保服务可用性
- 定期检查账户余额，避免服务中断
- 如果使用多个服务，系统会自动切换到可用的服务

## 📞 获取帮助

如果充值后仍然无法使用：

1. **检查账户状态**
   - 登录DeepSeek控制台
   - 确认充值是否成功
   - 查看是否有其他限制

2. **查看详细错误**
   - 运行 `pnpm test-ai-chat` 查看详细错误信息
   - 查看后端控制台的日志

3. **联系服务商**
   - DeepSeek: https://platform.deepseek.com
   - Forge: https://forge.manus.im
