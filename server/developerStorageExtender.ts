import { DatabaseStorage } from './storage';
import * as developerPortal from './developerPortal';

// This file extends the DatabaseStorage prototype with developer portal methods

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
  
  console.log('Developer portal storage methods have been added to DatabaseStorage');
  
  // Define memory storage fallbacks
  const memoryFallbacks = {
    resolveErrorLog: async function(errorId: number, resolution: string) {
      console.log(`[MemStorage] Mock resolving error ${errorId} with: ${resolution}`);
      return { id: errorId, resolved: true, resolutionNotes: resolution, resolvedAt: new Date() };
    },
    
    getRecentErrorCount: async function(hours: number) {
      console.log(`[MemStorage] Mock getting error count for last ${hours} hours`);
      return { totalCount: 12, criticalCount: 3 };
    },
    
    getDatabaseConnectionStats: async function() {
      return { total: 10, active: 3, idle: 7, waitingToConnect: 0 };
    },
    
    getAverageApiResponseTime: async function() {
      return 120;
    },
    
    getAverageDatabaseQueryTime: async function() {
      return 35;
    },
    
    getApplicationConfig: developerPortal.getApplicationConfig,
    updateFeatureFlag: developerPortal.updateFeatureFlag,
    getApiMetrics: developerPortal.getApiMetrics,
    getDeveloperAnalytics: developerPortal.getDeveloperAnalytics
  };
  
  return memoryFallbacks;
}