import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

// Required for serverless environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Initialize default data for the database if it doesn't exist
// Perform database migrations to add new columns and tables
export async function migrateDatabase() {
  console.log("Starting database migration...");
  try {
    // Check if we need to migrate the users table
    try {
      // Try to query a column that should exist in the new schema
      await db.execute(sql`SELECT account_type FROM users LIMIT 1`);
      console.log("User table already migrated.");
    } catch (error) {
      // Column doesn't exist, need to add new columns
      console.log("Migrating users table...");
      
      // Add the new columns to the users table
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
        ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS preferences JSONB,
        ADD COLUMN IF NOT EXISTS beta_feedback_provided BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT false
      `);
      console.log("Users table migration completed.");
    }

    // Create user_feedback table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        feedback_type TEXT NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER,
        page_context TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create error_logs table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        url TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved BOOLEAN NOT NULL DEFAULT false,
        resolution TEXT,
        severity TEXT NOT NULL DEFAULT 'medium'
      )
    `);

    // Create user_activity table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_activity (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        session_id TEXT
      )
    `);

    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Error during database migration:", error);
    throw error;
  }
}

export async function initializeDefaultData() {
  try {
    // Check if we have eco rewards
    const ecoRewards = await db.select().from(schema.ecoRewards);
    
    // If no eco rewards, initialize with default data
    if (ecoRewards.length === 0) {
      console.log("Initializing default eco rewards...");
      const defaultRewards = [
        {
          name: "10% Discount on Eco Products",
          description: "Get 10% off your next purchase of any eco-friendly product",
          pointCost: 100,
          rewardType: "discount",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1542601600647-3a722a90a76c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          partnerName: "Green Marketplace"
        },
        {
          name: "Plant a Tree",
          description: "We'll plant a tree in your name in a reforestation project",
          pointCost: 50,
          rewardType: "donation",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          partnerName: "Tree Alliance"
        },
        {
          name: "Carbon Offset Certificate",
          description: "Offset 1 ton of CO2 emissions with a verified carbon credit",
          pointCost: 200,
          rewardType: "offset",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1569180880150-df4eed93c90b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          partnerName: "Carbon Credit Exchange"
        },
        {
          name: "Digital Sustainability Badge",
          description: "Show your commitment to sustainability with a digital badge for your profile",
          pointCost: 30,
          rewardType: "digital_asset",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          partnerName: null
        },
        {
          name: "Annual Sustainability Report",
          description: "Access to an exclusive sustainability trend report with industry insights",
          pointCost: 150,
          rewardType: "content",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          partnerName: "EcoTrack Research"
        }
      ];
      
      // Insert the default rewards
      await db.insert(schema.ecoRewards).values(defaultRewards);
      console.log("Default eco rewards initialized successfully");
    }
    
    // Check if we have sustainability tips
    const sustainabilityTips = await db.select().from(schema.sustainabilityTips);
    
    // If no sustainability tips, initialize with default data
    if (sustainabilityTips.length === 0) {
      console.log("Initializing default sustainability tips...");
      const defaultTips = [
        {
          title: "Reduce Standby Power",
          content: "Unplug electronics when not in use or use a power strip to completely cut power. Standby power can account for 5-10% of home energy use.",
          categoryId: 2, // Assuming 2 is the Housing category
          potentialImpact: 25
        },
        {
          title: "Choose Plant-Based Meals",
          content: "Try having at least one meatless day per week. Plant-based diets can reduce your food carbon footprint by up to 73%.",
          categoryId: 3, // Assuming 3 is the Food category
          potentialImpact: 40
        },
        {
          title: "Optimize Your Driving",
          content: "Maintain proper tire pressure and remove excess weight from your car. This can improve fuel efficiency by up to 3%.",
          categoryId: 1, // Assuming 1 is the Transport category
          potentialImpact: 15
        },
        {
          title: "Shop Secondhand",
          content: "Buy secondhand clothing and goods when possible. The fashion industry produces 10% of all humanity's carbon emissions.",
          categoryId: 4, // Assuming 4 is the Goods category
          potentialImpact: 30
        },
        {
          title: "Use Cold Water for Laundry",
          content: "Washing clothes in cold water can reduce energy use by up to 90% compared to using hot water.",
          categoryId: 2, // Housing
          potentialImpact: 22
        },
        {
          title: "Go Paperless",
          content: "Switch to digital bills and statements. The average U.S. office worker uses about 10,000 sheets of paper annually.",
          categoryId: 4, // Goods
          potentialImpact: 18
        }
      ];
      
      // Insert the default tips
      await db.insert(schema.sustainabilityTips).values(defaultTips);
      console.log("Default sustainability tips initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}