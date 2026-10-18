import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Share2, Sparkles, QrCode, ShieldCheck, Droplets } from 'lucide-react';

interface ReportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportShareModal: React.FC<ReportShareModalProps> = ({ isOpen, onClose }) => {
  const { todayTotalPurineMg, todayTargetPurineMg, todayTrafficLevel, todayMeals, hydration } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `【PurineSnap 嘌呤智探·健康日报】\n📅 日期：${new Date().toLocaleDateString('zh-CN')}\n🥩 今日嘌呤摄入：${todayTotalPurineMg} mg / 上限 ${todayTargetPurineMg} mg\n🚦 安全状态：${
      todayTrafficLevel === 'green' ? '🟢 安全平稳' : todayTrafficLevel === 'yellow' ? '🟡 适量关注' : '🔴 超标预警'
    }\n💧 今日饮水打卡：${hydration.consumedMl} mL / ${hydration.targetMl} mL\n🍽️ 餐食记录：已记录 ${todayMeals.length} 餐\n健康无痛，低嘌呤均衡饮食每一天！`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Poster Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PurineSnap 嘌呤智探 · 健康日签</span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-white/70 block">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
                {todayTotalPurineMg}
              </span>
              <span className="text-sm font-mono text-white/80">mg 嘌呤</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                todayTrafficLevel === 'green'
                  ? 'bg-emerald-400 text-slate-950'
                  : todayTrafficLevel === 'yellow'
                  ? 'bg-amber-300 text-slate-950'
                  : 'bg-rose-400 text-slate-950'
              }`}
            >
              {todayTrafficLevel === 'green'
                ? '● 绿灯安全达标'
                : todayTrafficLevel === 'yellow'
                ? '▲ 适量提醒'
                : '✖ 超过设定阈值'}
            </span>
            <span className="text-xs text-white/80 font-mono">
              占上限 {Math.round((todayTotalPurineMg / todayTargetPurineMg) * 100)}%
            </span>
          </div>
        </div>

        {/* Poster Body */}
        <div className="p-5 space-y-3.5 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>餐食流水</span>
              </div>
              <span className="text-base font-bold font-mono text-slate-800">
                {todayMeals.length}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">餐</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                <Droplets className="w-3 h-3 text-cyan-600" />
                <span>排酸饮水</span>
              </div>
              <span className="text-base font-bold font-mono text-cyan-700">
                {hydration.consumedMl}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">/ {hydration.targetMl}ml</span>
            </div>
          </div>

          {/* Meals mini list */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 block">今日菜品拆解明细</span>
            {todayMeals.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-slate-700 text-[11px]">
                <span className="truncate max-w-[180px]">{m.dishName}</span>
                <span className="font-mono text-slate-500">{Math.round(m.totalPurineMg)} mg</span>
              </div>
            ))}
          </div>

          {/* QR Code footer stamp */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-500">
            <div className="text-[10px] leading-tight">
              <span className="font-semibold text-slate-800 block">微信小程序: 嘌呤智探</span>
              <span className="text-slate-400">拍照智能测嘌呤 · 循证排酸建议</span>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyText}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  已复制打卡日记
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  复制分享文本
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
