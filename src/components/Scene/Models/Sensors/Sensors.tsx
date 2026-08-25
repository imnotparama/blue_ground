'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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
          mat.emissive.set('#fef08a');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.5, 0.1);
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
          <cylinderGeometry args={[0.08, 0.08, 0.45, 12, 1, true]} />
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
    {/* Cable rising to controller */}
    <mesh position={[0, 0.32, 0]} castShadow>
      <cylinderGeometry args={[0.007, 0.007, 0.22, 8]} />
      <meshStandardMaterial color={cableColor} roughness={0.8} />
    </mesh>
    {/* Waterproof Probe Body */}
    <mesh castShadow>
      <cylinderGeometry args={[0.016, 0.016, 0.42, 12]} />
      <meshStandardMaterial color={bodyColor} roughness={0.35} metalness={0.75} />
    </mesh>
    {/* Cable gland top collar */}
    <mesh position={[0, 0.22, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.015, 0.035, 10]} />
      <meshStandardMaterial color="#4b5563" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Probe Tip */}
    {tipShape === 'flat' && (
      <mesh position={[0, -0.22, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.012, 0.025, 10]} />
        <meshStandardMaterial color={tipColor} roughness={0.08} metalness={0.95} />
      </mesh>
    )}
    {tipShape === 'bulb' && (
      <mesh position={[0, -0.23, 0]}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshPhysicalMaterial
          color="#0284c7" transparent opacity={0.75}
          transmission={0.9} roughness={0.04}
        />
      </mesh>
    )}
  </group>
);

