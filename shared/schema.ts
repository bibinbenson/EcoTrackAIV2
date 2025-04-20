import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, date, decimal } from "drizzle-orm/pg-core";
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
  accountType: text("account_type").default("user").notNull(), // "user", "beta", "admin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  preferences: jsonb("preferences"), // user preferences like notifications, theme, etc.
  betaFeedbackProvided: boolean("beta_feedback_provided").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  score: true,
  createdAt: true,
  lastLogin: true,
  onboardingCompleted: true,
  betaFeedbackProvided: true,
  isEmailVerified: true,
  preferences: true
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

// ESG Trading Platform models
export const esgCompanies = pgTable("esg_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull().unique(),
  description: text("description").notNull(),
  sector: text("sector").notNull(),
  industry: text("industry").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  environmentalScore: integer("environmental_score"), // 0-100
  socialScore: integer("social_score"), // 0-100
  governanceScore: integer("governance_score"), // 0-100
  esgRating: text("esg_rating"), // e.g. "AAA", "BBB", etc.
  carbonIntensity: real("carbon_intensity"), // tons CO2e per million $ revenue
  netZeroTarget: integer("net_zero_target"), // target year or null if no target
  sdgsAddressed: text("sdgs_addressed").array(), // Sustainable Development Goals addressed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertEsgCompanySchema = createInsertSchema(esgCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const esgSecurities = pgTable("esg_securities", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  securityType: text("security_type").notNull(), // "stock", "bond", "etf", "fund"
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  currentPrice: decimal("current_price", { precision: 12, scale: 4 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  yield: decimal("yield", { precision: 6, scale: 2 }),
  risk: text("risk").notNull(), // "low", "medium", "high"
  minimumInvestment: decimal("minimum_investment", { precision: 12, scale: 2 }),
  sustainabilityFocus: text("sustainability_focus").array(), // e.g. ["renewable energy", "water conservation"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertEsgSecuritySchema = createInsertSchema(esgSecurities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const esgPortfolios = pgTable("esg_portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  totalValue: decimal("total_value", { precision: 16, scale: 2 }).default("0").notNull(),
  totalCarbon: decimal("total_carbon", { precision: 16, scale: 2 }).default("0").notNull(), // tons CO2e
  averageEsgScore: decimal("average_esg_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertEsgPortfolioSchema = createInsertSchema(esgPortfolios).omit({
  id: true,
  totalValue: true,
  totalCarbon: true,
  averageEsgScore: true,
  createdAt: true,
  updatedAt: true
});

export const esgPortfolioHoldings = pgTable("esg_portfolio_holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  securityId: integer("security_id").notNull(),
  shares: decimal("shares", { precision: 16, scale: 6 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 4 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  currentValue: decimal("current_value", { precision: 16, scale: 2 }).notNull(),
  carbonFootprint: decimal("carbon_footprint", { precision: 16, scale: 2 }), // tons CO2e
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertEsgPortfolioHoldingSchema = createInsertSchema(esgPortfolioHoldings).omit({
  id: true,
  currentValue: true,
  carbonFootprint: true,
  createdAt: true,
  updatedAt: true
}).extend({
  purchaseDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return undefined;
    },
    z.date()
  )
});

export const esgMarketData = pgTable("esg_market_data", {
  id: serial("id").primaryKey(),
  securityId: integer("security_id").notNull(),
  date: timestamp("date").notNull(),
  openPrice: decimal("open_price", { precision: 12, scale: 4 }).notNull(),
  highPrice: decimal("high_price", { precision: 12, scale: 4 }).notNull(),
  lowPrice: decimal("low_price", { precision: 12, scale: 4 }).notNull(),
  closePrice: decimal("close_price", { precision: 12, scale: 4 }).notNull(),
  volume: integer("volume").notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  news: jsonb("news"), // Recent news affecting price
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertEsgMarketDataSchema = createInsertSchema(esgMarketData).omit({
  id: true,
  createdAt: true
}).extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return undefined;
    },
    z.date()
  )
});

export const esgTransactions = pgTable("esg_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  portfolioId: integer("portfolio_id").notNull(),
  securityId: integer("security_id").notNull(),
  type: text("type").notNull(), // "buy", "sell"
  shares: decimal("shares", { precision: 16, scale: 6 }).notNull(),
  pricePerShare: decimal("price_per_share", { precision: 12, scale: 4 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 16, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").default("completed").notNull(), // "pending", "completed", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertEsgTransactionSchema = createInsertSchema(esgTransactions).omit({
  id: true,
  totalAmount: true,
  createdAt: true
}).extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return undefined;
    },
    z.date()
  )
});

