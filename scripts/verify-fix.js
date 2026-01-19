import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取 dist 目录路径
const distPath = process.argv[2] || path.resolve(__dirname, '../dist');

console.log('验证 API URL 空格修复情况...');
console.log(`目标目录: ${distPath}\n`);

if (!fs.existsSync(distPath)) {
  console.error(`错误: 目录不存在 ${distPath}`);
  console.log('\n使用方法:');
  console.log('  node scripts/verify-fix.js [dist目录路径]');
  process.exit(1);
}

let filesWithSpaces = [];
let totalSpaces = 0;

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查所有可能的空格情况
    const patterns = [
      /er1\.store\s+/g,           // er1.store 后的空格
      /er1\.store%20/g,           // URL编码的空格
      /"https:\/\/er1\.store\s+"/g,  // 引号内的空格
      /'https:\/\/er1\.store\s+'/g,  // 单引号内的空格
    ];
    
    let fileHasSpaces = false;
    let fileSpaceCount = 0;
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        fileHasSpaces = true;
        fileSpaceCount += matches.length;
      }
    }
    
    if (fileHasSpaces) {
      filesWithSpaces.push({
        path: path.relative(distPath, filePath),
        count: fileSpaceCount
      });
      totalSpaces += fileSpaceCount;
    }
    
    return fileHasSpaces;
  } catch (error) {
    console.error(`错误检查文件 ${filePath}: ${error.message}`);
    return false;
  }
}

function checkFiles(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        checkFiles(fullPath);
      } else if (file.name.endsWith('.js')) {
        checkFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`错误读取目录 ${dir}: ${error.message}`);
  }
}

checkFiles(distPath);

console.log('');
if (filesWithSpaces.length === 0) {
  console.log('✓ 验证通过！未发现包含空格的 URL');
  console.log('');
  console.log('下一步：');
  console.log('1. 在微信开发者工具中清除缓存');
  console.log('2. 重新编译项目');
  console.log('3. 测试登录功能');
} else {
  console.log('⚠ 发现以下文件仍包含空格：');
  console.log('');
  filesWithSpaces.forEach(file => {
    console.log(`  - ${file.path}: ${file.count} 处空格`);
  });
  console.log('');
  console.log(`总共发现 ${totalSpaces} 处空格需要修复`);
  console.log('');
  console.log('请按照《方法1-全局搜索替换详细步骤.md》中的步骤进行修复');
}
