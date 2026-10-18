import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Camera, Droplets, BookOpen } from 'lucide-react';

export const MiniTabBar: React.FC = () => {
  const { miniActiveTab, setMiniActiveTab, todayMeals } = useApp();

  const tabs = [
    { id: 'home' as const, label: '记录', icon: Home, badge: todayMeals.length },
    { id: 'scan' as const, label: '拍照测算', icon: Camera, highlight: true },
    { id: 'science' as const, label: '生化补水', icon: Droplets },
    { id: 'wiki' as const, label: '食物库', icon: BookOpen },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shrink-0 z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = miniActiveTab === tab.id;

        if (tab.highlight) {
          return (
            <button
              key={tab.id}
              onClick={() => setMiniActiveTab(tab.id)}
              className="flex flex-col items-center justify-center -mt-5 relative group focus:outline-none"
              title="拍照测嘌呤"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setMiniActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors focus:outline-none ${
              isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              {tab.badge !== undefined && tab.badge > 0 && tab.id === 'home' && (
                <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-mono font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 transition-colors ${
                isActive ? 'font-semibold text-emerald-700' : 'text-slate-500 font-normal'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
