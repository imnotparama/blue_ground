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
  Pause,
  Compass, 
  Database, 
  Cpu, 
  Layers, 
  Droplets,
  Repeat,
  Zap,
  Filter,
  Activity,
  Box,
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
    filterView,
    setFilterView,
    simState,
    simulationRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    activeScenario,
    setScenario,
    simulationViewOpen,
    setSimulationViewOpen,
    cadModelMode,
    setCadModelMode,
  } = useSystemState();

  if (!landingVisited || demoRunning) return null; // Hide controls during landing or guided tour

  // Preset trigger handlers to simulate scenarios dynamically via SimulationEngine
  const triggerNormal = () => {
    setScenario('NORMAL');
    startSimulation();
  };

  const triggerHighTds = () => {
    setScenario('HIGH_TDS');
    startSimulation();
  };

  const triggerTurbidity = () => {
    setScenario('HIGH_TURBIDITY');
    startSimulation();
  };

  const triggerLowWater = () => {
    setScenario('LOW_WATER');
    startSimulation();
  };

  const triggerSedimentClog = () => {
    setScenario('SEDIMENT_CLOGGING');
    startSimulation();
  };

  const triggerRoDegradation = () => {
    setScenario('RO_DEGRADATION');
    startSimulation();
  };

  const triggerPumpFailure = () => {
    setScenario('PUMP_FAILURE');
  };

  const triggerSensorFault = () => {
    setScenario('SENSOR_FAILURE');
  };

  const triggerUvFailure = () => {
    setScenario('UV_FAILURE');
  };

  // Simulation 1: Standard Borewell Inflow -> Treated via 4-Stage Filter & Setup 1 Direct Single-Pass -> Primary Reservoir
  const triggerSimulation1 = () => {
    setDualVerificationMode(false);
    setRecirculationTriggered(false);
    setMode('NORMAL');
    setCameraPreset('SETUP1_DIRECT');
    setMetrics(prev => ({
      ...prev,
      turbidity: 2.8,
      tds: 190,
      ph: 7.22,
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
            {/* CAD Exploded View Disassembly Toggle */}
            <button
              onClick={() => setExploded(!exploded)}
              className={`col-span-2 flex items-center justify-between py-2 px-3 rounded-xl border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                exploded
                  ? 'bg-gradient-to-r from-amber-500/25 to-purple-500/25 text-amber-200 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className={`w-3.5 h-3.5 ${exploded ? 'text-amber-300 animate-spin-slow' : 'text-zinc-400'}`} />
                <span>{exploded ? 'CAD Exploded View: ACTIVE' : 'CAD Exploded View (Disassembly)'}</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${exploded ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>E</span>
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

            {/* Pipeline Architecture Selector: Setup 1 (Direct) vs Setup 2 (Dual-Verification) */}
            <div className="col-span-2 flex flex-col gap-2 p-2.5 rounded-xl bg-gradient-to-b from-purple-950/30 to-zinc-950/40 border border-purple-500/30">
              <div className="flex items-center justify-between text-[8px] font-mono text-purple-300 font-bold">
                <span className="flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-purple-400" />
                  PIPELINE ARCHITECTURE
                </span>
                <span className="text-[7px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40">HOTKEY: V</span>
              </div>

              {/* Toggle Switch between Setup 1 and Setup 2 */}
              <div className="grid grid-cols-2 gap-1 font-mono text-[8px]">
                <button
                  onClick={() => {
                    setDualVerificationMode(false);
                    setRecirculationTriggered(false);
                    setCameraPreset('SETUP1_DIRECT');
                    setMetrics(prev => ({ ...prev, recirculationActive: false }));
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    !dualVerificationMode
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                      : 'bg-black/40 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                  title="Setup 1: Direct single-pass from 4-stage filter outlet directly into 250L Potable Reservoir"
                >
                  <span className="text-[9px]">⚡ Setup 1</span>
                  <span className="text-[7px] opacity-80">Direct Cascade</span>
                </button>

                <button
                  onClick={() => {
                    setDualVerificationMode(true);
                    setCameraPreset('TANK2_VERIFICATION');
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    dualVerificationMode
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200 font-bold shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                      : 'bg-black/40 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                  title="Setup 2: Dual-Verification through Tank 2 sensor suite with automated recirculation"
                >
                  <span className="text-[9px]">🛡️ Setup 2</span>
                  <span className="text-[7px] opacity-80">Tank 2 Verif</span>
                </button>
              </div>

              {/* Sub-status & sub-controls depending on active mode */}
              {!dualVerificationMode ? (
                <div className="p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-1">
                  <div className="text-[7.5px] font-mono text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Setup 1: Direct Single-Pass ACTIVE
                  </div>
                  <div className="text-[7px] font-mono text-zinc-400 leading-tight">
                    Direct drop valve open ➔ 250L clean reservoir. Tank 2 bypassed.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[7px] font-mono text-zinc-400">
                    Tank 2 Quality Gate Thresholds:
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
              )}
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

            {/* Official SolidCraft CAD Model v9 Toggle */}
            <button
              onClick={() => setCadModelMode(!cadModelMode)}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                cadModelMode
                  ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Box className={`w-3 h-3 ${cadModelMode ? 'text-cyan-400 animate-pulse' : 'text-zinc-400'}`} />
              {cadModelMode ? 'SolidCraft v9 CAD Twin: ACTIVE' : 'Procedural Model'}
            </button>
          </div>
        </div>

        {/* 2. Real-Time Engineering Simulation & Scenarios */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-1">
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Settings className="w-3 h-3 text-cyan-400" /> SIMULATION ENGINE
            </span>
            <span className={`text-[7.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
              simulationRunning ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'text-zinc-500'
            }`}>
              {simulationRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>

          {/* Master Start / Pause Simulation Button */}
          <button
            onClick={() => simulationRunning ? pauseSimulation() : startSimulation()}
            className={`w-full py-2 px-3 rounded-xl border text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              simulationRunning
                ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
          >
            {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{simulationRunning ? 'PAUSE SIMULATION' : 'START SIMULATION'}</span>
          </button>

          {/* Complete Simulation Workbench Modal Toggle */}
          <button
            onClick={() => setSimulationViewOpen(true)}
            className="w-full py-2 px-3 rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-200 text-[10px] font-mono font-bold tracking-wider hover:bg-cyan-900/70 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(6,182,212,0.25)]"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>FULL SIMULATION VIEW (DATA)</span>
          </button>

          <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wider">
            9 Failure & Operational Scenarios:
          </span>

          <div className="flex flex-col gap-1 font-mono text-[8.5px]">
            {/* 1. Normal Operation */}
            <button
              onClick={triggerNormal}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'NORMAL'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟢 1. Normal Operation</span>
              <span className="text-[7.5px] opacity-75">NOMINAL</span>
            </button>

            {/* 2. High TDS Borewell Water */}
            <button
              onClick={triggerHighTds}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'HIGH_TDS'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>💧 2. High TDS Borewell</span>
              <span className="text-[7.5px] opacity-75">1180 ppm</span>
            </button>

            {/* 3. High Turbidity Slurry */}
            <button
              onClick={triggerTurbidity}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'HIGH_TURBIDITY'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟡 3. High Turbidity Water</span>
              <span className="text-[7.5px] opacity-75">52 NTU</span>
            </button>

            {/* 4. Low Water Level */}
            <button
              onClick={triggerLowWater}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'LOW_WATER'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>⚠️ 4. Low Water Level</span>
              <span className="text-[7.5px] opacity-75">DRY-RUN</span>
            </button>

            {/* 5. Sediment Filter Clogging */}
            <button
              onClick={triggerSedimentClog}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'SEDIMENT_CLOGGING'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🧱 5. Sediment Clogging</span>
              <span className="text-[7.5px] opacity-75">14% HEALTH</span>
            </button>

            {/* 6. RO Membrane Degradation */}
            <button
              onClick={triggerRoDegradation}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'RO_DEGRADATION'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🔬 6. RO Membrane Degraded</span>
              <span className="text-[7.5px] opacity-75">SALT PASS</span>
            </button>

            {/* 7. Pump Failure */}
            <button
              onClick={triggerPumpFailure}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'PUMP_FAILURE'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold animate-pulse'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🔴 7. Booster Pump Failure</span>
              <span className="text-[7.5px] opacity-75">0 RPM</span>
            </button>

            {/* 8. Sensor Failure */}
            <button
              onClick={triggerSensorFault}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'SENSOR_FAILURE'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>⚡ 8. Sensor Instrument Fault</span>
              <span className="text-[7.5px] opacity-75">999 PPM</span>
            </button>

            {/* 9. UV Failure */}
            <button
              onClick={triggerUvFailure}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeScenario === 'UV_FAILURE'
                  ? 'bg-violet-500/20 border-violet-400 text-violet-300 font-bold'
                  : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>🟣 9. UV Sterilizer Failure</span>
              <span className="text-[7.5px] opacity-75">0 mW/cm²</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
