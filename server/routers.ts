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
        console.log(`[myAssessments] 查询用户 ${ctx.user.id} 的测评记录`);
        const assessments = await getUserAssessments(ctx.user.id);
        console.log(`[myAssessments] 查询成功，找到 ${assessments.length} 条记录`);
        
        // 安全解析 JSON 字段，避免解析错误
        // 处理两种情况：1. 字符串需要解析 2. 已经是对象
        const safeJsonParse = (value: any, defaultVal: any = null) => {
          try {
            // 如果已经是对象或数组，直接返回
            if (typeof value === 'object' && value !== null) {
              return value;
            }
            // 如果是字符串，尝试解析
            if (typeof value === 'string') {
              if (value.trim() === '') {
                return defaultVal;
              }
              return JSON.parse(value);
            }
            // 其他情况返回默认值
            return defaultVal;
          } catch (e) {
            console.error(`[myAssessments] JSON解析失败:`, typeof value === 'string' ? value?.substring(0, 100) : String(value));
            return defaultVal;
          }
        };
        
        // 安全序列化对象，确保可以正确传输
        const safeSerialize = (obj: any): any => {
          try {
            // 如果是基本类型，直接返回
            if (obj === null || obj === undefined) {
              return null;
            }
            if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
              return obj;
            }
            // 如果是 Date 对象，转换为字符串
            if (obj instanceof Date) {
              return obj.toISOString();
            }
            // 如果是对象或数组，使用 JSON 序列化确保可传输
            if (typeof obj === 'object') {
              return JSON.parse(JSON.stringify(obj));
            }
            return obj;
          } catch (e) {
            console.error(`[myAssessments] 序列化失败:`, e);
            return null;
          }
        };
        
        // 只返回最基本的字段，避免序列化问题
        return assessments.map((a) => {
          try {
            // 只返回 AI 聊天需要的基本字段，移除可能导致序列化问题的字段
            const result: any = {
              id: Number(a.id) || 0,
              userId: Number(a.userId) || 0,
              age: Number(a.age) || 0,
              gender: String(a.gender || ''),
              primaryType: String(a.primaryType || ''),
              secondaryType: a.secondaryType ? String(a.secondaryType) : null,
              fullReport: safeJsonParse(a.fullReport, null),
            };
            
            // 安全处理日期
            try {
              result.createdAt = a.createdAt instanceof Date 
                ? a.createdAt.toISOString() 
                : (typeof a.createdAt === 'string' 
                  ? a.createdAt 
                  : (a.createdAt ? new Date(a.createdAt as any).toISOString() : new Date().toISOString()));
            } catch {
              result.createdAt = new Date().toISOString();
            }
            
            try {
              result.updatedAt = a.updatedAt instanceof Date 
                ? a.updatedAt.toISOString() 
                : (typeof a.updatedAt === 'string' 
                  ? a.updatedAt 
                  : (a.updatedAt ? new Date(a.updatedAt as any).toISOString() : new Date().toISOString()));
            } catch {
              result.updatedAt = new Date().toISOString();
            }
            
            // 验证可以序列化
            JSON.stringify(result);
            
            return result;
          } catch (e) {
            console.error(`[myAssessments] 处理单条记录失败 - ID: ${a.id}`, e);
            // 返回绝对最小化的数据
            return {
              id: Number(a.id) || 0,
              userId: Number(a.userId) || 0,
              age: Number(a.age) || 0,
              gender: String(a.gender || ''),
              primaryType: String(a.primaryType || ''),
              secondaryType: a.secondaryType ? String(a.secondaryType) : null,
              fullReport: safeJsonParse(a.fullReport, null),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        });
      } catch (error: any) {
        console.error(`[myAssessments] 查询失败 - 用户ID: ${ctx.user.id}`, error);
        console.error(`[myAssessments] 错误详情:`, {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
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
          
          // 如果有完整测试结果，添加详细信息
          if (finalFullReport && typeof finalFullReport === 'object') {
            const fullReport = finalFullReport;
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
          
          // 构建用户信息文本（isFromHistory 已在前面定义）
          let userInfoText = '';
          if (userInfoParts.length > 0) {
            const hasAgeOrGender = userInfoParts.some(p => p.includes('年龄') || p.includes('性别'));
            const prefix = hasAgeOrGender 
              ? (isFromHistory ? '当前咨询用户的基本信息（基于用户选择的测评记录）：' : '当前咨询用户的基本信息（基于最近一次测试）：')
              : '当前咨询用户的基本信息：';
            userInfoText = `${prefix}${userInfoParts.join('，')}。`;
          }
          
          // 构建系统提示词（中医专家角色）
          let systemContent = `你是一位经验丰富的中医专家，擅长体质辨识和健康调理。`;
          
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
          const hasUserInfo = !!(finalBodyType || (finalAge && finalGender));
          
          console.log(`[AI Chat] 最终状态 - isLoggedIn: ${isLoggedIn}, hasUserInfo: ${hasUserInfo}, finalBodyType: ${finalBodyType}, finalAge: ${finalAge}, finalGender: ${finalGender}`);
          console.log(`[AI Chat] 前端传入的参数 - bodyType: ${input.bodyType}, age: ${input.age}, gender: ${input.gender}, secondaryType: ${input.secondaryType}`);
          console.log(`[AI Chat] isFromHistory: ${isFromHistory}`);
          
          // 根据登录和测评状态设置不同的提示
          if (!isLoggedIn) {
            // 未登录：通用养生助手
            console.log(`[AI Chat] 使用通用模式（未登录）`);
            systemContent += `当前用户未登录，你作为通用养生助手，提供一般性的中医养生建议。如果用户询问个人体质相关问题，可以提示用户登录并完成测评后可以获得个性化建议。`;
          } else if (!hasUserInfo) {
            // 已登录但无有效测评数据：通用养生助手
            console.log(`[AI Chat] 使用通用模式（已登录但无测评数据）`);
            console.log(`[AI Chat] 调试信息 - ctx.user.id: ${ctx.user.id}`);
            systemContent += `当前用户已登录但尚未完成测评或无法获取测评数据，你作为通用养生助手，提供一般性的中医养生建议。如果用户询问个人体质相关问题，可以提示用户完成测评后可以获得个性化建议。`;
          } else {
            // 已登录且有有效测评数据：个性化助手
            console.log(`[AI Chat] 使用个性化模式（已登录且有测评数据）`);
            // 已登录且有有效测评数据：个性化助手
            const dataSource = isFromHistory ? '用户选择的测评记录' : '用户最近一次测试';
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
          }
          
          systemContent += `回答要简洁明了，控制在200字以内。`;
          systemContent += `\n\n【输出格式】你的回复分两部分：\n1. 正文：直接回答用户问题（200字以内）。\n2. 建议追问：在正文后空一行，写「【建议追问】」作小标题，再换行列出4条用户最可能接着问的短问题（每条约20字内），站在用户角度，如「针对我的年龄，有哪些建议？」「像我这种情况，饮食有什么讲究？」。每条一行，不要序号。必须根据本次对话和用户当前问题实时生成这4条，不要写无关的通用问题。若实在不便列举可只写正文。`;
          
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
          let responseContent = result.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

          // 尝试从回复中解析「根据本次对话实时生成」的【建议追问】
          let suggestedQuestions: string[] = [];
          const suggestMatch = responseContent.match(/\n\s*【建议追问】\s*\n([\s\S]*)/);
          if (suggestMatch) {
            const mainContent = responseContent.slice(0, suggestMatch.index).trim();
            const suggestBlock = suggestMatch[1];
            const lines = suggestBlock
              .split(/\n/)
              .map((s) => s.replace(/^[\d\.、\-\*]\s*/, '').trim())
              .filter((s) => s.length > 0 && (s.includes('？') || s.includes('?')));
            suggestedQuestions = lines.slice(0, 4);
            if (mainContent.length > 0) {
              responseContent = mainContent;
            }
          }

          // 若未解析到建议追问，再用回答内容做关键词匹配兜底
          const answerLower = responseContent.toLowerCase();

          if (suggestedQuestions.length === 0) {
          // 按回答内容的关键词匹配「深入追问」类问题（紧扣当前话题，引导多问多答）
          const topicMatch = (
            keywords: string[],
            questions: string[]
          ): string[] =>
            keywords.some((k) => answerLower.includes(k)) ? questions : [];

          const pools: { keywords: string[]; questions: string[] }[] = [
            {
              keywords: ['运动', '锻炼', '活动', '八段锦', '太极', '慢跑', '游泳', '散步'],
              questions: [
                '针对我的情况，适合做什么运动？',
                '我运动时要注意什么？',
                '运动频率大概多少适合我？',
                '有没有不适合我的运动？',
              ],
            },
            {
              keywords: ['食物', '饮食', '吃', '忌', '清淡', '油腻', '辛辣', '水果', '食疗', '食谱'],
              questions: [
                '针对我的体质，饮食有什么讲究？',
                '有什么需要我忌口的？',
                '可以推荐几种适合我吃的食物吗？',
                '我平时适合常吃哪些水果？',
              ],
            },
            {
              keywords: ['特点', '特征', '表现', '症状', '体质'],
              questions: [
                '我这种体质平时容易有什么表现？',
                '我平时最需要留意什么？',
                '体质会随着调理改变吗？',
                '怎么判断自己是不是这种体质？',
              ],
            },
            {
              keywords: ['调理', '改善', '调养', '治疗', '养护'],
              questions: [
                '针对我的情况，日常可以怎么调理？',
                '有没有适合我的调理方法？',
                '调理大概要坚持多久？',
                '需要配合用药或治疗吗？',
              ],
            },
            {
              keywords: ['睡眠', '失眠', '睡觉', '熬夜', '休息'],
              questions: [
                '针对我的情况，睡眠上有什么建议？',
                '我容易失眠的话可以怎么做？',
                '我的作息要注意什么？',
              ],
            },
            {
              keywords: ['情绪', '心情', '压力', '肝气', '舒肝'],
              questions: [
                '情绪对我的体质有什么影响？',
                '我平时怎么调节情绪比较好？',
                '有什么适合我的疏肝小方法？',
              ],
            },
            {
              keywords: ['穴位', '按摩', '艾灸', '足三里', '推拿'],
              questions: [
                '针对我的体质，可以按哪些穴位？',
                '有什么适合我的简单按摩手法？',
                '我适合做艾灸吗？',
              ],
            },
            {
              keywords: ['茶', '代茶', '泡水', '菊花', '枸杞', '红枣'],
              questions: [
                '针对我的情况，适合喝什么代茶饮？',
                '我喝茶有什么讲究？',
                '有什么茶饮适合我长期喝？',
              ],
            },
            {
              keywords: ['季节', '四季', '春夏', '秋冬', '节气'],
              questions: [
                '针对我的体质，不同季节要注意什么？',
                '现在这个季节我该怎么养更合适？',
                '换季时我要注意哪些？',
              ],
            },
          ];

          for (const { keywords, questions } of pools) {
            if (keywords.some((k) => answerLower.includes(k))) {
              suggestedQuestions = questions;
              break;
            }
          }

            // 若无匹配，用「站在用户角度」的通用引导（结合年龄、体质）
            if (suggestedQuestions.length === 0) {
            if (finalBodyType) {
              suggestedQuestions = [
                '针对我的体质，平时要注意什么？',
                '针对我的体质，饮食有什么讲究？',
                finalAge ? '针对我的年龄，有哪些建议？' : '针对我的体质，有什么运动建议？',
                '还有哪些方面可以再聊聊？',
              ].filter(Boolean) as string[];
            } else {
              suggestedQuestions = [
                finalAge ? '针对我的年龄，有哪些建议？' : '我的体质有什么特点？',
                '像我这种情况，饮食有什么讲究？',
                '针对我的情况，有什么运动建议？',
                '我平时最需要留意什么？',
              ];
            }
          }
          }

          // 若数量不足 4 条，从「用户视角」的通用池里补足
          const curiosityPool = [
            '针对我的年龄，有哪些建议？',
            '针对我的体质，还有哪些要注意的？',
            '像我这种情况，日常有什么讲究？',
            '还有哪些方面可以再聊聊？',
          ];
          while (suggestedQuestions.length < 4 && curiosityPool.length > 0) {
            const i = Math.floor(Math.random() * curiosityPool.length);
            const q = curiosityPool.splice(i, 1)[0];
            if (q && !suggestedQuestions.includes(q)) {
              suggestedQuestions.push(q);
            }
          }
          suggestedQuestions = suggestedQuestions.slice(0, 4);

          // 兜底：确保至少有 4 条（用户视角）
          const fallback = [
            '针对我的年龄，有哪些建议？',
            '针对我的体质，平时要注意什么？',
            '像我这种情况，饮食有什么讲究？',
            '我平时最需要留意什么？',
          ];
          if (suggestedQuestions.length < 4) {
            suggestedQuestions = [...suggestedQuestions, ...fallback].slice(0, 4);
          }

          console.log('[AI Chat] 返回引导问题:', suggestedQuestions);
          console.log('[AI Chat] 回答内容:', responseContent.substring(0, 100));

          return {
            success: true,
            content: responseContent,
            suggestedQuestions: suggestedQuestions,
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
