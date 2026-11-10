'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import { 
  Sun, 
  Cpu, 
  Droplet, 
  Layers, 
  Zap, 
  Activity, 
  Gauge, 
  CheckCircle,
  Filter,
} from 'lucide-react';

interface HotspotConfig {
  id: string;
  preset: CameraPreset;
  position: [number, number, number];
  label: string;
  icon: React.ReactNode;
  getStatus: (m: any, sim: any) => { label: string; color: string };
  getSub: (m: any, sim: any) => string;
}

// 9 Exact CAD Subassembly Inspection Nodes mapped 1:1 to blueground_leviathan_v9.solidcraft
const hotspotsList: HotspotConfig[] = [
  {
    id: 'solar',
    preset: 'SOLAR',
    position: [0.0, 0.60, -0.10],
    label: 'Solar Canopy & PV Grid',
    icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
    getStatus: (m) => m.solarWatts > 5 ? { label: '56.8W HARVESTING', color: 'text-emerald-400' } : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => 'Tempered PV Glass • 24 Mono-Si Cells',
  },
  {
    id: 'esp32',
    preset: 'ESP32',
    position: [0.0, 0.28, 0.38],
    label: 'Hermetic Enclosure & ESP32-S3',
    icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
    getStatus: (m) => m.esp32Online ? { label: 'ONLINE (ESP32-S3)', color: 'text-emerald-400' } : { label: 'OFFLINE', color: 'text-rose-400' },
    getSub: () => 'ADS1115 ADC • XL6019 Boost • 4-Ch Relay',
  },
  {
    id: 'sensors',
    preset: 'TDS_SENSOR',
    position: [-0.10, -0.85, -0.04],
    label: 'Analytical Sensor Bridge',
    icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
    getStatus: (_, sim) => ({
      label: `${sim?.inputTds || 320} ppm | ${sim?.inputTurbidity || 1.2} NTU | ${sim?.inputPh || 7.2} pH`,
      color: 'text-cyan-300 font-bold',
    }),
    getSub: () => 'Delrin CNC Manifold • Ti TDS • pH Bulb • Temp',
  },
  {
    id: 'filters',
    preset: 'FILTER_HOUSING',
    position: [-0.10, -0.75, -0.62],
    label: '4-Stage Smart Filtration Rack',
    icon: <Filter className="w-3.5 h-3.5 text-cyan-400" />,
    getStatus: (_, sim) => ({
      label: `HEALTH: ${sim?.filterHealth?.overall || 94}% (4 STAGES ACTIVE)`,
      color: 'text-emerald-400',
    }),
    getSub: () => 'CTO Carbon • RO Maxx • Active Mineral • Softener',
  },
  {
    id: 'uv',
    preset: 'UV_LED',
    position: [-0.10, -1.35, -0.62],
    label: 'UV Germicidal Disinfection',
    icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
    getStatus: (_, sim) => sim?.uvStatus === 'ON'
      ? { label: 'STERILIZING (254nm • 42 mJ/cm²)', color: 'text-purple-300 animate-pulse' }
      : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => 'Log-4 Microbial Pathogen Neutralization',
  },
  {
    id: 'pump',
    preset: 'PUMP',
    position: [0.55, -0.95, -0.62],
    label: 'Booster Pump Station P2',
    icon: <Gauge className="w-3.5 h-3.5 text-cyan-400" />,
    getStatus: (_, sim) => sim?.pumpStatus === 'RUNNING'
      ? { label: `${sim.pumpRpm} RPM • 6.8 bar`, color: 'text-emerald-400' }
      : { label: 'STANDBY', color: 'text-zinc-500' },
    getSub: () => '24V DC Diaphragm Booster • High-Pressure Feed',
  },
  {
    id: 'raw_inlet',
    preset: 'SEDIMENTATION_TANK',
    position: [0.80, -0.48, 0.25],
    label: 'Raw Water Feed Inlet & Isolation Valve',
    icon: <Droplet className="w-3.5 h-3.5 text-blue-400" />,
    getStatus: (_, sim) => ({
      label: `INFLOW: ${(sim?.inputFlowRate || 4.8).toFixed(1)} L/min • 4.2 Bar`,
      color: 'text-cyan-300 font-bold',
    }),
    getSub: () => 'Direct Borewell Feed • 90° Elbow • Pressure Gauge',
  },
  {
    id: 'sediment',
    preset: 'SEDIMENTATION_TANK',
    position: [0.72, -0.89, 0.14],
    label: 'White Sedimentation Filter (5µm Spun PP)',
    icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
    getStatus: (_, sim) => ({
      label: `HEALTH: ${sim?.filterHealth?.stage1 || 92}% • 85% SILT TRAP`,
      color: 'text-amber-300 font-bold',
    }),
    getSub: () => 'High-Density Spun PP Core • Coarse Sand & Clay Trap',
  },
  {
    id: 'clean_tank',
    preset: 'PRIMARY_TANK',
    position: [-0.10, -1.75, -0.04],
    label: 'Clean Water Storage Reservoir',
    icon: <Droplet className="w-3.5 h-3.5 text-cyan-400" />,
    getStatus: (_, sim) => ({
      label: `${Math.round(sim?.purifiedWaterLevel || 68)}L STORED (${sim?.waterQuality || 'EXCELLENT'})`,
      color: 'text-cyan-300 font-bold',
    }),
    getSub: () => 'Certified Potable • Dual Float Interlock',
  },
  {
    id: 'tank_basement',
    preset: 'PRIMARY_TANK',
    position: [-0.10, -2.14, -0.04],
    label: 'Reinforced Tank Foundation Basement',
    icon: <Layers className="w-3.5 h-3.5 text-zinc-300" />,
    getStatus: () => ({
      label: 'HEAVY-DUTY VIBRATION ISOLATED SKID',
      color: 'text-emerald-400 font-bold',
    }),
    getSub: () => 'Brushed 6061 Alloy Skid • Rubber Feet • Drip Lip',
  },
  {
    id: 'dispense',
    preset: 'OVERVIEW',
    position: [0.55, -1.75, 0.55],
    label: 'Dispense Tap & Drip Tray',
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    getStatus: (_, sim) => ({
      label: `${sim?.outputTds || 16} ppm WHO POTABLE`,
      color: 'text-emerald-400 font-bold',
    }),
    getSub: () => 'Chrome Gooseneck • Micro-Hydro Turbine Outlet',
  },
];

