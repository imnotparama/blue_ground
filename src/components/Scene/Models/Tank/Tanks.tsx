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
  } = useSystemState();

  const mainTankRef = useRef<THREE.Group>(null);
  const sedTankRef = useRef<THREE.Group>(null);

  const tankMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const sedMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [hoveredMain, setHoveredMain] = useState(false);
  const [hoveredSed, setHoveredSed] = useState(false);

  useFrame(() => {
    // Exploded View offset
    if (mainTankRef.current) {
      const targetY = exploded ? 0.15 : 0;
      mainTankRef.current.position.y = THREE.MathUtils.lerp(
        mainTankRef.current.position.y,
        -0.55 + targetY,
        0.08
      );

      const targetScale = hoveredMain ? 1.01 : 1.0;
      mainTankRef.current.scale.setScalar(
        THREE.MathUtils.lerp(mainTankRef.current.scale.x, targetScale, 0.12)
      );
    }

    if (sedTankRef.current) {
      const targetX = exploded ? 2.1 : 1.9;
      sedTankRef.current.position.x = THREE.MathUtils.lerp(sedTankRef.current.position.x, targetX, 0.08);

      const targetScale = hoveredSed ? 1.025 : 1.0;
      sedTankRef.current.scale.setScalar(
        THREE.MathUtils.lerp(sedTankRef.current.scale.x, targetScale, 0.12)
      );
    }

    // Material transparency
    const isXray = transparent || cutaway;
    const targetOpacity = isXray ? 0.08 : (activeHotspot !== null && activeHotspot !== 'primary_tank' && activeHotspot !== 'secondary_tank') ? 0.15 : 0.45;
    
    if (tankMatRef.current) {
      tankMatRef.current.opacity = THREE.MathUtils.lerp(tankMatRef.current.opacity, targetOpacity, 0.1);
    }
    if (sedMatRef.current) {
      sedMatRef.current.opacity = THREE.MathUtils.lerp(sedMatRef.current.opacity, isXray ? 0.08 : 0.50, 0.1);
    }
  });

  // Main Tank Dimensions
  const TW = 3.4;
  const TH = 2.3;
  const TD = 1.3;

  // Sedimentation Tank media layers (Primary Settling Trap)
  const sedLayers = [
    { height: 0.12, y: 0.40, color: '#94a3b8', roughness: 0.2, metalness: 0.9, name: 'Stainless Mesh Screen' },
    { height: 0.26, y: 0.21, color: '#64748b', roughness: 0.85, metalness: 0.1, name: 'Coarse Sedimentation Gravel' },
    { height: 0.30, y: -0.07, color: '#eab308', roughness: 0.9, metalness: 0.0, name: 'Graded Quartz Sand' },
    { height: 0.32, y: -0.38, color: '#18181b', roughness: 0.7, metalness: 0.3, name: 'Activated Carbon Bed' },
    { height: 0.14, y: -0.61, color: '#f8fafc', roughness: 0.5, metalness: 0.0, name: 'Fine Polishing Filter' },
  ];

  return (
    <group>
      {/* ════════════════════════════════════════════════════════════════════
          1. MAIN MONOLITHIC DUAL-COMPARTMENT TANK
             Center: [-0.7, -0.55, 0]
             Top-Right: Secondary Tank (Sensor Chamber)
             Lower 75%: Primary Tank (Clean Water Reservoir)
          ════════════════════════════════════════════════════════════════════ */}
      <group 
        ref={mainTankRef} 
        position={[-0.7, -0.55, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredMain(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredMain(false);
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

        {/* Industrial Extruded Aluminium Frame on all 12 Edges */}
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

        {/* HORIZONTAL COMPARTMENT DIVIDER (Secondary Top ↔ Primary Bottom) */}
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

        {/* ─── PHOTOREALISTIC HARDWARE & SCALE ETCHINGS ─── */}
        {/* 1. Laser-etched Metric Volume Graduation Marks on Front Acrylic Face */}
        <group position={[-TW / 2 + 0.35, 0, TD / 2 + 0.002]}>
          {[-0.95, -0.70, -0.45, -0.20, 0.05, 0.30].map((yTick, idx) => (
            <group key={idx} position={[0, yTick, 0]}>
              {/* Major tick bar */}
              <mesh position={[0.04, 0, 0]}>
                <boxGeometry args={[0.08, 0.004, 0.001]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Minor sub-ticks */}
              {idx < 5 && (
                <mesh position={[0.02, 0.125, 0]}>
                  <boxGeometry args={[0.04, 0.002, 0.001]} />
                  <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
                </mesh>
              )}
            </group>
          ))}
        </group>

        {/* 2. Stainless Steel Hex Bolts with Nylon Washers on Lid and Frame */}
        {[-TW / 2 + 0.1, -TW / 4, 0, TW / 4, TW / 2 - 0.1].map((bx, bIdx) => (
          <group key={`bolt-${bIdx}`}>
            {/* Top front rim hex bolts */}
            <mesh position={[bx, TH / 2 + 0.012, TD / 2]} rotation={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
            </mesh>
            {/* Bottom front rim hex bolts */}
            <mesh position={[bx, -TH / 2 - 0.012, TD / 2]} rotation={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.018, 6]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        ))}

        {/* 3. Translucent Silicone Gasket Seal Line along Divider Shelf */}
        <mesh position={[0.45, 0.545, 0]}>
          <boxGeometry args={[1.72, 0.008, TD - 0.02]} />
          <meshPhysicalMaterial color="#f0fdf4" transparent opacity={0.65} roughness={0.8} />
        </mesh>

        {/* 4. Heavy-Duty Rubber Vibration Dampener Feet with Leveling Studs */}
        {[-TW / 2 + 0.15, TW / 2 - 0.15].map((fx) =>
          [-TD / 2 + 0.15, TD / 2 - 0.15].map((fz) => (
            <group key={`foot-${fx}-${fz}`} position={[fx, -TH / 2 - 0.05, fz]}>
              {/* Stainless threaded leveling stud */}
              <mesh position={[0, 0.025, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.05, 12]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.95} />
              </mesh>
              {/* Rubber elastomer foot */}
              <mesh position={[0, -0.01, 0]} castShadow>
                <cylinderGeometry args={[0.065, 0.075, 0.03, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
              </mesh>
            </group>
          ))
        )}

        {/* Direct Passage Valve (Good quality water drop) */}
        <group position={[1.2, 0.55, 0]}>
          <mesh position={[0, -0.08, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
            <meshPhysicalMaterial color="#f0f9ff" transparent opacity={0.6} transmission={0.85} depthWrite={false} />
          </mesh>
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 0.07, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>

        {/* INLETS & OUTLETS */}
        {/* A. Secondary Compartment Inlet (from Sedimentation / Flow sensor) */}
        <PipeNozzle pos={[TW / 2, 0.85, 0]} rot={[0, 0, Math.PI / 2]} />

        {/* B. Primary Tank Clean Return Inlet (from RO Filtration Tank on left) */}
        <PipeNozzle pos={[-TW / 2 + 0.9, TH / 2, 0]} rot={[0, 0, 0]} />

        {/* C. Primary Tank Clean Water Outlet Tap (Bottom-Left) */}
        <PipeNozzle pos={[-TW / 2, -0.90, 0]} rot={[0, 0, -Math.PI / 2]} />

        {/* D. Release Tap / Drain for Cleaning (Bottom-Right) */}
        <PipeNozzle pos={[TW / 2, -0.95, 0]} rot={[0, 0, Math.PI / 2]} />

        {/* Base Support Pad */}
        <mesh position={[0, -TH / 2 - 0.015, 0]} receiveShadow castShadow>
          <boxGeometry args={[TW + 0.08, 0.03, TD + 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
        </mesh>
      </group>

      {/* ════════════════════════════════════════════════════════════════════
          2. SEDIMENTATION TANK (Primary Settling Filter between Borewell & Main Tank)
             Position: [1.9, 0.05, 0]
          ════════════════════════════════════════════════════════════════════ */}
      <group 
        ref={sedTankRef}
        position={[1.9, 0.05, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredSed(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredSed(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('sedimentation_tank');
          setCameraPreset('SEDIMENTATION_TANK');
        }}
      >
        {/* Transparent RO Housing Cylinder */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.20, 1.45, 24, 1, false]} />
          <meshPhysicalMaterial
            ref={sedMatRef}
            color="#0891b2"
            transparent
            opacity={0.50}
            roughness={0.06}
            metalness={0.08}
            transmission={0.85}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Filter Media Layers inside Sedimentation Tank */}
        {sedLayers.map((layer, idx) => {
          const isMesh = idx === 0;
          return (
            <mesh key={idx} position={[0, layer.y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.23, 0.18, layer.height, 20]} />
              <meshStandardMaterial
                color={layer.color}
                roughness={layer.roughness}
                metalness={layer.metalness}
                wireframe={isMesh}
                transparent={isMesh}
                opacity={isMesh ? 0.75 : 1}
              />
            </mesh>
          );
        })}

        {/* Top Housing Cap with Inlet from Borewell */}
        <group position={[0, 0.73, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.29, 0.29, 0.12, 24]} />
            <meshStandardMaterial color="#0369a1" roughness={0.35} metalness={0.6} />
          </mesh>
          {/* Inlet from Borewell on right */}
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Outlet to Flow sensor on left */}
          <mesh position={[-0.28, -0.43, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* Bottom Sump Stand */}
        <mesh position={[0, -0.73, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.12, 0.08, 20]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
