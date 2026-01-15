/**
 * 测试数据库连接
 * 使用方法: tsx scripts/test-db-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });

async function testDatabaseConnection() {
  console.log("🔍 正在测试数据库连接...\n");

  // 检查 DATABASE_URL 是否存在
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ 错误：未找到 DATABASE_URL 环境变量");
    console.log("\n请确保 .env 文件中已配置 DATABASE_URL");
    process.exit(1);
  }

  // 显示连接信息（隐藏密码）
  const urlObj = new URL(databaseUrl);
  const maskedUrl = `${urlObj.protocol}//${urlObj.username}:***@${urlObj.hostname}:${urlObj.port}${urlObj.pathname}`;
  console.log("📋 连接信息：");
  console.log(`   地址: ${maskedUrl}`);
  console.log(`   协议: ${urlObj.protocol.replace(":", "")}`);
  console.log(`   主机: ${urlObj.hostname}`);
  console.log(`   端口: ${urlObj.port || "3306"}`);
  console.log(`   数据库: ${urlObj.pathname.replace("/", "")}`);
  console.log("");

  try {
    console.log("⏳ 正在连接数据库...");

    // 创建 drizzle 实例
    const db = drizzle(databaseUrl);

    // 执行简单查询测试连接
    const result = await db.execute(sql`SELECT 1 as test, DATABASE() as current_db, VERSION() as mysql_version`);

    console.log("✅ 数据库连接成功！\n");

    // 显示查询结果
    const row = result[0] as any;
    console.log("📊 数据库信息：");
    console.log(`   当前数据库: ${row.current_db || "未知"}`);
    console.log(`   MySQL 版本: ${row.mysql_version || "未知"}`);
    console.log("");

    // 测试查询数据库列表
    try {
      const databases = await db.execute(sql`SHOW DATABASES`);
      console.log("📁 可用数据库：");
      const dbList = databases[0] as any[];
      dbList.forEach((db: any) => {
        const dbName = Object.values(db)[0];
        const isCurrent = dbName === urlObj.pathname.replace("/", "");
        console.log(`   ${isCurrent ? "👉" : "  "} ${dbName}${isCurrent ? " (当前)" : ""}`);
      });
      console.log("");
    } catch (error) {
      console.log("⚠️  无法查询数据库列表（可能是权限问题）");
    }

    // 测试查询表
    try {
      const tables = await db.execute(sql`SHOW TABLES`);
      const tableList = tables[0] as any[];
      if (tableList.length > 0) {
        console.log("📋 数据库中的表：");
        tableList.forEach((table: any) => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
      } else {
        console.log("📋 数据库中没有表（可以运行 pnpm db:push 创建表）");
      }
      console.log("");
    } catch (error) {
      console.log("⚠️  无法查询表列表（可能是权限问题或数据库不存在）");
    }

    console.log("✅ 数据库连接测试完成！");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ 数据库连接失败！\n");

    // 提供详细的错误信息
    if (error.code) {
      console.error(`错误代码: ${error.code}`);
    }
    if (error.message) {
      console.error(`错误信息: ${error.message}`);
    }

    console.log("\n🔧 常见问题排查：");
    console.log("1. 检查 DATABASE_URL 格式是否正确");
    console.log("2. 检查用户名和密码是否正确");
    console.log("3. 检查数据库是否存在");
    console.log("4. 检查网络连接（防火墙、安全组设置）");
    console.log("5. 检查端口是否正确（您的端口是 23371）");
    console.log("6. 如果使用云数据库，检查是否开启了外网访问");

    // 特定错误提示
    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 提示：连接被拒绝，可能是：");
      console.log("   - 数据库服务未运行");
      console.log("   - 端口错误");
      console.log("   - 防火墙阻止连接");
    } else if (error.code === "ETIMEDOUT") {
      console.log("\n💡 提示：连接超时，可能是：");
      console.log("   - 网络问题");
      console.log("   - 主机地址错误");
      console.log("   - 防火墙阻止连接");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 提示：访问被拒绝，可能是：");
      console.log("   - 用户名或密码错误");
      console.log("   - 用户没有访问该数据库的权限");
    } else if (error.message?.includes("Unknown database")) {
      console.log("\n💡 提示：数据库不存在，请先创建数据库：");
      console.log("   - 在腾讯云控制台创建数据库");
      console.log("   - 或使用 SQL: CREATE DATABASE tcm_bti_assessment");
    }

    process.exit(1);
  }
}

// 运行测试
testDatabaseConnection().catch((error) => {
  console.error("❌ 发生未预期的错误：", error);
  process.exit(1);
});
