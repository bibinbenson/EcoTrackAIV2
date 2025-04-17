// Carbon emission factors for different activities
export const CARBON_FACTORS = {
  // Transportation (kg CO2e per passenger-km)
  transportation: {
    car: {
      small: 0.15,
      medium: 0.19,
      large: 0.28,
      electric: 0.05
    },
    bus: 0.08,
    train: 0.04,
    plane: {
      domestic: 0.26,
      shortHaul: 0.17,
      longHaul: 0.15
    },
    bike: 0.0,
    walking: 0.0,
    motorcycle: 0.11,
    ferry: 0.19
  },
  
  // Housing (kg CO2e)
  housing: {
    electricity: 0.309, // per kWh (varies by country/region)
    naturalGas: 0.18316, // per kWh
    heating: {
      oil: 0.2, // per kWh
      wood: 0.02, // per kWh
    },
    water: 0.000344, // per liter
    waste: 0.5, // per kg of general waste
  },
  
  // Food (kg CO2e per kg of food)
  food: {
    beef: 27.0,
    lamb: 39.2,
    pork: 12.1,
    chicken: 6.9,
    fish: 6.1,
    eggs: 4.8,
    milk: 1.9,
    cheese: 13.5,
    rice: 2.7,
    pasta: 1.2,
    vegetables: 0.4,
    fruits: 0.5,
    legumes: 0.9,
    nuts: 1.5,
    tofu: 2.0,
    bread: 1.4,
    coffee: 28.5, // per kg of coffee beans
    chocolate: 34.0,
  },
  
  // Goods (kg CO2e)
  goods: {
    clothing: {
      tshirt: 7.0,
      jeans: 25.0,
      shoes: 15.0,
      jacket: 39.0
    },
    electronics: {
      smartphone: 80.0,
      laptop: 210.0,
      tablet: 120.0,
      desktop: 350.0,
      tv: 400.0
    },
    furniture: {
      chair: 50.0,
      table: 100.0,
      sofa: 300.0,
      bed: 150.0
    },
    paper: 3.0, // per kg
    plastic: 6.0 // per kg
  }
};

// Calculate car emissions
export function calculateCarEmissions(distance: number, carType: 'small' | 'medium' | 'large' | 'electric'): number {
  return distance * CARBON_FACTORS.transportation.car[carType];
}

// Calculate public transport emissions
export function calculatePublicTransportEmissions(
  distance: number, 
  transportType: 'bus' | 'train'
): number {
  return distance * CARBON_FACTORS.transportation[transportType];
}

// Calculate flight emissions
export function calculateFlightEmissions(
  distance: number, 
  flightType: 'domestic' | 'shortHaul' | 'longHaul'
): number {
  // Add radiative forcing multiplier of 1.9 to account for non-CO2 effects at altitude
  return distance * CARBON_FACTORS.transportation.plane[flightType] * 1.9;
}

// Calculate electricity emissions
export function calculateElectricityEmissions(kWh: number): number {
  return kWh * CARBON_FACTORS.housing.electricity;
}

// Calculate natural gas emissions
export function calculateNaturalGasEmissions(kWh: number): number {
  return kWh * CARBON_FACTORS.housing.naturalGas;
}

// Calculate food emissions
export function calculateFoodEmissions(quantity: number, foodType: keyof typeof CARBON_FACTORS.food): number {
  return quantity * CARBON_FACTORS.food[foodType];
}

// Calculate goods emissions
export function calculateGoodsEmissions(
  itemType: 'clothing' | 'electronics' | 'furniture' | 'paper' | 'plastic',
  itemSubtype: string,
  quantity: number = 1
): number {
  if (itemType === 'paper' || itemType === 'plastic') {
    return quantity * CARBON_FACTORS.goods[itemType];
  }
  
  // @ts-ignore - We know this is safe
  return quantity * CARBON_FACTORS.goods[itemType][itemSubtype];
}

// Utility function to get default monthly footprint for simulation
export function getDefaultMonthlyFootprint(): number[] {
  // Start with higher numbers and trend down for simulation purposes
  return [1250, 1200, 1100, 950, 900, 850, 800, 780, 760, 730, 710, 680];
}

// Utility function to get community average footprint for simulation
export function getCommunityAverageFootprint(): number[] {
  return [1300, 1290, 1280, 1270, 1260, 1250, 1240, 1230, 1220, 1210, 1200, 1190];
}
