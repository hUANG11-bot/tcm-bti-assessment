/**
 * 测试AI服务配置
 * 使用方法: tsx scripts/test-ai.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });

async function testDeepSeekAPI() {
  const apiKey = process.env.AI_API_KEY;
  const provider = process.env.AI_PROVIDER || 'deepseek';

  console.log('🧪 开始测试AI服务配置...\n');

  if (!apiKey) {
    console.log('❌ AI_API_KEY 未配置！');
    console.log('💡 请在 .env 文件中添加：');
    console.log('   AI_PROVIDER=deepseek');
    console.log('   AI_API_KEY=你的DeepSeek密钥');
    process.exit(1);
  }

  console.log(`✅ 检测到配置：`);
  console.log(`   AI_PROVIDER: ${provider}`);
  console.log(`   AI_API_KEY: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    console.log('📡 正在测试DeepSeek API连接...\n');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '你好，请回复"测试成功"',
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API调用失败！\n');
      console.log(`状态码: ${response.status} ${response.statusText}`);
      console.log(`错误信息: ${errorText}\n`);

      if (response.status === 401) {
        console.log('💡 可能的原因：');
        console.log('   1. API密钥无效或已过期');
        console.log('   2. API密钥格式错误');
        console.log('   3. 请登录 https://platform.deepseek.com 检查密钥\n');
        console.log('🔧 解决方法：');
        console.log('   1. 登录 DeepSeek 控制台');
        console.log('   2. 删除旧密钥，创建新密钥');
        console.log('   3. 更新 .env 文件中的 AI_API_KEY');
        console.log('   4. 重启后端服务\n');
      } else if (response.status === 429) {
        console.log('💡 可能的原因：');
        console.log('   1. API调用次数超限');
        console.log('   2. 免费额度已用完');
        console.log('   3. 需要充值\n');
        console.log('🔧 解决方法：');
        console.log('   1. 登录 DeepSeek 控制台查看使用量');
        console.log('   2. 等待限制重置或充值\n');
      } else {
        console.log('💡 请检查：');
        console.log('   1. 网络连接是否正常');
        console.log('   2. 是否能访问 https://api.deepseek.com');
        console.log('   3. 防火墙是否阻止连接\n');
      }

      process.exit(1);
    }

    const data = await response.json();
    
    console.log('✅ API调用成功！\n');
    console.log('📝 响应内容：');
    console.log(`   模型: ${data.model || 'deepseek-chat'}`);
    console.log(`   回复: ${data.choices[0]?.message?.content || '无回复'}\n`);

    if (data.usage) {
      console.log('📊 Token使用情况：');
      console.log(`   输入: ${data.usage.prompt_tokens || 0} tokens`);
      console.log(`   输出: ${data.usage.completion_tokens || 0} tokens`);
      console.log(`   总计: ${data.usage.total_tokens || 0} tokens\n`);
    }

    console.log('🎉 AI服务配置正常，可以正常使用！\n');
    console.log('💡 如果后端服务中仍然无法使用，请检查：');
    console.log('   1. 后端服务是否正在运行（pnpm dev）');
    console.log('   2. 后端控制台是否有错误日志');
    console.log('   3. 小程序中的API地址配置是否正确\n');

  } catch (error: any) {
    console.log('❌ 测试失败！\n');
    console.log(`错误: ${error.message}\n`);

    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 可能的原因：');
      console.log('   1. 网络连接问题');
      console.log('   2. 无法访问 https://api.deepseek.com');
      console.log('   3. 防火墙或代理设置问题\n');
      console.log('🔧 解决方法：');
      console.log('   1. 检查网络连接');
      console.log('   2. 检查防火墙设置');
      console.log('   3. 如果使用代理，确保代理配置正确\n');
    } else {
      console.log('💡 请查看上面的错误信息，根据错误类型解决问题\n');
    }

    process.exit(1);
  }
}

testDeepSeekAPI();
