'use client';

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Interactive Sensor Wrapper ────────────────────────────────────────────────
interface InteractiveSensorProps {
  id: string;
  preset: CameraPreset;
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

const InteractiveSensor: React.FC<InteractiveSensorProps> = ({
  id, preset, position, rotation = [0, 0, 0], children,
}) => {
  const { setActiveHotspot, setCameraPreset, activeHotspot, metrics } = useSystemState();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const isActive = activeHotspot === id;

  useFrame(() => {
    if (!groupRef.current) return;
    const isDimmed = activeHotspot !== null && activeHotspot !== id;
    groupRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat) return;
      mat.transparent = true;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, isDimmed ? 0.15 : 1.0, 0.08);
      if (mat.emissive) {
        const isUv = child.name === 'uv-emitter-mesh';
        if (hovered && !isDimmed) {
          mat.emissive.set('#06b6d4');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.5, 0.1);
        } else if (isUv && metrics.uvStatus === 'ON') {
          mat.emissive.set('#a855f7');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 3.0, 0.1);
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.1);
        }
      }
    });
    const targetScale = hovered ? 1.06 : 1.0;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); setActiveHotspot(id); setCameraPreset(preset); }}
    >
      {(hovered || isActive) && (
        <mesh name="highlight-ring">
          <cylinderGeometry args={[0.1, 0.1, 0.5, 12, 1, true]} />
          <meshBasicMaterial
            color={isActive ? '#22d3ee' : '#3b82f6'}
            wireframe transparent opacity={0.3}
          />
        </mesh>
      )}
      {children}
    </group>
  );
};

// ─── Realistic Probe Builder ──────────────────────────────────────────────────
const WaterproofProbe = ({
  bodyColor = '#1e2937',
  tipColor = '#d4d4d8',
  tipShape = 'flat' as 'flat' | 'bulb' | 'cone',
  cableColor = '#18181b',
}: {
  bodyColor?: string;
  tipColor?: string;
  tipShape?: 'flat' | 'bulb' | 'cone';
  cableColor?: string;
}) => (
  <group>
    {/* Cable */}
    <mesh position={[0, 0.34, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
      <meshStandardMaterial color={cableColor} roughness={0.8} />
    </mesh>
    {/* Waterproof body */}
    <mesh castShadow>
      <cylinderGeometry args={[0.018, 0.018, 0.48, 12]} />
      <meshStandardMaterial color={bodyColor} roughness={0.35} metalness={0.75} />
    </mesh>
    {/* Cable gland top */}
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.022, 0.016, 0.04, 10]} />
      <meshStandardMaterial color="#4b5563" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Tip */}
    {tipShape === 'flat' && (
      <mesh position={[0, -0.245, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.014, 0.025, 10]} />
        <meshStandardMaterial color={tipColor} roughness={0.08} metalness={0.95} />
      </mesh>
    )}
    {tipShape === 'bulb' && (
      <mesh position={[0, -0.26, 0]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshPhysicalMaterial
          color="#0284c7" transparent opacity={0.75}
          transmission={0.9} roughness={0.04}
        />
      </mesh>
    )}
    {tipShape === 'cone' && (
      <mesh position={[0, -0.26, 0]} castShadow>
        <coneGeometry args={[0.016, 0.04, 10]} />
        <meshStandardMaterial color={tipColor} roughness={0.15} metalness={0.85} />
      </mesh>
    )}
  </group>
);

// ─── Main Sensors Component ───────────────────────────────────────────────────
/*
 * All probe sensors dip into the SECONDARY TANK (raw water intake).
 * Secondary tank center in scene: [2.4, -0.5, 0], height 1.6
 * Top of secondary tank inner water: y = -0.5 + 0.75 = 0.25
 * Probes mount through lid, body above y=0.25, tip below water surface.
 *
 * Flow sensor sits on the pipe run between secondary and sedimentation:
 * Pipe segment runs at y=-1.48, x from 1.85 to 1.1
 * Flow sensor at x=1.1, y=-1.48 (inline horizontal pipe)
 *
 * Float sensor mounts inside the PRIMARY tank:
 * Primary center: [-2.0, -0.55, 0], clean water bottom chamber
 */
