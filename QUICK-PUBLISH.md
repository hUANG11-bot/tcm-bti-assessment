# 小程序快速发布指南

## 🚀 三步发布流程

### 步骤 1：配置生产环境

在项目根目录创建或编辑 `.env` 文件：

```env
# 生产环境 API 地址（替换为您的实际域名）
TARO_APP_API_URL=https://api.yourdomain.com

# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的AppSecret

# 数据库配置
DATABASE_URL=mysql://user:password@host:port/database
```

### 步骤 2：编译生产版本

```bash
# 方法1：使用默认配置（API地址需要在 .env 中设置）
pnpm build:weapp

# 方法2：临时指定 API 地址
set TARO_APP_API_URL=https://api.yourdomain.com && pnpm build:weapp
```

编译完成后，代码在 `dist` 目录。

### 步骤 3：上传和发布

1. **打开微信开发者工具**
   - 导入项目，选择 `dist` 目录
   - 确认 AppID 正确

2. **上传代码**
   - 点击 **"上传"** 按钮
   - 填写版本号：`1.0.0`
   - 填写备注：`首次发布`

3. **提交审核**
   - 登录 [微信公众平台](https://mp.weixin.qq.com)
   - 进入：**版本管理** → **开发版本**
   - 点击 **"提交审核"**
   - 填写审核信息并提交

4. **发布上线**
   - 审核通过后，点击 **"发布"** 按钮
   - 小程序正式上线！

## ⚠️ 重要提醒

### 必须配置服务器域名

在微信公众平台配置：
- **开发** → **开发管理** → **开发设置** → **服务器域名**
- 添加您的后端 API 域名（必须 HTTPS）

### 检查清单

发布前确认：
- [ ] 服务器域名已配置
- [ ] API 地址正确（生产环境）
- [ ] 所有功能测试通过
- [ ] 包体积不超过 2MB

## 📚 详细指南

更多详细信息，请查看：[MINIPROGRAM-PUBLISH-GUIDE.md](./MINIPROGRAM-PUBLISH-GUIDE.md)
