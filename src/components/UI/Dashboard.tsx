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
  Play,
  Pause,
  RotateCcw,
  Gauge,
  AlertTriangle,
  Info,
  CheckCircle,
  FlaskConical,
  Repeat,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SensorsAndTools } from './SensorsAndTools';
import { SCENARIO_DEFINITIONS, SimulationScenarioId } from '@/simulation';

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
    demoRunning, 
    landingVisited, 
    sidebarTab, 
    setSidebarTab,
    simState,
    simulationRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    activeScenario,
    setScenario,
    speedMultiplier,
    setSpeedMultiplier,
    simulationViewOpen,
    setSimulationViewOpen,
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
        tds: [...prev.tds.slice(1), simState ? simState.outputTds : metrics.tds2],
        ph: [...prev.ph.slice(1), simState ? simState.outputPh : metrics.ph2],
        turbidity: [...prev.turbidity.slice(1), simState ? simState.outputTurbidity : metrics.turbidity2],
        flowRate: [...prev.flowRate.slice(1), simState ? simState.inputFlowRate : metrics.flowRate],
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [simState, metrics]);

  if (!landingVisited || demoRunning) return null; // Hide dashboard during landing or guided tour

  // Helper to format water quality
  const quality = simState ? simState.waterQuality : metrics.waterQuality;
  const getQualityColor = () => {
    switch (quality) {
      case 'EXCELLENT': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'GOOD': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      case 'POOR': return 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse';
      case 'CRITICAL': return 'text-rose-400 border-rose-500/25 bg-rose-500/5 animate-pulse';
      default: return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    }
  };

  const battColor = metrics.batteryPercent < 20 ? 'text-rose-400' : metrics.batteryPercent < 50 ? 'text-amber-400' : 'text-emerald-400';
  const battBarColor = metrics.batteryPercent < 20 ? 'bg-rose-500' : metrics.batteryPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500';

  const aiScore = simState ? simState.aiHealthScore : 94;
  const aiScoreColor = aiScore > 85 ? 'text-emerald-400' : aiScore > 60 ? 'text-amber-400' : 'text-rose-400';
  const aiScoreBadge = aiScore > 85 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : aiScore > 60 ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' : 'bg-rose-950/60 text-rose-300 border-rose-500/40';

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
            x: collapsed ? 430 : 0, 
            opacity: collapsed ? 0 : 1 
          }}
          transition={{ type: 'spring', damping: 24, stiffness: 150 }}
          className="w-[390px] max-h-[84vh] overflow-y-auto pointer-events-auto shadow-[0_24px_48px_rgba(0,0,0,0.5)] rounded-2xl"
        >
          <div className="glass-panel rounded-2xl p-4 border border-white/10 relative overflow-hidden flex flex-col gap-3.5 bg-zinc-950/90 backdrop-blur-md">
            
            {/* Header: Title + Tab Switcher */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] font-mono uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> ENGINEERING SIMULATION TWIN
                  </span>
                  <h1 className="text-xs font-semibold text-white tracking-wide mt-0.5">
                    {sidebarTab === 'TELEMETRY' ? 'Deterministic Physical Twin' : 'Sensors & Tools Catalog'}
                  </h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" /> ESP32 ADAPTER
                  </span>
                  <span className="text-[10px] font-bold font-mono text-emerald-400">
                    REAL-TIME SYNC
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
            {/* 1. SIMULATION ENGINE CONTROL & SCENARIOS */}
            {/* ======================================================== */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/70 to-emerald-950/30 border border-cyan-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="font-bold text-white flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  ENGINE STATUS:
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[8px] border ${
                  simulationRunning 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 animate-pulse' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                }`}>
                  {simulationRunning ? '● RUNNING' : '○ STANDBY'}
                </span>
              </div>

              {/* Action Buttons: Start/Pause, Reset, Speed Multipliers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => simulationRunning ? pauseSimulation() : startSimulation()}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-md ${
                    simulationRunning
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400 hover:bg-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400 hover:bg-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{simulationRunning ? 'Pause Sim' : 'Start Simulation'}</span>
                </button>

                <button
                  onClick={resetSimulation}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 hover:text-white transition-all cursor-pointer"
                  title="Reset simulation parameters to scenario defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Speed Multipliers */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/40 border border-white/10">
                  {[1, 2, 5, 10].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold transition-all cursor-pointer ${
                        speedMultiplier === spd
                          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Selector Dropdown */}
              <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
                <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Operational / Failure Scenario:</span>
                  <span className="text-cyan-400 font-bold">{SCENARIO_DEFINITIONS[activeScenario]?.badge || 'NORMAL'}</span>
                </span>
                <select
                  value={activeScenario}
                  onChange={(e) => setScenario(e.target.value as SimulationScenarioId)}
                  className="w-full bg-zinc-900 border border-white/15 rounded-lg px-2 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {Object.values(SCENARIO_DEFINITIONS).map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
                <p className="text-[8px] text-zinc-400 font-sans leading-tight">
                  {SCENARIO_DEFINITIONS[activeScenario]?.description}
                </p>
              </div>

              {/* Complete Simulation Workbench Launcher Button */}
              <button
                onClick={() => setSimulationViewOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-200 text-[10px] font-mono font-bold tracking-wider hover:bg-cyan-900/80 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>EXPAND COMPLETE SIMULATION VIEW</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* 2. DYNAMIC AI HEALTH SCORE & RECOMMENDATIONS */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <h2 className="text-[9px] font-bold text-zinc-300 tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI PREDICTIVE INTELLIGENCE
                </h2>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded border font-bold ${aiScoreBadge}`}>
                  HEALTH SCORE: {aiScore}/100
                </span>
              </div>

              {/* Dynamic Recommendations List */}
              <div className="flex flex-col gap-1.5">
                {(simState?.aiRecommendations || []).slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-2 rounded-xl border flex flex-col gap-0.5 font-mono text-[8.5px] ${
                      rec.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : rec.severity === 'WARNING'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : rec.severity === 'SUCCESS'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-zinc-900/60 border-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        {rec.severity === 'CRITICAL' ? <AlertTriangle className="w-3 h-3 text-rose-400" /> :
                         rec.severity === 'WARNING' ? <AlertTriangle className="w-3 h-3 text-amber-400" /> :
                         <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {rec.title}
                      </span>
                      {rec.predictedDaysRemaining !== undefined && (
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                          ~{rec.predictedDaysRemaining}d remaining
                        </span>
                      )}
                    </div>
                    <p className="text-[7.5px] text-zinc-300 font-sans leading-tight">
                      {rec.message}
                    </p>
                    <span className="text-[7px] text-zinc-400 font-mono italic">
                      Action: {rec.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. TANK FLUID LEVELS (RAW, PURIFIED, WASTE) */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-blue-400" /> TANK INVENTORY LEVELS</span>
                <span className="text-[8px] font-mono text-cyan-300">MASS BALANCE ACTIVE</span>
              </h2>
              
              <div className="grid grid-cols-3 gap-2 bg-white/2 p-2.5 rounded-xl border border-white/5 text-[9px] font-mono">
                {/* Raw Feed Tank */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-zinc-500">RAW TANK</span>
                    <strong className="text-zinc-300">{simState ? simState.rawWaterLevel.toFixed(1) : 100}L</strong>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${((simState?.rawWaterLevel ?? 100) / 100) * 100}%` }}
                    />
                  </div>
                  <span className="text-[7px] text-zinc-500 text-center">Cap: 100 L</span>
                </div>

                {/* Purified Product Tank */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-zinc-500">CLEAN TANK</span>
                    <strong className="text-cyan-300">{simState ? simState.purifiedWaterLevel.toFixed(1) : 15}L</strong>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${((simState?.purifiedWaterLevel ?? 15) / 100) * 100}%` }}
                    />
                  </div>
                  <span className="text-[7px] text-cyan-500 text-center">Cap: 100 L</span>
                </div>

                {/* Waste Water Tank */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-zinc-500">WASTE BRINE</span>
                    <strong className="text-amber-400">{simState ? simState.wasteWaterLevel.toFixed(1) : 6}L</strong>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${((simState?.wasteWaterLevel ?? 6) / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-[7px] text-amber-500 text-center">Cap: 50 L</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 4. THREE FLOW STREAMS KINETICS (IN, PERMEATE, REJECT) */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-cyan-400" /> HYDRAULIC FLOW RATES</span>
                <span className="text-[8px] font-mono text-emerald-400">70% RECOVERY SPLIT</span>
              </h2>
              <div className="grid grid-cols-3 gap-2 bg-white/2 p-2.5 rounded-xl border border-white/5 text-center font-mono">
                <div>
                  <span className="text-[8px] text-zinc-500 block">FEED INLET</span>
                  <span className="text-xs font-bold text-cyan-300">{(simState?.inputFlowRate ?? metrics.flowRate).toFixed(2)} L/m</span>
                  <span className="text-[7px] text-zinc-400 block mt-0.5">100% Inflow</span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 block">PURIFIED PERMEATE</span>
                  <span className="text-xs font-bold text-emerald-300">{(simState?.outputFlowRate ?? (metrics.flowRate * 0.7)).toFixed(2)} L/m</span>
                  <span className="text-[7px] text-emerald-400 font-bold block mt-0.5">{simState ? (simState.roRecoveryRate * 100).toFixed(0) : 70}% Recovery</span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 block">REJECT CONCENTRATE</span>
                  <span className="text-xs font-bold text-amber-400">{(simState?.wasteFlowRate ?? (metrics.flowRate * 0.3)).toFixed(2)} L/m</span>
                  <span className="text-[7px] text-amber-500 block mt-0.5">{simState ? (100 - simState.roRecoveryRate * 100).toFixed(0) : 30}% Waste</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 5. WATER CHEMISTRY (RAW vs PURIFIED) */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-pink-400" /> WATER CHEMISTRY PROFILE
                </h2>
                <span className="text-[8px] font-mono text-cyan-300">BEFORE ➔ AFTER</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-mono">
                {/* TDS Comparison */}
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                    <span>TDS MINERAL PURITY</span>
                    <span className="text-emerald-400 font-bold">-{simState ? (simState.roRejectionRate * 100).toFixed(0) : 95}%</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-[10px] text-zinc-400 line-through">{simState?.inputTds ?? 240}</span>
                    <span className="text-sm font-bold text-sky-400">{simState?.outputTds ?? 24} ppm</span>
                  </div>
                  <Sparkline data={history.tds} color="#38bdf8" />
                </div>

                {/* Turbidity Comparison */}
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                    <span>TURBIDITY CLARITY</span>
                    <span className="text-emerald-400 font-bold">CLEAR</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-[10px] text-zinc-400 line-through">{(simState?.inputTurbidity ?? 2.2).toFixed(1)}</span>
                    <span className={`text-sm font-bold ${(simState?.outputTurbidity ?? 0.1) > 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(simState?.outputTurbidity ?? 0.12).toFixed(2)} NTU
                    </span>
                  </div>
                  <Sparkline data={history.turbidity} color="#34d399" />
                </div>

                {/* pH Stabilization */}
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                    <span>pH ACIDITY INDEX</span>
                    <span className="text-pink-400 font-bold">STABILIZED</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-[10px] text-zinc-400">{simState?.inputPh.toFixed(2) ?? 7.25}</span>
                    <span className="text-xs font-bold text-pink-400">➔ {simState?.outputPh.toFixed(2) ?? 7.36} pH</span>
                  </div>
                  <Sparkline data={history.ph} color="#f472b6" />
                </div>

                {/* Reject Brine Concentration */}
                <div className="bg-white/2 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                    <span>REJECT BRINE TDS</span>
                    <span className="text-amber-400 font-bold">CONCENTRATED</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-[10px] text-zinc-500">BRINE</span>
                    <span className="text-xs font-bold text-amber-400">{simState?.stageProfiles.tds.roReject ?? 420} ppm</span>
                  </div>
                  <span className="text-[7.5px] text-zinc-500 font-mono">Mineral salts flushed to waste</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 6. ACTUATORS & HARDWARE STATES */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-amber-400" /> ACTUATORS & INTERLOCKS</span>
                <span className="text-[8px] font-mono text-zinc-400">24V / 12V BUS</span>
              </h2>
              <div className="grid grid-cols-3 gap-2 bg-white/2 p-2 rounded-xl border border-white/5 text-center font-mono text-[9px]">
                <div className="p-1 rounded bg-black/40 border border-white/5">
                  <span className="text-[7.5px] text-zinc-500 block">PUMP STATUS</span>
                  <span className={`font-bold ${
                    simState?.pumpStatus === 'RUNNING' ? 'text-emerald-400' :
                    simState?.pumpStatus === 'FAULT' ? 'text-rose-400 animate-pulse' : 'text-zinc-400'
                  }`}>
                    {simState?.pumpStatus ?? 'IDLE'}
                  </span>
                  <span className="text-[7px] text-zinc-400 block">{simState?.pumpRpm ?? 0} RPM</span>
                </div>

                <div className="p-1 rounded bg-black/40 border border-white/5">
                  <span className="text-[7.5px] text-zinc-500 block">SOLENOID VALVE</span>
                  <span className={`font-bold ${
                    simState?.solenoidValveStatus === 'OPEN' ? 'text-emerald-400' : 'text-zinc-400'
                  }`}>
                    {simState?.solenoidValveStatus ?? 'CLOSED'}
                  </span>
                  <span className="text-[7px] text-zinc-400 block">{simState?.valveAngleDeg ?? 0}° ANGLE</span>
                </div>

                <div className="p-1 rounded bg-black/40 border border-white/5">
                  <span className="text-[7.5px] text-zinc-500 block">UV STERILIZER</span>
                  <span className={`font-bold ${
                    simState?.uvStatus === 'ON' ? 'text-violet-300 animate-pulse' :
                    simState?.uvStatus === 'FAULT' ? 'text-rose-400' : 'text-zinc-500'
                  }`}>
                    {simState?.uvStatus ?? 'OFF'}
                  </span>
                  <span className="text-[7px] text-zinc-400 block">{simState?.uvIntensity ?? 16.5} mW/cm²</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 7. FOUR-STAGE FILTER CARTRIDGE HEALTH */}
            {/* ======================================================== */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono flex items-center justify-between border-b border-white/5 pb-1">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  4-STAGE FILTER TRAIN HEALTH
                </span>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  OVERALL: {simState ? simState.filterHealth.overall : 94}%
                </span>
              </h2>

              <div className="grid grid-cols-2 gap-2 bg-white/2 p-2.5 rounded-xl border border-white/5 text-[9px] font-mono">
                {/* Stage 1: SediShield */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">SediShield</span>
                    <strong className={(simState?.filterHealth.sediment ?? 94) < 30 ? 'text-rose-400' : 'text-amber-400'}>
                      {(simState?.filterHealth.sediment ?? 94).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="text-[7px] text-zinc-400 font-sans leading-tight">5µm PP Silt & Sand</div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-amber-400" style={{ width: `${simState?.filterHealth.sediment ?? 94}%` }} />
                  </div>
                </div>

                {/* Stage 2: ChemoBlock */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">ChemoBlock</span>
                    <strong className="text-emerald-400">{(simState?.filterHealth.carbon ?? 90).toFixed(0)}%</strong>
                  </div>
                  <div className="text-[7px] text-zinc-400 font-sans leading-tight">CTO Carbon Block</div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-emerald-400" style={{ width: `${simState?.filterHealth.carbon ?? 90}%` }} />
                  </div>
                </div>

                {/* Stage 3: RO Maxx */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">RO Maxx</span>
                    <strong className={(simState?.filterHealth.ro ?? 95) < 30 ? 'text-rose-400' : 'text-cyan-400'}>
                      {(simState?.filterHealth.ro ?? 95).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="text-[7px] text-cyan-300 font-sans leading-tight">0.0001µm TFC Membrane</div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-cyan-400" style={{ width: `${simState?.filterHealth.ro ?? 95}%` }} />
                  </div>
                </div>

                {/* Stage 4: Active Copper */}
                <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-black/40 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Active Copper</span>
                    <strong className="text-amber-400">{(simState?.filterHealth.uf ?? 96).toFixed(0)}%</strong>
                  </div>
                  <div className="text-[7px] text-zinc-400 font-sans leading-tight">Cu²⁺ Mineral Polish</div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-amber-400" style={{ width: `${simState?.filterHealth.uf ?? 96}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 8. CUMULATIVE VOLUME & OPERATING HOURS */}
            {/* ======================================================== */}
            <div className="grid grid-cols-3 gap-2 bg-white/2 p-2.5 rounded-xl border border-white/5 text-center font-mono">
              <div>
                <span className="text-[7.5px] text-zinc-500 block">TOTAL PURIFIED</span>
                <span className="text-xs font-bold text-cyan-300">{(simState?.totalWaterPurified ?? 0).toFixed(1)} L</span>
              </div>
              <div>
                <span className="text-[7.5px] text-zinc-500 block">TOTAL WASTE</span>
                <span className="text-xs font-bold text-amber-400">{(simState?.totalWasteWater ?? 0).toFixed(1)} L</span>
              </div>
              <div>
                <span className="text-[7.5px] text-zinc-500 block">OPERATING HRS</span>
                <span className="text-xs font-bold text-zinc-200">{(simState?.operatingHours ?? 14.2).toFixed(1)} h</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 9. OVERALL POTABILITY QUALITY BADGE */}
            {/* ======================================================== */}
            <div className={`flex items-center justify-between border p-2.5 rounded-xl ${getQualityColor()}`}>
              <span className="text-zinc-300 text-[9px] uppercase tracking-wider font-semibold">CERTIFIED QUALITY INDEX:</span>
              <span className="font-bold tracking-widest font-mono">{quality} (POTABLE)</span>
            </div>
            </>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
