# AI对话功能调试指南

## 🔍 如何查看详细错误信息

### 方法1：查看微信开发者工具控制台

1. 打开微信开发者工具
2. 点击"调试器"标签
3. 切换到"Console"标签
4. 输入问题并发送
5. 查看控制台中的错误信息

### 方法2：查看后端日志

在后端服务运行的终端窗口中，查看错误日志：

```bash
# 后端服务会输出详细的日志
[AI Chat] Error: ...
[Chinese LLM] Error: ...
```

## 🐛 常见错误及解决方案

### 错误1：`request:fail url not in domain list`

**原因**：小程序域名白名单限制

**解决**：
1. 在微信开发者工具中关闭域名校验
2. 详情 → 本地设置 → 勾选"不校验合法域名"

### 错误2：`request:fail`（无具体信息）

**可能原因**：
1. 后端服务未运行
2. API 地址配置错误
3. 网络连接问题

**检查步骤**：

1. **确认后端服务运行**：
   ```bash
   # 检查端口
   netstat -ano | findstr :3000
   ```

2. **确认 API 地址**：
   - 检查 `.env` 中的 `TARO_APP_API_URL`
   - 应该与后端服务端口一致

3. **测试后端连接**：
   - 在浏览器打开：`http://localhost:3000`
   - 应该能看到服务器响应

### 错误3：`AI服务暂时不可用`

**可能原因**：
1. AI API 密钥无效
2. AI 服务调用失败
3. 网络连接问题

**检查步骤**：

1. **检查 AI 配置**：
   ```bash
   pnpm check-env
   ```

2. **查看后端日志**：
   - 查看是否有 AI 服务相关的错误
   - 常见错误：
     - `AI_API_KEY 未配置`
     - `DeepSeek API调用失败: 401` - 密钥无效
     - `DeepSeek API调用失败: 429` - 请求超限

3. **验证 API 密钥**：
   - 登录 DeepSeek 控制台
   - 检查密钥是否有效
   - 检查使用量和余额

### 错误4：`无法连接到服务器`

**可能原因**：
1. 后端服务未启动
2. 端口被占用
3. 防火墙阻止连接

**解决**：
1. 启动后端服务：`pnpm dev`
2. 检查端口是否被占用
3. 检查防火墙设置

## 📋 调试检查清单

### 前端
- [ ] 微信开发者工具中关闭了域名校验
- [ ] `.env` 中配置了正确的 `TARO_APP_API_URL`
- [ ] 小程序已重新编译
- [ ] 控制台没有 JavaScript 错误

### 后端
- [ ] 后端服务正在运行
- [ ] `.env` 中配置了 `AI_PROVIDER` 和 `AI_API_KEY`
- [ ] 后端日志没有错误信息
- [ ] AI 服务配置正确

### 网络
- [ ] 可以访问 `http://localhost:3000`
- [ ] 没有防火墙阻止连接
- [ ] 端口没有被其他程序占用

## 🔧 手动测试 API

### 测试后端 API

在浏览器中测试（需要安装 curl 或使用 Postman）：

```bash
# 测试 tRPC 端点
curl -X POST http://localhost:3000/api/trpc/ai.chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

### 测试 AI 服务

在后端代码中添加测试脚本：

```typescript
// test-ai.ts
import { invokeChineseLLM } from './server/_core/llm-chinese'

async function test() {
  try {
    const result = await invokeChineseLLM({
      messages: [
        { role: 'user', content: '你好' }
      ]
    })
    console.log('✅ 成功:', result.choices[0]?.message?.content)
  } catch (error: any) {
    console.error('❌ 失败:', error.message)
  }
}

test()
```

运行：
```bash
tsx test-ai.ts
```

## 💡 获取帮助

如果以上方法都无法解决问题：

1. **收集错误信息**：
   - 微信开发者工具 Console 中的完整错误
   - 后端服务日志中的错误信息
   - 网络请求的详细信息

2. **检查配置**：
   - 运行 `pnpm check-env` 查看配置
   - 确认所有必需配置都已设置

3. **查看相关文档**：
   - [AI-TROUBLESHOOTING.md](./AI-TROUBLESHOOTING.md)
   - [FIX-DOMAIN-ERROR.md](./FIX-DOMAIN-ERROR.md)
   - [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md)
