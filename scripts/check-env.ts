/**
 * 检查 .env 文件配置
 * 使用方法: tsx scripts/check-env.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const requiredConfigs: EnvConfig[] = [
  {
    name: 'WX_APPID',
    required: true,
    description: '微信小程序AppID',
  },
  {
    name: 'WX_SECRET',
    required: true,
    description: '微信小程序AppSecret',
  },
  {
    name: 'AI_PROVIDER',
    required: false,
    description: 'AI服务提供商（deepseek、qwen、openai等）',
  },
  {
    name: 'AI_API_KEY',
    required: true,
    description: 'AI服务API密钥',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT密钥（用于用户登录加密）',
  },
];

const optionalConfigs: EnvConfig[] = [
  {
    name: 'DATABASE_URL',
    required: false,
    description: '数据库连接URL',
  },
  {
    name: 'TARO_APP_API_URL',
    required: false,
    description: 'API服务器地址（默认：http://localhost:3000）',
  },
];

function checkEnvFile() {
  const envPath = join(process.cwd(), '.env');
  
  console.log('🔍 正在检查 .env 文件配置...\n');

  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');
    const envMap = new Map<string, string>();

    // 解析 .env 文件
    envLines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envMap.set(key.trim(), valueParts.join('=').trim());
        }
      }
    });

    console.log('📋 配置检查结果：\n');

    let hasErrors = false;
    let hasWarnings = false;

    // 检查必需配置
    console.log('✅ 必需配置：');
    requiredConfigs.forEach((config) => {
      const value = envMap.get(config.name);
      if (!value || value === '') {
        console.log(`   ❌ ${config.name}: 未配置 - ${config.description}`);
        if (config.required) {
          hasErrors = true;
        }
      } else {
        // 隐藏敏感信息，只显示前4个字符
        const displayValue = value.length > 8 
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
          : '***';
        console.log(`   ✅ ${config.name}: 已配置 (${displayValue})`);
      }
    });

    console.log('\n📝 可选配置：');
    optionalConfigs.forEach((config) => {
      const value = envMap.get(config.name);
      if (!value || value === '') {
        console.log(`   ⚠️  ${config.name}: 未配置 - ${config.description}`);
        hasWarnings = true;
      } else {
        console.log(`   ✅ ${config.name}: 已配置`);
      }
    });

    // 检查AI服务配置
    console.log('\n🤖 AI服务配置：');
    const aiProvider = envMap.get('AI_PROVIDER') || 'deepseek';
    const aiApiKey = envMap.get('AI_API_KEY');
    
    if (aiApiKey) {
      console.log(`   ✅ 使用 ${aiProvider} 服务`);
      console.log(`   ✅ API密钥已配置`);
    } else {
      console.log(`   ❌ AI服务未配置`);
      hasErrors = true;
    }

    // 总结
    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
      console.log('❌ 发现必需配置缺失，请补充后重试');
      console.log('\n💡 提示：');
      console.log('   - 查看 HOW-TO-CREATE-ENV.md 了解如何配置');
      console.log('   - 运行 pnpm generate-jwt 生成JWT密钥');
      console.log('   - 查看 DEEPSEEK-SETUP.md 配置AI服务');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  配置基本完整，但有一些可选配置未设置');
      console.log('   可以继续使用，但某些功能可能受限');
      console.log('\n✅ 可以启动服务了！');
      console.log('   运行: pnpm dev');
    } else {
      console.log('✅ 所有配置检查通过！');
      console.log('\n🚀 可以启动服务了：');
      console.log('   1. 启动后端: pnpm dev');
      console.log('   2. 启动小程序: pnpm dev:weapp');
    }
    console.log('='.repeat(50) + '\n');

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('❌ .env 文件不存在！\n');
      console.log('💡 请先创建 .env 文件：');
      console.log('   1. 在项目根目录创建 .env 文件');
      console.log('   2. 参考 HOW-TO-CREATE-ENV.md 添加配置');
      console.log('   3. 或运行 pnpm generate-jwt 生成JWT密钥');
      process.exit(1);
    } else {
      console.error('❌ 读取 .env 文件失败:', error.message);
      process.exit(1);
    }
  }
}

checkEnvFile();
