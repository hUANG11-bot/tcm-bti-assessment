# SSL证书域名验证指南

## 📋 当前状态

根据您的证书管理界面：
- **证书状态**：验证域名（待完成）
- **截止时间**：2026-01-21 14:24:20
- **绑定域名**：er1.store
- **状态**：验证中 ⚠️

---

## 🎯 快速解决步骤

### 步骤1：查看验证详情

1. **点击"查看验证"按钮**
   - 在证书列表中，找到状态为"验证中"的证书
   - 点击"查看验证"或"查看详情"

2. **查看验证方式**
   - 平台会显示两种验证方式：
     - **DNS验证**（推荐）
     - **文件验证**

---

## 🔍 方式1：DNS验证（推荐）

### 步骤1：获取验证信息

在"查看验证"页面，您会看到类似以下信息：

```
验证类型：DNS验证
主机记录：_dnsauth
记录类型：TXT
记录值：xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤2：添加DNS记录

1. **登录您的域名管理平台**
   - 如果域名在阿里云：进入阿里云域名控制台
   - 如果域名在其他平台：登录对应的域名管理平台

2. **添加TXT记录**
   - **主机记录**：`_dnsauth`（或平台显示的完整主机记录）
   - **记录类型**：`TXT`
   - **记录值**：复制平台显示的完整记录值
   - **TTL**：默认值（通常600秒）

3. **保存记录**

### 步骤3：等待DNS传播

- DNS记录添加后，需要等待**5-30分钟**才能生效
- 可以使用以下命令检查DNS记录是否生效：

```bash
# Windows PowerShell
nslookup -type=TXT _dnsauth.er1.store

# Linux/Mac
dig TXT _dnsauth.er1.store
```

### 步骤4：在平台点击验证

DNS记录生效后：
1. 返回证书管理页面
2. 点击"验证"或"重新验证"按钮
3. 等待验证完成

---

## 📁 方式2：文件验证

如果选择文件验证方式：

### 步骤1：获取验证信息

平台会显示：
```
验证文件路径：/.well-known/pki-validation/fileauth.txt
验证文件内容：xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤2：创建验证文件

1. **连接到您的服务器**
   ```bash
   ssh root@81.70.105.197
   ```

2. **创建验证目录**
   ```bash
   mkdir -p /var/www/html/.well-known/pki-validation
   # 或如果使用Nginx
   mkdir -p /usr/share/nginx/html/.well-known/pki-validation
   ```

3. **创建验证文件**
   ```bash
   # 将平台显示的验证文件内容写入文件
   echo "验证文件内容" > /var/www/html/.well-known/pki-validation/fileauth.txt
   # 或
   echo "验证文件内容" > /usr/share/nginx/html/.well-known/pki-validation/fileauth.txt
   ```

4. **设置文件权限**
   ```bash
   chmod 644 /var/www/html/.well-known/pki-validation/fileauth.txt
   ```

5. **确保Web服务器可以访问**
   - 如果使用Nginx，确保配置允许访问 `.well-known` 目录
   - 如果使用Apache，通常默认可以访问

### 步骤3：测试验证文件

在浏览器中访问：
```
http://er1.store/.well-known/pki-validation/fileauth.txt
```

应该能看到验证文件内容。

### 步骤4：在平台点击验证

文件可访问后：
1. 返回证书管理页面
2. 点击"验证"或"重新验证"按钮
3. 等待验证完成

---

## ⚠️ 常见问题

### 问题1：DNS记录添加后验证失败

**可能原因：**
- DNS记录未生效（等待时间不够）
- 记录值复制错误（包含空格或换行）
- 主机记录格式错误

**解决方法：**
1. 等待10-30分钟后重试
2. 检查DNS记录是否正确：
   ```bash
   # 检查TXT记录
   nslookup -type=TXT _dnsauth.er1.store
   ```
3. 确保记录值完全一致（包括大小写）
4. 删除旧记录，重新添加

### 问题2：文件验证无法访问

**可能原因：**
- 文件路径错误
- Web服务器配置问题
- 文件权限问题

**解决方法：**
1. 检查文件是否存在：
   ```bash
   ls -la /var/www/html/.well-known/pki-validation/fileauth.txt
   ```
