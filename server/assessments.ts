import { eq, desc } from "drizzle-orm";
import { assessments, type InsertAssessment, type Assessment } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * 创建新的测评记录
 */
export async function createAssessment(data: InsertAssessment): Promise<Assessment> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(assessments).values(data).$returningId();
  
  if (!result) {
    throw new Error("Failed to create assessment");
  }

  // 获取刚创建的记录
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, result.id))
    .limit(1);

  if (!assessment) {
    throw new Error("Failed to retrieve created assessment");
  }

  return assessment;
}

/**
 * 获取用户的所有测评记录
 */
export async function getUserAssessments(userId: number): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    return db
      .select({
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
        updatedAt: assessments.updatedAt,
      })
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  } catch (error) {
    console.error("[getUserAssessments] 查询失败:", error);
    throw error;
  }
}

/**
 * 获取单条测评记录
 */
export async function getAssessmentById(id: number): Promise<Assessment | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  return assessment;
}

/**
 * 删除测评记录（只能删除自己的记录）
 */
export async function deleteAssessment(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 先检查记录是否存在且属于该用户
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, id))
    .limit(1);

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own assessments");
  }

  // 删除记录
  await db
    .delete(assessments)
    .where(eq(assessments.id, id));

  return true;
}

/**
 * 获取所有测评记录（管理员用）
 */
export async function getAllAssessments(): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .select()
    .from(assessments)
    .orderBy(desc(assessments.createdAt));
}

/**
 * 统计数据
 */
export async function getAssessmentStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allAssessments = await db.select().from(assessments);

  // 统计体质分布
  const typeDistribution: Record<string, number> = {};
  allAssessments.forEach(assessment => {
    const type = assessment.primaryType;
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });

  // 统计性别分布
  const genderDistribution: Record<string, number> = {};
  allAssessments.forEach(assessment => {
    const gender = assessment.gender;
    genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
  });

  // 统计年龄分布
  const ageGroups: Record<string, number> = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-60": 0,
    "60+": 0,
  };
  allAssessments.forEach(assessment => {
    const age = assessment.age;
    if (age <= 25) ageGroups["18-25"]++;
    else if (age <= 35) ageGroups["26-35"]++;
    else if (age <= 45) ageGroups["36-45"]++;
    else if (age <= 60) ageGroups["46-60"]++;
    else ageGroups["60+"]++;
  });

  // 统计今日新增
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAssessments = allAssessments.filter(a => {
    const createdAt = new Date(a.createdAt);
    return createdAt >= today;
  }).length;

  // 统计用户总数（去重）
  const uniqueUserIds = new Set(
    allAssessments
      .map(a => a.userId)
      .filter(id => id !== null && id !== undefined)
  );
  const uniquePhoneNumbers = new Set(
    allAssessments
      .map(a => a.phone)
      .filter(phone => phone !== null && phone !== undefined)
  );
  const totalUsers = uniqueUserIds.size + uniquePhoneNumbers.size;

  return {
    totalAssessments: allAssessments.length,
    todayAssessments,
    totalUsers,
    typeDistribution,
    genderDistribution,
    ageGroups,
  };
}
