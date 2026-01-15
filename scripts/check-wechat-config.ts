/**
 * 检查微信登录配置脚本
 * 使用方法: tsx scripts/check-wechat-config.ts
 */

import 'dotenv/config';

function checkWeChatConfig() {
  console.log('🔍 检查微信登录配置...\n');

  const WX_APPID = process.env.WX_APPID;
  const WX_SECRET = process.env.WX_SECRET;

  let hasError = false;

  // 检查 AppID
  if (!WX_APPID) {
    console.error('❌ WX_APPID 未配置');
    console.log('   请在 .env 文件中添加: WX_APPID=你的AppID\n');
    hasError = true;
  } else {
    console.log(`✅ WX_APPID: ${WX_APPID}`);
    if (WX_APPID.length < 18) {
      console.warn('   ⚠️  AppID 长度异常，请检查是否正确');
      hasError = true;
    }
  }

  // 检查 AppSecret
  if (!WX_SECRET) {
    console.error('❌ WX_SECRET 未配置');
    console.log('   请在 .env 文件中添加: WX_SECRET=你的AppSecret\n');
    hasError = true;
  } else {
    console.log(`✅ WX_SECRET: ${WX_SECRET.substring(0, 4)}**** (已隐藏)`);
    if (WX_SECRET.length < 32) {
      console.warn('   ⚠️  AppSecret 长度异常，请检查是否正确');
      hasError = true;
    }
  }

  // 检查 .env 文件
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env 文件不存在');
    console.log('   建议创建 .env 文件并配置环境变量\n');
  } else {
    console.log('✅ .env 文件存在');
  }

  // 提供配置建议
  if (hasError) {
    console.log('\n📝 配置步骤:');
    console.log('1. 在项目根目录创建 .env 文件');
    console.log('2. 添加以下内容:');
    console.log('   WX_APPID=你的微信小程序AppID');
    console.log('   WX_SECRET=你的微信小程序AppSecret');
    console.log('\n3. 如何获取 AppID 和 AppSecret:');
    console.log('   - 登录 https://mp.weixin.qq.com');
    console.log('   - 进入: 开发 → 开发管理 → 开发设置');
    console.log('   - 在"账号信息"中查看 AppID');
    console.log('   - 在"AppSecret"中生成或查看 AppSecret');
    console.log('\n4. 重启后端服务器使配置生效');
    process.exit(1);
  } else {
    console.log('\n✅ 配置检查通过！');
    console.log('\n💡 提示:');
    console.log('   - 如果仍然遇到 INVALID_TOKEN 错误，请检查:');
    console.log('     1. AppSecret 是否正确（注意大小写）');
    console.log('     2. AppID 是否与微信开发者工具中的一致');
    console.log('     3. 是否在微信公众平台配置了合法域名');
    console.log('     4. 开发环境是否勾选了"不校验合法域名"');
    console.log('\n   详细排查指南: 查看 WECHAT-LOGIN-TROUBLESHOOTING.md');
  }
}

checkWeChatConfig();
