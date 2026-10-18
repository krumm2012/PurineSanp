import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  MealRecord,
  FoodDatabaseItem,
  DailyHydrationState,
  AdminSystemConfig,
  WaterLogItem,
  PurineTrafficLevel,
} from '../types';
import { INITIAL_FOOD_DATABASE } from '../data/purineDatabase';

interface AppContextValue {
  // Meals
  meals: MealRecord[];
  todayDateStr: string;
  todayMeals: MealRecord[];
  todayTotalPurineMg: number;
  todayTrafficLevel: PurineTrafficLevel;
  todayTargetPurineMg: number;
  addMeal: (record: Omit<MealRecord, 'id' | 'timestamp' | 'dateStr' | 'timeStr'>) => MealRecord;
  deleteMeal: (id: string) => void;
  updateMeal: (id: string, updated: Partial<MealRecord>) => void;

  // Hydration
  hydration: DailyHydrationState;
  addWater: (amountMl: number, type?: WaterLogItem['type']) => void;

  // Food Database CMS
  foodDatabase: FoodDatabaseItem[];
  addFoodItem: (item: Omit<FoodDatabaseItem, 'id'>) => void;
  updateFoodItem: (id: string, item: Partial<FoodDatabaseItem>) => void;
  deleteFoodItem: (id: string) => void;
  resetFoodDatabase: () => void;

  // Admin Config
  adminConfig: AdminSystemConfig;
  updateAdminConfig: (cfg: Partial<AdminSystemConfig>) => void;

  // Navigation & Shell
  activeView: 'miniprogram' | 'admin';
  setActiveView: (view: 'miniprogram' | 'admin') => void;
  miniActiveTab: 'home' | 'scan' | 'science' | 'wiki';
  setMiniActiveTab: (tab: 'home' | 'scan' | 'science' | 'wiki') => void;
  deviceFrame: 'mobile' | 'fullscreen';
  setDeviceFrame: (frame: 'mobile' | 'fullscreen') => void;

