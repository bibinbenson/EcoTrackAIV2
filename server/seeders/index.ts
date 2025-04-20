import { seedAchievements } from './achievementSeeder';
import { seedRewards } from './rewardSeeder';

/**
 * Initialize all default data for the application
 */
export async function seedData() {
  try {
    console.log('Starting database seeding...');
    
    // Seed achievements
    console.log('Seeding achievements...');
    await seedAchievements();
    
    // Seed rewards
    console.log('Seeding rewards...');
    await seedRewards();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}