'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import { Sparkles, Compass } from 'lucide-react';
import * as THREE from 'three';

interface HotspotConfig {
  id: string;
  preset: CameraPreset;
  position: [number, number, number];
  label: string;
  getStatus: (m: any, mode: string) => { label: string; color: string };
  getSub: (m: any) => string;
}

const hotspotsList: HotspotConfig[] = [
  {
    id: 'solar',
    preset: 'SOLAR',
    position: [-1.65, 0.95, 0],
    label: 'Solar Array',
    getStatus: (m) => m.solarWatts > 5 ? { label: 'GENERATING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `Output: ${m.solarWatts.toFixed(1)}W`,
  },
  {
    id: 'battery',
    preset: 'BATTERY',
    position: [-0.65, 0.92, 0],
    label: 'Battery Source',
    getStatus: (m) => m.batteryPercent < 15 ? { label: 'CRITICAL', color: 'text-rose-400 animate-pulse' } : { label: 'NOMINAL', color: 'text-emerald-400' },
    getSub: (m) => `Capacity: ${Math.round(m.batteryPercent)}%`,
  },
  {
    id: 'esp32',
    preset: 'ESP32',
    position: [0.40, 0.92, 0],
    label: 'Unit & Control',
    getStatus: (m) => m.esp32Online ? { label: 'ONLINE', color: 'text-emerald-400' } : { label: 'OFFLINE', color: 'text-rose-400' },
    getSub: (m) => 'WiFi Connected',
  },
  {
    id: 'display',
    preset: 'DISPLAY',
    position: [0.22, 0.74, 0.20],
    label: '1.8 TFT Display',
    getStatus: (m) => m.esp32Online ? { label: 'ACTIVE', color: 'text-emerald-400' } : { label: 'OFFLINE', color: 'text-zinc-500' },
    getSub: (m) => 'Live Telemetry',
  },
  {
    id: 'float',
    preset: 'FLOAT_SENSOR',
    position: [-1.10, 0.65, 0.10],
    label: 'Float Sensor',
    getStatus: (m) => m.waterLevel > 95 ? { label: 'LEVEL FULL', color: 'text-amber-400' } : { label: 'MONITORING', color: 'text-emerald-400' },
    getSub: (m) => `Level: ${m.waterLevel}%`,
  },
  {
    id: 'pump',
    preset: 'PUMP',
    position: [1.35, 0.20, 0],
    label: 'Booster Pump',
    getStatus: (m) => m.pumpRpm > 0 ? { label: 'RUNNING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `${m.pumpRpm} RPM`,
  },
  {
    id: 'filter_housing',
    preset: 'FILTER_HOUSING',
    position: [-0.70, 0.92, -0.60],
    label: '4-Stage Smart Filtration Train',
    getStatus: (m, mode) => mode === 'TURBIDITY' ? { label: 'PURIFYING (4-STAGE)', color: 'text-amber-400 animate-pulse' } : { label: '4-STAGE DEFENSE ACTIVE', color: 'text-cyan-400' },
    getSub: () => 'SediShield • ChemoBlock • RO Maxx • Active Copper',
  },
  {
    id: 'sedimentation_tank',
    preset: 'SEDIMENTATION_TANK',
    position: [1.90, 0.40, 0.35],
    label: 'Sedimentation Tank',
    getStatus: () => ({ label: 'PRIMARY SETTLING TRAP', color: 'text-cyan-400' }),
    getSub: () => 'Multi-Layer Sand, Gravel & Grit Filter',
  },
  {
    id: 'tank2_verification',
    preset: 'TANK2_VERIFICATION',
    position: [-1.85, 0.55, 0.45],
    label: 'Quality Verification Chamber',
    getStatus: (m) => m.tds > 100 
      ? { label: 'RECIRCULATING (IMPURE)', color: 'text-amber-400 animate-pulse' } 
      : { label: 'VERIFIED PURE', color: 'text-emerald-400' },
    getSub: (m) => m.tds > 100 ? `${m.tds} ppm ➔ Stage 1 Re-Filter` : `${m.tds || 28} ppm ➔ Clean Potable`,
  },
  {
    id: 'recirculation_loop',
    preset: 'RECIRCULATION_LOOP',
    position: [-1.85, -0.22, 0.10],
    label: 'Recirculation Return Loop',
    getStatus: (m) => m.tds > 100 
      ? { label: 'ACTIVE (RE-FILTERING)', color: 'text-rose-400 animate-pulse' } 
      : { label: 'STANDBY (SOLENOID CLOSED)', color: 'text-zinc-500' },
    getSub: () => 'Direct Return to Stage 1 SediShield',
  },
  {
    id: 'uv',
    preset: 'UV_LED',
    position: [0.35, -0.40, 0.25],
    label: 'UV Light Emitter',
    getStatus: (m) => m.uvStatus === 'ON' ? { label: 'STERILIZING', color: 'text-violet-400 animate-pulse' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `Emittance: ${m.uvStatus}`,
  },
  {
    id: 'ph',
    preset: 'PH_SENSOR',
    position: [0.23, 0.65, 0.25],
    label: 'pH Sensor Probe',
    getStatus: (m) => m.ph < 6.5 || m.ph > 8.5 ? { label: 'ALERT', color: 'text-rose-400' } : { label: 'SAFE', color: 'text-emerald-400' },
    getSub: (m) => `${m.ph.toFixed(2)} pH`,
  },
  {
    id: 'turbidity',
    preset: 'TURBIDITY_SENSOR',
    position: [0.42, 0.65, 0.25],
    label: 'Turbidity Sensor',
    getStatus: (m) => m.turbidity > 5.0 ? { label: 'WARNING', color: 'text-amber-400' } : { label: 'SAFE', color: 'text-emerald-400' },
    getSub: (m) => `${m.turbidity.toFixed(1)} NTU`,
  },
  {
    id: 'tds',
    preset: 'TDS_SENSOR',
    position: [0.62, 0.65, 0.25],
    label: 'TDS Sensor Probe',
    getStatus: (m) => m.tds > 300 ? { label: 'ALERT', color: 'text-rose-400' } : { label: 'SAFE', color: 'text-emerald-400' },
    getSub: (m) => `${m.tds} ppm`,
  },
  {
    id: 'temp_sensor',
    preset: 'TEMP_SENSOR',
    position: [0.80, 0.65, 0.25],
    label: 'Temperature Sensor',
    getStatus: (m) => ({ label: 'NOMINAL', color: 'text-emerald-400' }),
    getSub: (m) => `${m.temperature.toFixed(1)}°C`,
  },
  {
    id: 'flow',
    preset: 'FLOW_SENSOR',
    position: [1.35, 0.35, 0.05],
    label: 'Flow Sensor',
    getStatus: (m) => m.flowRate > 0 ? { label: 'FLOWING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `${m.flowRate.toFixed(1)} L/min`,
  },
  {
    id: 'secondary_tank',
    preset: 'SECONDARY_TANK',
    position: [0.45, 0.35, 0.70],
    label: 'Secondary Tank (Settling)',
    getStatus: (m) => m.turbidity > 10 ? { label: 'TURBID SETTLING', color: 'text-amber-400' } : { label: 'SETTLING NOMINAL', color: 'text-teal-400' },
    getSub: () => '35L Settling & Analytical Deck',
  },
  {
    id: 'primary_tank',
    preset: 'PRIMARY_TANK',
    position: [-0.7, -0.55, 0.70],
    label: 'Primary Tank (Clean Storage)',
    getStatus: () => ({ label: 'RESERVOIR', color: 'text-cyan-400' }),
    getSub: (m) => `${m.waterLevel}% Purified Storage`,
  },
  {
    id: 'intake_pipe',
    preset: 'INTAKE_PIPE',
    position: [2.8, 0.0, 0.05],
    label: 'Borewell Suction Pipe',
    getStatus: (m) => m.flowRate > 0 ? { label: 'SUCTION ACTIVE', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => 'Intake from Borewell',
  },
  {
    id: 'drain_valve',
    preset: 'DRAIN_VALVE',
    position: [-2.62, -1.45, 0.05],
    label: 'Clean Water Tap',
    getStatus: (m, mode) => mode === 'CLEANING' ? { label: 'PURGING', color: 'text-rose-400 animate-pulse' } : { label: 'DISPENSE READY', color: 'text-emerald-400' },
    getSub: () => 'Pure Water Outlet',
  },
  {
    id: 'tank2_verification',
    preset: 'TANK2_VERIFICATION',
    position: [-1.85, 0.15, 0.35],
    label: 'Tank 2 (Verification Chamber)',
    getStatus: (m) => (m.tds2 || 28) > 100 ? { label: 'RECIRCULATE', color: 'text-amber-400 animate-pulse' } : { label: 'POTABLE PASS', color: 'text-emerald-400' },
    getSub: (m) => `Post-RO TDS: ${m.tds2 || 28} ppm`,
  },
  {
    id: 'recirculation_loop',
    preset: 'RECIRCULATION_LOOP',
    position: [-1.15, -0.22, 0.10],
    label: 'Closed-Loop Recirculation Riser',
    getStatus: (m) => (m.recirculationActive || (m.tds2 || 0) > 100) ? { label: 'RE-FILTERING', color: 'text-purple-400 animate-pulse' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => 'Returns to RO Filter Inlet',
  },
  {
    id: 'hydro_generator',
    preset: 'HYDRO_GENERATOR',
    position: [2.8, -0.40, 0.25],
    label: 'Hydro-Power Motor Generator',
    getStatus: (m) => (m.hydroWatts || 0) > 0 ? { label: 'HARVESTING ENERGY', color: 'text-cyan-400 animate-pulse' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `Output: +${(m.hydroWatts || 0).toFixed(1)}W Clean Power`,
  },
];

export const Hotspots = () => {
  const { landingVisited, demoRunning, activeHotspot, setActiveHotspot, setCameraPreset, metrics, mode, showHotspots, filterView } = useSystemState();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!landingVisited || demoRunning || !showHotspots || filterView) return null;

  return (
    <group>
      {hotspotsList.map((spot) => {
        const isHovered = hoveredId === spot.id;
        const isActive = activeHotspot === spot.id;
        const status = spot.getStatus(metrics, mode);
        const sub = spot.getSub(metrics);

        return (
          <group key={spot.id} position={spot.position}>
            <Html
              center
              zIndexRange={[100, 0]}
              style={{
                transition: 'all 0.2s ease-out',
                pointerEvents: 'auto',
              }}
            >
              <div 
                className="relative group cursor-pointer select-none"
                onMouseEnter={() => setHoveredId(spot.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(spot.id);
                  setCameraPreset(spot.preset);
                }}
              >
                <div 
                  className={`absolute -inset-1.5 rounded-full blur-sm transition-opacity duration-300 ${
                    isActive 
                      ? 'bg-cyan-500/80 opacity-100 animate-pulse' 
                      : isHovered 
                        ? 'bg-cyan-400/60 opacity-100' 
                        : 'bg-cyan-500/30 opacity-40 group-hover:opacity-100'
                  }`} 
                />

                <div className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400/90 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-110'
                    : isHovered
                      ? 'bg-zinc-900/80 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-zinc-950/60 border-zinc-700/60 shadow-lg hover:border-cyan-400/50'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isActive ? 'bg-cyan-400' : 'bg-cyan-500'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      isActive ? 'bg-cyan-300' : 'bg-cyan-400'
                    }`} />
                  </span>

                  <span className="text-[11px] font-medium tracking-wide text-zinc-100 whitespace-nowrap drop-shadow">
                    {spot.label}
                  </span>
                </div>

                {(isHovered || isActive) && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 rounded-xl backdrop-blur-xl bg-zinc-950/90 border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1 mb-1.5">
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        {spot.label}
                      </span>
                      <span className={`text-[9px] font-mono font-semibold px-1 rounded bg-zinc-900 border border-zinc-700/50 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {sub}
                    </div>

                    <div className="mt-1.5 pt-1 border-t border-zinc-900 flex items-center justify-between text-[9px] text-cyan-400 font-sans">
                      <span className="flex items-center gap-0.5">
                        <Compass className="w-2.5 h-2.5" /> Click to Inspect
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
