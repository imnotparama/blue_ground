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
    antigravityMode,
    setAntigravityMode,
  } = useSystemState();

  const runSim1 = () => {
    setDualVerificationMode(false);
    setRecirculationTriggered(false);
    setMode('NORMAL');
    setCameraPreset('OVERVIEW');
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

  const runSim2 = () => {
    setDualVerificationMode(true);
    setRecirculationTriggered(true);
    setMode('TURBIDITY');
    setCameraPreset('TANK2_VERIFICATION');
    setMetrics(prev => ({
      ...prev,
      turbidity: 44.0,
      tds: 680,
      tds2: 185,
      turbidity2: 4.5,
      ph: 6.25,
      waterQuality: 'POOR',
      flowRate: 3.8,
      pumpRpm: 2200,
      uvStatus: 'ON',
      recirculationActive: true,
    }));
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

      {/* Center demo action & clean view toggle (pointers enabled) */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Toggle Antigravity View Button */}
        <button
          onClick={() => setAntigravityMode(!antigravityMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            antigravityMode
              ? 'bg-gradient-to-r from-cyan-500/30 to-violet-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-cyan-500/40'
          }`}
          title="Toggle Antigravity Cinematic View (Hotkey: A)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${antigravityMode ? 'text-cyan-300 animate-spin-slow' : 'text-zinc-400'}`} />
          <span className="hidden md:inline font-semibold">{antigravityMode ? 'Antigravity: ON' : 'Antigravity'}</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${antigravityMode ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>A</span>
        </button>

        {/* Toggle Water Flow Focus View Button */}
        <button
          onClick={() => setWaterTrackMode(!waterTrackMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            waterTrackMode
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.35)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-cyan-500/40'
          }`}
          title="Toggle Interactive Water Flow Focus Journey (Hotkey: W)"
        >
          <Droplets className={`w-3.5 h-3.5 ${waterTrackMode ? 'text-cyan-400 animate-bounce-subtle' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline font-semibold">{waterTrackMode ? 'Water Flow: ON' : 'Water Flow'}</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${waterTrackMode ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>W</span>
        </button>

        {/* Toggle Sensors & Tools Inventory View Button */}
        <button
          onClick={() => setSidebarTab(sidebarTab === 'TOOLS' ? 'TELEMETRY' : 'TOOLS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            sidebarTab === 'TOOLS'
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
          }`}
          title="Toggle Sensors & Tools Hardware Inventory (Hotkey: S)"
        >
          <Wrench className={`w-3.5 h-3.5 ${sidebarTab === 'TOOLS' ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline font-semibold">{sidebarTab === 'TOOLS' ? 'Tools View: ON' : 'Sensors & Tools'}</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${sidebarTab === 'TOOLS' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>S</span>
        </button>

        {/* Toggle Setup 1 (Standard Direct) vs Setup 2 (Tank 2 Dual-Verif & Recirculation) */}
        <button
          onClick={() => setDualVerificationMode(!dualVerificationMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            dualVerificationMode
              ? 'bg-purple-500/25 border-purple-400 text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.35)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-purple-500/40'
          }`}
          title="Toggle Architecture: Setup 1 (Direct RO->Clean Tank) vs Setup 2 (Tank 2 TDS Verification & Recirculation) [Hotkey: V]"
        >
          <Repeat className={`w-3.5 h-3.5 ${dualVerificationMode ? 'text-purple-400 animate-spin-slow' : 'text-zinc-400'}`} style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline font-semibold">
            {dualVerificationMode ? 'Setup 2: Tank 2 Verif' : 'Setup 1: Direct'}
          </span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${dualVerificationMode ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>V</span>
        </button>

        {/* Quick Simulation 1: Clean Borewell -> Setup 1 */}
        <button
          onClick={runSim1}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
          title="Simulate Clean/Moderate Borewell Inflow (Setup 1 Direct Purification)"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Sim 1: Borewell</span>
        </button>

        {/* Quick Simulation 2: Mining Slurry -> Setup 2 Loop */}
        <button
          onClick={runSim2}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
          title="Simulate Contaminated Mining Slurry Inflow (Setup 2 Tank 2 TDS Check & Recirculation Loop)"
        >
          <Repeat className="w-3 h-3 text-amber-400" />
          <span>Sim 2: Mining Slurry</span>
        </button>

        {/* Toggle Hydro Power Motor Generator Mode Button */}
        <button
          onClick={() => setHydroGeneratorMode(!hydroGeneratorMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            hydroGeneratorMode
              ? 'bg-blue-500/25 border-blue-400 text-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.35)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-blue-500/40'
          }`}
          title="Toggle Hydro-Power Motor Energy Harvesting Generator & Battery Charging (Hotkey: G)"
        >
          <Zap className={`w-3.5 h-3.5 ${hydroGeneratorMode ? 'text-cyan-400 animate-pulse' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline font-semibold">
            {hydroGeneratorMode ? `Hydro Gen: +${(metrics.hydroWatts || 28.5).toFixed(1)}W` : 'Hydro Gen'}
          </span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${hydroGeneratorMode ? 'bg-blue-950 text-blue-300 border border-blue-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>G</span>
        </button>

        {/* Toggle Tanks Only / Margin View Button */}
        <button
          onClick={() => setTanksOnly(!tanksOnly)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            tanksOnly
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
          }`}
          title="Toggle Tanks Only & Volume Margins Mode (Hotkey: T)"
        >
          <Layers className={`w-3.5 h-3.5 ${tanksOnly ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline font-semibold">{tanksOnly ? 'Tanks Margins: ON' : 'Tanks Only'}</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${tanksOnly ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>T</span>
        </button>

        {/* Toggle Details / Clean View Button */}
        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-mono tracking-wide cursor-pointer ${
            showHotspots
              ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Toggle Inspection Dots & Labels (Hotkey: H)"
        >
          {showHotspots ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
          <span className="hidden sm:inline font-semibold">{showHotspots ? 'Details: ON' : 'Clean View'}</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">H</span>
        </button>

        {!demoRunning ? (
          <button
            onClick={startDemo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/20 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-105 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Start Guided Demo
          </button>
        ) : (
          <button
            onClick={stopDemo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-950/75 border border-red-500/30 hover:bg-red-900/80 text-red-200 font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 fill-red-200" />
            End Demo Tour
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
