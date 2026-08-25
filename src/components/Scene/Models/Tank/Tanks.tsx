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
      <cylinderGeometry args={[0.045, 0.045, 0.05, 12]} />
      <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
    </mesh>
    <mesh position={[0, 0.04, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
      <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
    </mesh>
  </group>
);

// ─── Main Tanks Component ─────────────────────────────────────────────────────
export const Tanks = () => {
  const {
    transparent,
    cutaway,
    exploded,
    activeHotspot,
    setActiveHotspot,
    setCameraPreset,
  } = useSystemState();

  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);

  const primaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);

  useFrame(() => {
    // Exploded view animation
    if (primaryRef.current) {
      primaryRef.current.position.x = THREE.MathUtils.lerp(
        primaryRef.current.position.x,
        exploded ? -2.4 : -2.0,
        0.08
      );
    }
    if (secondaryRef.current) {
      secondaryRef.current.position.x = THREE.MathUtils.lerp(
        secondaryRef.current.position.x,
        exploded ? 2.4 : 2.1,
        0.08
      );
    }

    // Material transparency reactions
    const isXray = transparent || cutaway;
    const getOpac = (id: string, base: number) => {
      if (isXray) return 0.08;
      if (activeHotspot !== null && activeHotspot !== id) return 0.12;
      return base;
    };

    if (primaryMatRef.current) {
      primaryMatRef.current.opacity = THREE.MathUtils.lerp(
        primaryMatRef.current.opacity,
        getOpac('primary_tank', 0.52),
        0.1
      );
    }
    if (secondaryMatRef.current) {
      secondaryMatRef.current.opacity = THREE.MathUtils.lerp(
        secondaryMatRef.current.opacity,
        getOpac('secondary_tank', 0.48),
        0.1
      );
    }

    // Hover scale
    if (primaryRef.current) {
      primaryRef.current.scale.setScalar(
        THREE.MathUtils.lerp(primaryRef.current.scale.x, hoverPrimary ? 1.015 : 1.0, 0.12)
      );
    }
    if (secondaryRef.current) {
      secondaryRef.current.scale.setScalar(
        THREE.MathUtils.lerp(secondaryRef.current.scale.x, hoverSecondary ? 1.02 : 1.0, 0.12)
      );
    }
  });

  // Primary Tank dimensions
  const PW = 2.0;
  const PH = 1.9;
  const PD = 1.2;

  // Secondary Tank dimensions
  const SW = 1.1;
  const SH = 1.45;
  const SD = 0.9;

  return (
    <group>
      {/* ════════════════════════════════════════════════════════════════════
          1. PRIMARY CLEAN STORAGE TANK (Leftmost)
             Center: [-2.0, -0.75, 0]
             Bottom: y = -1.70, Top: y = +0.20
          ════════════════════════════════════════════════════════════════════ */}
      <group
        ref={primaryRef}
        position={[-2.0, -0.75, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoverPrimary(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoverPrimary(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('primary_tank');
          setCameraPreset('PRIMARY_TANK');
        }}
      >
        {/* Crystal Acrylic Main Tank Shell */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[PW, PH, PD]} />
          <meshPhysicalMaterial
            ref={primaryMatRef}
            color="#083344"
            transparent
            opacity={0.52}
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

        {/* Industrial Extruded Aluminium Frame on all 12 Edges */}
        {/* 4 Vertical Corners */}
        {[-PW / 2, PW / 2].map((x) =>
          [-PD / 2, PD / 2].map((z) => (
            <FrameCorner key={`c-${x}-${z}`} x={x} y={0} z={z} h={PH + 0.02} />
          ))
        )}
        {/* Top & Bottom Horizontal Frame Rims */}
        {[-PH / 2, PH / 2].map((y) => (
          <group key={`rim-${y}`}>
            <FrameBar pos={[0, y, -PD / 2]} size={[PW + 0.035, 0.035, 0.035]} />
            <FrameBar pos={[0, y, PD / 2]} size={[PW + 0.035, 0.035, 0.035]} />
            <FrameBar pos={[-PW / 2, y, 0]} size={[0.035, 0.035, PD - 0.035]} />
            <FrameBar pos={[PW / 2, y, 0]} size={[0.035, 0.035, PD - 0.035]} />
          </group>
        ))}

        {/* HORIZONTAL COMPARTMENT DIVIDER (Upper Sensor Chamber ↔ Lower Clean Storage) */}
        {/* At local y = 0.20 (divides top 35% chamber for sensor analysis and bottom 65% clean water) */}
        <mesh position={[0, 0.20, 0]} receiveShadow castShadow>
          <boxGeometry args={[PW - 0.04, 0.025, PD - 0.04]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            transmission={0.9}
            roughness={0.06}
            depthWrite={false}
          />
        </mesh>

        {/* Cyan Glowing Sensor Divider Status Edge */}
        <mesh position={[PW / 2 - 0.001, 0.20, 0]}>
          <boxGeometry args={[0.004, 0.02, PD - 0.06]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
        </mesh>

        {/* Vertical Internal Bypass / Overflow Check Valve Tube */}
        <mesh position={[0.55, -0.20, 0.35]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.76, 12]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.6}
            transmission={0.88}
            roughness={0.08}
            depthWrite={false}
          />
        </mesh>
        {/* Solenoid bypass valve block */}
        <mesh position={[0.55, -0.20, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.036, 0.036, 0.07, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Clean Water Outlet Nozzle (Left Wall, Bottom) */}
        <PipeNozzle pos={[-PW / 2, -0.60, 0]} rot={[0, 0, -Math.PI / 2]} />

        {/* Filtered Water Inlet Nozzle (Right Wall, Upper Chamber) */}
        <PipeNozzle pos={[PW / 2, 0.20, 0]} rot={[0, 0, Math.PI / 2]} />

        {/* Base Pad Plate */}
        <mesh position={[0, -PH / 2 - 0.015, 0]} receiveShadow castShadow>
          <boxGeometry args={[PW + 0.06, 0.03, PD + 0.06]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Tank Front Identification Plate */}
        <mesh position={[0, -PH / 2 + 0.12, PD / 2 + 0.002]}>
          <boxGeometry args={[0.7, 0.12, 0.005]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>

      {/* ════════════════════════════════════════════════════════════════════
          2. SECONDARY RAW WATER INTAKE TANK (Rightmost)
             Center: [2.1, -1.0, 0]
             Bottom: y = -1.725, Top: y = -0.275
          ════════════════════════════════════════════════════════════════════ */}
      <group
        ref={secondaryRef}
        position={[2.1, -1.0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoverSecondary(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoverSecondary(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('secondary_tank');
          setCameraPreset('SECONDARY_TANK');
        }}
      >
        {/* Raw Water Tinted Acrylic Tank Shell */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[SW, SH, SD]} />
          <meshPhysicalMaterial
            ref={secondaryMatRef}
            color="#134e4a"
            transparent
            opacity={0.48}
            roughness={0.06}
            metalness={0.06}
            transmission={0.82}
            thickness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Aluminium Extrusion Corner Framing */}
        {[-SW / 2, SW / 2].map((x) =>
          [-SD / 2, SD / 2].map((z) => (
            <FrameCorner key={`sc-${x}-${z}`} x={x} y={0} z={z} h={SH + 0.02} />
          ))
        )}
        {[-SH / 2, SH / 2].map((y) => (
          <group key={`srim-${y}`}>
            <FrameBar pos={[0, y, -SD / 2]} size={[SW + 0.035, 0.035, 0.035]} />
            <FrameBar pos={[0, y, SD / 2]} size={[SW + 0.035, 0.035, 0.035]} />
            <FrameBar pos={[-SW / 2, y, 0]} size={[0.035, 0.035, SD - 0.035]} />
            <FrameBar pos={[SW / 2, y, 0]} size={[0.035, 0.035, SD - 0.035]} />
          </group>
        ))}

        {/* Raw Water Inlet Nozzle (Top-Right Wall from Borewell) */}
        <PipeNozzle pos={[SW / 2, SH / 2 - 0.15, 0]} rot={[0, 0, Math.PI / 2]} />

        {/* Pump Intake Outlet Nozzle (Bottom-Left Wall to Water Pump) */}
        <PipeNozzle pos={[-SW / 2, -SH / 2 + 0.12, 0]} rot={[0, 0, -Math.PI / 2]} />

        {/* Front Water Level Visual Scale Bar */}
        <mesh position={[0, 0, SD / 2 + 0.002]}>
          <boxGeometry args={[0.018, SH - 0.12, 0.004]} />
          <meshStandardMaterial color="#22d3ee" roughness={0.4} />
        </mesh>

        {/* Base Pad Plate */}
        <mesh position={[0, -SH / 2 - 0.015, 0]} receiveShadow castShadow>
          <boxGeometry args={[SW + 0.06, 0.03, SD + 0.06]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Tank Front Identification Plate */}
        <mesh position={[0, -SH / 2 + 0.12, SD / 2 + 0.002]}>
          <boxGeometry args={[0.5, 0.1, 0.005]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
