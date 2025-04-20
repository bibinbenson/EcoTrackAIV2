import { seedAchievements } from './achievementSeeder';
import { seedRewards } from './rewardSeeder';

export async function seedDatabase() {
  console.log("Starting database seeding...");
  
  try {
    // Seed achievements
    await seedAchievements();
    
    // Seed rewards
    await seedRewards();
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}