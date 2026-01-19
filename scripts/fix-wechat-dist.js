import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 微信开发者工具的 dist 目录路径（需要用户根据实际情况修改）
const distPaths = [
  path.resolve(__dirname, '../dist'),
  // 如果 dist 在其他位置，可以添加更多路径
];

function fixApiUrlInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 修复所有可能的 URL 空格问题
    // 1. 修复 er1.store 后的空格
    content = content.replace(/https:\/\/er1\.store\s+/g, 'https://er1.store');
    
    // 2. 修复 apiBaseUrl 配置中的空格
    content = content.replace(/(apiBaseUrl\s*[:=]\s*["']https:\/\/er1\.store)\s+(["'])/g, '$1$2');
    
    // 3. 修复 URL 字符串中的空格
    content = content.replace(/(["']https:\/\/er1\.store)\s+(["'])/g, '$1$2');
    
    // 4. 修复变量赋值中的空格
    content = content.replace(/(\w+\s*=\s*["']https:\/\/er1\.store)\s+(["'])/g, '$1$2');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
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
  
  if (!fs.existsSync(dir)) {
    return 0;
  }
  
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

console.log('开始修复微信小程序 dist 目录中的 API URL 空格问题...\n');

let totalFixed = 0;

for (const distPath of distPaths) {
  if (fs.existsSync(distPath)) {
    console.log(`检查目录: ${distPath}`);
    const fixed = findAndFixFiles(distPath);
    totalFixed += fixed;
    if (fixed > 0) {
      console.log(`  修复了 ${fixed} 个文件\n`);
    } else {
      console.log(`  未发现需要修复的文件\n`);
    }
  } else {
    console.log(`目录不存在: ${distPath}\n`);
  }
}

if (totalFixed > 0) {
  console.log(`\n✓ 修复完成！共修复 ${totalFixed} 个文件`);
  console.log('\n下一步：');
  console.log('1. 在微信开发者工具中清除缓存（工具 → 清除缓存 → 清除全部）');
  console.log('2. 重新编译项目');
} else {
  console.log('\n⚠ 未发现需要修复的文件');
  console.log('\n可能的原因：');
  console.log('1. dist 目录不存在或为空（需要先编译）');
  console.log('2. 文件已经被修复');
  console.log('3. 配置在微信开发者工具的项目设置中，需要手动修复');
  console.log('\n请按照《紧急修复-API-URL空格.md》中的方法2或方法3进行修复');
}
