import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertActivitySchema,
  insertUserAchievementSchema,
  insertOffsetProjectSchema,
  insertOffsetPurchaseSchema,
  insertSupplierSchema,
  insertSupplierEmissionsSchema,
  insertSupplierAssessmentSchema,
  insertSupplyChainRiskSchema,
  insertCarbonReductionGoalSchema,
  insertEcoRewardSchema,
  insertUserRewardSchema,
  insertAchievementSchema
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
  
  app.post("/api/offset-projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertOffsetProjectSchema.parse(req.body);
      const project = await storage.createOffsetProject(projectData);
      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating offset project:", error);
      return res.status(400).json({ message: "Invalid offset project data", error });
    }
  });

  app.post("/api/offset-purchases", async (req: Request, res: Response) => {
    try {
      // For simplicity, force userId to 1
      const purchaseData = {
        ...req.body,
        userId: 1
      };
      
      // Validate the purchase data
      const validatedData = insertOffsetPurchaseSchema.parse(purchaseData);
      
      const purchase = await storage.createOffsetPurchase(validatedData);
      return res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating offset purchase:", error);
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

  // Supplier routes
  app.get("/api/suppliers", async (_req: Request, res: Response) => {
    const suppliers = await storage.getAllSuppliers();
    return res.json(suppliers);
  });

  app.get("/api/suppliers/:id", async (req: Request, res: Response) => {
    const supplierId = parseInt(req.params.id);
    const supplier = await storage.getSupplier(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    return res.json(supplier);
  });

  app.post("/api/suppliers", async (req: Request, res: Response) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      return res.status(201).json(supplier);
    } catch (error) {
      return res.status(400).json({ message: "Invalid supplier data", error });
    }
  });

  app.patch("/api/suppliers/:id", async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.id);
      const supplier = await storage.getSupplier(supplierId);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      const updateData = req.body;
      const updatedSupplier = await storage.updateSupplier(supplierId, updateData);
      return res.json(updatedSupplier);
    } catch (error) {
      return res.status(400).json({ message: "Invalid supplier update data", error });
    }
  });

  app.delete("/api/suppliers/:id", async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.id);
      const success = await storage.deleteSupplier(supplierId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete supplier" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: "Error deleting supplier", error });
    }
  });

  // Supplier emissions routes
  app.get("/api/supplier-emissions/:supplierId", async (req: Request, res: Response) => {
    const supplierId = parseInt(req.params.supplierId);
    const emissions = await storage.getSupplierEmissions(supplierId);
    return res.json(emissions);
  });

  app.post("/api/supplier-emissions", async (req: Request, res: Response) => {
    try {
      const emissionData = insertSupplierEmissionsSchema.parse(req.body);
      const emission = await storage.createSupplierEmission(emissionData);
      return res.status(201).json(emission);
    } catch (error) {
      return res.status(400).json({ message: "Invalid emission data", error });
    }
  });

  app.get("/api/supply-chain/total-emissions", async (_req: Request, res: Response) => {
    const totalEmissions = await storage.getTotalSupplyChainEmissions();
    return res.json({ total: totalEmissions });
  });

  app.get("/api/emissions-by-year/:year", async (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const emissionsByYear = await storage.getEmissionsByYear(year);
    
    // Get supplier details to include in response
    const supplierIds = emissionsByYear.map(e => e.supplierId);
    const suppliers = await Promise.all(
      supplierIds.map(id => storage.getSupplier(id))
    );
    
    const supplierMap = new Map(
      suppliers
        .filter(s => s !== undefined)
        .map(s => [s!.id, s])
    );
    
    const result = emissionsByYear.map(emission => ({
      ...emission,
      supplier: supplierMap.get(emission.supplierId)
    }));
    
    return res.json(result);
  });

  // Supplier assessment routes
  app.get("/api/supplier-assessments/:supplierId", async (req: Request, res: Response) => {
    const supplierId = parseInt(req.params.supplierId);
    const assessments = await storage.getSupplierAssessments(supplierId);
    return res.json(assessments);
  });

  app.post("/api/supplier-assessments", async (req: Request, res: Response) => {
    try {
      // For simplicity, force conductedBy to user 1
      const assessmentData = {
        ...insertSupplierAssessmentSchema.parse(req.body),
        conductedBy: 1
      };
      const assessment = await storage.createSupplierAssessment(assessmentData);
      return res.status(201).json(assessment);
    } catch (error) {
      return res.status(400).json({ message: "Invalid assessment data", error });
    }
  });

  app.patch("/api/supplier-assessments/:id/status", async (req: Request, res: Response) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedAssessment = await storage.updateAssessmentStatus(assessmentId, status);
      
      if (!updatedAssessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      return res.json(updatedAssessment);
    } catch (error) {
      return res.status(400).json({ message: "Invalid status update", error });
    }
  });

  // Supply chain risk routes
  app.get("/api/supplier-risks/:supplierId", async (req: Request, res: Response) => {
    const supplierId = parseInt(req.params.supplierId);
    const risks = await storage.getSupplierRisks(supplierId);
    return res.json(risks);
  });

  app.get("/api/high-priority-risks", async (_req: Request, res: Response) => {
    const risks = await storage.getHighPriorityRisks();
    
    // Get supplier details to include in response
    const supplierIds = [...new Set(risks.map(r => r.supplierId))];
    const suppliers = await Promise.all(
      supplierIds.map(id => storage.getSupplier(id))
    );
    
    const supplierMap = new Map(
      suppliers
        .filter(s => s !== undefined)
        .map(s => [s!.id, s])
    );
    
    const result = risks.map(risk => ({
      ...risk,
      supplier: supplierMap.get(risk.supplierId)
    }));
    
    return res.json(result);
  });

  app.post("/api/supply-chain-risks", async (req: Request, res: Response) => {
    try {
      // For simplicity, force responsibleUserId to user 1 if not provided
      const riskData = {
        ...insertSupplyChainRiskSchema.parse(req.body)
      };
      
      if (!riskData.responsibleUserId) {
        riskData.responsibleUserId = 1;
      }
      
      const risk = await storage.createSupplyChainRisk(riskData);
      return res.status(201).json(risk);
    } catch (error) {
      return res.status(400).json({ message: "Invalid risk data", error });
    }
  });

  app.patch("/api/supply-chain-risks/:id/status", async (req: Request, res: Response) => {
    try {
      const riskId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedRisk = await storage.updateRiskStatus(riskId, status);
      
      if (!updatedRisk) {
        return res.status(404).json({ message: "Risk not found" });
      }
      
      return res.json(updatedRisk);
    } catch (error) {
      return res.status(400).json({ message: "Invalid status update", error });
    }
  });

  // Carbon Reduction Goals routes
  app.get("/api/carbon-reduction-goals", async (req: Request, res: Response) => {
    try {
      const userId = 1; // For simplicity, use fixed user
      
      // Filter by status if provided
      if (req.query.status === 'active') {
        const goals = await storage.getActiveCarbonReductionGoals(userId);
        return res.json(goals);
      } else {
        const goals = await storage.getUserCarbonReductionGoals(userId);
        return res.json(goals);
      }
    } catch (error) {
      console.error("Error fetching carbon reduction goals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/carbon-reduction-goals/:id", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getCarbonReductionGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Carbon reduction goal not found" });
      }
      
      return res.json(goal);
    } catch (error) {
      console.error("Error fetching carbon reduction goal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/carbon-reduction-goals", async (req: Request, res: Response) => {
    try {
      // For simplicity, force userId to 1
      const goalData = {
        ...req.body,
        userId: 1
      };
      
      const validatedData = insertCarbonReductionGoalSchema.parse(goalData);
      const goal = await storage.createCarbonReductionGoal(validatedData);
      return res.status(201).json(goal);
    } catch (error) {
      console.error("Error creating carbon reduction goal:", error);
      return res.status(400).json({ message: "Invalid goal data", error });
    }
  });

  app.patch("/api/carbon-reduction-goals/:id/progress", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      
      const updateSchema = z.object({
        currentAmount: z.number().min(0)
      });
      
      const { currentAmount } = updateSchema.parse(req.body);
      
      const updatedGoal = await storage.updateCarbonReductionGoalProgress(goalId, currentAmount);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Carbon reduction goal not found" });
      }
      
      return res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal progress:", error);
      return res.status(400).json({ message: "Invalid progress update data", error });
    }
  });

  app.patch("/api/carbon-reduction-goals/:id/status", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      if (!['active', 'paused', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value. Must be one of: active, paused, completed, cancelled" });
      }
      
      const updatedGoal = await storage.updateCarbonReductionGoalStatus(goalId, status);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Carbon reduction goal not found" });
      }
      
      return res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal status:", error);
      return res.status(400).json({ message: "Invalid status update", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
