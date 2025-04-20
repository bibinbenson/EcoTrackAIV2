import { storage } from '../storage';
import { InsertEcoReward } from '@shared/schema';

export async function seedRewards() {
  console.log('Seeding rewards...');
  
  // Get existing rewards to avoid duplicates
  const existingRewards = await storage.getAllEcoRewards();
  
  if (existingRewards.length > 0) {
    console.log(`Found ${existingRewards.length} existing rewards, skipping seeding.`);
    return;
  }
  
  // Default eco-rewards data
  const rewards: InsertEcoReward[] = [
    {
      name: '10% Discount on Eco Products',
      description: 'Get 10% off on any eco-friendly product from our partner stores',
      pointCost: 100,
      rewardType: 'discount',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      partnerName: 'EcoStore',
      isActive: true,
      expiryDate: new Date(2025, 11, 31) // Dec 31, 2025
    },
    {
      name: 'Plant a Tree',
      description: 'We will plant a tree in your name in areas affected by deforestation',
      pointCost: 200,
      rewardType: 'donation',
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      partnerName: 'TreesForFuture',
      isActive: true,
      expiryDate: null // Never expires
    },
    {
      name: 'Free Carbon Footprint Analysis',
      description: 'Receive a detailed analysis of your carbon footprint with personalized recommendations',
      pointCost: 300,
      rewardType: 'service',
      imageUrl: 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      partnerName: 'CarbonAnalytics',
      isActive: true,
      expiryDate: new Date(2025, 5, 30) // June 30, 2025
    },
    {
      name: 'Sustainable Fashion Voucher',
      description: '$25 voucher for sustainable clothing brands',
      pointCost: 250,
      rewardType: 'voucher',
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      partnerName: 'EcoFashion',
      isActive: true,
      expiryDate: new Date(2025, 8, 30) // Sept 30, 2025
    },
    {
      name: 'Reusable Product Kit',
      description: 'Receive a kit with reusable straws, cutlery, and food containers',
      pointCost: 350,
      rewardType: 'product',
      imageUrl: 'https://images.unsplash.com/photo-1605600659453-719282524536?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      partnerName: 'ZeroWaste',
      isActive: true,
      expiryDate: new Date(2025, 3, 22) // April 22, 2025 (Earth Day)
    }
  ];
  
  // Create each reward
  for (const reward of rewards) {
    try {
      const created = await storage.createEcoReward(reward);
      console.log(`Created reward: ${created.name}`);
    } catch (error) {
      console.error(`Error creating reward ${reward.name}:`, error);
    }
  }
  
  console.log('Rewards seeding complete!');
}