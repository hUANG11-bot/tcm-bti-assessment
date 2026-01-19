// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  // 关联到users表（可选，用于OAuth用户）
  // 用户识别信息
  phone: varchar("phone", { length: 20 }),
  // 手机号，用于匿名用户识别
  // 用户基本信息
  age: int("age").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  habits: text("habits").notNull(),
  // JSON数组，存储生活习惯
  // 答题记录
  answers: text("answers").notNull(),
  // JSON对象，存储所有答案
  // 评估结果
  primaryType: varchar("primaryType", { length: 50 }).notNull(),
  // 主要体质类型
  secondaryType: varchar("secondaryType", { length: 50 }),
  // 次要体质类型（可选）
  scores: text("scores").notNull(),
  // JSON对象，存储各维度得分
  // 完整报告（JSON格式）
  fullReport: text("fullReport").notNull(),
  // 包含所有调理建议、穴位等
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  inviterId: int("inviterId").notNull(),
  // 邀请人用户ID
  inviteeId: int("inviteeId"),
  // 被邀请人用户ID（完成注册后填充）
  inviteCode: varchar("inviteCode", { length: 32 }).notNull().unique(),
  // 邀请码
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  // pending, completed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt")
  // 被邀请人完成测评的时间
});
var adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  // bcrypt加密后的密码
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt")
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // 国内AI服务配置
  aiProvider: process.env.AI_PROVIDER ?? "qwen",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiApiUrl: process.env.AI_API_URL ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod", "birthDate", "gender"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue, silent = false) {
    if (!cookieValue) {
      if (!silent) {
        console.warn("[Auth] Missing session cookie");
      }
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId: typeof appId === "string" ? appId : "",
        name: typeof name === "string" ? name : ""
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req, silent = false) {
    const cookies = this.parseCookies(req.headers.cookie);
    const headerSessionToken = (() => {
      const h = req?.headers ?? {};
      const raw = h["x-session-token"] ?? h["X-Session-Token"];
      return typeof raw === "string" && raw.trim() ? raw.trim() : null;
    })();
    const authHeaderToken = (() => {
      const h = req?.headers ?? {};
      const raw = h["authorization"] ?? h["Authorization"];
      if (typeof raw !== "string") return null;
      const m = raw.match(/^\s*Bearer\s+(.+)\s*$/i);
      return m && m[1] ? m[1].trim() : null;
    })();
    const sessionCookie = cookies.get(COOKIE_NAME) ?? headerSessionToken ?? authHeaderToken;
    const session = await this.verifySession(sessionCookie, silent);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";

// server/assessments.ts
import { eq as eq2, desc } from "drizzle-orm";
async function createAssessment(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(assessments).values(data).$returningId();
  if (!result) {
    throw new Error("Failed to create assessment");
  }
  const [assessment] = await db.select().from(assessments).where(eq2(assessments.id, result.id)).limit(1);
  if (!assessment) {
    throw new Error("Failed to retrieve created assessment");
  }
  return assessment;
}
async function getUserAssessments(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    return db.select({
      id: assessments.id,
      userId: assessments.userId,
      age: assessments.age,
      gender: assessments.gender,
      habits: assessments.habits,
      answers: assessments.answers,
      primaryType: assessments.primaryType,
      secondaryType: assessments.secondaryType,
      scores: assessments.scores,
      fullReport: assessments.fullReport,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt
    }).from(assessments).where(eq2(assessments.userId, userId)).orderBy(desc(assessments.createdAt));
  } catch (error) {
    console.error("[getUserAssessments] \u67E5\u8BE2\u5931\u8D25:", error);
    throw error;
  }
}
async function getAssessmentById(id) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [assessment] = await db.select().from(assessments).where(eq2(assessments.id, id)).limit(1);
  return assessment;
}
async function deleteAssessment(id, userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [assessment] = await db.select().from(assessments).where(eq2(assessments.id, id)).limit(1);
  if (!assessment) {
    throw new Error("Assessment not found");
  }
  if (assessment.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own assessments");
  }
  await db.delete(assessments).where(eq2(assessments.id, id));
  return true;
}
async function getAllAssessments() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.select().from(assessments).orderBy(desc(assessments.createdAt));
}
async function getAssessmentStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const allAssessments = await db.select().from(assessments);
  const typeDistribution = {};
  allAssessments.forEach((assessment) => {
    const type = assessment.primaryType;
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });
  const genderDistribution = {};
  allAssessments.forEach((assessment) => {
    const gender = assessment.gender;
    genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
  });
  const ageGroups = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-60": 0,
    "60+": 0
  };
  allAssessments.forEach((assessment) => {
    const age = assessment.age;
    if (age <= 25) ageGroups["18-25"]++;
    else if (age <= 35) ageGroups["26-35"]++;
    else if (age <= 45) ageGroups["36-45"]++;
    else if (age <= 60) ageGroups["46-60"]++;
    else ageGroups["60+"]++;
  });
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayAssessments = allAssessments.filter((a) => {
    const createdAt = new Date(a.createdAt);
    return createdAt >= today;
  }).length;
  const uniqueUserIds = new Set(
    allAssessments.map((a) => a.userId).filter((id) => id !== null && id !== void 0)
  );
  const uniquePhoneNumbers = new Set(
    allAssessments.map((a) => a.phone).filter((phone) => phone !== null && phone !== void 0)
  );
  const totalUsers = uniqueUserIds.size + uniquePhoneNumbers.size;
  return {
    totalAssessments: allAssessments.length,
    todayAssessments,
    totalUsers,
    typeDistribution,
    genderDistribution,
    ageGroups
  };
}

