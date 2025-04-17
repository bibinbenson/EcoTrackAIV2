import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertActivitySchema,
  insertUserAchievementSchema,
  insertOffsetPurchaseSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api
  
  // User routes
  app.get("/api/users/me", async (req: Request, res: Response) => {
    // Just return the default user for demo purposes
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  });

  app.get("/api/users/top", async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const users = await storage.getTopUsers(limit);
    return res.json(users);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user data", error });
    }
  });

  // Carbon categories routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    const categories = await storage.getAllCategories();
    return res.json(categories);
  });
  
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const { name, description, iconName, color } = req.body;
      if (!name || !description || !iconName || !color) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const category = await storage.createCategory({
        name,
        description,
        iconName,
        color
      });
      
      return res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Carbon activities routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    const userId = 1; // For simplicity, use fixed user
    const activities = await storage.getUserActivities(userId);
    return res.json(activities);
  });

  app.get("/api/activities/recent", async (req: Request, res: Response) => {
    const userId = 1; // For simplicity, use fixed user
    const limit = parseInt(req.query.limit as string) || 5;
    const activities = await storage.getRecentUserActivities(userId, limit);
    return res.json(activities);
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      // For simplicity, force userId to 1
      const activityData = {
        ...req.body,
        userId: 1
      };
      
      // Validate with Zod which will handle date conversion via preprocessor
      const validatedData = insertActivitySchema.parse(activityData);
      
      // Create activity
      const activity = await storage.createActivity(validatedData);
      
      // Recalculate user score after adding activity
      const totalFootprint = await storage.getUserCarbonFootprint(1);
      // Simple scoring: higher is better (less carbon)
      const newScore = Math.max(0, 100 - Math.floor(totalFootprint / 10));
      await storage.updateUserScore(1, newScore);
      
      return res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      return res.status(400).json({ message: "Invalid activity data", error });
    }
  });

  app.get("/api/carbon-footprint", async (req: Request, res: Response) => {
    const userId = 1; // For simplicity, use fixed user
    
    // Parse date range if provided
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }
    
    const footprint = await storage.getUserCarbonFootprint(userId, startDate, endDate);
    return res.json({ total: footprint });
  });

  app.get("/api/carbon-by-category", async (req: Request, res: Response) => {
    const userId = 1; // For simplicity, use fixed user
    
    // Parse date range if provided
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }
    
    const categoryTotals = await storage.getUserCarbonByCategory(userId, startDate, endDate);
    
    // Fetch category details to include in response
    const categories = await storage.getAllCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    
    const result = await Promise.all(categoryTotals.map(async (item) => {
      const category = categoryMap.get(item.categoryId);
      return {
        ...item,
        category
      };
    }));
    
    return res.json(result);
  });

  // Achievement routes
  app.get("/api/achievements", async (_req: Request, res: Response) => {
    const achievements = await storage.getAllAchievements();
    return res.json(achievements);
  });

  app.get("/api/user-achievements", async (req: Request, res: Response) => {
    const userId = 1; // For simplicity, use fixed user
    const userAchievements = await storage.getUserAchievements(userId);
    
    // Get achievement details to include with user achievements
    const achievements = await storage.getAllAchievements();
    const achievementMap = new Map(achievements.map(a => [a.id, a]));
    
    const result = userAchievements.map(ua => ({
      ...ua,
      achievement: achievementMap.get(ua.achievementId)
    }));
    
    return res.json(result);
  });

  app.post("/api/user-achievements", async (req: Request, res: Response) => {
    try {
      // For simplicity, force userId to 1
      const userAchievementData = {
        ...insertUserAchievementSchema.parse(req.body),
        userId: 1
      };
      const userAchievement = await storage.createUserAchievement(userAchievementData);
      return res.status(201).json(userAchievement);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user achievement data", error });
    }
  });

  app.patch("/api/user-achievements/:achievementId/progress", async (req: Request, res: Response) => {
    try {
      const userId = 1; // For simplicity, use fixed user
      const achievementId = parseInt(req.params.achievementId);
      
      const updateSchema = z.object({
        progress: z.number().min(0),
        isCompleted: z.boolean().optional()
      });
      
      const { progress, isCompleted } = updateSchema.parse(req.body);
      
      const userAchievement = await storage.updateUserAchievementProgress(
        userId, 
        achievementId, 
        progress, 
        isCompleted
      );
      
      if (!userAchievement) {
        return res.status(404).json({ message: "User achievement not found" });
      }
      
      return res.json(userAchievement);
    } catch (error) {
      return res.status(400).json({ message: "Invalid progress update data", error });
    }
  });

  // Sustainability tips routes
  app.get("/api/sustainability-tips", async (req: Request, res: Response) => {
    if (req.query.categoryId) {
      const categoryId = parseInt(req.query.categoryId as string);
      const tips = await storage.getTipsByCategory(categoryId);
      return res.json(tips);
    } else {
      const tips = await storage.getAllSustainabilityTips();
      return res.json(tips);
    }
  });

  // Offset projects routes
  app.get("/api/offset-projects", async (_req: Request, res: Response) => {
    const projects = await storage.getAllOffsetProjects();
    return res.json(projects);
  });

  app.get("/api/offset-projects/:id", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getOffsetProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Offset project not found" });
    }
    
    return res.json(project);
  });

  app.post("/api/offset-purchases", async (req: Request, res: Response) => {
    try {
      // For simplicity, force userId to 1
      const purchaseData = {
        ...insertOffsetPurchaseSchema.parse(req.body),
        userId: 1,
        purchaseDate: new Date()
      };
      const purchase = await storage.createOffsetPurchase(purchaseData);
      return res.status(201).json(purchase);
    } catch (error) {
      return res.status(400).json({ message: "Invalid offset purchase data", error });
    }
  });

  app.get("/api/offset-purchases", async (_req: Request, res: Response) => {
    const userId = 1; // For simplicity, use fixed user
    const purchases = await storage.getUserOffsetPurchases(userId);
    
    // Get project details to include with purchases
    const projectIds = [...new Set(purchases.map(p => p.projectId))];
    const projectDetails = await Promise.all(
      projectIds.map(id => storage.getOffsetProject(id))
    );
    
    const projectMap = new Map(
      projectDetails
        .filter(p => p !== undefined)
        .map(p => [p!.id, p])
    );
    
    const result = purchases.map(purchase => ({
      ...purchase,
      project: projectMap.get(purchase.projectId)
    }));
    
    return res.json(result);
  });

  // Educational resources routes
  app.get("/api/educational-resources", async (req: Request, res: Response) => {
    if (req.query.categoryId) {
      const categoryId = parseInt(req.query.categoryId as string);
      const resources = await storage.getResourcesByCategory(categoryId);
      return res.json(resources);
    } else {
      const resources = await storage.getAllEducationalResources();
      return res.json(resources);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
