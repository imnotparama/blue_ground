'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Shared sub-components ───────────────────────────────────────────────────
// A single aluminium extrusion corner post
const CornerPost = ({ x, z }: { x: number; z: number }) => (
  <mesh position={[x, 0, z]} castShadow>
    <boxGeometry args={[0.03, 2.05, 0.03]} />
    <meshStandardMaterial color="#374151" roughness={0.35} metalness={0.85} />
  </mesh>
);

// Top / bottom frame rails
const FrameRail = ({ y, w, d }: { y: number; w: number; d: number }) => (
  <mesh position={[0, y, 0]} castShadow>
    <boxGeometry args={[w + 0.04, 0.03, d + 0.04]} />
    <meshStandardMaterial color="#374151" roughness={0.35} metalness={0.85} />
  </mesh>
);

// Pipe connection nozzle welded on a tank wall
const PipeNozzle = ({
  pos,
  rot = [0, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
}) => (
  <group position={pos} rotation={rot}>
    {/* Collar */}
    <mesh castShadow>
      <cylinderGeometry args={[0.04, 0.04, 0.05, 10]} />
      <meshStandardMaterial color="#4b5563" roughness={0.25} metalness={0.9} />
    </mesh>
    {/* Short stub */}
    <mesh position={[0, 0.04, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.025, 0.06, 10]} />
      <meshStandardMaterial color="#374151" roughness={0.2} metalness={0.9} />
    </mesh>
  </group>
);

// ─── Reusable glass tank wall ─────────────────────────────────────────────────
interface GlassTankProps {
  w: number;
  h: number;
  d: number;
  matRef?: React.Ref<THREE.MeshPhysicalMaterial>;
  color?: string;
  opacity?: number;
}
const GlassTank: React.FC<GlassTankProps> = ({
  w, h, d, matRef, color = '#083344', opacity = 0.42,
}) => (
  <mesh castShadow receiveShadow>
    <boxGeometry args={[w, h, d]} />
    <meshPhysicalMaterial
      ref={matRef}
      color={color}
      transparent
      opacity={opacity}
      roughness={0.04}
      metalness={0.08}
      transmission={0.88}
      thickness={0.06}
      clearcoat={1.0}
      clearcoatRoughness={0.01}
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  </mesh>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Tanks = () => {
  const {
    transparent, cutaway, exploded, activeHotspot,
    setActiveHotspot, setCameraPreset,
  } = useSystemState();

  // Group refs for exploded animation
  const primaryRef   = useRef<THREE.Group>(null);
  const sedRef       = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);

  // Material refs for glass opacity animation
  const primaryMatRef   = useRef<THREE.MeshPhysicalMaterial>(null);
  const sedMatRef       = useRef<THREE.MeshPhysicalMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [hoveredPrimary,   setHoveredPrimary]   = useState(false);
  const [hoveredSed,       setHoveredSed]       = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  useFrame((_state, _delta) => {
    // Exploded offsets
    if (primaryRef.current) {
      primaryRef.current.position.x = THREE.MathUtils.lerp(
        primaryRef.current.position.x, exploded ? -0.4 : 0, 0.08,
      );
    }
    if (sedRef.current) {
      sedRef.current.position.y = THREE.MathUtils.lerp(
        sedRef.current.position.y, exploded ? 0.3 : 0, 0.08,
      );
    }
    if (secondaryRef.current) {
      secondaryRef.current.position.x = THREE.MathUtils.lerp(
        secondaryRef.current.position.x, exploded ? 0.4 : 0, 0.08,
      );
    }

    // Glass opacity reactions
    const xrayActive = transparent || cutaway;
    const calcOpacity = (hotspotId: string, base = 0.42) => {
      if (xrayActive) return 0.06;
      if (activeHotspot !== null && activeHotspot !== hotspotId) return 0.06;
      return base;
    };

    if (primaryMatRef.current) {
      primaryMatRef.current.opacity = THREE.MathUtils.lerp(
        primaryMatRef.current.opacity, calcOpacity('primary_tank'), 0.1,
      );
    }
    if (sedMatRef.current) {
      sedMatRef.current.opacity = THREE.MathUtils.lerp(
        sedMatRef.current.opacity, calcOpacity('sedimentation_tank', 0.35), 0.1,
      );
    }
    if (secondaryMatRef.current) {
      secondaryMatRef.current.opacity = THREE.MathUtils.lerp(
        secondaryMatRef.current.opacity, calcOpacity('secondary_tank', 0.38), 0.1,
      );
    }

    // Hover scale
    const scaleGroup = (
      ref: React.RefObject<THREE.Group | null>,
      hovered: boolean,
    ) => {
      if (ref.current) {
        const t = hovered ? 1.02 : 1.0;
        ref.current.scale.setScalar(
          THREE.MathUtils.lerp(ref.current.scale.x, t, 0.12),
        );
      }
    };
    scaleGroup(primaryRef,   hoveredPrimary);
    scaleGroup(sedRef,       hoveredSed);
    scaleGroup(secondaryRef, hoveredSecondary);
  });

  // ── Click / hover handlers ───────────────────────────────────────────────
  const makeHandlers = (
    id: string,
    preset: 'PRIMARY_TANK' | 'SECONDARY_TANK' | 'SEDIMENTATION_TANK',
    setHovered: (v: boolean) => void,
  ) => ({
    onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer'; },
    onPointerOut:  ()       => { setHovered(false); document.body.style.cursor = 'default'; },
    onClick:       (e: any) => { e.stopPropagation(); setActiveHotspot(id); setCameraPreset(preset); },
  });

  const primaryHandlers   = makeHandlers('primary_tank',       'PRIMARY_TANK',       setHoveredPrimary);
  const sedHandlers       = makeHandlers('sedimentation_tank', 'SEDIMENTATION_TANK', setHoveredSed);
  const secondaryHandlers = makeHandlers('secondary_tank',     'SECONDARY_TANK',     setHoveredSecondary);

  // Tank dimensions
  const PW = 2.4; const PH = 2.1; const PD = 1.5; // Primary
  const SdR = 0.30; const SdH = 1.7;               // Sedimentation radius & height
  const SeW = 1.1; const SeH = 1.6; const SeD = 1.0; // Secondary

  return (
    <group>

      {/* ═══════════════════════════════════════════════════════════════════
          1. PRIMARY TANK — large clean-water storage, leftmost
             World position inside scene group: [-2.0, -0.55, 0]
          ═══════════════════════════════════════════════════════════════════ */}
      <group
        ref={primaryRef}
        position={[-2.0, -0.55, 0]}
        {...primaryHandlers}
      >
        {/* Glass outer walls */}
        <GlassTank w={PW} h={PH} d={PD} matRef={primaryMatRef} />

        {/* Metal extrusion frame corners */}
        {([-PW/2, PW/2] as number[]).map(x =>
          ([-PD/2, PD/2] as number[]).map(z => (
            <CornerPost key={`${x}-${z}`} x={x} z={z} />
          ))
        )}
        <FrameRail y={ PH/2} w={PW} d={PD} />
        <FrameRail y={-PH/2} w={PW} d={PD} />

        {/* Horizontal divider shelf (sensor compartment above ↔ clean water below) */}
        {/* Clean compartment = lower 65 %, Sensor compartment = upper 35 % */}
        <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
          <boxGeometry args={[PW - 0.04, 0.025, PD - 0.04]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.28}
            transmission={0.9}
            roughness={0.08}
            depthWrite={false}
          />
        </mesh>

        {/* Label strip on divider edge */}
        <mesh position={[PW/2 - 0.001, 0.28, 0]}>
          <boxGeometry args={[0.002, 0.022, PD - 0.06]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
        </mesh>

        {/* Bypass check-valve tube (connects sensor chamber → clean chamber) */}
        <mesh position={[0.6, -0.1, 0.3]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.72, 10]} />
          <meshPhysicalMaterial
            color="#f0f9ff" transparent opacity={0.55}
            transmission={0.85} roughness={0.1} depthWrite={false}
          />
        </mesh>
        {/* Solenoid valve body on bypass */}
        <mesh position={[0.6, -0.1, 0.3]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.07, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Outlet pipe nozzle — clean water exits left wall bottom */}
        <PipeNozzle pos={[-PW/2, -0.55, 0]} rot={[0, 0, -Math.PI/2]} />

        {/* Inlet nozzle — filtered water enters right wall mid */}
        <PipeNozzle pos={[PW/2, -0.2, 0]} rot={[0, 0, Math.PI/2]} />

        {/* Warning label sticker */}
        <mesh position={[PW/2 - 0.001, -0.7, 0]}>
          <boxGeometry args={[0.002, 0.12, 0.22]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>

        {/* LABEL: CLEAN WATER STORAGE */}
        <mesh position={[0, -PH/2 - 0.04, 0]}>
          <boxGeometry args={[PW * 0.6, 0.03, PD * 0.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════
          2. SEDIMENTATION / FILTER TANK — cylindrical, center
             World position: [0.5, -0.5, 0]
          ═══════════════════════════════════════════════════════════════════ */}
      <group
        ref={sedRef}
        position={[0.5, -0.5, 0]}
        {...sedHandlers}
      >
        {/* Outer transparent acrylic cylinder */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[SdR, SdR, SdH, 24, 1, false]} />
          <meshPhysicalMaterial
            ref={sedMatRef}
            color="#0e7490"
            transparent
            opacity={0.35}
            roughness={0.06}
            metalness={0.05}
            transmission={0.85}
            thickness={0.04}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Top metal cap with inlet port */}
        <mesh position={[0, SdH/2 + 0.02, 0]} castShadow>
          <cylinderGeometry args={[SdR + 0.02, SdR + 0.02, 0.04, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Inlet nozzle on top cap */}
        <PipeNozzle pos={[0, SdH/2 + 0.07, 0]} rot={[0, 0, 0]} />

        {/* Bottom funnel outlet */}
        <mesh position={[0, -SdH/2 - 0.04, 0]} castShadow>
          <cylinderGeometry args={[SdR + 0.02, 0.04, 0.08, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Outlet stub going down */}
        <PipeNozzle pos={[0, -SdH/2 - 0.12, 0]} rot={[0, 0, 0]} />

        {/* Metal banding rings */}
        {([-0.55, 0, 0.55] as number[]).map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <torusGeometry args={[SdR + 0.02, 0.012, 8, 24]} />
            <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.85} />
          </mesh>
        ))}

        {/* LABEL: SEDIMENTATION */}
        <mesh position={[SdR + 0.015, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[0.28, 0.06, 0.003]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.9} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════
          3. SECONDARY TANK — raw water intake, rightmost
             World position: [2.4, -0.5, 0]
          ═══════════════════════════════════════════════════════════════════ */}
      <group
        ref={secondaryRef}
        position={[2.4, -0.5, 0]}
        {...secondaryHandlers}
      >
        {/* Glass walls — slightly brownish tint to hint at raw/dirty water */}
        <GlassTank
          w={SeW} h={SeH} d={SeD}
          matRef={secondaryMatRef}
          color="#134e4a"
          opacity={0.38}
        />

        {/* Metal corners */}
        {([-SeW/2, SeW/2] as number[]).map(x =>
          ([-SeD/2, SeD/2] as number[]).map(z => (
            <CornerPost key={`${x}-${z}`} x={x} z={z} />
          ))
        )}
        <FrameRail y={ SeH/2} w={SeW} d={SeD} />
        <FrameRail y={-SeH/2} w={SeW} d={SeD} />

        {/* Inlet nozzle — raw water enters right wall at top */}
        <PipeNozzle pos={[SeW/2, SeH/2 - 0.2, 0]} rot={[0, 0, Math.PI/2]} />

        {/* Outlet nozzle — pump draws from left wall bottom */}
        <PipeNozzle pos={[-SeW/2, -SeH/2 + 0.15, 0]} rot={[0, 0, -Math.PI/2]} />

        {/* Pump mount bracket at bottom */}
        <mesh position={[0, -SeH/2 + 0.08, 0]} castShadow>
          <boxGeometry args={[SeW - 0.1, 0.02, SeD - 0.1]} />
          <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Water level indicator stripe on front face */}
        <mesh position={[0, 0, SeD/2 - 0.001]}>
          <boxGeometry args={[0.018, SeH - 0.1, 0.003]} />
          <meshStandardMaterial color="#22d3ee" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* LABEL: RAW WATER INTAKE */}
        <mesh position={[0, -SeH/2 - 0.04, 0]}>
          <boxGeometry args={[SeW * 0.7, 0.03, SeD * 0.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

    </group>
  );
};
