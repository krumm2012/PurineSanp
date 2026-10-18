import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  AlertTriangle,
  TrendingDown,
  Droplets,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Utensils,
  Calendar,
} from 'lucide-react';
import { MealRecord, PurineTrafficLevel } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { meals, deleteMeal, adminConfig, hydration } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  // Statistics
  const totalMealsCount = meals.length;
  const redAlertCount = meals.filter((m) => m.overallTraffic === 'red').length;
  const yellowCount = meals.filter((m) => m.overallTraffic === 'yellow').length;
  const greenCount = meals.filter((m) => m.overallTraffic === 'green').length;

  const totalPurineSum = meals.reduce((acc, m) => acc + m.totalPurineMg, 0);
  const avgPurinePerMeal =
    totalMealsCount > 0 ? Math.round((totalPurineSum / totalMealsCount) * 10) / 10 : 0;

  // Filtered Meals
  const filteredMeals = meals.filter((m) => {
    const matchSearch =
      m.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLevel = levelFilter === 'all' || m.overallTraffic === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>总录入餐食流水</span>
            <Utensils className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalMealsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">餐次</span>
          </div>
          <span className="text-[11px] text-slate-400">已自动拆解食材成分</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>平均单餐嘌呤</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {avgPurinePerMeal}
            </span>
            <span className="text-xs text-slate-400 font-mono">mg / 餐</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            全天阈值 {adminConfig.dailyPurineThresholdMg}mg
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>高危红灯预警</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
              {redAlertCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">次告警</span>
          </div>
          <span className="text-[11px] text-slate-400">
            中嘌呤适量 {yellowCount} 次 · 安全 {greenCount} 次
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>今日补水排酸进度</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-700 tabular-nums">
              {hydration.consumedMl}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {hydration.targetMl} mL</span>
          </div>
          <span className="text-[11px] text-cyan-700 font-medium">
            完成度 {Math.round((hydration.consumedMl / hydration.targetMl) * 100)}%
          </span>
        </div>
      </div>

      {/* Meals Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">饮食流水与超标监测表</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredMeals.length} 条)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索菜名或食材..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">全部等级</option>
              <option value="green">绿灯安全</option>
              <option value="yellow">黄灯适量</option>
              <option value="red">红灯超标</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">时间 / 餐别</th>
                <th className="py-3 px-4">菜品名称</th>
                <th className="py-3 px-4">拆解食材构成</th>
                <th className="py-3 px-4 text-right">总嘌呤 (mg)</th>
                <th className="py-3 px-4 text-center">安全红绿灯</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    暂无符合条件的饮食记录
                  </td>
                </tr>
              ) : (
                filteredMeals.map((meal) => {
                  const isExpanded = expandedMealId === meal.id;
                  const badgeColor =
                    meal.overallTraffic === 'green'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : meal.overallTraffic === 'yellow'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <React.Fragment key={meal.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono text-slate-800 font-medium">{meal.timeStr}</div>
                          <div className="text-[10px] text-slate-400">
                            {meal.dateStr} ·{' '}
                            {meal.mealType === 'breakfast'
                              ? '早餐'
                              : meal.mealType === 'lunch'
                              ? '午餐'
                              : meal.mealType === 'dinner'
                              ? '晚餐'
                              : '加餐'}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-[160px] truncate">
                          {meal.dishName}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              setExpandedMealId(isExpanded ? null : meal.id)
                            }
                            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-emerald-700 font-medium"
                          >
                            <span>{meal.ingredients.length} 种食材明细</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {meal.totalPurineMg}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badgeColor}`}
                          >
                            {meal.overallTraffic === 'green'
                              ? '● 绿灯安全'
                              : meal.overallTraffic === 'yellow'
                              ? '▲ 黄灯适量'
                              : '✖ 红灯高危'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                            title="删除该记录"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Ingredient Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="space-y-2">
                              <span className="text-[11px] font-semibold text-slate-700 block">
                                食材克数与单项嘌呤拆解：
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {meal.ingredients.map((ing) => (
                                  <div
                                    key={ing.id}
                                    className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-0.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-slate-800">{ing.name}</span>
                                      <span
                                        className={`text-[9px] px-1 py-0.2 rounded-xs font-medium ${
                                          ing.category === 'green'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : ing.category === 'yellow'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-rose-50 text-rose-700'
                                        }`}
                                      >
                                        {ing.purinePer100g}mg/100g
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                      <span>用量: {ing.weightGrams}g</span>
                                      <span className="font-bold text-slate-800">
                                        小计: {Math.round(ing.totalPurineMg * 10) / 10}mg
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {meal.healthAdvice?.biochemicalInsight && (
                                <p className="text-[10px] text-slate-500 pt-1">
                                  <strong>生化分析：</strong>
                                  {meal.healthAdvice.biochemicalInsight}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
