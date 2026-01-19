import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取 dist 目录路径
const distPath = process.argv[2] || path.resolve(__dirname, '../dist');

console.log('修复页面文件中的 API URL 空格问题...');
console.log(`目标目录: ${distPath}\n`);

if (!fs.existsSync(distPath)) {
  console.error(`错误: 目录不存在 ${distPath}`);
  console.log('\n使用方法:');
  console.log('  node scripts/fix-pages-api-url.js [dist目录路径]');
  process.exit(1);
}

let fixedFiles = 0;
let totalReplacements = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;
    
    // 检查所有可能的空格情况
    const patterns = [
      // URL 编码的空格
      {
        pattern: /er1\.store%20/g,
        replacement: 'er1.store',
        name: 'URL编码空格 (%20)'
      },
      // 普通空格
      {
        pattern: /er1\.store\s+/g,
        replacement: 'er1.store',
        name: '普通空格'
      },
      // 引号内的空格
      {
        pattern: /"https:\/\/er1\.store\s+"/g,
        replacement: '"https://er1.store"',
        name: '双引号内的空格'
      },
      {
        pattern: /'https:\/\/er1\.store\s+'/g,
        replacement: "'https://er1.store'",
        name: '单引号内的空格'
      },
      // URL 拼接中的空格（最常见的问题）
      {
        pattern: /("https:\/\/er1\.store)\s+("\/api)/g,
        replacement: '$1$2',
        name: 'URL 拼接中的空格（双引号）'
      },
      {
        pattern: /('https:\/\/er1\.store)\s+('\/api)/g,
        replacement: "$1$2",
        name: 'URL 拼接中的空格（单引号）'
      },
      {
        pattern: /(`https:\/\/er1\.store)\s+(\/api)/g,
        replacement: '$1$2',
        name: 'URL 拼接中的空格（模板字符串）'
      },
      // 变量拼接中的空格
      {
        pattern: /(\w+\s*\+\s*["']https:\/\/er1\.store)\s+(["'])/g,
        replacement: '$1$2',
        name: '变量拼接中的空格'
      },
      {
        pattern: /(["']https:\/\/er1\.store)\s+(\s*\+\s*)/g,
        replacement: '$1$2',
        name: 'URL 后拼接的空格'
      },
      // concat 方法中的空格
      {
        pattern: /\.concat\(["']https:\/\/er1\.store\s+["']/g,
        replacement: (match) => match.replace(/\s+/, ''),
        name: 'concat 方法中的空格'
      },
      // 模板字符串中的空格
      {
        pattern: /`\$\{.*?\}https:\/\/er1\.store\s+\/api/g,
        replacement: (match) => match.replace(/\s+/, ''),
        name: '模板字符串中的空格'
      },
    ];
    
    let hasChanges = false;
    
    for (const { pattern, replacement, name } of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`  - 发现 ${matches.length} 处 ${name}`);
        if (typeof replacement === 'function') {
          content = content.replace(pattern, replacement);
        } else {
          content = content.replace(pattern, replacement);
        }
        fileReplacements += matches.length;
        hasChanges = true;
      }
    }
    
    // 特殊处理：查找所有包含 er1.store 和 /api 的地方
    const urlPattern = /(https:\/\/er1\.store)\s+(\/api)/g;
    const urlMatches = content.match(urlPattern);
    if (urlMatches) {
      console.log(`  - 发现 ${urlMatches.length} 处 URL 拼接空格`);
      content = content.replace(urlPattern, '$1$2');
      fileReplacements += urlMatches.length;
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles++;
      totalReplacements += fileReplacements;
      console.log(`  ✓ 已修复 ${fileReplacements} 处`);
      return true;
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
        const relativePath = path.relative(distPath, fullPath);
        const beforeFix = fs.readFileSync(fullPath, 'utf8');
        
        // 只处理页面文件
        if (fullPath.includes('pages') || fullPath.includes('index.js')) {
          if (fixFile(fullPath)) {
            found++;
            console.log(`修复: ${relativePath}`);
          }
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
  console.log('请手动检查以下文件:');
  console.log('1. dist/pages/index/index.js');
  console.log('2. dist/pages/profile/index.js');
  console.log('3. 其他包含微信登录调用的页面文件');
  console.log('');
  console.log('在这些文件中搜索:');
  console.log('  - er1.store ');
  console.log('  - er1.store%20');
  console.log('  - er1.store + "/api"');
  console.log('  - "https://er1.store " + "/api"');
}