export const Sensors = () => {
  const { exploded, metrics } = useSystemState();

  const flowRotorRef    = useRef<THREE.Group>(null);
  const floatRingRef    = useRef<THREE.Mesh>(null);
  const probeGroupRef   = useRef<THREE.Group>(null);
  const flowGroupRef    = useRef<THREE.Group>(null);
  const floatGroupRef   = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Exploded offsets
    if (probeGroupRef.current) {
      const ty = exploded ? 0.45 : 0;
      probeGroupRef.current.position.y = THREE.MathUtils.lerp(probeGroupRef.current.position.y, ty, 0.08);
    }
    if (flowGroupRef.current) {
      const tx = exploded ? 0.35 : 0;
      flowGroupRef.current.position.x = THREE.MathUtils.lerp(flowGroupRef.current.position.x, tx, 0.08);
    }
    if (floatGroupRef.current) {
      const tx = exploded ? -0.3 : 0;
      floatGroupRef.current.position.x = THREE.MathUtils.lerp(floatGroupRef.current.position.x, tx, 0.08);
    }

    // Flow sensor impeller spin
    if (flowRotorRef.current && metrics.flowRate > 0) {
      flowRotorRef.current.rotation.y += metrics.flowRate * 2.0 * delta;
    }

    // Float ring follows water level inside PRIMARY tank
    if (floatRingRef.current) {
      // Primary tank bottom-of-clean-chamber: y = -0.55 - 1.05 + 0.05 = -1.55
      // Full height of clean chamber: ~1.33 (below divider at y=0.28 relative)
      const waterHeight = -1.55 + (metrics.waterLevel / 100) * 1.33;
      floatRingRef.current.position.y = THREE.MathUtils.lerp(
        floatRingRef.current.position.y, waterHeight, 0.08,
      );
    }
  });

  // Secondary tank top surface: center=[2.2,-1.0,0], top y=-1.0+0.75=-0.25
  // Probe bodies straddle the tank lid (cable above, tip submerged)
  const SEC_X = 2.2;
  const SEC_Y = -0.38; // probe body center y (tip at -0.65 = inside tank)

  return (
    <group>

      {/* ═══════════════════════════════════════════════════════════════════════
          A. PROBE SENSORS — TDS, pH, Turbidity, Temp, UV LED
             Positioned in secondary tank
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={probeGroupRef}>

        {/* 1. TDS Probe */}
        <InteractiveSensor id="tds" preset="TDS_SENSOR"
          position={[SEC_X - 0.15, SEC_Y, 0.18]}
        >
          <WaterproofProbe bodyColor="#1e2937" tipColor="#e2e8f0" tipShape="flat" />
          {/* Twin electrode plate on tip */}
          <mesh position={[-0.006, -0.26, 0.005]}>
            <boxGeometry args={[0.006, 0.025, 0.018]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.05} metalness={0.98} />
          </mesh>
          <mesh position={[ 0.006, -0.26, 0.005]}>
            <boxGeometry args={[0.006, 0.025, 0.018]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.05} metalness={0.98} />
          </mesh>
        </InteractiveSensor>

        {/* 2. pH Probe */}
        <InteractiveSensor id="ph" preset="PH_SENSOR"
          position={[SEC_X + 0.05, SEC_Y, 0.22]}
        >
          <WaterproofProbe bodyColor="#18181b" tipColor="#0284c7" tipShape="bulb"
            cableColor="#1e1b4b"
          />
          {/* Reference junction ring */}
          <mesh position={[0, -0.2, 0]}>
            <torusGeometry args={[0.016, 0.004, 6, 10]} />
            <meshStandardMaterial color="#b45309" roughness={0.2} metalness={0.9} />
          </mesh>
        </InteractiveSensor>

        {/* 3. Turbidity Probe */}
        <InteractiveSensor id="turbidity" preset="TURBIDITY_SENSOR"
          position={[SEC_X + 0.22, SEC_Y, 0.08]}
        >
          <WaterproofProbe bodyColor="#27272a" tipColor="#f5f5f5" tipShape="flat"
            cableColor="#334155"
          />
          {/* Optical lens window */}
          <mesh position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.013, 0.013, 0.006, 10]} />
            <meshPhysicalMaterial transparent opacity={0.7} transmission={0.95} roughness={0.02} />
          </mesh>
        </InteractiveSensor>

        {/* 4. Temperature Probe (DS18B20 style) */}
        <InteractiveSensor id="temp" preset="TEMP_SENSOR"
          position={[SEC_X + 0.12, SEC_Y, -0.2]}
        >
          <group>
            {/* Thin stainless steel tube */}
            <mesh castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.55, 8]} />
              <meshStandardMaterial color="#c0c8d0" roughness={0.1} metalness={0.95} />
            </mesh>
            {/* Threaded hex base */}
            <mesh position={[0, 0.28, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.03, 6]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.15} metalness={0.9} />
            </mesh>
            {/* Cable */}
            <mesh position={[0, 0.38, 0]} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.18, 8]} />
              <meshStandardMaterial color="#dc2626" roughness={0.8} />
            </mesh>
          </group>
        </InteractiveSensor>

        {/* 5. UV/White LED sterilizer (prototype uses white LED) */}
        <InteractiveSensor id="uv" preset="UV_LED"
          position={[SEC_X - 0.1, SEC_Y - 0.55, 0.35]}
          rotation={[0, 0, -Math.PI / 5]}
        >
          {/* Metal sleeve mount */}
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.09, 12]} />
            <meshStandardMaterial color="#3f4f6e" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* LED glass bulb */}
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.12, 10]} />
            <meshPhysicalMaterial
              color="#fef9c3" transparent opacity={0.55}
              transmission={0.9} roughness={0.04}
            />
          </mesh>
          {/* Emissive LED element */}
          <mesh name="uv-emitter-mesh" position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.09, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={metrics.uvStatus === 'ON' ? 3.5 : 0.0}
              roughness={0.1}
            />
          </mesh>
          {/* Bracket arm */}
          <mesh position={[0.04, 0.05, 0]} rotation={[0, 0, Math.PI/4]} castShadow>
            <boxGeometry args={[0.08, 0.01, 0.015]} />
            <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.8} />
          </mesh>
        </InteractiveSensor>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          B. FLOW SENSOR — inline YF-S201 style on pipe at [1.1, -1.48, 0]
             Positioned BETWEEN secondary tank outlet and sedimentation inlet
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={flowGroupRef}>
        <InteractiveSensor id="flow" preset="FLOW_SENSOR"
          position={[1.32, -1.72, 0]}
          rotation={[0, 0, Math.PI/2]}   // inline with horizontal pipe
        >
          {/* T-fitting body */}
          <mesh rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.24, 14]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Centre chamber */}
          <mesh position={[0, 0.025, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.075, 16]} />
            <meshStandardMaterial color="#1e2937" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Plexiglass cover */}
          <mesh position={[0, 0.062, 0]}>
            <cylinderGeometry args={[0.066, 0.066, 0.006, 16]} />
            <meshPhysicalMaterial transparent opacity={0.28} transmission={0.9} roughness={0.03} />
          </mesh>
          {/* Rotating impeller */}
          <group ref={flowRotorRef} position={[0, 0.025, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.055, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.9} />
            </mesh>
            {[0,1,2,3,4,5].map((i) => (
              <mesh key={i} rotation={[(i * Math.PI) / 3, 0, 0]} castShadow>
                <boxGeometry args={[0.008, 0.052, 0.01]} />
                <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
              </mesh>
            ))}
          </group>
          {/* Signal cable */}
          <mesh position={[0.065, 0.025, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
            <meshStandardMaterial color="#dc2626" roughness={0.7} />
          </mesh>
        </InteractiveSensor>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          C. FLOAT SENSOR — inside PRIMARY tank clean water chamber
             Primary center [-2.0, -0.55, 0], clean chamber below divider y=0.28
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={floatGroupRef}>
        <InteractiveSensor id="float" preset="FLOAT_SENSOR"
          position={[-2.6, -0.75, 0.4]}
        >
          {/* Guide rod */}
          <mesh castShadow>
            <cylinderGeometry args={[0.007, 0.007, 1.1, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.95} />
          </mesh>
          {/* Mounting bracket top */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.06]} />
            <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Stopper rings */}
          {([0.5, -0.5] as number[]).map((y, i) => (
            <mesh key={i} position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.014, 8]} />
              <meshStandardMaterial color="#1e2937" roughness={0.3} metalness={0.7} />
            </mesh>
          ))}
          {/* Sliding float ball */}
          <mesh ref={floatRingRef} position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} metalness={0.3} />
          </mesh>
        </InteractiveSensor>
      </group>

    </group>
  );
};
