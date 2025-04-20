import { storage } from '../storage';
import { InsertAchievement } from '@shared/schema';

// Array of default achievements
const defaultAchievements: InsertAchievement[] = [
  {
    name: "Carbon Beginner",
    description: "Start your sustainability journey by logging your first carbon activity",
    iconName: "award",
    thresholdValue: 1,
    thresholdType: "total_activities"
  },
  {
    name: "Carbon Enthusiast",
    description: "Log 10 carbon activities to track your environmental impact",
    iconName: "award",
    thresholdValue: 10,
    thresholdType: "total_activities"
  },
  {
    name: "Carbon Pro",
    description: "Log 50 carbon activities and become a tracking pro",
    iconName: "award",
    thresholdValue: 50,
    thresholdType: "total_activities"
  },
  {
    name: "Transport Hero",
    description: "Log 5 transportation activities that reduce your carbon footprint",
    iconName: "trending-up",
    thresholdValue: 5,
    thresholdType: "transport_activities"
  },
  {
    name: "Consistent Logger",
    description: "Log activities for 5 consecutive days",
    iconName: "check-circle",
    thresholdValue: 5,
    thresholdType: "consecutive_days"
  },
  {
    name: "Weekly Warrior",
    description: "Log activities for 7 consecutive days",
    iconName: "check-circle",
    thresholdValue: 7,
    thresholdType: "consecutive_days"
  },
  {
    name: "Carbon Reduction Rookie",
    description: "Reduce your carbon footprint by 10kg through sustainable choices",
    iconName: "trophy",
    thresholdValue: 10,
    thresholdType: "carbon_reduction"
  },
  {
    name: "Carbon Reduction Expert",
    description: "Reduce your carbon footprint by 100kg through sustainable choices",
    iconName: "trophy",
    thresholdValue: 100,
    thresholdType: "carbon_reduction"
  },
  {
    name: "Monthly Milestone Master",
    description: "Reduce your monthly emissions by 20% compared to previous month",
    iconName: "trophy",
    thresholdValue: 20,
    thresholdType: "monthly_reduction"
  }
];

export async function seedAchievements() {
  console.log("Seeding achievements...");
  
  // Get existing achievements
  const existingAchievements = await storage.getAllAchievements();
  
  // If there are already achievements, don't seed
  if (existingAchievements.length > 0) {
    console.log(`Found ${existingAchievements.length} existing achievements, skipping seeding.`);
    return;
  }
  
  // Create each achievement
  for (const achievement of defaultAchievements) {
    try {
      await storage.createAchievement(achievement);
      console.log(`Created achievement: ${achievement.name}`);
    } catch (error) {
      console.error(`Error creating achievement ${achievement.name}:`, error);
    }
  }
  
  console.log("Achievement seeding complete!");
}