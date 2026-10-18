import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodDatabaseItem, PurineTrafficLevel } from '../../types';
import {
  Search,
  X,
  Sliders,
  Plus,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const CATEGORY_MAP: Record<string, string> = {
  all: '全部',
  meat: '畜禽肉',
  seafood: '海鲜水产',
  beans: '豆制品',
  vegetables: '蔬菜菌菇',
  grains: '谷物主食',
  drinks: '饮品酒水',
  soups: '汤品加工',
};

export const FoodWikiTab: React.FC = () => {
  const { foodDatabase, addMeal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Active item for serving calculator modal/drawer
  const [activeItem, setActiveItem] = useState<FoodDatabaseItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [mealTypeSelect, setMealTypeSelect] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [addedToast, setAddedToast] = useState(false);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.scientificAlias && item.scientificAlias.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tips && item.tips.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchLevel =
        selectedLevel === 'all' || item.level === selectedLevel;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [foodDatabase, searchQuery, selectedCategory, selectedLevel]);

  const handleOpenCalculator = (item: FoodDatabaseItem) => {
    setActiveItem(item);
    setPortionGrams(item.defaultServingGrams || 100);
    setAddedToast(false);
  };

  const calculatedPurine = activeItem
    ? Math.round(((portionGrams * activeItem.purinePer100g) / 100) * 10) / 10
    : 0;

  const handleAddDirectlyToMeals = () => {
    if (!activeItem) return;

    addMeal({
      dishName: activeItem.name,
      mealType: mealTypeSelect,
      ingredients: [
        {
          id: `ing-${Date.now()}`,
          name: activeItem.name,
          weightGrams: portionGrams,
          purinePer100g: activeItem.purinePer100g,
          totalPurineMg: calculatedPurine,
          category: activeItem.level,
          notes: activeItem.tips,
        },
      ],
      totalPurineMg: calculatedPurine,
      overallTraffic: activeItem.level,
      recommendedWaterMl: calculatedPurine > 100 ? 500 : 300,
      healthAdvice: {
        riskLevel: activeItem.level === 'green' ? '安全低嘌呤' : activeItem.level === 'yellow' ? '适量摄入' : '高危红灯',
        biochemicalInsight: activeItem.tips,
        synergyTips: '建议餐中搭配充足蔬菜，促进尿酸碱化排出',
        waterSchedule: '餐后适量补水',
      },
    });

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      setActiveItem(null);
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 bg-slate-50/70 space-y-3">
      {/* Search Bar (WeChat Style) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索食材、菜名 (如：牛肉、三文鱼、豆腐、啤酒)"
          className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Traffic Light Level Quick Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {[
          { id: 'all', label: '全部等级' },
          { id: 'green', label: '● 绿灯安全 (<50mg)' },
          { id: 'yellow', label: '▲ 黄灯适量 (50-150mg)' },
          { id: 'red', label: '✖ 红灯高危 (>150mg)' },
        ].map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => setSelectedLevel(lvl.id)}
            className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors font-medium border ${
              selectedLevel === lvl.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {Object.entries(CATEGORY_MAP).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors font-medium ${
              selectedCategory === key
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Food Cards List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>共找到 {filteredFoods.length} 种食物</span>
          <span>点击食材测算食用摄入</span>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 space-y-1">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">未找到匹配的食物</p>
            <p className="text-[11px] text-slate-400">尝试更换搜索关键词或筛选分类</p>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const badgeStyle =
              food.level === 'green'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : food.level === 'yellow'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={food.id}
                onClick={() => handleOpenCalculator(food)}
                className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {food.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium border shrink-0 ${badgeStyle}`}
                    >
                      {food.level === 'green' ? '安全' : food.level === 'yellow' ? '适量' : '高危'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate">{food.tips}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                        {food.purinePer100g}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">mg/100g</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block">
                      份量 ~{food.defaultServingGrams}g
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Serving Size Calculator Drawer Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 border-t border-slate-200 shadow-xl space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{activeItem.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      activeItem.level === 'green'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : activeItem.level === 'yellow'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    基准: {activeItem.purinePer100g} mg/100g
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  拖动滑块计算不同摄入克数下的实际嘌呤
                </span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slider & Real-time Computed Purine */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">预计食用分量</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {portionGrams}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">克 (g)</span>
                </div>
              </div>

              <input
                type="range"
                min={20}
                max={400}
                step={10}
                value={portionGrams}
                onChange={(e) => setPortionGrams(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-xs text-slate-500">将摄入嘌呤总量</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                    {calculatedPurine}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">mg</span>
                </div>
              </div>
            </div>

            {/* Scientific Tip */}
            <p className="text-[11px] text-slate-500 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 leading-relaxed">
              <strong className="text-emerald-900">健康营养指引：</strong>
              {activeItem.tips}
            </p>

            {/* Meal Type Picker & Add to Log */}
            <div className="flex items-center gap-2">
              <select
                value={mealTypeSelect}
                onChange={(e) => setMealTypeSelect(e.target.value as any)}
                className="text-xs font-medium text-slate-800 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">加餐</option>
              </select>

              <button
                onClick={handleAddDirectlyToMeals}
                disabled={addedToast}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] transition-transform"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    已计入今日饮食！
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    一键加入今日饮食
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
