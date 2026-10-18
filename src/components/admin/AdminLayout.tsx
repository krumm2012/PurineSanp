import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { FoodDatabaseCMS } from './FoodDatabaseCMS';
import { SystemSettings } from './SystemSettings';
import {
  Activity,
  Database,
  Sliders,
  Smartphone,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { setActiveView } = useApp();
  const [adminTab, setAdminTab] = useState<'monitoring' | 'cms' | 'settings'>('monitoring');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      {/* Admin Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  PurineSnap Admin
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  管理后台
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                嘌呤检测与健康饮食数据中心
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAdminTab('monitoring')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                adminTab === 'monitoring'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>饮食监测与流水</span>
            </button>
            <button
              onClick={() => setAdminTab('cms')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                adminTab === 'cms'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>食物库管理 (CMS)</span>
            </button>
            <button
              onClick={() => setAdminTab('settings')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                adminTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>系统与小程序配置</span>
            </button>
          </nav>

          {/* Right Action: Return to WeChat Mini Program */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('miniprogram')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-colors active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>打开微信小程序预览</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {adminTab === 'monitoring' && <AdminDashboard />}
        {adminTab === 'cms' && <FoodDatabaseCMS />}
        {adminTab === 'settings' && <SystemSettings />}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
        PurineSnap 嘌呤智探 · 智能生物化学与低嘌呤健康饮食分析系统 · 支持微信小程序与标准 RESTful API
      </footer>
    </div>
  );
};
