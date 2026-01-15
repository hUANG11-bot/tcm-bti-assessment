# 创建部署压缩包脚本
# 使用方法：在项目根目录执行 .\create-deploy.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "创建云托管部署压缩包" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1：构建代码
Write-Host "[1/4] 构建后端代码..." -ForegroundColor Green
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！请检查错误信息。" -ForegroundColor Red
    exit 1
}

Write-Host "构建完成！" -ForegroundColor Green
Write-Host ""

# 步骤2：检查必需文件
Write-Host "[2/4] 检查必需文件..." -ForegroundColor Green

# 检查 dist/index.js（后端入口文件，必需）
if (-not (Test-Path "dist\index.js")) {
    Write-Host "" -ForegroundColor Red
    Write-Host "❌ 错误：dist/index.js 不存在！" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "请先执行后端构建：" -ForegroundColor Yellow
    Write-Host "  pnpm build" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Red
    Write-Host "构建命令会生成 dist/index.js 文件。" -ForegroundColor Yellow
    exit 1
}

# 检查其他必需文件
$requiredFiles = @(
    "package.json",
    "Dockerfile"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "缺少必需文件：" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✓ dist/index.js 存在" -ForegroundColor Green
Write-Host "✓ package.json 存在" -ForegroundColor Green
Write-Host "✓ Dockerfile 存在" -ForegroundColor Green
Write-Host "必需文件检查通过！" -ForegroundColor Green
Write-Host ""

# 步骤3：创建临时目录并复制文件
Write-Host "[3/4] 准备部署文件..." -ForegroundColor Green

$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 复制必需文件和目录
# 注意：只复制 dist/index.js，不复制整个 dist 目录（避免包含小程序文件）

# 1. 创建 dist 目录并只复制 index.js
New-Item -ItemType Directory -Path "$tempDir\dist" -Force | Out-Null
Copy-Item "dist\index.js" "$tempDir\dist\" -Force
Write-Host "  ✓ 已复制: dist/index.js" -ForegroundColor Gray

# 2. 复制其他文件和目录
$itemsToCopy = @(
    @{Path="server"; IsDirectory=$true},
    @{Path="shared"; IsDirectory=$true},
    @{Path="package.json"; IsDirectory=$false},
    @{Path="pnpm-lock.yaml"; IsDirectory=$false},
    @{Path="Dockerfile"; IsDirectory=$false}
)

foreach ($item in $itemsToCopy) {
    if (Test-Path $item.Path) {
        if ($item.IsDirectory) {
            Copy-Item -Recurse $item.Path $tempDir
            Write-Host "  ✓ 已复制目录: $($item.Path)" -ForegroundColor Gray
        } else {
            Copy-Item $item.Path $tempDir
            Write-Host "  ✓ 已复制文件: $($item.Path)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠ 文件/目录不存在: $($item.Path) (跳过)" -ForegroundColor Yellow
    }
}

Write-Host "文件准备完成！" -ForegroundColor Green
Write-Host ""

# 步骤4：创建压缩包
Write-Host "[4/4] 创建压缩包..." -ForegroundColor Green

$zipFile = "deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
    Write-Host "  已删除旧的压缩包" -ForegroundColor Gray
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# 清理临时目录
Remove-Item -Recurse -Force $tempDir

# 显示压缩包信息
$zipSize = (Get-Item $zipFile).Length / 1MB
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "压缩包位置: $PWD\$zipFile" -ForegroundColor Yellow
Write-Host "压缩包大小: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 登录微信公众平台" -ForegroundColor White
Write-Host "2. 进入：云服务 → 云开发 → 云托管 → 部署发布" -ForegroundColor White
Write-Host "3. 上传 $zipFile" -ForegroundColor White
Write-Host "4. 设置端口为 3000" -ForegroundColor White
Write-Host "5. 点击发布" -ForegroundColor White
Write-Host ""
