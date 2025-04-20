import { eq } from "drizzle-orm";
import { userFeedback, errorLogs, userActivity, users } from "@shared/schema";
import { db } from "./db";
import { DatabaseStorage } from "./storage";
import type { ErrorLog, InsertErrorLog, InsertUserActivityLog, InsertUserFeedback, User, UserActivityLog, UserFeedback } from "@shared/schema";

// Beta user operations
DatabaseStorage.prototype.createUserFeedback = async function(
  feedback: InsertUserFeedback
): Promise<UserFeedback> {
  const [newFeedback] = await db
    .insert(userFeedback)
    .values({
      ...feedback,
      status: "pending"
    })
    .returning();
  return newFeedback;
};

DatabaseStorage.prototype.getUserFeedback = async function(
  userId: number
): Promise<UserFeedback[]> {
  return db
    .select()
    .from(userFeedback)
    .where(eq(userFeedback.userId, userId))
    .orderBy(userFeedback.createdAt);
};

DatabaseStorage.prototype.updateUserBetaFeedbackStatus = async function(
  userId: number, 
  provided: boolean
): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({
      hasProvidedBetaFeedback: provided
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};

DatabaseStorage.prototype.updateUserOnboardingStatus = async function(
  userId: number, 
  completed: boolean
): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({
      onboardingCompleted: completed
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};

// Error tracking operations
DatabaseStorage.prototype.createErrorLog = async function(
  errorLog: InsertErrorLog
): Promise<ErrorLog> {
  const [newErrorLog] = await db
    .insert(errorLogs)
    .values(errorLog)
    .returning();
  return newErrorLog;
};

DatabaseStorage.prototype.getErrorLogs = async function(): Promise<ErrorLog[]> {
  return db
    .select()
    .from(errorLogs)
    .orderBy(errorLogs.createdAt);
};

// User analytics operations
DatabaseStorage.prototype.createUserActivityLog = async function(
  activityLog: InsertUserActivityLog
): Promise<UserActivityLog> {
  const [newLog] = await db
    .insert(userActivity)
    .values(activityLog)
    .returning();
  return newLog;
};

DatabaseStorage.prototype.getUserActivityLogs = async function(
  userId: number
): Promise<UserActivityLog[]> {
  return db
    .select()
    .from(userActivity)
    .where(eq(userActivity.userId, userId))
    .orderBy(userActivity.createdAt);
};