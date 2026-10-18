export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type PurineTrafficLevel = 'green' | 'yellow' | 'red';

export interface IngredientItem {
  id: string;
  name: string;
  weightGrams: number;
  purinePer100g: number;
  totalPurineMg: number;
  category: PurineTrafficLevel;
  notes?: string;
}

export interface MealRecord {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  mealType: MealType;
  dishName: string;
  photoUrl?: string;
  ingredients: IngredientItem[];
  totalPurineMg: number;
  overallTraffic: PurineTrafficLevel;
  recommendedWaterMl: number;
  healthAdvice?: {
    riskLevel: string;
    biochemicalInsight: string;
    synergyTips: string;
    waterSchedule: string;
  };
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: 'meat' | 'seafood' | 'beans' | 'vegetables' | 'grains' | 'drinks' | 'nuts' | 'soups';
  purinePer100g: number;
  level: PurineTrafficLevel;
  defaultServingGrams: number;
  commonUnit: string;
  pubchemCid?: number;
  tips: string;
  scientificAlias?: string;
}

export interface BiochemicalCompound {
  cid: number;
  name: string;
  enName: string;
  formula: string;
  molecularWeight: string;
  canonicalSmiles: string;
  role: string;
  solubilityNote: string;
  pngUrl: string;
  metabolismStep: string;
}

export interface WaterLogItem {
  id: string;
  timestamp: number;
  timeStr: string;
  amountMl: number;
  type: 'warm_water' | 'lemon_water' | 'soda_water' | 'light_tea';
}

export interface DailyHydrationState {
  dateStr: string;
  targetMl: number;
  consumedMl: number;
  logs: WaterLogItem[];
}

export interface AdminSystemConfig {
  dailyPurineThresholdMg: number;
  strictPurineThresholdMg: number;
  waterBaseMl: number;
  waterPerPurineFactor: number; // additional ml per mg of purine
  activeMode: 'standard' | 'strict'; // 300mg vs 150mg
  aiModelName: string;
}
