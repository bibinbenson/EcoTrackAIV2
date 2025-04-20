import { storage } from '../storage';
import { InsertEcoReward } from '@shared/schema';

// Array of default eco-rewards
const defaultRewards: InsertEcoReward[] = [
  {
    name: "Plant a Tree Certificate",
    description: "We'll plant a tree on your behalf and send you a digital certificate",
    pointCost: 500,
    rewardType: "certificate",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    partnerName: "EcoForest",
    isActive: true,
    expiryDate: null
  },
  {
    name: "5% Off Eco-friendly Products",
    description: "Receive a 5% discount coupon for our partner's eco-friendly store",
    pointCost: 300,
    rewardType: "discount",
    imageUrl: "https://images.unsplash.com/photo-1572454591674-2739dca1f650?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    partnerName: "GreenShop",
    isActive: true,
    expiryDate: null
  },
  {
    name: "Reusable Straw Set",
    description: "A set of stainless steel straws with a carrying case",
    pointCost: 800,
    rewardType: "product",
    imageUrl: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    partnerName: "EcoLife",
    isActive: true,
    expiryDate: null
  },
  {
    name: "Digital Sustainability Course",
    description: "Free access to an online course about sustainable living practices",
    pointCost: 1200,
    rewardType: "course",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    partnerName: "EcoLearn",
    isActive: true,
    expiryDate: null
  },
  {
    name: "Carbon Offset Credit",
    description: "Offset 1 ton of carbon dioxide on your behalf through verified projects",
    pointCost: 2000,
    rewardType: "offset",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    partnerName: "CarbonClear",
    isActive: true,
    expiryDate: null
  }
];

// Function to generate a random redemption code
export function generateRedemptionCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ECO-';
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

export async function seedRewards() {
  console.log("Seeding rewards...");
  
  // Get existing rewards
  const existingRewards = await storage.getAllEcoRewards();
  
  // If there are already rewards, don't seed
  if (existingRewards.length > 0) {
    console.log(`Found ${existingRewards.length} existing rewards, skipping seeding.`);
    return;
  }
  
  // Create each reward
  for (const reward of defaultRewards) {
    try {
      await storage.createEcoReward(reward);
      console.log(`Created reward: ${reward.name}`);
    } catch (error) {
      console.error(`Error creating reward ${reward.name}:`, error);
    }
  }
  
  console.log("Reward seeding complete!");
}