export const Sensors = () => {
  const { exploded, metrics } = useSystemState();

  const flowRotorRef = useRef<THREE.Group>(null);
  const floatRingRef = useRef<THREE.Mesh>(null);
  const probeGroupRef = useRef<THREE.Group>(null);
  const flowGroupRef = useRef<THREE.Group>(null);
  const floatGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Exploded offsets
    if (probeGroupRef.current) {
      const ty = exploded ? 0.35 : 0;
      probeGroupRef.current.position.y = THREE.MathUtils.lerp(probeGroupRef.current.position.y, ty, 0.08);
    }
    if (flowGroupRef.current) {
      const ty = exploded ? 0.25 : 0;
      flowGroupRef.current.position.y = THREE.MathUtils.lerp(flowGroupRef.current.position.y, ty, 0.08);
    }
    if (floatGroupRef.current) {
      const tx = exploded ? -0.3 : 0;
      floatGroupRef.current.position.x = THREE.MathUtils.lerp(floatGroupRef.current.position.x, tx, 0.08);
    }

    // Flow sensor impeller spin
    if (flowRotorRef.current && metrics.flowRate > 0) {
      flowRotorRef.current.rotation.y += metrics.flowRate * 2.2 * delta;
    }

    // Float ring follows water level inside PRIMARY tank
    if (floatRingRef.current) {
      // Primary tank bottom-of-clean-chamber is y = -1.65, top is y = -0.55
      const waterHeight = -1.55 + (metrics.waterLevel / 100) * 1.0;
      floatRingRef.current.position.y = THREE.MathUtils.lerp(
        floatRingRef.current.position.y, waterHeight, 0.08,
      );
    }
  });

  // Secondary Tank Center is at [2.1, -1.0, 0], Top Lid at y = -0.275
  const SEC_X = 2.1;
  const SEC_Y = -0.28;

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          A. PROBE SENSORS — TDS, pH, Turbidity, Temp, UV/LED
             Mounted in Secondary Tank Lid at [2.1, -0.28, 0]
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={probeGroupRef}>

        {/* 1. TDS Probe */}
        <InteractiveSensor id="tds" preset="TDS_SENSOR"
          position={[SEC_X - 0.22, SEC_Y, 0.15]}
        >
          <WaterproofProbe bodyColor="#1e2937" tipColor="#e2e8f0" tipShape="flat" />
          {/* Twin electrode plates */}
          <mesh position={[-0.005, -0.23, 0.004]}>
            <boxGeometry args={[0.004, 0.02, 0.014]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.05} metalness={0.98} />
          </mesh>
          <mesh position={[0.005, -0.23, 0.004]}>
            <boxGeometry args={[0.004, 0.02, 0.014]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.05} metalness={0.98} />
          </mesh>
        </InteractiveSensor>

        {/* 2. pH Probe */}
        <InteractiveSensor id="ph" preset="PH_SENSOR"
          position={[SEC_X - 0.08, SEC_Y, 0.20]}
        >
          <WaterproofProbe bodyColor="#18181b" tipColor="#0284c7" tipShape="bulb" cableColor="#1e1b4b" />
          {/* Reference junction ring */}
          <mesh position={[0, -0.18, 0]}>
            <torusGeometry args={[0.014, 0.003, 6, 10]} />
            <meshStandardMaterial color="#b45309" roughness={0.2} metalness={0.9} />
          </mesh>
        </InteractiveSensor>

        {/* 3. Turbidity Optical Probe */}
        <InteractiveSensor id="turbidity" preset="TURBIDITY_SENSOR"
          position={[SEC_X + 0.08, SEC_Y, 0.15]}
        >
          <WaterproofProbe bodyColor="#27272a" tipColor="#f5f5f5" tipShape="flat" cableColor="#334155" />
          {/* Optical sensor lens window */}
          <mesh position={[0, -0.21, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.006, 10]} />
            <meshPhysicalMaterial transparent opacity={0.7} transmission={0.95} roughness={0.02} />
          </mesh>
        </InteractiveSensor>

        {/* 4. Temperature Probe (DS18B20 style) */}
        <InteractiveSensor id="temp" preset="TEMP_SENSOR"
          position={[SEC_X + 0.22, SEC_Y, -0.15]}
        >
          <group>
            {/* Stainless steel tube */}
            <mesh castShadow>
              <cylinderGeometry args={[0.007, 0.007, 0.46, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.95} />
            </mesh>
            {/* Threaded brass hex nut */}
            <mesh position={[0, 0.23, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.025, 6]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.15} metalness={0.9} />
            </mesh>
            {/* Red silicone cable */}
            <mesh position={[0, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
              <meshStandardMaterial color="#dc2626" roughness={0.8} />
            </mesh>
          </group>
        </InteractiveSensor>

        {/* 5. Sterilizing White/UV Light Prototype Emitter */}
        <InteractiveSensor id="uv" preset="UV_LED"
          position={[SEC_X - 0.08, SEC_Y - 0.55, -0.22]}
          rotation={[0, 0, -Math.PI / 6]}
        >
          {/* Metal housing collar */}
          <mesh castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
            <meshStandardMaterial color="#3f4f6e" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Glass protective bulb */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.10, 10]} />
            <meshPhysicalMaterial
              color="#fef9c3" transparent opacity={0.55}
              transmission={0.9} roughness={0.04}
            />
          </mesh>
          {/* LED light core emitter */}
          <mesh name="uv-emitter-mesh" position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.08, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={metrics.uvStatus === 'ON' ? 3.0 : 0.0}
              roughness={0.1}
            />
          </mesh>
        </InteractiveSensor>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          B. FLOW SENSOR (YF-S201) — Inline on Process Pipe at [0.85, -1.65, 0]
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={flowGroupRef}>
        <InteractiveSensor id="flow" preset="FLOW_SENSOR"
          position={[0.85, -1.65, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          {/* Flow Sensor T-fitting Body */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 0.20, 14]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Turbine Chamber Housing */}
          <mesh position={[0, 0.022, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.065, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Transparent Inspection Lid */}
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.056, 0.056, 0.005, 16]} />
            <meshPhysicalMaterial transparent opacity={0.3} transmission={0.9} roughness={0.03} />
          </mesh>
          {/* Rotating Red Flow Impeller */}
          <group ref={flowRotorRef} position={[0, 0.022, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.045, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.9} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh key={i} rotation={[(i * Math.PI) / 3, 0, 0]} castShadow>
                <boxGeometry args={[0.006, 0.045, 0.008]} />
                <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
              </mesh>
            ))}
          </group>
        </InteractiveSensor>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          C. FLOAT LEVEL SENSOR — Inside Primary Tank Clean Chamber at [-2.6, -1.0, 0.3]
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={floatGroupRef}>
        <InteractiveSensor id="float" preset="FLOAT_SENSOR"
          position={[-2.6, -1.15, 0.3]}
        >
          {/* Guide rod */}
          <mesh castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.95, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.95} />
          </mesh>
          {/* Mounting bracket on shelf */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.08, 0.015, 0.05]} />
            <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Sliding float switch collar */}
          <mesh ref={floatRingRef} position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.35} metalness={0.3} />
          </mesh>
        </InteractiveSensor>
      </group>
    </group>
  );
};
