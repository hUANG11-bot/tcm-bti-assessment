import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("assessment.create", () => {
  it("should create a new assessment record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      age: 30,
      gender: "male",
      habits: ["sedentary", "screen_time"],
      answers: { "Q1": 3, "Q2": 4 },
      primaryType: "阴虚燥热",
      secondaryType: "气虚",
      scores: { "Y/A_left": 10, "Y/A_right": 15 },
      fullReport: {
        mainType: "阴虚燥热",
        compositeType: ["气虚"],
        description: "测试描述",
      },
    };

    const result = await caller.assessment.create(input);

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.userId).toBe(ctx.user.id);
    expect(result.age).toBe(input.age);
    expect(result.gender).toBe(input.gender);
    expect(result.primaryType).toBe(input.primaryType);
  });
});

describe("assessment.myAssessments", () => {
  it("should return user's assessment history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // 先创建一条记录
    await caller.assessment.create({
      age: 30,
      gender: "male",
      habits: ["sedentary"],
      answers: { "Q1": 3 },
      primaryType: "阴虚燥热",
      scores: { "Y/A_left": 10 },
      fullReport: { mainType: "阴虚燥热" },
    });

    const assessments = await caller.assessment.myAssessments();

    expect(Array.isArray(assessments)).toBe(true);
    expect(assessments.length).toBeGreaterThan(0);
    expect(assessments[0].userId).toBe(ctx.user.id);
  });
});

describe("assessment.stats", () => {
  it("should return statistics for admin users", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.assessment.stats();

    expect(stats).toBeDefined();
    expect(stats.totalCount).toBeGreaterThanOrEqual(0);
    expect(stats.typeDistribution).toBeDefined();
    expect(stats.genderDistribution).toBeDefined();
    expect(stats.ageGroups).toBeDefined();
  });

  it("should reject non-admin users", async () => {
    const ctx = createAuthContext("user"); // 非管理员
    const caller = appRouter.createCaller(ctx);

    await expect(caller.assessment.stats()).rejects.toThrow("Unauthorized");
  });
});

describe("assessment.all", () => {
  it("should return all assessments for admin users", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const assessments = await caller.assessment.all();

    expect(Array.isArray(assessments)).toBe(true);
  });

  it("should reject non-admin users", async () => {
    const ctx = createAuthContext("user"); // 非管理员
    const caller = appRouter.createCaller(ctx);

    await expect(caller.assessment.all()).rejects.toThrow("Unauthorized");
  });
});
