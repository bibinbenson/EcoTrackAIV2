import { db } from './db';
import { eq, and, desc, count, sum } from 'drizzle-orm';
import { activities } from '@shared/schema';

// Achievement tracking methods for database storage
export const databaseAchievementTracking = {
  // Count total activities for a user
  async getUserActivityCount(userId: number): Promise<number> {
    const result = await db.select({ count: count() })
      .from(activities)
      .where(eq(activities.userId, userId));
    return result[0].count || 0;
  },

  // Count activities of a specific category for a user
  async getUserActivityCountByCategory(userId: number, categoryId: number): Promise<number> {
    const result = await db.select({ count: count() })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          eq(activities.categoryId, categoryId)
        )
      );
    return result[0].count || 0;
  },

  // Count consecutive days with activities
  async getUserConsecutiveDays(userId: number): Promise<number> {
    // Get all user activities ordered by date
    const userActivities = await db.select()
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
  },

  // Calculate total carbon reduction (absolute value of negative carbon entries)
  async getUserCarbonReduction(userId: number): Promise<number> {
    // Calculate carbon savings (negative values represent reductions)
    const result = await db.select({ total: sum(activities.carbonAmount) })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          activities.carbonAmount.lt(0) // Less than 0 (negative values)
        )
      );
    
    // Convert negative values to positive (absolute value)
    return Math.abs(result[0]?.total || 0);
  },

  // Calculate monthly carbon reduction percentage
  async getUserMonthlyReductionPercentage(userId: number, storage: any): Promise<number> {
    // Calculate reduction % by comparing this month to previous month
    const today = new Date();
    
    // Current month range
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Previous month range
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Get carbon footprints for both months
    const currentMonthFootprint = await storage.getUserCarbonFootprint(userId, currentMonthStart, currentMonthEnd);
    const previousMonthFootprint = await storage.getUserCarbonFootprint(userId, previousMonthStart, previousMonthEnd);
    
    // If no previous month data, return 0
    if (previousMonthFootprint === 0) return 0;
    
    // Calculate reduction percentage
    const reductionPercentage = ((previousMonthFootprint - currentMonthFootprint) / previousMonthFootprint) * 100;
    
    // Return 0 if reduction is negative (i.e., increase)
    return Math.max(0, reductionPercentage);
  }
};