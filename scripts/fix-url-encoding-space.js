import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取 dist 目录路径
const distPath = process.argv[2] || path.resolve(__dirname, '../dist');

console.log('修复 URL 编码空格问题（%20）...');
console.log(`目标目录: ${distPath}\n`);

if (!fs.existsSync(distPath)) {
  console.error(`错误: 目录不存在 ${distPath}`);
  console.log('\n使用方法:');
  console.log('  node scripts/fix-url-encoding-space.js [dist目录路径]');
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
      {
        pattern: /er1\.store%20/g,
        replacement: 'er1.store',
        name: 'URL编码空格 (%20)'
      },
      {
        pattern: /er1\.store\s+/g,
        replacement: 'er1.store',
        name: '普通空格'
      },
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
      {
        pattern: /`https:\/\/er1\.store\s+`/g,
        replacement: '`https://er1.store`',
        name: '模板字符串内的空格'
      },
      {
        pattern: /(apiBaseUrl\s*[:=]\s*["'`]https:\/\/er1\.store)\s+(["'`])/gi,
        replacement: '$1$2',
        name: 'apiBaseUrl 配置中的空格'
      },
      {
        pattern: /(url\s*[:=]\s*["'`]https:\/\/er1\.store)\s+(["'`])/gi,
        replacement: '$1$2',
        name: 'url 配置中的空格'
      },
      {
        pattern: /(baseURL\s*[:=]\s*["'`]https:\/\/er1\.store)\s+(["'`])/gi,
        replacement: '$1$2',
        name: 'baseURL 配置中的空格'
      },
      // 修复 URL 拼接中的空格
      {
        pattern: /("https:\/\/er1\.store)\s+(\/)/g,
        replacement: '$1$2',
        name: 'URL 拼接中的空格'
      },
      {
        pattern: /('https:\/\/er1\.store)\s+(\/)/g,
        replacement: "$1$2",
        name: '单引号 URL 拼接中的空格'
      },
      {
        pattern: /(`https:\/\/er1\.store)\s+(\/)/g,
        replacement: '$1$2',
        name: '模板字符串 URL 拼接中的空格'
      },
    ];
    
    let hasChanges = false;
    
    for (const { pattern, replacement, name } of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`  - 发现 ${matches.length} 处 ${name}`);
        content = content.replace(pattern, replacement);
        fileReplacements += matches.length;
        hasChanges = true;
      }
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
        
        if (fixFile(fullPath)) {
          found++;
          console.log(`修复: ${relativePath}`);
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
  console.log('3. 空格可能在运行时从环境变量或配置中读取');
  console.log('');
  console.log('请检查:');
  console.log('1. 环境变量 TARO_APP_API_URL 是否有空格');
  console.log('2. project.config.json 中的配置是否有空格');
  console.log('3. 微信开发者工具的本地设置中是否有空格');
}
