# 快速获取密钥指南

## 🔑 需要获取的密钥

### 1. Forge API密钥（AI对话功能）

**获取步骤**：
1. 访问：https://forge.manus.im
2. 注册账号（使用邮箱）
3. 登录后，在控制台找到"API Keys"
4. 点击"Create API Key"
5. 复制密钥（类似：`sk-xxxxxxxxxxxxx`）

**配置**：
```env
BUILT_IN_FORGE_API_KEY=sk-你复制的密钥
```

---

### 2. JWT密钥（用户登录加密）

**不需要从外部获取，自己生成即可！**

**生成方法**（选一种）：

#### 方法1：在线生成（最简单）
1. 访问：https://www.random.org/strings/
2. 设置：长度32，字符集选择"字母和数字"
3. 点击"生成"
4. 复制生成的字符串

#### 方法2：自己写一个
随便写一个足够长的字符串，例如：
```
my_secret_key_2024_very_long_string_123456
```

**配置**：
```env
JWT_SECRET=你生成的随机字符串
```

---

### 3. 微信AppSecret（微信登录功能）

**获取步骤**：
1. 访问：https://mp.weixin.qq.com
2. 登录小程序账号
3. 进入：开发 → 开发管理 → 开发设置
4. 找到"AppSecret（小程序密钥）"
5. 如果未设置，点击"生成"
6. 复制密钥（只显示一次！）

**配置**：
```env
WX_SECRET=你复制的AppSecret
```

---

## 📝 完整的 .env 文件示例

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret

# AI服务配置
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的Forge API密钥

# JWT密钥（自己生成）
JWT_SECRET=随便写一个长字符串即可

# 数据库配置（可选）
DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

---

## ⚠️ 重要提示

1. **Forge API密钥**：必须从网站获取
2. **JWT密钥**：可以自己生成，不需要从外部获取
3. **微信AppSecret**：必须从微信公众平台获取
4. **所有密钥**：不要分享给他人，不要提交到代码仓库

---

## 🎯 最小配置（仅测试AI功能）

如果只想测试AI对话，最少需要：

```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=你的Forge API密钥
```

JWT密钥可以暂时不配置（但用户登录功能可能受影响）。
