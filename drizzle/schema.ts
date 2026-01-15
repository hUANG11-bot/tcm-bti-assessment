import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 测评记录表
 * 存储用户的完整测评数据，包括答题记录和评估结果
 */
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // 关联到users表（可选，用于OAuth用户）
  
  // 用户识别信息
  phone: varchar("phone", { length: 20 }), // 手机号，用于匿名用户识别
  
  // 用户基本信息
  age: int("age").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  habits: text("habits").notNull(), // JSON数组，存储生活习惯
  
  // 答题记录
  answers: text("answers").notNull(), // JSON对象，存储所有答案
  
  // 评估结果
  primaryType: varchar("primaryType", { length: 50 }).notNull(), // 主要体质类型
  secondaryType: varchar("secondaryType", { length: 50 }), // 次要体质类型（可选）
  scores: text("scores").notNull(), // JSON对象，存储各维度得分
  
  // 完整报告（JSON格式）
  fullReport: text("fullReport").notNull(), // 包含所有调理建议、穴位等
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * 邀请记录表
 * 跟踪用户邀请关系和裂变效果
 */
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  inviterId: int("inviterId").notNull(), // 邀请人用户ID
  inviteeId: int("inviteeId"), // 被邀请人用户ID（完成注册后填充）
  inviteCode: varchar("inviteCode", { length: 32 }).notNull().unique(), // 邀请码
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"), // 被邀请人完成测评的时间
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

/**
 * 管理员账户表
 * 存储管理后台登录的用户名和密码
 */
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt加密后的密码
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;