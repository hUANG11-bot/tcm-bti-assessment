import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 微信开发者工具的 dist 目录路径
// 用户需要根据实际路径修改这个值
const distPath = process.argv[2] || path.resolve(__dirname, '../dist');

console.log('开始修复 common.js 中的 API URL 空格问题...');
console.log(`目标目录: ${distPath}\n`);

if (!fs.existsSync(distPath)) {
  console.error(`错误: 目录不存在 ${distPath}`);
  console.log('\n使用方法:');
  console.log('  node scripts/fix-common-js-space.js [dist目录路径]');
  console.log('\n例如:');
  console.log('  node scripts/fix-common-js-space.js "D:\\your-project\\dist"');
  process.exit(1);
}

function fixCommonJs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixed = false;
    
    // 记录修复前的状态
    const beforeMatches = content.match(/er1\.store\s+/g);
    if (beforeMatches) {
      console.log(`  发现 ${beforeMatches.length} 处包含空格的 URL`);
    }
    
    // 1. 修复所有 er1.store 后的空格（包括引号内外的）
    content = content.replace(/https:\/\/er1\.store\s+/g, 'https://er1.store');
    
    // 2. 修复引号内的空格
    content = content.replace(/(["'])https:\/\/er1\.store\s+\1/g, '$1https://er1.store$1');
    
    // 3. 修复变量赋值中的空格
    content = content.replace(/(\w+\s*[:=]\s*["']https:\/\/er1\.store)\s+(["'])/g, '$1$2');
    
    // 4. 修复 apiBaseUrl 配置中的空格
    content = content.replace(/(apiBaseUrl\s*[:=]\s*["']https:\/\/er1\.store)\s+(["'])/gi, '$1$2');
    
    // 5. 修复 URL 拼接中的空格
    content = content.replace(/(["']https:\/\/er1\.store)\s+([/"'])/g, '$1$2');
    
    // 6. 修复模板字符串中的空格
    content = content.replace(/(`https:\/\/er1\.store)\s+(\/)/g, '$1$2');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixed = true;
      
      // 验证修复
      const afterMatches = content.match(/er1\.store\s+/g);
      if (afterMatches) {
        console.log(`  ⚠ 警告: 仍有 ${afterMatches.length} 处包含空格的 URL`);
      } else {
        console.log(`  ✓ 已修复所有空格`);
      }
    } else {
      console.log(`  ℹ 未发现需要修复的内容`);
    }
    
    return fixed;
  } catch (error) {
    console.error(`  ✗ 错误: ${error.message}`);
    return false;
  }
}

function findCommonJs(dir) {
  const commonJsPath = path.join(dir, 'common.js');
  
  if (fs.existsSync(commonJsPath)) {
    console.log(`找到 common.js: ${commonJsPath}`);
    return fixCommonJs(commonJsPath);
  }
  
  // 递归搜索
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const result = findCommonJs(path.join(dir, file.name));
        if (result) return result;
      }
    }
  } catch (error) {
    // 忽略错误，继续搜索
  }
  
  return false;
}

const fixed = findCommonJs(distPath);

if (fixed) {
  console.log('\n✓ 修复完成！');
  console.log('\n下一步操作:');
  console.log('1. 在微信开发者工具中清除缓存（工具 → 清除缓存 → 清除全部）');
  console.log('2. 重新编译项目');
  console.log('3. 检查控制台，确认 URL 不再包含 %20');
} else {
  console.log('\n⚠ 未找到 common.js 文件或文件无需修复');
  console.log('\n请确认:');
  console.log('1. dist 目录路径是否正确');
  console.log('2. 是否已经编译了项目');
  console.log('3. 空格可能在其他文件中，请检查所有 .js 文件');
}
