# 如何获取API密钥（小白版）

## 🔑 需要获取的密钥

1. **AI API密钥** - 用于AI中医对话功能（推荐DeepSeek，国内可用）
2. **JWT密钥** - 用于用户登录加密（可以自己生成）
3. **微信AppSecret** - 用于微信登录（之前已说明）

---

## 1️⃣ AI API密钥（AI对话功能）

### 推荐：DeepSeek（国内可用，最简单）⭐

#### 步骤1：访问网站

打开浏览器，访问：**https://platform.deepseek.com**

#### 步骤2：注册账号

1. 点击页面上的 **"注册"** 或 **"Sign Up"** 按钮
2. 使用邮箱注册（例如：yourname@example.com）
3. 设置密码
4. 完成邮箱验证（如果需要）

#### 步骤3：登录账号

使用刚才注册的邮箱和密码登录

#### 步骤4：获取API密钥

1. 登录后，进入控制台
2. 点击左侧菜单 **"API Keys"**
3. 点击 **"Create API Key"** 或 **"创建密钥"**
4. 复制生成的API密钥（类似：`sk-xxxxxxxxxxxxx`）
5. ⚠️ **重要**：密钥只显示一次，请立即保存！

#### 步骤5：配置到项目

将API密钥添加到 `.env` 文件：

```env
AI_PROVIDER=deepseek
AI_API_KEY=sk-你刚才复制的密钥
```

**详细步骤**：查看 [DEEPSEEK-SETUP.md](./DEEPSEEK-SETUP.md)

---

### 其他选项：通义千问（阿里云）

如果需要使用通义千问：

1. 访问：https://www.aliyun.com
2. 注册并实名认证
3. 开通通义千问服务
4. 获取API密钥
5. 配置：
   ```env
   AI_PROVIDER=qwen
   AI_API_KEY=你的通义千问密钥
   ```

---

## 2️⃣ JWT密钥（用户登录加密）

JWT密钥不需要从外部获取，**可以自己生成**。

### 方法1：使用在线生成器（最简单）

1. 访问：https://www.random.org/strings/
2. 设置参数：
   - **长度**：32
   - **字符集**：选择"字母和数字"
3. 点击"生成"
4. 复制生成的随机字符串

### 方法2：使用命令行生成（Windows）

打开CMD或PowerShell，运行：

```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# 或者使用Node.js（如果已安装）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 方法3：自己随便写一个

只要是一个足够长的随机字符串即可，例如：

```
my_jwt_secret_key_2024_very_long_string_123456
```

### 配置到项目

将JWT密钥添加到 `.env` 文件：

```env
JWT_SECRET=你生成的随机字符串
```

**示例**：
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 3️⃣ 微信AppSecret（微信登录功能）

### 步骤1：登录微信公众平台

访问：**https://mp.weixin.qq.com**

### 步骤2：进入开发设置

1. 登录后，点击左侧菜单 **"开发"**
2. 选择 **"开发管理"**
3. 点击 **"开发设置"**

### 步骤3：获取AppSecret

1. 在 **"开发设置"** 页面，找到 **"AppSecret（小程序密钥）"**
2. 如果显示 **"未设置"**，点击 **"生成"** 按钮
3. 如果已设置，点击 **"重置"** 或 **"查看"**
4. ⚠️ **重要**：AppSecret只显示一次，请立即保存！

### 步骤4：配置到项目

将AppSecret添加到 `.env` 文件：

```env
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你刚才获取的AppSecret
```

---

## 📝 完整的 .env 文件示例

创建 `.env` 文件后，内容应该是这样：

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=abc123def456ghi789（你的实际AppSecret）

# AI服务配置
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sk-1234567890abcdef（你的实际API密钥）

# JWT密钥（自己生成的随机字符串）
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# 数据库配置（如果有数据库）
DATABASE_URL=mysql://user:password@localhost:3306/database_name

# API服务器地址（开发环境）
TARO_APP_API_URL=http://localhost:3000
```

---

## ⚠️ 重要提示

### 1. 密钥安全

- ✅ **不要**将 `.env` 文件提交到代码仓库
- ✅ **不要**在聊天中分享密钥
- ✅ **不要**在公开场合展示密钥

### 2. 密钥格式

- Forge API密钥：通常以 `sk-` 开头
- JWT密钥：可以是任何随机字符串（建议32位以上）
- 微信AppSecret：通常是32位的字母数字组合

### 3. 如果密钥丢失

- **Forge API密钥**：登录控制台，删除旧密钥，创建新密钥
- **JWT密钥**：重新生成一个即可（但会导致已登录用户需要重新登录）
- **微信AppSecret**：在微信公众平台重置（但需要重新配置）

---

## 🎯 快速检查清单

创建 `.env` 文件前，确保您已经准备好：

- [ ] Forge API密钥（用于AI对话）
- [ ] JWT密钥（自己生成）
- [ ] 微信AppSecret（用于微信登录，可选）
- [ ] 数据库连接字符串（如果有数据库，可选）

---

## 💡 如果暂时没有密钥

### 只测试AI功能

最少需要：
```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的Forge API密钥
```

### 只测试微信登录

最少需要：
```env
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret
```

### 只测试基本功能

可以暂时不配置，但某些功能会无法使用。

---

## 📞 获取帮助

如果遇到问题：

1. **Forge API**：查看 https://forge.manus.im 的帮助文档
2. **微信小程序**：查看 https://developers.weixin.qq.com 的文档
3. **项目问题**：查看项目中的其他指南文档
