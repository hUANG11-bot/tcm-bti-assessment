# 最后手段：彻底解决微信开发者工具缓存问题

## ❌ 问题确认

**编译后的文件检查**：
- ✅ 文件长度：9303 字符
- ✅ **不包含 `loginFn`**（已确认）
- ✅ 源代码使用 `handleWechatLogin`（正确）

**但微信开发者工具错误信息显示**：
- ❌ 包含 `loginFn`（旧代码）
- ❌ 错误位置在第13013个字符处（文件只有9303字符）

**结论**：微信开发者工具**从某个隐藏位置加载了旧的编译文件**。

## 🔍 可能的原因

1. **微信开发者工具的内部编译缓存**
2. **临时目录中的旧文件**
3. **微信开发者工具的项目数据库**

## ✅ 最后手段解决方案

### 方案1：使用全新的项目目录（最有效）

**完全避开微信开发者工具的缓存机制**：

```powershell
cd d:\tcm-bti-assessment

# 1. 创建全新的项目目录
$newDistPath = "d:\tcm-bti-assessment-dist-new-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $newDistPath -Force | Out-Null

# 2. 重新编译到新目录
# 修改 config/index.js 中的 outputRoot 为临时目录
# 或者直接复制 dist 到新位置
Copy-Item -Recurse -Force dist $newDistPath

# 3. 修改项目配置
$configPath = Join-Path $newDistPath "project.config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$config.projectname = "tcm-bti-assessment-new-$(Get-Date -Format 'yyyyMMddHHmmss')"
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host "新项目目录: $newDistPath"
```

然后在微信开发者工具中导入**新目录**。

### 方案2：检查微信开发者工具的项目数据库

微信开发者工具可能将项目信息存储在数据库中：

```powershell
# 查找微信开发者工具的数据目录
$wechatDataDirs = @(
    "$env:APPDATA\微信开发者工具",
    "$env:LOCALAPPDATA\微信开发者工具",
    "$env:USERPROFILE\AppData\Roaming\微信开发者工具",
    "$env:USERPROFILE\AppData\Local\微信开发者工具"
)

foreach ($dir in $wechatDataDirs) {
    if (Test-Path $dir) {
        Write-Host "Found: $dir"
        # 查找数据库文件
        Get-ChildItem -Path $dir -Recurse -Filter "*.db" -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "  Database: $($_.FullName)"
        }
    }
}
```

### 方案3：完全卸载并重新安装微信开发者工具

如果以上方法都不行：

1. **卸载微信开发者工具**
2. **删除所有相关目录**（包括注册表项）
3. **重新安装微信开发者工具**
4. **重新导入项目**

---

## 🚀 立即执行（推荐方案1）

**创建全新的项目目录**：

```powershell
cd d:\tcm-bti-assessment

# 1. 关闭微信开发者工具
Get-Process -Name "wechatdevtools" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# 2. 创建新目录
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$newDistPath = "d:\tcm-bti-assessment-dist-$timestamp"
New-Item -ItemType Directory -Path $newDistPath -Force | Out-Null

# 3. 重新编译
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm build:weapp:prod

# 4. 复制到新目录
Copy-Item -Recurse -Force dist\* $newDistPath

# 5. 修改项目配置
$configPath = Join-Path $newDistPath "project.config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$config.projectname = "tcm-bti-assessment-$timestamp"
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "新项目目录已创建: $newDistPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "1. 打开微信开发者工具" -ForegroundColor White
Write-Host "2. 导入项目: $newDistPath" -ForegroundColor White
Write-Host "3. 填写 AppID: wx9811089020af2ae3" -ForegroundColor White
Write-Host "4. 点击编译" -ForegroundColor White
Write-Host ""
```

---

**请执行方案1，使用全新的项目目录！**
