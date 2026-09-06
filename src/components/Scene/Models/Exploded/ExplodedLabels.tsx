'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useSystemState } from '@/hooks/useSystemState';

interface ExplodedSubassemblyLabel {
  id: string;
  name: string;
  code: string;
  sub: string;
  position: [number, number, number];
  color: string;
  accent: string;
}

export const ExplodedLabels = () => {
  const { exploded, setActiveHotspot, setCameraPreset } = useSystemState();

  if (!exploded) return null;

  const subassemblies: ExplodedSubassemblyLabel[] = [
    {
      id: 'solar',
      code: 'SUB-01',
      name: 'SOLAR PV ARRAY',
      sub: '100W Monocrystalline PV Deck (Separated)',
      position: [-2.10, 1.95, -0.45],
      color: '#f59e0b',
      accent: 'border-amber-500/60 text-amber-300 bg-amber-950/80',
    },
    {
      id: 'battery',
      code: 'SUB-02',
      name: 'POWER BANK & DC-DC',
      sub: '1S5P Li-ion + Dual Voltage Rails',
      position: [-2.35, 1.85, 0.60],
      color: '#0ea5e9',
      accent: 'border-sky-500/60 text-sky-300 bg-sky-950/80',
    },
    {
      id: 'esp32',
      code: 'SUB-03',
      name: 'ESP32 IOT CONTROLLER',
      sub: 'Dual-Core MCU & Telemetry Interface',
      position: [-0.40, 1.35, 1.50],
      color: '#10b981',
      accent: 'border-emerald-500/60 text-emerald-300 bg-emerald-950/80',
    },
    {
      id: 'filter_housing',
      code: 'SUB-04',
      name: '4-STAGE FILTER TRAIN',
      sub: 'PP Sediment / GAC / RO / CTO Cartridges',
      position: [0.0, 1.65, -1.90],
      color: '#06b6d4',
      accent: 'border-cyan-500/60 text-cyan-300 bg-cyan-950/80',
    },
    {
      id: 'sedimentation_tank',
      code: 'SUB-05',
      name: 'SEDIMENTATION PRE-FILTER',
      sub: 'Stratified Gravel, Sand & Carbon Bed',
      position: [2.85, 1.25, -0.30],
      color: '#d97706',
      accent: 'border-amber-600/60 text-amber-200 bg-amber-950/80',
    },
    {
      id: 'tank2_verification',
      code: 'SUB-06',
      name: 'VERIFICATION CHAMBER',
      sub: '50L Secondary Quality Cell (Setup 2)',
      position: [-2.45, 0.95, 1.25],
      color: '#8b5cf6',
      accent: 'border-purple-500/60 text-purple-300 bg-purple-950/80',
    },
    {
      id: 'primary_tank',
      code: 'SUB-07',
      name: 'POTABLE RESERVOIR',
      sub: '250L Potable Water Storage Tank',
      position: [0.0, 0.25, 0.0],
      color: '#3b82f6',
      accent: 'border-blue-500/60 text-blue-300 bg-blue-950/80',
    },
    {
      id: 'pump',
      code: 'SUB-08',
      name: 'BOOSTER PUMP',
      sub: '12V High-Head Diaphragm Motor',
      position: [2.15, 1.10, 1.05],
      color: '#ec4899',
      accent: 'border-pink-500/60 text-pink-300 bg-pink-950/80',
    },
  ];

  return (
    <group>
      {subassemblies.map((sub) => (
        <group key={sub.id} position={sub.position}>
          {/* Billboarded HTML Tag */}
          <Html center distanceFactor={7} zIndexRange={[100, 0]}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(sub.id);
                if (sub.id === 'solar') setCameraPreset('SOLAR');
                else if (sub.id === 'battery') setCameraPreset('BATTERY');
                else if (sub.id === 'esp32') setCameraPreset('ESP32');
                else if (sub.id === 'filter_housing') setCameraPreset('FILTER_VIEW');
                else if (sub.id === 'sedimentation_tank') setCameraPreset('SEDIMENTATION_TANK');
                else if (sub.id === 'tank2_verification') setCameraPreset('TANK2_VERIFICATION');
                else if (sub.id === 'pump') setCameraPreset('PUMP');
                else setCameraPreset('PRIMARY_TANK');
              }}
              className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border backdrop-blur-md shadow-2xl transition-all cursor-pointer select-none hover:scale-110 active:scale-95 ${sub.accent}`}
            >
              <div 
                className="w-2 h-2 rounded-full animate-ping" 
                style={{ backgroundColor: sub.color }} 
              />
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-bold tracking-widest text-white/50">{sub.code}</span>
                  <span className="text-[10px] font-mono font-extrabold tracking-wider text-white whitespace-nowrap">{sub.name}</span>
                </div>
                <span className="text-[8px] font-mono text-white/70 whitespace-nowrap">{sub.sub}</span>
              </div>
            </div>
          </Html>

          {/* Glowing Beacon Core in 3D */}
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial 
              color={sub.color} 
              emissive={sub.color} 
              emissiveIntensity={2.5} 
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
