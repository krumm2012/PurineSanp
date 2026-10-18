import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Upload,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Droplets,
  RotateCcw,
  X,
  HelpCircle,
  SwitchCamera,
  StopCircle,
  Flashlight,
} from 'lucide-react';
import { IngredientItem, MealType, PurineTrafficLevel } from '../../types';

interface ScanTabProps {
  initialPreset?: string | null;
  onFinished?: () => void;
}

const SAMPLE_PRESETS = [
  {
    name: '潮汕牛肉火锅',
    tag: '中嘌呤',
    desc: '精瘦牛肉、时蔬、清汤底',
  },
  {
    name: '香煎三文鱼粗粮饭',
    tag: '适量推荐',
    desc: '三文鱼柳、西兰花、黑米饭',
  },
  {
    name: '清炒豆腐杂粮便当',
    tag: '低嘌呤绿灯',
    desc: '北豆腐、青菜、黑木耳、紫米饭',
  },
  {
    name: '蒜蓉生蚝配海鲜虾',
    tag: '高嘌呤红灯',
    desc: '生蚝肉、白对虾、蒜蓉粉丝',
  },
];

export const ScanTab: React.FC<ScanTabProps> = ({ initialPreset, onFinished }) => {
  const { addMeal, setMiniActiveTab } = useApp();

  // Hidden native file input (fallback / album picker)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Stream references
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Flow State: 'idle' | 'live_camera' | 'analyzing' | 'adjusting' | 'saved'
  const [stage, setStage] = useState<'idle' | 'live_camera' | 'analyzing' | 'adjusting' | 'saved'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [dishHint, setDishHint] = useState<string>('');

  // Editable Meal Form
  const [dishName, setDishName] = useState<string>('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [recommendedWaterMl, setRecommendedWaterMl] = useState<number>(500);
  const [healthAdvice, setHealthAdvice] = useState<{
    riskLevel: string;
    biochemicalInsight: string;
    synergyTips: string;
    waterSchedule: string;
  }>({
    riskLevel: '正常适量',
    biochemicalInsight: '',
    synergyTips: '',
    waterSchedule: '',
  });

  // Adding single new ingredient manual drawer
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngGrams, setNewIngGrams] = useState(100);
  const [newIngPurinePer100g, setNewIngPurinePer100g] = useState(50);

  // Stop camera stream when component unmounts or leaves live camera stage
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // If initial preset is passed from home
  useEffect(() => {
    if (initialPreset) {
      startAnalysisWithDishHint(initialPreset);
    }
  }, [initialPreset]);

  // Start live HTML5 camera
  const startLiveCamera = async (overrideFacing?: 'environment' | 'user') => {
    stopCameraStream();
    setCameraError(null);
    const targetFacing = overrideFacing || facingMode;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('当前浏览器环境不支持直接调取摄像头，请使用相册或系统相机。');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setStage('live_camera');

      // Bind to video tag once rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play warning:', e));
        }
      }, 100);
    } catch (err: any) {
      console.warn('Failed to start live camera:', err);
      setCameraError(err.message || '无法访问摄像头，建议使用系统相机或上传照片');
      // If live camera fails, fallback to native mobile file input
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      }
    }
  };

  // Switch between front & rear camera
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Capture frame from live video
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 JPEG
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    stopCameraStream();
    setSelectedImageBase64(base64);

    // Send to Gemini API
    runServerAnalysis(base64, '餐盘实拍食物');
  };

  // Handle Photo File selection (from album or native capture)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCameraStream();
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImageBase64(result);
      runServerAnalysis(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysisWithDishHint = (hint: string) => {
    stopCameraStream();
    setDishHint(hint);
    setSelectedImageBase64(null);
    runServerAnalysis(null, hint);
  };

  // Run Server Analysis via /api/analyze-meal (Gemini 3.8 Flash)
  const runServerAnalysis = async (imageBase64: string | null, hint: string) => {
    setStage('analyzing');
    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || undefined,
          dishNameHint: hint || dishHint || '美味餐盘',
          mealType,
        }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const d = resJson.data;
        setDishName(d.dishName || hint || '餐盘美食');
        setRecommendedWaterMl(d.recommendedWaterMl || 500);
        if (d.healthAdvice) {
          setHealthAdvice(d.healthAdvice);
        }

        // Map ingredients with unique ids
        const mappedIngs: IngredientItem[] = (d.ingredients || []).map((ing: any, idx: number) => ({
          id: `ing-${Date.now()}-${idx}`,
          name: ing.name,
          weightGrams: Number(ing.weightGrams) || 100,
          purinePer100g: Number(ing.purinePer100g) || 50,
          totalPurineMg:
            ing.totalPurineMg !== undefined
              ? Number(ing.totalPurineMg)
              : Math.round(((Number(ing.weightGrams) || 100) * (Number(ing.purinePer100g) || 50)) / 10) / 10,
          category: (ing.category as PurineTrafficLevel) || 'yellow',
          notes: ing.notes || '',
        }));

        setIngredients(mappedIngs);
        setStage('adjusting');
      } else {
        throw new Error(resJson.error || '解析失败');
      }
    } catch (err) {
      console.error('Analysis failed, using client fallback', err);
      // Fallback
      setDishName(hint || '营养均衡便当');
      setIngredients([
        { id: 'f1', name: '优质蛋白配料', weightGrams: 100, purinePer100g: 90, totalPurineMg: 90, category: 'yellow' },
        { id: 'f2', name: '新鲜蔬菜', weightGrams: 150, purinePer100g: 20, totalPurineMg: 30, category: 'green' },
        { id: 'f3', name: '粗粮主食', weightGrams: 120, purinePer100g: 25, totalPurineMg: 30, category: 'green' },
      ]);
      setRecommendedWaterMl(500);
      setHealthAdvice({
        riskLevel: '适量安全',
        biochemicalInsight: '食物经水解后释放次黄嘌呤与黄嘌呤，多食含钾与维C蔬菜有助排酸。',
        synergyTips: '餐中避免饮酒或高果糖饮料。',
        waterSchedule: '餐后1小时补充 300mL 温水。',
      });
      setStage('adjusting');
    }
  };

  // Sliders: dynamically update grams and total purine for specific ingredient
  const handleWeightChange = (id: string, newGrams: number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        const total = Math.round(((newGrams * ing.purinePer100g) / 100) * 10) / 10;
        return {
          ...ing,
          weightGrams: newGrams,
          totalPurineMg: total,
        };
      })
    );
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddNewIngredient = () => {
    if (!newIngName.trim()) return;
    const category: PurineTrafficLevel =
      newIngPurinePer100g < 50 ? 'green' : newIngPurinePer100g <= 150 ? 'yellow' : 'red';
    const total = Math.round(((newIngGrams * newIngPurinePer100g) / 100) * 10) / 10;

    const newItem: IngredientItem = {
      id: `ing-manual-${Date.now()}`,
      name: newIngName.trim(),
      weightGrams: newIngGrams,
      purinePer100g: newIngPurinePer100g,
      totalPurineMg: total,
      category,
    };
    setIngredients((prev) => [...prev, newItem]);
    setNewIngName('');
    setIsAddingIngredient(false);
  };

  // Recalculate total purines across all ingredients
  const totalPurineMg = Math.round(
    ingredients.reduce((acc, i) => acc + i.totalPurineMg, 0) * 10
  ) / 10;

  const overallTraffic: PurineTrafficLevel =
    totalPurineMg < 150 ? 'green' : totalPurineMg <= 250 ? 'yellow' : 'red';

  // Save to AppContext
  const handleConfirmSave = () => {
    addMeal({
      dishName: dishName || '餐盘美食',
      mealType,
      photoUrl: selectedImageBase64 || undefined,
      ingredients,
      totalPurineMg,
      overallTraffic,
      recommendedWaterMl,
      healthAdvice,
    });

    setStage('saved');
    setTimeout(() => {
      if (onFinished) {
        onFinished();
      } else {
        setMiniActiveTab('home');
      }
    }, 900);
  };

  const resetAll = () => {
    stopCameraStream();
    setStage('idle');
    setSelectedImageBase64(null);
    setDishHint('');
    setIngredients([]);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 bg-slate-50/70">
      {/* Hidden File Inputs: 1 for Native Camera, 1 for Album Upload */}
      <input
        type="file"
        ref={nativeCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Stage 1: IDLE - Camera Choice & Preset Selection */}
      {stage === 'idle' && (
        <div className="space-y-4">
          {/* Simulated Camera Viewfinder Card */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden relative aspect-4/3 flex flex-col items-center justify-center p-6 text-white border border-slate-800 shadow-md">
            {/* Viewfinder corner guides */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-sm pointer-events-none" />

            {/* Central icon & instructions */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold tracking-tight">智能相机测算嘌呤</p>
            <p className="text-[11px] text-slate-400 mt-1 text-center max-w-[260px] leading-relaxed">
              支持实时相机取景或相册上传，Gemini 3.8 Flash 将深度拆解食材并估算嘌呤
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 z-10">
              <button
                onClick={() => startLiveCamera()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <Camera className="w-3.5 h-3.5" />
                开启相机取景
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-transform"
              >
                <Upload className="w-3.5 h-3.5" />
                相册选择
              </button>
            </div>

            {cameraError && (
              <p className="text-[10px] text-rose-400 mt-2 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800">
                {cameraError}
              </p>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                免拍照快捷测试样（一键体验）
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              如果当前无餐盘或处于电脑端测试，可直接点击下列代表性菜品进行智能成分拆解与分量微调：
            </p>

            <div className="space-y-2">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => startAnalysisWithDishHint(p.name)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 text-left transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700">
                        {p.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                          p.tag.includes('低')
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.tag.includes('高')
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.tag}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{p.desc}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium group-hover:translate-x-0.5 transition-transform">
                    分析 ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage 1.5: LIVE CAMERA VIEW - Real MediaStream Video Viewfinder */}
      {stage === 'live_camera' && (
        <div className="space-y-3">
          <div className="bg-black rounded-3xl overflow-hidden relative aspect-3/4 flex flex-col justify-between p-4 shadow-xl border border-slate-800">
            {/* Top camera controls */}
            <div className="flex items-center justify-between z-20 text-white">
              <span className="text-[11px] font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                对准餐盘食物
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCameraFacing}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-transform"
                  title="翻转镜头"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
                <button
                  onClick={resetAll}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-transform"
                  title="关闭相机"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scan grid watermark */}
              <div className="absolute inset-8 border border-white/30 rounded-2xl pointer-events-none" />
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400/40 pointer-events-none" />
            </div>

            {/* Bottom Shutter Action Bar */}
            <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white text-[11px] font-medium bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 hover:bg-black/60"
              >
                从相册选
              </button>

              {/* Big Shutter Button */}
              <button
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full bg-white/20 p-1 flex items-center justify-center border-2 border-white active:scale-90 transition-transform shadow-lg group"
                title="拍照拆解"
              >
                <div className="w-13 h-13 rounded-full bg-white group-hover:bg-emerald-50 transition-colors shadow-inner flex items-center justify-center">
                  <Camera className="w-6 h-6 text-emerald-700" />
                </div>
              </button>

              <button
                onClick={resetAll}
                className="text-white/80 hover:text-white text-[11px] font-medium bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: ANALYZING - Multimodal Vision Skeleton & Laser Animation */}
      {stage === 'analyzing' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-4 shadow-xs">
          <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-md">
            {selectedImageBase64 ? (
              <img
                src={selectedImageBase64}
                alt="Uploaded meal"
                className="w-full h-full object-cover opacity-85"
              />
            ) : (
              <Camera className="w-8 h-8 text-emerald-400" />
            )}
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#34d399] animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Gemini 3.8 Flash 多模态视觉拆解中...</h3>
            <p className="text-[11px] text-slate-400">
              正在精准识别食材组成、估算重量克数并匹配权威生化嘌呤数据
            </p>
          </div>

          <div className="space-y-2 max-w-[280px] mx-auto text-left pt-2">
            <div className="h-2 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2 bg-slate-100 rounded-full animate-pulse w-3/4" />
            <div className="h-2 bg-slate-100 rounded-full animate-pulse w-1/2" />
          </div>
        </div>
      )}

      {/* Stage 3: ADJUSTING - Interactive Ingredient Weight Slider Drawer */}
      {stage === 'adjusting' && (
        <div className="space-y-3.5">
          {/* Header & Dish Title input */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                识别结果与分量微调
              </span>
              <button
                onClick={resetAll}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                重新拍摄
              </button>
            </div>

            {/* Dish name and Meal Type */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">菜品名称</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">餐别时段</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="dinner">晚餐</option>
                  <option value="snack">加餐</option>
                </select>
              </div>
            </div>

            {/* Total Purine Counter Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-3.5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">本餐总嘌呤预估</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                    {totalPurineMg}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">mg</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                    overallTraffic === 'green'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : overallTraffic === 'yellow'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {overallTraffic === 'green'
                    ? '● 绿灯安全'
                    : overallTraffic === 'yellow'
                    ? '▲ 黄灯适量'
                    : '✖ 红灯高危'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  需补水约 {recommendedWaterMl} mL
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Ingredients List with Weight Sliders */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                拆解食材与克数调整 ({ingredients.length} 种)
              </span>
              <button
                onClick={() => setIsAddingIngredient(!isAddingIngredient)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                新增配料
              </button>
            </div>

            {/* Quick Add Ingredient Input */}
            {isAddingIngredient && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="食材名称 (如：基围虾)"
                    value={newIngName}
                    onChange={(e) => setNewIngName(e.target.value)}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="克数 (g)"
                    value={newIngGrams}
                    onChange={(e) => setNewIngGrams(Number(e.target.value))}
                    className="w-20 text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">每100g嘌呤:</span>
                    <input
                      type="number"
                      value={newIngPurinePer100g}
                      onChange={(e) => setNewIngPurinePer100g(Number(e.target.value))}
                      className="w-16 text-xs bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">mg</span>
                  </div>
                  <button
                    onClick={handleAddNewIngredient}
                    className="bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1 rounded-lg"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}

            {/* Sliders for each ingredient */}
            <div className="space-y-3 divide-y divide-slate-100">
              {ingredients.map((ing) => (
                <div key={ing.id} className="pt-2.5 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{ing.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-sm font-medium ${
                          ing.category === 'green'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ing.category === 'yellow'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {ing.purinePer100g} mg/100g
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 tabular-nums">
                          {Math.round(ing.totalPurineMg * 10) / 10}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ml-0.5">mg</span>
                      </div>
                      <button
                        onClick={() => handleDeleteIngredient(ing.id)}
                        className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                        title="移除食材"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weight Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={400}
                      step={10}
                      value={ing.weightGrams}
                      onChange={(e) => handleWeightChange(ing.id, Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-[11px] font-mono font-semibold text-slate-600 w-12 text-right tabular-nums">
                      {ing.weightGrams} g
                    </span>
                  </div>

                  {ing.notes && (
                    <p className="text-[10px] text-slate-400 leading-tight">{ing.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Biochemical Guidance & Hydration Callout */}
          {healthAdvice?.biochemicalInsight && (
            <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-100 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                <span>生化代谢与排酸调理指引</span>
              </div>
              <p className="text-emerald-900/80 leading-relaxed">
                {healthAdvice.biochemicalInsight}
              </p>
              {healthAdvice.synergyTips && (
                <p className="text-emerald-800 font-medium pt-1 border-t border-emerald-200/60">
                  搭配建议: {healthAdvice.synergyTips}
                </p>
              )}
            </div>
          )}

          {/* Confirm & Save Button */}
          <button
            onClick={handleConfirmSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-sm font-semibold text-xs active:scale-[0.99] transition-transform"
          >
            <CheckCircle2 className="w-4 h-4" />
            确认记录到今日饮食
          </button>
        </div>
      )}

      {/* Stage 4: SAVED CELEBRATION */}
      {stage === 'saved' && (
        <div className="bg-white rounded-3xl p-10 border border-emerald-100 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">饮食记录已保存</h3>
          <p className="text-xs text-slate-500">
            总嘌呤 <span className="font-mono font-bold text-slate-800">{totalPurineMg}mg</span> 已归档至今日健康日历
          </p>
        </div>
      )}
    </div>
  );
};