// server/invitations.ts
import { eq as eq3 } from "drizzle-orm";
import { nanoid } from "nanoid";
function generateInviteCode() {
  return nanoid(10);
}
async function createInvitation(inviterId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const inviteCode = generateInviteCode();
  const [result] = await db.insert(invitations).values({
    inviterId,
    inviteCode,
    status: "pending"
  }).$returningId();
  if (!result) {
    throw new Error("Failed to create invitation");
  }
  const [invitation] = await db.select().from(invitations).where(eq3(invitations.id, result.id)).limit(1);
  if (!invitation) {
    throw new Error("Failed to retrieve created invitation");
  }
  return invitation;
}
async function getInvitationByCode(inviteCode) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [invitation] = await db.select().from(invitations).where(eq3(invitations.inviteCode, inviteCode)).limit(1);
  return invitation;
}
async function completeInvitation(inviteCode, inviteeId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.update(invitations).set({
    inviteeId,
    status: "completed",
    completedAt: /* @__PURE__ */ new Date()
  }).where(eq3(invitations.inviteCode, inviteCode));
}
async function getUserInviteStats(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const userInvitations = await db.select().from(invitations).where(eq3(invitations.inviterId, userId));
  const totalInvites = userInvitations.length;
  const completedInvites = userInvitations.filter((inv) => inv.status === "completed").length;
  const pendingInvites = totalInvites - completedInvites;
  return {
    totalInvites,
    completedInvites,
    pendingInvites,
    invitations: userInvitations
  };
}

