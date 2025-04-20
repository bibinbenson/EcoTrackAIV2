import { storage } from '../storage';
import { InsertEcoReward } from '@shared/schema';

export async function seedRewards() {
  try {
    // Check if rewards already exist
    const existingRewards = await storage.getAllEcoRewards();
    
    if (existingRewards.length > 0) {
      console.log(`Found ${existingRewards.length} existing rewards, skipping seeding.`);
      return;
    }
    
    // Define default rewards
    const defaultRewards: InsertEcoReward[] = [
      { 
        name: "Green Shopping Voucher", 
        description: "10% discount on eco-friendly products at partner stores", 
        pointCost: 100, 
        rewardType: "voucher", 
        partnerName: "EcoMarket", 
        imageUrl: "https://placehold.co/100x100?text=Voucher", 
        isActive: true
      },
      { 
        name: "Tree Planting Donation", 
        description: "Plant a tree in a reforestation project", 
        pointCost: 150, 
        rewardType: "donation", 
        partnerName: "TreesForEarth", 
        imageUrl: "https://placehold.co/100x100?text=Tree", 
        isActive: true
      },
      { 
        name: "Public Transport Pass", 
        description: "One-day pass for public transportation", 
        pointCost: 200, 
        rewardType: "pass", 
        partnerName: "City Transit", 
        imageUrl: "https://placehold.co/100x100?text=Transit", 
        isActive: true
      },
      { 
        name: "Carbon Offset Certificate", 
        description: "Offset 100kg of carbon emissions", 
        pointCost: 250, 
        rewardType: "certificate", 
        partnerName: "Climate Solutions", 
        imageUrl: "https://placehold.co/100x100?text=Certificate", 
        isActive: true
      },
      { 
        name: "Eco-Workshop Ticket", 
        description: "Free entry to a sustainability workshop", 
        pointCost: 300, 
        rewardType: "ticket", 
        partnerName: "Green Learning Center", 
        imageUrl: "https://placehold.co/100x100?text=Workshop", 
        isActive: true
      }
    ];
    
    // Seed the rewards
    for (const reward of defaultRewards) {
      await storage.createEcoReward(reward);
    }
    
    console.log(`Successfully seeded ${defaultRewards.length} rewards.`);
  } catch (error) {
    console.error('Error seeding rewards:', error);
  }
}