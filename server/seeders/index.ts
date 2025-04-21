import { seedAchievements } from './achievementSeeder';
import { seedRewards } from './rewardSeeder';
import { seedCategories } from './categorySeeder';
import { seedUsers } from './userSeeder';

/**
 * Initialize all default data for the application
 */
export async function seedData() {
  try {
    console.log('Starting database seeding...');
    
    // Seed categories first (required for other data)
    console.log('Seeding categories...');
    await seedCategories();
    
    // Seed achievements
    console.log('Seeding achievements...');
    await seedAchievements();
    
    // Seed rewards
    console.log('Seeding rewards...');
    await seedRewards();
    
    // Seed users including admin
    console.log('Seeding users...');
    await seedUsers();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}