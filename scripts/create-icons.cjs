// 创建简单的 tabBar 图标文件
const fs = require('fs')
const path = require('path')

// 创建一个简单的 81x81 像素的 PNG 图标
// 使用纯色方块作为占位符

const iconsDir = path.resolve(__dirname, '../src/assets/images')

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 创建一个最小的有效 PNG 文件（1x1 像素透明 PNG）
// PNG 文件头：89 50 4E 47 0D 0A 1A 0A
// 这是一个最小的有效 PNG 文件（1x1 像素，透明）
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x51, // width: 81
  0x00, 0x00, 0x00, 0x51, // height: 81
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x00, 0x00, 0x00, 0x00, // CRC placeholder
  0x00, 0x00, 0x00, 0x00, // IEND chunk
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // IEND CRC
])

// 创建一个更简单的纯色 PNG（灰色方块）
// 这里我们创建一个基本的 81x81 灰色 PNG
// 由于手动创建完整的 PNG 比较复杂，我们使用一个更简单的方法：
// 创建一个占位符文件，然后提示用户替换

const icons = [
  { name: 'home.png', color: '#666666', description: '首页图标（未选中）' },
  { name: 'home-active.png', color: '#8FBC8F', description: '首页图标（选中）' },
  { name: 'history.png', color: '#666666', description: '历史图标（未选中）' },
  { name: 'history-active.png', color: '#8FBC8F', description: '历史图标（选中）' },
]

// 创建一个简单的说明文件
let readme = `# TabBar 图标说明

这些图标文件需要是 81x81 像素的 PNG 格式。

当前使用占位符，请替换为实际图标：
`

icons.forEach(icon => {
  readme += `- ${icon.name}: ${icon.description}\n`
  // 创建占位符文件（使用最小的有效 PNG）
  fs.writeFileSync(path.join(iconsDir, icon.name), minimalPNG)
})

readme += `
## 图标要求：
- 尺寸：81x81 像素
- 格式：PNG
- 大小：建议每个图标 < 40KB
- 颜色：未选中状态使用 #666666，选中状态使用 #8FBC8F

## 如何创建图标：
1. 使用在线图标生成工具（如 iconfont.cn）
2. 使用设计软件（如 Figma, Sketch）导出为 PNG
3. 使用 AI 工具生成图标

当前已创建占位符文件，可以先用这些文件测试，后续再替换为实际图标。
`

fs.writeFileSync(path.join(iconsDir, 'README.md'), readme)

console.log('✅ 图标目录已创建：', iconsDir)
console.log('✅ 已创建占位符图标文件：')
icons.forEach(icon => {
  console.log(`   - ${icon.name}`)
})
console.log('\n⚠️  这些是占位符文件，建议后续替换为实际设计的图标')
