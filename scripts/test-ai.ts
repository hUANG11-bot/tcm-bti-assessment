/**
 * AI中医功能诊断脚本
 * 用于检查AI服务配置和连接状态
 */

import 'dotenv/config';
import { invokeChineseLLM } from '../server/_core/llm-chinese';
import { invokeLLM } from '../server/_core/llm';
import type { Message } from '../server/_core/llm';

console.log('🧪 开始诊断AI中医功能...\n');

// 检查环境变量
console.log('📋 环境变量检查:');
const aiProvider = process.env.AI_PROVIDER || 'deepseek';
const aiApiKey = process.env.AI_API_KEY || '';
const aiApiUrl = process.env.AI_API_URL || '';
const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY || '';

console.log(`  - AI_PROVIDER: ${aiProvider || '(未设置，使用默认: deepseek)'}`);
console.log(`  - AI_API_KEY: ${aiApiKey ? '✅ 已配置' : '❌ 未配置'}`);
if (aiApiUrl) {
  console.log(`  - AI_API_URL: ${aiApiUrl}`);
}
console.log(`  - BUILT_IN_FORGE_API_KEY: ${forgeApiKey ? '✅ 已配置' : '❌ 未配置'}`);
console.log('');

// 测试消息
const testMessages: Message[] = [
  {
    role: 'system',
    content: '你是一位经验丰富的中医专家。请用简洁的语言回答用户的问题。',
  },
  {
    role: 'user',
    content: '你好，我想咨询一下关于失眠的问题。',
  },
];

// 测试国内AI服务
async function testChineseLLM() {
  console.log('🔍 测试国内AI服务...');
  
  if (!aiApiKey) {
    console.log('  ❌ AI_API_KEY 未配置，无法测试国内AI服务');
    console.log('  💡 请在 .env 文件中设置 AI_API_KEY');
    return false;
  }

  try {
    console.log(`  - 使用服务商: ${aiProvider}`);
    const result = await invokeChineseLLM({ messages: testMessages });
    const content = result.choices[0]?.message?.content || '无回复';
    console.log('  ✅ 国内AI服务连接成功！');
    console.log(`  📝 回复预览: ${content.substring(0, 100)}...`);
    return true;
  } catch (error: any) {
    console.log('  ❌ 国内AI服务连接失败');
    console.log(`  🔴 错误信息: ${error.message}`);
    
    // 提供具体的错误提示
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('  💡 提示: API密钥可能无效，请检查 AI_API_KEY 是否正确');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.log('  💡 提示: 请求频率过高，请稍后再试');
    } else if (error.message.includes('余额') || error.message.includes('balance')) {
      console.log('  💡 提示: 账户余额不足，请充值后重试');
    } else if (error.message.includes('timeout') || error.message.includes('网络')) {
      console.log('  💡 提示: 网络连接问题，请检查网络连接');
    }
    
    return false;
  }
}

// 测试备用AI服务
async function testFallbackLLM() {
  console.log('\n🔍 测试备用AI服务...');
  
  if (!forgeApiKey) {
    console.log('  ❌ BUILT_IN_FORGE_API_KEY 未配置，无法测试备用服务');
    return false;
  }

  try {
    const result = await invokeLLM({ messages: testMessages });
    const content = result.choices[0]?.message?.content || '无回复';
    console.log('  ✅ 备用AI服务连接成功！');
    console.log(`  📝 回复预览: ${content.substring(0, 100)}...`);
    return true;
  } catch (error: any) {
    console.log('  ❌ 备用AI服务连接失败');
    console.log(`  🔴 错误信息: ${error.message}`);
    return false;
  }
}

// 主测试函数
async function main() {
  const chineseLLMWorks = await testChineseLLM();
  const fallbackLLMWorks = await testFallbackLLM();

  console.log('\n📊 诊断结果总结:');
  console.log('─'.repeat(50));
  
  if (chineseLLMWorks) {
    console.log('✅ 国内AI服务: 正常');
    console.log('✅ AI中医功能应该可以正常使用');
  } else if (fallbackLLMWorks) {
    console.log('⚠️  国内AI服务: 失败');
    console.log('✅ 备用AI服务: 正常');
    console.log('✅ AI中医功能可以使用（使用备用服务）');
  } else {
    console.log('❌ 国内AI服务: 失败');
    console.log('❌ 备用AI服务: 失败');
    console.log('❌ AI中医功能无法使用');
    console.log('\n💡 修复建议:');
    console.log('  1. 检查 .env 文件中的 AI_API_KEY 是否正确配置');
    console.log('  2. 确认 API 密钥是否有效且有足够余额');
    console.log('  3. 检查网络连接是否正常');
    console.log('  4. 如果使用 DeepSeek，请访问 https://platform.deepseek.com 获取 API Key');
    console.log('  5. 如果使用通义千问，请访问 https://dashscope.console.aliyun.com 获取 API Key');
  }
  
  console.log('─'.repeat(50));
}

main().catch(console.error);
