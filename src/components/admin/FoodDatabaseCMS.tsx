import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodDatabaseItem, PurineTrafficLevel } from '../../types';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  RotateCcw,
  BookOpen,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

const CATEGORY_NAMES: Record<string, string> = {
  meat: '畜禽肉类',
  seafood: '海鲜水产',
  beans: '豆类豆制品',
  vegetables: '蔬菜菌菇',
  grains: '谷物主食',
  drinks: '饮品酒水',
  soups: '汤品加工',
  nuts: '坚果零食',
};

export const FoodDatabaseCMS: React.FC = () => {
  const { foodDatabase, addFoodItem, updateFoodItem, deleteFoodItem, resetFoodDatabase } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodDatabaseItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FoodDatabaseItem['category']>('meat');
  const [formPurine, setFormPurine] = useState<number>(50);
  const [formServing, setFormServing] = useState<number>(100);
  const [formTips, setFormTips] = useState('');
  const [formCid, setFormCid] = useState<string>('');

  const filteredItems = useMemo(() => {
    return foodDatabase.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.scientificAlias && f.scientificAlias.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = categoryFilter === 'all' || f.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [foodDatabase, searchQuery, categoryFilter]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('meat');
    setFormPurine(50);
    setFormServing(100);
    setFormTips('');
    setFormCid('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodDatabaseItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPurine(item.purinePer100g);
    setFormServing(item.defaultServingGrams);
    setFormTips(item.tips);
    setFormCid(item.pubchemCid ? String(item.pubchemCid) : '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    const level: PurineTrafficLevel =
      formPurine < 50 ? 'green' : formPurine <= 150 ? 'yellow' : 'red';

    const itemData = {
      name: formName.trim(),
      category: formCategory,
      purinePer100g: Number(formPurine) || 0,
      level,
      defaultServingGrams: Number(formServing) || 100,
      commonUnit: '份',
      tips: formTips.trim() || '日常均衡食用',
      pubchemCid: formCid ? parseInt(formCid, 10) : undefined,
    };

    if (editingItem) {
      updateFoodItem(editingItem.id, itemData);
    } else {
      addFoodItem(itemData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">食物嘌呤基础数据库 (CMS)</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            共收录权威测定食物 <span className="font-mono font-semibold">{foodDatabase.length}</span> 种，支持自定义扩充
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFoodDatabase}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 font-medium"
            title="恢复为国家食品标准权威库"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置数据库
          </button>
          <button
            onClick={openAddModal}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            新增食物
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索食材名或学名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部
            </button>
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* CMS Table */}
        <div className="overflow-x-auto border-t border-slate-100 pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-200/80">
                <th className="py-2.5 px-3">食物名称</th>
                <th className="py-2.5 px-3">分类</th>
                <th className="py-2.5 px-3 text-right">嘌呤 (mg/100g)</th>
                <th className="py-2.5 px-3 text-center">安全分级</th>
                <th className="py-2.5 px-3">营养指引与建议</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const badgeColor =
                  item.level === 'green'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.level === 'yellow'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{item.name}</div>
                      {item.scientificAlias && (
                        <div className="text-[10px] text-slate-400 font-mono italic">
                          {item.scientificAlias}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      {CATEGORY_NAMES[item.category] || item.category}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {item.purinePer100g}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.2 rounded-full border font-semibold ${badgeColor}`}
                      >
                        {item.level === 'green' ? '安全' : item.level === 'yellow' ? '适量' : '高危'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {item.tips}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-slate-400 hover:text-emerald-600 p-1 mr-1 transition-colors"
                        title="编辑食物信息"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFoodItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="删除该食物"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Food Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                {editingItem ? '编辑食物嘌呤参数' : '新增食物入库'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">食物名称</label>
                <input
                  type="text"
                  placeholder="如：白对虾"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">食物分类</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-medium">
                    嘌呤含量 (mg/100g)
                  </label>
                  <input
                    type="number"
                    value={formPurine}
                    onChange={(e) => setFormPurine(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">
                    常规建议份量 (g)
                  </label>
                  <input
                    type="number"
                    value={formServing}
                    onChange={(e) => setFormServing(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-medium">
                    PubChem CID (选填)
                  </label>
                  <input
                    type="text"
                    placeholder="如 1175"
                    value={formCid}
                    onChange={(e) => setFormCid(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">烹饪与食用指引</label>
                <textarea
                  rows={2}
                  placeholder="如：焯水弃汤食用，痛风期控制摄入..."
                  value={formTips}
                  onChange={(e) => setFormTips(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-xs"
              >
                保存食物
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
