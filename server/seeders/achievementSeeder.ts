import { storage } from '../storage';
import { InsertAchievement } from '@shared/schema';

export async function seedAchievements() {
  try {
    // Check if achievements already exist
    const existingAchievements = await storage.getAllAchievements();
    
    if (existingAchievements.length > 0) {
      console.log(`Found ${existingAchievements.length} existing achievements, skipping seeding.`);
      return;
    }
    
    // Define default achievements
    const defaultAchievements: InsertAchievement[] = [
      { 
        name: "First Steps", 
        description: "Log your first activity", 
        iconName: "footprints", 
        thresholdValue: 1, 
        thresholdType: "total_activities" 
      },
      { 
        name: "Active Tracker", 
        description: "Track 10 activities", 
        iconName: "list-check", 
        thresholdValue: 10, 
        thresholdType: "total_activities" 
      },
      { 
        name: "Green Commuter", 
        description: "Log 5 transportation activities", 
        iconName: "bus", 
        thresholdValue: 5, 
        thresholdType: "transport_activities" 
      },
      { 
        name: "Committed Environmentalist", 
        description: "Track your activities for 7 consecutive days", 
        iconName: "calendar-check", 
        thresholdValue: 7, 
        thresholdType: "consecutive_days" 
      },
      { 
        name: "Carbon Reducer", 
        description: "Reduce your carbon footprint by 10kg", 
        iconName: "leaf", 
        thresholdValue: 10, 
        thresholdType: "carbon_reduction" 
      },
      { 
        name: "Monthly Champion", 
        description: "Reduce your monthly carbon footprint by 15%", 
        iconName: "trophy", 
        thresholdValue: 15, 
        thresholdType: "monthly_reduction" 
      },
      { 
        name: "Carbon Master", 
        description: "Reduce your carbon footprint by 50kg", 
        iconName: "award", 
        thresholdValue: 50, 
        thresholdType: "carbon_reduction" 
      },
      { 
        name: "Sustainability Expert", 
        description: "Track your activities for 30 consecutive days", 
        iconName: "star", 
        thresholdValue: 30, 
        thresholdType: "consecutive_days" 
      },
      { 
        name: "Climate Hero", 
        description: "Track 50 total activities", 
        iconName: "shield", 
        thresholdValue: 50, 
        thresholdType: "total_activities" 
      }
    ];
    
    // Seed the achievements
    for (const achievement of defaultAchievements) {
      await storage.createAchievement(achievement);
    }
    
    console.log(`Successfully seeded ${defaultAchievements.length} achievements.`);
  } catch (error) {
    console.error('Error seeding achievements:', error);
  }
}