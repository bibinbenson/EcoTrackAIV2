import { storage } from '../storage';
import { InsertAchievement } from '@shared/schema';

export async function seedAchievements() {
  console.log('Seeding achievements...');
  
  // Get existing achievements to avoid duplicates
  const existingAchievements = await storage.getAllAchievements();
  
  if (existingAchievements.length > 0) {
    console.log(`Found ${existingAchievements.length} existing achievements, skipping seeding.`);
    return;
  }
  
  // Default achievements data
  const achievements: InsertAchievement[] = [
    {
      name: 'Carbon Beginner',
      description: 'Log your first 5 activities',
      iconName: 'award',
      thresholdValue: 5,
      thresholdType: 'total_activities'
    },
    {
      name: 'Carbon Enthusiast',
      description: 'Log 25 activities',
      iconName: 'award',
      thresholdValue: 25,
      thresholdType: 'total_activities'
    },
    {
      name: 'Carbon Pro',
      description: 'Log 100 activities',
      iconName: 'award',
      thresholdValue: 100,
      thresholdType: 'total_activities'
    },
    {
      name: 'Transport Hero',
      description: 'Log 10 transport-related activities',
      iconName: 'car',
      thresholdValue: 10,
      thresholdType: 'transport_activities'
    },
    {
      name: 'Consistent Logger',
      description: 'Log activities for 3 consecutive days',
      iconName: 'calendar',
      thresholdValue: 3,
      thresholdType: 'consecutive_days'
    },
    {
      name: 'Weekly Warrior',
      description: 'Log activities for 7 consecutive days',
      iconName: 'calendar-check',
      thresholdValue: 7,
      thresholdType: 'consecutive_days'
    },
    {
      name: 'Carbon Reduction Rookie',
      description: 'Reduce carbon emissions by 10 units',
      iconName: 'trending-down',
      thresholdValue: 10,
      thresholdType: 'carbon_reduction'
    },
    {
      name: 'Carbon Reduction Expert',
      description: 'Reduce carbon emissions by 50 units',
      iconName: 'trending-down',
      thresholdValue: 50,
      thresholdType: 'carbon_reduction'
    },
    {
      name: 'Monthly Milestone Master',
      description: 'Reduce monthly emissions by 15%',
      iconName: 'trending-down',
      thresholdValue: 15,
      thresholdType: 'monthly_reduction'
    }
  ];
  
  // Create each achievement
  for (const achievement of achievements) {
    try {
      const created = await storage.createAchievement(achievement);
      console.log(`Created achievement: ${created.name}`);
    } catch (error) {
      console.error(`Error creating achievement ${achievement.name}:`, error);
    }
  }
  
  console.log('Achievement seeding complete!');
}