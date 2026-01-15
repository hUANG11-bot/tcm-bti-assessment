# 部署后端到 er1.store 完整指南

## 📋 部署前准备

### 服务器信息
- **域名**：`er1.store`
- **IP 地址**：`81.70.105.197`
- **DNS 解析**：✅ 正常

### 需要准备的内容
1. ✅ 服务器 SSH 访问权限
2. ✅ 服务器 root 或 sudo 权限
3. ✅ 环境变量配置（`.env` 文件）
4. ✅ SSL 证书（Let's Encrypt 或其他）

---

## 🚀 完整部署步骤

### 步骤1：连接到服务器

**使用 SSH 连接到服务器**：

```bash
ssh root@81.70.105.197
# 或使用您的用户名
ssh username@81.70.105.197
```

---

### 步骤2：安装必要软件

#### 2.1 安装 Node.js（如果未安装）

```bash
# 使用 NodeSource 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2.2 安装 pnpm

```bash
npm install -g pnpm
pnpm --version
```

#### 2.3 安装 PM2（进程管理器，推荐）

```bash
npm install -g pm2
pm2 --version
```

#### 2.4 安装 Nginx（反向代理）

```bash
sudo apt-get update
sudo apt-get install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### 步骤3：上传代码到服务器

#### 方法1：使用 Git（推荐）

**在服务器上**：

```bash
# 创建项目目录
mkdir -p /var/www/tcm-bti-assessment
cd /var/www/tcm-bti-assessment

# 克隆代码（如果有 Git 仓库）
git clone <your-repo-url> .

# 或直接上传代码文件
```

#### 方法2：使用 SCP 上传

**在本地 PowerShell 中**：

```powershell
# 上传整个项目（排除 node_modules 和 dist）
scp -r -o "StrictHostKeyChecking=no" d:\tcm-bti-assessment\* root@81.70.105.197:/var/www/tcm-bti-assessment/
```

---

### 步骤4：在服务器上构建项目

**在服务器上**：

```bash
cd /var/www/tcm-bti-assessment

# 安装依赖
pnpm install

# 构建后端
pnpm build

# 验证构建结果
ls -la dist/
# 应该看到 dist/index.js
```

---

### 步骤5：配置环境变量

**在服务器上创建 `.env` 文件**：

```bash
cd /var/www/tcm-bti-assessment
nano .env
```

**添加以下配置**：

```env
# 数据库配置
DATABASE_URL=mysql://root:huangte1991,,@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment

# 微信小程序配置
WX_APPID=您的微信AppID
WX_SECRET=您的微信AppSecret

# JWT 密钥
JWT_SECRET=您的JWT密钥

# AI 服务配置
AI_PROVIDER=deepseek
AI_API_KEY=您的DeepSeek API密钥

# 服务器配置
NODE_ENV=production
PORT=3000

# OAuth 配置（可选）
OAUTH_SERVER_URL=https://er1.store
```

**保存文件**（`Ctrl+O`，然后 `Ctrl+X`）

---

### 步骤6：配置 SSL 证书

#### 6.1 安装 Certbot

```bash
sudo apt-get update
sudo apt-get install -y certbot
```

#### 6.2 申请 Let's Encrypt 证书

```bash
# 停止 Nginx（如果正在运行）
sudo systemctl stop nginx

# 申请证书
sudo certbot certonly --standalone -d er1.store -d www.er1.store

# 按照提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款（输入 A）
# 3. 是否分享邮箱（输入 Y 或 N）
```

**成功后会显示**：
```
Certificate is saved at: /etc/letsencrypt/live/er1.store/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/er1.store/privkey.pem
```