// server/admin-auth.ts
import { eq as eq4 } from "drizzle-orm";
import bcrypt from "bcryptjs";
async function createAdminUser(username, password) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create admin user: database not available");
    return null;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.insert(adminUsers).values({
    username,
    password: hashedPassword
  });
  const [newAdmin] = await db.select().from(adminUsers).where(eq4(adminUsers.username, username)).limit(1);
  return newAdmin || null;
}
async function verifyAdminLogin(username, password) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot verify admin login: database not available");
    return null;
  }
  const [admin] = await db.select().from(adminUsers).where(eq4(adminUsers.username, username)).limit(1);
  if (!admin) {
    return null;
  }
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return null;
  }
  await db.update(adminUsers).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq4(adminUsers.id, admin.id));
  return admin;
}
async function hasAdminUsers() {
  const db = await getDb();
  if (!db) {
    return false;
  }
  const admins = await db.select().from(adminUsers).limit(1);
  return admins.length > 0;
}
async function getAdminById(id) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const [admin] = await db.select().from(adminUsers).where(eq4(adminUsers.id, id)).limit(1);
  return admin || null;
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/_core/llm-chinese.ts
async function invokeQwen(messages, apiKey) {
  const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "qwen-turbo",
      // 或 qwen-plus, qwen-max
      input: {
        messages: messages.map((msg) => ({
          role: msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : "user",
          content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
        }))
      },
      parameters: {
        max_tokens: 2e3,
        temperature: 0.7
      }
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`\u901A\u4E49\u5343\u95EEAPI\u8C03\u7528\u5931\u8D25: ${response.status} ${response.statusText} \u2013 ${errorText}`);
  }
  const data = await response.json();
  return {
    id: data.request_id || `qwen-${Date.now()}`,
    created: Math.floor(Date.now() / 1e3),
    model: "qwen-turbo",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: data.output?.text || data.output?.choices?.[0]?.message?.content || "\u62B1\u6B49\uFF0C\u65E0\u6CD5\u751F\u6210\u56DE\u590D"
        },
        finish_reason: data.output?.finish_reason || "stop"
      }
    ],
    usage: data.usage ? {
      prompt_tokens: data.usage.input_tokens || 0,
      completion_tokens: data.usage.output_tokens || 0,
      total_tokens: data.usage.total_tokens || 0
    } : void 0
  };
}
async function invokeOpenAICompatible(messages, apiKey, apiUrl = "https://api.openai.com/v1/chat/completions") {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      // 或 gpt-4, 根据服务商调整
      messages: messages.map((msg) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
      })),
      max_tokens: 2e3,
      temperature: 0.7
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API\u8C03\u7528\u5931\u8D25: ${response.status} ${response.statusText} \u2013 ${errorText}`);
  }
  const data = await response.json();
  return {
    id: data.id || `openai-${Date.now()}`,
    created: data.created || Math.floor(Date.now() / 1e3),
    model: data.model || "gpt-3.5-turbo",
    choices: data.choices || [],
    usage: data.usage
  };
}
async function invokeDeepSeek(messages, apiKey) {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      // DeepSeek 模型名称
      messages: messages.map((msg) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
      })),
      max_tokens: 2e3,
      temperature: 0.7
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `DeepSeek API\u8C03\u7528\u5931\u8D25: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage += ` \u2013 ${errorData.error.message}`;
        if (response.status === 402 || errorData.error.message.includes("Balance") || errorData.error.message.includes("\u4F59\u989D")) {
          errorMessage = `DeepSeek\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3\u3002\u8BF7\u767B\u5F55 https://platform.deepseek.com \u5145\u503C\u540E\u91CD\u8BD5\u3002`;
        } else if (response.status === 401) {
          errorMessage = `DeepSeek API\u5BC6\u94A5\u65E0\u6548\u3002\u8BF7\u68C0\u67E5 .env \u6587\u4EF6\u4E2D\u7684 AI_API_KEY \u662F\u5426\u6B63\u786E\u3002`;
        } else if (response.status === 429) {
          errorMessage = `DeepSeek API\u8C03\u7528\u6B21\u6570\u8D85\u9650\u3002\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u68C0\u67E5\u4F7F\u7528\u91CF\u3002`;
        }
      }
    } catch {
      errorMessage += ` \u2013 ${errorText}`;
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return {
    id: data.id || `deepseek-${Date.now()}`,
    created: data.created || Math.floor(Date.now() / 1e3),
    model: data.model || "deepseek-chat",
    choices: data.choices || [],
    usage: data.usage
  };
}
async function invokeCustom(messages, apiKey, apiUrl) {
  return invokeOpenAICompatible(messages, apiKey, apiUrl);
}
async function invokeChineseLLM(params) {
  const { messages } = params;
  const provider = (process.env.AI_PROVIDER || "qwen").toLowerCase();
  const apiKey = process.env.AI_API_KEY || "";
  const apiUrl = process.env.AI_API_URL || "";
  if (!apiKey) {
    throw new Error("AI_API_KEY \u672A\u914D\u7F6E\uFF0C\u8BF7\u5728 .env \u6587\u4EF6\u4E2D\u8BBE\u7F6E");
  }
  try {
    switch (provider) {
      case "qwen":
        return await invokeQwen(messages, apiKey);
      case "openai":
        return await invokeOpenAICompatible(messages, apiKey, apiUrl || "https://api.openai.com/v1/chat/completions");
      case "deepseek":
        return await invokeDeepSeek(messages, apiKey);
      case "custom":
        if (!apiUrl) {
          throw new Error("\u4F7F\u7528 custom \u6A21\u5F0F\u65F6\uFF0C\u5FC5\u987B\u914D\u7F6E AI_API_URL");
        }
        return await invokeCustom(messages, apiKey, apiUrl);
      default:
        return await invokeQwen(messages, apiKey);
    }
  } catch (error) {
    console.error("[Chinese LLM] Error:", error);
    throw error;
  }
}