export const Hotspots: React.FC = () => {
  const {
    landingVisited,
    demoRunning,
    activeHotspot,
    setActiveHotspot,
    setCameraPreset,
    metrics,
    simState,
    showHotspots,
    filterView,
    exploded,
  } = useSystemState();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!landingVisited || demoRunning || !showHotspots || filterView || exploded) return null;

  return (
    <group name="CAD_Hotspots_Layer">
      {hotspotsList.map((spot) => {
        const isHovered = hoveredId === spot.id;
        const isActive = activeHotspot === spot.id;
        const status = spot.getStatus(metrics, simState);
        const sub = spot.getSub(metrics, simState);

        return (
          <group key={spot.id} position={spot.position}>
            <Html
              center
              distanceFactor={5.0}
              zIndexRange={[100, 0]}
              style={{
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'auto',
              }}
            >
              <div
                className="relative flex items-center justify-center cursor-pointer select-none"
                onMouseEnter={() => setHoveredId(spot.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(spot.id);
                  setCameraPreset(spot.preset);
                }}
              >
                {/* 1. MINIMALIST APPLE-STYLE INSPECTION PIN (when not hovered) */}
                {!isHovered && !isActive && (
                  <div className="relative flex items-center justify-center w-6 h-6">
                    {/* Soft glowing ambient ring */}
                    <span className="absolute w-4 h-4 rounded-full bg-cyan-400/25 animate-ping" />
                    {/* Glowing outer bezel */}
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    </span>
                  </div>
                )}

                {/* 2. EXPANDED DETAIL GLASS CARD (only when hovered or clicked) */}
                {(isHovered || isActive) && (
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-2 rounded-xl bg-zinc-950/95 border border-cyan-400/80 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.45)] whitespace-nowrap min-w-[180px] max-w-[240px]">
                      <div className="flex items-center gap-2 mb-1">
                        {spot.icon}
                        <h4 className="text-[11px] font-mono font-bold text-white tracking-wide">
                          {spot.label}
                        </h4>
                      </div>
                      <div className={`text-[10px] font-mono font-bold ${status.color}`}>
                        ● {status.label}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                        {sub}
                      </div>
                    </div>
                    {/* Anchor needle */}
                    <div className="w-[1px] h-3 bg-gradient-to-b from-cyan-400 to-transparent" />
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
