/**
 * 测试AI中医对话功能
 * 使用方法: tsx scripts/test-ai-chat.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { invokeChineseLLM } from '../server/_core/llm-chinese';
import { invokeLLM } from '../server/_core/llm';
import type { Message } from '../server/_core/llm';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });

async function testAIChat() {
  console.log('🧪 开始测试AI中医对话功能...\n');

  // 检查配置
  const aiProvider = process.env.AI_PROVIDER || 'deepseek';
  const aiApiKey = process.env.AI_API_KEY || '';
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY || '';
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL || '';

  console.log('📋 当前配置：');
  console.log(`   AI_PROVIDER: ${aiProvider}`);
  console.log(`   AI_API_KEY: ${aiApiKey ? `${aiApiKey.substring(0, 8)}...${aiApiKey.substring(aiApiKey.length - 4)}` : '❌ 未配置'}`);
  console.log(`   BUILT_IN_FORGE_API_KEY: ${forgeApiKey ? `${forgeApiKey.substring(0, 8)}...${forgeApiKey.substring(forgeApiKey.length - 4)}` : '❌ 未配置'}`);
  console.log(`   BUILT_IN_FORGE_API_URL: ${forgeApiUrl || '使用默认值'}\n`);

  // 构建测试消息
  const systemMessage: Message = {
    role: 'system',
    content: '你是一位经验丰富的中医专家，擅长体质辨识和健康调理。请用专业但易懂的语言回答用户的问题，提供实用的中医养生建议。回答要简洁明了，控制在200字以内。',
  };

  const userMessage: Message = {
    role: 'user',
    content: '你好，请简单介绍一下气虚体质的调理方法',
  };

  const messages: Message[] = [systemMessage, userMessage];

  // 测试1: 国内AI服务
  if (aiApiKey) {
    console.log('🔍 测试1: 国内AI服务（优先）\n');
    try {
      console.log(`   使用服务: ${aiProvider}`);
      const result = await invokeChineseLLM({ messages });
      
      console.log('   ✅ 调用成功！');
      console.log(`   模型: ${result.model}`);
      console.log(`   回复: ${result.choices[0]?.message?.content || '无回复'}\n`);
      
      if (result.usage) {
        console.log(`   Token使用: ${result.usage.total_tokens} (输入: ${result.usage.prompt_tokens}, 输出: ${result.usage.completion_tokens})\n`);
      }
      
      console.log('🎉 国内AI服务测试通过！\n');
      return;
    } catch (error: any) {
      console.log(`   ❌ 调用失败: ${error.message}\n`);
      
      if (error.message.includes('未配置')) {
        console.log('   💡 请检查 .env 文件中的 AI_API_KEY 配置\n');
      } else if (error.message.includes('余额不足') || error.message.includes('Balance') || error.message.includes('402')) {
        console.log('   💡 账户余额不足，需要充值\n');
        console.log('   🔧 解决方法：');
        console.log('      1. 登录 https://platform.deepseek.com');
        console.log('      2. 查看账户余额');
        console.log('      3. 充值后重试\n');
      } else if (error.message.includes('401') || error.message.includes('无效')) {
        console.log('   💡 API密钥无效，请检查密钥是否正确\n');
        console.log('   🔧 解决方法：');
        console.log('      1. 登录 https://platform.deepseek.com');
        console.log('      2. 检查API密钥是否正确');
        console.log('      3. 如有需要，创建新密钥并更新 .env\n');
      } else if (error.message.includes('429') || error.message.includes('超限')) {
        console.log('   💡 API调用次数超限，请检查使用量\n');
        console.log('   🔧 解决方法：');
        console.log('      1. 登录 https://platform.deepseek.com 查看使用量');
        console.log('      2. 等待限制重置或升级套餐\n');
      } else {
        console.log(`   💡 错误详情: ${error.message}\n`);
      }
    }
  } else {
    console.log('⚠️  跳过测试1: AI_API_KEY 未配置\n');
  }

  // 测试2: 备用服务
  if (forgeApiKey) {
    console.log('🔍 测试2: 备用服务（Forge API）\n');
    try {
      const result = await invokeLLM({ messages });
      
      console.log('   ✅ 调用成功！');
      console.log(`   模型: ${result.model}`);
      console.log(`   回复: ${result.choices[0]?.message?.content || '无回复'}\n`);
      
      if (result.usage) {
        console.log(`   Token使用: ${result.usage.total_tokens} (输入: ${result.usage.prompt_tokens}, 输出: ${result.usage.completion_tokens})\n`);
      }
      
      console.log('🎉 备用服务测试通过！\n');
      return;
    } catch (error: any) {
      console.log(`   ❌ 调用失败: ${error.message}\n`);
      
      if (error.message.includes('not configured')) {
        console.log('   💡 请检查 .env 文件中的 BUILT_IN_FORGE_API_KEY 配置\n');
      }
    }
  } else {
    console.log('⚠️  跳过测试2: BUILT_IN_FORGE_API_KEY 未配置\n');
  }

  // 总结
  console.log('='.repeat(50));
  console.log('❌ 所有AI服务测试都失败\n');
  console.log('💡 解决方案：');
  console.log('   1. 配置国内AI服务（推荐）：');
  console.log('      - 在 .env 中添加: AI_PROVIDER=deepseek');
  console.log('      - 在 .env 中添加: AI_API_KEY=你的密钥');
  console.log('      - 查看 DEEPSEEK-SETUP.md 了解如何获取密钥\n');
  console.log('   2. 或配置备用服务：');
  console.log('      - 在 .env 中添加: BUILT_IN_FORGE_API_KEY=你的密钥');
  console.log('      - 在 .env 中添加: BUILT_IN_FORGE_API_URL=https://forge.manus.im\n');
  console.log('   3. 运行 pnpm check-env 检查所有配置\n');
  console.log('='.repeat(50) + '\n');
  
  process.exit(1);
}

testAIChat().catch((error) => {
  console.error('❌ 测试过程中发生错误:', error);
  process.exit(1);
});
