# 🎉 配置完成！快速开始指南

## ✅ 配置检查清单

请确认 `.env` 文件中已包含以下配置：

### 必需配置

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret

# AI服务配置（推荐DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek API密钥

# JWT密钥（用于用户登录加密）
JWT_SECRET=你的JWT密钥
```

### 可选配置

```env
# 数据库配置（如果需要保存数据）
DATABASE_URL=mysql://user:password@localhost:3306/database_name

# API服务器地址（小程序使用）
TARO_APP_API_URL=http://localhost:3000
```

---

## 🚀 启动服务

### 步骤1：启动后端服务

```bash
pnpm dev
```

看到以下信息说明启动成功：
```
Server running on http://localhost:3000/
```

### 步骤2：启动小程序编译（新开一个终端）

```bash
pnpm dev:weapp
```

看到以下信息说明编译成功：
```
✓ Webpack Compiled successfully
```

---

## 🧪 测试功能

### 1. 测试小程序

1. 打开微信开发者工具
2. 导入项目：选择 `dist` 目录
3. 点击"编译"
4. 查看首页是否正常显示

### 2. 测试微信登录

1. 在小程序中点击"我的"标签
2. 点击"微信一键登录"
3. 授权登录
4. 查看是否显示用户信息

### 3. 测试AI对话

1. 完成一次体质测评
2. 在结果页面点击"AI中医咨询"
3. 输入问题，例如："我的体质有什么特点？"
4. 查看AI回复

### 4. 测试管理员功能（可选）

1. 创建管理员账号：
   ```bash
   pnpm create-admin admin admin123456
   ```

2. 在小程序中访问：`/pages/admin/login/index`
3. 使用管理员账号登录
4. 查看后台数据

---

## ⚠️ 常见问题

### 问题1：后端服务启动失败

**检查**：
- `.env` 文件是否存在
- 端口3000是否被占用
- 数据库连接是否正常（如果配置了数据库）

**解决**：
```bash
# 检查端口占用（Windows）
netstat -ano | findstr :3000

# 如果被占用，修改 .env 中的 PORT=3001
```

### 问题2：小程序编译失败

**检查**：
- Node.js版本是否 >= 18
- 依赖是否安装完整：`pnpm install`

**解决**：
```bash
# 重新安装依赖
pnpm install

# 清理缓存
rm -rf node_modules/.cache
pnpm dev:weapp
```

### 问题3：AI对话功能不可用

**检查**：
- `.env` 中的 `AI_API_KEY` 是否正确
- `AI_PROVIDER` 配置是否正确（deepseek、qwen等）
- 后端服务是否正常运行

**解决**：
1. 检查后端控制台的错误信息
2. 验证API密钥是否有效
3. 查看 [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md) 重新配置

### 问题4：微信登录失败

**检查**：
- `.env` 中的 `WX_APPID` 和 `WX_SECRET` 是否正确
- 微信开发者工具中的AppID是否匹配

**解决**：
1. 检查微信公众平台的AppSecret
2. 运行 `pnpm check-wechat` 验证配置
3. 查看 [WECHAT-LOGIN-TROUBLESHOOTING.md](./WECHAT-LOGIN-TROUBLESHOOTING.md)

---

## 📚 相关文档

- **AI配置**：[DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md)
- **微信登录**：[WECHAT-LOGIN-GUIDE.md](./WECHAT-LOGIN-GUIDE.md)
- **数据库配置**：[DATABASE-SETUP.md](./DATABASE-SETUP.md)
- **管理员设置**：[ADMIN-SETUP-GUIDE.md](./ADMIN-SETUP-GUIDE.md)

---

## 🎯 下一步

配置完成后，您可以：

1. ✅ **测试所有功能**：确保登录、测评、AI对话都正常
2. ✅ **创建管理员账号**：`pnpm create-admin admin admin123456`
3. ✅ **查看后台数据**：访问 `/pages/admin/login/index`
4. ✅ **发布小程序**：参考 [MINIPROGRAM-PUBLISH-GUIDE.md](./MINIPROGRAM-PUBLISH-GUIDE.md)

---

## 🎉 完成！

如果所有功能都正常，恭喜您！小程序已经可以正常使用了！

如有问题，请查看相关文档或检查后端控制台的错误信息。
