'use client';

import React, { useState, useEffect } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { 
  Zap, 
  Droplet, 
  Activity, 
  Thermometer, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Sun,
  BatteryCharging,
  Cpu,
  Radio,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SensorsAndTools } from './SensorsAndTools';

// Small inline sparkline SVG chart
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 18;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - 1 - ((val - min) / range) * (height - 2);
    return `${x},${y}`;
  }).join(' ');

  const gradId = `grad-${color.replace('#', '')}`;

  return (
    <svg className="w-full h-4 mt-1.5 opacity-90" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d={`M 0,${height} L ${points} L ${width},${height} Z`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const Dashboard = () => {
  const { 
    metrics, 
    mode, 
    demoRunning, 
    landingVisited, 
    sidebarTab, 
    setSidebarTab,
    dualVerificationMode,
    recirculationTriggered,
    hydroGeneratorMode,
  } = useSystemState();
  const [collapsed, setCollapsed] = React.useState(false);

  // Live sliding window telemetry history
  const [history, setHistory] = useState<{ tds: number[]; ph: number[]; turbidity: number[]; flowRate: number[] }>({
    tds: Array(12).fill(129),
    ph: Array(12).fill(7.4),
    turbidity: Array(12).fill(0.2),
    flowRate: Array(12).fill(4.8),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setHistory(prev => ({
        tds: [...prev.tds.slice(1), metrics.tds],
        ph: [...prev.ph.slice(1), metrics.ph],
        turbidity: [...prev.turbidity.slice(1), metrics.turbidity],
        flowRate: [...prev.flowRate.slice(1), metrics.flowRate],
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [metrics]);

  if (!landingVisited || demoRunning) return null; // Hide dashboard during landing or guided tour

  // Helper to format values
  const getQualityColor = () => {
    switch (metrics.waterQuality) {
      case 'EXCELLENT': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'GOOD': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      case 'POOR': return 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse';
      case 'CRITICAL': return 'text-rose-400 border-rose-500/25 bg-rose-500/5 animate-pulse';
      default: return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    }
  };

  const battColor = metrics.batteryPercent < 20 ? 'text-rose-400' : metrics.batteryPercent < 50 ? 'text-amber-400' : 'text-emerald-400';
  const battBarColor = metrics.batteryPercent < 20 ? 'bg-rose-500' : metrics.batteryPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="fixed right-6 top-20 z-30 pointer-events-none select-none">
      <div className="relative flex items-start justify-end">
        
        {/* Floating Glass Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-11 top-2 w-9 h-9 rounded-xl glass-panel pointer-events-auto flex items-center justify-center cursor-pointer border border-white/10 bg-zinc-950/80 text-zinc-400 hover:text-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          title={collapsed ? "Expand Diagnostics" : "Collapse Diagnostics"}
        >
          {collapsed ? (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[6px] text-cyan-400 font-mono tracking-tighter">DIAG</span>
            </div>
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          )}
        </button>

        {/* Sidebar Diagnostics Content */}
        <motion.div
          animate={{ 
            x: collapsed ? 410 : 0, 
            opacity: collapsed ? 0 : 1 
          }}
          transition={{ type: 'spring', damping: 24, stiffness: 150 }}
          className="w-[370px] max-h-[82vh] overflow-y-auto pointer-events-auto shadow-[0_24px_48px_rgba(0,0,0,0.5)] rounded-2xl"
        >
          <div className="glass-panel rounded-2xl p-4 border border-white/10 relative overflow-hidden flex flex-col gap-3.5 bg-zinc-950/85 backdrop-blur-md">
            
            {/* Header: Title + Tab Switcher */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] font-mono uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> SYSTEM TWIN TELEMETRY
                  </span>
                  <h1 className="text-xs font-semibold text-white tracking-wide mt-0.5">
                    {sidebarTab === 'TELEMETRY' ? 'BlueGround Leviathan v2.0' : 'Sensors & Tools Catalog'}
                  </h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" /> ESP32-S3
                  </span>
                  <span className="text-[10px] font-bold font-mono text-emerald-400">
                    SYNCED ({metrics.wifiSignal} dBm)
                  </span>
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/90 border border-white/10">
                <button
                  onClick={() => setSidebarTab('TELEMETRY')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    sidebarTab === 'TELEMETRY'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Telemetry</span>
                </button>
                <button
                  onClick={() => setSidebarTab('TOOLS')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    sidebarTab === 'TOOLS'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Sensors & Tools</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">S</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: SENSORS & TOOLS VS TELEMETRY */}
            {sidebarTab === 'TOOLS' ? (
              <SensorsAndTools />
            ) : (
              <>

            {/* ======================================================== */}
            {/* A. POWER GRID METRICS */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> POWER GRID & DC-DC RAILS</span>
                <span className={`text-[8px] font-bold font-mono ${battColor}`}>
                  {metrics.batteryPercent < 20 ? 'CRITICAL' : metrics.batteryPercent < 50 ? 'LOW' : 'HEALTHY'}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-2 bg-white/2 p-2.5 rounded-xl border border-white/5">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-zinc-500">1S5P BATTERY BANK</span>
                    <span className={`font-semibold ${battColor}`}>
                      {Math.round(metrics.batteryPercent)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${battBarColor}`}
                      style={{ width: `${metrics.batteryPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/5 text-center font-mono">
                  <div>
                    <span className="text-[8px] text-zinc-500 block">SOLAR INPUT</span>
                    <span className="text-xs font-bold text-amber-300">{(metrics.solarWatts || 56.8).toFixed(1)}W</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 block">DISCHARGE</span>
                    <span className="text-xs font-bold text-zinc-300">{(metrics.dischargeWatts || 15.0).toFixed(1)}W</span>
                  </div>
                  <div className="bg-cyan-950/30 rounded p-0.5 border border-cyan-500/20">
                    <span className="text-[8px] text-cyan-400 block">PUMP RAIL</span>
                    <span className="text-xs font-bold text-cyan-300">{(metrics.pumpRailVoltage || 24.0).toFixed(1)}V</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center font-mono text-[9px] text-zinc-400 pt-1 border-t border-white/5">
                  <div>LOGIC RAIL: <strong className="text-emerald-400 font-bold">{(metrics.logicRailVoltage || 5.0).toFixed(1)}V</strong></div>
                  <div>MCU RAIL: <strong className="text-emerald-400 font-bold">{(metrics.mcuRailVoltage || 3.3).toFixed(1)}V</strong></div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* B. STAGE 1 CHAMBER SENSORS (CHEMICAL & PHYSICAL) */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> STAGE 1 CHAMBER SENSORS
                </h2>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">RAW INTAKE</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">TDS PURITY (PPM)</span>
                  <span className="text-xs font-bold font-mono text-sky-400">{metrics.tds} ppm</span>
                  <Sparkline data={history.tds} color="#38bdf8" />
                </div>
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">ACIDITY INDEX PH</span>
                  <span className="text-xs font-bold font-mono text-pink-400">{metrics.ph.toFixed(2)} pH</span>
                  <Sparkline data={history.ph} color="#f472b6" />
                </div>
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">CLARITY NTU</span>
                  <span className={`text-xs font-bold font-mono ${metrics.turbidity > 5.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {metrics.turbidity.toFixed(1)} NTU
                  </span>
                  <Sparkline data={history.turbidity} color="#34d399" />
                </div>
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">THERMAL DATA °C</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">{metrics.temperature.toFixed(1)} °C</span>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-500" style={{ width: `${(metrics.temperature / 50) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* C. HYDRAULICS LOOP & VALVE ROUTING */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-blue-400" /> HYDRAULICS LOOP</span>
                <span className="text-[8px] font-mono text-cyan-300">YF-S401 ACTIVE</span>
              </h2>
              <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2 text-center items-center">
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">INLINE FLOW</span>
                    <span className="text-xs font-bold font-mono text-cyan-300">{metrics.flowRate.toFixed(2)} L/m</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">PUMP SPEED</span>
                    <span className="text-xs font-bold font-mono text-zinc-300">{metrics.pumpRpm} RPM</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">VALVE STATE</span>
                    <span className="text-[10px] font-bold font-mono text-emerald-300">Clean Outlet</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* D. 4-STAGE FILTER CARTRIDGE HEALTH BARS */}
            {/* ======================================================== */}
            {/* ======================================================== */}
            {/* D. FOUR-STAGE SMART FILTRATION TRAIN HEALTH */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  4-STAGE SMART FILTRATION TRAIN
                </span>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  DEFENSE ACTIVE
                </span>
              </h2>

              <div className="grid grid-cols-2 gap-2 bg-white/2 p-2.5 rounded-xl border border-white/5 text-[9px] font-mono">
                {/* Stage 1: SediShield */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      {/* Dust Cloud Icon */}
                      <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                        <path d="M8 19h1" />
                        <path d="M12 19h2" />
                      </svg>
                      SediShield
                    </span>
                    <strong className="text-amber-400">{metrics.stage1Health || 92}%</strong>
                  </div>
                  <div className="text-[7.5px] text-zinc-400 font-sans leading-tight">
                    Blocks dirt, silt and rust
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-amber-400" style={{ width: `${metrics.stage1Health || 92}%` }} />
                  </div>
                </div>

                {/* Stage 2: ChemoBlock */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-emerald-300">
                      {/* Chemical / Drop Icon */}
                      <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 2v7.31M14 2v7.31" />
                        <path d="M8.5 2h7" />
                        <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
                        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                      </svg>
                      ChemoBlock
                    </span>
                    <strong className="text-emerald-400">{metrics.stage2Health || 85}%</strong>
                  </div>
                  <div className="text-[7.5px] text-zinc-400 font-sans leading-tight">
                    Cuts chlorine, odour & chemicals
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-emerald-400" style={{ width: `${metrics.stage2Health || 85}%` }} />
                  </div>
                </div>

                {/* Stage 3: RO Maxx */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-cyan-300">
                      {/* Crystal Drop + TDS Icon */}
                      <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                      RO Maxx
                    </span>
                    <strong className="text-cyan-400">{metrics.stage3Health || 88}%</strong>
                  </div>
                  <div className="text-[7.5px] text-cyan-300 font-sans leading-tight flex items-center justify-between">
                    <span>Drops TDS & metals</span>
                    <span className="font-mono font-bold text-[7px] text-cyan-400 bg-cyan-950 px-1 py-0.2 rounded border border-cyan-800/40">-96%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-cyan-400" style={{ width: `${metrics.stage3Health || 88}%` }} />
                  </div>
                </div>

                {/* Stage 4: Active Copper Filter */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      {/* Active Copper Cu2+ Molecule Icon */}
                      <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                      </svg>
                      Active Copper
                    </span>
                    <strong className="text-amber-400">{metrics.stage4Health || 95}%</strong>
                  </div>
                  <div className="text-[7.5px] text-zinc-400 font-sans leading-tight">
                    Infuses copper ions & antimicrobial polish
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-amber-400" style={{ width: `${metrics.stage4Health || 95}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* E. UV STERILIZATION & QUALITY INDEX */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2 text-[10px] font-mono pt-0.5">
              {/* UV Sterilization Badge */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-950/30 border border-violet-500/30">
                <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-violet-400" /> UV STERILIZATION
                </span>
                <span className={`font-bold tracking-wider ${metrics.uvStatus === 'ON' ? 'text-violet-300 animate-pulse' : 'text-zinc-500'}`}>
                  {metrics.uvStatus === 'ON' ? 'UV: Active (Blue Light)' : 'UV: Inactive'}
                </span>
              </div>

              {/* Overall Quality Index Badge */}
              <div className={`flex items-center justify-between border p-2.5 rounded-xl ${getQualityColor()}`}>
                <span className="text-zinc-300 text-[9px] uppercase tracking-wider font-semibold">QUALITY INDEX:</span>
                <span className="font-bold tracking-widest">{metrics.waterQuality} (POTABLE)</span>
              </div>
            </div>
            </>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