2. 检查文件内容：
   ```bash
   cat /var/www/html/.well-known/pki-validation/fileauth.txt
   ```
3. 检查Web服务器配置
4. 确保文件可以通过HTTP访问

### 问题3：验证超时

**截止时间**：2026-01-21 14:24:20

如果超过截止时间：
1. 证书申请会失败
2. 需要重新申请证书
3. 重新申请后会有新的验证信息

**建议：**
- 尽快完成验证（在截止时间前）
- 如果时间紧迫，优先使用DNS验证（通常更快）

---

## 📝 DNS验证详细步骤（以阿里云为例）

### 步骤1：登录阿里云域名控制台

1. 访问：https://dc.console.aliyun.com
2. 登录您的阿里云账号
3. 进入"域名" → "域名列表"

### 步骤2：找到域名并添加记录

1. **找到域名** `er1.store`
2. **点击"解析"**
3. **添加记录**：
   - 点击"添加记录"
   - **主机记录**：`_dnsauth`
   - **记录类型**：`TXT`
   - **记录值**：复制证书平台显示的完整记录值
   - **TTL**：10分钟（默认）
4. **保存**

### 步骤3：验证DNS记录

等待5-10分钟后，检查记录是否生效：

```bash
# Windows PowerShell
nslookup -type=TXT _dnsauth.er1.store

# 应该看到类似输出：
# _dnsauth.er1.store    text = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 步骤4：返回证书平台验证

1. 返回SSL证书管理页面
2. 点击"查看验证"
3. 点击"验证"或"重新验证"
4. 等待验证完成

---

## 📝 文件验证详细步骤

### 步骤1：获取验证信息

在证书平台的"查看验证"页面，记录：
- 验证文件路径
- 验证文件内容

### 步骤2：在服务器上创建文件

```bash
# 1. 连接到服务器
ssh root@81.70.105.197

# 2. 创建目录（根据您的Web服务器选择）
# Nginx
mkdir -p /usr/share/nginx/html/.well-known/pki-validation

# Apache
mkdir -p /var/www/html/.well-known/pki-validation

# 3. 创建验证文件（替换为实际的验证内容）
echo "实际的验证文件内容" > /usr/share/nginx/html/.well-known/pki-validation/fileauth.txt

# 4. 设置权限
chmod 644 /usr/share/nginx/html/.well-known/pki-validation/fileauth.txt
chown nginx:nginx /usr/share/nginx/html/.well-known/pki-validation/fileauth.txt
```

### 步骤3：配置Web服务器（如果需要）

**Nginx配置：**
```nginx
location /.well-known {
    allow all;
}
```

**Apache配置：**
通常默认允许访问，无需额外配置。

### 步骤4：测试访问

在浏览器中访问：
```
http://er1.store/.well-known/pki-validation/fileauth.txt
```

应该能看到验证文件内容。

### 步骤5：返回平台验证

1. 返回证书管理页面
2. 点击"验证"
3. 等待验证完成

---

## ✅ 验证检查清单

完成以下步骤：

- [ ] 已查看验证详情（点击"查看验证"）
- [ ] 已选择验证方式（DNS验证或文件验证）
- [ ] 已添加DNS记录（如果选择DNS验证）
- [ ] 已创建验证文件（如果选择文件验证）
- [ ] 已测试验证信息可访问
- [ ] 已在平台点击"验证"按钮
- [ ] 验证状态已变为"验证通过"
- [ ] 证书状态已变为"已签发"

---

## ⏰ 时间提醒

**重要截止时间**：2026-01-21 14:24:20

请在截止时间前完成验证，否则：
- 证书申请会失败
- 需要重新申请
- 会生成新的验证信息

---

## 💡 推荐方案

**优先使用DNS验证**，因为：
- ✅ 不需要访问服务器
- ✅ 验证速度通常更快
- ✅ 操作更简单
- ✅ 不需要配置Web服务器

**使用文件验证的情况**：
- DNS管理平台无法访问
- 需要快速验证（如果服务器已配置好）

---

## 🔄 验证完成后

验证通过后：
1. 证书状态会变为"已签发"
2. 可以下载证书文件
3. 下载后上传到您的平台（绑定自定义域名时使用）

---

完成验证后，您的SSL证书就可以使用了！🎉
