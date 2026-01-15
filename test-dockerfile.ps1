# 本地测试 Dockerfile 脚本

Write-Host "========================================"
Write-Host "本地测试 Dockerfile"
Write-Host "========================================"
Write-Host ""

# 检查 Docker 是否安装
Write-Host "检查 Docker..."
try {
    docker --version | Out-Null
    Write-Host "✓ Docker 已安装" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker 未安装，请先安装 Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 创建临时目录
$tempDir = "docker-test-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null
Write-Host "创建临时目录: $tempDir" -ForegroundColor Yellow

# 复制必要文件
Write-Host "复制文件..."
New-Item -ItemType Directory -Path "$tempDir\dist" | Out-Null
Copy-Item dist\index.js "$tempDir\dist\index.js"
Copy-Item -Recurse server "$tempDir\server"
Copy-Item -Recurse shared "$tempDir\shared"
Copy-Item package.json "$tempDir\package.json"
Copy-Item Dockerfile "$tempDir\Dockerfile"
Write-Host "✓ 文件复制完成" -ForegroundColor Green

Write-Host ""

# 构建 Docker 镜像
Write-Host "开始构建 Docker 镜像..."
Write-Host "（这可能需要几分钟时间）"
Write-Host ""

Set-Location $tempDir

try {
    docker build -t tcm-bti-test:local .
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "✓ 构建成功！" -ForegroundColor Green
    Write-Host "========================================"
    Write-Host ""
    Write-Host "如果本地构建成功，说明 Dockerfile 本身没问题。"
    Write-Host "可能是云托管环境的问题，建议联系技术支持。"
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "✗ 构建失败" -ForegroundColor Red
    Write-Host "========================================"
    Write-Host ""
    Write-Host "请查看上面的错误信息，我可以根据错误修复 Dockerfile。"
    Write-Host ""
}

# 清理
Set-Location ..
Remove-Item -Recurse -Force $tempDir
Write-Host "清理临时文件完成" -ForegroundColor Yellow
