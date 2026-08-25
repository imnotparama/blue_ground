'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────────────────────
   COORDINATE MAP  (all group-local coords, inside scene group [0, -0.2, 0])

   Platform top ≈ y = -1.95
   All tank BOTTOMS target = y = -1.75  (0.20 above platform, frame clearance)

   PRIMARY TANK   center = [-2.2, -0.75, 0]  W=2.0 H=2.0 D=1.3
     → bottom -1.75  top +0.25

   SEDIMENTATION  center = [0.3, -1.0, 0]   R=0.28 H=1.5
     → bottom -1.75  top -0.25

   SECONDARY TANK center = [2.2, -1.0, 0]   W=1.0 H=1.5 D=0.9
     → bottom -1.75  top -0.25
────────────────────────────────────────────────────────────────────────────── */

// ─── Reusable pieces ─────────────────────────────────────────────────────────
const CornerPost = ({ x, h, z }: { x: number; h: number; z: number }) => (
  <mesh position={[x, 0, z]} castShadow>
    <boxGeometry args={[0.035, h + 0.04, 0.035]} />
    <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.9} />
  </mesh>
);

const FrameRail = ({ y, w, d }: { y: number; w: number; d: number }) => (
  <mesh position={[0, y, 0]} castShadow>
    <boxGeometry args={[w + 0.04, 0.04, d + 0.04]} />
    <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.9} />
  </mesh>
);

