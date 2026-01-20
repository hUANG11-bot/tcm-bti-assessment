# MiniMax AI 配置完成

## ✅ 已完成的配置

1. **更新了 `.env` 文件**：
   - `AI_PROVIDER=custom`
   - `AI_API_KEY=sk-api-TMvV2FDgB7DL_sNINKVwdpMx25-mB49vP4DQlLs-FSZmePc2A1xIKmzBTHSpAMZIw3I0V_VgF6b4tuP0Uh_bKGn5fUHTF-7s-f776AhYQn33ZqoidRu_5ww`
   - `AI_API_URL=https://api.minimax.chat/v1/chat/completions`

2. **更新了代码**：
   - 修改了 `server/_core/llm-chinese.ts`，使其在使用 MiniMax API 时自动使用正确的模型名称 `abab5.5-chat`

## 🚀 下一步操作

### 1. 重启后端服务

如果后端服务正在运行，需要重启以加载新的配置：

```powershell
# 停止当前服务（Ctrl+C）
# 然后重新启动
cd d:\tcm-bti-assessment
pnpm dev
```

### 2. 测试配置

运行测试脚本验证配置是否正确：

```powershell
pnpm test-ai
```

**预期输出**：
- ✅ AI_API_KEY: 已配置
- ✅ AI_API_URL: 已配置
- ✅ 国内AI服务: 正常

### 3. 测试 AI 功能

在小程序或 Web 界面中测试 AI 中医咨询功能，确认可以正常使用 MiniMax API。

---

## 📋 MiniMax API 说明

- **API 端点**：`https://api.minimax.chat/v1/chat/completions`
- **模型名称**：`abab5.5-chat`
- **认证方式**：Bearer Token（API Key）
- **API 格式**：OpenAI 兼容格式

---

**配置已完成！请重启后端服务并测试 AI 功能。**
