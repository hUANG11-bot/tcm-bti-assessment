# JWT密钥生成指南

## 🎯 什么是JWT密钥？

JWT密钥用于加密用户登录信息，确保用户会话安全。**不需要从外部获取，可以自己生成！**

## 🚀 快速生成（推荐方法）

### 方法1：使用脚本生成（最简单）⭐

在项目根目录运行：

```bash
pnpm generate-jwt
```

或者：

```bash
tsx scripts/generate-jwt-secret.ts
```

脚本会自动生成一个安全的JWT密钥，并显示配置方法。

---

### 方法2：使用Node.js命令生成

如果已安装Node.js，在命令行运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

会输出类似：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

### 方法3：使用PowerShell生成（Windows）

打开PowerShell，运行：

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

### 方法4：在线生成器

1. 访问：https://www.random.org/strings/
2. 设置参数：
   - **长度**：32
   - **字符集**：选择"字母和数字"
3. 点击"生成"
4. 复制生成的随机字符串

---

### 方法5：自己写一个（最简单但不够安全）

如果只是测试，可以随便写一个足够长的字符串：

```
my_jwt_secret_key_2024_very_long_string_123456
```

⚠️ **注意**：生产环境建议使用方法1或方法2生成更安全的密钥。

---

## 📝 配置到项目

生成密钥后，将其添加到 `.env` 文件：

```env
JWT_SECRET=你生成的密钥
```

**示例**：
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## ✅ 验证配置

配置完成后，重启服务：

```bash
pnpm dev
```

如果服务正常启动，说明JWT密钥配置成功！

---

## 🔍 如何检查JWT密钥是否已配置？

查看 `.env` 文件，确认是否有 `JWT_SECRET=` 这一行。

如果没有，按照上面的方法生成并添加。

---

## ⚠️ 重要提示

1. **不要泄露JWT密钥**：这是敏感信息，不要分享给他人
2. **不要提交到代码仓库**：确保 `.env` 文件在 `.gitignore` 中
3. **生产环境**：建议使用脚本生成（方法1），更安全
4. **测试环境**：可以使用简单字符串（方法5），但生产环境不建议

---

## 🎉 就这么简单！

JWT密钥不需要从外部获取，自己生成即可。推荐使用 `pnpm generate-jwt` 命令，一键生成！
