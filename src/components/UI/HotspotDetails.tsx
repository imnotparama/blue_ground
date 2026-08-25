'use client';

import React from 'react';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import { X, Cpu, Info, Zap, Settings, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SensorDetail {
  name: string;
  purpose: string;
  principle: string;
  power: string;
  unit: string;
  getVal: (m: any) => string;
  getStatus: (m: any) => { label: string; isWarning: boolean; isCritical: boolean };
}

const sensorDetailsCatalog: Record<string, SensorDetail> = {
  tds: {
    name: 'Total Dissolved Solids (TDS) Probe',
    purpose: 'Measures mobile charged ions, indicating chemical water purity and mineral content.',
    principle: 'Passes a small electrical current between two steel electrodes to measure conductivity, translating it to parts-per-million (ppm).',
    power: '0.15 W',
    unit: 'ppm',
    getVal: (m) => `${m.tds} ppm`,
    getStatus: (m) => {
      if (m.tds > 300) return { label: 'High Dissolved Solids', isWarning: true, isCritical: false };
      return { label: 'Optimal Purity', isWarning: false, isCritical: false };
    },
  },
  ph: {
    name: 'pH Ion Sensor Probe',
    purpose: 'Monitors the acidity or alkalinity of the water purification loop.',
    principle: 'Measures hydrogen-ion activity via a glass membrane electrode, outputting a relative electrical potential translated to the 0-14 pH scale.',
    power: '0.25 W',
    unit: '',
    getVal: (m) => `${m.ph.toFixed(2)} pH`,
    getStatus: (m) => {
      if (m.ph < 6.5 || m.ph > 8.5) return { label: 'pH Off-balance', isWarning: false, isCritical: true };
      return { label: 'Neutral (Safe)', isWarning: false, isCritical: false };
    },
  },
  turbidity: {
    name: 'Optical Turbidity Sensor',
    purpose: 'Measures physical water clarity, detecting suspended sediments or silt.',
    principle: 'Projects an infrared beam through the water column and calculates 90-degree light scattering to estimate suspended particulate density.',
    power: '0.45 W',
    unit: 'NTU',
    getVal: (m) => `${m.turbidity.toFixed(1)} NTU`,
    getStatus: (m) => {
      if (m.turbidity > 5.0) return { label: 'Turbid / Cloudy', isWarning: true, isCritical: false };
      return { label: 'Clear / Pure', isWarning: false, isCritical: false };
    },
  },
  temp: {
    name: 'DS18B20 Temperature Probe',
    purpose: 'Tracks water temperature to calibrate pH/TDS sensor offsets.',
    principle: 'Utilizes a semiconductor silicon bandgap temperature sensor inside a sealed waterproof stainless steel shaft.',
    power: '0.05 W',
    unit: '°C',
    getVal: (m) => `${m.temperature.toFixed(1)} °C`,
    getStatus: (m) => ({ label: 'Normal Temp', isWarning: false, isCritical: false }),
  },
  float: {
    name: 'Magnetic Liquid Level Float',
    purpose: 'Monitors primary storage tank volume limits to prevent overflow or dry-out.',
    principle: 'A hollow floating ring containing a magnet rises/falls on a steel rod, triggering internal reed switches at height thresholds.',
    power: '0.02 W',
    unit: '%',
    getVal: (m) => `${m.waterLevel}% (${Math.round(m.waterLevel * 2.5)}L)`,
    getStatus: (m) => {
      if (m.waterLevel < 15) return { label: 'Low Reserve Warning', isWarning: true, isCritical: false };
      if (m.waterLevel > 95) return { label: 'Tank Capacity Max', isWarning: true, isCritical: false };
      return { label: 'Nominal Level', isWarning: false, isCritical: false };
    },
  },
  flow: {
    name: 'Hall-Effect Flow Wheel',
    purpose: 'Monitors filtration volumetric flow speed and detects clogs.',
    principle: 'Water drives an internal paddle rotor. An integrated Hall-effect chip outputs a square-wave frequency proportionate to impeller angular velocity.',
    power: '0.10 W',
    unit: 'L/min',
    getVal: (m) => `${m.flowRate.toFixed(1)} L/min`,
    getStatus: (m) => {
      if (m.pumpRpm > 100 && m.flowRate < 0.5) return { label: 'Flow Blocked / Air Lock', isWarning: false, isCritical: true };
      return { label: 'Active Throughput', isWarning: false, isCritical: false };
    },
  },
  uv: {
    name: 'UV-C LED Sterilization Light',
    purpose: 'Destroys biological bacteria, viruses, and active pathogens.',
    principle: 'Projects ultraviolet-C light (wavelength 254nm), which penetrates pathogen cell membranes and breaks down DNA, preventing reproduction.',
    power: '3.50 W',
    unit: '',
    getVal: (m) => m.uvStatus === 'ON' ? 'EMITTING UV-C' : 'DISABLED',
    getStatus: (m) => {
      if (m.uvStatus === 'OFF') return { label: 'UV Off (Safe/Standby)', isWarning: true, isCritical: false };
      return { label: 'Sterilizing Loop Active', isWarning: false, isCritical: false };
    },
  },
};

export const HotspotDetails = () => {
  const { activeHotspot, setActiveHotspot, setCameraPreset, metrics } = useSystemState();

  const handleClose = () => {
    setActiveHotspot(null);
    setCameraPreset('OVERVIEW');
  };

  const detail = activeHotspot ? sensorDetailsCatalog[activeHotspot] : null;

  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="fixed left-6 top-24 z-30 w-full max-w-sm pointer-events-none"
        >
          <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden pointer-events-auto shadow-[0_16px_36px_rgba(0,0,0,0.4)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cpu className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-mono">SPECIFICATIONS</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">{detail.name}</h2>
              {/* Dynamic Value Badge */}
              <div className="text-xl font-bold font-mono text-cyan-300 mt-2 flex items-baseline gap-1">
                {detail.getVal(metrics)}
              </div>
            </div>

            {/* Diagnostics status badge */}
            {(() => {
              const status = detail.getStatus(metrics);
              return (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium font-mono ${
                  status.isCritical 
                    ? 'border-red-500/20 text-red-400 bg-red-500/5' 
                    : status.isWarning 
                    ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' 
                    : 'border-emerald-500/10 text-emerald-400 bg-emerald-500/5'
                }`}>
                  {status.isCritical ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : 
                   status.isWarning ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> : 
                   <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{status.label}</span>
                </div>
              );
            })()}

            <hr className="border-white/5" />

            {/* Info cards */}
            <div className="flex flex-col gap-3 text-[11px] font-light text-zinc-400 leading-relaxed">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 font-semibold block mb-0.5">Core Purpose:</strong>
                  {detail.purpose}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Settings className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 font-semibold block mb-0.5">Working Principle:</strong>
                  {detail.principle}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <strong className="text-zinc-200 font-semibold inline mr-1">Active Power Draw:</strong>
                  <span className="font-mono text-amber-300 font-medium">{detail.power}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