#### 6.3 设置自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# 设置自动续期（每月1号和15号）
sudo crontab -e
# 添加以下行：
0 3 1,15 * * certbot renew --quiet && systemctl reload nginx
```

---

### 步骤7：配置 Nginx 反向代理

**创建 Nginx 配置文件**：

```bash
sudo nano /etc/nginx/sites-available/er1.store
```

**添加以下配置**：

```nginx
server {
    listen 80;
    server_name er1.store www.er1.store;
    
    # 重定向 HTTP 到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name er1.store www.er1.store;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/er1.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/er1.store/privkey.pem;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 反向代理到 Node.js 后端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**启用配置**：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/er1.store /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

---

### 步骤8：启动后端服务

#### 方法1：使用 PM2（推荐）

```bash
cd /var/www/tcm-bti-assessment

# 使用 PM2 启动服务
pm2 start dist/index.js --name tcm-bti-api

# 设置开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status
pm2 logs tcm-bti-api
```

#### 方法2：使用 systemd

**创建 systemd 服务文件**：

```bash
sudo nano /etc/systemd/system/tcm-bti-api.service
```

**添加以下内容**：

```ini
[Unit]
Description=TCM BTI Assessment API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/tcm-bti-assessment
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**启动服务**：

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start tcm-bti-api

# 设置开机自启
sudo systemctl enable tcm-bti-api

# 查看状态
sudo systemctl status tcm-bti-api
```

---

### 步骤9：配置防火墙

**开放必要端口**：

```bash
# 如果使用 ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 如果使用 firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

### 步骤10：验证部署

#### 10.1 检查服务状态

```bash
# 检查 Node.js 服务
pm2 status
# 或
sudo systemctl status tcm-bti-api

# 检查 Nginx
sudo systemctl status nginx

# 检查端口
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :443
```

#### 10.2 测试 API

**在本地 PowerShell 中**：

```powershell
# 测试健康检查端点
Invoke-WebRequest -Uri "https://er1.store/api/trpc/system.health" -Method GET
```

**应该返回**：
```json
{"ok":true}
```

#### 10.3 在浏览器中访问

访问：`https://er1.store`

应该能看到后端服务响应。

---

## 📋 部署检查清单

- [ ] Node.js 已安装（v20+）
- [ ] pnpm 已安装
- [ ] PM2 已安装（或 systemd 已配置）
- [ ] Nginx 已安装并配置
- [ ] SSL 证书已申请并配置
- [ ] 代码已上传到服务器
- [ ] 依赖已安装（`pnpm install`）
- [ ] 项目已构建（`pnpm build`）
- [ ] `.env` 文件已配置
- [ ] 后端服务已启动
- [ ] Nginx 反向代理已配置
- [ ] 防火墙端口已开放
- [ ] API 可以正常访问

---

## 🔧 常用管理命令

### PM2 管理

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs tcm-bti-api

# 重启服务
pm2 restart tcm-bti-api

# 停止服务
pm2 stop tcm-bti-api

# 删除服务
pm2 delete tcm-bti-api
```

### systemd 管理

```bash
# 查看状态
sudo systemctl status tcm-bti-api

# 重启服务
sudo systemctl restart tcm-bti-api

# 停止服务
sudo systemctl stop tcm-bti-api

# 查看日志
sudo journalctl -u tcm-bti-api -f
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 🚀 快速部署脚本

**在服务器上创建部署脚本**：

```bash
cd /var/www/tcm-bti-assessment
nano deploy.sh
```

**添加以下内容**：

```bash
#!/bin/bash
set -e

echo "开始部署..."

# 拉取最新代码（如果使用 Git）
# git pull

# 安装依赖
echo "安装依赖..."
pnpm install

# 构建项目
echo "构建项目..."
pnpm build

# 重启服务
echo "重启服务..."
pm2 restart tcm-bti-api

# 重新加载 Nginx
echo "重新加载 Nginx..."
sudo systemctl reload nginx

echo "部署完成！"
```

**设置执行权限并运行**：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ⚠️ 重要提示

### 1. 环境变量安全

- ✅ 不要将 `.env` 文件提交到 Git
- ✅ 使用强密码和密钥
- ✅ 定期更新密钥

### 2. 服务监控

- ✅ 使用 PM2 监控服务状态
- ✅ 设置日志轮转
- ✅ 监控服务器资源使用

### 3. 备份

- ✅ 定期备份数据库
- ✅ 备份代码和配置文件
- ✅ 备份 SSL 证书

---

## 🎯 部署完成后

### 1. 在微信公众平台配置合法域名

1. 登录：https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置
3. 服务器域名 → request 合法域名
4. 添加：`https://er1.store`
5. 保存

### 2. 验证小程序连接

1. 在微信开发者工具中打开小程序
2. 查看控制台，应该看到：`[tRPC] API Base URL: https://er1.store`
3. 测试 API 连接

---

**请按照上述步骤操作，如果遇到问题，告诉我具体的错误信息！**
