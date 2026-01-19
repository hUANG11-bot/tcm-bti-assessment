import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('错误: 未设置 DATABASE_URL 环境变量');
  process.exit(1);
}

async function addFields() {
  let conn;
  try {
    console.log('正在连接到数据库...');
    conn = await mysql.createConnection(DATABASE_URL);
    console.log('✓ 数据库连接成功\n');

    // 添加 birthDate 字段
    try {
      await conn.execute(
        'ALTER TABLE `users` ADD COLUMN `birthDate` VARCHAR(20) NULL AFTER `loginMethod`'
      );
      console.log('✓ birthDate 字段添加成功');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ birthDate 字段已存在，跳过');
      } else {
        throw e;
      }
    }

    // 添加 gender 字段
    try {
      await conn.execute(
        'ALTER TABLE `users` ADD COLUMN `gender` VARCHAR(10) NULL AFTER `birthDate`'
      );
      console.log('✓ gender 字段添加成功');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ gender 字段已存在，跳过');
      } else {
        throw e;
      }
    }

    // 验证字段
    console.log('\n正在验证字段...');
    const [rows] = await conn.execute('DESCRIBE `users`');
    const fields = rows.map(row => row.Field);
    
    if (fields.includes('birthDate')) {
      console.log('✓ birthDate 字段已存在');
    } else {
      console.log('✗ birthDate 字段不存在');
    }
    
    if (fields.includes('gender')) {
      console.log('✓ gender 字段已存在');
    } else {
      console.log('✗ gender 字段不存在');
    }

    console.log('\n✓ 迁移完成！');
  } catch (error) {
    console.error('\n✗ 迁移失败:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    if (error.sqlMessage) {
      console.error('SQL 错误:', error.sqlMessage);
    }
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

addFields();
