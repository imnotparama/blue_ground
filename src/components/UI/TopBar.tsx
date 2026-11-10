'use client';

import React from 'react';
import { useSystemState, EnvironmentalMode } from '@/hooks/useSystemState';
import { 
  Wifi, 
  RefreshCw, 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Moon, 
  Play, 
  Pause, 
  Compass, 
  Eye, 
  EyeOff,
  Layers,
  Wrench,
  Droplets,
  Repeat,
  FlaskConical,
  Sparkles,
  Zap,
  Filter,
  Activity,
  Box,
} from 'lucide-react';

export const TopBar = () => {
  const { 
    metrics, 
    setMetrics,
    envMode, 
    setEnvMode, 
    demoRunning, 
    startDemo, 
    stopDemo,
    mode,
    setMode,
    landingVisited,
    showHotspots,
    setShowHotspots,
    tanksOnly,
    setTanksOnly,
    sidebarTab,
    setSidebarTab,
    waterTrackMode,
    setWaterTrackMode,
    dualVerificationMode,
    setDualVerificationMode,
    setRecirculationTriggered,
    setCameraPreset,
    hydroGeneratorMode,
    setHydroGeneratorMode,
    exploded,
    setExploded,
    filterView,
    setFilterView,
    simulationRunning,
    startSimulation,
    pauseSimulation,
    setScenario,
    simulationViewOpen,
    setSimulationViewOpen,
    cadModelMode,
    setCadModelMode,
  } = useSystemState();

  const runSim1 = () => {
    setDualVerificationMode(false);
    setRecirculationTriggered(false);
    setCameraPreset('OVERVIEW');
    setScenario('NORMAL');
    startSimulation();
  };

  const runSim2 = () => {
    setDualVerificationMode(true);
    setRecirculationTriggered(true);
    setCameraPreset('TANK2_VERIFICATION');
    setScenario('HIGH_TURBIDITY');
    startSimulation();
  };

  const envs: { mode: EnvironmentalMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'SUNNY', icon: <Sun className="w-4 h-4" />, label: 'Sunny' },
    { mode: 'MORNING', icon: <CloudSun className="w-4 h-4" />, label: 'Golden Hour' },
    { mode: 'CLOUDY', icon: <Cloud className="w-4 h-4" />, label: 'Overcast' },
    { mode: 'RAIN', icon: <CloudRain className="w-4 h-4" />, label: 'Rainy' },
    { mode: 'NIGHT', icon: <Moon className="w-4 h-4" />, label: 'Night' },
  ];

  if (!landingVisited) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex items-center justify-between pointer-events-none select-none">
      {/* Brand logo (interactive, pointers enabled) */}
      <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-full pointer-events-auto">
        <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" style={{ animationDuration: '20s' }} />
        <span className="font-bold tracking-[0.25em] text-white text-sm">blue<span className="text-cyan-400">ground</span></span>
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[9px] tracking-wider text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30">v2.0</span>
          <span className="text-[9px] tracking-widest text-zinc-400 font-mono uppercase font-bold">Leviathan</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 border-l border-white/10 pl-3">
          <span className="text-[9px] font-mono text-zinc-400">DEV: <strong className="text-cyan-300 font-semibold">Parameshwaran S</strong></span>
        </div>
      </div>

      {/* Center Action Controls: Essential CAD & Simulation Navigation */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Master Engineering Simulation Start / Pause Button */}
        <button
          onClick={() => (simulationRunning ? pauseSimulation() : startSimulation())}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer shadow-md ${
            simulationRunning
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50'
              : 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50 hover:bg-emerald-500/35'
          }`}
          title={simulationRunning ? 'Pause Real-Time Simulation Engine' : 'Start Real-Time Engineering Simulation Loop'}
        >
          {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span className="font-bold">{simulationRunning ? 'Sim: RUNNING' : 'Start Simulation'}</span>
        </button>

        {/* CAD Exploded View Button */}
        <button
          onClick={() => setExploded(!exploded)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            exploded
              ? 'bg-gradient-to-r from-amber-500/30 to-purple-500/30 border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.45)] ring-1 ring-amber-400/60'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-amber-500/40'
          }`}
          title="Toggle Full CAD Exploded View (Hotkey: E)"
        >
          <Layers className={`w-3.5 h-3.5 ${exploded ? 'text-amber-300 animate-pulse' : 'text-zinc-400'}`} />
          <span className="hidden md:inline font-semibold">{exploded ? 'Exploded: ON' : 'Exploded View'}</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${exploded ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>E</span>
        </button>

        {/* 4-Stage Filter Rack Focus */}
        <button
          onClick={() => setFilterView(!filterView)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            filterView
              ? 'bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-cyan-500/40'
          }`}
          title="Toggle 4-Stage Smart Filtration Rack View (Hotkey: F)"
        >
          <Filter className={`w-3.5 h-3.5 ${filterView ? 'text-cyan-400 animate-pulse' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline font-semibold">{filterView ? 'Filter Rack: ON' : 'Filter Rack'}</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${filterView ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>F</span>
        </button>

        {/* Complete Simulation Workbench Modal Toggle */}
        <button
          onClick={() => setSimulationViewOpen(!simulationViewOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer shadow-md ${
            simulationViewOpen
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400'
              : 'bg-zinc-900/90 border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-950/60 hover:border-cyan-400'
          }`}
          title="Open Full Real-Time Water Simulation Workbench & Sensor Matrix (Shift + S)"
        >
          <Activity className={`w-3.5 h-3.5 ${simulationViewOpen ? 'text-cyan-300 animate-spin-slow' : 'text-cyan-400 animate-pulse'}`} />
          <span className="font-bold hidden md:inline">DATA MATRIX</span>
          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            P&ID
          </span>
        </button>

        {/* Guided Presentation Tour Button */}
        {!demoRunning ? (
          <button
            onClick={startDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/20 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-105 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Guided Tour</span>
          </button>
        ) : (
          <button
            onClick={stopDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-950/75 border border-red-500/30 hover:bg-red-900/80 text-red-200 font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 fill-red-200" />
            <span>Exit Tour</span>
          </button>
        )}
      </div>

      {/* Right side diagnostics status & environment switcher (pointers enabled) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Environmental Controller */}
        <div className="flex items-center glass-panel p-1 rounded-full">
          {envs.map((env) => {
            const isActive = envMode === env.mode;
            return (
              <button
                key={env.mode}
                onClick={() => setEnvMode(env.mode)}
                disabled={demoRunning}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-cyan-400/10' 
                    : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-30'
                }`}
                title={env.label}
              >
                {env.icon}
              </button>
            );
          })}
        </div>

        {/* System Diagnostics status panel */}
        <div className="flex items-center gap-4 glass-panel px-4 py-2.5 rounded-full text-xs font-mono text-zinc-300">
          {/* IoT Status */}
          <div className="flex items-center gap-1.5" title="ESP32 IoT Controller Status">
            <span className={`w-1.5 h-1.5 rounded-full ${metrics.esp32Online ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-[10px] text-zinc-400">ESP32</span>
          </div>

          {/* Wi-Fi RSSI */}
          <div className="flex items-center gap-1.5" title="Wi-Fi Signal strength">
            <Wifi className={`w-3.5 h-3.5 ${metrics.wifiSignal > -60 ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[10px] text-zinc-400">{metrics.wifiSignal} dBm</span>
          </div>

          {/* Cloud Sync */}
          <div className="flex items-center gap-1.5" title="Cloud Database Sync Status">
            <RefreshCw className={`w-3 h-3 ${metrics.cloudSync === 'SYNCING' ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span className="text-[10px] text-zinc-400">SYNCED</span>
          </div>
        </div>
      </div>
    </header>
  );
};
