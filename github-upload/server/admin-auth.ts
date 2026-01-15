import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { adminUsers, type AdminUser } from '../drizzle/schema';

/**
 * 创建管理员账户
 */
export async function createAdminUser(username: string, password: string): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot create admin user: database not available');
    return null;
  }

  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await db.insert(adminUsers).values({
    username,
    password: hashedPassword,
  });
  
  // 获取刚创建的管理员
  const [newAdmin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);
  
  return newAdmin || null;
}

/**
 * 验证管理员登录
 */
export async function verifyAdminLogin(username: string, password: string): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot verify admin login: database not available');
    return null;
  }

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);
  
  if (!admin) {
    return null;
  }
  
  // 验证密码
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return null;
  }
  
  // 更新最后登录时间
  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, admin.id));
  
  return admin;
}

/**
 * 检查是否存在管理员账户
 */
export async function hasAdminUsers(): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const admins = await db.select().from(adminUsers).limit(1);
  return admins.length > 0;
}

/**
 * 根据ID获取管理员信息
 */
export async function getAdminById(id: number): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  
  return admin || null;
}
