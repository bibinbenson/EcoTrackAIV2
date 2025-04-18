import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
}).extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return undefined;
    },
    z.date()
  )
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

// Eco-friendly rewards that users can earn through achievements
export const ecoRewards = pgTable("eco_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  pointCost: integer("point_cost").notNull(),
  rewardType: text("reward_type").notNull(), // e.g., "discount", "donation", "digital_asset"
  partnerName: text("partner_name"),
  isActive: boolean("is_active").default(true).notNull(),
  expiryDate: timestamp("expiry_date")
});

export const insertEcoRewardSchema = createInsertSchema(ecoRewards).omit({
  id: true
});

// User's earned and redeemed rewards
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  dateEarned: timestamp("date_earned").notNull(),
  isRedeemed: boolean("is_redeemed").default(false).notNull(),
  redeemedDate: timestamp("redeemed_date"),
  redemptionCode: text("redemption_code")
});

export const insertUserRewardSchema = createInsertSchema(userRewards).omit({
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
}).extend({
  purchaseDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return new Date(); // Default to current date if not provided
    },
    z.date()
  )
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

// Supply Chain Management
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  industry: text("industry"),
  location: text("location"),
  tier: integer("tier").default(1).notNull(), // 1 = direct supplier, 2 = tier 2, etc.
  annualSpend: real("annual_spend"),
  sustainabilityRating: integer("sustainability_rating"), // 1-100 score
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const supplierEmissions = pgTable("supplier_emissions", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  scope1Emissions: real("scope1_emissions"), // direct emissions (tons CO2e)
  scope2Emissions: real("scope2_emissions"), // indirect emissions from purchased energy (tons CO2e)
  scope3Emissions: real("scope3_emissions"), // other indirect emissions (tons CO2e)
  dataSource: text("data_source"), // e.g., "reported", "estimated"
  verificationStatus: text("verification_status"), // e.g., "unverified", "third-party-verified"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertSupplierEmissionsSchema = createInsertSchema(supplierEmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const supplierAssessments = pgTable("supplier_assessments", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),
  conductedBy: integer("conducted_by").notNull(), // user ID
  environmentalScore: integer("environmental_score"), // 1-100
  socialScore: integer("social_score"), // 1-100
  governanceScore: integer("governance_score"), // 1-100
  overallScore: integer("overall_score"), // 1-100
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  improvementPlan: text("improvement_plan"),
  nextAssessmentDate: timestamp("next_assessment_date"),
  status: text("status").default("draft").notNull(), // draft, in-progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertSupplierAssessmentSchema = createInsertSchema(supplierAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const supplyChainRisks = pgTable("supply_chain_risks", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  riskType: text("risk_type").notNull(), // e.g., "climate", "regulatory", "social"
  riskLevel: text("risk_level").notNull(), // "low", "medium", "high", "critical"
  description: text("description").notNull(),
  potentialImpact: text("potential_impact"),
  mitigationPlan: text("mitigation_plan"),
  status: text("status").default("identified").notNull(), // identified, monitored, mitigated
  responsibleUserId: integer("responsible_user_id"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertSupplyChainRiskSchema = createInsertSchema(supplyChainRisks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Relation definitions
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  userAchievements: many(userAchievements),
  offsetPurchases: many(offsetPurchases),
  supplierAssessments: many(supplierAssessments),
  supplyChainRisks: many(supplyChainRisks),
  userRewards: many(userRewards)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  activities: many(activities),
  sustainabilityTips: many(sustainabilityTips),
  educationalResources: many(educationalResources)
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [activities.categoryId],
    references: [categories.id]
  })
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));

export const sustainabilityTipsRelations = relations(sustainabilityTips, ({ one }) => ({
  category: one(categories, {
    fields: [sustainabilityTips.categoryId],
    references: [categories.id]
  })
}));

export const offsetProjectsRelations = relations(offsetProjects, ({ many }) => ({
  offsetPurchases: many(offsetPurchases)
}));

