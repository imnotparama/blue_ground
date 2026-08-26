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
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  } = useSystemState();
  const [collapsed, setCollapsed] = React.useState(false);

  // Live sliding window telemetry history
  const [history, setHistory] = useState<{ tds: number[]; ph: number[]; turbidity: number[]; flowRate: number[] }>({
    tds: Array(12).fill(145),
    ph: Array(12).fill(7.2),
    turbidity: Array(12).fill(1.2),
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
    }
  };

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
          className="w-[360px] max-h-[82vh] overflow-y-auto pointer-events-auto shadow-[0_24px_48px_rgba(0,0,0,0.5)] rounded-2xl"
        >
          <div className="glass-panel rounded-2xl p-4 border border-white/10 relative overflow-hidden flex flex-col gap-4 bg-zinc-950/85 backdrop-blur-md">
            
            {/* Header: Title + Tab Switcher */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] font-mono uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Leviathan IoT Core
                  </span>
                  <h1 className="text-sm font-semibold text-white tracking-wide mt-0.5">
                    {sidebarTab === 'TELEMETRY' ? 'System Twin Telemetry' : 'Sensors & Tools Catalog'}
                  </h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase">SYS HEALTH</span>
                  <span className={`text-xs font-bold font-mono ${metrics.batteryPercent > 10 && mode !== 'PUMP_FAILURE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {metrics.batteryPercent < 10 || mode === 'PUMP_FAILURE' ? '68%' : '98%'}
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
            {/* A. POWER SYSTEM MATRIX */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Power Grid
              </h2>
              <div className="grid grid-cols-1 gap-2 bg-white/2 p-3 rounded-xl border border-white/5">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-zinc-500">BATTERY CAP</span>
                    <span className={`font-semibold ${metrics.batteryPercent < 15 ? 'text-rose-400 animate-pulse' : 'text-zinc-300'}`}>
                      {Math.round(metrics.batteryPercent)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        metrics.batteryPercent < 15 
                          ? 'bg-red-500 animate-pulse' 
                          : metrics.batteryPercent < 35 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${metrics.batteryPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-white/5 text-center">
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">SOLAR INPUT</span>
                    <span className="text-xs font-bold font-mono text-amber-300">{metrics.solarWatts.toFixed(1)}W</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">DISCHARGE LOAD</span>
                    <span className="text-xs font-bold font-mono text-zinc-300">{metrics.currentDraw.toFixed(1)}W</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* B. CHEMICAL ANALYSIS LOOP (Stage 1 Intake Chamber) */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Stage 1 Chamber Sensors
                </h2>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">PRE-RO</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">TDS PURITY</span>
                  <span className="text-xs font-bold font-mono text-sky-400">{metrics.tds} ppm</span>
                  <Sparkline data={history.tds} color="#38bdf8" />
                </div>
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">ACIDITY INDEX</span>
                  <span className="text-xs font-bold font-mono text-pink-400">{metrics.ph.toFixed(2)} pH</span>
                  <Sparkline data={history.ph} color="#f472b6" />
                </div>
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">CLARITY (TURB)</span>
                  <span className={`text-xs font-bold font-mono ${metrics.turbidity > 5.0 ? 'text-amber-400' : 'text-yellow-400'}`}>
                    {metrics.turbidity.toFixed(1)} NTU
                  </span>
                  <Sparkline data={history.turbidity} color="#fbbf24" />
                </div>
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">THERMAL DATA</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">{metrics.temperature.toFixed(1)} °C</span>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-500" style={{ width: `${(metrics.temperature / 50) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* B2. STAGE 2 VERIFICATION ARRAY (Tank 2 Post-RO Chamber) */}
            {/* ======================================================== */}
            {dualVerificationMode && (
              <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-1">
                  <h2 className="text-[9px] font-bold text-purple-300 tracking-wider uppercase font-mono flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" /> Tank 2 Verification Array
                  </h2>
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    (metrics.recirculationActive || recirculationTriggered || (metrics.turbidity2 || 0) > 1.0)
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {(metrics.recirculationActive || recirculationTriggered || (metrics.turbidity2 || 0) > 1.0) ? 'RECIRCULATING' : 'POTABLE PASS'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <span className="text-[8px] text-zinc-500 block">POST-RO TDS</span>
                    <span className="text-xs font-bold text-cyan-300">{metrics.tds2 || 28} ppm</span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <span className="text-[8px] text-zinc-500 block">POST-RO pH</span>
                    <span className="text-xs font-bold text-pink-300">{(metrics.ph2 || 7.35).toFixed(2)}</span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <span className="text-[8px] text-zinc-500 block">POST-RO TURB</span>
                    <span className={`text-xs font-bold ${((metrics.turbidity2 || 0) > 1.0) ? 'text-amber-400' : 'text-emerald-300'}`}>
                      {(metrics.turbidity2 || 0.15).toFixed(2)} NTU
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* C. HYDRAULICS LOOP */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Droplet className="w-3.5 h-3.5 text-blue-400" /> Hydraulics Loop
              </h2>
              <div className="bg-white/2 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4 text-center items-center">
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">INLINE FLOW</span>
                    <span className="text-xs font-bold font-mono text-cyan-300">{metrics.flowRate.toFixed(2)} L/min</span>
                    <Sparkline data={history.flowRate} color="#06b6d4" />
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">PUMP SPEED</span>
                    <span className="text-xs font-bold font-mono text-zinc-300">{metrics.pumpRpm} RPM</span>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-cyan-500" style={{ width: `${(metrics.pumpRpm / 2400) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono">
                  <span className="text-zinc-500">FILTER CARTRIDGE</span>
                  <span className="text-zinc-300 font-semibold">{metrics.filterHealth}% HEALTH</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-zinc-500">UV STERILIZATION</span>
                  <span className={`font-semibold ${metrics.uvStatus === 'ON' ? 'text-violet-400 animate-pulse' : 'text-zinc-500'}`}>
                    {metrics.uvStatus === 'ON' ? 'ACTIVE (UV-C)' : 'SHUT DOWN'}
                  </span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* D. SYSTEM CAPACITY & EST QUALITY */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2 text-[10px] font-mono pt-1">
              <div className={`flex items-center justify-between border p-2.5 rounded-xl ${getQualityColor()}`}>
                <span className="text-zinc-400 text-[8px] uppercase tracking-wider font-semibold">Quality Index:</span>
                <span className="font-bold tracking-widest">{metrics.waterQuality}</span>
              </div>

              <div className="flex justify-between text-zinc-500 px-1 pt-1 text-[9px]">
                <span>TANK CAPACITY</span>
                <span>{Math.round((metrics.waterLevel / 100) * metrics.tankCapacity)}L / {metrics.tankCapacity}L</span>
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
