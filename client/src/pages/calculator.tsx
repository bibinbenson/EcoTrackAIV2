import SimpleActivityForm from "@/components/calculator/SimpleActivityForm";
import AdvancedCalculator from "@/components/calculator/AdvancedCalculator";
import RecentActivities from "@/components/activity/RecentActivities";
import SustainabilityTip from "@/components/education/SustainabilityTip";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Calculator() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800">Carbon Footprint Calculator</h2>
        <p className="text-neutral-600 mt-1">
          Track your daily activities and measure their impact on the environment
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Quick Logger for easier testing */}
          <SimpleActivityForm />
          
          <div className="mt-6">
            <AdvancedCalculator />
          </div>
          
          <div className="mt-6">
            <RecentActivities />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Try Our Advanced Calculator</h3>
            <p className="text-sm text-neutral-700 mb-4">
              Get more detailed carbon impact data using our AI-enhanced calculator with improved accuracy.
            </p>
            <Link href="/advanced-carbon-calculator" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              Go to Advanced Calculator
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div>
            <SustainabilityTip />
          </div>
          
          <div className="bg-primary bg-opacity-5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Did You Know?</h3>
            
            <div className="space-y-4 text-sm text-neutral-800">
              <p>
                The average person generates about 4-5 tons of carbon dioxide per year, but this varies greatly by country and lifestyle.
              </p>
              
              <p>
                Simple actions like reducing meat consumption, minimizing car travel, and reducing energy use at home can significantly lower your carbon footprint.
              </p>
              
              <p>
                By tracking your carbon footprint regularly, you can identify the areas where you can make the biggest impact in reducing emissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
