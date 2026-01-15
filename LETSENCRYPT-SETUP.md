# Let's Encrypt证书详细操作指南

## 📋 前提条件

在开始之前，请确保：
- ✅ 您有一个域名（如：er1.store）
- ✅ 域名已经解析到您的服务器IP地址
- ✅ 服务器可以访问（80端口或443端口开放）
- ✅ 有服务器root权限或sudo权限

---

## 🪟 Windows系统操作步骤

### 方案A：使用WSL（Windows Subsystem for Linux）推荐

#### 步骤1：安装WSL

1. **打开PowerShell（管理员权限）**
   ```powershell
   # 运行以下命令安装WSL
   wsl --install
   ```

2. **重启电脑**（安装完成后）

3. **打开Ubuntu**（从开始菜单）

#### 步骤2：在WSL中安装Certbot

```bash
# 更新软件包列表
sudo apt-get update

# 安装Certbot
sudo apt-get install certbot
```

#### 步骤3：申请证书

```bash
# 替换 yourdomain.com 为您的实际域名
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 例如，如果域名是 er1.store：
sudo certbot certonly --standalone -d er1.store -d www.er1.store
```

**按提示操作：**
1. 输入邮箱地址（用于接收续期提醒）
2. 同意服务条款（输入 `A`）
3. 选择是否分享邮箱（输入 `Y` 或 `N`）
4. 等待验证完成

#### 步骤4：获取证书文件

证书文件保存在：
```bash
# 查看证书位置
ls -la /etc/letsencrypt/live/yourdomain.com/

# 查看证书内容
sudo cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem

# 查看私钥内容
sudo cat /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### 步骤5：复制证书内容

```bash
# 复制证书内容到剪贴板（Windows）
sudo cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem | clip.exe

# 复制私钥内容到剪贴板
sudo cat /etc/letsencrypt/live/yourdomain.com/privkey.pem | clip.exe
```

---

### 方案B：直接在Linux服务器上操作（如果有）

如果您有Linux服务器，直接SSH连接后操作：

```bash
# 1. 安装Certbot
sudo apt-get update
sudo apt-get install certbot

# 2. 申请证书
sudo certbot certonly --standalone -d yourdomain.com

# 3. 查看证书
sudo cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem
sudo cat /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

---

## 🐧 Linux服务器详细步骤

### 步骤1：连接到服务器

```bash
# SSH连接到您的服务器
ssh root@your-server-ip
# 或
ssh username@your-server-ip
```

### 步骤2：安装Certbot

**Ubuntu/Debian系统：**
```bash
# 更新软件包
sudo apt-get update

# 安装Certbot
sudo apt-get install certbot
```

**CentOS/RHEL系统：**
```bash
# 安装EPEL仓库
sudo yum install epel-release

# 安装Certbot
sudo yum install certbot
```

**验证安装：**
```bash
certbot --version
```

### 步骤3：确保端口开放

```bash
# 检查80端口是否开放（Let's Encrypt验证需要）
sudo netstat -tuln | grep :80

# 如果使用防火墙，开放80和443端口
# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤4：申请证书

#### 方式1：自动验证（推荐，需要域名已解析）

```bash
# 单个域名
sudo certbot certonly --standalone -d yourdomain.com

# 多个域名（主域名+www）
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 多个子域名
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

**操作流程：**
1. **输入邮箱**：用于接收证书到期提醒
   ```
   Enter email address (used for urgent renewal and security notices)
   ```
2. **同意服务条款**：输入 `A` 表示同意
   ```
   (A)gree/(C)ancel: A
   ```
3. **是否分享邮箱**：输入 `Y` 或 `N`
   ```
   (Y)es/(N)o: Y
   ```
4. **等待验证**：Certbot会自动验证域名所有权
5. **完成**：看到 "Successfully received certificate" 表示成功

#### 方式2：手动验证（域名未解析时使用）

```bash
sudo certbot certonly --manual -d yourdomain.com
```

**操作流程：**
1. 输入邮箱和同意条款（同上）
2. Certbot会显示一个验证字符串
3. 在您的域名DNS中添加TXT记录
4. 等待DNS传播（可能需要几分钟到几小时）
5. 按回车继续验证

### 步骤5：查看证书文件

```bash
# 证书文件位置
/etc/letsencrypt/live/yourdomain.com/

# 查看文件列表
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
```

**重要文件说明：**
- `fullchain.pem` - **完整证书链**（上传这个作为证书）
- `privkey.pem` - **私钥**（上传这个作为私钥）
- `cert.pem` - 证书（不包含中间证书）
- `chain.pem` - 中间证书

### 步骤6：查看证书内容

```bash
# 查看证书内容（复制这个上传）
sudo cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem

# 查看私钥内容（复制这个上传）
sudo cat /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**证书内容格式：**
```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAK...
（多行Base64编码内容）
...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAK...
（中间证书）
...
-----END CERTIFICATE-----
```

**私钥内容格式：**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0B...
（多行Base64编码内容）
...
-----END PRIVATE KEY-----
```

### 步骤7：复制证书到本地（如果需要）

**方法1：使用SCP（从Windows复制到服务器）**

```powershell
# 在Windows PowerShell中
# 先安装OpenSSH客户端（如果没有）
Add-WindowsCapability -Online -Name OpenSSH.Client

# 从服务器复制证书到本地
scp root@your-server-ip:/etc/letsencrypt/live/yourdomain.com/fullchain.pem .\certificate.pem
scp root@your-server-ip:/etc/letsencrypt/live/yourdomain.com/privkey.pem .\private.key
```