// server/routers.ts
import { eq as eq5 } from "drizzle-orm";
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    updateProfile: protectedProcedure.input(
      z2.object({
        birthDate: z2.string().optional(),
        gender: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const updateData = {};
      if (input.birthDate !== void 0) {
        updateData.birthDate = input.birthDate;
      }
      if (input.gender !== void 0) {
        updateData.gender = input.gender;
      }
      if (Object.keys(updateData).length === 0) {
        return ctx.user;
      }
      await db.update(users).set(updateData).where(eq5(users.id, ctx.user.id));
      const updated = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      return updated[0] || ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  assessment: router({
    // 创建新的测评记录
    create: protectedProcedure.input(
      z2.object({
        age: z2.number(),
        gender: z2.string(),
        habits: z2.array(z2.string()),
        answers: z2.record(z2.string(), z2.number()),
        primaryType: z2.string(),
        secondaryType: z2.string().optional(),
        scores: z2.record(z2.string(), z2.number()),
        fullReport: z2.any()
      })
    ).mutation(async ({ ctx, input }) => {
      const assessment = await createAssessment({
        userId: ctx.user.id,
        age: input.age,
        gender: input.gender,
        habits: JSON.stringify(input.habits),
        answers: JSON.stringify(input.answers),
        primaryType: input.primaryType,
        secondaryType: input.secondaryType || null,
        scores: JSON.stringify(input.scores),
        fullReport: JSON.stringify(input.fullReport)
      });
      return assessment;
    }),
    // 获取当前用户的测评历史
    myAssessments: protectedProcedure.query(async ({ ctx }) => {
      const assessments2 = await getUserAssessments(ctx.user.id);
      return assessments2.map((a) => ({
        ...a,
        habits: JSON.parse(a.habits),
        answers: JSON.parse(a.answers),
        scores: JSON.parse(a.scores),
        fullReport: JSON.parse(a.fullReport)
      }));
    }),
    // 获取当前用户的测评趋势数据（用于绘制曲线图）
    trendData: protectedProcedure.query(async ({ ctx }) => {
      const assessments2 = await getUserAssessments(ctx.user.id);
      const sorted = assessments2.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return sorted.map((a) => {
        const scores = JSON.parse(a.scores);
        return {
          id: a.id,
          date: a.createdAt,
          primaryType: a.primaryType,
          secondaryType: a.secondaryType,
          scores
        };
      });
    }),
    // 获取单条测评记录
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const assessment = await getAssessmentById(input.id);
      if (!assessment) {
        throw new Error("Assessment not found");
      }
      return {
        ...assessment,
        habits: JSON.parse(assessment.habits),
        answers: JSON.parse(assessment.answers),
        scores: JSON.parse(assessment.scores),
        fullReport: JSON.parse(assessment.fullReport)
      };
    }),
    // 删除测评记录
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteAssessment(input.id, ctx.user.id);
      return { success: true };
    }),
    // 管理员：获取所有测评记录
    all: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const assessments2 = await getAllAssessments();
      return assessments2.map((a) => ({
        ...a,
        habits: JSON.parse(a.habits),
        answers: JSON.parse(a.answers),
        scores: JSON.parse(a.scores),
        fullReport: JSON.parse(a.fullReport)
      }));
    }),
    // 管理员：获取统计数据
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getAssessmentStats();
    })
  }),
  invitation: router({
    // 生成邀请码
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const invitation = await createInvitation(ctx.user.id);
      return {
        inviteCode: invitation.inviteCode,
        inviteUrl: `${process.env.VITE_APP_URL || "https://tcm-bti.manus.space"}?invite=${invitation.inviteCode}`
      };
    }),
    // 查询邀请码信息
    getByCode: publicProcedure.input(z2.object({ code: z2.string() })).query(async ({ input }) => {
      const invitation = await getInvitationByCode(input.code);
      return invitation;
    }),
    // 完成邀请（被邀请人完成测评）
    complete: protectedProcedure.input(z2.object({ code: z2.string() })).mutation(async ({ ctx, input }) => {
      await completeInvitation(input.code, ctx.user.id);
      return { success: true };
    }),
    // 获取用户的邀请统计
    myStats: protectedProcedure.query(async ({ ctx }) => {
      return getUserInviteStats(ctx.user.id);
    })
  }),
  // 管理员认证相关接口
  admin: router({
    // 管理员登录
    login: publicProcedure.input(z2.object({
      username: z2.string().min(3).max(50),
      password: z2.string().min(6)
    })).mutation(async ({ input, ctx }) => {
      const admin = await verifyAdminLogin(input.username, input.password);
      if (!admin) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF"
        });
      }
      ctx.res.cookie("admin_id", admin.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        // 7天
        sameSite: "lax"
      });
      return {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username
        }
      };
    }),
    // 检查登录状态
    checkAuth: publicProcedure.query(async ({ ctx }) => {
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
          username: admin.username
        }
      };
    }),
    // 退出登录
    logout: publicProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie("admin_id");
      return { success: true };
    }),
    // 初始化管理员账户（仅当没有管理员时可用）
    initialize: publicProcedure.input(z2.object({
      username: z2.string().min(3).max(50),
      password: z2.string().min(6)
    })).mutation(async ({ input }) => {
      const hasAdmin = await hasAdminUsers();
      if (hasAdmin) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "\u7BA1\u7406\u5458\u8D26\u6237\u5DF2\u5B58\u5728"
        });
      }
      const admin = await createAdminUser(input.username, input.password);
      if (!admin) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u521B\u5EFA\u7BA1\u7406\u5458\u8D26\u6237\u5931\u8D25"
        });
      }
      return {
        success: true,
        message: "\u7BA1\u7406\u5458\u8D26\u6237\u521B\u5EFA\u6210\u529F"
      };
    }),
    // 检查是否需要初始化
    needsInitialization: publicProcedure.query(async () => {
      const hasAdmin = await hasAdminUsers();
      return { needsInitialization: !hasAdmin };
    })
  }),
  // AI中医对话接口
  ai: router({
    chat: publicProcedure.input(
      z2.object({
        messages: z2.array(
          z2.object({
            role: z2.enum(["system", "user", "assistant"]),
            content: z2.string()
          })
        ),
        bodyType: z2.string().optional()
        // 用户体质类型，用于上下文
      })
    ).mutation(async ({ input }) => {
      try {
        const systemMessage = {
          role: "system",
          content: `\u4F60\u662F\u4E00\u4F4D\u7ECF\u9A8C\u4E30\u5BCC\u7684\u4E2D\u533B\u4E13\u5BB6\uFF0C\u64C5\u957F\u4F53\u8D28\u8FA8\u8BC6\u548C\u5065\u5EB7\u8C03\u7406\u3002${input.bodyType ? `\u5F53\u524D\u54A8\u8BE2\u7528\u6237\u7684\u4F53\u8D28\u7C7B\u578B\u662F\uFF1A${input.bodyType}\u3002` : ""}\u8BF7\u7528\u4E13\u4E1A\u4F46\u6613\u61C2\u7684\u8BED\u8A00\u56DE\u7B54\u7528\u6237\u7684\u95EE\u9898\uFF0C\u63D0\u4F9B\u5B9E\u7528\u7684\u4E2D\u533B\u517B\u751F\u5EFA\u8BAE\u3002\u56DE\u7B54\u8981\u7B80\u6D01\u660E\u4E86\uFF0C\u63A7\u5236\u5728200\u5B57\u4EE5\u5185\u3002`
        };
        const messages = [
          systemMessage,
          ...input.messages.map((msg) => ({
            role: msg.role,
            content: msg.content
          }))
        ];
        let result;
        let lastError = null;
        try {
          console.log("[AI Chat] \u5C1D\u8BD5\u4F7F\u7528\u56FD\u5185AI\u670D\u52A1...");
          result = await invokeChineseLLM({ messages });
          console.log("[AI Chat] \u56FD\u5185AI\u670D\u52A1\u8C03\u7528\u6210\u529F");
        } catch (error) {
          lastError = error;
          console.warn("[AI Chat] \u56FD\u5185AI\u670D\u52A1\u5931\u8D25:", error.message);
          try {
            console.log("[AI Chat] \u5C1D\u8BD5\u4F7F\u7528\u5907\u7528\u670D\u52A1\uFF08Forge API\uFF09...");
            result = await invokeLLM({ messages });
            console.log("[AI Chat] \u5907\u7528\u670D\u52A1\u8C03\u7528\u6210\u529F");
          } catch (fallbackError) {
            console.error("[AI Chat] \u5907\u7528\u670D\u52A1\u4E5F\u5931\u8D25:", fallbackError.message);
            const errorDetails = [];
            errorDetails.push(`\u56FD\u5185AI\u670D\u52A1\u9519\u8BEF: ${error.message}`);
            errorDetails.push(`\u5907\u7528\u670D\u52A1\u9519\u8BEF: ${fallbackError.message}`);
            const aiApiKey = process.env.AI_API_KEY || "";
            const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY || "";
            if (!aiApiKey && !forgeApiKey) {
              throw new Error("AI\u670D\u52A1\u914D\u7F6E\u9519\u8BEF\uFF1AAI_API_KEY \u548C BUILT_IN_FORGE_API_KEY \u90FD\u672A\u914D\u7F6E\u3002\u8BF7\u81F3\u5C11\u914D\u7F6E\u5176\u4E2D\u4E00\u4E2A\u3002");
            } else if (!aiApiKey) {
              throw new Error(`\u56FD\u5185AI\u670D\u52A1\u914D\u7F6E\u9519\u8BEF\uFF1AAI_API_KEY \u672A\u914D\u7F6E\u3002\u9519\u8BEF\u8BE6\u60C5: ${error.message}`);
            } else if (!forgeApiKey) {
              throw new Error(`\u5907\u7528\u670D\u52A1\u914D\u7F6E\u9519\u8BEF\uFF1ABUILT_IN_FORGE_API_KEY \u672A\u914D\u7F6E\u3002\u9519\u8BEF\u8BE6\u60C5: ${fallbackError.message}`);
            } else {
              throw new Error(`\u6240\u6709AI\u670D\u52A1\u90FD\u4E0D\u53EF\u7528\u3002${errorDetails.join("; ")}`);
            }
          }
        }
        const responseContent = result.choices[0]?.message?.content || "\u62B1\u6B49\uFF0C\u6211\u6682\u65F6\u65E0\u6CD5\u56DE\u7B54\u8FD9\u4E2A\u95EE\u9898\u3002";
        return {
          success: true,
          content: responseContent
        };
      } catch (error) {
        console.error("[AI Chat] Error:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "AI\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"
        });
      }
    })
  })
});

