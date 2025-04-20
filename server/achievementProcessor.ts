import { storage } from './storage';
import { type Activity } from '@shared/schema';

/**
 * Processes user activities to check for and award achievements
 */
export class AchievementProcessor {
  /**
   * Process a new activity to check if it triggers any achievements
   * @param activity The newly added activity
   * @param userId The user who performed the activity
   */
  static async processActivity(activity: Activity, userId: number): Promise<void> {
    try {
      // Get all achievements from storage
      const achievements = await storage.getAllAchievements();
      
      // For each achievement, check if this activity completes it
      for (const achievement of achievements) {
        await this.checkAchievement(achievement, userId);
      }
    } catch (error) {
      console.error('Error processing achievements:', error);
    }
  }

  /**
   * Check if a user has met the criteria for a specific achievement
   * @param achievement The achievement to check
   * @param userId The user ID to check for
   */
  static async checkAchievement(achievement: any, userId: number): Promise<void> {
    try {
      // Get user's current achievement status
      const userAchievement = await storage.getUserAchievement(userId, achievement.id);
      
      // If already completed, skip
      if (userAchievement?.isCompleted) {
        return;
      }

      // Calculate progress based on achievement type
      let progress = 0;
      
      switch (achievement.thresholdType) {
        case 'total_activities':
          // Count total activities
          const activityCount = await storage.getUserActivityCount(userId);
          progress = activityCount;
          break;
          
        case 'transport_activities':
          // Count transport category activities (assuming category ID 1 is transport)
          const transportCount = await storage.getUserActivityCountByCategory(userId, 1);
          progress = transportCount;
          break;
          
        case 'consecutive_days':
          // Count consecutive days with activities
          const consecutiveDays = await storage.getUserConsecutiveDays(userId);
          progress = consecutiveDays;
          break;
          
        case 'carbon_reduction':
          // Calculate total carbon reduction
          const totalReduction = await storage.getUserCarbonReduction(userId);
          progress = totalReduction;
          break;
          
        case 'monthly_reduction':
          // Calculate monthly carbon reduction percentage
          const monthlyPercentage = await storage.getUserMonthlyReductionPercentage(userId);
          progress = monthlyPercentage;
          break;
          
        default:
          console.log(`Unknown achievement type: ${achievement.thresholdType}`);
          return;
      }
      
      // Determine if achievement is completed
      const isCompleted = progress >= achievement.thresholdValue;
      
      // Update or create user achievement
      if (userAchievement) {
        // Update existing achievement
        await storage.updateUserAchievementProgress(
          userAchievement.id,
          progress,
          isCompleted
        );
      } else {
        // Create new user achievement
        await storage.createUserAchievement({
          userId,
          achievementId: achievement.id,
          progress,
          isCompleted,
          dateEarned: isCompleted ? new Date() : null
        });
      }
      
      // If newly completed, award points to user
      if (isCompleted && (!userAchievement || !userAchievement.isCompleted)) {
        // Award points (50 points per achievement)
        await storage.updateUserScore(userId, 50);
        
        console.log(`User ${userId} completed achievement ${achievement.name} and earned 50 points!`);
      }
    } catch (error) {
      console.error(`Error checking achievement ${achievement.name}:`, error);
    }
  }

  /**
   * Check all achievements for a specific user
   * @param userId The user ID to process achievements for
   */
  static async processUserAchievements(userId: number): Promise<void> {
    try {
      // Get all achievements
      const achievements = await storage.getAllAchievements();
      
      // Check each achievement
      for (const achievement of achievements) {
        await this.checkAchievement(achievement, userId);
      }
    } catch (error) {
      console.error(`Error processing achievements for user ${userId}:`, error);
    }
  }
}