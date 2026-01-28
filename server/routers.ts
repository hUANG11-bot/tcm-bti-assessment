import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createAssessment,
  getUserAssessments,
  getAssessmentById,
  getAllAssessments,
  getAssessmentStats,
  deleteAssessment,
  getAssessmentsByUserOrPhone,
} from "./assessments";
import {
  createInvitation,
  getInvitationByCode,
  completeInvitation,
  getUserInviteStats,
} from "./invitations";
import { verifyAdminLogin, hasAdminUsers, createAdminUser, getAdminById } from './admin-auth';
import { TRPCError } from '@trpc/server';
import { invokeLLM, type Message } from './_core/llm';
import { invokeChineseLLM } from './_core/llm-chinese';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/** 共享：将测评列表映射为可序列化结构，供 assessment.myAssessments 与 assessments.myAssessments 使用 */
async function getMyAssessmentsMapped(userId: number) {
  const assessments = await getUserAssessments(userId);
  return assessments.map((a) => {
    try {
      const result: Record<string, unknown> = {
        id: Number(a.id) || 0,
        userId: Number(a.userId) || 0,
        age: Number(a.age) || 0,
        gender: String(a.gender || ''),
        primaryType: String(a.primaryType || ''),
        secondaryType: a.secondaryType ? String(a.secondaryType) : null,
      };
      try {
        result.createdAt = a.createdAt instanceof Date
          ? a.createdAt.toISOString()
          : (typeof a.createdAt === 'string' ? a.createdAt : (a.createdAt ? new Date(a.createdAt as unknown as string).toISOString() : new Date().toISOString()));
      } catch {
        result.createdAt = new Date().toISOString();
      }
      try {
        result.updatedAt = a.updatedAt instanceof Date
          ? a.updatedAt.toISOString()
          : (typeof a.updatedAt === 'string' ? a.updatedAt : (a.updatedAt ? new Date(a.updatedAt as unknown as string).toISOString() : new Date().toISOString()));
      } catch {
        result.updatedAt = new Date().toISOString();
      }
      JSON.stringify(result);
      return result;
    } catch (e) {
      console.error(`[getMyAssessmentsMapped] 单条失败 ID: ${a.id}`, e);
      return {
        id: Number(a.id) || 0,
        userId: Number(a.userId) || 0,
        age: Number(a.age) || 0,
        gender: String(a.gender || ''),
        primaryType: String(a.primaryType || ''),
        secondaryType: a.secondaryType ? String(a.secondaryType) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  });
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    updateProfile: protectedProcedure
      .input(
        z.object({
          birthDate: z.string().optional(),
          gender: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        const updateData: Record<string, unknown> = {};
        if (input.birthDate !== undefined) {
          updateData.birthDate = input.birthDate;
        }
        if (input.gender !== undefined) {
          updateData.gender = input.gender;
        }
        if (Object.keys(updateData).length === 0) {
          return ctx.user;
        }
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, ctx.user.id));
        const updated = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        return updated[0] || ctx.user;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assessment: router({
    // 创建新的测评记录
    create: protectedProcedure
      .input(
        z.object({
          age: z.number(),
          gender: z.string(),
          habits: z.array(z.string()),
          answers: z.record(z.string(), z.number()),
          primaryType: z.string(),
          secondaryType: z.string().optional(),
          scores: z.record(z.string(), z.number()),
          fullReport: z.any(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          console.log(`[assessment.create] 开始创建测评记录 - 用户ID: ${ctx.user.id}`);
          console.log(`[assessment.create] 输入数据:`, {
            age: input.age,
            gender: input.gender,
            primaryType: input.primaryType,
            secondaryType: input.secondaryType,
            habitsCount: input.habits?.length || 0,
            answersCount: Object.keys(input.answers || {}).length,
          });

          const assessment = await createAssessment({
            userId: ctx.user.id,
            age: input.age,
            gender: input.gender,
            habits: JSON.stringify(input.habits),
            answers: JSON.stringify(input.answers),
            primaryType: input.primaryType,
            secondaryType: input.secondaryType || null,
            scores: JSON.stringify(input.scores),
            fullReport: JSON.stringify(input.fullReport),
          });

          console.log(`[assessment.create] 创建成功，记录ID: ${assessment.id}`);
          return assessment;
        } catch (error: any) {
          console.error(`[assessment.create] 创建失败 - 用户ID: ${ctx.user.id}`, error);
          console.error(`[assessment.create] 错误详情:`, {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
            code: error?.code,
            errno: error?.errno,
            sqlState: error?.sqlState,
            sqlMessage: error?.sqlMessage,
          });
          throw error;
        }
      }),

    // 获取当前用户的测评历史
    myAssessments: protectedProcedure.query(async ({ ctx }) => {
      try {
        console.log(`[assessment.myAssessments] 查询用户 ${ctx.user.id} 的测评记录`);
        const list = await getMyAssessmentsMapped(ctx.user.id);
        console.log(`[assessment.myAssessments] 查询成功，找到 ${list.length} 条记录`);
        return list;
      } catch (error: unknown) {
        const err = error as { message?: string; stack?: string; name?: string };
        console.error(`[assessment.myAssessments] 查询失败 - 用户ID: ${ctx.user.id}`, error);
        console.error(`[assessment.myAssessments] 错误详情:`, { message: err?.message, stack: err?.stack, name: err?.name });
        throw error;
      }
    }),

    // 获取当前用户的测评趋势数据（用于绘制曲线图）
    trendData: protectedProcedure.query(async ({ ctx }) => {
      const assessments = await getUserAssessments(ctx.user.id);
      // 按时间排序
      const sorted = assessments.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      // 提取每次测评的分数和日期
      return sorted.map((a) => {
        const scores = JSON.parse(a.scores);
        return {
          id: a.id,
          date: a.createdAt,
          primaryType: a.primaryType,
          secondaryType: a.secondaryType,
          scores: scores,
        };
      });
    }),

    /** 获取最近一次测评（供 AI 聊天等调取「最后一次测评历史」使用，含 fullReport） */
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      const assessments = await getUserAssessments(ctx.user.id);
      if (!assessments || assessments.length === 0) return null;
      const latest = assessments[0];
      let fullReport: unknown = null;
      if (latest.fullReport) {
        try {
          fullReport = typeof latest.fullReport === 'string' ? JSON.parse(latest.fullReport) : latest.fullReport;
        } catch {
          fullReport = null;
        }
      }
      return {
        id: Number(latest.id) || 0,
        age: Number(latest.age) || 0,
        gender: String(latest.gender || ''),
        primaryType: String(latest.primaryType || ''),
        secondaryType: latest.secondaryType ? String(latest.secondaryType) : null,
        createdAt: latest.createdAt instanceof Date ? latest.createdAt.toISOString() : String(latest.createdAt ?? ''),
        fullReport,
      };
    }),

    // 获取单条测评记录
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const assessment = await getAssessmentById(input.id);
        if (!assessment) {
          throw new Error("Assessment not found");
        }
        return {
          ...assessment,
          habits: JSON.parse(assessment.habits),
          answers: JSON.parse(assessment.answers),
          scores: JSON.parse(assessment.scores),
          fullReport: JSON.parse(assessment.fullReport),
        };
      }),

    // 删除测评记录
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteAssessment(input.id, ctx.user.id);
        return { success: true };
      }),

    // 管理员：获取所有测评记录
    all: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const assessments = await getAllAssessments();
      return assessments.map((a) => ({
        ...a,
        habits: JSON.parse(a.habits),
        answers: JSON.parse(a.answers),
        scores: JSON.parse(a.scores),
        fullReport: JSON.parse(a.fullReport),
      }));
    }),

    // 管理员：获取统计数据
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getAssessmentStats();
    }),

    // 管理员：根据用户ID或手机号查询测评记录
    getByUserOrPhone: protectedProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          phone: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        
        const assessments = await getAssessmentsByUserOrPhone(
          input.userId,
          input.phone
        );
        
        // 安全解析 JSON 字段
        const safeJsonParse = (str: string, defaultVal: any = null) => {
          try {
            return JSON.parse(str);
          } catch (e) {
            console.error(`[getByUserOrPhone] JSON解析失败:`, str?.substring(0, 100));
            return defaultVal;
          }
        };
        
        return assessments.map((a) => ({
          id: a.id,
          userId: a.userId,
          phone: a.phone,
          age: a.age,
          gender: a.gender,
          primaryType: a.primaryType,
          secondaryType: a.secondaryType,
          createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
          updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : a.updatedAt,
          habits: safeJsonParse(a.habits, []),
          answers: safeJsonParse(a.answers, {}),
          scores: safeJsonParse(a.scores, {}),
          fullReport: safeJsonParse(a.fullReport, {}),
        }));
      }),
  }),

  /** 小程序端可能使用复数路径 assessments.myAssessments / assessments.getLatest，此处做别名避免 404 */
  assessments: router({
    myAssessments: protectedProcedure.query(async ({ ctx }) => {
      try {
        console.log(`[assessments.myAssessments] 查询用户 ${ctx.user.id} 的测评记录`);
        const list = await getMyAssessmentsMapped(ctx.user.id);
        console.log(`[assessments.myAssessments] 查询成功，找到 ${list.length} 条记录`);
        return list;
      } catch (error: unknown) {
        const err = error as { message?: string; stack?: string; name?: string };
        console.error(`[assessments.myAssessments] 查询失败 - 用户ID: ${ctx.user.id}`, error);
        console.error(`[assessments.myAssessments] 错误详情:`, { message: err?.message, stack: err?.stack, name: err?.name });
        throw error;
      }
    }),
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      const assessments = await getUserAssessments(ctx.user.id);
      if (!assessments || assessments.length === 0) return null;
      const latest = assessments[0];
      let fullReport: unknown = null;
      if (latest.fullReport) {
        try {
          fullReport = typeof latest.fullReport === 'string' ? JSON.parse(latest.fullReport) : latest.fullReport;
        } catch {
          fullReport = null;
        }
      }
      return {
        id: Number(latest.id) || 0,
        age: Number(latest.age) || 0,
        gender: String(latest.gender || ''),
        primaryType: String(latest.primaryType || ''),
        secondaryType: latest.secondaryType ? String(latest.secondaryType) : null,
        createdAt: latest.createdAt instanceof Date ? latest.createdAt.toISOString() : String(latest.createdAt ?? ''),
        fullReport,
      };
    }),
  }),

  invitation: router({
    // 生成邀请码
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const invitation = await createInvitation(ctx.user.id);
      return {
        inviteCode: invitation.inviteCode,
        inviteUrl: `${process.env.VITE_APP_URL || 'https://tcm-bti.manus.space'}?invite=${invitation.inviteCode}`,
      };
    }),

    // 查询邀请码信息
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const invitation = await getInvitationByCode(input.code);
        return invitation;
      }),

    // 完成邀请（被邀请人完成测评）
    complete: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await completeInvitation(input.code, ctx.user.id);
        return { success: true };
      }),

    // 获取用户的邀请统计
    myStats: protectedProcedure.query(async ({ ctx }) => {
      return getUserInviteStats(ctx.user.id);
    }),
  }),

  // 管理员认证相关接口
  admin: router({
    // 管理员登录
    login: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const admin = await verifyAdminLogin(input.username, input.password);
        if (!admin) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '用户名或密码错误',
          });
        }
        
        // 设置Cookie保存管理员登录状态
        ctx.res.cookie('admin_id', admin.id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
          sameSite: 'lax',
        });
        
        return {
          success: true,
          admin: {
            id: admin.id,
            username: admin.username,
          },
        };
      }),

    // 检查登录状态
    checkAuth: publicProcedure
      .query(async ({ ctx }) => {
        const adminId = ctx.req.cookies.admin_id;
        if (!adminId) {
          return { isAuthenticated: false };
        }
        
        const admin = await getAdminById(parseInt(adminId));
        
        if (!admin) {
          return { isAuthenticated: false };
        }
        
        return {
          isAuthenticated: true,
          admin: {
            id: admin.id,
            username: admin.username,
          },
        };
      }),

    // 退出登录
    logout: publicProcedure
      .mutation(async ({ ctx }) => {
        ctx.res.clearCookie('admin_id');
        return { success: true };
      }),

    // 初始化管理员账户（仅当没有管理员时可用）
    initialize: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        // 检查是否已有管理员
        const hasAdmin = await hasAdminUsers();
        if (hasAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '管理员账户已存在',
          });
        }
        
        const admin = await createAdminUser(input.username, input.password);
        if (!admin) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '创建管理员账户失败',
          });
        }
        
        return {
          success: true,
          message: '管理员账户创建成功',
        };
      }),

    // 检查是否需要初始化
    needsInitialization: publicProcedure
      .query(async () => {
        const hasAdmin = await hasAdminUsers();
        return { needsInitialization: !hasAdmin };
      }),
  }),

  // AI中医对话接口
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(['system', 'user', 'assistant']),
              content: z.string(),
            })
          ),
          bodyType: z.string().nullish(), // 用户主要体质类型，用于上下文
          secondaryType: z.string().nullish(), // 用户次要体质类型
          age: z.number().nullish(), // 用户年龄（允许 null）
          gender: z.string().nullish(), // 用户性别（允许 null）
          fullReport: z.any().nullish(), // 完整测试结果（包含dimensions等详细信息）
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // 记录用户登录状态
          console.log(`[AI Chat] 请求开始 - 用户登录状态: ${ctx.user ? `已登录 (ID: ${ctx.user.id}, openId: ${ctx.user.openId.substring(0, 10)}...)` : '未登录'}`);
          console.log(`[AI Chat] 请求头信息 - x-session-token: ${ctx.req.headers['x-session-token'] ? '有' : '无'}, X-Session-Token: ${ctx.req.headers['X-Session-Token'] ? '有' : '无'}, Cookie: ${ctx.req.headers.cookie ? '有' : '无'}`);
          
          // 构建用户信息描述
          const userInfoParts: string[] = [];
          
          // 获取年龄、性别和体质类型的优先级：
          // 1. 如果前端传入了age和gender（从历史记录进入），优先使用这些值（基于点击的那次测评）
          // 2. 如果前端没有传入（从"我的"页面进入），使用最近一次测评的数据
          let finalAge: number | undefined = undefined;
          let finalGender: string | undefined = undefined;
          let finalBodyType: string | undefined = undefined;
          let finalSecondaryType: string | undefined = undefined;
          let latestAssessmentCreatedAt: Date | string | undefined = undefined; // 最后一次测试时间，用于上下文

          // 优先使用前端传入的值（从历史记录进入或前端主动获取的数据）
          // 注意：只有明确传入有效值时才使用，undefined/null/空字符串都视为未传入
          // 前端传入的数据优先级最高，即使后端认证失败也能使用
          if (input.age != null && input.age !== undefined) {
            finalAge = input.age;
            console.log(`[AI Chat] 使用前端传入的年龄: ${finalAge}`);
          }
          if (input.gender && input.gender.trim() !== '') {
            finalGender = input.gender;
            console.log(`[AI Chat] 使用前端传入的性别: ${finalGender}`);
          }
          if (input.bodyType && input.bodyType.trim() !== '') {
            finalBodyType = input.bodyType;
            console.log(`[AI Chat] 使用前端传入的体质类型: ${finalBodyType}`);
          }
          if (input.secondaryType && input.secondaryType.trim() !== '') {
            finalSecondaryType = input.secondaryType;
            console.log(`[AI Chat] 使用前端传入的次要体质类型: ${finalSecondaryType}`);
          }
          
          // 如果前端没有传入，从最近一次测试记录中获取（从"我的"页面进入）
          // 判断是否从历史记录进入：如果前端明确传入了age、gender或bodyType（非空值），说明是从历史记录进入
          const isFromHistory = (input.age != null && input.age !== undefined) || (input.gender && input.gender.trim() !== '') || (input.bodyType && input.bodyType.trim() !== '');
          
          // 如果用户已登录，且不是从历史记录进入，则从最近一次测试记录获取数据
          // 这样确保即使用户从导航栏进入AI聊天页面，也能获取到最近一次测评数据
          if (ctx.user && !isFromHistory) {
            try {
              console.log(`[AI Chat] 用户已登录且不是从历史记录进入，从最近一次测试记录获取 - 用户ID: ${ctx.user.id}`);
              const assessments = await getUserAssessments(ctx.user.id);
              console.log(`[AI Chat] 获取到 ${assessments?.length || 0} 条测评记录`);
              if (assessments && assessments.length > 0) {
                const latestAssessment = assessments[0]; // 已经按时间倒序排列，第一条就是最新的
                console.log(`[AI Chat] 最近一次测试记录 - age: ${latestAssessment.age}, gender: ${latestAssessment.gender}, primaryType: ${latestAssessment.primaryType}`);
                // 如果前端没有传入，使用数据库中的数据
                if (!finalAge && latestAssessment.age) {
                  finalAge = latestAssessment.age;
                  console.log(`[AI Chat] 使用最近一次测试的年龄: ${finalAge}`);
                }
                if (!finalGender && latestAssessment.gender) {
                  finalGender = latestAssessment.gender;
                  console.log(`[AI Chat] 使用最近一次测试的性别: ${finalGender}`);
                }
                if (!finalBodyType && latestAssessment.primaryType) {
                  finalBodyType = latestAssessment.primaryType;
                  console.log(`[AI Chat] 使用最近一次测试的体质类型: ${finalBodyType}`);
                }
                if (!finalSecondaryType && latestAssessment.secondaryType) {
                  finalSecondaryType = latestAssessment.secondaryType;
                  console.log(`[AI Chat] 使用最近一次测试的次要体质类型: ${finalSecondaryType}`);
                }
                latestAssessmentCreatedAt = latestAssessment.createdAt;
                console.log(`[AI Chat] 最终使用的数据 - age: ${finalAge}, gender: ${finalGender}, bodyType: ${finalBodyType}, secondaryType: ${finalSecondaryType}`);
              } else {
                console.log(`[AI Chat] 用户 ${ctx.user.id} 没有测评记录`);
              }
            } catch (e) {
              console.error('[AI Chat] 获取测评记录失败:', e);
              console.error('[AI Chat] 错误堆栈:', e instanceof Error ? e.stack : '无堆栈信息');
            }
          } else if (ctx.user && isFromHistory) {
            console.log(`[AI Chat] 从历史记录进入，使用前端传入的特定测评数据`);
          } else if (!ctx.user) {
            console.log(`[AI Chat] 用户未登录，使用通用模式`);
            console.log(`[AI Chat] 调试信息 - req.cookies:`, Object.keys(ctx.req.cookies || {}));
          }
          
          // 构建体质类型描述
          if (finalBodyType) {
            let bodyTypeDesc = `体质类型：${finalBodyType}`;
            if (finalSecondaryType) {
              bodyTypeDesc += `，兼有${finalSecondaryType}`;
            }
            userInfoParts.push(bodyTypeDesc);
          }
          
          // 如果还是没有，尝试从用户信息中获取
          if (ctx.user && (!finalAge || !finalGender)) {
            // 尝试从用户信息中获取
            if (!finalGender && ctx.user.gender) {
              finalGender = ctx.user.gender;
            }
            
            // 如果有birthDate，计算年龄
            if (!finalAge && ctx.user.birthDate) {
              try {
                const birthDate = new Date(ctx.user.birthDate);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  finalAge = age - 1;
                } else {
                  finalAge = age;
                }
              } catch (e) {
                // 忽略日期解析错误
              }
            }
          }
          
          // 更新用户信息描述
          if (finalAge && !userInfoParts.some(p => p.includes('年龄'))) {
            userInfoParts.push(`年龄：${finalAge}岁`);
          }
          if (finalGender && !userInfoParts.some(p => p.includes('性别'))) {
            userInfoParts.push(`性别：${finalGender}`);
          }
          
          // 处理完整测试结果
          // 优先使用前端传入的fullReport（从历史记录或新测评进入时）
          let finalFullReport = input.fullReport;
          
          // 如果前端没有传入fullReport，且不是从历史记录进入，尝试从最近一次测评记录中获取（从"我的"页面进入）
          if (!finalFullReport && ctx.user && !isFromHistory) {
            try {
              const assessments = await getUserAssessments(ctx.user.id);
              if (assessments && assessments.length > 0) {
                const latestAssessment = assessments[0];
                if (!latestAssessmentCreatedAt && latestAssessment.createdAt) {
                  latestAssessmentCreatedAt = latestAssessment.createdAt;
                }
                if (latestAssessment.fullReport) {
                  try {
                    finalFullReport = typeof latestAssessment.fullReport === 'string' 
                      ? JSON.parse(latestAssessment.fullReport) 
                      : latestAssessment.fullReport;
                    console.log(`[AI Chat] 从最近一次测评记录获取fullReport`);
                  } catch (e) {
                    console.error('[AI Chat] 解析最近一次测评的fullReport失败:', e);
                  }
                }
              }
            } catch (e) {
              console.error('[AI Chat] 获取最近一次测评的fullReport失败:', e);
            }
          }
          
          // 如果有完整测试结果，添加：体质核心特征、基础养生建议、测试时间（规则要求必须调取）
          if (finalFullReport && typeof finalFullReport === 'object') {
            const fullReport = finalFullReport;
            if (fullReport.description && typeof fullReport.description === 'string') {
              userInfoParts.push(`体质核心特征：${fullReport.description}`);
            }
            if (fullReport.recommendations && typeof fullReport.recommendations === 'object') {
              const rec = fullReport.recommendations;
              const tips: string[] = [];
              if (rec.diet?.principle) tips.push(rec.diet.principle);
              if (rec.exercise) tips.push(`运动：${rec.exercise}`);
              if (rec.lifestyle) tips.push(`起居：${rec.lifestyle}`);
              if (tips.length > 0) {
                userInfoParts.push(`系统给出的基础养生建议：${tips.join('；')}`);
              }
            }
            if (fullReport.dimensions && Array.isArray(fullReport.dimensions)) {
              const dimensionInfo = fullReport.dimensions.map((d: any) => {
                if (d.dimension && d.scoreLeft !== undefined && d.scoreRight !== undefined) {
                  return `${d.dimension}: 左侧${d.scoreLeft}分, 右侧${d.scoreRight}分, 差值${d.diff || Math.abs(d.scoreLeft - d.scoreRight)}`;
                }
                return null;
              }).filter(Boolean).join('; ');
              if (dimensionInfo) {
                userInfoParts.push(`详细测试维度得分：${dimensionInfo}`);
              }
            }
          }
          if (latestAssessmentCreatedAt) {
            const timeStr = latestAssessmentCreatedAt instanceof Date
              ? latestAssessmentCreatedAt.toISOString().slice(0, 10)
              : String(latestAssessmentCreatedAt).slice(0, 10);
            userInfoParts.push(`测试时间：${timeStr}`);
          }
          
          // 构建用户信息文本
          // 判断数据来源：如果前端传入了age、gender或bodyType，说明是从历史记录进入（使用特定测评数据）
          // 否则是从"我的"页面进入（使用最近一次测评数据）
          const isFromHistory = (input.age != null && input.age !== undefined) || (input.gender && input.gender.trim() !== '') || (input.bodyType && input.bodyType.trim() !== '');
          let userInfoText = '';
          if (userInfoParts.length > 0) {
            const hasAgeOrGender = userInfoParts.some(p => p.includes('年龄') || p.includes('性别'));
            const prefix = hasAgeOrGender 
              ? (isFromHistory ? '当前咨询用户的基本信息（基于用户选择的测评记录）：' : '当前咨询用户的基本信息（基于最近一次测试）：')
              : '当前咨询用户的基本信息：';
            userInfoText = `${prefix}${userInfoParts.join('，')}。`;
          }
          
          // 构建系统提示词（角色定位 + 强制数据调取规则）
          let systemContent = `【角色定位】你是微信小程序中专业、亲切的中医养生助手，精通中医体质理论和日常养生知识，核心服务于完成过中医体质测试的用户，交互风格温和、易懂，符合大众对中医养生的认知习惯。`;
          systemContent += `【数据调取】只要检测到用户已登录，必须优先使用其「最后一次中医体质测试结果」展开回复，结果包含：体质类型、体质核心特征、测试时间、系统给出的基础养生建议。所有回复必须基于该结果展开，禁止脱离该结果泛泛回答养生问题。`;
          systemContent += `【回复开头】有体质数据时，回复开头需主动提及用户体质并关联体质特征，例如："你是XX质，针对你容易[体质特征，如口干舌燥]的情况，建议……"。`;
          
          // 检查用户登录状态和测评状态
          const isLoggedIn = !!ctx.user;
          
          // 如果前端传入了数据，优先使用前端的数据（即使后端认证失败，也能使用前端数据）
          // 如果前端没有传入数据，且用户已登录，尝试从数据库获取
          if (!finalBodyType && !(finalAge && finalGender)) {
            if (isLoggedIn && !isFromHistory) {
              console.log(`[AI Chat] 前端未传入数据且用户已登录，从数据库获取最近一次测评记录 - 用户ID: ${ctx.user.id}`);
              try {
                const retryAssessments = await getUserAssessments(ctx.user.id);
                console.log(`[AI Chat] 数据库查询 - 获取到 ${retryAssessments?.length || 0} 条测评记录`);
                if (retryAssessments && retryAssessments.length > 0) {
                  const retryLatest = retryAssessments[0];
                  console.log(`[AI Chat] 数据库查询结果 - primaryType: ${retryLatest.primaryType}, age: ${retryLatest.age}, gender: ${retryLatest.gender}`);
                  if (!finalBodyType && retryLatest.primaryType) {
                    finalBodyType = retryLatest.primaryType;
                    console.log(`[AI Chat] 从数据库设置 bodyType: ${finalBodyType}`);
                  }
                  if (!finalAge && retryLatest.age) {
                    finalAge = retryLatest.age;
                    console.log(`[AI Chat] 从数据库设置 age: ${finalAge}`);
                  }
                  if (!finalGender && retryLatest.gender) {
                    finalGender = retryLatest.gender;
                    console.log(`[AI Chat] 从数据库设置 gender: ${finalGender}`);
                  }
                  if (!finalSecondaryType && retryLatest.secondaryType) {
                    finalSecondaryType = retryLatest.secondaryType;
                    console.log(`[AI Chat] 从数据库设置 secondaryType: ${finalSecondaryType}`);
                  }
                } else {
                  console.log(`[AI Chat] 数据库查询 - 用户 ${ctx.user.id} 没有测评记录`);
                }
              } catch (retryError) {
                console.error('[AI Chat] 数据库查询失败:', retryError);
                console.error('[AI Chat] 错误堆栈:', retryError instanceof Error ? retryError.stack : '无堆栈信息');
              }
            } else if (!isLoggedIn) {
              console.log(`[AI Chat] 前端未传入数据且用户未登录，无法从数据库获取数据`);
            } else if (isFromHistory) {
              console.log(`[AI Chat] 从历史记录进入，但前端未传入数据，这不应该发生`);
            }
          }
          
          // 判断是否有有效的用户信息（有体质类型或年龄性别等）
          // 重要：只要请求里带了体质/测评数据（前端可能从本地缓存或历史传入），就按「有最后一次结果」走个性化，不依赖登录态
          const hasUserInfo = !!(finalBodyType || (finalAge && finalGender));
          const usedLastAssessment = hasUserInfo; // 是否使用了最后一次测评结果（用于前端展示「个人订制助手」）
          
          console.log(`[AI Chat] 最终状态 - isLoggedIn: ${isLoggedIn}, hasUserInfo: ${hasUserInfo}, usedLastAssessment: ${usedLastAssessment}, finalBodyType: ${finalBodyType}, finalAge: ${finalAge}, finalGender: ${finalGender}`);
          console.log(`[AI Chat] 前端传入的参数 - bodyType: ${input.bodyType}, age: ${input.age}, gender: ${input.gender}, secondaryType: ${input.secondaryType}`);
          console.log(`[AI Chat] isFromHistory: ${isFromHistory}`);
          
          // 根据「是否有测评结果」优先；有结果即走个性化，无结果再区分未登录/已登录无测评
          if (hasUserInfo) {
            // 有最后一次测评结果（来自登录后拉取或前端传入）：强制走个性化，禁止通用回复
            console.log(`[AI Chat] 使用个性化模式（已调取最后一次测评结果）`);
            const dataSource = isFromHistory ? '用户选择的测评记录' : (isLoggedIn ? '用户最近一次测试' : '前端传入的测评数据');
            if (userInfoText) {
              systemContent += `${userInfoText}当用户询问年龄、性别、体质类型等基本信息时，请直接根据上述信息回答。例如，如果用户问"我的年龄是多少"或"我的性别是"，你应该直接回答具体的年龄和性别（这些信息来自${dataSource}），不要说"我无法获取"或"请告诉我"之类的话。`;
            } else {
              // 即使没有完整的userInfoText，只要有体质类型，也应该提供个性化建议
              if (finalBodyType) {
                const sourceDesc = isFromHistory ? '根据您选择的测评记录' : '根据您最近一次测评结果';
                systemContent += `${sourceDesc}，您的体质类型是${finalBodyType}${finalSecondaryType ? `，兼有${finalSecondaryType}` : ''}。`;
                if (finalAge) systemContent += `年龄${finalAge}岁。`;
                if (finalGender) systemContent += `性别${finalGender}。`;
              }
            }
            systemContent += `请结合用户的这些信息（包括年龄、性别、体质类型、生活习惯等），用专业但易懂的语言回答用户的问题，提供个性化的中医养生建议。`;
            if (finalBodyType) {
              systemContent += `重要：用户的体质类型是${finalBodyType}${finalSecondaryType ? `（兼有${finalSecondaryType}）` : ''}。这是基于用户完成的体质测评结果得出的确定判断，不是推测。回答时必须：`;
              systemContent += `1. 直接说明"您的体质是${finalBodyType}"或"根据您的测评结果，您的体质是${finalBodyType}"，绝对不要使用"可能"、"也许"、"或许"等不确定的措辞；`;
              systemContent += `2. 专门针对${finalBodyType}体质的特点给出建议，不要提供通用的多体质建议，不要列举其他体质类型的建议；`;
              systemContent += `3. 不要建议用户"完成测评"或"进行更精准判断"，因为用户已经完成了测评并得到了确定的结果。`;
            }
          } else if (!isLoggedIn) {
            // 场景3：未登录且无测评数据
            console.log(`[AI Chat] 使用通用模式（未登录）`);
            systemContent += `当前用户未登录。当用户询问养生或体质相关时，必须回复："建议你先登录小程序并完成中医体质测试，能更精准地给你定制养生建议哦～完成测试后，你可以问我：1. 我的体质适合吃什么水果？2. 针对我的体质，日常该怎么作息？"`;
          } else {
            // 场景2：已登录但无测试结果
            console.log(`[AI Chat] 使用通用模式（已登录但无测评数据）`);
            console.log(`[AI Chat] 调试信息 - ctx.user.id: ${ctx.user.id}`);
            systemContent += `当前用户已登录但暂未查询到中医体质测试结果。你必须明确告知："暂未查询到你的中医体质测试结果，建议先完成测试，我会根据你的专属体质给你精准的养生建议～"然后给出引导："完成测试后，你可以问我：1. 我的体质适合吃什么水果？2. 针对我的体质，日常该怎么作息？"`;
          }

          // 引导式问答：必须绑定体质，格式「针对你的XX质，我还可以解答：1. 2. 3.」；偏离主题时拉回并关联体质
          systemContent += `【引导式问答】每次回复后必须在末尾给出2-3个与用户体质强相关的引导问题，用数字序号（1. 2. 3.）标注。格式示例："针对你的${finalBodyType || 'XX'}质，我还可以解答：1. XX质适合的睡前养生小动作？2. XX质适合喝的温补养生茶？"禁止给出未关联体质的空泛选项（如"养生茶有哪些？"）。若用户偏离养生主题，先拉回并关联体质："咱们聊聊和你的[XX质]相关的养生知识吧～比如：1. XX质秋冬调理重点？2. XX质避免吃的食物？"`;
          systemContent += `【语气与表达】语言亲切自然，避免专业术语堆砌；若使用中医术语需附带简单解释。回复长度控制在小程序单屏可阅读范围内，引导问题单独分行。以用户体质数据为核心，不强行引导；若用户明确拒绝某类问题，及时调整方向但仍需关联体质。`;
          systemContent += `回答正文简洁明了，控制在200字以内。`;
          
          const systemMessage: Message = {
            role: 'system',
            content: systemContent,
          };

          // 构建消息列表
          const messages: Message[] = [
            systemMessage,
            ...input.messages.map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })),
          ];

          // 调用LLM（优先使用国内AI服务）
          let result;
          let lastError: any = null;
          
          try {
            // 尝试使用国内AI服务
            console.log('[AI Chat] 尝试使用国内AI服务...');
            result = await invokeChineseLLM({ messages });
            console.log('[AI Chat] 国内AI服务调用成功');
          } catch (error: any) {
            lastError = error;
            console.warn('[AI Chat] 国内AI服务失败:', error.message);
            
            // 如果国内服务失败，尝试使用原有服务
            try {
              console.log('[AI Chat] 尝试使用备用服务（Forge API）...');
              result = await invokeLLM({ messages });
              console.log('[AI Chat] 备用服务调用成功');
            } catch (fallbackError: any) {
              console.error('[AI Chat] 备用服务也失败:', fallbackError.message);
              
              // 提供更详细的错误信息
              const errorDetails = [];
              errorDetails.push(`国内AI服务错误: ${error.message}`);
              errorDetails.push(`备用服务错误: ${fallbackError.message}`);
              
              // 检查配置问题
              const aiApiKey = process.env.AI_API_KEY || '';
              const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY || '';
              
              if (!aiApiKey && !forgeApiKey) {
                throw new Error('AI服务配置错误：AI_API_KEY 和 BUILT_IN_FORGE_API_KEY 都未配置。请至少配置其中一个。');
              } else if (!aiApiKey) {
                throw new Error(`国内AI服务配置错误：AI_API_KEY 未配置。错误详情: ${error.message}`);
              } else if (!forgeApiKey) {
                throw new Error(`备用服务配置错误：BUILT_IN_FORGE_API_KEY 未配置。错误详情: ${fallbackError.message}`);
              } else {
                throw new Error(`所有AI服务都不可用。${errorDetails.join('; ')}`);
              }
            }
          }

          // 提取回复内容
          const responseContent = result.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

          // 生成引导问题：2-3 条，与当前主题强相关，贴合体质（规则要求）
          let suggestedQuestions: string[] = [];
          const answerLower = responseContent.toLowerCase();

          // 根据回答内容关键词匹配 2-3 条引导问题（贴合体质表述）
          if (answerLower.includes('运动') || answerLower.includes('锻炼') || answerLower.includes('活动') || answerLower.includes('八段锦') || answerLower.includes('太极') || answerLower.includes('慢跑') || answerLower.includes('游泳')) {
            suggestedQuestions = finalBodyType
              ? [`${finalBodyType}适合的日常运动有哪些？`, `${finalBodyType}运动时要注意什么？`, '有什么不适合的运动？']
              : ['适合做什么类型的运动？', '运动时需要注意什么？'];
          } else if (answerLower.includes('食物') || answerLower.includes('饮食') || answerLower.includes('吃') || answerLower.includes('忌') || answerLower.includes('清淡') || answerLower.includes('油腻') || answerLower.includes('辛辣')) {
            suggestedQuestions = finalBodyType
              ? [`${finalBodyType}适合的早餐搭配？`, '有什么忌口的吗？', '可以吃哪些水果？']
              : ['具体推荐哪些食物？', '饮食有什么注意事项？'];
          } else if (answerLower.includes('特点') || answerLower.includes('特征') || answerLower.includes('表现') || answerLower.includes('症状')) {
            suggestedQuestions = finalBodyType
              ? [`${finalBodyType}有什么典型表现？`, '体质会变化吗？', '日常需要注意什么？']
              : ['这种体质有什么症状？', '需要注意什么？'];
          } else if (answerLower.includes('调理') || answerLower.includes('改善') || answerLower.includes('调养') || answerLower.includes('治疗')) {
            suggestedQuestions = finalBodyType
              ? [`${finalBodyType}日常怎么调理？`, '调理大概要多久？', '有什么简单可坚持的方法？']
              : ['如何调理这种体质？', '有什么快速改善的方法？'];
          } else {
            // 通用：贴合体质的 2-3 条引导
            if (finalBodyType) {
              suggestedQuestions = [
                `${finalBodyType}适合的日常运动有哪些？`,
                `${finalBodyType}适合的早餐或茶饮？`,
                `${finalBodyType}熬夜后该怎么调理？`,
              ];
            } else {
              suggestedQuestions = [
                '我的体质适合吃什么水果？',
                '针对我的体质，日常该怎么作息？',
                '有什么简单的养生小习惯？',
              ];
            }
          }

          // 只返回 2-3 条，符合规则
          suggestedQuestions = suggestedQuestions.slice(0, 3);
          if (suggestedQuestions.length === 0) {
            suggestedQuestions = finalBodyType
              ? [`${finalBodyType}有什么特点？`, `${finalBodyType}适合吃什么？`]
              : ['我的体质有什么特点？', '适合吃什么食物？'];
          }

          console.log('[AI Chat] 返回引导问题:', suggestedQuestions);
          console.log('[AI Chat] 回答内容:', responseContent.substring(0, 100));

          return {
            success: true,
            content: responseContent,
            suggestedQuestions: suggestedQuestions,
            usedLastAssessment, // 是否已使用最后一次测评结果，前端可据此展示「个人订制助手」或「通用养生助手」
            bodyTypeUsed: finalBodyType ?? undefined, // 本次使用的体质类型，便于前端展示
          };
        } catch (error: any) {
          console.error('[AI Chat] Error:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'AI服务暂时不可用，请稍后重试',
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