// server/_core/context.ts
import { eq as eq6 } from "drizzle-orm";
async function createContext(opts) {
  let user = null;
  let adminId = null;
  try {
    user = await sdk.authenticateRequest(opts.req, true);
  } catch (error) {
    user = null;
  }
  const adminIdCookie = opts.req.cookies?.admin_id;
  if (adminIdCookie) {
    const admin = await getAdminById(parseInt(adminIdCookie));
    if (admin) {
      adminId = admin.id;
      if (!user) {
        const db = await getDb();
        if (db) {
          const adminOpenId = `admin_${admin.username}`;
          const existingUsers = await db.select().from(users).where(eq6(users.openId, adminOpenId)).limit(1);
          if (existingUsers.length > 0) {
            user = existingUsers[0];
          } else {
            await db.insert(users).values({
              openId: adminOpenId,
              name: `\u7BA1\u7406\u5458: ${admin.username}`,
              role: "admin",
              loginMethod: "admin"
            });
            const newUsers = await db.select().from(users).where(eq6(users.openId, adminOpenId)).limit(1);
            if (newUsers.length > 0) {
              user = newUsers[0];
            }
          }
        }
      } else {
        if (user.role !== "admin") {
          const db = await getDb();
          if (db) {
            await db.update(users).set({ role: "admin" }).where(eq6(users.id, user.id));
            user.role = "admin";
          }
        }
      }
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
    adminId
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
import cookieParser from "cookie-parser";

// server/api/admin-auth.ts
import { Router } from "express";
import { eq as eq7 } from "drizzle-orm";
import bcrypt2 from "bcryptjs";
var router2 = Router();
router2.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "\u6570\u636E\u5E93\u8FDE\u63A5\u5931\u8D25" });
    }
    const [admin] = await db.select().from(adminUsers).where(eq7(adminUsers.username, username)).limit(1);
    if (!admin) {
      return res.status(401).json({ error: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" });
    }
    const isValid = await bcrypt2.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" });
    }
    res.cookie("admin_id", admin.id.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7天
    });
    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" });
  }
});
router2.get("/check", async (req, res) => {
  try {
    const adminId = req.cookies.admin_id;
    if (!adminId) {
      return res.json({ isAuthenticated: false });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "\u6570\u636E\u5E93\u8FDE\u63A5\u5931\u8D25" });
    }
    const [admin] = await db.select().from(adminUsers).where(eq7(adminUsers.id, parseInt(adminId))).limit(1);
    if (!admin) {
      res.clearCookie("admin_id", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      return res.json({ isAuthenticated: false });
    }
    return res.json({
      isAuthenticated: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Check auth error:", error);
    return res.status(500).json({ error: "\u9A8C\u8BC1\u5931\u8D25" });
  }
});
router2.post("/logout", (req, res) => {
  res.clearCookie("admin_id", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  return res.json({ success: true });
});
var admin_auth_default = router2;

// server/api/history.ts
import { Router as Router2 } from "express";
import { eq as eq8 } from "drizzle-orm";
var router3 = Router2();
router3.get("/assessments/history", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ error: "\u8BF7\u63D0\u4F9B\u624B\u673A\u53F7" });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "\u624B\u673A\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "\u6570\u636E\u5E93\u8FDE\u63A5\u5931\u8D25" });
    }
    const records = await db.select({
      id: assessments.id,
      createdAt: assessments.createdAt,
      age: assessments.age,
      gender: assessments.gender,
      primaryType: assessments.primaryType,
      secondaryType: assessments.secondaryType,
      scores: assessments.scores
    }).from(assessments).where(eq8(assessments.phone, phone)).orderBy(assessments.createdAt);
    const formattedRecords = records.map((record) => ({
      ...record,
      scores: typeof record.scores === "string" ? JSON.parse(record.scores) : record.scores
    }));
    res.json(formattedRecords);
  } catch (error) {
    console.error("\u67E5\u8BE2\u5386\u53F2\u8BB0\u5F55\u5931\u8D25:", error);
    res.status(500).json({ error: "\u67E5\u8BE2\u5931\u8D25" });
  }
});
var history_default = router3;

