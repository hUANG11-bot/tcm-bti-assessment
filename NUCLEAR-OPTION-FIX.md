# 核选项：彻底解决微信开发者工具缓存问题

## ❌ 问题确认

微信开发者工具**持续使用缓存的旧文件**，即使：
- ✅ 编译后的代码正确（9302字符，不包含 `loginFn`）
- ✅ 已清理所有缓存
- ✅ 已更新文件时间戳
- ✅ 已重新导入项目

**错误仍然显示**：
- ❌ 第13013个字符处缺少分号（文件只有9302字符）
- ❌ 包含 `loginFn`（旧代码）

## ✅ 核选项解决方案

### 方案1：修改项目配置强制刷新（推荐）

微信开发者工具可能根据 `project.config.json` 中的项目路径或ID来缓存文件。修改这些值可以强制它重新加载：

**步骤**：

1. **关闭微信开发者工具**

2. **修改项目配置**：

```powershell
cd d:\tcm-bti-assessment

# 备份原配置
Copy-Item dist\project.config.json dist\project.config.json.bak

# 修改项目ID（添加时间戳）
$config = Get-Content dist\project.config.json -Raw | ConvertFrom-Json
$config.projectname = "tcm-bti-assessment-$(Get-Date -Format 'yyyyMMddHHmmss')"
$config | ConvertTo-Json -Depth 10 | Set-Content dist\project.config.json -Encoding UTF8
```

3. **重新导入项目**：
   - 打开微信开发者工具
   - 删除旧项目
   - 导入 `d:\tcm-bti-assessment\dist`
   - 填写 AppID：`wx9811089020af2ae3`

### 方案2：使用不同的项目目录

复制 `dist` 到新位置，强制微信开发者工具重新加载：

```powershell
cd d:\tcm-bti-assessment

# 创建新的项目目录
$newPath = "d:\tcm-bti-assessment-dist-$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item -Recurse dist $newPath

Write-Host "新项目目录: $newPath"
```

然后在微信开发者工具中导入新目录。

### 方案3：修改 app.json 强制刷新

修改 `app.json` 中的某些配置可以触发重新加载：

```powershell
cd d:\tcm-bti-assessment

# 修改 app.json（添加注释或修改版本号）
$appJson = Get-Content dist\app.json -Raw | ConvertFrom-Json
# 如果存在 version 字段，修改它
if ($appJson.version) {
    $appJson.version = "$($appJson.version).$(Get-Date -Format 'HHmmss')"
} else {
    $appJson | Add-Member -NotePropertyName "version" -NotePropertyValue "1.0.$(Get-Date -Format 'HHmmss')"
}
$appJson | ConvertTo-Json -Depth 10 | Set-Content dist\app.json -Encoding UTF8
```

### 方案4：完全重置微信开发者工具

如果以上方法都不行，完全重置微信开发者工具：

1. **关闭微信开发者工具**

2. **删除所有相关目录**：

```powershell
# 微信开发者工具数据目录
$wechatData = "$env:APPDATA\微信开发者工具"
if (Test-Path $wechatData) {
    Remove-Item -Recurse -Force $wechatData
}

# 微信开发者工具本地数据目录
$wechatLocal = "$env:LOCALAPPDATA\微信开发者工具"
if (Test-Path $wechatLocal) {
    Remove-Item -Recurse -Force $wechatLocal
}

# 项目缓存
cd d:\tcm-bti-assessment
if (Test-Path .wx) {
    Remove-Item -Recurse -Force .wx
}
```

3. **重新打开微信开发者工具**（会重新初始化）

4. **重新导入项目**

---

## 🚀 立即执行（推荐顺序）

**先尝试方案1**（最简单）：

```powershell
cd d:\tcm-bti-assessment

# 1. 关闭微信开发者工具
Get-Process -Name "wechatdevtools" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. 修改项目配置
$config = Get-Content dist\project.config.json -Raw | ConvertFrom-Json
$config.projectname = "tcm-bti-assessment-$(Get-Date -Format 'yyyyMMddHHmmss')"
$config | ConvertTo-Json -Depth 10 | Set-Content dist\project.config.json -Encoding UTF8

Write-Host "已修改项目配置，请在微信开发者工具中重新导入项目"
```

**如果方案1不行，尝试方案2**（使用新目录）。

**如果都不行，使用方案4**（完全重置）。

---

**请先尝试方案1！**
