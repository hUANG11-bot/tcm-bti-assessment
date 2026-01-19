import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    console.log(`[upsertUser] 开始创建/更新用户 - openId: ${user.openId}`);
    
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    // 基础字段（必须存在）
    const requiredFields = ["name", "email", "loginMethod"] as const;
    // 可选字段（可能不存在于旧数据库中）
    const optionalFields = ["birthDate", "gender"] as const;
    
    type RequiredField = (typeof requiredFields)[number];
    type OptionalField = (typeof optionalFields)[number];

    const assignNullable = (field: RequiredField | OptionalField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    // 先处理必需字段
    requiredFields.forEach(assignNullable);
    
    // 再处理可选字段（如果用户提供了值）
    optionalFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    console.log(`[upsertUser] 准备插入的值:`, {
      openId: values.openId,
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      birthDate: values.birthDate,
      gender: values.gender,
      role: values.role,
    });
    console.log(`[upsertUser] 准备更新的字段:`, Object.keys(updateSet));

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
    
    console.log(`[upsertUser] 用户创建/更新成功 - openId: ${user.openId}`);
  } catch (error: any) {
    console.error("[upsertUser] 创建/更新用户失败:", error);
    console.error("[upsertUser] 错误类型:", error?.constructor?.name);
    console.error("[upsertUser] 错误消息:", error?.message);
    console.error("[upsertUser] 错误堆栈:", error?.stack);
    if (error?.code) {
      console.error("[upsertUser] 错误代码:", error.code);
    }
    if (error?.errno) {
      console.error("[upsertUser] 错误编号:", error.errno);
    }
    if (error?.sqlState) {
      console.error("[upsertUser] SQL状态:", error.sqlState);
    }
    if (error?.sqlMessage) {
      console.error("[upsertUser] SQL消息:", error.sqlMessage);
    }
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