const PipeNozzle = ({
  pos, rot = [0, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
}) => (
  <group position={pos} rotation={rot}>
    <mesh castShadow>
      <cylinderGeometry args={[0.042, 0.042, 0.05, 10]} />
      <meshStandardMaterial color="#4b5563" roughness={0.2} metalness={0.95} />
    </mesh>
    <mesh position={[0, 0.045, 0]} castShadow>
      <cylinderGeometry args={[0.028, 0.028, 0.07, 10]} />
      <meshStandardMaterial color="#374151" roughness={0.2} metalness={0.95} />
    </mesh>
  </group>
);

const GlassWall = ({
  w, h, d, matRef, color = '#0c4a6e', opacity = 0.60,
}: {
  w: number; h: number; d: number;
  matRef?: React.Ref<THREE.MeshPhysicalMaterial>;
  color?: string; opacity?: number;
}) => (
  <mesh castShadow receiveShadow>
    <boxGeometry args={[w, h, d]} />
    <meshPhysicalMaterial
      ref={matRef}
      color={color}
      transparent opacity={opacity}
      roughness={0.04} metalness={0.06}
      transmission={0.75} thickness={0.07}
      clearcoat={1.0} clearcoatRoughness={0.01}
      depthWrite={false} side={THREE.DoubleSide}
    />
  </mesh>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Tanks = () => {
  const {
    transparent, cutaway, exploded, activeHotspot,
    setActiveHotspot, setCameraPreset,
  } = useSystemState();

  const primaryRef   = useRef<THREE.Group>(null);
  const sedRef       = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);

  const primaryMatRef   = useRef<THREE.MeshPhysicalMaterial>(null);
  const sedMatRef       = useRef<THREE.MeshPhysicalMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [hovP, setHovP] = useState(false);
  const [hovS, setHovS] = useState(false);
  const [hovT, setHovT] = useState(false);

  useFrame(() => {
    // Exploded offsets
    if (primaryRef.current) {
      primaryRef.current.position.x = THREE.MathUtils.lerp(primaryRef.current.position.x, exploded ? -0.5 : 0, 0.08);
    }
    if (sedRef.current) {
      sedRef.current.position.y = THREE.MathUtils.lerp(sedRef.current.position.y, exploded ? 0.25 : 0, 0.08);
    }
    if (secondaryRef.current) {
      secondaryRef.current.position.x = THREE.MathUtils.lerp(secondaryRef.current.position.x, exploded ? 0.5 : 0, 0.08);
    }

    // Glass opacity
    const xray = transparent || cutaway;
    const opac = (id: string, base: number) => {
      if (xray) return 0.08;
      if (activeHotspot !== null && activeHotspot !== id) return 0.08;
      return base;
    };
    if (primaryMatRef.current)
      primaryMatRef.current.opacity = THREE.MathUtils.lerp(primaryMatRef.current.opacity, opac('primary_tank', 0.60), 0.1);
    if (sedMatRef.current)
      sedMatRef.current.opacity = THREE.MathUtils.lerp(sedMatRef.current.opacity, opac('sedimentation_tank', 0.42), 0.1);
    if (secondaryMatRef.current)
      secondaryMatRef.current.opacity = THREE.MathUtils.lerp(secondaryMatRef.current.opacity, opac('secondary_tank', 0.55), 0.1);

    // Hover scale
    ([
      [primaryRef, hovP], [sedRef, hovS], [secondaryRef, hovT],
    ] as [React.RefObject<THREE.Group | null>, boolean][]).forEach(([ref, hov]) => {
      if (ref.current) {
        ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, hov ? 1.02 : 1.0, 0.12));
      }
    });
  });

  const mk = (
    id: string,
    preset: 'PRIMARY_TANK' | 'SECONDARY_TANK' | 'SEDIMENTATION_TANK',
    setHov: (v: boolean) => void,
  ) => ({
    onPointerOver: (e: any) => { e.stopPropagation(); setHov(true);  document.body.style.cursor = 'pointer'; },
    onPointerOut:  ()       => { setHov(false); document.body.style.cursor = 'default'; },
    onClick:       (e: any) => { e.stopPropagation(); setActiveHotspot(id); setCameraPreset(preset); },
  });

  // Dimensions
  const PW=2.0, PH=2.0, PD=1.3;    // Primary
  const SR=0.29, SH=1.5;            // Sedimentation
  const TW=1.0,  TH=1.5, TD=0.9;   // Secondary (raw)

  return (
    <group>

      {/* ═══════════════════════════════════════════════════════════
          1. PRIMARY TANK — clean water storage  center=[-2.2,-0.75,0]
             Bottom y = -0.75 - 1.0 = -1.75  Top y = +0.25
          ═══════════════════════════════════════════════════════════ */}
      <group ref={primaryRef} position={[-2.2, -0.75, 0]} {...mk('primary_tank', 'PRIMARY_TANK', setHovP)}>

        {/* Acrylic glass body */}
        <GlassWall w={PW} h={PH} d={PD} matRef={primaryMatRef} color="#083344" />

        {/* Aluminium extrusion corners */}
        {([-PW/2, PW/2] as number[]).flatMap(x =>
          [-PD/2, PD/2].map(z => <CornerPost key={`${x}-${z}`} x={x} h={PH} z={z} />)
        )}
        <FrameRail y={ PH/2} w={PW} d={PD} />
        <FrameRail y={-PH/2} w={PW} d={PD} />

        {/* Horizontal divider — sensor chamber (top) / clean water (bottom) */}
        <mesh position={[0, 0.20, 0]} receiveShadow castShadow>
          <boxGeometry args={[PW-0.04, 0.022, PD-0.04]} />
          <meshPhysicalMaterial
            color="#e0f2fe" transparent opacity={0.30}
            transmission={0.9} roughness={0.06} depthWrite={false}
          />
        </mesh>
        {/* Divider cyan edge indicator */}
        <mesh position={[PW/2-0.002, 0.20, 0]}>
          <boxGeometry args={[0.003, 0.018, PD-0.06]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.9} />
        </mesh>

        {/* Bypass valve tube (bad quality → re-filter path) */}
        <mesh position={[0.55, -0.18, 0.35]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.74, 10]} />
          <meshPhysicalMaterial color="#e0f9ff" transparent opacity={0.5} transmission={0.85} roughness={0.08} depthWrite={false} />
        </mesh>
        <mesh position={[0.55, -0.18, 0.35]} rotation={[Math.PI/2,0,0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.065, 10]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Inlet nozzle — right wall, filtered return water */}
        <PipeNozzle pos={[PW/2, -0.28, 0]} rot={[0, 0, Math.PI/2]} />
        {/* Outlet nozzle — left wall, clean water outlet */}
        <PipeNozzle pos={[-PW/2, -0.55, 0]} rot={[0, 0, -Math.PI/2]} />

        {/* Warning label */}
        <mesh position={[PW/2-0.002, -0.65, 0]}>
          <boxGeometry args={[0.003, 0.1, 0.2]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>
        {/* Floor plate */}
        <mesh position={[0, -PH/2 - 0.012, 0]} receiveShadow castShadow>
          <boxGeometry args={[PW+0.04, 0.025, PD+0.04]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.85} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════
          2. SEDIMENTATION TANK — cylindrical filter  center=[0.3,-1.0,0]
             Bottom y = -1.75  Top y = -0.25
          ═══════════════════════════════════════════════════════════ */}
      <group ref={sedRef} position={[0.3, -1.0, 0]} {...mk('sedimentation_tank', 'SEDIMENTATION_TANK', setHovS)}>

        {/* Transparent cylinder */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[SR, SR, SH, 24, 1, false]} />
          <meshPhysicalMaterial
            ref={sedMatRef}
            color="#0c4a6e"
            transparent opacity={0.42}
            roughness={0.05} metalness={0.04}
            transmission={0.82} thickness={0.05}
            clearcoat={1.0} clearcoatRoughness={0.02}
            depthWrite={false} side={THREE.DoubleSide}
          />
        </mesh>

        {/* Metal banding rings */}
        {([-0.58, 0.0, 0.58] as number[]).map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <torusGeometry args={[SR+0.02, 0.012, 8, 24]} />
            <meshStandardMaterial color="#374151" roughness={0.25} metalness={0.9} />
          </mesh>
        ))}

        {/* Top cap with inlet port */}
        <mesh position={[0, SH/2+0.022, 0]} castShadow>
          <cylinderGeometry args={[SR+0.022, SR+0.022, 0.044, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.85} />
        </mesh>
        <PipeNozzle pos={[0, SH/2+0.075, 0]} rot={[0, 0, 0]} />

        {/* Bottom funnel outlet */}
        <mesh position={[0, -SH/2-0.04, 0]} castShadow>
          <cylinderGeometry args={[SR+0.022, 0.04, 0.08, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.85} />
        </mesh>
        <PipeNozzle pos={[0, -SH/2-0.12, 0]} rot={[0, 0, 0]} />

        {/* Floor plate */}
        <mesh position={[0, -SH/2-0.025, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[SR+0.05, SR+0.05, 0.025, 20]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.85} />
        </mesh>

        {/* Label strip */}
        <mesh position={[SR+0.015, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[0.3, 0.055, 0.003]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.9} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════
          3. SECONDARY TANK — raw water intake  center=[2.2,-1.0,0]
             Bottom y = -1.75  Top y = -0.25
          ═══════════════════════════════════════════════════════════ */}
      <group ref={secondaryRef} position={[2.2, -1.0, 0]} {...mk('secondary_tank', 'SECONDARY_TANK', setHovT)}>

        {/* Glass body — slightly brownish tint: raw/dirty water */}
        <GlassWall w={TW} h={TH} d={TD} matRef={secondaryMatRef} color="#134e4a" opacity={0.55} />

        {/* Corners + rails */}
        {([-TW/2, TW/2] as number[]).flatMap(x =>
          [-TD/2, TD/2].map(z => <CornerPost key={`${x}-${z}`} x={x} h={TH} z={z} />)
        )}
        <FrameRail y={ TH/2} w={TW} d={TD} />
        <FrameRail y={-TH/2} w={TW} d={TD} />

        {/* Inlet nozzle — right wall top (raw water enters from intake pipe) */}
        <PipeNozzle pos={[TW/2, TH/2-0.18, 0]} rot={[0, 0, Math.PI/2]} />
        {/* Outlet nozzle — left wall bottom (pump draws from here) */}
        <PipeNozzle pos={[-TW/2, -TH/2+0.18, 0]} rot={[0, 0, -Math.PI/2]} />

        {/* Water level indicator line */}
        <mesh position={[0, 0, TD/2-0.002]}>
          <boxGeometry args={[0.016, TH-0.1, 0.004]} />
          <meshStandardMaterial color="#22d3ee" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Pump mount bracket inside at base */}
        <mesh position={[0, -TH/2+0.08, 0]} castShadow>
          <boxGeometry args={[TW-0.12, 0.022, TD-0.12]} />
          <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.75} />
        </mesh>
        {/* Floor plate */}
        <mesh position={[0, -TH/2-0.012, 0]} receiveShadow castShadow>
          <boxGeometry args={[TW+0.04, 0.025, TD+0.04]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.85} />
        </mesh>
      </group>

    </group>
  );
};
