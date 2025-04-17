import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatarUrl: text("avatar_url"),
  score: integer("score").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  score: true
});

// Carbon activity categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  color: text("color").notNull()
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});

// Carbon activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  carbonAmount: real("carbon_amount").notNull(), // in kg
  metadata: jsonb("metadata") // additional activity-specific data
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true
});

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  thresholdValue: integer("threshold_value").notNull(),
  thresholdType: text("threshold_type").notNull(), // e.g., "consecutive_days", "carbon_reduction"
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  dateEarned: timestamp("date_earned").notNull(),
  progress: integer("progress").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull()
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true
});

// Sustainability tips
export const sustainabilityTips = pgTable("sustainability_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").notNull(),
  potentialImpact: real("potential_impact").notNull() // in kg CO2
});

export const insertSustainabilityTipSchema = createInsertSchema(sustainabilityTips).omit({
  id: true
});

// Carbon offset projects
export const offsetProjects = pgTable("offset_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  pricePerTon: real("price_per_ton").notNull(),
  totalAvailableTons: real("total_available_tons").notNull(),
  projectType: text("project_type").notNull(), // e.g., "reforestation", "renewable_energy"
  isVerified: boolean("is_verified").default(false).notNull(),
  tags: text("tags").array().notNull()
});

export const insertOffsetProjectSchema = createInsertSchema(offsetProjects).omit({
  id: true
});

// User offset purchases
export const offsetPurchases = pgTable("offset_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  amount: real("amount").notNull(), // in tons of CO2
  cost: real("cost").notNull(), // in USD
  purchaseDate: timestamp("purchase_date").notNull()
});

export const insertOffsetPurchaseSchema = createInsertSchema(offsetPurchases).omit({
  id: true
});

// Educational resources
export const educationalResources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  resourceType: text("resource_type").notNull(), // e.g., "article", "video", "guide"
  categoryId: integer("category_id"),
  externalUrl: text("external_url")
});

export const insertEducationalResourceSchema = createInsertSchema(educationalResources).omit({
  id: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type SustainabilityTip = typeof sustainabilityTips.$inferSelect;
export type InsertSustainabilityTip = z.infer<typeof insertSustainabilityTipSchema>;

export type OffsetProject = typeof offsetProjects.$inferSelect;
export type InsertOffsetProject = z.infer<typeof insertOffsetProjectSchema>;

export type OffsetPurchase = typeof offsetPurchases.$inferSelect;
export type InsertOffsetPurchase = z.infer<typeof insertOffsetPurchaseSchema>;

export type EducationalResource = typeof educationalResources.$inferSelect;
export type InsertEducationalResource = z.infer<typeof insertEducationalResourceSchema>;
