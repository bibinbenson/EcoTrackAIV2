import { storage } from '../storage';
import { type InsertCategory } from '@shared/schema';

/**
 * Seed the categories table with default values
 */
export async function seedCategories() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getAllCategories();
    
    if (existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories, skipping seeding.`);
      return;
    }
    
    // Define default categories
    const defaultCategories: InsertCategory[] = [
      { 
        name: "Transport", 
        description: "Travel and commuting activities", 
        iconName: "car", 
        color: "#1E88E5" 
      },
      { 
        name: "Housing", 
        description: "Home energy usage and utilities", 
        iconName: "home", 
        color: "#43A047" 
      },
      { 
        name: "Food", 
        description: "Food consumption and dietary choices", 
        iconName: "utensils", 
        color: "#FF8F00" 
      },
      { 
        name: "Goods", 
        description: "Products and services purchased", 
        iconName: "shopping-bag", 
        color: "#5E35B1" 
      },
    ];
    
    // Seed the categories
    for (const category of defaultCategories) {
      await storage.createCategory(category);
    }
    
    console.log(`Successfully seeded ${defaultCategories.length} categories.`);
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}