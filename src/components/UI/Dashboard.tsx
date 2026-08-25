'use client';

import React from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { 
  Zap, 
  Droplet, 
  Activity, 
  Thermometer, 
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { metrics, mode, demoRunning, landingVisited } = useSystemState();
  const [collapsed, setCollapsed] = React.useState(false);

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
              <span className="text-[6px] text-cyan-400 font-mono tracking-tighter">TELE</span>
            </div>
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          )}
        </button>

        {/* Sidebar Diagnostics Content */}
        <motion.div
          animate={{ 
            x: collapsed ? 370 : 0, 
            opacity: collapsed ? 0 : 1 
          }}
          transition={{ type: 'spring', damping: 24, stiffness: 150 }}
          className="w-[340px] max-h-[82vh] overflow-y-auto pointer-events-auto shadow-[0_24px_48px_rgba(0,0,0,0.5)] rounded-2xl"
        >
          <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col gap-5 bg-zinc-950/75 backdrop-blur-md">
            
            {/* Title / Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] font-mono uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Live Diagnostics
                </span>
                <h1 className="text-sm font-semibold text-white tracking-wide mt-0.5">System Twin Telemetry</h1>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-mono text-zinc-500 uppercase">SYS HEALTH</span>
                <span className={`text-xs font-bold font-mono ${metrics.batteryPercent > 10 && mode !== 'PUMP_FAILURE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {metrics.batteryPercent < 10 || mode === 'PUMP_FAILURE' ? '68%' : '98%'}
                </span>
              </div>
            </div>

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
            {/* B. CHEMICAL ANALYSIS LOOP */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Chemical & Clarity
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">TDS PURITY</span>
                  <span className="text-xs font-bold font-mono text-sky-400">{metrics.tds} ppm</span>
                </div>
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">ACIDITY INDEX</span>
                  <span className="text-xs font-bold font-mono text-pink-400">{metrics.ph.toFixed(2)} pH</span>
                </div>
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">CLARITY (TURB)</span>
                  <span className={`text-xs font-bold font-mono ${metrics.turbidity > 5.0 ? 'text-amber-400' : 'text-yellow-400'}`}>
                    {metrics.turbidity.toFixed(1)} NTU
                  </span>
                </div>
                <div className="bg-white/2 p-2.5 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono">THERMAL DATA</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">{metrics.temperature.toFixed(1)} °C</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* C. HYDRAULICS LOOP */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Droplet className="w-3.5 h-3.5 text-blue-400" /> Hydraulics Loop
              </h2>
              <div className="bg-white/2 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">INLINE FLOW</span>
                    <span className="text-xs font-bold font-mono text-cyan-300">{metrics.flowRate.toFixed(2)} L/min</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">PUMP SPEED</span>
                    <span className="text-xs font-bold font-mono text-zinc-300">{metrics.pumpRpm} RPM</span>
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
          </div>
        </motion.div>

      </div>
    </div>
  );
};
