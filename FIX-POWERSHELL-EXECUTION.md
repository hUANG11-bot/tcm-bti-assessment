# 解决 PowerShell 执行策略问题

## 🚨 当前问题

**错误信息**：
```
无法加载文件 ...\test-dockerfile.ps1,因为在此系统上禁止运行脚本
```

这是因为 Windows PowerShell 的执行策略限制了脚本运行。

---

## ✅ 解决方案

### 方案1：临时绕过执行策略（推荐，最简单）

**在 PowerShell 中运行**：

```powershell
# 临时允许运行脚本（仅本次会话）
powershell -ExecutionPolicy Bypass -File .\test-dockerfile.ps1
```

或者：

```powershell
# 使用 Set-ExecutionPolicy 临时设置
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\test-dockerfile.ps1
```

---

### 方案2：直接运行命令（无需脚本）

如果不想修改执行策略，可以直接运行命令：

```powershell
# 检查 Docker
docker --version

# 创建临时目录
$tempDir = "docker-test-temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path "$tempDir\dist" | Out-Null

# 复制文件
Copy-Item dist\index.js "$tempDir\dist\index.js"
Copy-Item -Recurse server "$tempDir\server"
Copy-Item -Recurse shared "$tempDir\shared"
Copy-Item package.json "$tempDir\package.json"
Copy-Item Dockerfile "$tempDir\Dockerfile"

# 构建测试
cd $tempDir
docker build -t tcm-bti-test:local .

# 查看结果
# 如果成功，会显示 "Successfully built"
# 如果失败，会显示具体错误信息

# 清理
cd ..
Remove-Item -Recurse -Force $tempDir
```

---

### 方案3：修改执行策略（需要管理员权限）

**以管理员身份运行 PowerShell**，然后：

```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 修改执行策略（仅当前用户）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后就可以运行脚本了
.\test-dockerfile.ps1
```

---

## 🚀 推荐操作

**最简单的方法**：使用方案1，临时绕过执行策略：

```powershell
powershell -ExecutionPolicy Bypass -File .\test-dockerfile.ps1
```

或者直接运行命令（方案2），不需要脚本。

---

## 📝 测试结果

**运行测试后，请告诉我**：

1. **测试结果**：
   - ✅ 成功
   - ❌ 失败

2. **如果失败，请提供**：
   - 完整的错误信息
   - 特别是 `npm install` 部分的输出

3. **如果成功，请告诉我**：
   - 我可以帮您联系技术支持
   - 或者尝试其他解决方案

---

## ✅ 下一步

**请选择一种方法运行测试**，然后告诉我结果！

有了测试结果，我可以快速解决问题。
