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
        return assessments.map((a) => ({
          ...a,
          habits: JSON.parse(a.habits),
          answers: JSON.parse(a.answers),
          scores: JSON.parse(a.scores),
          fullReport: JSON.parse(a.fullReport),
        }));
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
          bodyType: z.string().optional(), // 用户主要体质类型，用于上下文
          secondaryType: z.string().optional(), // 用户次要体质类型
          age: z.number().optional(), // 用户年龄
          gender: z.string().optional(), // 用户性别
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // 构建用户信息描述
          const userInfoParts: string[] = [];
          
          // 构建体质类型描述
          if (input.bodyType) {
            let bodyTypeDesc = `体质类型：${input.bodyType}`;
            if (input.secondaryType) {
              bodyTypeDesc += `，兼有${input.secondaryType}`;
            }
            userInfoParts.push(bodyTypeDesc);
          }
          
          if (input.age) {
            userInfoParts.push(`年龄：${input.age}岁`);
          }
          
          if (input.gender) {
            userInfoParts.push(`性别：${input.gender}`);
          }
          
          // 如果没有传入这些信息，尝试从用户信息中获取
          let finalAge = input.age;
          let finalGender = input.gender;
          
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
            
            // 更新用户信息描述
            if (finalAge && !userInfoParts.some(p => p.includes('年龄'))) {
              userInfoParts.push(`年龄：${finalAge}岁`);
            }
            if (finalGender && !userInfoParts.some(p => p.includes('性别'))) {
              userInfoParts.push(`性别：${finalGender}`);
            }
          }
          
          const userInfoText = userInfoParts.length > 0 
            ? `当前咨询用户的基本信息：${userInfoParts.join('，')}。` 
            : '';
          
          // 构建系统提示词（中医专家角色）
          const systemMessage: Message = {
            role: 'system',
            content: `你是一位经验丰富的中医专家，擅长体质辨识和健康调理。${userInfoText}请结合用户的这些信息，用专业但易懂的语言回答用户的问题，提供个性化的中医养生建议。回答要简洁明了，控制在200字以内。`,
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

          return {
            success: true,
            content: responseContent,
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
