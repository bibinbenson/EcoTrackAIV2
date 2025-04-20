import EnhancedCarbonCalculator from "@/components/carbon-api/EnhancedCarbonCalculator";
import { ArrowLeft, Lightbulb, Globe } from "lucide-react";
import { Link } from "wouter";

export default function AdvancedCarbonCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/calculator" className="inline-flex items-center text-sm text-neutral-600 hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Simple Calculator
        </Link>
        
        <h1 className="text-2xl font-bold text-neutral-800">Advanced Carbon Calculator</h1>
        <p className="text-neutral-600 mt-1">
          Get more accurate carbon footprint data using external API integration with AI-enhanced calculations
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnhancedCarbonCalculator />
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-lg font-bold text-neutral-800">About External API Integration</h2>
            </div>
            <p className="text-sm text-neutral-700 mb-4">
              Our advanced carbon calculator uses external APIs to provide more accurate and detailed emissions data.
              This includes:
            </p>
            <ul className="text-sm text-neutral-700 space-y-2 list-disc pl-5">
              <li>Precise emission factors from global databases</li>
              <li>Breakdown of emissions into Scope 1, 2, and 3 categories</li>
              <li>AI-enhanced activity analysis for better categorization</li>
              <li>Activity-specific emission factors that account for regional differences</li>
              <li>Detailed reduction suggestions based on your specific activities</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-lg font-bold text-neutral-800">Tips for Better Results</h2>
            </div>
            <ul className="text-sm text-neutral-700 space-y-2">
              <li className="pb-2 border-b border-amber-100">
                <span className="font-bold">Be specific</span>: Include quantities, distances, and types of activities (e.g., "Drove 15 miles in my hybrid car" instead of just "Drove to work")
              </li>
              <li className="py-2 border-b border-amber-100">
                <span className="font-bold">Include context</span>: Mention relevant details like location, duration, or frequency (e.g., "Daily 30-minute shower with gas water heater")
              </li>
              <li className="py-2 border-b border-amber-100">
                <span className="font-bold">Specify energy sources</span>: Mention if you're using renewable energy or alternative fuels
              </li>
              <li className="pt-2">
                <span className="font-bold">Group similar activities</span>: For better analysis, submit related activities together
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}