**方法2：直接在服务器上查看并复制**

```bash
# 在服务器上查看并手动复制内容
sudo cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# 复制全部内容（包括BEGIN和END标记）

sudo cat /etc/letsencrypt/live/yourdomain.com/privkey.pem
# 复制全部内容（包括BEGIN和END标记）
```

---

## 🔄 证书续期设置

Let's Encrypt证书有效期90天，需要定期续期。

### 测试续期

```bash
# 测试续期（不会真正续期）
sudo certbot renew --dry-run
```

### 手动续期

```bash
# 手动续期所有证书
sudo certbot renew
```

### 自动续期设置

```bash
# 编辑crontab
sudo crontab -e

# 添加以下行（每月1号和15号凌晨3点自动续期）
0 3 1,15 * * certbot renew --quiet

# 或者每天检查一次（更安全）
0 3 * * * certbot renew --quiet
```

**说明：**
- `--quiet`：静默模式，只在需要续期时输出
- 续期后需要重启使用证书的服务（如Nginx、Apache等）

---

## 📤 上传证书到平台

### 步骤1：准备证书内容

1. **打开证书文件** `fullchain.pem`
2. **复制全部内容**，包括：
   - `-----BEGIN CERTIFICATE-----`
   - 中间的所有Base64编码内容
   - `-----END CERTIFICATE-----`
   - 如果有多个证书块，全部复制

3. **打开私钥文件** `privkey.pem`
4. **复制全部内容**，包括：
   - `-----BEGIN PRIVATE KEY-----`
   - 中间的所有Base64编码内容
   - `-----END PRIVATE KEY-----`

### 步骤2：上传到平台

在"绑定自定义域名"对话框中：

1. **点击"上传签名证书"**
   - 粘贴刚才复制的证书内容（fullchain.pem的全部内容）
   - 或点击上传按钮选择证书文件

2. **点击"上传签名私钥"**
   - 粘贴刚才复制的私钥内容（privkey.pem的全部内容）
   - 或点击上传按钮选择私钥文件

3. **确认HTTPS开关已开启**（绿色）

4. **点击"确定"**完成绑定

---

## ⚠️ 常见问题解决

### 问题1：端口80被占用

**错误信息：**
```
Error: Problem binding to port 80: Could not bind to IPv4 or IPv6
```

**解决方法：**
```bash
# 检查80端口占用
sudo netstat -tuln | grep :80

# 停止占用80端口的服务（如Apache、Nginx）
sudo systemctl stop apache2
# 或
sudo systemctl stop nginx

# 申请证书后再启动服务
sudo certbot certonly --standalone -d yourdomain.com
sudo systemctl start nginx
```

### 问题2：域名未解析

**错误信息：**
```
Failed to verify ownership of domain
```

**解决方法：**
1. 检查域名DNS解析是否正确
   ```bash
   # 检查域名解析
   nslookup yourdomain.com
   # 或
   dig yourdomain.com
   ```

2. 确保域名解析到服务器IP
3. 等待DNS传播（可能需要几分钟到几小时）

### 问题3：防火墙阻止

**解决方法：**
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 问题4：证书申请失败

**检查清单：**
- [ ] 域名是否正确
- [ ] 域名是否已解析到服务器
- [ ] 80端口是否开放
- [ ] 服务器能否访问外网
- [ ] 是否使用了正确的sudo权限

---

## 🔍 验证证书

### 查看证书信息

```bash
# 查看证书详细信息
sudo openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# 查看证书有效期
sudo openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates
```

### 在线验证

访问以下网站验证证书：
- https://www.ssllabs.com/ssltest/
- 输入您的域名，查看证书状态

---

## 📝 完整操作示例

假设您的域名是 `er1.store`，服务器IP是 `123.456.789.0`：

```bash
# 1. 连接到服务器
ssh root@123.456.789.0

# 2. 安装Certbot
sudo apt-get update
sudo apt-get install certbot

# 3. 申请证书
sudo certbot certonly --standalone -d er1.store -d www.er1.store

# 4. 查看证书
sudo cat /etc/letsencrypt/live/er1.store/fullchain.pem
sudo cat /etc/letsencrypt/live/er1.store/privkey.pem

# 5. 设置自动续期
sudo crontab -e
# 添加：0 3 1,15 * * certbot renew --quiet
```

---

## ✅ 操作检查清单

完成以下步骤后，您就成功获取了Let's Encrypt证书：

- [ ] 域名已解析到服务器IP
- [ ] 服务器80端口已开放
- [ ] 已安装Certbot
- [ ] 成功申请证书（看到 "Successfully received certificate"）
- [ ] 已查看证书文件位置
- [ ] 已复制证书内容（fullchain.pem）
- [ ] 已复制私钥内容（privkey.pem）
- [ ] 已设置自动续期（可选但推荐）
- [ ] 已上传证书到平台

---

## 💡 提示

1. **证书有效期**：Let's Encrypt证书有效期90天，建议设置自动续期
2. **证书位置**：证书文件在 `/etc/letsencrypt/live/yourdomain.com/`
3. **上传文件**：上传 `fullchain.pem`（不是 `cert.pem`），包含完整证书链
4. **私钥安全**：私钥文件非常重要，不要泄露给他人
5. **续期提醒**：Certbot会发送邮件提醒证书即将到期

完成以上步骤后，您就可以成功使用Let's Encrypt免费SSL证书了！🎉
