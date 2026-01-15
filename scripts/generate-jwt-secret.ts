/**
 * 生成JWT密钥脚本
 * 使用方法: tsx scripts/generate-jwt-secret.ts
 */

import crypto from 'crypto';

function generateJWTSecret(): string {
  // 生成32字节的随机字符串，转换为hex格式（64个字符）
  const secret = crypto.randomBytes(32).toString('hex');
  return secret;
}

function main() {
  console.log('🔐 正在生成JWT密钥...\n');
  
  const secret = generateJWTSecret();
  
  console.log('✅ JWT密钥生成成功！\n');
  console.log('📋 请将以下内容添加到 .env 文件中：\n');
  console.log(`JWT_SECRET=${secret}\n`);
  console.log('💡 提示：');
  console.log('   1. 复制上面的 JWT_SECRET=... 这一行');
  console.log('   2. 打开项目根目录的 .env 文件');
  console.log('   3. 如果文件不存在，请先创建它');
  console.log('   4. 将复制的行粘贴到 .env 文件中');
  console.log('   5. 保存文件并重启服务\n');
}

main();
