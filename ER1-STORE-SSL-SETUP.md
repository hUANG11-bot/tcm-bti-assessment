# er1.store SSL证书申请指南

## 📋 当前状态

根据网络检测结果：
- **域名**：`www.er1.store`
- **解析IP**：`81.70.105.197`
- **状态**：域名已正确解析 ✅

---

## 🎯 快速操作步骤

### 步骤1：连接到服务器

```bash
# SSH连接到您的服务器（IP: 81.70.105.197）
ssh root@81.70.105.197
# 或使用您的用户名
ssh username@81.70.105.197
```

### 步骤2：安装Certbot

```bash
# 更新软件包
sudo apt-get update

# 安装Certbot
sudo apt-get install certbot

# 验证安装
certbot --version
```

### 步骤3：确保端口开放

```bash
# 检查80端口是否开放
sudo netstat -tuln | grep :80

# 如果使用防火墙，开放80和443端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# 或
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤4：申请证书

```bash
# 为 er1.store 和 www.er1.store 申请证书
sudo certbot certonly --standalone -d er1.store -d www.er1.store
```

**操作提示：**
1. 输入邮箱地址（用于接收续期提醒）
2. 同意服务条款：输入 `A`
3. 是否分享邮箱：输入 `Y` 或 `N`
4. 等待验证完成

**成功标志：**
看到以下信息表示成功：
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/er1.store/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/er1.store/privkey.pem
```

### 步骤5：查看证书文件

```bash
# 查看证书文件列表
sudo ls -la /etc/letsencrypt/live/er1.store/

# 查看证书内容（复制这个上传）
sudo cat /etc/letsencrypt/live/er1.store/fullchain.pem

# 查看私钥内容（复制这个上传）
sudo cat /etc/letsencrypt/live/er1.store/privkey.pem
```

### 步骤6：设置自动续期

```bash
# 编辑定时任务
sudo crontab -e

# 添加以下行（每月1号和15号凌晨3点自动续期）
0 3 1,15 * * certbot renew --quiet
```

---

## 📤 上传证书到平台

### 准备证书内容

1. **复制证书内容**：
   ```bash
   sudo cat /etc/letsencrypt/live/er1.store/fullchain.pem
   ```
   - 复制**全部内容**（包括 `-----BEGIN CERTIFICATE-----` 和 `-----END CERTIFICATE-----`）
   - 如果有多个证书块，全部复制

2. **复制私钥内容**：
   ```bash
   sudo cat /etc/letsencrypt/live/er1.store/privkey.pem
   ```
   - 复制**全部内容**（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）

### 上传步骤

在"绑定自定义域名"对话框中：

1. **域名**：输入 `er1.store` 或 `www.er1.store`
2. **关联服务**：选择对应的服务
3. **HTTPS**：确保开关已开启（绿色）
4. **上传签名证书**：
   - 粘贴刚才复制的 `fullchain.pem` 的全部内容
5. **上传签名私钥**：
   - 粘贴刚才复制的 `privkey.pem` 的全部内容
6. **点击"确定"**完成绑定

---

## ⚠️ 可能遇到的问题

### 问题1：端口80被占用

如果遇到端口被占用错误：

```bash
# 检查80端口占用
sudo netstat -tuln | grep :80

# 临时停止占用80端口的服务
sudo systemctl stop nginx
# 或
sudo systemctl stop apache2

# 申请证书
sudo certbot certonly --standalone -d er1.store -d www.er1.store

# 申请完成后重启服务
sudo systemctl start nginx
```

### 问题2：验证失败

如果验证失败，检查：

```bash
# 1. 确认域名解析正确
nslookup er1.store
nslookup www.er1.store

# 2. 确认服务器IP是 81.70.105.197
# 3. 确认80端口可以从外网访问
# 4. 等待DNS传播（可能需要几分钟）
```

### 问题3：防火墙阻止

```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 🔍 验证证书

### 查看证书信息

```bash
# 查看证书详细信息
sudo openssl x509 -in /etc/letsencrypt/live/er1.store/fullchain.pem -text -noout

# 查看证书有效期
sudo openssl x509 -in /etc/letsencrypt/live/er1.store/fullchain.pem -noout -dates
```

### 在线验证

申请成功后，访问以下网站验证：
- https://www.ssllabs.com/ssltest/
- 输入 `er1.store` 或 `www.er1.store` 查看证书状态

---

## 📝 完整命令示例

```bash
# 1. 连接到服务器
ssh root@81.70.105.197

# 2. 安装Certbot
sudo apt-get update
sudo apt-get install certbot

# 3. 开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. 申请证书
sudo certbot certonly --standalone -d er1.store -d www.er1.store

# 5. 查看证书
sudo cat /etc/letsencrypt/live/er1.store/fullchain.pem
sudo cat /etc/letsencrypt/live/er1.store/privkey.pem

# 6. 设置自动续期
sudo crontab -e
# 添加：0 3 1,15 * * certbot renew --quiet
```

---

## ✅ 检查清单

完成以下步骤：

- [ ] 已连接到服务器 (81.70.105.197)
- [ ] 已安装Certbot
- [ ] 80和443端口已开放
- [ ] 成功申请证书（看到 "Successfully received certificate"）
- [ ] 已复制证书内容（fullchain.pem）
- [ ] 已复制私钥内容（privkey.pem）
- [ ] 已上传证书到平台
- [ ] 已设置自动续期

---

## 💡 重要提示

1. **证书位置**：`/etc/letsencrypt/live/er1.store/`
2. **上传文件**：使用 `fullchain.pem`（不是 `cert.pem`）
3. **证书有效期**：90天，建议设置自动续期
4. **域名覆盖**：证书同时覆盖 `er1.store` 和 `www.er1.store`

完成以上步骤后，您的域名就可以使用HTTPS了！🎉
