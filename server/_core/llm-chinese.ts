/**
 * 支持国内AI服务的LLM实现
 * 支持：通义千问、文心一言、OpenAI等
 */

import { ENV } from "./env";
import type { Message, InvokeParams, InvokeResult } from "./llm";

/**
 * AI服务提供商类型
 */
export type AIProvider = 'qwen' | 'ernie' | 'openai' | 'deepseek' | 'custom' | 'minimax';

/**
 * 调用通义千问API
 */
async function invokeQwen(messages: Message[], apiKey: string): Promise<InvokeResult> {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-turbo', // 或 qwen-plus, qwen-max
      input: {
        messages: messages.map(msg => ({
          role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        })),
      },
      parameters: {
        max_tokens: 2000,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`通义千问API调用失败: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = await response.json();
  
  return {
    id: data.request_id || `qwen-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model: 'qwen-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: data.output?.text || data.output?.choices?.[0]?.message?.content || '抱歉，无法生成回复',
        },
        finish_reason: data.output?.finish_reason || 'stop',
      },
    ],
    usage: data.usage ? {
      prompt_tokens: data.usage.input_tokens || 0,
      completion_tokens: data.usage.output_tokens || 0,
      total_tokens: data.usage.total_tokens || 0,
    } : undefined,
  };
}

/**
 * 调用OpenAI兼容API（支持OpenAI、DeepSeek等）
 */
async function invokeOpenAICompatible(
  messages: Message[],
  apiKey: string,
  apiUrl: string = 'https://api.openai.com/v1/chat/completions'
): Promise<InvokeResult> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: (apiUrl.includes('minimax.io') || apiUrl.includes('minimaxi.com')) ? 'MiniMax-M2.1' : 'gpt-3.5-turbo', // MiniMax 使用 MiniMax-M2.1，其他使用 gpt-3.5-turbo
      messages: messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      })),
      max_tokens: (apiUrl.includes('minimax.io') || apiUrl.includes('minimaxi.com')) ? 2048 : 2000, // MiniMax 推荐使用 2048
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API调用失败: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = await response.json();
  
  return {
    id: data.id || `openai-${Date.now()}`,
    created: data.created || Math.floor(Date.now() / 1000),
    model: data.model || 'gpt-3.5-turbo',
    choices: data.choices || [],
    usage: data.usage,
  };
}

/**
 * 调用DeepSeek API（国内可用，OpenAI兼容）
 */
async function invokeDeepSeek(messages: Message[], apiKey: string): Promise<InvokeResult> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat', // DeepSeek 模型名称
      messages: messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      })),
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API调用失败: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = await response.json();
  
  return {
    id: data.id || `deepseek-${Date.now()}`,
    created: data.created || Math.floor(Date.now() / 1000),
    model: data.model || 'deepseek-chat',
    choices: data.choices || [],
    usage: data.usage,
  };
}

/**
 * 调用自定义API（兼容OpenAI格式）
 */
async function invokeCustom(
  messages: Message[],
  apiKey: string,
  apiUrl: string
): Promise<InvokeResult> {
  return invokeOpenAICompatible(messages, apiKey, apiUrl);
}

/**
 * 调用国内AI服务
 */
export async function invokeChineseLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages } = params;
  
  // 从环境变量获取配置
  const provider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase() as AIProvider;
  const apiKey = process.env.AI_API_KEY || '';
  const apiUrl = process.env.AI_API_URL || '';

  if (!apiKey) {
    throw new Error('AI_API_KEY 未配置，请在 .env 文件中设置');
  }

  try {
    switch (provider) {
      case 'qwen':
        return await invokeQwen(messages, apiKey);
      
      case 'openai':
        return await invokeOpenAICompatible(messages, apiKey, apiUrl || 'https://api.openai.com/v1/chat/completions');
      
      case 'deepseek':
        return await invokeDeepSeek(messages, apiKey);
      
      case 'custom':
      case 'minimax':
        if (!apiUrl) {
          throw new Error('使用 custom/minimax 模式时，必须配置 AI_API_URL');
        }
        return await invokeCustom(messages, apiKey, apiUrl);
      
      default:
        // 默认使用DeepSeek
        return await invokeDeepSeek(messages, apiKey);
    }
  } catch (error: any) {
    console.error('[Chinese LLM] Error:', error);
    
    // 提供更详细的错误信息
    let errorMessage = error.message || '未知错误';
    
    // 检查是否是API密钥问题
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      errorMessage = `API密钥无效: ${errorMessage}`;
    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorMessage = `请求频率过高: ${errorMessage}`;
    } else if (errorMessage.includes('余额') || errorMessage.includes('balance') || errorMessage.includes('insufficient')) {
      errorMessage = `账户余额不足: ${errorMessage}`;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('网络')) {
      errorMessage = `网络连接超时: ${errorMessage}`;
    }
    
    throw new Error(errorMessage);
  }
}
