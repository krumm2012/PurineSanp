import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Plus,
  Trash2,
  Droplets,
  Sparkles,
  Camera,
  Utensils,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { MealType } from '../../types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐/零食',
};

const PRESET_MEALS = [
  { name: '潮汕牛肉火锅', desc: '精瘦牛肉与时蔬' },
  { name: '香煎三文鱼便当', desc: '深海优质蛋白' },
  { name: '清炒豆腐便当', desc: '低嘌呤轻素食' },
  { name: '蒜蓉海鲜生蚝', desc: '高嘌呤测试样' },
];

export const HomeTab: React.FC = () => {
  const {
    todayTotalPurineMg,
    todayTargetPurineMg,
    todayTrafficLevel,
    todayMeals,
    deleteMeal,
    hydration,
    addWater,
    openScanModal,
    setMiniActiveTab,
  } = useApp();

  const progressPercent = Math.min(
    100,
    Math.round((todayTotalPurineMg / todayTargetPurineMg) * 100)
  );

  // SVG Circular progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const levelColor =
    todayTrafficLevel === 'green'
      ? {
          stroke: '#059669',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          label: '安全平衡',
          sub: '全天摄入控制优异，处于安全低嘌呤区间',
          icon: ShieldCheck,
        }
      : todayTrafficLevel === 'yellow'
      ? {
          stroke: '#D97706',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          label: '适量关注',
          sub: '已达推荐上限 75% 以上，晚餐建议以清淡时蔬为主',
          icon: AlertTriangle,
        }
      : {
          stroke: '#DC2626',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          label: '超标预警',
          sub: '今日总摄入超出预设上限，请多饮温水加速肾脏排酸',
          icon: AlertOctagon,
        };

  const LevelIcon = levelColor.icon;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 pb-20 bg-slate-50/70">
      {/* Top Banner Card: Purine Gauge */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800">今日嘌呤摄入量</span>
            <span className="text-[11px] text-slate-400">· 推荐上限 {todayTargetPurineMg}mg</span>
          </div>
          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${levelColor.bg} ${levelColor.text} ${levelColor.border} border`}
          >
            <LevelIcon className="w-3 h-3" />
            <span>{levelColor.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Circular Progress Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              {/* Background ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="none"
              />
              {/* Dynamic Progress ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={levelColor.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {todayTotalPurineMg}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                mg 嘌呤
              </span>
              <span className="text-[10px] font-semibold text-slate-500 font-mono mt-0.5">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">剩余安全额度</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                  {Math.max(0, Math.round((todayTargetPurineMg - todayTotalPurineMg) * 10) / 10)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">mg</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">代谢补水建议</span>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold font-mono text-cyan-700 tabular-nums">
                    {hydration.consumedMl}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    / {hydration.targetMl} mL
                  </span>
                </div>
                <button
                  onClick={() => addWater(250, 'warm_water')}
                  className="text-[10px] text-emerald-700 font-medium bg-emerald-100/70 hover:bg-emerald-200/80 px-2 py-0.5 rounded-md transition-colors"
                >
                  +250ml
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Advice Line */}
        <p className="mt-3 text-[11px] text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100 leading-relaxed">
          {levelColor.sub}
        </p>
      </div>

      {/* Quick Try Preset Dishes */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            快捷测算样本（免拍照即测）
          </span>
          <span className="text-[10px] text-slate-400">点击自动拆解</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_MEALS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => openScanModal(preset.name)}
              className="bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                  {preset.name}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Snap Action Trigger Button */}
      <button
        onClick={() => openScanModal()}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 active:scale-[0.99] transition-transform"
      >
        <Camera className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-wide">拍照 / 上传餐盘智能识别</span>
      </button>

      {/* Today Meals Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800">今日饮食流水</span>
            <span className="text-[10px] text-slate-400">({todayMeals.length} 餐)</span>
          </div>
          <button
            onClick={() => setMiniActiveTab('wiki')}
            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
          >
            查食物库
          </button>
        </div>

        {todayMeals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200/80">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">今日暂无餐食记录</p>
            <p className="text-[11px] text-slate-400 mt-1">
              点击下方拍照按钮，记录今天的第一餐
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayMeals.map((meal) => {
              const badgeStyle =
                meal.overallTraffic === 'green'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : meal.overallTraffic === 'yellow'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{meal.dishName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {MEAL_LABELS[meal.mealType]}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{meal.timeStr}</span>
                      </div>

                      {/* Ingredients pills */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {meal.ingredients.map((ing) => (
                          <span
                            key={ing.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                              ing.category === 'green'
                                ? 'bg-emerald-50 text-emerald-700'
                                : ing.category === 'yellow'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {ing.name} {ing.weightGrams}g ({Math.round(ing.totalPurineMg)}mg)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                          {Math.round(meal.totalPurineMg * 10) / 10}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">mg</span>
                      </div>
                      <div
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border mt-0.5 font-medium ${badgeStyle}`}
                      >
                        {meal.overallTraffic === 'green'
                          ? '低嘌呤'
                          : meal.overallTraffic === 'yellow'
                          ? '中嘌呤'
                          : '高嘌呤'}
                      </div>
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors mt-2 p-0.5"
                        title="删除记录"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {meal.healthAdvice?.biochemicalInsight && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-600">代谢小贴士: </span>
                      {meal.healthAdvice.biochemicalInsight}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
