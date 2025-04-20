import { seedAchievements } from './achievementSeeder';
import { seedRewards } from './rewardSeeder';

/**
 * Initialize all default data for the application
 */
export async function initializeDefaultData() {
  console.log('Starting database seeding...');
  
  try {
    // Seed achievements
    await seedAchievements();
    
    // Seed rewards
    await seedRewards();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}