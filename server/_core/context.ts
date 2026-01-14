import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./sdk";
import { getAdminById } from "../admin-auth";
import { getDb } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminId: number | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminId: number | null = null;

  // 1. 尝试从 session cookie 获取普通用户
  // 对于 publicProcedure，没有 session cookie 是正常的，使用 silent 模式避免警告
  try {
    user = await sdk.authenticateRequest(opts.req, true); // silent = true，不输出警告
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // 2. 检查是否有 admin cookie（管理员登录）
  const adminIdCookie = opts.req.cookies?.admin_id;
  if (adminIdCookie) {
    const admin = await getAdminById(parseInt(adminIdCookie));
    if (admin) {
      adminId = admin.id;
      
      // 如果普通用户认证失败，但admin登录成功，创建一个虚拟的admin user
      // 这样admin接口可以正常工作
      if (!user) {
        // 尝试从数据库获取或创建一个admin用户（基于openId）
        const db = await getDb();
        if (db) {
          // 使用admin的username作为openId来查找或创建用户
          const adminOpenId = `admin_${admin.username}`;
          const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.openId, adminOpenId))
            .limit(1);
          
          if (existingUsers.length > 0) {
            user = existingUsers[0];
          } else {
            // 创建admin用户记录（用于tRPC接口）
            await db.insert(users).values({
              openId: adminOpenId,
              name: `管理员: ${admin.username}`,
              role: 'admin',
              loginMethod: 'admin',
            });
            
            const newUsers = await db
              .select()
              .from(users)
              .where(eq(users.openId, adminOpenId))
              .limit(1);
            
            if (newUsers.length > 0) {
              user = newUsers[0];
            }
          }
        }
      } else {
        // 如果已有user，确保role是admin
        if (user.role !== 'admin') {
          const db = await getDb();
          if (db) {
            await db
              .update(users)
              .set({ role: 'admin' })
              .where(eq(users.id, user.id));
            user.role = 'admin';
          }
        }
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminId,
  };
}