  // Scan modal helper
  isScanModalOpen: boolean;
  setIsScanModalOpen: (open: boolean) => void;
  scanInitialPreset: string | null;
  openScanModal: (presetName?: string) => void;
  closeScanModal: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

const DEFAULT_ADMIN_CONFIG: AdminSystemConfig = {
  dailyPurineThresholdMg: 300,
  strictPurineThresholdMg: 150,
  waterBaseMl: 2000,
  waterPerPurineFactor: 2.0, // +2ml per mg of purine
  activeMode: 'standard',
  aiModelName: 'gemini-3.8-flash',
};

// Seed sample meals for today so the app displays vibrant, realistic data immediately
const SEED_MEALS: MealRecord[] = [
  {
    id: 'seed-meal-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    dateStr: getTodayStr(),
    timeStr: '08:15',
    mealType: 'breakfast',
    dishName: '高蛋白低嘌呤活力早餐',
    ingredients: [
      { id: 'i1', name: '水煮鸡蛋', weightGrams: 50, purinePer100g: 3.7, totalPurineMg: 1.9, category: 'green', notes: '几乎零嘌呤' },
      { id: 'i2', name: '无糖燕麦片', weightGrams: 40, purinePer100g: 48.0, totalPurineMg: 19.2, category: 'green', notes: '富含膳食纤维' },
      { id: 'i3', name: '现磨无糖豆浆', weightGrams: 250, purinePer100g: 27.7, totalPurineMg: 69.3, category: 'green', notes: '稀释植物蛋白' },
    ],
    totalPurineMg: 90.4,
    overallTraffic: 'green',
    recommendedWaterMl: 400,
    healthAdvice: {
      riskLevel: '极低风险（安全健康）',
      biochemicalInsight: '全餐以卵清蛋白和高度稀释的豆浆为主，核酸含量低，不引起血尿酸波动。',
      synergyTips: '晨起随餐补水利于稀释夜间浓缩尿液。',
      waterSchedule: '上午 9:30 饮水 250mL。',
    },
  },
  {
    id: 'seed-meal-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    dateStr: getTodayStr(),
    timeStr: '12:30',
    mealType: 'lunch',
    dishName: '香煎三文鱼佐西蓝花粗粮便当',
    ingredients: [
      { id: 'i4', name: '三文鱼柳', weightGrams: 100, purinePer100g: 119.3, totalPurineMg: 119.3, category: 'yellow', notes: '中嘌呤深海优质鱼' },
      { id: 'i5', name: '西兰花', weightGrams: 120, purinePer100g: 30.5, totalPurineMg: 36.6, category: 'green', notes: '富含维C促进排酸' },
      { id: 'i6', name: '黑米饭', weightGrams: 130, purinePer100g: 22.0, totalPurineMg: 28.6, category: 'green', notes: '低升糖主食' },
    ],
    totalPurineMg: 184.5,
    overallTraffic: 'yellow',
    recommendedWaterMl: 550,
    healthAdvice: {
      riskLevel: '适量摄入（单餐在健康建议区间）',
      biochemicalInsight: '三文鱼中次黄嘌呤经黄嘌呤氧化酶催化生成尿酸，西兰花提供的维生素C可促进近曲小管排酸。',
      synergyTips: '餐中多食绿叶蔬菜，餐后建议饮用弱碱性水。',
      waterSchedule: '下午 14:00 与 16:00 各饮水 300mL。',
    },
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDateStr = useMemo(() => getTodayStr(), []);

  // Meals state with LocalStorage
  const [meals, setMeals] = useState<MealRecord[]>(() => {
    try {
      const saved = localStorage.getItem('purinesnap_meals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load meals from storage', e);
    }
    return SEED_MEALS;
  });

  // Food CMS Database
  const [foodDatabase, setFoodDatabase] = useState<FoodDatabaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('purinesnap_food_db');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load food db from storage', e);
    }
    return INITIAL_FOOD_DATABASE;
  });

  // Admin Config
  const [adminConfig, setAdminConfig] = useState<AdminSystemConfig>(() => {
    try {
      const saved = localStorage.getItem('purinesnap_admin_cfg');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load config from storage', e);
    }
    return DEFAULT_ADMIN_CONFIG;
  });

  // Hydration state
  const [hydration, setHydration] = useState<DailyHydrationState>(() => {
    try {
      const saved = localStorage.getItem('purinesnap_hydration');
      if (saved) {
        const parsed: DailyHydrationState = JSON.parse(saved);
        if (parsed.dateStr === getTodayStr()) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load hydration from storage', e);
    }
    return {
      dateStr: getTodayStr(),
      targetMl: 2400,
      consumedMl: 1250,
      logs: [
        { id: 'w1', timestamp: Date.now() - 1000 * 60 * 60 * 7, timeStr: '08:30', amountMl: 300, type: 'warm_water' },
        { id: 'w2', timestamp: Date.now() - 1000 * 60 * 60 * 5, timeStr: '10:30', amountMl: 250, type: 'lemon_water' },
        { id: 'w3', timestamp: Date.now() - 1000 * 60 * 60 * 2, timeStr: '13:30', amountMl: 350, type: 'soda_water' },
        { id: 'w4', timestamp: Date.now() - 1000 * 60 * 45, timeStr: '15:15', amountMl: 350, type: 'warm_water' },
      ],
    };
  });

  // Navigation State
  const [activeView, setActiveView] = useState<'miniprogram' | 'admin'>('miniprogram');
  const [miniActiveTab, setMiniActiveTab] = useState<'home' | 'scan' | 'science' | 'wiki'>('home');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'fullscreen'>('mobile');

  // Scan modal state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanInitialPreset, setScanInitialPreset] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('purinesnap_meals', JSON.stringify(meals));
    } catch (e) {
      console.warn('Failed to save meals', e);
    }
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem('purinesnap_food_db', JSON.stringify(foodDatabase));
    } catch (e) {
      console.warn('Failed to save food db', e);
    }
  }, [foodDatabase]);

  useEffect(() => {
    try {
      localStorage.setItem('purinesnap_admin_cfg', JSON.stringify(adminConfig));
    } catch (e) {
      console.warn('Failed to save admin cfg', e);
    }
  }, [adminConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('purinesnap_hydration', JSON.stringify(hydration));
    } catch (e) {
      console.warn('Failed to save hydration', e);
    }
  }, [hydration]);

  // Today calculations
  const todayMeals = useMemo(() => {
    return meals.filter((m) => m.dateStr === todayDateStr);
  }, [meals, todayDateStr]);

  const todayTotalPurineMg = useMemo(() => {
    const sum = todayMeals.reduce((acc, m) => acc + m.totalPurineMg, 0);
    return Math.round(sum * 10) / 10;
  }, [todayMeals]);

  const todayTargetPurineMg = useMemo(() => {
    return adminConfig.activeMode === 'strict'
      ? adminConfig.strictPurineThresholdMg
      : adminConfig.dailyPurineThresholdMg;
  }, [adminConfig]);

  const todayTrafficLevel = useMemo<PurineTrafficLevel>(() => {
    if (todayTotalPurineMg > todayTargetPurineMg) return 'red';
    if (todayTotalPurineMg >= todayTargetPurineMg * 0.75) return 'yellow';
    return 'green';
  }, [todayTotalPurineMg, todayTargetPurineMg]);

  // Dynamically update hydration target when total purine changes
  useEffect(() => {
    const dynamicTarget = Math.round(
      adminConfig.waterBaseMl + todayTotalPurineMg * adminConfig.waterPerPurineFactor
    );
    setHydration((prev) => ({
      ...prev,
      targetMl: Math.max(2000, dynamicTarget),
    }));
  }, [todayTotalPurineMg, adminConfig.waterBaseMl, adminConfig.waterPerPurineFactor]);

  // Actions
  const addMeal = (record: Omit<MealRecord, 'id' | 'timestamp' | 'dateStr' | 'timeStr'>): MealRecord => {
    const newMeal: MealRecord = {
      ...record,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateStr: todayDateStr,
      timeStr: getTimeStr(),
    };
    setMeals((prev) => [newMeal, ...prev]);
    return newMeal;
  };

  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMeal = (id: string, updated: Partial<MealRecord>) => {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  };

  const addWater = (amountMl: number, type: WaterLogItem['type'] = 'warm_water') => {
    const newLog: WaterLogItem = {
      id: `water-${Date.now()}`,
      timestamp: Date.now(),
      timeStr: getTimeStr(),
      amountMl,
      type,
    };
    setHydration((prev) => ({
      ...prev,
      consumedMl: prev.consumedMl + amountMl,
      logs: [newLog, ...prev.logs],
    }));
  };

  // Food DB Actions
  const addFoodItem = (item: Omit<FoodDatabaseItem, 'id'>) => {
    const newItem: FoodDatabaseItem = {
      ...item,
      id: `custom-food-${Date.now()}`,
    };
    setFoodDatabase((prev) => [newItem, ...prev]);
  };

  const updateFoodItem = (id: string, updated: Partial<FoodDatabaseItem>) => {
    setFoodDatabase((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
  };

  const deleteFoodItem = (id: string) => {
    setFoodDatabase((prev) => prev.filter((f) => f.id !== id));
  };

  const resetFoodDatabase = () => {
    setFoodDatabase(INITIAL_FOOD_DATABASE);
  };

  const updateAdminConfig = (cfg: Partial<AdminSystemConfig>) => {
    setAdminConfig((prev) => ({ ...prev, ...cfg }));
  };

  const openScanModal = (presetName?: string) => {
    setScanInitialPreset(presetName || null);
    setIsScanModalOpen(true);
  };

  const closeScanModal = () => {
    setIsScanModalOpen(false);
    setScanInitialPreset(null);
  };

  return (
    <AppContext.Provider
      value={{
        meals,
        todayDateStr,
        todayMeals,
        todayTotalPurineMg,
        todayTrafficLevel,
        todayTargetPurineMg,
        addMeal,
        deleteMeal,
        updateMeal,

        hydration,
        addWater,

        foodDatabase,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        resetFoodDatabase,

        adminConfig,
        updateAdminConfig,

        activeView,
        setActiveView,
        miniActiveTab,
        setMiniActiveTab,
        deviceFrame,
        setDeviceFrame,

        isScanModalOpen,
        setIsScanModalOpen,
        scanInitialPreset,
        openScanModal,
        closeScanModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
