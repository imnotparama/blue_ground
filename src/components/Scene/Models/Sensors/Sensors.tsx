'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  const materialsRef = useRef<{ mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; isUv: boolean }[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;
    const list: { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; isUv: boolean }[] = [];
    groupRef.current.traverse((child: any) => {
      if (child instanceof THREE.Mesh && child.material) {
        list.push({
          mesh: child,
          mat: child.material as THREE.MeshStandardMaterial,
          isUv: child.name === 'uv-emitter-mesh',
        });
      }
    });
    materialsRef.current = list;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isDimmed = activeHotspot !== null && activeHotspot !== id;
    const targetOpacity = isDimmed ? 0.15 : 1.0;
    const damp = 1.0 - Math.exp(-8 * delta);

    for (let i = 0; i < materialsRef.current.length; i++) {
      const item = materialsRef.current[i];
      const mat = item.mat;
      mat.transparent = true;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);
      
      if (mat.emissive) {
        if (hovered && !isDimmed) {
          mat.emissive.set('#06b6d4');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.5, damp);
        } else if (item.isUv && metrics.uvStatus === 'ON') {
          mat.emissive.set('#fef08a');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 3.0, damp);
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, damp);
        }
      }
    }
    
    const targetScale = hovered ? 1.06 : 1.0;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
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
          <cylinderGeometry args={[0.07, 0.07, 0.40, 12, 1, true]} />
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

// ─── Realistic Waterproof Sensor Probe ─────────────────────────────────────────
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
    {/* Cable rising to Unit & Control Box above */}
    <mesh position={[0, 0.28, 0]} castShadow>
      <cylinderGeometry args={[0.006, 0.006, 0.24, 8]} />
      <meshStandardMaterial color={cableColor} roughness={0.8} />
    </mesh>
    {/* Waterproof Probe Body */}
    <mesh castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.36, 12]} />
      <meshStandardMaterial color={bodyColor} roughness={0.35} metalness={0.75} />
    </mesh>
    {/* Cable gland sealing collar */}
    <mesh position={[0, 0.18, 0]} castShadow>
      <cylinderGeometry args={[0.018, 0.014, 0.03, 10]} />
      <meshStandardMaterial color="#4b5563" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Tip */}
    {tipShape === 'flat' && (
      <mesh position={[0, -0.19, 0]} castShadow>
        <cylinderGeometry args={[0.013, 0.011, 0.02, 10]} />
        <meshStandardMaterial color={tipColor} roughness={0.08} metalness={0.95} />
      </mesh>
    )}
    {tipShape === 'bulb' && (
      <mesh position={[0, -0.20, 0]}>
        <sphereGeometry args={[0.015, 10, 10]} />
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
    // Flow sensor turbine rotation
    if (flowRotorRef.current && metrics.flowRate > 0) {
      flowRotorRef.current.rotation.y += metrics.flowRate * 2.5 * delta;
    }

    // Float sensor moves with water level in Primary Tank
    if (floatRingRef.current) {
      // Primary tank water level ranges from y = -1.65 to -0.05
      const waterHeight = -1.50 + (metrics.waterLevel / 100) * 1.30;
      floatRingRef.current.position.y = THREE.MathUtils.lerp(
        floatRingRef.current.position.y, waterHeight, 0.08,
      );
    }
  });

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. PROBE SENSORS IN SECONDARY COMPARTMENT (TDS, pH, Turbidity)
             Extending straight down from Unit & Control Box through roof
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={probeGroupRef}>
        {/* A. TDS Sensor Probe */}
        <InteractiveSensor id="tds" preset="TDS_SENSOR"
          position={[0.55, 0.30, 0.0]}
        >
          <WaterproofProbe bodyColor="#1e2937" tipColor="#e2e8f0" tipShape="flat" />
          {/* Twin electrode sensing plates */}
          <mesh position={[-0.005, -0.20, 0.004]}>
            <boxGeometry args={[0.004, 0.02, 0.012]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.05} metalness={0.98} />
          </mesh>
          <mesh position={[0.005, -0.20, 0.004]}>
            <boxGeometry args={[0.004, 0.02, 0.012]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.05} metalness={0.98} />
          </mesh>
        </InteractiveSensor>

        {/* B. pH Sensor Probe */}
        <InteractiveSensor id="ph" preset="PH_SENSOR"
          position={[0.40, 0.30, 0.0]}
        >
          <WaterproofProbe bodyColor="#18181b" tipColor="#0284c7" tipShape="bulb" cableColor="#1e1b4b" />
          <mesh position={[0, -0.16, 0]}>
            <torusGeometry args={[0.013, 0.003, 6, 10]} />
            <meshStandardMaterial color="#b45309" roughness={0.2} metalness={0.9} />
          </mesh>
        </InteractiveSensor>

        {/* C. Turbidity Optical Probe */}
        <InteractiveSensor id="turbidity" preset="TURBIDITY_SENSOR"
          position={[0.22, 0.30, 0.0]}
        >
          <WaterproofProbe bodyColor="#27272a" tipColor="#f5f5f5" tipShape="flat" cableColor="#334155" />
          <mesh position={[0, -0.19, 0]}>
            <cylinderGeometry args={[0.011, 0.011, 0.006, 10]} />
            <meshPhysicalMaterial transparent opacity={0.7} transmission={0.95} roughness={0.02} />
          </mesh>
        </InteractiveSensor>

        {/* D. UV Light (or White Light prototype) inside Main Tank */}
        <InteractiveSensor id="uv" preset="UV_LED"
          position={[0.35, -0.40, 0.25]}
          rotation={[0, 0, -Math.PI / 4]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.10, 12]} />
            <meshStandardMaterial color="#3f4f6e" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 10]} />
            <meshPhysicalMaterial
              color="#fef9c3" transparent opacity={0.55}
              transmission={0.9} roughness={0.04}
            />
          </mesh>
          <mesh name="uv-emitter-mesh" position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.10, 8]} />
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
          2. INLINE FLOW SENSOR (Between Sedimentation Tank and Secondary Tank)
             Position: [1.45, 0.30, 0]
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={flowGroupRef}>
        <InteractiveSensor id="flow" preset="FLOW_SENSOR"
          position={[1.45, 0.30, 0]}
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
          3. FLOAT SENSOR (Inside Left Wall of Primary Tank)
             Position: [-2.1, -0.65, 0.3]
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={floatGroupRef}>
        <InteractiveSensor id="float" preset="FLOAT_SENSOR"
          position={[-2.1, -0.65, 0.3]}
        >
          {/* Guide rod */}
          <mesh castShadow>
            <cylinderGeometry args={[0.007, 0.007, 1.4, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.95} />
          </mesh>
          {/* Wall mount bracket */}
          <mesh position={[-0.15, 0.45, 0]} castShadow>
            <boxGeometry args={[0.30, 0.04, 0.06]} />
            <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Sliding float collar */}
          <mesh ref={floatRingRef} position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.35} metalness={0.3} />
          </mesh>
        </InteractiveSensor>
      </group>
    </group>
  );
};
