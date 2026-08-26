'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── 3D Corner Bracket Component for Tank Margins ─────────────────────────────
const CornerBracket = ({ pos, rot }: { pos: [number, number, number]; rot: [number, number, number] }) => (
  <group position={pos} rotation={rot}>
    <mesh>
      <boxGeometry args={[0.08, 0.008, 0.008]} />
      <meshBasicMaterial color="#06b6d4" />
    </mesh>
    <mesh position={[-0.036, 0.036, 0]}>
      <boxGeometry args={[0.008, 0.08, 0.008]} />
      <meshBasicMaterial color="#06b6d4" />
    </mesh>
    <mesh position={[-0.036, 0, 0.036]}>
      <boxGeometry args={[0.008, 0.008, 0.08]} />
      <meshBasicMaterial color="#06b6d4" />
    </mesh>
  </group>
);

// ─── Bounding Margin Box with Wireframe, Corner Accents & Info Tag ─────────────
interface TankMarginBoxProps {
  center: [number, number, number];
  size: [number, number, number];
  title: string;
  capacity: string;
  role: string;
  dimensions: string;
  color?: string;
  badgeBg?: string;
}

const TankMarginBox: React.FC<TankMarginBoxProps> = ({
  center,
  size,
  title,
  capacity,
  role,
  dimensions,
  color = '#06b6d4',
  badgeBg = 'rgba(6, 182, 212, 0.15)',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [w, h, d] = size;
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;

  return (
    <group ref={groupRef} position={center}>
      {/* 1. Volumetric Translucent Margin Box Envelope */}
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Precision Wireframe Margin Outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color={color} transparent opacity={0.65} linewidth={2} />
      </lineSegments>

      {/* 3. 8 Corner Visual Alignment Brackets */}
      <CornerBracket pos={[hw, hh, hd]} rot={[0, 0, 0]} />
      <CornerBracket pos={[-hw, hh, hd]} rot={[0, Math.PI / 2, 0]} />
      <CornerBracket pos={[-hw, -hh, hd]} rot={[Math.PI / 2, Math.PI / 2, 0]} />
      <CornerBracket pos={[hw, -hh, hd]} rot={[Math.PI / 2, 0, 0]} />
      <CornerBracket pos={[hw, hh, -hd]} rot={[0, -Math.PI / 2, 0]} />
      <CornerBracket pos={[-hw, hh, -hd]} rot={[0, Math.PI, 0]} />
      <CornerBracket pos={[-hw, -hh, -hd]} rot={[Math.PI / 2, Math.PI, 0]} />
      <CornerBracket pos={[hw, -hh, -hd]} rot={[Math.PI / 2, -Math.PI / 2, 0]} />

      {/* 4. Holographic Vessel Margin Specification Badge */}
      <Html
        position={[0, hh + 0.18, 0]}
        center
        distanceFactor={6.5}
        className="pointer-events-none select-none"
      >
        <div
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl border backdrop-blur-md whitespace-nowrap shadow-2xl transition-all"
          style={{
            borderColor: color,
            backgroundColor: badgeBg,
            boxShadow: `0 0 20px ${color}33`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono font-bold text-xs text-white uppercase tracking-wider">
              {title}
            </span>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase text-black"
              style={{ backgroundColor: color }}
            >
              {capacity}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-300">
            <span>{role}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-cyan-200 font-semibold">{dimensions}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// ─── Main TankMargins Manager Component ───────────────────────────────────────
export const TankMargins = () => {
  const { tanksOnly } = useSystemState();

  if (!tanksOnly) return null;

  return (
    <group>
      {/* 1. PRIMARY TANK (Clean Drinking Water Storage Reservoir) */}
      <TankMarginBox
        center={[-0.7, -0.55, 0]}
        size={[3.46, 2.36, 1.36]}
        title="Primary Tank"
        capacity="250 Liters"
        role="Clean Purified Storage"
        dimensions="3.40m × 2.30m × 1.30m"
        color="#06b6d4"
        badgeBg="rgba(6, 182, 212, 0.20)"
      />

      {/* 2. SECONDARY COMPARTMENT (Sensor Quality Testing Chamber) */}
      <TankMarginBox
        center={[0.45, 0.28, 0]}
        size={[1.16, 0.66, 1.26]}
        title="Secondary Compartment"
        capacity="35 Liters"
        role="Quality Analysis Chamber"
        dimensions="1.10m × 0.60m × 1.20m"
        color="#10b981"
        badgeBg="rgba(16, 185, 129, 0.20)"
      />

      {/* 3. SEDIMENTATION TANK (Primary Grit & Sand Settling Trap) */}
      <TankMarginBox
        center={[1.90, 0.05, 0]}
        size={[0.66, 1.56, 0.66]}
        title="Sedimentation Tank"
        capacity="45 Liters"
        role="Primary Settling Trap"
        dimensions="Ø 0.60m × 1.50m"
        color="#38bdf8"
        badgeBg="rgba(56, 189, 248, 0.20)"
      />

      {/* 4. RO FILTRATION TANK (4-Stage Drinking Water Purifier) */}
      <TankMarginBox
        center={[-1.40, 0.38, 0]}
        size={[0.96, 0.34, 0.34]}
        title="RO Filtration Tank"
        capacity="15 Liters"
        role="4-Stage Pure Purifier"
        dimensions="0.90m × Ø 0.28m"
        color="#f59e0b"
        badgeBg="rgba(245, 158, 11, 0.20)"
      />

      {/* 5. POST-FILTRATION TANK 2 (Sensor Suite #2 & Recirculation Diverter) */}
      <TankMarginBox
        center={[-1.85, 0.15, 0]}
        size={[0.72, 0.56, 0.62]}
        title="Tank 2 (Verification Chamber)"
        capacity="20 Liters"
        role="Post-RO Quality Verification"
        dimensions="0.68m × 0.52m × 0.58m"
        color="#a855f7"
        badgeBg="rgba(168, 85, 247, 0.20)"
      />
    </group>
  );
};
