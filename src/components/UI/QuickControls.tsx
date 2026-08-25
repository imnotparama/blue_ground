'use client';

import React, { useState } from 'react';
import { useSystemState, CameraPreset, SystemMode } from '@/hooks/useSystemState';
import { 
  Camera, 
  Layers, 
  Sliders, 
  Eye, 
  Scissors, 
  Activity, 
  Settings, 
  HelpCircle,
  Maximize2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const QuickControls = () => {
  const { 
    cameraPreset, 
    setCameraPreset, 
    exploded, 
    setExploded, 
    cutaway, 
    setCutaway, 
    transparent, 
    setTransparent,
    mode,
    setMode,
    demoRunning,
    landingVisited
  } = useSystemState();

  const [isOpen, setIsOpen] = useState(true);

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'OVERVIEW', label: 'System Overview' },
    { id: 'SOLAR', label: 'Solar Panel' },
    { id: 'BATTERY', label: 'Battery Unit' },
    { id: 'ESP32', label: 'ESP32 Controller' },
    { id: 'SECONDARY_TANK', label: 'Secondary Tank' },
    { id: 'PUMP', label: 'Water Pump' },
    { id: 'FLOW_SENSOR', label: 'Flow Sensor' },
    { id: 'FILTER_HOUSING', label: 'Filtration Housing' },
    { id: 'INSIDE_FILTER', label: 'Filter Media Layers' },
    { id: 'RETURN_PIPE', label: 'Return Pipe' },
    { id: 'PRIMARY_TANK', label: 'Primary Tank' },
    { id: 'INTAKE_PIPE', label: 'Water Intake' },
  ];

  const modes: { id: SystemMode; label: string; desc: string; color: string }[] = [
    { id: 'NORMAL', label: 'Normal Ops', desc: 'Standard filtration loops', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' },
    { id: 'NIGHT', label: 'Night Mode', desc: 'Solar off, battery powered', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' },
    { id: 'TURBIDITY', label: 'High Turbidity', desc: 'Cloudy inflow alerts active', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' },
    { id: 'LOW_BATTERY', label: 'Low Battery', desc: 'Shutting down heavy loads', color: 'border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10' },
    { id: 'PUMP_FAILURE', label: 'Pump Failure', desc: 'Zero flow simulation', color: 'border-rose-500/25 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10' },
    { id: 'MAINTENANCE', label: 'Maintenance', desc: 'Exploded component views', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10' },
    { id: 'CLEANING', label: 'Self Cleaning', desc: 'Drain valve open, level drop', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10' },
  ];

  if (!landingVisited || demoRunning) return null;

  return (
    <div className={`fixed left-4 top-20 z-40 transition-all duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-[260px]'}`}>
      <div className="relative w-[280px]">
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-10 top-2 px-2 py-3 rounded-r-xl border-y border-r border-white/10 bg-zinc-950/80 backdrop-blur-md text-zinc-400 hover:text-white transition-all cursor-pointer pointer-events-auto"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Floating panel container */}
        <div className="glass-panel rounded-2xl p-4 w-full flex flex-col gap-4 border border-white/8 max-h-[80vh] overflow-y-auto pointer-events-auto shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
          {/* Section: Camera Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Camera Angles</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((preset) => {
                const isActive = cameraPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setCameraPreset(preset.id)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] text-left font-medium transition-all truncate border ${
                      isActive 
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-white font-semibold' 
                        : 'border-transparent bg-white/2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Section: Visual Modes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Visual Modes</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              {/* Exploded View */}
              <button
                onClick={() => setExploded(!exploded)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                  exploded 
                    ? 'bg-cyan-500/15 border-cyan-500/35 text-white font-semibold shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'border-white/5 bg-white/2 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5" /> Exploded hardware view
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${exploded ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
              </button>

              {/* Transparent Tank */}
              <button
                onClick={() => setTransparent(!transparent)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                  transparent 
                    ? 'bg-cyan-500/15 border-cyan-500/35 text-white font-semibold shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'border-white/5 bg-white/2 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Transparent tank walls
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${transparent ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
              </button>

              {/* Cutaway View */}
              <button
                onClick={() => setCutaway(!cutaway)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                  cutaway 
                    ? 'bg-cyan-500/15 border-cyan-500/35 text-white font-semibold shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'border-white/5 bg-white/2 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5" /> Sectional Cutaway view
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${cutaway ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
              </button>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Section: Operational Modes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Simulate Scenarios</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              {modes.map((m) => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      isActive 
                        ? `${m.color} border-current font-semibold scale-[1.01] shadow-[0_2px_10px_rgba(0,0,0,0.15)]` 
                        : 'border-white/5 bg-white/2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-medium flex items-center justify-between">
                      {m.label}
                      {isActive && <span className="text-[9px] uppercase tracking-wider font-mono">Active</span>}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-light mt-0.5 leading-tight">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
