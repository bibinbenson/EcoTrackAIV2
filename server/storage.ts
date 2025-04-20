import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  activities, Activity, InsertActivity,
  achievements, Achievement, InsertAchievement,
  userAchievements, UserAchievement, InsertUserAchievement,
  sustainabilityTips, SustainabilityTip, InsertSustainabilityTip,
  offsetProjects, OffsetProject, InsertOffsetProject,
  offsetPurchases, OffsetPurchase, InsertOffsetPurchase,
  educationalResources, EducationalResource, InsertEducationalResource,
  suppliers, Supplier, InsertSupplier,
  supplierEmissions, SupplierEmission, InsertSupplierEmission,
  supplierAssessments, SupplierAssessment, InsertSupplierAssessment,
  supplyChainRisks, SupplyChainRisk, InsertSupplyChainRisk,
  carbonReductionGoals, CarbonReductionGoal, InsertCarbonReductionGoal,
  ecoRewards, EcoReward, InsertEcoReward,
  userRewards, UserReward, InsertUserReward,
  userFeedback, UserFeedback, InsertUserFeedback,
  errorLogs, ErrorLog, InsertErrorLog,
  userActivity, UserActivityLog, InsertUserActivityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, between, count, sum } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(id: number, newScore: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getTopUsers(limit: number): Promise<User[]>;
  
  // Achievement tracking operations
  getUserActivityCount(userId: number): Promise<number>;
  getUserActivityCountByCategory(userId: number, categoryId: number): Promise<number>;
  getUserConsecutiveDays(userId: number): Promise<number>;
  getUserCarbonReduction(userId: number): Promise<number>;
  getUserMonthlyReductionPercentage(userId: number): Promise<number>;
  
  // Beta user operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(userId: number): Promise<UserFeedback[]>;
  updateUserBetaFeedbackStatus(userId: number, provided: boolean): Promise<User | undefined>;
  updateUserOnboardingStatus(userId: number, completed: boolean): Promise<User | undefined>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getUserActivities(userId: number): Promise<Activity[]>;
  getRecentUserActivities(userId: number, limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: number): Promise<boolean>;
  getUserCarbonFootprint(userId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getUserCarbonByCategory(userId: number, startDate?: Date, endDate?: Date): Promise<{categoryId: number, totalCarbon: number}[]>;

  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserActivityCount(userId: number): Promise<number>;
  getUserActivityCountByCategory(userId: number, categoryId: number): Promise<number>;
  getUserConsecutiveDays(userId: number): Promise<number>;
  getUserCarbonReduction(userId: number): Promise<number>;
  getUserMonthlyReductionPercentage(userId: number): Promise<number>;
  
  // Eco-Reward operations
  getEcoReward(id: number): Promise<EcoReward | undefined>;
  getAllEcoRewards(): Promise<EcoReward[]>;
  getActiveEcoRewards(): Promise<EcoReward[]>;
  createEcoReward(reward: InsertEcoReward): Promise<EcoReward>;
  
  // User-Reward operations
  getUserReward(id: number): Promise<UserReward | undefined>;
  getUserRewards(userId: number): Promise<UserReward[]>;
  getUserRedeemedRewards(userId: number): Promise<UserReward[]>;
  createUserReward(userReward: InsertUserReward): Promise<UserReward>;
  redeemUserReward(userRewardId: number, userId: number, customRedemptionCode?: string): Promise<UserReward | undefined>;

  // User Achievement operations
  getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievementProgress(userId: number, achievementId: number, progress: number, isCompleted?: boolean): Promise<UserAchievement | undefined>;

  // Sustainability Tip operations
  getSustainabilityTip(id: number): Promise<SustainabilityTip | undefined>;
  getAllSustainabilityTips(): Promise<SustainabilityTip[]>;
  getTipsByCategory(categoryId: number): Promise<SustainabilityTip[]>;
  createSustainabilityTip(tip: InsertSustainabilityTip): Promise<SustainabilityTip>;

  // Offset Project operations
  getOffsetProject(id: number): Promise<OffsetProject | undefined>;
  getAllOffsetProjects(): Promise<OffsetProject[]>;
  createOffsetProject(project: InsertOffsetProject): Promise<OffsetProject>;

  // Offset Purchase operations
  createOffsetPurchase(purchase: InsertOffsetPurchase): Promise<OffsetPurchase>;
  getUserOffsetPurchases(userId: number): Promise<OffsetPurchase[]>;

  // Educational Resource operations
  getEducationalResource(id: number): Promise<EducationalResource | undefined>;
  getAllEducationalResources(): Promise<EducationalResource[]>;
  getResourcesByCategory(categoryId: number): Promise<EducationalResource[]>;
  createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource>;

  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Supplier Emissions operations
  getSupplierEmission(id: number): Promise<SupplierEmission | undefined>;
  getSupplierEmissions(supplierId: number): Promise<SupplierEmission[]>;
  getEmissionsByYear(year: number): Promise<{supplierId: number, totalScope1: number, totalScope2: number, totalScope3: number}[]>;
  createSupplierEmission(emission: InsertSupplierEmission): Promise<SupplierEmission>;
  getTotalSupplyChainEmissions(startDate?: Date, endDate?: Date): Promise<number>;
  
  // Supplier Assessment operations
  getSupplierAssessment(id: number): Promise<SupplierAssessment | undefined>;
  getSupplierAssessments(supplierId: number): Promise<SupplierAssessment[]>;
  createSupplierAssessment(assessment: InsertSupplierAssessment): Promise<SupplierAssessment>;
  updateAssessmentStatus(id: number, status: string): Promise<SupplierAssessment | undefined>;
  
  // Supply Chain Risk operations
  getSupplyChainRisk(id: number): Promise<SupplyChainRisk | undefined>;
  getSupplierRisks(supplierId: number): Promise<SupplyChainRisk[]>;
  getHighPriorityRisks(): Promise<SupplyChainRisk[]>;
  createSupplyChainRisk(risk: InsertSupplyChainRisk): Promise<SupplyChainRisk>;
  updateRiskStatus(id: number, status: string): Promise<SupplyChainRisk | undefined>;
  
  // Carbon Reduction Goals operations
  getCarbonReductionGoal(id: number): Promise<CarbonReductionGoal | undefined>;
  getUserCarbonReductionGoals(userId: number): Promise<CarbonReductionGoal[]>;
  getActiveCarbonReductionGoals(userId: number): Promise<CarbonReductionGoal[]>;
  createCarbonReductionGoal(goal: InsertCarbonReductionGoal): Promise<CarbonReductionGoal>;
  updateCarbonReductionGoalProgress(id: number, currentAmount: number): Promise<CarbonReductionGoal | undefined>;
  updateCarbonReductionGoalStatus(id: number, status: string): Promise<CarbonReductionGoal | undefined>;
  
  // Eco-Rewards operations
  getEcoReward(id: number): Promise<EcoReward | undefined>;
  getAllEcoRewards(): Promise<EcoReward[]>;
  getActiveEcoRewards(): Promise<EcoReward[]>;
  createEcoReward(reward: InsertEcoReward): Promise<EcoReward>;
  
  // User Rewards operations
  getUserReward(id: number): Promise<UserReward | undefined>;
  getUserRewards(userId: number): Promise<UserReward[]>;
  getUserRedeemedRewards(userId: number): Promise<UserReward[]>;
  createUserReward(userReward: InsertUserReward): Promise<UserReward>;
  redeemUserReward(userRewardId: number, userId: number, customRedemptionCode?: string): Promise<UserReward | undefined>;
  
  // Beta user operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(userId: number): Promise<UserFeedback[]>;
  updateUserBetaFeedbackStatus(userId: number, provided: boolean): Promise<User | undefined>;
  updateUserOnboardingStatus(userId: number, completed: boolean): Promise<User | undefined>;
  
  // Error tracking operations
  createErrorLog(errorLog: InsertErrorLog): Promise<ErrorLog>;
  getErrorLogs(): Promise<ErrorLog[]>;
  
  // User analytics operations
  createUserActivityLog(activityLog: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivityLogs(userId: number): Promise<UserActivityLog[]>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private activities: Map<number, Activity>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<string, UserAchievement>; // composite key: userId-achievementId
  private sustainabilityTips: Map<number, SustainabilityTip>;
  private offsetProjects: Map<number, OffsetProject>;
  private offsetPurchases: Map<number, OffsetPurchase>;
  private educationalResources: Map<number, EducationalResource>;
  private suppliers: Map<number, Supplier>;
  private supplierEmissions: Map<number, SupplierEmission>;
  private supplierAssessments: Map<number, SupplierAssessment>;
  private supplyChainRisks: Map<number, SupplyChainRisk>;
  private carbonReductionGoals: Map<number, CarbonReductionGoal>;
  private ecoRewards: Map<number, EcoReward>;
  private userRewards: Map<number, UserReward>;
  private userFeedback: Map<number, UserFeedback>;
  private errorLogs: Map<number, ErrorLog>;
  private userActivityLogs: Map<number, UserActivityLog>;
  
  private userCurrentId: number;
  private categoryCurrentId: number;
  private activityCurrentId: number;
  private achievementCurrentId: number;
  private userAchievementCurrentId: number;
  private tipCurrentId: number;
  private projectCurrentId: number;
  private purchaseCurrentId: number;
  private resourceCurrentId: number;
  private supplierCurrentId: number;
  private emissionCurrentId: number;
  private assessmentCurrentId: number;
  private riskCurrentId: number;
  private goalCurrentId: number;
  private rewardCurrentId: number;
  private userRewardCurrentId: number;
  private userFeedbackCurrentId: number;
  private errorLogCurrentId: number;
  private userActivityLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.activities = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.sustainabilityTips = new Map();
    this.offsetProjects = new Map();
    this.offsetPurchases = new Map();
    this.educationalResources = new Map();
    this.suppliers = new Map();
    this.supplierEmissions = new Map();
    this.supplierAssessments = new Map();
    this.supplyChainRisks = new Map();
    this.carbonReductionGoals = new Map();
    this.ecoRewards = new Map();
    this.userRewards = new Map();
    this.userFeedback = new Map();
    this.errorLogs = new Map();
    this.userActivityLogs = new Map();

    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.activityCurrentId = 1;
    this.achievementCurrentId = 1;
    this.userAchievementCurrentId = 1;
    this.tipCurrentId = 1;
    this.projectCurrentId = 1;
    this.purchaseCurrentId = 1;
    this.resourceCurrentId = 1;
    this.supplierCurrentId = 1;
    this.emissionCurrentId = 1;
    this.assessmentCurrentId = 1;
    this.riskCurrentId = 1;
    this.goalCurrentId = 1;
    this.rewardCurrentId = 1;
    this.userRewardCurrentId = 1;
    this.userFeedbackCurrentId = 1;
    this.errorLogCurrentId = 1;
    this.userActivityLogCurrentId = 1;

    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Transport", description: "Travel and commuting activities", iconName: "car", color: "#1E88E5" },
      { name: "Housing", description: "Home energy usage and utilities", iconName: "home", color: "#43A047" },
      { name: "Food", description: "Food consumption and dietary choices", iconName: "utensils", color: "#FF8F00" },
      { name: "Goods", description: "Products and services purchased", iconName: "shopping-bag", color: "#5E35B1" },
    ];
    
    defaultCategories.forEach(category => this.createCategory(category));
    
    // Default achievements
    const defaultAchievements: InsertAchievement[] = [
      { name: "Carbon Reducer", description: "Reduced 20% carbon in a month", iconName: "leaf", thresholdValue: 20, thresholdType: "carbon_reduction" },
      { name: "Consistent Logger", description: "Logged activities for 14 days straight", iconName: "award", thresholdValue: 14, thresholdType: "consecutive_days" },
      { name: "Cycling Champion", description: "Complete 10 bike commutes", iconName: "bicycle", thresholdValue: 10, thresholdType: "cycling_commutes" },
    ];
    
    defaultAchievements.forEach(achievement => this.createAchievement(achievement));
    
    // Default sustainability tips
    const defaultTips: InsertSustainabilityTip[] = [
      { title: "Transport", content: "Try carpooling once a week to reduce your commute emissions by up to 20%.", categoryId: 1, potentialImpact: 42 },
      { title: "Energy", content: "Switching to LED bulbs can reduce your lighting energy usage by 75%.", categoryId: 2, potentialImpact: 18 },
      { title: "Food", content: "Having one meat-free day per week can significantly lower your carbon footprint.", categoryId: 3, potentialImpact: 30 },
    ];
    
    defaultTips.forEach(tip => this.createSustainabilityTip(tip));
    
    // Default offset projects
    const defaultProjects: InsertOffsetProject[] = [
      { 
        name: "Amazonian Reforestation", 
        description: "Support the planting of native trees in deforested areas of the Amazon rainforest.", 
        location: "Brazil", 
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        pricePerTon: 12, 
        totalAvailableTons: 5000, 
        projectType: "reforestation", 
        isVerified: true, 
        tags: ["Forest", "Biodiversity", "Conservation"]
      },
      { 
        name: "Solar Energy for Schools", 
        description: "Fund solar panel installations in underprivileged schools across rural communities.", 
        location: "India", 
        imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        pricePerTon: 18, 
        totalAvailableTons: 3000, 
        projectType: "renewable_energy", 
        isVerified: true, 
        tags: ["Energy", "Education", "Community"]
      },
      { 
        name: "Wind Energy", 
        description: "Support wind farm development in rural communities to replace fossil fuel energy.", 
        location: "United States", 
        imageUrl: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        pricePerTon: 15, 
        totalAvailableTons: 10000, 
        projectType: "renewable_energy", 
        isVerified: true, 
        tags: ["Energy", "Renewable", "Community"]
      },
      { 
        name: "Mangrove Restoration", 
        description: "Restore coastal mangrove ecosystems that sequester carbon and protect coastlines.", 
        location: "Indonesia", 
        imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        pricePerTon: 20, 
        totalAvailableTons: 2000, 
        projectType: "conservation", 
        isVerified: true, 
        tags: ["Conservation", "Biodiversity", "Coastal"]
      },
      { 
        name: "Biogas Development", 
        description: "Convert agricultural waste to clean energy while reducing methane emissions.", 
        location: "Kenya", 
        imageUrl: "https://images.unsplash.com/photo-1611273426858-450e7620370f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        pricePerTon: 18, 
        totalAvailableTons: 4000, 
        projectType: "waste_management", 
        isVerified: true, 
        tags: ["Agriculture", "Energy", "Waste"]
      }
    ];
    
    defaultProjects.forEach(project => this.createOffsetProject(project));
    
    // Default educational resources
    const defaultResources: InsertEducationalResource[] = [
      { 
        title: "Understanding Carbon Footprint", 
        content: "An introduction to what carbon footprint means and how it's calculated.", 
        resourceType: "article", 
        categoryId: null, 
        externalUrl: null 
      },
      { 
        title: "Sustainable Transportation Guide", 
        content: "Learn about eco-friendly transportation options and their impact.", 
        resourceType: "guide", 
        categoryId: 1, 
        externalUrl: null 
      },
      { 
        title: "Plant-Based Diet Benefits", 
        content: "Discover the environmental benefits of reducing meat consumption.", 
        resourceType: "article", 
        categoryId: 3, 
        externalUrl: null 
      },
    ];
    
    defaultResources.forEach(resource => this.createEducationalResource(resource));
    
    // Create a default user
    this.createUser({
      username: "emma",
      password: "password123", // In a real app, this would be hashed
      email: "emma@example.com",
      firstName: "Emma",
      lastName: "Wilson",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    // Add some example activities for default user
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const defaultActivities: InsertActivity[] = [
      { 
        userId: 1, 
        categoryId: 1, 
        description: "Commute to work by car", 
        date: yesterday, 
        carbonAmount: 5.2, 
        metadata: { distance: 15, unit: "km" } 
      },
      { 
        userId: 1, 
        categoryId: 2, 
        description: "Home electricity usage", 
        date: yesterday, 
        carbonAmount: 3.1, 
        metadata: { amount: 10, unit: "kWh" } 
      },
      { 
        userId: 1, 
        categoryId: 3, 
        description: "Beef-based lunch", 
        date: lastWeek, 
        carbonAmount: 6.5, 
        metadata: { amount: 250, unit: "g" } 
      },
    ];
    
    defaultActivities.forEach(activity => this.createActivity(activity));
    
    // Create some user achievements
    const userAchievement: InsertUserAchievement = {
      userId: 1,
      achievementId: 2, // Consistent Logger
      dateEarned: new Date(),
      progress: 14,
      isCompleted: true
    };
    
    this.createUserAchievement(userAchievement);
    
    // Add progress to Cycling Champion
    const cyclingProgress: InsertUserAchievement = {
      userId: 1,
      achievementId: 3, // Cycling Champion
      dateEarned: new Date(),
      progress: 8,
      isCompleted: false
    };
    
    this.createUserAchievement(cyclingProgress);
    
    // Create some default carbon reduction goals
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const nextQuarter = new Date();
    nextQuarter.setMonth(nextQuarter.getMonth() + 3);
    
    const defaultGoals: InsertCarbonReductionGoal[] = [
      {
        userId: 1,
        title: "Monthly Commute Reduction",
        description: "Reduce carbon emissions from daily commuting",
        targetAmount: 25,
        startDate: new Date(),
        endDate: nextMonth,
        categoryId: 1, // Transport
        reminderFrequency: "weekly"
      },
      {
        userId: 1,
        title: "Quarterly Food Impact",
        description: "Lower carbon footprint from food consumption by choosing local and plant-based options",
        targetAmount: 100,
        startDate: new Date(),
        endDate: nextQuarter,
        categoryId: 3, // Food
        reminderFrequency: "monthly"
      }
    ];
    
    defaultGoals.forEach(goal => this.createCarbonReductionGoal(goal));
    
    // Default eco-rewards
    const defaultRewards: InsertEcoReward[] = [
      {
        name: "Green Marketplace Discount",
        description: "10% discount on all eco-friendly products in the Green Marketplace",
        pointCost: 100,
        rewardType: "discount",
        isActive: true,
        expiryDate: null,
        imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        partnerName: "Green Marketplace"
      },
      {
        name: "Plant a Tree",
        description: "We'll plant a tree in your name in a reforestation project",
        pointCost: 50,
        rewardType: "donation",
        isActive: true,
        expiryDate: null,
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        partnerName: "Tree Alliance"
      },
      {
        name: "Carbon Offset Certificate",
        description: "Offset 1 ton of CO2 emissions with a verified carbon credit",
        pointCost: 200,
        rewardType: "offset",
        isActive: true,
        expiryDate: null,
        imageUrl: "https://images.unsplash.com/photo-1569180880150-df4eed93c90b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        partnerName: "Carbon Credit Exchange"
      }
    ];
    
    defaultRewards.forEach(reward => this.createEcoReward(reward));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      score: 0, 
      accountType: insertUser.accountType || 'individual', 
      avatarUrl: insertUser.avatarUrl || null, 
      createdAt: new Date(),
      lastLogin: null,
      onboardingCompleted: false,
      betaFeedbackProvided: false,
      isEmailVerified: false,
      preferences: {}
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserScore(id: number, newScore: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, score: newScore };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getTopUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getUserActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId);
  }

  async getRecentUserActivities(userId: number, limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    if (!this.activities.has(id)) {
      return false;
    }
    return this.activities.delete(id);
  }

  async getUserCarbonFootprint(userId: number, startDate?: Date, endDate?: Date): Promise<number> {
    const activities = await this.getUserActivities(userId);
    
    return activities
      .filter(activity => {
        const activityDate = new Date(activity.date);
        if (startDate && activityDate < startDate) return false;
        if (endDate && activityDate > endDate) return false;
        return true;
      })
      .reduce((total, activity) => total + activity.carbonAmount, 0);
  }

  async getUserCarbonByCategory(userId: number, startDate?: Date, endDate?: Date): Promise<{categoryId: number, totalCarbon: number}[]> {
    const activities = await this.getUserActivities(userId);
    
    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      if (startDate && activityDate < startDate) return false;
      if (endDate && activityDate > endDate) return false;
      return true;
    });
    
    const categoryTotals = new Map<number, number>();
    
    filteredActivities.forEach(activity => {
      const currentTotal = categoryTotals.get(activity.categoryId) || 0;
      categoryTotals.set(activity.categoryId, currentTotal + activity.carbonAmount);
    });
    
    return Array.from(categoryTotals.entries()).map(([categoryId, totalCarbon]) => ({
      categoryId,
      totalCarbon
    }));
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementCurrentId++;
    const achievement: Achievement = { ...insertAchievement, id };
    this.achievements.set(id, achievement);
    return achievement;
  }

  // User Achievement operations
  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    return this.userAchievements.get(`${userId}-${achievementId}`);
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(userAchievement => userAchievement.userId === userId);
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementCurrentId++;
    const userAchievement: UserAchievement = { ...insertUserAchievement, id };
    this.userAchievements.set(`${userAchievement.userId}-${userAchievement.achievementId}`, userAchievement);
    return userAchievement;
  }

  async updateUserAchievementProgress(userId: number, achievementId: number, progress: number, isCompleted?: boolean): Promise<UserAchievement | undefined> {
    const key = `${userId}-${achievementId}`;
    const userAchievement = this.userAchievements.get(key);
    
    if (!userAchievement) return undefined;
    
    const updatedUserAchievement: UserAchievement = {
      ...userAchievement,
      progress,
      isCompleted: isCompleted !== undefined ? isCompleted : userAchievement.isCompleted
    };
    
    this.userAchievements.set(key, updatedUserAchievement);
    return updatedUserAchievement;
  }
  
  async updateUserAchievement(id: number, data: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const userAchievement = Array.from(this.userAchievements.values()).find(ua => ua.id === id);
    
    if (!userAchievement) return undefined;
    
    const updatedUserAchievement: UserAchievement = {
      ...userAchievement,
      progress: data.progress !== undefined ? data.progress : userAchievement.progress,
      isCompleted: data.isCompleted !== undefined ? data.isCompleted : userAchievement.isCompleted,
      dateEarned: data.dateEarned || userAchievement.dateEarned
    };
    
    this.userAchievements.set(`${userAchievement.userId}-${userAchievement.achievementId}`, updatedUserAchievement);
    return updatedUserAchievement;
  }
  
  // Achievement tracking methods
  async getUserActivityCount(userId: number): Promise<number> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .length;
  }

  async getUserActivityCountByCategory(userId: number, categoryId: number): Promise<number> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId && activity.categoryId === categoryId)
      .length;
  }

  async getUserConsecutiveDays(userId: number): Promise<number> {
    // Get all user activities
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (userActivities.length === 0) return 0;
    
    // Count consecutive days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activityDays = new Set<string>();
    
    // Add all activity dates to a set
    userActivities.forEach(activity => {
      const date = new Date(activity.date);
      date.setHours(0, 0, 0, 0);
      activityDays.add(date.toISOString().split('T')[0]);
    });
    
    // Count backwards from today to find consecutive days
    let consecutiveDays = 0;
    const checkDate = new Date(today);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (activityDays.has(dateStr)) {
        consecutiveDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  }

  async getUserCarbonReduction(userId: number): Promise<number> {
    // Calculate the total carbon savings
    // For simplicity, we'll assume each activity with negative carbon values represents savings
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId && activity.carbonAmount < 0)
      .reduce((total, activity) => total + Math.abs(activity.carbonAmount), 0);
  }

  async getUserMonthlyReductionPercentage(userId: number): Promise<number> {
    // Calculate reduction % by comparing this month to previous month
    const today = new Date();
    
    // Current month range
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Previous month range
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Get carbon footprints for both months
    const currentMonthFootprint = await this.getUserCarbonFootprint(userId, currentMonthStart, currentMonthEnd);
    const previousMonthFootprint = await this.getUserCarbonFootprint(userId, previousMonthStart, previousMonthEnd);
    
    // If no previous month data, return 0
    if (previousMonthFootprint === 0) return 0;
    
    // Calculate reduction percentage
    const reductionPercentage = ((previousMonthFootprint - currentMonthFootprint) / previousMonthFootprint) * 100;
    
    // Return 0 if reduction is negative (i.e., increase)
    return Math.max(0, reductionPercentage);
  }

  // Sustainability Tip operations
  async getSustainabilityTip(id: number): Promise<SustainabilityTip | undefined> {
    return this.sustainabilityTips.get(id);
  }

  async getAllSustainabilityTips(): Promise<SustainabilityTip[]> {
    return Array.from(this.sustainabilityTips.values());
  }

  async getTipsByCategory(categoryId: number): Promise<SustainabilityTip[]> {
    return Array.from(this.sustainabilityTips.values())
      .filter(tip => tip.categoryId === categoryId);
  }

  async createSustainabilityTip(insertTip: InsertSustainabilityTip): Promise<SustainabilityTip> {
    const id = this.tipCurrentId++;
    const tip: SustainabilityTip = { ...insertTip, id };
    this.sustainabilityTips.set(id, tip);
    return tip;
  }

  // Offset Project operations
  async getOffsetProject(id: number): Promise<OffsetProject | undefined> {
    if (db) {
      const [project] = await db.select().from(offsetProjects).where(eq(offsetProjects.id, id));
      return project;
    }
    return this.offsetProjects.get(id);
  }

  async getAllOffsetProjects(): Promise<OffsetProject[]> {
    if (db) {
      return db.select().from(offsetProjects).orderBy(offsetProjects.name);
    }
    return Array.from(this.offsetProjects.values());
  }

  async createOffsetProject(insertProject: InsertOffsetProject): Promise<OffsetProject> {
    if (db) {
      const [project] = await db.insert(offsetProjects).values(insertProject).returning();
      return project;
    }
    
    const id = this.projectCurrentId++;
    const project: OffsetProject = { ...insertProject, id };
    this.offsetProjects.set(id, project);
    return project;
  }

  // Offset Purchase operations
  async createOffsetPurchase(insertPurchase: InsertOffsetPurchase): Promise<OffsetPurchase> {
    if (db) {
      const [purchase] = await db
        .insert(offsetPurchases)
        .values({
          ...insertPurchase,
          purchaseDate: new Date()
        })
        .returning();
      return purchase;
    }
    
    const id = this.purchaseCurrentId++;
    const purchase: OffsetPurchase = { 
      ...insertPurchase, 
      id,
      purchaseDate: new Date()
    };
    this.offsetPurchases.set(id, purchase);
    return purchase;
  }

  async getUserOffsetPurchases(userId: number): Promise<OffsetPurchase[]> {
    if (db) {
      return db
        .select()
        .from(offsetPurchases)
        .where(eq(offsetPurchases.userId, userId))
        .orderBy(desc(offsetPurchases.purchaseDate));
    }
    
    return Array.from(this.offsetPurchases.values())
      .filter(purchase => purchase.userId === userId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }

  // Educational Resource operations
  async getEducationalResource(id: number): Promise<EducationalResource | undefined> {
    if (db) {
      const [resource] = await db.select().from(educationalResources).where(eq(educationalResources.id, id));
      return resource;
    }
    return this.educationalResources.get(id);
  }

  async getAllEducationalResources(): Promise<EducationalResource[]> {
    if (db) {
      return db.select().from(educationalResources);
    }
    return Array.from(this.educationalResources.values());
  }

  async getResourcesByCategory(categoryId: number): Promise<EducationalResource[]> {
    if (db) {
      return db
        .select()
        .from(educationalResources)
        .where(eq(educationalResources.categoryId, categoryId));
    }
    return Array.from(this.educationalResources.values())
      .filter(resource => resource.categoryId === categoryId);
  }

  async createEducationalResource(insertResource: InsertEducationalResource): Promise<EducationalResource> {
    if (db) {
      const [resource] = await db
        .insert(educationalResources)
        .values(insertResource)
        .returning();
      return resource;
    }
    
    const id = this.resourceCurrentId++;
    const resource: EducationalResource = { ...insertResource, id };
    this.educationalResources.set(id, resource);
    return resource;
  }

  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierCurrentId++;
    const newSupplier: Supplier = { 
      ...supplier, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date()
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = await this.getSupplier(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { 
      ...supplier, 
      ...data, 
      updatedAt: new Date() 
    };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    if (!this.suppliers.has(id)) return false;
    return this.suppliers.delete(id);
  }
  
  // Supplier Emissions operations
  async getSupplierEmission(id: number): Promise<SupplierEmission | undefined> {
    return this.supplierEmissions.get(id);
  }

  async getSupplierEmissions(supplierId: number): Promise<SupplierEmission[]> {
    return Array.from(this.supplierEmissions.values())
      .filter(emission => emission.supplierId === supplierId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.quarter - a.quarter;
      });
  }

  async getEmissionsByYear(year: number): Promise<{supplierId: number, totalScope1: number, totalScope2: number, totalScope3: number}[]> {
    // Group emissions by supplierId
    const emissionsBySupplier = new Map<number, {totalScope1: number, totalScope2: number, totalScope3: number}>();
    
    Array.from(this.supplierEmissions.values())
      .filter(emission => emission.year === year)
      .forEach(emission => {
        const supplierId = emission.supplierId;
        const current = emissionsBySupplier.get(supplierId) || {totalScope1: 0, totalScope2: 0, totalScope3: 0};
        
        emissionsBySupplier.set(supplierId, {
          totalScope1: current.totalScope1 + (emission.scope1Emissions || 0),
          totalScope2: current.totalScope2 + (emission.scope2Emissions || 0),
          totalScope3: current.totalScope3 + (emission.scope3Emissions || 0)
        });
      });
    
    return Array.from(emissionsBySupplier.entries()).map(([supplierId, totals]) => ({
      supplierId,
      ...totals
    }));
  }

  async createSupplierEmission(emission: InsertSupplierEmission): Promise<SupplierEmission> {
    const id = this.emissionCurrentId++;
    const newEmission: SupplierEmission = { 
      ...emission, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.supplierEmissions.set(id, newEmission);
    return newEmission;
  }

  async getTotalSupplyChainEmissions(startDate?: Date, endDate?: Date): Promise<number> {
    let total = 0;
    
    Array.from(this.supplierEmissions.values())
      .forEach(emission => {
        total += (emission.scope1Emissions || 0) + 
                 (emission.scope2Emissions || 0) +
                 (emission.scope3Emissions || 0);
      });
    
    return total;
  }

  // Supplier Assessment operations
  async getSupplierAssessment(id: number): Promise<SupplierAssessment | undefined> {
    return this.supplierAssessments.get(id);
  }

  async getSupplierAssessments(supplierId: number): Promise<SupplierAssessment[]> {
    return Array.from(this.supplierAssessments.values())
      .filter(assessment => assessment.supplierId === supplierId)
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  }

  async createSupplierAssessment(assessment: InsertSupplierAssessment): Promise<SupplierAssessment> {
    const id = this.assessmentCurrentId++;
    const newAssessment: SupplierAssessment = { 
      ...assessment, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.supplierAssessments.set(id, newAssessment);
    return newAssessment;
  }

  async updateAssessmentStatus(id: number, status: string): Promise<SupplierAssessment | undefined> {
    const assessment = await this.getSupplierAssessment(id);
    if (!assessment) return undefined;
    
    const updatedAssessment = { 
      ...assessment, 
      status, 
      updatedAt: new Date() 
    };
    this.supplierAssessments.set(id, updatedAssessment);
    return updatedAssessment;
  }

  // Supply Chain Risk operations
  async getSupplyChainRisk(id: number): Promise<SupplyChainRisk | undefined> {
    return this.supplyChainRisks.get(id);
  }

  async getSupplierRisks(supplierId: number): Promise<SupplyChainRisk[]> {
    return Array.from(this.supplyChainRisks.values())
      .filter(risk => risk.supplierId === supplierId)
      .sort((a, b) => {
        const riskLevelPriority: Record<string, number> = {high: 3, medium: 2, low: 1};
        const aLevel = riskLevelPriority[a.riskLevel] || 0;
        const bLevel = riskLevelPriority[b.riskLevel] || 0;
        return bLevel - aLevel;
      });
  }

  async getHighPriorityRisks(): Promise<SupplyChainRisk[]> {
    return Array.from(this.supplyChainRisks.values())
      .filter(risk => risk.riskLevel === 'high')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }

  async createSupplyChainRisk(risk: InsertSupplyChainRisk): Promise<SupplyChainRisk> {
    const id = this.riskCurrentId++;
    const newRisk: SupplyChainRisk = { 
      ...risk, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.supplyChainRisks.set(id, newRisk);
    return newRisk;
  }

  async updateRiskStatus(id: number, status: string): Promise<SupplyChainRisk | undefined> {
    const risk = await this.getSupplyChainRisk(id);
    if (!risk) return undefined;
    
    const updatedRisk = { 
      ...risk, 
      status, 
      updatedAt: new Date() 
    };
    this.supplyChainRisks.set(id, updatedRisk);
    return updatedRisk;
  }

  // Carbon Reduction Goals operations
  async getCarbonReductionGoal(id: number): Promise<CarbonReductionGoal | undefined> {
    return this.carbonReductionGoals.get(id);
  }

  async getUserCarbonReductionGoals(userId: number): Promise<CarbonReductionGoal[]> {
    return Array.from(this.carbonReductionGoals.values())
      .filter(goal => goal.userId === userId);
  }

  async getActiveCarbonReductionGoals(userId: number): Promise<CarbonReductionGoal[]> {
    return Array.from(this.carbonReductionGoals.values())
      .filter(goal => goal.userId === userId && goal.status === "active");
  }

  async createCarbonReductionGoal(insertGoal: InsertCarbonReductionGoal): Promise<CarbonReductionGoal> {
    const id = this.goalCurrentId++;
    const now = new Date();
    const goal: CarbonReductionGoal = {
      ...insertGoal,
      id,
      currentAmount: 0,
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    
    this.carbonReductionGoals.set(id, goal);
    return goal;
  }

  async updateCarbonReductionGoalProgress(id: number, currentAmount: number): Promise<CarbonReductionGoal | undefined> {
    const goal = await this.getCarbonReductionGoal(id);
    if (!goal) return undefined;
    
    // Auto-update status to completed if target reached
    let status = goal.status;
    if (currentAmount >= goal.targetAmount && status === "active") {
      status = "completed";
    }
    
    const updatedGoal = { 
      ...goal, 
      currentAmount, 
      status,
      updatedAt: new Date() 
    };
    
    this.carbonReductionGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  async updateCarbonReductionGoalStatus(id: number, status: string): Promise<CarbonReductionGoal | undefined> {
    const goal = await this.getCarbonReductionGoal(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, status, updatedAt: new Date() };
    this.carbonReductionGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  // Eco-Rewards operations
  async getEcoReward(id: number): Promise<EcoReward | undefined> {
    if (db) {
      const [reward] = await db.select().from(ecoRewards).where(eq(ecoRewards.id, id));
      return reward;
    }
    return this.ecoRewards.get(id);
  }

  async getAllEcoRewards(): Promise<EcoReward[]> {
    if (db) {
      return db.select().from(ecoRewards);
    }
    return Array.from(this.ecoRewards.values());
  }

  async getActiveEcoRewards(): Promise<EcoReward[]> {
    if (db) {
      return db.select().from(ecoRewards).where(eq(ecoRewards.isActive, true));
    }
    return Array.from(this.ecoRewards.values())
      .filter(reward => reward.isActive);
  }

  async createEcoReward(insertReward: InsertEcoReward): Promise<EcoReward> {
    if (db) {
      const [reward] = await db
        .insert(ecoRewards)
        .values(insertReward)
        .returning();
      return reward;
    }
    
    const id = this.rewardCurrentId++;
    const reward: EcoReward = { ...insertReward, id };
    this.ecoRewards.set(id, reward);
    return reward;
  }
  
  // User Rewards operations
  async getUserReward(id: number): Promise<UserReward | undefined> {
    if (db) {
      const [userReward] = await db.select().from(userRewards).where(eq(userRewards.id, id));
      return userReward;
    }
    return this.userRewards.get(id);
  }

  async getUserRewards(userId: number): Promise<UserReward[]> {
    if (db) {
      return db
        .select()
        .from(userRewards)
        .where(eq(userRewards.userId, userId))
        .orderBy(desc(userRewards.dateEarned));
    }
    
    return Array.from(this.userRewards.values())
      .filter(userReward => userReward.userId === userId)
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
  }

  async getUserRedeemedRewards(userId: number): Promise<UserReward[]> {
    if (db) {
      return db
        .select()
        .from(userRewards)
        .where(and(
          eq(userRewards.userId, userId),
          eq(userRewards.isRedeemed, true)
        ))
        .orderBy(desc(userRewards.redeemedDate));
    }
    
    return Array.from(this.userRewards.values())
      .filter(userReward => userReward.userId === userId && userReward.isRedeemed)
      .sort((a, b) => {
        // Safely compare redeemedDate even if possibly undefined
        const dateA = a.redeemedDate ? new Date(a.redeemedDate).getTime() : 0;
        const dateB = b.redeemedDate ? new Date(b.redeemedDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createUserReward(insertUserReward: InsertUserReward): Promise<UserReward> {
    if (db) {
      const [userReward] = await db
        .insert(userRewards)
        .values({
          ...insertUserReward,
          isRedeemed: false
        })
        .returning();
      return userReward;
    }
    
    const id = this.userRewardCurrentId++;
    const userReward: UserReward = { 
      ...insertUserReward, 
      id,
      isRedeemed: false,
      redeemedDate: null,
      redemptionCode: null
    };
    this.userRewards.set(id, userReward);
    return userReward;
  }
  
  async redeemUserReward(userRewardId: number, userId: number, customRedemptionCode?: string): Promise<UserReward | undefined> {
    if (db) {
      // This is handled in the DatabaseStorage implementation
      return undefined;
    }
    
    const userReward = this.userRewards.get(userRewardId);
    
    if (!userReward || userReward.userId !== userId || userReward.isRedeemed) {
      return undefined;
    }
    
    // Generate unique code for redeeming
    const redemptionCode = customRedemptionCode || `ECO-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const updatedUserReward: UserReward = {
      ...userReward,
      isRedeemed: true,
      redeemedDate: new Date(),
      redemptionCode
    };
    
    this.userRewards.set(userRewardId, updatedUserReward);
    return updatedUserReward;
  }
  
  // Beta user operations
  async createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const id = this.userFeedbackCurrentId++;
    const newFeedback: UserFeedback = {
      ...feedback,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userFeedback.set(id, newFeedback);
    return newFeedback;
  }
  
  async getUserFeedback(userId: number): Promise<UserFeedback[]> {
    return Array.from(this.userFeedback.values())
      .filter(feedback => feedback.userId === userId);
  }
  
  async updateUserBetaFeedbackStatus(userId: number, provided: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      betaFeedbackProvided: provided 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserOnboardingStatus(userId: number, completed: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user,
      onboardingCompleted: completed,
      lastLogin: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Error tracking operations
  async createErrorLog(errorLog: InsertErrorLog): Promise<ErrorLog> {
    const id = this.errorLogCurrentId++;
    const newErrorLog: ErrorLog = {
      ...errorLog,
      id,
      createdAt: new Date(),
      resolved: false,
      resolution: null
    };
    this.errorLogs.set(id, newErrorLog);
    return newErrorLog;
  }
  
  async getErrorLogs(): Promise<ErrorLog[]> {
    return Array.from(this.errorLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // User analytics operations
  async createUserActivityLog(activityLog: InsertUserActivityLog): Promise<UserActivityLog> {
    const id = this.userActivityLogCurrentId++;
    const newLog: UserActivityLog = {
      ...activityLog,
      id,
      timestamp: new Date()
    };
    this.userActivityLogs.set(id, newLog);
    return newLog;
  }
  
  async getUserActivityLogs(userId: number): Promise<UserActivityLog[]> {
    return Array.from(this.userActivityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Eco-Reward operations
  async getEcoReward(id: number): Promise<EcoReward | undefined> {
    const [reward] = await db.select().from(ecoRewards).where(eq(ecoRewards.id, id));
    return reward;
  }
  
  async getAllEcoRewards(): Promise<EcoReward[]> {
    return db.select().from(ecoRewards);
  }
  
  async getActiveEcoRewards(): Promise<EcoReward[]> {
    return db.select().from(ecoRewards).where(eq(ecoRewards.isActive, true));
  }
  
  async createEcoReward(reward: InsertEcoReward): Promise<EcoReward> {
    const [newReward] = await db.insert(ecoRewards).values(reward).returning();
    return newReward;
  }
  
  // User-Reward operations
  async getUserReward(id: number): Promise<UserReward | undefined> {
    const [userReward] = await db.select().from(userRewards).where(eq(userRewards.id, id));
    return userReward;
  }
  
  async getUserRewards(userId: number): Promise<UserReward[]> {
    return db.select().from(userRewards).where(eq(userRewards.userId, userId));
  }
  
  async getUserRedeemedRewards(userId: number): Promise<UserReward[]> {
    return db
      .select()
      .from(userRewards)
      .where(and(
        eq(userRewards.userId, userId),
        eq(userRewards.isRedeemed, true)
      ));
  }
  
  async createUserReward(userReward: InsertUserReward): Promise<UserReward> {
    const [newUserReward] = await db.insert(userRewards).values(userReward).returning();
    return newUserReward;
  }
  
  async redeemUserReward(userRewardId: number, userId: number, customRedemptionCode?: string): Promise<UserReward | undefined> {
    // Verify the reward exists and belongs to the user and is not already redeemed
    const [userReward] = await db
      .select()
      .from(userRewards)
      .where(and(
        eq(userRewards.id, userRewardId),
        eq(userRewards.userId, userId),
        eq(userRewards.isRedeemed, false)
      ));
    
    if (!userReward) {
      return undefined;
    }
    
    // Generate a redemption code or use provided code
    const redemptionCode = customRedemptionCode || `ECO-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Update the user reward
    const [updatedUserReward] = await db
      .update(userRewards)
      .set({
        isRedeemed: true,
        redeemedDate: new Date(),
        redemptionCode
      })
      .where(eq(userRewards.id, userRewardId))
      .returning();
      
    return updatedUserReward;
  }

  async updateUserScore(id: number, newScore: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ score: newScore })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getTopUsers(limit: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .orderBy(desc(users.score))
      .limit(limit);
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getUserActivities(userId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId));
  }

  async getRecentUserActivities(userId: number, limit: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    const result = await db
      .delete(activities)
      .where(eq(activities.id, id))
      .returning({ id: activities.id });
    
    return result.length > 0;
  }

  async getUserCarbonFootprint(userId: number, startDate?: Date, endDate?: Date): Promise<number> {
    // Base query builder with user filter
    let queryBuilder = db
      .select({ total: sum(activities.carbonAmount) })
      .from(activities)
      .where(eq(activities.userId, userId));
    
    // Add date constraints if provided
    if (startDate && endDate) {
      const result = await queryBuilder
        .where(between(activities.date, startDate, endDate));
      return Number(result[0]?.total) || 0;
    } else if (startDate) {
      const result = await queryBuilder
        .where(activities.date >= startDate as any);
      return Number(result[0]?.total) || 0;
    } else if (endDate) {
      const result = await queryBuilder
        .where(activities.date <= endDate as any);
      return Number(result[0]?.total) || 0;
    }
    
    // No date constraints
    const result = await queryBuilder;
    return Number(result[0]?.total) || 0;
  }

  async getUserCarbonByCategory(
    userId: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<{categoryId: number, totalCarbon: number}[]> {
    // Base query builder
    let queryBuilder = db
      .select({
        categoryId: activities.categoryId,
        totalCarbon: sum(activities.carbonAmount)
      })
      .from(activities)
      .where(eq(activities.userId, userId))
      .groupBy(activities.categoryId);
    
    // Add date constraints if provided
    if (startDate && endDate) {
      const result = await queryBuilder
        .where(between(activities.date, startDate, endDate));
      return result.map(item => ({
        categoryId: item.categoryId,
        totalCarbon: Number(item.totalCarbon) || 0
      }));
    } else if (startDate) {
      const result = await queryBuilder
        .where(activities.date >= startDate as any);
      return result.map(item => ({
        categoryId: item.categoryId,
        totalCarbon: Number(item.totalCarbon) || 0
      }));
    } else if (endDate) {
      const result = await queryBuilder
        .where(activities.date <= endDate as any);
      return result.map(item => ({
        categoryId: item.categoryId,
        totalCarbon: Number(item.totalCarbon) || 0
      }));
    }
    
    // No date constraints
    const result = await queryBuilder;
    return result.map(item => ({
      categoryId: item.categoryId,
      totalCarbon: Number(item.totalCarbon) || 0
    }));
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  // User Achievement operations
  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
    return userAchievement;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values(userAchievement)
      .returning();
    return newUserAchievement;
  }

  async updateUserAchievementProgress(
    userId: number, 
    achievementId: number, 
    progress: number, 
    isCompleted?: boolean
  ): Promise<UserAchievement | undefined> {
    const data: Partial<UserAchievement> = { progress };
    
    if (isCompleted !== undefined) {
      data.isCompleted = isCompleted;
      if (isCompleted) {
        data.dateEarned = new Date();
      }
    }
    
    const [updatedUserAchievement] = await db
      .update(userAchievements)
      .set(data)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .returning();
      
    return updatedUserAchievement;
  }

  // Sustainability Tip operations
  async getSustainabilityTip(id: number): Promise<SustainabilityTip | undefined> {
    const [tip] = await db
      .select()
      .from(sustainabilityTips)
      .where(eq(sustainabilityTips.id, id));
    return tip;
  }

  async getAllSustainabilityTips(): Promise<SustainabilityTip[]> {
    return db.select().from(sustainabilityTips);
  }

  async getTipsByCategory(categoryId: number): Promise<SustainabilityTip[]> {
    return db
      .select()
      .from(sustainabilityTips)
      .where(eq(sustainabilityTips.categoryId, categoryId));
  }

  async createSustainabilityTip(tip: InsertSustainabilityTip): Promise<SustainabilityTip> {
    const [newTip] = await db
      .insert(sustainabilityTips)
      .values(tip)
      .returning();
    return newTip;
  }

  // Offset Project operations
  async getOffsetProject(id: number): Promise<OffsetProject | undefined> {
    const [project] = await db
      .select()
      .from(offsetProjects)
      .where(eq(offsetProjects.id, id));
    return project;
  }

  async getAllOffsetProjects(): Promise<OffsetProject[]> {
    return db.select().from(offsetProjects);
  }

  async createOffsetProject(project: InsertOffsetProject): Promise<OffsetProject> {
    const [newProject] = await db
      .insert(offsetProjects)
      .values(project)
      .returning();
    return newProject;
  }

  // Offset Purchase operations
  async createOffsetPurchase(purchase: InsertOffsetPurchase): Promise<OffsetPurchase> {
    const [newPurchase] = await db
      .insert(offsetPurchases)
      .values(purchase)
      .returning();
    return newPurchase;
  }

  async getUserOffsetPurchases(userId: number): Promise<OffsetPurchase[]> {
    return db
      .select()
      .from(offsetPurchases)
      .where(eq(offsetPurchases.userId, userId));
  }

  // Educational Resource operations
  async getEducationalResource(id: number): Promise<EducationalResource | undefined> {
    const [resource] = await db
      .select()
      .from(educationalResources)
      .where(eq(educationalResources.id, id));
    return resource;
  }

  async getAllEducationalResources(): Promise<EducationalResource[]> {
    return db.select().from(educationalResources);
  }

  async getResourcesByCategory(categoryId: number): Promise<EducationalResource[]> {
    return db
      .select()
      .from(educationalResources)
      .where(eq(educationalResources.categoryId, categoryId));
  }

  async createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource> {
    const [newResource] = await db
      .insert(educationalResources)
      .values(resource)
      .returning();
    return newResource;
  }

  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers).orderBy(suppliers.name);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        ...supplier,
        updatedAt: new Date()
      })
      .returning();
    return newSupplier;
  }

  async updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    try {
      await db.delete(suppliers).where(eq(suppliers.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting supplier:", error);
      return false;
    }
  }

  // Supplier Emissions operations
  async getSupplierEmission(id: number): Promise<SupplierEmission | undefined> {
    const [emission] = await db.select().from(supplierEmissions).where(eq(supplierEmissions.id, id));
    return emission;
  }

  async getSupplierEmissions(supplierId: number): Promise<SupplierEmission[]> {
    return db
      .select()
      .from(supplierEmissions)
      .where(eq(supplierEmissions.supplierId, supplierId))
      .orderBy(desc(supplierEmissions.year), desc(supplierEmissions.quarter));
  }

  async getEmissionsByYear(year: number): Promise<{supplierId: number, totalScope1: number, totalScope2: number, totalScope3: number}[]> {
    const result = await db
      .select({
        supplierId: supplierEmissions.supplierId,
        totalScope1: sum(supplierEmissions.scope1Emissions),
        totalScope2: sum(supplierEmissions.scope2Emissions),
        totalScope3: sum(supplierEmissions.scope3Emissions)
      })
      .from(supplierEmissions)
      .where(eq(supplierEmissions.year, year))
      .groupBy(supplierEmissions.supplierId);
    
    return result.map(item => ({
      supplierId: item.supplierId,
      totalScope1: Number(item.totalScope1) || 0,
      totalScope2: Number(item.totalScope2) || 0,
      totalScope3: Number(item.totalScope3) || 0
    }));
  }

  async createSupplierEmission(emission: InsertSupplierEmission): Promise<SupplierEmission> {
    const [newEmission] = await db
      .insert(supplierEmissions)
      .values({
        ...emission,
        updatedAt: new Date()
      })
      .returning();
    return newEmission;
  }

  async getTotalSupplyChainEmissions(startDate?: Date, endDate?: Date): Promise<number> {
    const [result] = await db
      .select({
        total: sum(supplierEmissions.scope1Emissions)
          .add(sum(supplierEmissions.scope2Emissions))
          .add(sum(supplierEmissions.scope3Emissions))
      })
      .from(supplierEmissions);
    
    return Number(result?.total) || 0;
  }

  // Supplier Assessment operations
  async getSupplierAssessment(id: number): Promise<SupplierAssessment | undefined> {
    const [assessment] = await db.select().from(supplierAssessments).where(eq(supplierAssessments.id, id));
    return assessment;
  }

  async getSupplierAssessments(supplierId: number): Promise<SupplierAssessment[]> {
    return db
      .select()
      .from(supplierAssessments)
      .where(eq(supplierAssessments.supplierId, supplierId))
      .orderBy(desc(supplierAssessments.assessmentDate));
  }

  async createSupplierAssessment(assessment: InsertSupplierAssessment): Promise<SupplierAssessment> {
    const [newAssessment] = await db
      .insert(supplierAssessments)
      .values({
        ...assessment,
        updatedAt: new Date()
      })
      .returning();
    return newAssessment;
  }

  async updateAssessmentStatus(id: number, status: string): Promise<SupplierAssessment | undefined> {
    const [updatedAssessment] = await db
      .update(supplierAssessments)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(supplierAssessments.id, id))
      .returning();
    return updatedAssessment;
  }

  // Supply Chain Risk operations
  async getSupplyChainRisk(id: number): Promise<SupplyChainRisk | undefined> {
    const [risk] = await db.select().from(supplyChainRisks).where(eq(supplyChainRisks.id, id));
    return risk;
  }

  async getSupplierRisks(supplierId: number): Promise<SupplyChainRisk[]> {
    return db
      .select()
      .from(supplyChainRisks)
      .where(eq(supplyChainRisks.supplierId, supplierId))
      .orderBy(supplyChainRisks.riskLevel);
  }

  async getHighPriorityRisks(): Promise<SupplyChainRisk[]> {
    return db
      .select()
      .from(supplyChainRisks)
      .where(eq(supplyChainRisks.riskLevel, "high"))
      .orderBy(supplyChainRisks.dueDate);
  }

  async createSupplyChainRisk(risk: InsertSupplyChainRisk): Promise<SupplyChainRisk> {
    const [newRisk] = await db
      .insert(supplyChainRisks)
      .values({
        ...risk,
        updatedAt: new Date()
      })
      .returning();
    return newRisk;
  }

  async updateRiskStatus(id: number, status: string): Promise<SupplyChainRisk | undefined> {
    const [updatedRisk] = await db
      .update(supplyChainRisks)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(supplyChainRisks.id, id))
      .returning();
    return updatedRisk;
  }

  // Carbon Reduction Goals operations
  async getCarbonReductionGoal(id: number): Promise<CarbonReductionGoal | undefined> {
    const [goal] = await db
      .select()
      .from(carbonReductionGoals)
      .where(eq(carbonReductionGoals.id, id));
    return goal;
  }

  async getUserCarbonReductionGoals(userId: number): Promise<CarbonReductionGoal[]> {
    return db
      .select()
      .from(carbonReductionGoals)
      .where(eq(carbonReductionGoals.userId, userId))
      .orderBy(carbonReductionGoals.createdAt);
  }

  async getActiveCarbonReductionGoals(userId: number): Promise<CarbonReductionGoal[]> {
    return db
      .select()
      .from(carbonReductionGoals)
      .where(
        and(
          eq(carbonReductionGoals.userId, userId),
          eq(carbonReductionGoals.status, "active")
        )
      )
      .orderBy(carbonReductionGoals.endDate);
  }

  async createCarbonReductionGoal(goal: InsertCarbonReductionGoal): Promise<CarbonReductionGoal> {
    const now = new Date();
    const [newGoal] = await db
      .insert(carbonReductionGoals)
      .values({
        ...goal,
        currentAmount: 0,
        status: "active",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newGoal;
  }

  async updateCarbonReductionGoalProgress(id: number, currentAmount: number): Promise<CarbonReductionGoal | undefined> {
    // First get the goal to check if it should be marked as completed
    const goal = await this.getCarbonReductionGoal(id);
    if (!goal) return undefined;
    
    // Auto-update status to completed if target reached
    let status = goal.status;
    if (currentAmount >= goal.targetAmount && status === "active") {
      status = "completed";
    }
    
    // Update the goal
    const [updatedGoal] = await db
      .update(carbonReductionGoals)
      .set({ 
        currentAmount, 
        status,
        updatedAt: new Date() 
      })
      .where(eq(carbonReductionGoals.id, id))
      .returning();
    
    return updatedGoal;
  }

  async updateCarbonReductionGoalStatus(id: number, status: string): Promise<CarbonReductionGoal | undefined> {
    const [updatedGoal] = await db
      .update(carbonReductionGoals)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(carbonReductionGoals.id, id))
      .returning();
    
    return updatedGoal;
  }
}

// Add achievement tracking methods directly to the DatabaseStorage class

// These methods need to be added to the class definition
interface DatabaseStorage {
  getUserActivityCount(userId: number): Promise<number>;
  getUserActivityCountByCategory(userId: number, categoryId: number): Promise<number>;
  getUserConsecutiveDays(userId: number): Promise<number>;
  getUserCarbonReduction(userId: number): Promise<number>;
  getUserMonthlyReductionPercentage(userId: number): Promise<number>;
  updateUserAchievement(id: number, data: Partial<UserAchievement>): Promise<UserAchievement | undefined>;
  
  // Beta user operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(userId: number): Promise<UserFeedback[]>;
  updateUserBetaFeedbackStatus(userId: number, provided: boolean): Promise<User | undefined>;
  updateUserOnboardingStatus(userId: number, completed: boolean): Promise<User | undefined>;
  
  // Error tracking operations
  createErrorLog(errorLog: InsertErrorLog): Promise<ErrorLog>;
  getErrorLogs(): Promise<ErrorLog[]>;
  
  // User analytics operations
  createUserActivityLog(activityLog: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivityLogs(userId: number): Promise<UserActivityLog[]>;
}

// Import the database achievement tracking methods
import { databaseAchievementTracking } from './databaseAchievementTracking';

// Implement the achievement tracking methods
DatabaseStorage.prototype.getUserActivityCount = async function(userId: number): Promise<number> {
  return databaseAchievementTracking.getUserActivityCount(userId);
};

DatabaseStorage.prototype.getUserActivityCountByCategory = async function(userId: number, categoryId: number): Promise<number> {
  return databaseAchievementTracking.getUserActivityCountByCategory(userId, categoryId);
};

DatabaseStorage.prototype.getUserConsecutiveDays = async function(userId: number): Promise<number> {
  return databaseAchievementTracking.getUserConsecutiveDays(userId);
};

DatabaseStorage.prototype.getUserCarbonReduction = async function(userId: number): Promise<number> {
  return databaseAchievementTracking.getUserCarbonReduction(userId);
};

DatabaseStorage.prototype.getUserMonthlyReductionPercentage = async function(userId: number): Promise<number> {
  return databaseAchievementTracking.getUserMonthlyReductionPercentage(userId, this);
};

// Add the missing updateUserAchievement method
DatabaseStorage.prototype.updateUserAchievement = async function(
  id: number, 
  data: Partial<UserAchievement>
): Promise<UserAchievement | undefined> {
  const [updatedUserAchievement] = await db
    .update(userAchievements)
    .set({
      progress: data.progress !== undefined ? data.progress : undefined,
      isCompleted: data.isCompleted !== undefined ? data.isCompleted : undefined,
      dateEarned: data.dateEarned !== undefined ? data.dateEarned : undefined
    })
    .where(eq(userAchievements.id, id))
    .returning();
  
  return updatedUserAchievement;
};

// Beta user operations
DatabaseStorage.prototype.createUserFeedback = async function(
  feedback: InsertUserFeedback
): Promise<UserFeedback> {
  const [newFeedback] = await db
    .insert(userFeedback)
    .values({
      ...feedback,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  return newFeedback;
};

DatabaseStorage.prototype.getUserFeedback = async function(
  userId: number
): Promise<UserFeedback[]> {
  return db
    .select()
    .from(userFeedback)
    .where(eq(userFeedback.userId, userId))
    .orderBy(desc(userFeedback.createdAt));
};

DatabaseStorage.prototype.updateUserBetaFeedbackStatus = async function(
  userId: number, 
  provided: boolean
): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({ betaFeedbackProvided: provided })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};

DatabaseStorage.prototype.updateUserOnboardingStatus = async function(
  userId: number, 
  completed: boolean
): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({ 
      onboardingCompleted: completed,
      lastLogin: new Date()
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};

// Error tracking operations
DatabaseStorage.prototype.createErrorLog = async function(
  errorLog: InsertErrorLog
): Promise<ErrorLog> {
  const [newErrorLog] = await db
    .insert(errorLogs)
    .values(errorLog)
    .returning();
  return newErrorLog;
};

DatabaseStorage.prototype.getErrorLogs = async function(): Promise<ErrorLog[]> {
  return db
    .select()
    .from(errorLogs)
    .orderBy(desc(errorLogs.createdAt));
};

// User analytics operations
DatabaseStorage.prototype.createUserActivityLog = async function(
  activityLog: InsertUserActivityLog
): Promise<UserActivityLog> {
  const [newLog] = await db
    .insert(userActivity)
    .values(activityLog)
    .returning();
  return newLog;
};

DatabaseStorage.prototype.getUserActivityLogs = async function(
  userId: number
): Promise<UserActivityLog[]> {
  return db
    .select()
    .from(userActivity)
    .where(eq(userActivity.userId, userId))
    .orderBy(desc(userActivity.createdAt));
};

// Export an instance of the DatabaseStorage
export const storage = new DatabaseStorage();
