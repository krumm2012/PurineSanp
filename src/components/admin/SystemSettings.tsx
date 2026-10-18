import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Droplets,
  Cpu,
  Code2,
  Copy,
  Check,
  CheckCircle2,
  Download,
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { adminConfig, updateAdminConfig } = useApp();

  const [standardLimit, setStandardLimit] = useState(adminConfig.dailyPurineThresholdMg);
  const [strictLimit, setStrictLimit] = useState(adminConfig.strictPurineThresholdMg);
  const [activeMode, setActiveMode] = useState(adminConfig.activeMode);
  const [waterBase, setWaterBase] = useState(adminConfig.waterBaseMl);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveSettings = () => {
    updateAdminConfig({
      dailyPurineThresholdMg: Number(standardLimit),
      strictPurineThresholdMg: Number(strictLimit),
      activeMode,
      waterBaseMl: Number(waterBase),
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const miniProgramAppJson = `{
  "pages": [
    "pages/index/index",
    "pages/scan/scan",
    "pages/science/science",
    "pages/wiki/wiki"
  ],
  "window": {
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "PurineSnap 嘌呤智探",
    "backgroundColor": "#f8fafc"
  },
  "tabBar": {
    "color": "#94a3b8",
    "selectedColor": "#059669",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      { "pagePath": "pages/index/index", "text": "记录", "iconPath": "assets/home.png", "selectedIconPath": "assets/home-active.png" },
      { "pagePath": "pages/scan/scan", "text": "测算", "iconPath": "assets/camera.png", "selectedIconPath": "assets/camera-active.png" },
      { "pagePath": "pages/science/science", "text": "生化", "iconPath": "assets/drop.png", "selectedIconPath": "assets/drop-active.png" },
      { "pagePath": "pages/wiki/wiki", "text": "词典", "iconPath": "assets/book.png", "selectedIconPath": "assets/book-active.png" }
    ]
  },
  "permission": {
    "scope.camera": {
      "desc": "用于拍照识别餐盘中的菜品与食材嘌呤含量"
    }
  }
}`;

  const handleCopyMiniConfig = () => {
    navigator.clipboard.writeText(miniProgramAppJson).then(() => {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Threshold & Health Rules */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">健康红绿灯阈值与模式设定</h3>
          </div>
          {saveToast && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              已保存配置并在小程序端生效
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium block">默认模式选择</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveMode('standard')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeMode === 'standard'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">标准防范模式</div>
                <div className="text-[10px] text-slate-400 mt-0.5">每日上限 300mg</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('strict')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeMode === 'strict'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">严格控制模式</div>
                <div className="text-[10px] text-slate-400 mt-0.5">每日上限 150mg</div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium block">
              日常防范建议上限 (mg/日)
            </label>
            <input
              type="number"
              value={standardLimit}
              onChange={(e) => setStandardLimit(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400">
              中国居民高尿酸血症与痛风饮食指南建议控制在 250~300mg 以下
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium block">
              基础排酸饮水目标 (mL/日)
            </label>
            <input
              type="number"
              value={waterBase}
              onChange={(e) => setWaterBase(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400">
              系统将根据实际摄入嘌呤在此基数上弹性增加需水量
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium block">
              痛风/发作期严格上限 (mg/日)
            </label>
            <input
              type="number"
              value={strictLimit}
              onChange={(e) => setStrictLimit(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400">
              适用于尿酸 &gt; 480μmol/L 或痛风发作恢复期的极严格限制
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            保存参数修改
          </button>
        </div>
      </div>

      {/* AI Model & Backend Services Spec */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">AI 多模态视觉模型与生化引擎规格</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">多模态大模型</span>
            <span className="font-mono font-bold text-slate-900">{adminConfig.aiModelName}</span>
            <span className="text-[10px] text-emerald-700 block mt-1">支持图文混合与细粒度食材分割</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">生化化学数据库</span>
            <span className="font-mono font-bold text-slate-900">NIH PubChem PUG-REST</span>
            <span className="text-[10px] text-slate-500 block mt-1">CID 1175, 1188, 790, 190, 135398634</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">服务端接口协议</span>
            <span className="font-mono font-bold text-slate-900">POST /api/analyze-meal</span>
            <span className="text-[10px] text-slate-500 block mt-1">标准 JSON 结构化输出契约</span>
          </div>
        </div>
      </div>

      {/* WeChat Mini Program Source Blueprint */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              微信小程序开发包 (app.json 配置蓝图)
            </h3>
          </div>
          <button
            onClick={handleCopyMiniConfig}
            className="text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-colors"
          >
            {copiedConfig ? (
              <>
                <Check className="w-3.5 h-3.5" />
                已复制配置
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                复制代码
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          如需将本项目直接发布为微信原生小程序，可在微信开发者工具中直接载入此标准配置文件：
        </p>

        <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
          {miniProgramAppJson}
        </pre>
      </div>
    </div>
  );
};
