import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

function fixApiUrlInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 修复 er1.store 后的空格
    content = content.replace(/https:\/\/er1\.store\s+/g, 'https://er1.store');
    
    // 修复其他可能的URL空格问题
    content = content.replace(/(['"]https?:\/\/[^'"]+)\s+(['"])/g, '$1$2');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${path.relative(distDir, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findAndFixFiles(dir) {
  let fixedCount = 0;
  
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        fixedCount += findAndFixFiles(fullPath);
      } else if (file.name.endsWith('.js')) {
        if (fixApiUrlInFile(fullPath)) {
          fixedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fixedCount;
}

console.log('开始修复 API URL 空格问题...');
console.log(`目标目录: ${distDir}`);

if (!fs.existsSync(distDir)) {
  console.error(`错误: 目录不存在 ${distDir}`);
  console.log('请先运行: npm run build:weapp');
  process.exit(1);
}

const fixedCount = findAndFixFiles(distDir);

if (fixedCount > 0) {
  console.log(`\n✓ 修复完成！共修复 ${fixedCount} 个文件`);
  console.log('请重新在微信开发者工具中编译项目');
} else {
  console.log('\n✓ 未发现需要修复的文件（可能已经修复或不存在）');
}
