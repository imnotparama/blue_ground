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

            {/* TAB CONTENT: SENSORS & TOOLS VS SIMPLIFIED TELEMETRY */}
            {sidebarTab === 'TOOLS' ? (
              <SensorsAndTools />
            ) : (
              <>
                {/* 1. HERO PURITY & POTABILITY STATUS */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-zinc-900/90 to-emerald-950/40 border border-cyan-500/30 flex flex-col gap-2.5 shadow-[0_8px_24px_rgba(6,182,212,0.12)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      POTABILITY INDEX
                    </span>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      WHO CERTIFIED POTABLE
                    </span>
                  </div>

                  {/* 3 Core Water Quality Readouts */}
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                    {/* TDS Mineral Level */}
                    <div className="flex flex-col bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-[7.5px] text-zinc-400 uppercase">TDS MINERALS</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-bold text-cyan-300">
                          {simState?.outputTds ?? 18}
                        </span>
                        <span className="text-[8px] text-zinc-400">ppm</span>
                      </div>
                      <span className="text-[7px] text-emerald-400 font-bold mt-0.5">
                        -{simState ? Math.round(simState.roRejectionRate * 100) : 94}% salts
                      </span>
                    </div>

                    {/* Turbidity Clarity */}
                    <div className="flex flex-col bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-[7.5px] text-zinc-400 uppercase">TURBIDITY</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-bold text-emerald-300">
                          {(simState?.outputTurbidity ?? 0.11).toFixed(2)}
                        </span>
                        <span className="text-[8px] text-zinc-400">NTU</span>
                      </div>
                      <span className="text-[7px] text-zinc-400 mt-0.5">
                        Target &lt;1.0 NTU
                      </span>
                    </div>

                    {/* pH Acidity Balance */}
                    <div className="flex flex-col bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-[7.5px] text-zinc-400 uppercase">pH BALANCE</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-bold text-pink-300">
                          {(simState?.outputPh ?? 7.35).toFixed(2)}
                        </span>
                        <span className="text-[8px] text-zinc-400">pH</span>
                      </div>
                      <span className="text-[7px] text-pink-400 mt-0.5">
                        Neutral Potable
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. WATER FLOW & RESERVOIR CAPACITY */}
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col gap-2.5 font-mono">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <span className="text-[8.5px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplet className="w-3 h-3 text-cyan-400" />
                      FLOW STREAMS & RESERVOIRS
                    </span>
                    <span className="text-[7.5px] text-cyan-300">70% RECOVERY SPLIT</span>
                  </div>

                  {/* Clean Tank & Raw Tank Levels */}
                  <div className="grid grid-cols-2 gap-2 text-[8px]">
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Clean Reservoir</span>
                        <strong className="text-cyan-300 text-[10px]">
                          {Math.round(simState?.purifiedWaterLevel ?? 68)} L
                        </strong>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(8, simState?.purifiedWaterLevel ?? 68))}%` }}
                        />
                      </div>
                      <span className="text-[7px] text-zinc-400 text-right">Cap: 100 L</span>
                    </div>

                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Raw Supply Tank</span>
                        <strong className="text-amber-300 text-[10px]">
                          {Math.round(simState?.rawWaterLevel ?? 82)} L
                        </strong>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(8, simState?.rawWaterLevel ?? 82))}%` }}
                        />
                      </div>
                      <span className="text-[7px] text-zinc-400 text-right">Cap: 100 L</span>
                    </div>
                  </div>

                  {/* Flow Rate Split Bar */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-[8.5px]">
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-[7.5px]">RAW FEED</span>
                      <strong className="text-cyan-300">
                        {(simState?.inputFlowRate ?? 4.8).toFixed(1)} L/m
                      </strong>
                    </div>
                    <span className="text-zinc-500">➔</span>
                    <div className="flex flex-col text-center">
                      <span className="text-emerald-400 text-[7.5px]">POTABLE PERMEATE (70%)</span>
                      <strong className="text-emerald-300">
                        {(simState?.outputFlowRate ?? 3.4).toFixed(1)} L/m
                      </strong>
                    </div>
                    <span className="text-zinc-500">+</span>
                    <div className="flex flex-col text-right">
                      <span className="text-amber-400 text-[7.5px]">FLUSH REJECT (30%)</span>
                      <strong className="text-amber-300">
                        {(simState?.wasteFlowRate ?? 1.4).toFixed(1)} L/m
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. AI PREDICTIVE GUARDIAN */}
                <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col gap-1.5 font-mono">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-1">
                    <span className="text-[8.5px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      AI PREDICTIVE HEALTH
                    </span>
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      SCORE: {simState?.aiHealthScore ?? 94}/100
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[8px] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-200 font-bold">
                      <span className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        {simState?.aiRecommendations?.[0]?.title || 'All 4 Purification Stages Healthy'}
                      </span>
                      <span className="text-[7.5px] text-amber-300 font-normal">
                        ~18d remaining
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-300 font-sans leading-tight">
                      {simState?.aiRecommendations?.[0]?.message || 'Reverse osmosis rejection rate is 95.2%. Operating pressure and flow rates are nominal.'}
                    </p>
                  </div>
                </div>

                {/* 4. MASTER SIMULATION CONTROLS & QUICK SCENARIOS */}
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-cyan-500/30 flex flex-col gap-2.5 font-mono">
                  {/* Master Start / Pause Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (simulationRunning ? pauseSimulation() : startSimulation())}
                      className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                        simulationRunning
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                          : 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {simulationRunning ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>{simulationRunning ? 'PAUSE SIMULATION' : 'START SIMULATION'}</span>
                    </button>

                    <button
                      onClick={resetSimulation}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 hover:text-white transition-all cursor-pointer"
                      title="Reset simulation parameters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Speed Multipliers */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/40 border border-white/10">
                      {[1, 2, 5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setSpeedMultiplier(spd)}
                          className={`px-1.5 py-1 rounded-lg text-[8px] font-bold transition-all cursor-pointer ${
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

                  {/* Quick Scenario Chips */}
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
                    <span className="text-[7.5px] text-zinc-400 uppercase tracking-wider">
                      Quick Failure & Operational Scenarios:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[8px]">
                      <button
                        onClick={() => {
                          setScenario('NORMAL');
                          startSimulation();
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-left transition-all cursor-pointer ${
                          activeScenario === 'NORMAL'
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        🟢 Nominal Flow
                      </button>
                      <button
                        onClick={() => {
                          setScenario('HIGH_TDS');
                          startSimulation();
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-left transition-all cursor-pointer ${
                          activeScenario === 'HIGH_TDS'
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        💧 High TDS (1180)
                      </button>
                      <button
                        onClick={() => {
                          setScenario('HIGH_TURBIDITY');
                          startSimulation();
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-left transition-all cursor-pointer ${
                          activeScenario === 'HIGH_TURBIDITY'
                            ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-bold'
                            : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        🟡 Silt Slurry (52 NTU)
                      </button>
                      <button
                        onClick={() => {
                          setScenario('PUMP_FAILURE');
                          startSimulation();
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-left transition-all cursor-pointer ${
                          activeScenario === 'PUMP_FAILURE'
                            ? 'bg-rose-500/25 border-rose-400 text-rose-300 font-bold'
                            : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        🔴 Pump Fault (0 RPM)
                      </button>
                    </div>

                    {/* Scenario Dropdown for All 9 Modes */}
                    <select
                      value={activeScenario}
                      onChange={(e) => setScenario(e.target.value as SimulationScenarioId)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-[8.5px] font-mono text-zinc-300 focus:outline-none focus:border-cyan-400 cursor-pointer mt-0.5"
                    >
                      {Object.values(SCENARIO_DEFINITIONS).map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Open Complete Simulation Matrix Modal */}
                  <button
                    onClick={() => setSimulationViewOpen(true)}
                    className="w-full py-2 px-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 text-cyan-200 text-[9px] font-bold tracking-wider hover:bg-cyan-900/80 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>VIEW COMPLETE ENGINEERING DATA MATRIX</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
