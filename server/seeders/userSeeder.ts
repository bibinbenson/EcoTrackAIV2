import { storage } from "../storage";
import { scryptSync, randomBytes } from "crypto";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

// Hash password for seeding
function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = scryptSync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Seeds default users including an admin user for testing
 */
export async function seedUsers() {
  console.log("Seeding users...");
  
  // Check if admin user already exists
  const adminUser = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  if (adminUser.length > 0) {
    console.log("Admin user already exists, skipping user seeding.");
    return;
  }
  
  // Create admin user
  await storage.createUser({
    username: "admin",
    password: hashPassword("admin123"), // In a real app, use a strong password
    email: "admin@ecotrack.example",
    firstName: "Admin",
    lastName: "User",
    accountType: "admin"
  });
  
  // Check if regular test user exists
  const testUser = await db.select().from(users).where(eq(users.username, "testuser")).limit(1);
  if (testUser.length === 0) {
    // Create a test user
    await storage.createUser({
      username: "testuser",
      password: hashPassword("password123"),
      email: "user@ecotrack.example", 
      firstName: "Test",
      lastName: "User",
      accountType: "user"
    });
  }
  
  console.log("Users seeded successfully!");
}