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

export const ExplodedLabels: React.FC = () => {
  const { exploded, setActiveHotspot, setCameraPreset } = useSystemState();

  if (!exploded) return null;

  // Exact 3D Positions aligned with the CAD subassembly explosion offsets
  const subassemblies: ExplodedSubassemblyLabel[] = [
    {
      id: 'solar',
      code: 'SUB-01',
      name: 'SOLAR CANOPY',
      sub: '56.8W PV Glass & Frame',
      position: [0.0, 1.05, -0.10],
      color: '#f59e0b',
      accent: 'border-amber-500/60 text-amber-300 bg-zinc-950/90',
    },
    {
      id: 'electronics',
      code: 'SUB-02',
      name: 'HERMETIC BRAIN',
      sub: 'ESP32-S3 • ADS1115 • Battery',
      position: [0.0, 0.58, 0.82],
      color: '#10b981',
      accent: 'border-emerald-500/60 text-emerald-300 bg-zinc-950/90',
    },
    {
      id: 'filters',
      code: 'SUB-03',
      name: '4-STAGE FILTER RACK',
      sub: 'CTO • RO • Minerals • Softener',
      position: [-0.10, -0.60, -1.07],
      color: '#06b6d4',
      accent: 'border-cyan-500/60 text-cyan-300 bg-zinc-950/90',
    },
    {
      id: 'sediment',
      code: 'SUB-04',
      name: 'WHITE SEDIMENT FILTER & INLET',
      sub: 'Raw Feed Valve • Gauge • 5µm PP',
      position: [1.35, -0.95, 0.25],
      color: '#d97706',
      accent: 'border-amber-600/60 text-amber-200 bg-zinc-950/90',
    },
    {
      id: 'clean_tank',
      code: 'SUB-05',
      name: 'CLEAN TANK & BASEMENT SKID',
      sub: 'Acrylic Reservoir & 6061 Alloy Skid',
      position: [-0.70, -1.75, 0.16],
      color: '#38bdf8',
      accent: 'border-sky-500/60 text-sky-300 bg-zinc-950/90',
    },
    {
      id: 'pump',
      code: 'SUB-06',
      name: 'BOOSTER PUMP P2',
      sub: '24V Diaphragm Station',
      position: [0.85, -1.10, -0.92],
      color: '#a855f7',
      accent: 'border-purple-500/60 text-purple-300 bg-zinc-950/90',
    },
  ];

  return (
    <group name="CAD_Exploded_Labels_Layer">
      {subassemblies.map((sub) => (
        <group key={sub.id} position={sub.position}>
          <Html
            center
            distanceFactor={4.8}
            className="pointer-events-none select-none"
          >
            <div className="flex flex-col items-center">
              <div className={`px-2.5 py-1.5 rounded-lg border backdrop-blur-md shadow-2xl flex flex-col items-center whitespace-nowrap ${sub.accent}`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sub.color }} />
                  <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-400">{sub.code}:</span>
                  <span className="text-[9px] font-mono font-bold text-white">{sub.name}</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-400 mt-0.5">{sub.sub}</span>
              </div>
              <div className="w-[1px] h-3 bg-gradient-to-b from-white/40 to-transparent" />
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};
