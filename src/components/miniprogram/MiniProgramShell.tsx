import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MiniNavBar } from './MiniNavBar';
import { MiniTabBar } from './MiniTabBar';
import { HomeTab } from './HomeTab';
import { ScanTab } from './ScanTab';
import { ScienceTab } from './ScienceTab';
import { FoodWikiTab } from './FoodWikiTab';
import { ReportShareModal } from './ReportShareModal';
import { Smartphone, Maximize2, Minimize2, Settings2, Sparkles, X, Camera } from 'lucide-react';

export const MiniProgramShell: React.FC = () => {
  const {
    miniActiveTab,
    deviceFrame,
    setDeviceFrame,
    setActiveView,
    isScanModalOpen,
    scanInitialPreset,
    closeScanModal,
  } = useApp();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const tabTitles: Record<string, string> = {
    home: '嘌呤智探',
    scan: '拍照识别食材',
    science: '排酸补水与生化',
    wiki: '食物嘌呤百科',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-2 sm:p-4 text-slate-900 font-sans">
      {/* Top Controller Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2 text-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
            PurineSnap 微信小程序预览端
          </span>
          <span className="hidden sm:inline-block text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
            WeChat Mini Program v2.4
          </span>
        </div>

        {/* View Controls & Admin Switch */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex items-center gap-0.5">
            <button
              onClick={() => setDeviceFrame('mobile')}
              className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                deviceFrame === 'mobile'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="手机真机视口"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">真机模拟器</span>
            </button>
            <button
              onClick={() => setDeviceFrame('fullscreen')}
              className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                deviceFrame === 'fullscreen'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="自适应全屏"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">全屏自适应</span>
            </button>
          </div>

          <button
            onClick={() => setActiveView('admin')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>简易管理后台</span>
          </button>
        </div>
      </div>

      {/* Device Viewport Wrapper */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrame === 'mobile'
            ? 'max-w-[400px] h-[844px] max-h-[92vh] rounded-[44px] ring-12 ring-slate-800/90 shadow-2xl overflow-hidden border border-slate-700/60 bg-white relative flex flex-col'
            : 'max-w-2xl h-[92vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-white relative flex flex-col'
        }`}
      >
        {/* Dynamic Island / Speaker Notch (Only for mobile frame) */}
        {deviceFrame === 'mobile' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-40 pointer-events-none flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 ring-1 ring-slate-800 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
          </div>
        )}

        {/* WeChat Navigation Bar */}
        <MiniNavBar
          title={tabTitles[miniActiveTab] || '嘌呤智探'}
          onOpenShare={() => setIsShareModalOpen(true)}
        />

        {/* Tab View Contents */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {miniActiveTab === 'home' && <HomeTab />}
          {miniActiveTab === 'scan' && <ScanTab />}
          {miniActiveTab === 'science' && <ScienceTab />}
          {miniActiveTab === 'wiki' && <FoodWikiTab />}
        </div>

        {/* WeChat Bottom TabBar */}
        <MiniTabBar />

        {/* Overlay Modal for Quick Preset Scan */}
        {isScanModalOpen && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-250">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">智能相机拍照测嘌呤</span>
              </div>
              <button
                onClick={closeScanModal}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScanTab initialPreset={scanInitialPreset} onFinished={closeScanModal} />
          </div>
        )}
      </div>

      {/* WeChat Social Health Poster Modal */}
      <ReportShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
