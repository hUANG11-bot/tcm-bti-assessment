// 创建简单的 tabBar 图标文件
const fs = require('fs')
const path = require('path')

// 创建一个简单的 81x81 像素的 PNG 图标（使用纯色）
// 由于无法直接生成 PNG，我们创建一个简单的占位文件说明

const iconsDir = path.resolve(__dirname, '../src/assets/images')

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 创建一个说明文件
const readme = `# TabBar 图标说明

这些图标文件需要是 81x81 像素的 PNG 格式。

当前使用占位符，请替换为实际图标：
- home.png / home-active.png: 首页图标
- history.png / history-active.png: 历史图标

图标要求：
- 尺寸：81x81 像素
- 格式：PNG
- 大小：建议每个图标 < 40KB
`

fs.writeFileSync(path.join(iconsDir, 'README.md'), readme)

console.log('图标目录已创建：', iconsDir)
console.log('请手动添加图标文件或使用在线工具生成')
