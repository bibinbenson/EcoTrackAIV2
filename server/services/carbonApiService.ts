import OpenAI from "openai";
import { CarbonActivity, CarbonCategory } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EmissionFactorResponse {
  emissionFactor: number;
  unit: string;
  confidence: number;
  source: string;
  notes?: string;
}

interface CarbonActivityDetails {
  scope1: number;
  scope2: number;
  scope3: number;
  totalEmissions: number;
  unit: string;
  activitySpecificFactors: Record<string, number>;
  suggestions: string[];
}

/**
 * Service to handle external carbon tracking APIs
 */
export class CarbonApiService {
  /**
   * Get emission factor for a specific activity and category
   * @param activity The activity description
   * @param category The category of the activity
   * @param quantity The quantity of the activity
   * @param unit The unit of measurement
   * @returns The emission factor response with confidence score
   */
  async getEmissionFactor(
    activity: string,
    category: string,
    quantity: number,
    unit: string
  ): Promise<EmissionFactorResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are a carbon accounting expert that provides accurate emission factors for various activities. " +
              "Provide emission factors in kgCO2e per unit, include confidence level (0-1), and source information."
          },
          {
            role: "user",
            content: 
              `Calculate the emission factor for the following activity:\n` +
              `Activity: ${activity}\n` +
              `Category: ${category}\n` +
              `Quantity: ${quantity}\n` +
              `Unit: ${unit}\n\n` +
              `Return a JSON object with the following structure:\n` +
              `{\n` +
              `  "emissionFactor": number, // in kgCO2e per unit\n` +
              `  "unit": string, // the unit (e.g., "kgCO2e/km")\n` +
              `  "confidence": number, // between 0 and 1\n` +
              `  "source": string, // the source of this data\n` +
              `  "notes": string // optional notes about calculation\n` +
              `}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content) as EmissionFactorResponse;
    } catch (error) {
      console.error("Error getting emission factor from OpenAI:", error);
      
      // Return a fallback with low confidence
      return {
        emissionFactor: this.getFallbackEmissionFactor(category),
        unit: `kgCO2e/${unit}`,
        confidence: 0.3,
        source: "Internal database fallback",
        notes: "Using conservative estimate due to API error"
      };
    }
  }

  /**
   * Get detailed carbon activity breakdown from activity data
   * @param activity The activity object
   * @param category The category object
   * @returns Detailed carbon breakdown including scope 1, 2, 3 emissions
   */
  async getDetailedCarbonBreakdown(
    activity: CarbonActivity,
    category: CarbonCategory
  ): Promise<CarbonActivityDetails> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are a carbon accounting expert that provides detailed breakdowns of emissions into scopes 1, 2, and 3. " +
              "You also provide activity-specific factors and reduction suggestions."
          },
          {
            role: "user",
            content: 
              `Provide a detailed carbon breakdown for the following activity:\n` +
              `Activity description: ${activity.description}\n` +
              `Category: ${category.name}\n` +
              `Carbon impact: ${activity.carbonAmount}\n` +
              `Date: ${activity.date}\n\n` +
              `Return a JSON object with the following structure:\n` +
              `{\n` +
              `  "scope1": number, // direct emissions in kgCO2e\n` +
              `  "scope2": number, // indirect emissions from energy in kgCO2e\n` +
              `  "scope3": number, // all other indirect emissions in kgCO2e\n` +
              `  "totalEmissions": number, // total emissions (should match carbonImpact)\n` +
              `  "unit": string, // the unit (e.g., "kgCO2e")\n` +
              `  "activitySpecificFactors": object, // key-value pairs of relevant factors\n` +
              `  "suggestions": array // 3-5 specific suggestions to reduce this impact\n` +
              `}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content || '{}';
      const result = JSON.parse(content) as CarbonActivityDetails;
      
      // Ensure the total matches the provided carbon impact for consistency
      result.totalEmissions = activity.carbonAmount;
      
      return result;
    } catch (error) {
      console.error("Error getting detailed carbon breakdown from OpenAI:", error);
      
      // Return a fallback with estimated scope breakdowns
      return {
        scope1: Math.round(activity.carbonAmount * 0.3 * 100) / 100,
        scope2: Math.round(activity.carbonAmount * 0.2 * 100) / 100,
        scope3: Math.round(activity.carbonAmount * 0.5 * 100) / 100,
        totalEmissions: activity.carbonAmount,
        unit: "kgCO2e",
        activitySpecificFactors: {},
        suggestions: [
          "Consider more efficient alternatives for this activity",
          "Reduce frequency when possible",
          "Offset remaining emissions through verified projects"
        ]
      };
    }
  }

  /**
   * Analyzes a text description to extract and enrich carbon data
   * @param description Free text description of activity
   * @returns Enhanced carbon data with quantity and units
   */
  async analyzeCarbonActivity(description: string): Promise<{
    enhancedDescription: string;
    estimatedCategory: string;
    estimatedQuantity: number;
    estimatedUnit: string;
    estimatedCarbonImpact: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are a carbon accounting expert that analyzes activity descriptions and extracts key information " +
              "for carbon footprint calculations."
          },
          {
            role: "user",
            content: 
              `Analyze this carbon activity description: "${description}"\n\n` +
              `Extract and enhance the activity data and return a JSON object with the following structure:\n` +
              `{\n` +
              `  "enhancedDescription": string, // improved, more specific description\n` +
              `  "estimatedCategory": string, // one of: "Transport", "Energy", "Food", "Shopping", "Home"\n` +
              `  "estimatedQuantity": number, // numerical quantity extracted or estimated\n` +
              `  "estimatedUnit": string, // unit of measurement (km, kWh, kg, etc.)\n` +
              `  "estimatedCarbonImpact": number // estimated carbon impact in kgCO2e\n` +
              `}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error("Error analyzing carbon activity:", error);
      
      // Return a basic fallback
      return {
        enhancedDescription: description,
        estimatedCategory: "Transport",
        estimatedQuantity: 10,
        estimatedUnit: "km",
        estimatedCarbonImpact: 2.5
      };
    }
  }

  /**
   * Helper method to provide fallback emission factors by category
   * @param category The activity category
   * @returns A conservative emission factor estimate
   */
  private getFallbackEmissionFactor(category: string): number {
    // Conservative emission factors by category
    const fallbackFactors: Record<string, number> = {
      "Transport": 0.17, // kgCO2e per km (average car)
      "Energy": 0.5, // kgCO2e per kWh (varies by country)
      "Food": 1.5, // kgCO2e per kg (average food)
      "Shopping": 0.5, // kgCO2e per $ (general goods)
      "Home": 0.2, // kgCO2e per kWh (home energy)
    };

    return fallbackFactors[category] || 0.2; // Default fallback
  }
}

export const carbonApiService = new CarbonApiService();