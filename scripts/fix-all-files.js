import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取 dist 目录路径，如果没有提供则使用默认值
const distPath = process.argv[2] || path.resolve(__dirname, '../dist');

console.log('开始修复 API URL 空格问题...');
console.log(`目标目录: ${distPath}\n`);

if (!fs.existsSync(distPath)) {
  console.error(`错误: 目录不存在 ${distPath}`);
  console.log('\n使用方法:');
  console.log('  node scripts/fix-all-files.js [dist目录路径]');
  console.log('\n例如:');
  console.log('  node scripts/fix-all-files.js "D:\\your-project\\dist"');
  console.log('\n或者如果 dist 在项目根目录:');
  console.log('  node scripts/fix-all-files.js');
  process.exit(1);
}

let fixedFiles = 0;
let totalReplacements = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;
    
    // 统计修复前的空格数量
    const beforeMatches = content.match(/er1\.store\s+/g);
    if (beforeMatches && beforeMatches.length > 0) {
      console.log(`处理: ${path.relative(distPath, filePath)}`);
      console.log(`  发现 ${beforeMatches.length} 处包含空格的 URL`);
      
      // 修复所有可能的空格情况
      // 1. 修复 er1.store 后的空格
      const matches1 = content.match(/https:\/\/er1\.store\s+/g);
      if (matches1) fileReplacements += matches1.length;
      content = content.replace(/https:\/\/er1\.store\s+/g, 'https://er1.store');
      
      // 2. 修复引号内的空格
      content = content.replace(/("https:\/\/er1\.store)\s+(")/g, '$1$2');
      content = content.replace(/('https:\/\/er1\.store)\s+(')/g, "$1$2");
      
      // 3. 修复变量赋值中的空格
      content = content.replace(/(\w+\s*[:=]\s*["']https:\/\/er1\.store)\s+(["'])/g, '$1$2');
      
      // 4. 修复 apiBaseUrl 配置中的空格
      content = content.replace(/(apiBaseUrl\s*[:=]\s*["']https:\/\/er1\.store)\s+(["'])/gi, '$1$2');
      
      // 5. 修复 URL 拼接中的空格
      content = content.replace(/("https:\/\/er1\.store)\s+(\/["'])/g, '$1$2');
      
      // 6. 修复模板字符串中的空格
      content = content.replace(/(`https:\/\/er1\.store)\s+(\/)/g, '$1$2');
      
      // 7. 修复 %20 编码的空格（URL编码）
      const matches7 = content.match(/er1\.store%20/g);
      if (matches7) fileReplacements += matches7.length;
      content = content.replace(/er1\.store%20/g, 'er1.store');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles++;
        
        // 验证修复
        const afterMatches = content.match(/er1\.store\s+/g);
        if (!afterMatches || afterMatches.length === 0) {
          console.log(`  ✓ 已修复所有空格 (${fileReplacements} 处)`);
        } else {
          console.log(`  ⚠ 警告: 仍有 ${afterMatches.length} 处包含空格的 URL`);
        }
        totalReplacements += fileReplacements;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`  ✗ 错误处理文件 ${filePath}: ${error.message}`);
    return false;
  }
}

function findAndFixFiles(dir) {
  let found = 0;
  
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        found += findAndFixFiles(fullPath);
      } else if (file.name.endsWith('.js')) {
        if (fixFile(fullPath)) {
          found++;
        }
      }
    }
  } catch (error) {
    console.error(`错误读取目录 ${dir}: ${error.message}`);
  }
  
  return found;
}

const found = findAndFixFiles(distPath);

console.log('');
if (fixedFiles > 0) {
  console.log('✓ 修复完成！');
  console.log(`  修复了 ${fixedFiles} 个文件`);
  console.log(`  共替换了 ${totalReplacements} 处空格`);
  console.log('');
  console.log('下一步操作:');
  console.log('1. 在微信开发者工具中清除缓存（工具 → 清除缓存 → 清除全部）');
  console.log('2. 重新编译项目');
  console.log('3. 检查控制台，确认 URL 不再包含 %20');
} else {
  console.log('⚠ 未发现需要修复的文件');
  console.log('');
  console.log('可能的原因:');
  console.log('1. dist 目录路径不正确');
  console.log('2. 文件已经被修复');
  console.log('3. 空格可能在其他位置（环境变量、配置文件等）');
  console.log('');
  console.log('请提供您的 dist 目录完整路径，例如:');
  console.log('  node scripts/fix-all-files.js "D:\\your-project\\dist"');
}