// server/api/wechat-login.ts
import { Router as Router3 } from "express";
import axios2 from "axios";
import https from "https";
var router4 = Router3();
router4.post("/login", async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "\u5FAE\u4FE1\u767B\u5F55\u51ED\u8BC1 code \u4E0D\u80FD\u4E3A\u7A7A"
      });
    }
    const WX_APPID = process.env.WX_APPID || "wx04a7af67c8f47620";
    const WX_SECRET = process.env.WX_SECRET || "";
    if (!WX_SECRET) {
      console.error("[WeChat Login] WX_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "\u670D\u52A1\u5668\u914D\u7F6E\u9519\u8BEF\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458"
      });
    }
    const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
    console.log("[WeChat Login] Calling WeChat API with AppID:", WX_APPID);
    console.log("[WeChat Login] Code length:", code?.length || 0);
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
      // 在云托管环境中可能需要设置为 false
    });
    const wxResponse = await axios2.get(wxApiUrl, {
      httpsAgent,
      timeout: 1e4
      // 10秒超时
    });
    const wxData = wxResponse.data;
    if (wxData.errcode) {
      console.error("[WeChat Login] WeChat API error:", {
        errcode: wxData.errcode,
        errmsg: wxData.errmsg,
        appid: WX_APPID,
        hasSecret: !!WX_SECRET
      });
      let errorMessage = wxData.errmsg || "\u5FAE\u4FE1\u767B\u5F55\u5931\u8D25";
      if (wxData.errcode === 40013) {
        errorMessage = "AppID \u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E";
      } else if (wxData.errcode === 40125) {
        errorMessage = "AppSecret \u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E";
      } else if (wxData.errcode === 40029) {
        errorMessage = "\u767B\u5F55\u51ED\u8BC1\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55";
      } else if (wxData.errcode === 40163) {
        errorMessage = "\u767B\u5F55\u51ED\u8BC1\u5DF2\u88AB\u4F7F\u7528\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6";
      }
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errcode: wxData.errcode
      });
    }
    const { openid, session_key } = wxData;
    if (!openid) {
      return res.status(400).json({
        success: false,
        message: "\u83B7\u53D6\u7528\u6237 openid \u5931\u8D25"
      });
    }
    await upsertUser({
      openId: openid,
      name: userInfo?.nickName || null,
      email: null,
      loginMethod: "wechat_miniprogram",
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    const sessionToken = await sdk.createSessionToken(openid, {
      name: userInfo?.nickName || "",
      expiresInMs: ONE_YEAR_MS
    });
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS
    });
    return res.json({
      success: true,
      user: {
        openId: openid,
        name: userInfo?.nickName || null,
        avatar: userInfo?.avatarUrl || null
      },
      // 小程序需要手动管理 cookie，所以返回 token
      sessionToken
    });
  } catch (error) {
    console.error("[WeChat Login] Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"
    });
  }
});
var wechat_login_default = router4;

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use("/api/admin", admin_auth_default);
  app.use("/api", history_default);
  app.use("/api/wechat", wechat_login_default);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