// ESG Trading Platform Relations
export const esgCompaniesRelations = relations(esgCompanies, ({ many }) => ({
  securities: many(esgSecurities)
}));

export const esgSecuritiesRelations = relations(esgSecurities, ({ one, many }) => ({
  company: one(esgCompanies, {
    fields: [esgSecurities.companyId],
    references: [esgCompanies.id]
  }),
  marketData: many(esgMarketData),
  portfolioHoldings: many(esgPortfolioHoldings),
  transactions: many(esgTransactions)
}));

export const esgPortfoliosRelations = relations(esgPortfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [esgPortfolios.userId],
    references: [users.id]
  }),
  holdings: many(esgPortfolioHoldings),
  transactions: many(esgTransactions)
}));

export const esgPortfolioHoldingsRelations = relations(esgPortfolioHoldings, ({ one }) => ({
  portfolio: one(esgPortfolios, {
    fields: [esgPortfolioHoldings.portfolioId],
    references: [esgPortfolios.id]
  }),
  security: one(esgSecurities, {
    fields: [esgPortfolioHoldings.securityId],
    references: [esgSecurities.id]
  })
}));

export const esgMarketDataRelations = relations(esgMarketData, ({ one }) => ({
  security: one(esgSecurities, {
    fields: [esgMarketData.securityId],
    references: [esgSecurities.id]
  })
}));

export const esgTransactionsRelations = relations(esgTransactions, ({ one }) => ({
  user: one(users, {
    fields: [esgTransactions.userId],
    references: [users.id]
  }),
  portfolio: one(esgPortfolios, {
    fields: [esgTransactions.portfolioId],
    references: [esgPortfolios.id]
  }),
  security: one(esgSecurities, {
    fields: [esgTransactions.securityId],
    references: [esgSecurities.id]
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

// User feedback for beta users
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  feedbackType: text("feedback_type").notNull(), // "suggestion", "bug", "feature", "general"
  content: text("content").notNull(),
  rating: integer("rating"), // 1-5 stars 
  pageContext: text("page_context"), // where in the app was the user when they gave feedback
  status: text("status").default("new").notNull(), // "new", "in-review", "resolved"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true
});

// Error logging for QA
export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  url: text("url"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  resolution: text("resolution"),
  severity: text("severity").default("medium").notNull() // "low", "medium", "high", "critical"
});

export const insertErrorLogSchema = createInsertSchema(errorLogs).omit({
  id: true,
  createdAt: true,
  resolved: true,
  resolution: true
});

// User activity tracking
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // "login", "page_view", "feature_use", "onboarding_step"
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sessionId: text("session_id")
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  createdAt: true
});

// Update user relations to include goals and feedback
export const usersRelationsUpdated = relations(users, ({ many }) => ({
  activities: many(activities),
  userAchievements: many(userAchievements),
  offsetPurchases: many(offsetPurchases),
  supplierAssessments: many(supplierAssessments),
  supplyChainRisks: many(supplyChainRisks),
  carbonReductionGoals: many(carbonReductionGoals),
  feedback: many(userFeedback),
  activityLogs: many(userActivity)
}));

// Type exports
export type User = typeof users.$inferSelect;
export type CarbonReductionGoal = typeof carbonReductionGoals.$inferSelect;
export type InsertCarbonReductionGoal = z.infer<typeof insertCarbonReductionGoalSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Alias for more semantic type naming in the carbon API service
export type CarbonActivity = typeof activities.$inferSelect;
export type CarbonCategory = typeof categories.$inferSelect;

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

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;

export type UserActivityLog = typeof userActivity.$inferSelect;
export type InsertUserActivityLog = z.infer<typeof insertUserActivitySchema>;

// ESG Trading Platform types
export type EsgCompany = typeof esgCompanies.$inferSelect;
export type InsertEsgCompany = z.infer<typeof insertEsgCompanySchema>;

export type EsgSecurity = typeof esgSecurities.$inferSelect;
export type InsertEsgSecurity = z.infer<typeof insertEsgSecuritySchema>;

export type EsgPortfolio = typeof esgPortfolios.$inferSelect;
export type InsertEsgPortfolio = z.infer<typeof insertEsgPortfolioSchema>;

export type EsgPortfolioHolding = typeof esgPortfolioHoldings.$inferSelect;
export type InsertEsgPortfolioHolding = z.infer<typeof insertEsgPortfolioHoldingSchema>;

export type EsgMarketData = typeof esgMarketData.$inferSelect;
export type InsertEsgMarketData = z.infer<typeof insertEsgMarketDataSchema>;

export type EsgTransaction = typeof esgTransactions.$inferSelect;
export type InsertEsgTransaction = z.infer<typeof insertEsgTransactionSchema>;
