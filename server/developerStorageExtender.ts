import { DatabaseStorage, MemStorage } from './storage';
import * as developerPortal from './developerPortal';

// This file extends the storage classes with developer portal methods

// Add all the developer portal methods to the DatabaseStorage prototype
export function extendDatabaseStorage() {
  // Error handling extensions
  DatabaseStorage.prototype.resolveErrorLog = developerPortal.resolveErrorLog;
  DatabaseStorage.prototype.getRecentErrorCount = developerPortal.getRecentErrorCount;
  
  // System monitoring extensions
  DatabaseStorage.prototype.getDatabaseConnectionStats = developerPortal.getDatabaseConnectionStats;
  DatabaseStorage.prototype.getAverageApiResponseTime = developerPortal.getAverageApiResponseTime;
  DatabaseStorage.prototype.getAverageDatabaseQueryTime = developerPortal.getAverageDatabaseQueryTime;
  
  // Configuration management extensions
  DatabaseStorage.prototype.getApplicationConfig = developerPortal.getApplicationConfig;
  DatabaseStorage.prototype.updateFeatureFlag = developerPortal.updateFeatureFlag;
  
  // Analytics and metrics extensions
  DatabaseStorage.prototype.getApiMetrics = developerPortal.getApiMetrics;
  DatabaseStorage.prototype.getDeveloperAnalytics = developerPortal.getDeveloperAnalytics;
  
  // Add methods to MemStorage prototype too
  MemStorage.prototype.resolveErrorLog = async function(errorId: number, resolution: string) {
    const errorLog = this.errorLogs.get(errorId);
    if (!errorLog) return undefined;
    
    const updatedLog = {
      ...errorLog,
      resolved: true,
      resolutionNotes: resolution,
      resolvedAt: new Date()
    };
    this.errorLogs.set(errorId, updatedLog);
    return updatedLog;
  };
  
  MemStorage.prototype.getRecentErrorCount = async function(hours: number) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    let totalCount = 0;
    let criticalCount = 0;
    
    this.errorLogs.forEach(log => {
      if (log.createdAt >= since) {
        totalCount++;
        if (log.severity === 'critical') {
          criticalCount++;
        }
      }
    });
    
    return { totalCount, criticalCount };
  };
  
  MemStorage.prototype.getDatabaseConnectionStats = async function() {
    // Mock database connection stats for memory storage
    return { total: 10, active: 3, idle: 7, waitingToConnect: 0 };
  };
  
  MemStorage.prototype.getAverageApiResponseTime = async function() {
    // Mock API response time for memory storage
    return 120; // milliseconds
  };
  
  MemStorage.prototype.getAverageDatabaseQueryTime = async function() {
    // Mock database query time for memory storage
    return 35; // milliseconds
  };
  
  MemStorage.prototype.getApplicationConfig = developerPortal.getApplicationConfig;
  MemStorage.prototype.updateFeatureFlag = developerPortal.updateFeatureFlag;
  MemStorage.prototype.getApiMetrics = developerPortal.getApiMetrics;
  MemStorage.prototype.getDeveloperAnalytics = developerPortal.getDeveloperAnalytics;
  
  // Fix the UserActivity methods in MemStorage
  MemStorage.prototype.createUserActivity = async function(activityLog) {
    const id = this.userActivityLogCurrentId++;
    const newActivity = {
      ...activityLog,
      id,
      createdAt: new Date()
    };
    this.userActivityLogs.set(id, newActivity);
    return newActivity;
  };
  
  MemStorage.prototype.getUserActivity = async function(userId) {
    const activities = [];
    this.userActivityLogs.forEach(log => {
      if (log.userId === userId) {
        activities.push(log);
      }
    });
    return activities;
  };
  
  console.log('Developer portal storage methods have been added to DatabaseStorage and MemStorage');
}