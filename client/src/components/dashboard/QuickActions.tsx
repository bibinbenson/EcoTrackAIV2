import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Plus, Leaf, Share2 } from "lucide-react";

// Quick action buttons for the dashboard
const quickActions = [
  {
    icon: <Calculator className="h-6 w-6" />,
    label: "Calculate Footprint",
    href: "/calculator",
    bgClass: "bg-primary/10",
    textClass: "text-primary"
  },
  {
    icon: <Plus className="h-6 w-6" />,
    label: "Log Activity",
    href: "/calculator",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500"
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    label: "Browse Offsets",
    href: "/marketplace",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-500"
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    label: "Share Progress",
    href: "/profile",
    bgClass: "bg-indigo-500/10",
    textClass: "text-indigo-500"
  }
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-neutral-800">
          Quick Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="flex flex-col items-center justify-center p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-colors">
                <div className={`h-12 w-12 rounded-full ${action.bgClass} flex items-center justify-center ${action.textClass} mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-neutral-800">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
