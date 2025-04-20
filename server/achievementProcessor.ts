import { storage, IStorage } from './storage';
import { Achievement, UserAchievement, Activity } from '@shared/schema';

/**
 * Class to handle achievement processing and progress tracking
 */
export class AchievementProcessor {
  /**
   * Check if a user has met the criteria for an achievement
   * @param achievement The achievement to check
   * @param userId The user ID to check for
   */
  static async checkAchievement(achievement: Achievement, userId: number): Promise<void> {
    try {
      // Get current user achievement if it exists
      const userAchievement = await storage.getUserAchievement(userId, achievement.id);
      
      // If already completed, no need to check again
      if (userAchievement?.isCompleted) {
        return;
      }
      
      // Track progress and check if completed based on threshold type
      let progress = 0;
      let isCompleted = false;
      
      switch (achievement.thresholdType) {
        case 'total_activities':
          // Check total number of activities
          progress = await storage.getUserActivityCount(userId);
          isCompleted = progress >= achievement.thresholdValue;
          break;
          
        case 'transport_activities':
          // For transport category (assuming category ID 1 is transport)
          progress = await storage.getUserActivityCountByCategory(userId, 1);
          isCompleted = progress >= achievement.thresholdValue;
          break;
          
        case 'consecutive_days':
          // Check consecutive days logging
          progress = await storage.getUserConsecutiveDays(userId);
          isCompleted = progress >= achievement.thresholdValue;
          break;
          
        case 'carbon_reduction':
          // Check total carbon reduction
          progress = await storage.getUserCarbonReduction(userId);
          isCompleted = progress >= achievement.thresholdValue;
          break;
          
        case 'monthly_reduction':
          // Check monthly reduction percentage
          progress = await storage.getUserMonthlyReductionPercentage(userId);
          isCompleted = progress >= achievement.thresholdValue;
          break;
          
        default:
          console.log(`Unknown threshold type: ${achievement.thresholdType}`);
          return;
      }
      
      // Create or update the user achievement
      if (!userAchievement) {
        await storage.createUserAchievement({
          userId,
          achievementId: achievement.id,
          progress,
          isCompleted,
          dateEarned: new Date() // Always set a date, required by database constraint
        });
      } else {
        await storage.updateUserAchievement(userAchievement.id, {
          progress,
          isCompleted,
          dateEarned: userAchievement.dateEarned || new Date() // Keep existing date or set new one
        });
      }
      
      // If newly completed, award points to user
      if (isCompleted && (!userAchievement || !userAchievement.isCompleted)) {
        // Award points (50 points per achievement)
        const currentUser = await storage.getUser(userId);
        const newScore = (currentUser?.score || 0) + 50;
        await storage.updateUserScore(userId, newScore);
        
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
  
  /**
   * Process a newly created activity to check for achievements
   * @param activity The activity that was created
   * @param userId The user ID who created the activity
   */
  static async processActivity(activity: Activity, userId: number): Promise<void> {
    try {
      // Simply delegate to processUserAchievements
      await this.processUserAchievements(userId);
      console.log(`Processed achievements for activity: ${activity.id}`);
    } catch (error) {
      console.error('Error processing activity achievements:', error);
    }
  }
}