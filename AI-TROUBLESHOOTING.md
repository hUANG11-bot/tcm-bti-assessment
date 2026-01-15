# AI功能故障排除指南

## 🔍 常见问题

### 问题1：AI对话无响应或报错

**可能原因**：
1. API密钥配置错误
2. 网络连接问题
3. 模型名称错误
4. API调用格式错误

**解决步骤**：

#### 步骤1：检查配置

运行配置检查：
```bash
pnpm check-env
```

确认以下配置正确：
- `AI_PROVIDER=deepseek`
- `AI_API_KEY=你的DeepSeek密钥`

#### 步骤2：查看后端日志

启动后端服务后，查看控制台输出：
```bash
pnpm dev
```

如果AI调用失败，会显示错误信息，例如：
- `AI_API_KEY 未配置`
- `DeepSeek API调用失败: 401 Unauthorized`
- `DeepSeek API调用失败: 429 Too Many Requests`

#### 步骤3：验证API密钥

1. 登录 DeepSeek 控制台：https://platform.deepseek.com
2. 检查API密钥是否有效
3. 查看使用量和余额

#### 步骤4：测试API连接

如果后端服务正在运行，尝试发送一个测试请求：

```bash
# 使用 curl 测试（如果有）
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的API密钥" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"你好"}],"max_tokens":100}'
```

### 问题2：提示"AI服务暂时不可用"

**可能原因**：
1. API密钥无效或过期
2. API调用次数超限
3. 网络连接问题
4. DeepSeek服务暂时不可用

**解决方法**：

1. **检查API密钥**：
   - 登录 DeepSeek 控制台
   - 确认密钥有效
   - 如果无效，创建新密钥

2. **检查使用量**：
   - 查看是否超出免费额度
   - 检查是否有余额

3. **检查网络**：
   - 确认服务器能访问 `https://api.deepseek.com`
   - 检查防火墙设置

4. **查看详细错误**：
   - 查看后端控制台的完整错误信息
   - 错误信息会显示具体原因

### 问题3：响应速度慢

**可能原因**：
1. 网络延迟
2. API服务负载高
3. 请求的token数量过多

**解决方法**：
1. 检查网络连接
2. 减少 `max_tokens` 参数
3. 使用更快的模型（如 `deepseek-chat`）

### 问题4：返回内容格式错误

**可能原因**：
1. API返回格式不符合预期
2. 解析错误

**解决方法**：
1. 查看后端日志中的完整响应
2. 检查 `server/_core/llm-chinese.ts` 中的解析逻辑

## 🛠️ 调试步骤

### 1. 启用详细日志

在后端代码中添加更多日志输出，查看：
- API请求内容
- API响应内容
- 错误详情

### 2. 测试API调用

创建一个测试脚本：

```typescript
// test-ai.ts
import { invokeChineseLLM } from './server/_core/llm-chinese';

async function test() {
  try {
    const result = await invokeChineseLLM({
      messages: [
        { role: 'user', content: '你好' }
      ]
    });
    console.log('成功:', result);
  } catch (error) {
    console.error('失败:', error);
  }
}

test();
```

运行：
```bash
tsx test-ai.ts
```

### 3. 检查环境变量

确认 `.env` 文件中的配置被正确读取：

```bash
# 在 Node.js 中
console.log(process.env.AI_PROVIDER);
console.log(process.env.AI_API_KEY);
```

## 📋 检查清单

- [ ] `.env` 文件中配置了 `AI_PROVIDER=deepseek`
- [ ] `.env` 文件中配置了 `AI_API_KEY`（有效的DeepSeek密钥）
- [ ] 后端服务已重启（修改 `.env` 后需要重启）
- [ ] DeepSeek API密钥有效且未过期
- [ ] 有足够的API使用额度
- [ ] 网络可以访问 `https://api.deepseek.com`
- [ ] 后端控制台没有错误信息
- [ ] 小程序中的API地址配置正确（`TARO_APP_API_URL`）

## 🔗 相关文档

- [DeepSeek API文档](https://api-docs.deepseek.com/zh-cn/)
- [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md) - DeepSeek配置指南
- [CHINESE-AI-SETUP.md](./CHINESE-AI-SETUP.md) - 国内AI服务配置

## 💡 获取帮助

如果以上方法都无法解决问题：

1. **查看后端日志**：启动 `pnpm dev` 后，查看控制台的完整错误信息
2. **检查DeepSeek状态**：访问 DeepSeek 官网查看服务状态
3. **联系支持**：如果问题持续，可以联系 DeepSeek 技术支持
