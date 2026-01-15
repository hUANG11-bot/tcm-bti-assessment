/**
 * 微信登录功能诊断工具
 * 使用方法: tsx scripts/diagnose-wechat-login.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 微信登录功能诊断工具\n');
console.log('='.repeat(50) + '\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量配置...\n');

const wxAppId = process.env.WX_APPID;
const wxSecret = process.env.WX_SECRET;
const apiUrl = process.env.TARO_APP_API_URL;

if (wxAppId) {
  console.log(`   ✅ WX_APPID: ${wxAppId.substring(0, 8)}...${wxAppId.substring(wxAppId.length - 4)}`);
} else {
  console.log('   ❌ WX_APPID: 未配置');
}

if (wxSecret) {
  console.log(`   ✅ WX_SECRET: ${wxSecret.substring(0, 4)}...${wxSecret.substring(wxSecret.length - 4)} (已配置)`);
} else {
  console.log('   ❌ WX_SECRET: 未配置 - 这是导致登录失败的主要原因！');
}

if (apiUrl) {
  console.log(`   ✅ TARO_APP_API_URL: ${apiUrl}`);
} else {
  console.log('   ⚠️  TARO_APP_API_URL: 未配置（将使用默认值）');
}

console.log('\n');

// 2. 检查配置文件
console.log('2️⃣ 检查配置文件...\n');

const configPath = resolve(process.cwd(), 'config/index.js');
if (existsSync(configPath)) {
  const configContent = readFileSync(configPath, 'utf-8');
  if (configContent.includes('TARO_APP_API_URL')) {
    console.log('   ✅ config/index.js 中包含 TARO_APP_API_URL 配置');
    
    // 提取API地址
    const match = configContent.match(/TARO_APP_API_URL.*?['"]([^'"]+)['"]/);
    if (match) {
      console.log(`   📍 配置的API地址: ${match[1]}`);
    }
  } else {
    console.log('   ❌ config/index.js 中未找到 TARO_APP_API_URL 配置');
  }
} else {
  console.log('   ❌ config/index.js 文件不存在');
}

console.log('\n');

// 3. 检查后端代码
console.log('3️⃣ 检查后端代码...\n');

const wechatLoginPath = resolve(process.cwd(), 'server/api/wechat-login.ts');
if (existsSync(wechatLoginPath)) {
  console.log('   ✅ server/api/wechat-login.ts 文件存在');
  
  const codeContent = readFileSync(wechatLoginPath, 'utf-8');
  
  if (codeContent.includes('/api/wechat/login')) {
    console.log('   ✅ 登录接口路由已定义');
  }
  
  if (codeContent.includes('WX_APPID')) {
    console.log('   ✅ 代码中读取 WX_APPID');
  }
  
  if (codeContent.includes('WX_SECRET')) {
    console.log('   ✅ 代码中读取 WX_SECRET');
  }
} else {
  console.log('   ❌ server/api/wechat-login.ts 文件不存在');
}

// 检查路由注册
const indexPath = resolve(process.cwd(), 'server/_core/index.ts');
if (existsSync(indexPath)) {
  const indexContent = readFileSync(indexPath, 'utf-8');
  if (indexContent.includes('/api/wechat')) {
    console.log('   ✅ 路由已注册到 /api/wechat');
  } else {
    console.log('   ❌ 路由未注册到 /api/wechat');
  }
}

console.log('\n');

// 4. 检查前端代码
console.log('4️⃣ 检查前端代码...\n');

const profilePath = resolve(process.cwd(), 'src/pages/profile/index.tsx');
if (existsSync(profilePath)) {
  console.log('   ✅ src/pages/profile/index.tsx 文件存在');
  
  const profileContent = readFileSync(profilePath, 'utf-8');
  
  if (profileContent.includes('handleWechatLogin')) {
    console.log('   ✅ 微信登录处理函数已定义');
  }
  
  if (profileContent.includes('/api/wechat/login')) {
    console.log('   ✅ 前端代码调用 /api/wechat/login 接口');
  }
  
  if (profileContent.includes('TARO_APP_API_URL')) {
    console.log('   ✅ 前端代码使用 TARO_APP_API_URL');
  }
} else {
  console.log('   ❌ src/pages/profile/index.tsx 文件不存在');
}

console.log('\n');

// 5. 诊断结果和建议
console.log('5️⃣ 诊断结果和建议...\n');

let hasErrors = false;
let hasWarnings = false;

if (!wxSecret) {
  console.log('   ❌ 严重问题：WX_SECRET 未配置');
  console.log('      → 这是导致登录失败的主要原因');
  console.log('      → 解决方法：');
  console.log('         1. 登录微信公众平台：https://mp.weixin.qq.com');
  console.log('         2. 开发 → 开发管理 → 开发设置');
  console.log('         3. 生成或重置 AppSecret');
  console.log('         4. 在 .env 文件中添加：WX_SECRET=你的AppSecret');
  console.log('         5. 重启后端服务\n');
  hasErrors = true;
}

if (!wxAppId) {
  console.log('   ❌ 严重问题：WX_APPID 未配置');
  console.log('      → 解决方法：在 .env 文件中添加：WX_APPID=你的AppID\n');
  hasErrors = true;
}

if (!apiUrl) {
  console.log('   ⚠️  警告：TARO_APP_API_URL 未配置');
  console.log('      → 将使用默认值（开发环境：localhost:3000，生产环境：https://er1.store）');
  console.log('      → 建议：在 .env 文件中明确配置 API 地址\n');
  hasWarnings = true;
}

// 6. 测试建议
console.log('6️⃣ 测试建议...\n');

console.log('   1. 确认后端服务正在运行：');
console.log('      → 运行 pnpm dev 启动后端服务');
console.log('      → 应该看到：Server running on http://localhost:3000/\n');

console.log('   2. 重新编译小程序：');
console.log('      → 运行 pnpm dev:weapp');
console.log('      → 或使用微信开发者工具重新编译\n');

console.log('   3. 在微信开发者工具中：');
console.log('      → 详情 → 本地设置 → 勾选"不校验合法域名"');
console.log('      → 清除缓存 → 清除所有缓存');
console.log('      → 重新编译\n');

console.log('   4. 测试登录：');
console.log('      → 打开"我的"页面');
console.log('      → 点击"微信一键登录"');
console.log('      → 查看控制台日志\n');

// 总结
console.log('='.repeat(50) + '\n');

if (hasErrors) {
  console.log('❌ 发现严重问题，请先解决上述问题后再测试登录功能\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  配置基本完整，但有一些警告，建议检查上述建议\n');
  console.log('✅ 可以尝试测试登录功能\n');
} else {
  console.log('✅ 配置检查通过！\n');
  console.log('💡 如果登录仍然失败，请：');
  console.log('   1. 查看后端日志（启动 pnpm dev 后的控制台输出）');
  console.log('   2. 查看小程序控制台（微信开发者工具 → 调试器 → Console）');
  console.log('   3. 检查网络连接和API地址是否正确\n');
}

console.log('='.repeat(50) + '\n');
