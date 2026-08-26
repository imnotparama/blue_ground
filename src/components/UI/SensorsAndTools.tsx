'use client';

import React, { useState } from 'react';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import { 
  Search, 
  Activity, 
  Cpu, 
  Droplet, 
  Layers, 
  Crosshair, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Gauge,
  Sliders,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToolCategory = 'ALL' | 'SENSORS' | 'ELECTRONICS' | 'HYDRAULICS' | 'VESSELS';

export interface ToolItem {
  id: string;
  preset: CameraPreset;
  name: string;
  category: ToolCategory;
  model: string;
  spec: string;
  location: string;
  getLiveValue: (metrics: any, mode?: any) => string;
  getStatus: (metrics: any, mode?: any) => { label: string; color: string };
}

export const TOOLS_CATALOG: ToolItem[] = [
  // ─── SENSORS ───
  {
    id: 'tds',
    preset: 'TDS_SENSOR',
    name: 'TDS Sensor Probe',
    category: 'SENSORS',
    model: 'DFRobot SEN0244 / Platinum Dual-Pin',
    spec: '0–1000 ppm • ±5% F.S. • Platinum Electrodes',
    location: 'Secondary Testing Chamber (Top-Right)',
    getLiveValue: (m) => `${m.tds} ppm`,
    getStatus: (m) => m.tds > 300 ? { label: 'HIGH TDS', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' } : { label: 'OPTIMAL', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  },
  {
    id: 'ph',
    preset: 'PH_SENSOR',
    name: 'pH Sensor Probe',
    category: 'SENSORS',
    model: 'E-201-C Industrial Glass Combination',
    spec: '0–14.0 pH • Ag/AgCl Reference Wire • Ceramic Junction',
    location: 'Secondary Testing Chamber (Top-Right)',
    getLiveValue: (m) => `${m.ph.toFixed(2)} pH`,
    getStatus: (m) => m.ph < 6.5 || m.ph > 8.5 ? { label: 'ACIDIC/BASIC', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' } : { label: 'BALANCED', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  },
  {
    id: 'turbidity',
    preset: 'TURBIDITY_SENSOR',
    name: 'Turbidity Optical Sensor',
    category: 'SENSORS',
    model: 'TS-300B Nephelometric Module',
    spec: '0–100 NTU • 850nm IR Emitter / 90° Receiver',
    location: 'Secondary Testing Chamber (Top-Right)',
    getLiveValue: (m) => `${m.turbidity.toFixed(1)} NTU`,
    getStatus: (m) => m.turbidity > 5.0 ? { label: 'TURBID MINE WATER', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' } : { label: 'CLEAR', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  },
  {
    id: 'flow',
    preset: 'FLOW_SENSOR',
    name: 'YF-S201 Inline Flow Sensor',
    category: 'SENSORS',
    model: 'YF-S201 1/2" Hall-Effect Meter',
    spec: '1–30 L/min • 450 Pulses/L • Neodymium Turbine',
    location: 'Sedimentation ➔ Secondary Transfer Pipe',
    getLiveValue: (m) => `${m.flowRate.toFixed(1)} L/min`,
    getStatus: (m) => m.flowRate > 0 ? { label: 'FLOW ACTIVE', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' } : { label: 'STANDBY', color: 'text-zinc-400 bg-zinc-900 border-zinc-700' },
  },
  {
    id: 'float',
    preset: 'FLOAT_SENSOR',
    name: 'Reed Float Level Sensor',
    category: 'SENSORS',
    model: 'Stainless Vertical Magnetic Float Switch',
    spec: '0–100% Depth • Hermetic Reed Switch Core',
    location: 'Primary Clean Reservoir (Left Wall)',
    getLiveValue: (m) => `${m.waterLevel}% Full`,
    getStatus: (m) => m.waterLevel > 90 ? { label: 'RESERVOIR FULL', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' } : { label: 'FILLING', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  },
  {
    id: 'filter_housing',
    preset: 'FILTER_HOUSING',
    name: 'Analog Glycerin Pressure Gauge',
    category: 'SENSORS',
    model: 'Dual-Scale Dial Gauge (0–100 PSI / 0–7 Bar)',
    spec: 'Glycerin Dampened • Green Safe / Red Hazard Arcs',
    location: 'RO Filtration Tank Module (Top-Left)',
    getLiveValue: (m, mode) => mode === 'TURBIDITY' ? '65 PSI' : '42 PSI',
    getStatus: (m, mode) => mode === 'TURBIDITY' ? { label: 'HIGH PURIFY PRESSURE', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' } : { label: 'NORMAL PSI', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  },

  // ─── ELECTRONICS & POWER ───
  {
    id: 'esp32',
    preset: 'ESP32',
    name: 'ESP32-WROOM-32 Edge Controller',
    category: 'ELECTRONICS',
    model: 'ESP32-WROOM-32D Dual-Core 240MHz',
    spec: '520KB SRAM • 2.4GHz WiFi/BLE • FreeRTOS Edge Kernel',
    location: 'Unit & Control Enclosure (Right Roof)',
    getLiveValue: (m) => m.esp32Online ? `${m.wifiSignal} dBm Online` : 'Offline',
    getStatus: (m) => m.esp32Online ? { label: 'EDGE SYNCED', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' } : { label: 'OFFLINE', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' },
  },
  {
    id: 'display',
    preset: 'DISPLAY',
    name: '1.8" ST7735 SPI Color TFT Screen',
    category: 'ELECTRONICS',
    model: 'ST7735 128×160 16-Bit RGB LCD',
    spec: '65K Colors • Hardware SPI Matrix Live Telemetry',
    location: 'Unit & Control Front Face',
    getLiveValue: (m) => `Telemetry Matrix Active`,
    getStatus: () => ({ label: '60 FPS REFRESH', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' }),
  },
  {
    id: 'solar',
    preset: 'SOLAR',
    name: 'Monocrystalline Solar PV Array',
    category: 'ELECTRONICS',
    model: 'Diamond Busbar Monocrystalline PV Cells',
    spec: '60W Peak • 18V Vmp • IP68 MC4 Junction Box',
    location: 'Elevated Roof Frame (Far-Left)',
    getLiveValue: (m) => `${m.solarWatts.toFixed(0)} Watts`,
    getStatus: (m) => m.solarWatts > 30 ? { label: 'HARVESTING POWER', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' } : { label: 'LOW INSOLATION', color: 'text-zinc-400 bg-zinc-900 border-zinc-700' },
  },
  {
    id: 'battery',
    preset: 'BATTERY',
    name: 'Smart Lithium Storage Enclosure',
    category: 'ELECTRONICS',
    model: '12V 20Ah Li-Ion Pack with Smart BMS',
    spec: '240Wh Capacity • Overcharge & Thermal Cutoff',
    location: 'Center Roof Aluminum Enclosure',
    getLiveValue: (m) => `${Math.round(m.batteryPercent)}% Capacity`,
    getStatus: (m) => m.batteryPercent < 20 ? { label: 'LOW BATTERY', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' } : { label: 'NOMINAL', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  },

  // ─── HYDRAULICS & ACTUATORS ───
  {
    id: 'pump',
    preset: 'PUMP',
    name: 'DC Submersible Filtration Pump',
    category: 'HYDRAULICS',
    model: '12V Brushless DC Submersible Pump',
    spec: '2400 Max RPM • 3.5m Head • PWM Controlled',
    location: 'Secondary Chamber Floor (x = 0.05)',
    getLiveValue: (m) => `${m.pumpRpm} RPM`,
    getStatus: (m) => m.pumpRpm > 0 ? { label: 'PUMPING TO RO', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' } : { label: 'STANDBY', color: 'text-zinc-400 bg-zinc-900 border-zinc-700' },
  },
  {
    id: 'uv',
    preset: 'UV_LED',
    name: 'High-Output Germicidal UV-C Emitter',
    category: 'HYDRAULICS',
    model: '254nm Quartz Glass Sleeve Sterilizer',
    spec: '6W UV-C • 99.9% Microbial Inactivation Rate',
    location: 'Primary Clean Reservoir (Internal Immersion)',
    getLiveValue: (m) => `Status: ${m.uvStatus}`,
    getStatus: (m) => m.uvStatus === 'ON' ? { label: 'STERILIZING ACTIVE', color: 'text-violet-400 bg-violet-950/60 border-violet-500/40' } : { label: 'OFF', color: 'text-zinc-400 bg-zinc-900 border-zinc-700' },
  },

  // ─── VESSELS & FILTERS ───
  {
    id: 'sedimentation_tank',
    preset: 'SEDIMENTATION_TANK',
    name: 'Primary Sedimentation Settling Tank',
    category: 'VESSELS',
    model: 'Multi-Density Gravitational Settling Vessel',
    spec: '45 Liters • Coarse Aggregate, Sand & Charcoal',
    location: 'Raw Intake Side (Far-Right)',
    getLiveValue: () => '45 Liters Capacity',
    getStatus: () => ({ label: 'GRIT TRAP READY', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' }),
  },
  {
    id: 'filter_housing',
    preset: 'FILTER_HOUSING',
    name: '4-Stage RO Multi-Barrier Purifier',
    category: 'VESSELS',
    model: 'PP + CTO Carbon + 0.0001μm RO + Mineralizer',
    spec: '15 Liters • Multi-Stage Pure Drinking Water Unit',
    location: 'Top-Left Filtration Deck (x = -1.40)',
    getLiveValue: (m) => `${m.filterHealth}% Filter Health`,
    getStatus: (m, mode) => mode === 'TURBIDITY' ? { label: 'RO ACTIVE PURIFY', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' } : { label: 'STANDBY READY', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' },
  },
  {
    id: 'secondary_tank',
    preset: 'SECONDARY_TANK',
    name: 'Secondary Quality Testing Chamber',
    category: 'VESSELS',
    model: 'Dual-Partition Acrylic Quality Decision Chamber',
    spec: '35 Liters • Embedded Probes & Downward Bypass Valve',
    location: 'Main Acrylic Tank Top-Right Section',
    getLiveValue: (m) => `Quality: ${m.waterQuality}`,
    getStatus: (m) => ({ label: 'ANALYZING INFLOW', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' }),
  },
  {
    id: 'primary_tank',
    preset: 'PRIMARY_TANK',
    name: 'Primary 250L Clean Water Reservoir',
    category: 'VESSELS',
    model: '250L Monolithic Food-Grade Acrylic Reservoir',
    spec: '250 Liters • Clean Dispense Tap & Bottom Drain Tap',
    location: 'Main Acrylic Tank Lower 75%',
    getLiveValue: (m) => `${Math.round((m.waterLevel / 100) * 250)}L / 250L`,
    getStatus: (m) => ({ label: `${m.waterLevel}% STORED`, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' }),
  },
];

export const SensorsAndTools = () => {
  const { metrics, mode, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: ToolCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Tools (16)', icon: <Layers className="w-3 h-3" /> },
    { key: 'SENSORS', label: 'Sensors (6)', icon: <Activity className="w-3 h-3 text-cyan-400" /> },
    { key: 'ELECTRONICS', label: 'Electronics (4)', icon: <Cpu className="w-3 h-3 text-amber-400" /> },
    { key: 'HYDRAULICS', label: 'Hydraulics (2)', icon: <Droplet className="w-3 h-3 text-blue-400" /> },
    { key: 'VESSELS', label: 'Vessels & RO (4)', icon: <Gauge className="w-3 h-3 text-emerald-400" /> },
  ];

  const filteredTools = TOOLS_CATALOG.filter((tool) => {
    const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.spec.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (tool: ToolItem) => {
    setActiveHotspot(tool.id);
    setCameraPreset(tool.preset);
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden text-xs select-none">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sensors, probes, modules..."
          className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-[10px] font-mono"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Component Cards Scrollable List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1 custom-scrollbar max-h-[52vh]">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-500 font-mono text-center gap-2">
            <Search className="w-5 h-5 stroke-1 text-zinc-600" />
            <p className="text-[10px]">No components match "{searchQuery}"</p>
          </div>
        ) : (
          filteredTools.map((tool) => {
            const isSelected = activeHotspot === tool.id;
            const status = tool.getStatus(metrics, mode);
            const liveVal = tool.getLiveValue(metrics, mode);

            return (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleToolClick(tool)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 relative overflow-hidden ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                    : 'bg-zinc-900/60 border-white/5 hover:border-cyan-500/30 hover:bg-zinc-900/90'
                }`}
              >
                {/* Active Indicator Top Glow Line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}

                {/* Header: Title + Live Telemetry Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Crosshair className={`w-3 h-3 shrink-0 ${isSelected ? 'text-cyan-400 animate-spin-slow' : 'text-zinc-500'}`} />
                    <span className="font-bold text-white text-[11px] tracking-wide font-mono truncate">
                      {tool.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    {liveVal}
                  </span>
                </div>

                {/* Subtitle: Model & Spec */}
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pl-4.5">
                  <span className="text-zinc-300 truncate max-w-[170px]">{tool.model}</span>
                  <span className={`px-1.5 py-0.2 rounded-full border uppercase text-[8px] font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Tip Banner */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[9px] font-mono">
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
        <span>Click any tool above to glide the 3D camera & locate it in real time.</span>
      </div>
    </div>
  );
};
