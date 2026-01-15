# TCM-BTI 中医体质评估小程序

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example` 或运行 `pnpm generate-jwt` 生成JWT密钥）：

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret

# AI服务配置（推荐DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek API密钥

# JWT密钥（运行 pnpm generate-jwt 生成）
JWT_SECRET=你的JWT密钥
```

### 3. 启动服务

**后端服务**：
```bash
pnpm dev
```

**小程序编译**（新开终端）：
```bash
pnpm dev:weapp
```

### 4. 打开微信开发者工具

- 导入项目：选择 `dist` 目录
- AppID：`wx04a7af67c8f47620`

## 📚 重要文档

### 必需阅读（新手）

1. **[QUICK-START-COMPLETE.md](./QUICK-START-COMPLETE.md)** - 完整启动指南
2. **[DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md)** - AI服务配置（5分钟）
3. **[WECHAT-LOGIN-GUIDE.md](./WECHAT-LOGIN-GUIDE.md)** - 微信登录配置

### 可选阅读

- **数据库配置**：[DATABASE-SETUP.md](./DATABASE-SETUP.md)
- **管理员设置**：[ADMIN-SETUP-GUIDE.md](./ADMIN-SETUP-GUIDE.md)
- **发布小程序**：[MINIPROGRAM-PUBLISH-GUIDE.md](./MINIPROGRAM-PUBLISH-GUIDE.md)

## 🛠️ 常用命令

```bash
# 生成JWT密钥
pnpm generate-jwt

# 检查环境配置
pnpm check-env

# 检查微信配置
pnpm check-wechat

# 创建管理员账号
pnpm create-admin admin admin123456
```

## 📁 项目结构

```
tcm-bti-assessment/
├── src/              # 小程序源码
├── server/           # 后端服务
├── config/           # Taro配置
├── dist/             # 编译输出（小程序）
├── scripts/          # 工具脚本
└── .env             # 环境变量（需自己创建）
```

## ⚠️ 常见问题

### 问题1：AI对话不可用
- 检查 `.env` 中的 `AI_API_KEY` 是否正确
- 查看 [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md)

### 问题2：微信登录失败
- 检查 `WX_APPID` 和 `WX_SECRET` 是否正确
- 运行 `pnpm check-wechat` 验证配置

### 问题3：编译失败
- 运行 `pnpm install` 重新安装依赖
- 检查 Node.js 版本（需要 >= 18）

## 📝 其他文档

项目中有很多详细的配置文档，但**大部分不是必需的**。如果遇到问题，可以按需查看：

- `HOW-TO-*.md` - 各种操作指南
- `FIX-*.md` - 问题修复指南
- `*-GUIDE.md` - 功能详细说明

## 🎉 开始使用

配置完成后，运行 `pnpm dev` 和 `pnpm dev:weapp` 即可开始开发！
