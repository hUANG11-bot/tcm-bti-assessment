/**
 * 创建管理员账户脚本
 * 使用方法: tsx scripts/create-admin.ts <username> <password>
 * 例如: tsx scripts/create-admin.ts admin admin123456
 */

import 'dotenv/config';
import { createAdminUser, hasAdminUsers } from '../server/admin-auth';
import { getDb } from '../server/db';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ 错误: 请提供用户名和密码');
    console.log('\n使用方法:');
    console.log('  tsx scripts/create-admin.ts <username> <password>');
    console.log('  或: pnpm create-admin <username> <password>');
    console.log('\n示例:');
    console.log('  tsx scripts/create-admin.ts admin admin123456');
    console.log('  pnpm create-admin admin admin123456');
    process.exit(1);
  }

  const [username, password] = args;

  if (username.length < 3) {
    console.error('❌ 错误: 用户名至少需要3个字符');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ 错误: 密码至少需要6个字符');
    process.exit(1);
  }

  // 检查数据库配置
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 数据库未配置');
    console.log('\n请按以下步骤配置数据库:');
    console.log('1. 在项目根目录创建 .env 文件');
    console.log('2. 添加数据库连接字符串，例如:');
    console.log('   DATABASE_URL=mysql://user:password@localhost:3306/database_name');
    console.log('\n或者使用环境变量:');
    console.log('   set DATABASE_URL=mysql://user:password@localhost:3306/database_name');
    console.log('   pnpm create-admin admin admin123456');
    process.exit(1);
  }

  // 测试数据库连接
  console.log('🔍 检查数据库连接...');
  const db = await getDb();
  if (!db) {
    console.error('❌ 错误: 无法连接到数据库');
    console.log('\n可能的原因:');
    console.log('1. DATABASE_URL 配置错误');
    console.log('2. 数据库服务未启动');
    console.log('3. 数据库不存在或权限不足');
    console.log('\n当前 DATABASE_URL:', process.env.DATABASE_URL ? '已设置（已隐藏）' : '未设置');
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');

  try {
    // 检查是否已有管理员
    console.log('🔍 检查现有管理员账户...');
    const hasAdmin = await hasAdminUsers();
    if (hasAdmin) {
      console.log('⚠️  警告: 系统中已存在管理员账户');
      console.log('   如果要创建新管理员，请先删除现有管理员或使用不同的用户名');
      console.log('\n💡 提示: 可以在数据库中直接删除 admin_users 表的记录');
      process.exit(1);
    }
    console.log('✅ 可以创建新管理员账户');

    console.log('🔄 正在创建管理员账户...');
    const admin = await createAdminUser(username, password);

    if (admin) {
      console.log('✅ 管理员账户创建成功！');
      console.log('\n账户信息:');
      console.log(`  用户名: ${admin.username}`);
      console.log(`  ID: ${admin.id}`);
      console.log(`  创建时间: ${admin.createdAt}`);
      console.log('\n💡 提示:');
      console.log('   现在可以使用此账户登录管理后台');
      console.log('   登录地址: /pages/admin/login/index');
      console.log('\n⚠️  安全提示:');
      console.log('   请妥善保管管理员密码，不要泄露给他人');
    } else {
      console.error('❌ 创建管理员账户失败');
      console.log('   请检查数据库连接和表结构是否正确');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    if (error.message.includes('Table') || error.message.includes('table')) {
      console.log('\n💡 提示: 可能需要先运行数据库迁移');
      console.log('   运行: pnpm db:push');
    }
    process.exit(1);
  }
}

main();
