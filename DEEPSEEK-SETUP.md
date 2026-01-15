# DeepSeek AI配置指南（推荐）

## 🎯 为什么选择DeepSeek？

- ✅ **国内可访问**：无需翻墙
- ✅ **免费额度**：新用户有免费额度
- ✅ **价格便宜**：比OpenAI便宜很多
- ✅ **OpenAI兼容**：无需修改代码
- ✅ **速度快**：国内服务器，响应快

## 🚀 5分钟快速配置

### 步骤1：注册DeepSeek账号（2分钟）

1. 访问：https://platform.deepseek.com
2. 点击"注册"或"Sign Up"
3. 使用邮箱注册（例如：yourname@example.com）
4. 完成邮箱验证

### 步骤2：获取API密钥（1分钟）

1. 登录后，进入控制台
2. 点击左侧菜单"API Keys"
3. 点击"Create API Key"或"创建密钥"
4. 复制生成的密钥（类似：`sk-xxxxxxxxxxxxx`）
5. ⚠️ **重要**：密钥只显示一次，请立即保存！

### 步骤3：配置到项目（1分钟）

在项目根目录的 `.env` 文件中添加：

```env
# AI服务配置（DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=你刚才复制的密钥
```

### 步骤4：重启服务（1分钟）

```bash
# 停止当前服务（按 Ctrl+C）
# 重新启动
pnpm dev
```

## ✅ 完成！

现在可以测试AI功能了：

1. 启动小程序：`pnpm dev:weapp`
2. 完成一次测评
3. 在结果页面点击"AI中医咨询"
4. 输入问题测试

## 💰 费用说明

- **免费额度**：新用户通常有免费额度
- **付费价格**：非常便宜，约 $0.14/1M tokens
- **查看使用量**：登录控制台可以查看使用量和费用

## 🔍 如何查看API密钥

1. 登录：https://platform.deepseek.com
2. 进入：API Keys
3. 可以看到已创建的密钥列表
4. 如果忘记密钥，可以删除旧密钥，创建新密钥

## ⚠️ 注意事项

1. **密钥安全**：不要泄露API密钥
2. **使用量限制**：可以在控制台设置使用量限制
3. **费用监控**：定期查看使用量，避免超支

## 📝 完整的 .env 配置示例

```env
# AI服务配置（DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=sk-你的DeepSeek密钥

# 其他配置...
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret
JWT_SECRET=你的JWT密钥
```

## 🎉 就这么简单！

配置完成后，AI中医对话功能就可以使用了！
