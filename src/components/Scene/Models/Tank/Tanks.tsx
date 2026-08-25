'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Reusable Frame Elements ──────────────────────────────────────────────────
const FrameCorner = ({ x, y, z, h }: { x: number; y: number; z: number; h: number }) => (
  <mesh position={[x, y, z]} castShadow>
    <boxGeometry args={[0.035, h, 0.035]} />
    <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
  </mesh>
);

const FrameBar = ({
  pos,
  size,
}: {
  pos: [number, number, number];
  size: [number, number, number];
}) => (
  <mesh position={pos} castShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
  </mesh>
);

const PipeNozzle = ({
  pos,
  rot = [0, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
}) => (
  <group position={pos} rotation={rot}>
    <mesh castShadow>
      <cylinderGeometry args={[0.042, 0.042, 0.04, 12]} />
      <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
    </mesh>
    <mesh position={[0, 0.035, 0]} castShadow>
      <cylinderGeometry args={[0.028, 0.028, 0.05, 12]} />
      <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
    </mesh>
  </group>
);

export const Tanks = () => {
  const {
    transparent,
    cutaway,
    exploded,
    activeHotspot,
    setActiveHotspot,
    setCameraPreset,
    mode,
  } = useSystemState();

  const mainTankRef = useRef<THREE.Group>(null);
  const tankMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    // Exploded View offset
    if (mainTankRef.current) {
      const targetY = exploded ? 0.15 : 0;
      mainTankRef.current.position.y = THREE.MathUtils.lerp(
        mainTankRef.current.position.y,
        -0.55 + targetY,
        0.08
      );

      const targetScale = hovered ? 1.01 : 1.0;
      mainTankRef.current.scale.setScalar(
        THREE.MathUtils.lerp(mainTankRef.current.scale.x, targetScale, 0.12)
      );
    }

    // Material transparency
    const isXray = transparent || cutaway;
    const targetOpacity = isXray ? 0.08 : (activeHotspot !== null && activeHotspot !== 'primary_tank' && activeHotspot !== 'secondary_tank') ? 0.15 : 0.45;
    
    if (tankMatRef.current) {
      tankMatRef.current.opacity = THREE.MathUtils.lerp(tankMatRef.current.opacity, targetOpacity, 0.1);
    }
  });

  // Main Tank Dimensions matching the sketch
  // Width: 3.4 (x from -2.4 to 1.0, center = -0.7)
  // Height: 2.3 (y from -1.7 to 0.6, center = -0.55)
  // Depth: 1.3 (z from -0.65 to 0.65)
  const TW = 3.4;
  const TH = 2.3;
  const TD = 1.3;

  // Secondary Compartment (top right section)
  // Divider at y = 0.05 (local y = 0.60 above floor)
  // Secondary compartment width = 1.6 (x from -0.6 to 1.0)

  return (
    <group 
      ref={mainTankRef} 
      position={[-0.7, -0.55, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        setActiveHotspot('primary_tank');
        setCameraPreset('PRIMARY_TANK');
      }}
    >
      {/* 1. CRYSTAL ACRYLIC MAIN TANK ENCLOSURE */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[TW, TH, TD]} />
        <meshPhysicalMaterial
          ref={tankMatRef}
          color="#083344"
          transparent
          opacity={0.45}
          roughness={0.04}
          metalness={0.08}
          transmission={0.88}
          thickness={0.06}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. INDUSTRIAL EXTRUDED ALUMINIUM FRAME ON ALL 12 EDGES */}
      {[-TW / 2, TW / 2].map((x) =>
        [-TD / 2, TD / 2].map((z) => (
          <FrameCorner key={`c-${x}-${z}`} x={x} y={0} z={z} h={TH + 0.02} />
        ))
      )}
      {[-TH / 2, TH / 2].map((y) => (
        <group key={`rim-${y}`}>
          <FrameBar pos={[0, y, -TD / 2]} size={[TW + 0.035, 0.035, 0.035]} />
          <FrameBar pos={[0, y, TD / 2]} size={[TW + 0.035, 0.035, 0.035]} />
          <FrameBar pos={[-TW / 2, y, 0]} size={[0.035, 0.035, TD - 0.035]} />
          <FrameBar pos={[TW / 2, y, 0]} size={[0.035, 0.035, TD - 0.035]} />
        </group>
      ))}

      {/* 3. HORIZONTAL COMPARTMENT DIVIDER (Shelf dividing Secondary Top & Primary Bottom) */}
      {/* Positioned at local y = 0.55 (world y = 0.0), spanning right side: x from -0.1 to TW/2 */}
      <mesh position={[0.45, 0.55, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.7, 0.025, TD - 0.04]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transparent
          opacity={0.4}
          transmission={0.9}
          roughness={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Divider Cyan Glowing Front Edge */}
      <mesh position={[0.45, 0.55, TD / 2 - 0.001]}>
        <boxGeometry args={[1.7, 0.02, 0.004]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
      </mesh>

      {/* Vertical Partition Wall for Secondary Compartment Left Edge */}
      <mesh position={[-0.40, 0.85, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.025, 0.60, TD - 0.04]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transparent
          opacity={0.4}
          transmission={0.9}
          roughness={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* 4. PASSAGE VALVE (Direct flow from Secondary Compartment to Primary Tank when quality is good) */}
      <group position={[1.2, 0.55, 0]}>
        {/* Hole & Sleeve */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.6}
            transmission={0.85}
            roughness={0.08}
            depthWrite={false}
          />
        </mesh>
        {/* Solenoid Gate Valve on the drop */}
        <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.07, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* 5. INLETS & OUTLETS ON TANK WALLS */}
      {/* A. Secondary Compartment Inlet (Top-Right Wall at x = TW/2, y = 0.85) */}
      <PipeNozzle pos={[TW / 2, 0.85, 0]} rot={[0, 0, Math.PI / 2]} />

      {/* B. Primary Tank Clean Water Outlet (Bottom-Left Wall at x = -TW/2, y = -0.90) */}
      <PipeNozzle pos={[-TW / 2, -0.90, 0]} rot={[0, 0, -Math.PI / 2]} />

      {/* C. Release Tap / Drain for Cleaning (Bottom-Right Wall at x = TW/2, y = -0.95) */}
      <PipeNozzle pos={[TW / 2, -0.95, 0]} rot={[0, 0, Math.PI / 2]} />

      {/* 6. BASE SUPPORT PAD */}
      <mesh position={[0, -TH / 2 - 0.015, 0]} receiveShadow castShadow>
        <boxGeometry args={[TW + 0.08, 0.03, TD + 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* 7. FRONT LABELS AS DRAWN ON SKETCH */}
      {/* Primary Tank Label */}
      <mesh position={[-0.4, -0.7, TD / 2 + 0.002]}>
        <boxGeometry args={[0.9, 0.12, 0.005]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Secondary Tank Label */}
      <mesh position={[0.5, 0.75, TD / 2 + 0.002]}>
        <boxGeometry args={[0.8, 0.10, 0.005]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
    </group>
  );
};
