import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format carbon amount with appropriate units
export function formatCarbonAmount(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)} t`;
  }
  return `${amount.toFixed(2)} kg`;
}

// Format date to readable format
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get previous months for date selection
export function getPreviousMonths(count: number): { label: string, value: string }[] {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: month.toISOString()
    });
  }
  
  return months;
}

// Generate chart colors based on the category color
export function getChartColorFromHex(hexColor: string, opacity: number = 1): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
