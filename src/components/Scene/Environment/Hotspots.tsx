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
    position: [-1.4, 0.9, 0],
    label: 'Solar Panel',
    getStatus: (m) => m.solarWatts > 5 ? { label: 'GENERATING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `Output: ${m.solarWatts.toFixed(1)}W`,
  },
  {
    id: 'battery',
    preset: 'BATTERY',
    position: [-0.2, 0.65, 0.1],
    label: 'Battery Pack',
    getStatus: (m) => m.batteryPercent < 15 ? { label: 'CRITICAL', color: 'text-rose-400 animate-pulse' } : { label: 'NOMINAL', color: 'text-emerald-400' },
    getSub: (m) => `Capacity: ${Math.round(m.batteryPercent)}%`,
  },
  {
    id: 'esp32',
    preset: 'ESP32',
    position: [0.7, 0.65, 0.15],
    label: 'ESP32 Controller',
    getStatus: (m) => m.esp32Online ? { label: 'ONLINE', color: 'text-emerald-400' } : { label: 'OFFLINE', color: 'text-rose-400' },
    getSub: (m) => 'WiFi Connected',
  },
  {
    id: 'display',
    preset: 'DISPLAY',
    position: [0.7, 0.52, 0.28],
    label: 'TFT Display',
    getStatus: (m) => m.esp32Online ? { label: 'ACTIVE', color: 'text-emerald-400' } : { label: 'OFFLINE', color: 'text-zinc-500' },
    getSub: (m) => 'Refreshing telemetry',
  },
  {
    id: 'float',
    preset: 'FLOAT_SENSOR',
    position: [-1.5, -0.15, 0],
    label: 'Float Sensor',
    getStatus: (m) => m.waterLevel > 95 ? { label: 'LEVEL FULL', color: 'text-amber-400' } : { label: 'MONITORING', color: 'text-emerald-400' },
    getSub: (m) => `Level: ${m.waterLevel}%`,
  },
  {
    id: 'pump',
    preset: 'PUMP',
    position: [0.3, -0.2, 0],
    label: 'Water Pump',
    getStatus: (m) => m.pumpRpm > 0 ? { label: 'RUNNING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `${m.pumpRpm} RPM`,
  },
  {
    id: 'uv',
    preset: 'UV_LED',
    position: [0.4, -0.18, 0.3],
    label: 'UV-C LED',
    getStatus: (m) => m.uvStatus === 'ON' ? { label: 'STERILIZING', color: 'text-violet-400 animate-pulse' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `Emittance: ${m.uvStatus}`,
  },
  {
    id: 'ph',
    preset: 'PH_SENSOR',
    position: [0.7, 0.08, -0.1],
    label: 'pH Probe',
    getStatus: (m) => m.ph < 6.5 || m.ph > 8.5 ? { label: 'ALERT', color: 'text-rose-400' } : { label: 'SAFE', color: 'text-emerald-400' },
    getSub: (m) => `${m.ph.toFixed(2)} pH`,
  },
  {
    id: 'tds',
    preset: 'TDS_SENSOR',
    position: [0.55, 0.08, 0.15],
    label: 'TDS Probe',
    getStatus: (m) => m.tds > 300 ? { label: 'ALERT', color: 'text-rose-400' } : { label: 'SAFE', color: 'text-emerald-400' },
    getSub: (m) => `${m.tds} ppm`,
  },
  {
    id: 'turbidity',
    preset: 'TURBIDITY_SENSOR',
    position: [0.85, 0.08, 0.15],
    label: 'Turbidity Probe',
    getStatus: (m) => m.turbidity > 5.0 ? { label: 'WARNING', color: 'text-amber-400' } : { label: 'SAFE', color: 'text-emerald-400' },
    getSub: (m) => `${m.turbidity.toFixed(1)} NTU`,
  },
  {
    id: 'temp',
    preset: 'TEMP_SENSOR',
    position: [0.62, 0.06, -0.22],
    label: 'Temp Probe',
    getStatus: () => ({ label: 'OK', color: 'text-emerald-400' }),
    getSub: (m) => `${m.temperature.toFixed(1)} °C`,
  },
  {
    id: 'flow',
    preset: 'FLOW_SENSOR',
    position: [1.6, 0.08, 0.05],
    label: 'Flow Sensor',
    getStatus: (m) => m.flowRate > 0 ? { label: 'FLOWING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: (m) => `${m.flowRate.toFixed(1)} L/min`,
  },
  {
    id: 'sedimentation_tank',
    preset: 'SEDIMENTATION_TANK',
    position: [0.15, 0.0, 0.68],
    label: 'Sedimentation Tank',
    getStatus: () => ({ label: 'ACTIVE', color: 'text-cyan-400' }),
    getSub: () => 'Settling Trap',
  },
  {
    id: 'filter_housing',
    preset: 'FILTER_HOUSING',
    position: [2.2, -0.6, 0.28],
    label: 'Filter Housing',
    getStatus: () => ({ label: 'ACTIVE', color: 'text-cyan-400' }),
    getSub: (m) => `${m.filterHealth}% Health`,
  },
  {
    id: 'primary_tank',
    preset: 'PRIMARY_TANK',
    position: [-0.6, -0.6, 0.7],
    label: 'Primary Tank',
    getStatus: () => ({ label: 'RESERVOIR', color: 'text-cyan-400' }),
    getSub: (m) => `${m.waterLevel}% Purified`,
  },
  {
    id: 'secondary_tank',
    preset: 'SECONDARY_TANK',
    position: [0.15, 0.0, -0.68],
    label: 'Secondary Tank',
    getStatus: () => ({ label: 'MONITORING', color: 'text-cyan-400' }),
    getSub: () => 'Sump Well',
  },
  {
    id: 'intake_pipe',
    preset: 'INTAKE_PIPE',
    position: [3.8, -1.1, 0.06],
    label: 'Intake Pipe',
    getStatus: (m) => m.flowRate > 0 ? { label: 'SUCTION ACTIVE', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => 'Source water inlet',
  },
  {
    id: 'return_pipe',
    preset: 'RETURN_PIPE',
    position: [-0.4, -0.6, 0.06],
    label: 'Return Pipe',
    getStatus: (m) => m.flowRate > 0 ? { label: 'LOOP ACTIVE', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => 'Conveys clean water',
  },
  {
    id: 'drain_valve',
    preset: 'DRAIN_VALVE',
    position: [0.5, -1.5, 0.06],
    label: 'Drain Solenoid',
    getStatus: (m, mode) => mode === 'CLEANING' ? { label: 'OPEN', color: 'text-rose-400 animate-pulse' } : { label: 'CLOSED', color: 'text-zinc-400' },
    getSub: (m) => m.mode === 'CLEANING' ? 'Purge cycle active' : 'Locked shut',
  },
];

export const Hotspots = () => {
  const { landingVisited, demoRunning, activeHotspot, setActiveHotspot, setCameraPreset, metrics, mode } = useSystemState();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Hide hotspots during the landing presentation or when the guided tour is active
  if (!landingVisited || demoRunning) return null;

  return (
    <group>
      {hotspotsList.map((h) => {
        const isHovered = hoveredId === h.id;
        const isActive = activeHotspot === h.id;
        const status = h.getStatus(metrics, mode);

        const handleClick = (e: any) => {
          e.stopPropagation();
          setActiveHotspot(h.id);
          setCameraPreset(h.preset);
        };

        return (
          <group key={h.id} position={h.position}>
            <Html
              center
              distanceFactor={4.2} // Scales hotspot down as camera pulls back
              className="pointer-events-none select-none z-20"
            >
              <div 
                className="relative flex items-center justify-center"
                onPointerOver={() => setHoveredId(h.id)}
                onPointerOut={() => setHoveredId(null)}
              >
                {/* 1. Pulsing Core Anchor Dot (Vision Pro style) */}
                <button
                  onClick={handleClick}
                  className={`w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/50 cursor-pointer pointer-events-auto transition-all duration-300 hotspot-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)] ${
                    isActive ? 'scale-125 bg-white border-cyan-400' : 'hover:scale-115'
                  }`}
                />

                {/* 2. Floating Hover Info Pill Card */}
                <div 
                  className={`absolute left-6 w-max max-w-[240px] flex flex-col gap-0.5 px-3 py-2 rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-md text-[10px] text-zinc-300 font-mono shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-none transform origin-left ${
                    isHovered || isActive 
                      ? 'scale-100 opacity-100 translate-x-0' 
                      : 'scale-90 translate-x-[-8px] pointer-events-none opacity-0'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white tracking-wider">
                    <span>{h.label}</span>
                    <span className={`text-[8px] font-semibold tracking-widest uppercase ${status.color}`}>
                      | {status.label}
                    </span>
                  </div>
                  <div className="text-[8.5px] text-zinc-500 font-light flex items-center gap-1">
                    <span>{h.getSub(metrics)}</span>
                    {(isHovered && !isActive) && <span className="text-cyan-400 font-semibold pl-1.5">Click to Inspect</span>}
                  </div>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