export const offsetPurchasesRelations = relations(offsetPurchases, ({ one }) => ({
  user: one(users, {
    fields: [offsetPurchases.userId],
    references: [users.id]
  }),
  project: one(offsetProjects, {
    fields: [offsetPurchases.projectId],
    references: [offsetProjects.id]
  })
}));

export const educationalResourcesRelations = relations(educationalResources, ({ one }) => ({
  category: one(categories, {
    fields: [educationalResources.categoryId],
    references: [categories.id]
  })
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  emissions: many(supplierEmissions),
  assessments: many(supplierAssessments),
  risks: many(supplyChainRisks)
}));

export const supplierEmissionsRelations = relations(supplierEmissions, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierEmissions.supplierId],
    references: [suppliers.id]
  })
}));

export const supplierAssessmentsRelations = relations(supplierAssessments, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierAssessments.supplierId],
    references: [suppliers.id]
  }),
  user: one(users, {
    fields: [supplierAssessments.conductedBy],
    references: [users.id]
  })
}));

export const supplyChainRisksRelations = relations(supplyChainRisks, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplyChainRisks.supplierId],
    references: [suppliers.id]
  }),
  responsibleUser: one(users, {
    fields: [supplyChainRisks.responsibleUserId],
    references: [users.id]
  })
}));

export const ecoRewardsRelations = relations(ecoRewards, ({ many }) => ({
  userRewards: many(userRewards)
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, {
    fields: [userRewards.userId],
    references: [users.id]
  }),
  reward: one(ecoRewards, {
    fields: [userRewards.rewardId],
    references: [ecoRewards.id]
  })
}));

// Carbon Reduction Goals
export const carbonReductionGoals = pgTable("carbon_reduction_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetAmount: real("target_amount").notNull(), // reduction in kg CO2e
  currentAmount: real("current_amount").default(0).notNull(), // current reduction achieved
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  categoryId: integer("category_id"), // optional category focus
  status: text("status").default("active").notNull(), // active, completed, abandoned
  reminderFrequency: text("reminder_frequency").default("weekly"), // daily, weekly, monthly
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertCarbonReductionGoalSchema = createInsertSchema(carbonReductionGoals).omit({
  id: true,
  currentAmount: true,
  createdAt: true,
  updatedAt: true
}).extend({
  startDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return undefined;
    },
    z.date()
  ),
  endDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return undefined;
    },
    z.date()
  )
});

export const carbonReductionGoalsRelations = relations(carbonReductionGoals, ({ one }) => ({
  user: one(users, {
    fields: [carbonReductionGoals.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [carbonReductionGoals.categoryId],
    references: [categories.id]
  })
}));

// Update user relations to include goals
export const usersRelationsUpdated = relations(users, ({ many }) => ({
  activities: many(activities),
  userAchievements: many(userAchievements),
  offsetPurchases: many(offsetPurchases),
  supplierAssessments: many(supplierAssessments),
  supplyChainRisks: many(supplyChainRisks),
  carbonReductionGoals: many(carbonReductionGoals)
}));

// Type exports
export type User = typeof users.$inferSelect;
export type CarbonReductionGoal = typeof carbonReductionGoals.$inferSelect;
export type InsertCarbonReductionGoal = z.infer<typeof insertCarbonReductionGoalSchema>;
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

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type SupplierEmission = typeof supplierEmissions.$inferSelect;
export type InsertSupplierEmission = z.infer<typeof insertSupplierEmissionsSchema>;

export type SupplierAssessment = typeof supplierAssessments.$inferSelect;
export type InsertSupplierAssessment = z.infer<typeof insertSupplierAssessmentSchema>;

export type SupplyChainRisk = typeof supplyChainRisks.$inferSelect;
export type InsertSupplyChainRisk = z.infer<typeof insertSupplyChainRiskSchema>;

export type EcoReward = typeof ecoRewards.$inferSelect;
export type InsertEcoReward = z.infer<typeof insertEcoRewardSchema>;

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
