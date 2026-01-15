import { eq } from "drizzle-orm";
import { invitations, type InsertInvitation, type Invitation } from "../drizzle/schema";
import { getDb } from "./db";
import { nanoid } from "nanoid";

/**
 * 生成邀请码
 */
export function generateInviteCode(): string {
  return nanoid(10);
}

/**
 * 创建邀请记录
 */
export async function createInvitation(inviterId: number): Promise<Invitation> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const inviteCode = generateInviteCode();

  const [result] = await db.insert(invitations).values({
    inviterId,
    inviteCode,
    status: "pending",
  }).$returningId();

  if (!result) {
    throw new Error("Failed to create invitation");
  }

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, result.id))
    .limit(1);

  if (!invitation) {
    throw new Error("Failed to retrieve created invitation");
  }

  return invitation;
}

/**
 * 根据邀请码查询邀请记录
 */
export async function getInvitationByCode(inviteCode: string): Promise<Invitation | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.inviteCode, inviteCode))
    .limit(1);

  return invitation;
}

/**
 * 完成邀请（被邀请人完成测评）
 */
export async function completeInvitation(inviteCode: string, inviteeId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(invitations)
    .set({
      inviteeId,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(invitations.inviteCode, inviteCode));
}

/**
 * 获取用户的邀请统计
 */
export async function getUserInviteStats(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const userInvitations = await db
    .select()
    .from(invitations)
    .where(eq(invitations.inviterId, userId));

  const totalInvites = userInvitations.length;
  const completedInvites = userInvitations.filter(inv => inv.status === "completed").length;
  const pendingInvites = totalInvites - completedInvites;

  return {
    totalInvites,
    completedInvites,
    pendingInvites,
    invitations: userInvitations,
  };
}
