import { count, sum, eq, and, desc } from "drizzle-orm";
import { activities } from "@shared/schema";
import { db } from "./db";
import { DatabaseStorage } from "./storage";

// Achievement tracking methods
DatabaseStorage.prototype.getUserActivityCount = async function(userId: number): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(activities)
    .where(eq(activities.userId, userId));
  return result[0].count;
};

DatabaseStorage.prototype.getUserActivityCountByCategory = async function(userId: number, categoryId: number): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(activities)
    .where(and(
      eq(activities.userId, userId),
      eq(activities.categoryId, categoryId)
    ));
  return result[0].count;
};

DatabaseStorage.prototype.getUserConsecutiveDays = async function(userId: number): Promise<number> {
  // Get all user activities
  const userActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.date));
    
  if (userActivities.length === 0) return 0;
  
  // Count consecutive days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activityDays = new Set<string>();
  
  // Add all activity dates to a set
  userActivities.forEach(activity => {
    const date = new Date(activity.date);
    date.setHours(0, 0, 0, 0);
    activityDays.add(date.toISOString().split('T')[0]);
  });
  
  // Count backwards from today to find consecutive days
  let consecutiveDays = 0;
  const checkDate = new Date(today);
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (activityDays.has(dateStr)) {
      consecutiveDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return consecutiveDays;
};

DatabaseStorage.prototype.getUserCarbonReduction = async function(userId: number): Promise<number> {
  // Calculate the total carbon savings
  const result = await db
    .select({ total: sum(activities.carbonAmount) })
    .from(activities)
    .where(and(
      eq(activities.userId, userId),
      activities.carbonAmount.lt(0)
    ));
  
  return Math.abs(result[0].total || 0);
};

DatabaseStorage.prototype.getUserMonthlyReductionPercentage = async function(userId: number): Promise<number> {
  // Calculate reduction % by comparing this month to previous month
  const today = new Date();
  
  // Current month range
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Previous month range
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  
  // Get carbon footprints for both months
  const currentMonthFootprint = await this.getUserCarbonFootprint(userId, currentMonthStart, currentMonthEnd);
  const previousMonthFootprint = await this.getUserCarbonFootprint(userId, previousMonthStart, previousMonthEnd);
  
  // If no previous month data, return 0
  if (previousMonthFootprint === 0) return 0;
  
  // Calculate reduction percentage
  const reductionPercentage = ((previousMonthFootprint - currentMonthFootprint) / previousMonthFootprint) * 100;
  
  // Return 0 if reduction is negative (i.e., increase)
  return Math.max(0, reductionPercentage);
};

// Add the updateUserAchievement method
DatabaseStorage.prototype.updateUserAchievement = async function(
  id: number, 
  data: Partial<any>
): Promise<any> {
  const [updatedUserAchievement] = await db
    .update(userAchievements)
    .set({
      progress: data.progress !== undefined ? data.progress : undefined,
      isCompleted: data.isCompleted !== undefined ? data.isCompleted : undefined,
      dateEarned: data.dateEarned !== undefined ? data.dateEarned : undefined
    })
    .where(eq(userAchievements.id, id))
    .returning();
  
  return updatedUserAchievement;
};