'use client';

import React from 'react';
import { useSystemState, SystemMode } from '@/hooks/useSystemState';
import { 
  Wrench, 
  Eye, 
  EyeOff, 
  Settings, 
  Sparkles, 
  Play, 
  Compass, 
  Database, 
  Cpu, 
  Layers, 
  Droplets,
  Repeat,
  Zap,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemControls = () => {
  const { 
    mode, 
    setMode, 
    exploded, 
    setExploded, 
    cutaway, 
    setCutaway, 
    transparent, 
    setTransparent, 
    metrics,
    setMetrics,
    demoRunning, 
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
    recirculationTriggered,
    setRecirculationTriggered,
    setTank2Tds,
    setCameraPreset,
    hydroGeneratorMode,
    setHydroGeneratorMode,
    antigravityMode,
    setAntigravityMode,
    filterView,
    setFilterView,
  } = useSystemState();

  if (!landingVisited || demoRunning) return null; // Hide controls during landing or guided tour

  // Preset trigger handlers to simulate scenarios dynamically
  const triggerSensorFault = () => {
    setMetrics(prev => ({
      ...prev,
      tds: 999,
      turbidity: 88.5,
      ph: 12.8,
      waterQuality: 'CRITICAL',
      cloudSync: 'ERROR',
    }));
  };

  const triggerNormal = () => {
    setMode('NORMAL');
    setMetrics(prev => ({
      ...prev,
      batteryPercent: 88,
      solarWatts: 48.5,
      currentDraw: 12.0,
      waterLevel: 65,
      flowRate: 4.8,
      ph: 7.20,
      tds: 145,
      turbidity: 1.2,
      temperature: 24.5,
      pumpRpm: 1800,
      filterHealth: 98,
      uvStatus: 'ON',
      esp32Online: true,
      waterQuality: 'EXCELLENT'
    }));
  };

  const triggerTurbidity = () => {
    setMode('TURBIDITY');
    setMetrics(prev => ({
      ...prev,
      batteryPercent: 86,
      solarWatts: 45.0,
      currentDraw: 12.4,
      waterLevel: 62,
      flowRate: 4.2,
      ph: 7.65,
      tds: 260,
      turbidity: 14.8, // high turbidity
      temperature: 24.8,
      pumpRpm: 1950,
      filterHealth: 95,
      uvStatus: 'ON',
      esp32Online: true,
      waterQuality: 'POOR'
    }));
  };

  const triggerPumpFailure = () => {
    setMode('PUMP_FAILURE');
    setMetrics(prev => ({
      ...prev,
      batteryPercent: 82,
      solarWatts: 40.0,
      currentDraw: 1.2, // low draw (pump stopped)
      flowRate: 0.0,
      pumpRpm: 0,
      ph: 7.20,
      tds: 145,
      turbidity: 1.2,
      uvStatus: 'OFF',
      waterQuality: 'GOOD'
    }));
  };

  const triggerCleaning = () => {
    setMode('CLEANING');
    setMetrics(prev => ({
      ...prev,
      batteryPercent: 78,
      solarWatts: 42.0,
      currentDraw: 18.0, // solenoid active
      waterLevel: 22, // draining
      flowRate: 0.0,
      pumpRpm: 0,
      uvStatus: 'OFF',
      waterQuality: 'GOOD'
    }));
  };

  const triggerLowBattery = () => {
    setMode('LOW_BATTERY');
    setMetrics(prev => ({
      ...prev,
      batteryPercent: 8.5, // low
      solarWatts: 2.0, // overcast
      currentDraw: 3.5, // power-save mode
      flowRate: 1.2,
      pumpRpm: 800, // running slow
      uvStatus: 'OFF',
      waterQuality: 'GOOD'
    }));
  };

  // ─── WATER CLEANLINESS SIMULATIONS ───
  // Simulation 1: Standard Borewell Inflow -> Treated via 4-Stage Filter & Verified Pure -> Primary Reservoir
  const triggerSimulation1 = () => {
    setDualVerificationMode(true);
    setRecirculationTriggered(false);
    setMode('NORMAL');
    setCameraPreset('OVERVIEW');
    setTank2Tds(28);
    setMetrics(prev => ({
      ...prev,
      turbidity: 2.8,
      tds: 190,
      tds2: 28,
      turbidity2: 0.2,
      ph: 7.35,
      temperature: 24.0,
      waterQuality: 'EXCELLENT',
      flowRate: 4.8,
      pumpRpm: 1800,
      uvStatus: 'ON',
      recirculationActive: false,
    }));
  };

  // Simulation 2: Bad Mining Slurry Water -> 4-Stage Filter -> Verification Fails -> Recirculates to Stage 1 SediShield
  const triggerSimulation2 = () => {
    setDualVerificationMode(true);
    setRecirculationTriggered(true);
    setMode('TURBIDITY');
    setCameraPreset('TANK2_VERIFICATION');
    setTank2Tds(185);
    setMetrics(prev => ({
      ...prev,
      turbidity: 44.0,
      tds: 680,
      tds2: 185, // Sub-standard permeate in Verification Tank
      turbidity2: 4.5,
      ph: 6.25,
      temperature: 25.4,
      waterQuality: 'POOR',
      flowRate: 3.8,
      pumpRpm: 2200,
      uvStatus: 'ON',
      recirculationActive: true,
    }));
  };

  return (
    <div className="fixed left-6 bottom-6 z-30 pointer-events-none select-none w-full max-w-[280px]">
      <div className="glass-panel rounded-2xl p-4 border border-white/10 relative overflow-hidden pointer-events-auto flex flex-col gap-4 bg-zinc-950/75 backdrop-blur-md shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
        
        {/* Title */}
        <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-white tracking-[0.2em] font-mono uppercase">LEVIATHAN ENGINE</span>
        </div>

        {/* 1. Holographic CAD toggles */}
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Eye className="w-3 h-3 text-zinc-500" /> CAD Layer Views
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Antigravity Floating Mode Toggle */}
            <button
              onClick={() => setAntigravityMode(!antigravityMode)}
              className={`col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                antigravityMode
                  ? 'bg-gradient-to-r from-cyan-500/30 to-violet-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)] animate-pulse'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${antigravityMode ? 'text-cyan-300 animate-spin-slow' : 'text-zinc-400'}`} />
              <span>{antigravityMode ? 'Antigravity View: FLOATING (A)' : 'Toggle Antigravity View (A)'}</span>
            </button>

            {/* Exploded View Toggle */}
            <button
              onClick={() => setExploded(!exploded)}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                exploded 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Wrench className="w-3 h-3" />
              Exploded
            </button>

            {/* X-Ray / Transparency View Toggle */}
            <button
              onClick={() => {
                setTransparent(!transparent);
                setCutaway(!transparent);
              }}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                transparent 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              X-Ray Mode
            </button>

            {/* Verification Gate Architecture: Pure vs Impure Recirculation */}
            <div className="col-span-2 flex flex-col gap-1.5 p-2 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <div className="flex items-center justify-between text-[8px] font-mono text-purple-300 font-bold">
                <span className="flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-purple-400" />
                  VERIFICATION GATE (TANK 2)
                </span>
                <span className="text-[7px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40">HOTKEY: V</span>
              </div>
              <div className="text-[7.5px] font-mono text-zinc-400">
                4-Stage Discharge ➔ Verification Gate
              </div>
              <div className="grid grid-cols-2 gap-1 font-mono text-[8px]">
                <button
                  onClick={() => {
                    setDualVerificationMode(true);
                    setTank2Tds(28);
                    setRecirculationTriggered(false);
                    setMetrics(prev => ({ ...prev, tds2: 28, recirculationActive: false }));
                  }}
                  className={`py-1 px-1.5 rounded-md border text-center transition-all cursor-pointer ${
                    metrics.tds2 <= 100
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-black/40 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                  title="Verified Pure: Pass directly to Clean 250L Potable Reservoir"
                >
                  ✓ Pure (28 ppm)
                </button>
                <button
                  onClick={() => {
                    setDualVerificationMode(true);
                    setTank2Tds(185);
                    setRecirculationTriggered(true);
                    setMetrics(prev => ({ ...prev, tds2: 185, recirculationActive: true }));
                  }}
                  className={`py-1 px-1.5 rounded-md border text-center transition-all cursor-pointer ${
                    metrics.tds2 > 100
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 font-bold animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-black/40 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                  title="Impure Detected: Divert via Solenoid back into Stage 1 SediShield"
                >
                  ↻ Impure (185 ppm)
                </button>
              </div>
            </div>

            {/* Hydro-Power Motor Energy Harvesting Toggle */}
            <div className="col-span-2 flex flex-col gap-1 p-2 rounded-xl bg-blue-950/20 border border-blue-500/30">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="font-bold text-blue-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> Hydro Turbine Gen:
                </span>
                <span className={`px-1.5 py-0.2 rounded font-bold text-[8px] ${
                  hydroGeneratorMode ? 'bg-blue-950 text-cyan-300 border border-cyan-500/40 animate-pulse' : 'text-zinc-500'
                }`}>
                  {hydroGeneratorMode ? `+${(metrics.hydroWatts || 28.5).toFixed(1)}W ACTIVE` : 'OFF'}
                </span>
              </div>
              <button
                onClick={() => setHydroGeneratorMode(!hydroGeneratorMode)}
                className={`w-full py-1 rounded-md border text-center font-mono text-[9px] font-bold transition-all cursor-pointer ${
                  hydroGeneratorMode
                    ? 'bg-blue-500/30 border-blue-400 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {hydroGeneratorMode ? '⚡ Hydro Generator: ON (G)' : 'Enable Hydro Turbine Power (G)'}
              </button>
            </div>

            {/* Hotspot Dots / Clean Showroom View Toggle */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                !showHotspots
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
              }`}
            >
              {showHotspots ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-amber-400" />}
              {showHotspots ? 'Hotspot Details: VISIBLE' : 'Clean Showroom View (No Dots)'}
            </button>

            {/* Tanks Only & Vessel Boundary Margins Mode */}
            <button
              onClick={() => setTanksOnly(!tanksOnly)}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                tanksOnly
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(168,85,129,0.25)]'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className={`w-3 h-3 ${tanksOnly ? 'text-emerald-400' : 'text-zinc-400'}`} />
              {tanksOnly ? 'Tanks Margins: ISOLATED (T)' : 'Show Tanks Only (T)'}
            </button>

            {/* Sensors & Tools Inventory View Toggle */}
            <button
              onClick={() => setSidebarTab(sidebarTab === 'TOOLS' ? 'TELEMETRY' : 'TOOLS')}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                sidebarTab === 'TOOLS'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Wrench className={`w-3 h-3 ${sidebarTab === 'TOOLS' ? 'text-amber-400' : 'text-zinc-400'}`} />
              {sidebarTab === 'TOOLS' ? 'Sensors & Tools: OPEN (S)' : 'Sensors & Tools List (S)'}
            </button>

            {/* Water Flow Journey Focus Mode */}
            <button
              onClick={() => setWaterTrackMode(!waterTrackMode)}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                waterTrackMode
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Droplets className={`w-3 h-3 ${waterTrackMode ? 'text-cyan-400 animate-bounce-subtle' : 'text-zinc-400'}`} />
              {waterTrackMode ? 'Water Flow Tour: ACTIVE (W)' : 'Water Flow Journey (W)'}
            </button>

            {/* 4-Stage Filter Rack Focus Mode */}
            <button
              onClick={() => setFilterView(!filterView)}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                filterView
                  ? 'bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Filter className={`w-3 h-3 ${filterView ? 'text-cyan-400 animate-pulse' : 'text-zinc-400'}`} />
              {filterView ? '4-Stage Filter View: ACTIVE (F)' : '4-Stage Filter View (F)'}
            </button>
          </div>
        </div>

        {/* 2. Simulation preset scenarios */}
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Settings className="w-3 h-3 text-zinc-500" /> Preset Scenarios
          </span>
          <div className="flex flex-col gap-1.5 font-mono text-[9px]">
            {/* Simulation 1: Clean Borewell -> Verified Pure */}
            <button
              onClick={triggerSimulation1}
              className={`w-full text-left p-2 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                metrics.tds2 <= 100 && metrics.turbidity < 5
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[9px]">
                <span>🌟 Sim 1: Standard Borewell</span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">VERIFIED PURE</span>
              </div>
              <span className="text-[8px] text-zinc-400">4-Stage Filter ➔ Verification Chamber ➔ Clean Storage</span>
            </button>

            {/* Simulation 2: Mining Slurry Runoff -> Stage 1 Re-Filter Loop */}
            <button
              onClick={triggerSimulation2}
              className={`w-full text-left p-2 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                metrics.tds2 > 100 && metrics.turbidity > 20
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[9px]">
                <span>⚡ Sim 2: Mining Slurry Runoff</span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">STAGE 1 RE-FILTER</span>
              </div>
              <span className="text-[8px] text-zinc-400">Turbid Inflow ➔ Verification Fails ➔ Closed-Loop to Stage 1</span>
            </button>

            {/* Other System Presets */}
            <button
              onClick={triggerNormal}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                mode === 'NORMAL' && !dualVerificationMode && metrics.turbidity >= 5
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟢 Normal Operations</span>
              <span>NOMINAL</span>
            </button>

            <button
              onClick={triggerTurbidity}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                mode === 'TURBIDITY' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟡 High Turbidity</span>
              <span>POOR INFLOW</span>
            </button>

            <button
              onClick={triggerPumpFailure}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                mode === 'PUMP_FAILURE' 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold animate-pulse' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🔴 Pump Failure</span>
              <span>ERROR</span>
            </button>

            <button
              onClick={triggerCleaning}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                mode === 'CLEANING' 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟣 Self Cleaning</span>
              <span>FLUSHING</span>
            </button>

            <button
              onClick={triggerLowBattery}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                mode === 'LOW_BATTERY' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold' 
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟤 Low Battery</span>
              <span>LOW POWER</span>
            </button>

            <button
              onClick={triggerSensorFault}
              className="w-full text-left px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/2 text-zinc-400 hover:bg-white/5 hover:text-amber-400 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>⚠️ Sensor Fault</span>
              <span>CALIBRATE</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
