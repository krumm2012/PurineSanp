import { Wifi, BatteryMedium, MoreHorizontal, Circle, Sparkles, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MiniNavBarProps {
  title: string;
  onOpenShare?: () => void;
}

export const MiniNavBar: React.FC<MiniNavBarProps> = ({ title, onOpenShare }) => {
  const { setActiveView, openScanModal } = useApp();

  // Current system time for status bar
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 select-none">
      {/* iOS / WeChat Status Bar */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1 text-slate-800 text-[11px] font-medium font-sans">
        <span className="tracking-tight font-semibold">{timeStr}</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <span className="text-[10px] tracking-tighter">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>

      {/* Mini Program Title Bar with Capsule */}
      <div className="flex items-center justify-between px-4 py-2 relative h-11">
        {/* Left Sub-Brand & Quick Camera Trigger */}
        <button
          onClick={() => openScanModal()}
          className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
          title="点击直接唤起相机测算"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Camera className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-slate-900 tracking-tight">拍照测算</span>
        </button>

        {/* Center Title */}
        <div className="absolute inset-x-0 mx-auto text-center pointer-events-none">
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h1>
        </div>

        {/* Right WeChat Capsule Button */}
        <div className="flex items-center bg-slate-100/90 border border-slate-200/90 rounded-full py-0.5 px-2 gap-2 shadow-2xs">
          <button
            onClick={onOpenShare}
            className="text-slate-600 hover:text-slate-900 transition-colors p-0.5 focus:outline-none"
            title="生成微信健康打卡海报"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3 bg-slate-300/80" />
          <button
            onClick={() => setActiveView('admin')}
            className="text-slate-600 hover:text-slate-900 transition-colors p-0.5 focus:outline-none"
            title="切换至运营管理后台"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
