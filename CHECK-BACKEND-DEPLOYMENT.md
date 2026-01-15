# 如何检查后端是否已部署到 er1.store

## 🔍 检查方法

### 方法1：使用浏览器访问（最简单）

**在浏览器中访问**：

```
https://er1.store
```

或者：

```
https://er1.store/api/trpc/system.health
```

**结果判断**：
- ✅ **如果能看到页面或 JSON 响应**：后端已部署
- ❌ **如果显示"连接失败"或"无法访问"**：后端未部署或无法访问

---

### 方法2：使用 PowerShell 检查（推荐）

#### 检查1：DNS 解析

**在 PowerShell 中运行**：

```powershell
nslookup er1.store
```

**结果判断**：
- ✅ **如果返回 IP 地址**（例如：`81.70.105.197`）：域名解析正常
- ❌ **如果显示"找不到"或超时**：域名解析有问题

#### 检查2：测试 HTTP 连接

**在 PowerShell 中运行**：

```powershell
# 测试 HTTP 连接
Test-NetConnection -ComputerName er1.store -Port 80

# 测试 HTTPS 连接
Test-NetConnection -ComputerName er1.store -Port 443
```

**结果判断**：
- ✅ **如果显示 `TcpTestSucceeded : True`**：端口可以连接
- ❌ **如果显示 `TcpTestSucceeded : False`**：端口无法连接

#### 检查3：测试 API 端点

**在 PowerShell 中运行**：

```powershell
# 测试健康检查端点
Invoke-WebRequest -Uri "https://er1.store/api/trpc/system.health" -Method GET
```

**结果判断**：
- ✅ **如果返回状态码 200 和 JSON 数据**：后端已部署且正常运行
- ❌ **如果显示错误或超时**：后端未部署或无法访问

---

### 方法3：使用 curl（如果已安装）

**在 PowerShell 中运行**：

```powershell
# 测试健康检查端点
curl https://er1.store/api/trpc/system.health
```

**结果判断**：
- ✅ **如果返回 JSON 数据**（例如：`{"ok":true}`）：后端已部署
- ❌ **如果显示错误**：后端未部署或无法访问

---

### 方法4：检查服务器状态（如果可访问服务器）

**如果可以直接访问服务器**：

1. **SSH 登录服务器**
2. **检查服务是否运行**：

```bash
# 检查 Node.js 进程
ps aux | grep node

# 检查端口是否被占用
netstat -tulpn | grep 3000
# 或
lsof -i :3000
```

3. **检查服务日志**：

```bash
# 如果使用 PM2
pm2 list
pm2 logs

# 如果使用 systemd
systemctl status your-service-name
```

---

## 🎯 快速检查命令

**在 PowerShell 中依次运行**：

```powershell
# 1. 检查 DNS 解析
nslookup er1.store

# 2. 测试 HTTPS 端口
Test-NetConnection -ComputerName er1.store -Port 443

# 3. 测试 API 端点（如果端口可以连接）
try {
    $response = Invoke-WebRequest -Uri "https://er1.store/api/trpc/system.health" -Method GET -TimeoutSec 5
    Write-Host "✅ 后端已部署！状态码: $($response.StatusCode)"
    Write-Host "响应内容: $($response.Content)"
} catch {
    Write-Host "❌ 后端未部署或无法访问"
    Write-Host "错误: $($_.Exception.Message)"
}
```

---

## 📋 检查结果判断

### ✅ 后端已部署（正常情况）

**应该看到**：
- DNS 解析返回 IP 地址
- 端口 443 可以连接
- API 端点返回 JSON 数据（例如：`{"ok":true}`）

### ❌ 后端未部署（当前情况）

**可能看到**：
- DNS 解析正常，但端口无法连接
- 浏览器显示"连接失败"
- API 请求超时或失败

---

## 🚀 立即检查

**在 PowerShell 中运行以下命令**：

```powershell
# 快速检查
Write-Host "1. 检查 DNS 解析..."
nslookup er1.store

Write-Host "`n2. 检查 HTTPS 端口..."
Test-NetConnection -ComputerName er1.store -Port 443

Write-Host "`n3. 测试 API 端点..."
try {
    $response = Invoke-WebRequest -Uri "https://er1.store/api/trpc/system.health" -Method GET -TimeoutSec 5
    Write-Host "✅ 后端已部署！"
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "❌ 后端未部署或无法访问"
    Write-Host "错误: $($_.Exception.Message)"
}
```

---

## 💡 根据检查结果操作

### 如果后端已部署但无法访问

**可能原因**：
- SSL 证书问题
- 防火墙/安全组未开放端口
- 服务未正常启动

**解决**：
- 检查服务器状态
- 检查防火墙配置
- 检查 SSL 证书

### 如果后端未部署

**建议**：
- 先切换回开发环境（使用本地后端）
- 或部署后端到 er1.store

---

**请运行上面的检查命令，然后告诉我结果，我会根据结果提供具体的解决方案！**
