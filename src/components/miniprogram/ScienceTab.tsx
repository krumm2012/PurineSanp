import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  METABOLIC_COMPOUNDS,
  METABOLIC_PATHWAY_STEPS,
  DIETARY_SYNERGY_RULES,
} from '../../data/biochemistry';
import {
  Droplets,
  Plus,
  ExternalLink,
  Atom,
  Activity,
  CheckCircle,
  HelpCircle,
  Clock,
  FlaskConical,
} from 'lucide-react';
import { WaterLogItem } from '../../types';

export const ScienceTab: React.FC = () => {
  const { hydration, addWater, todayTotalPurineMg } = useApp();
  const [selectedCid, setSelectedCid] = useState<number>(1175); // default Uric Acid

  const activeCompound =
    METABOLIC_COMPOUNDS.find((c) => c.cid === selectedCid) || METABOLIC_COMPOUNDS[4];

  const waterPercent = Math.min(
    100,
    Math.round((hydration.consumedMl / hydration.targetMl) * 100)
  );

  const waterTypes: { type: WaterLogItem['type']; label: string; amount: number; hint: string }[] = [
    { type: 'warm_water', label: '温白开水', amount: 250, hint: '基础稀释' },
    { type: 'lemon_water', label: '淡柠檬水', amount: 300, hint: '维C与弱碱代谢' },
    { type: 'soda_water', label: '无糖苏打水', amount: 350, hint: '含碳酸氢钠碱化' },
    { type: 'light_tea', label: '淡绿茶水', amount: 200, hint: '富含茶多酚' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 bg-slate-50/70 space-y-4">
      {/* Module 1: Personalized Hydration & Renal Clearance Engine */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <h2 className="text-xs font-bold text-slate-800">
              智能排酸补水跟踪（尿酸稀释动力学）
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            今日需排水量: {hydration.targetMl} mL
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-cyan-700 tabular-nums">
                {hydration.consumedMl}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {hydration.targetMl} mL</span>
            </div>
            <span className="text-xs font-bold font-mono text-cyan-700">{waterPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Purine-to-Water Calculation explanation */}
        <div className="bg-cyan-50/60 rounded-xl p-2.5 border border-cyan-100/70 text-[11px] text-cyan-900 leading-relaxed">
          <span className="font-semibold text-cyan-950">动力学测算：</span>
          依据今日已摄入 <span className="font-mono font-bold">{todayTotalPurineMg}mg</span> 嘌呤，系统已自动追加水分配额。维持尿量 &gt; 2000mL/日 可显著防止微晶核形成并保护肾小球滤过率。
        </div>

        {/* Quick Add Water Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {waterTypes.map((item) => (
            <button
              key={item.label}
              onClick={() => addWater(item.amount, item.type)}
              className="bg-slate-50 hover:bg-cyan-50/50 p-2.5 rounded-xl border border-slate-200/80 hover:border-cyan-200 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-semibold text-slate-800 block group-hover:text-cyan-800">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 block">{item.hint}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-700 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-2xs">
                <Plus className="w-3 h-3 text-cyan-600" />
                {item.amount}ml
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Module 2: PubChem Biochemical Compounds Visualizer */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800">PubChem 生化分子与代谢物</h2>
          </div>
          <span className="text-[10px] text-slate-400">权威化学数据库</span>
        </div>

        {/* Compound Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {METABOLIC_COMPOUNDS.map((c) => (
            <button
              key={c.cid}
              onClick={() => setSelectedCid(c.cid)}
              className={`text-xs px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-colors font-medium border ${
                selectedCid === c.cid
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Active Compound Detail Card */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{activeCompound.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  CID: {activeCompound.cid}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                {activeCompound.enName}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-medium inline-block mt-1">
                {activeCompound.metabolismStep}
              </span>
            </div>

            {/* Official 2D Structure PNG from PubChem */}
            <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
              <img
                src={activeCompound.pngUrl}
                alt={activeCompound.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Molecular Formula & SMILES */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 block">分子式</span>
              <span className="font-mono font-semibold text-slate-800">
                {activeCompound.formula}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">分子量</span>
              <span className="font-mono font-semibold text-slate-800">
                {activeCompound.molecularWeight}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">SMILES 拓扑</span>
              <span className="font-mono text-[9px] text-slate-600 break-all">
                {activeCompound.canonicalSmiles}
              </span>
            </div>
          </div>

          {/* Biochemical Role & Solubility Notes */}
          <div className="text-[11px] space-y-1 pt-1 text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-800">体内作用机制：</strong>
              {activeCompound.role}
            </p>
            <p>
              <strong className="text-slate-800">理化代谢特性：</strong>
              {activeCompound.solubilityNote}
            </p>
          </div>

          <a
            href={`https://pubchem.ncbi.nlm.nih.gov/compound/${activeCompound.cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 pt-1"
          >
            在 PubChem 官方数据库中查看完整分子理化图谱
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Module 3: Metabolic Pathway Flowchart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800">嘌呤到尿酸的级联代谢通路</h2>
        </div>

        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {METABOLIC_PATHWAY_STEPS.map((step) => (
            <div key={step.step} className="relative pl-7 space-y-1">
              {/* Step indicator dot */}
              <div className="absolute left-1.5 top-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white">
                {step.step}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{step.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  阶段 {step.step} / 4
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-400">底物:</span>
                  <span className="font-semibold text-slate-700">{step.substrate}</span>
                  <span className="text-slate-300">➔</span>
                  <span className="text-slate-400">产物:</span>
                  <span className="font-semibold text-emerald-700">{step.product}</span>
                </div>
                <p className="text-slate-500 text-[10px] leading-relaxed">{step.description}</p>
                <p className="text-emerald-800 font-medium text-[10px] pt-1 border-t border-slate-200/60">
                  临床指引: {step.clinicalSignificance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module 4: Dietary Synergy Rules */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5">
          <Atom className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-800">循证营养学排酸增效法则</h2>
        </div>

        <div className="space-y-2">
          {DIETARY_SYNERGY_RULES.map((rule) => (
            <div
              key={rule.title}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{rule.title}</span>
                <span className="text-[10px] font-mono text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  {rule.formula}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-0.5">
                {rule.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
