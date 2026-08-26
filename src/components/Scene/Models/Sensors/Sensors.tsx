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
  const { setActiveHotspot, setCameraPreset, activeHotspot, metrics, tanksOnly } = useSystemState();
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
    const isDimmed = tanksOnly || (activeHotspot !== null && activeHotspot !== id);
    const targetOpacity = isDimmed ? 0.08 : 1.0;
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
        floatRingRef.current.position.y,
        waterHeight,
        1.0 - Math.exp(-4.0 * delta)
      );
    }

    // Exploded View offset
    const targetY = exploded ? 0.20 : 0;
    if (probeGroupRef.current) {
      probeGroupRef.current.position.y = THREE.MathUtils.lerp(probeGroupRef.current.position.y, targetY, 0.08);
    }
    if (flowGroupRef.current) {
      flowGroupRef.current.position.y = THREE.MathUtils.lerp(flowGroupRef.current.position.y, targetY * 0.5, 0.08);
    }
    if (floatGroupRef.current) {
      floatGroupRef.current.position.y = THREE.MathUtils.lerp(floatGroupRef.current.position.y, targetY * 0.5, 0.08);
    }
  });

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. WATER QUALITY PROBES (Extending from Unit & Control Box through roof
             into Secondary Tank at top right of Main Tank)
          ═══════════════════════════════════════════════════════════════════════ */}
      <group ref={probeGroupRef}>
        {/* A. TDS Sensor Dual Platinum Electrode Probe */}
        <InteractiveSensor id="tds" preset="TDS_SENSOR" position={[0.55, 0.30, 0.0]}>
          {/* Cable with strain relief boot */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.22, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.012, 0.04, 10]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Black POM probe body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.34, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* White ceramic insulator collar */}
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.013, 0.013, 0.02, 10]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Dual Platinum-Plated Electrode Sensing Pins */}
          <mesh position={[-0.005, -0.19, 0]} castShadow>
            <cylinderGeometry args={[0.002, 0.002, 0.04, 8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.05} metalness={0.98} />
          </mesh>
          <mesh position={[0.005, -0.19, 0]} castShadow>
            <cylinderGeometry args={[0.002, 0.002, 0.04, 8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.05} metalness={0.98} />
          </mesh>
        </InteractiveSensor>

        {/* B. pH Sensor Probe with Glass Electrolyte Bulb & Ceramic Junction */}
        <InteractiveSensor id="ph" preset="PH_SENSOR" position={[0.40, 0.30, 0.0]}>
          {/* Shielded RG-174 Cable */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.22, 8]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.8} />
          </mesh>
          {/* Knurled Brass Compression Gland */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.015, 0.035, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Polycarbonate Stem Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.34, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* White Porous Ceramic Reference Junction Ring */}
          <mesh position={[0, -0.165, 0]} castShadow>
            <cylinderGeometry args={[0.0145, 0.0145, 0.015, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
          {/* Glass pH Sensing Bulb with Blue Electrolyte Solution */}
          <mesh position={[0, -0.195, 0]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshPhysicalMaterial
              color="#0284c7"
              transparent
              opacity={0.80}
              transmission={0.9}
              roughness={0.04}
              clearcoat={1.0}
            />
          </mesh>
          {/* Internal Ag/AgCl Silver Reference Electrode Wire */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.0015, 0.0015, 0.14, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.99} />
          </mesh>
        </InteractiveSensor>

        {/* C. Turbidity Nephelometric Optical Probe */}
        <InteractiveSensor id="turbidity" preset="TURBIDITY_SENSOR" position={[0.22, 0.30, 0.0]}>
          {/* Cable */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.22, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.013, 0.035, 10]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Probe Stem */}
          <mesh castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.34, 12]} />
            <meshStandardMaterial color="#18181b" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* Optical Immersion Head with Slit Aperture */}
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.024, 0.035, 0.018]} />
            <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Optical IR Emitter Lens (850nm) */}
          <mesh position={[-0.006, -0.17, 0]}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.006, 8]} />
            <meshPhysicalMaterial color="#991b1b" transparent opacity={0.85} roughness={0.05} />
          </mesh>
          {/* Optical Photodiode Receiver Lens (90-deg scatter) */}
          <mesh position={[0.006, -0.17, 0]}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.006, 8]} />
            <meshPhysicalMaterial color="#0284c7" transparent opacity={0.85} roughness={0.05} />
          </mesh>
        </InteractiveSensor>

        {/* D. UV Light Sterilizer Tube inside Tank */}
        <InteractiveSensor id="uv" preset="UV_LED" position={[0.35, -0.40, 0.25]} rotation={[0, 0, -Math.PI / 4]}>
          {/* Stainless Steel Mounting Base Flange */}
          <mesh castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.10, 12]} />
            <meshStandardMaterial color="#3f4f6e" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Quartz Glass Sleeve */}
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
            <meshPhysicalMaterial
              color="#fef9c3"
              transparent
              opacity={0.55}
              transmission={0.92}
              roughness={0.04}
            />
          </mesh>
          {/* High-Output Germicidal UV-C Emitter Filament */}
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
        <InteractiveSensor id="flow" preset="FLOW_SENSOR" position={[1.45, 0.30, 0]} rotation={[0, 0, Math.PI / 2]}>
          {/* YF-S201 Body with 1/2" Threaded Ports */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 0.20, 14]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Brass Thread Rings on both sides */}
          {[-0.09, 0.09].map((tx, idx) => (
            <mesh key={idx} position={[tx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.039, 0.039, 0.02, 12]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.3} metalness={0.9} />
            </mesh>
          ))}
          {/* Turbine Chamber Housing */}
          <mesh position={[0, 0.022, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.065, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Transparent Inspection Lid */}
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.056, 0.056, 0.005, 16]} />
            <meshPhysicalMaterial transparent opacity={0.35} transmission={0.9} roughness={0.03} />
          </mesh>
          {/* Black Hall Effect Sensor Chip Module */}
          <mesh position={[0, 0.06, 0.03]} castShadow>
            <boxGeometry args={[0.018, 0.008, 0.012]} />
            <meshStandardMaterial color="#09090b" roughness={0.5} />
          </mesh>
          {/* Rotating 6-Blade Flow Turbine Impeller with Neodymium Magnet */}
          <group ref={flowRotorRef} position={[0, 0.022, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.045, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Neodymium Magnet Insert */}
            <mesh position={[0.01, 0, 0]} castShadow>
              <boxGeometry args={[0.006, 0.012, 0.006]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.99} />
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
        <InteractiveSensor id="float" preset="FLOAT_SENSOR" position={[-2.1, -0.65, 0.3]}>
          {/* Stainless Steel Reed-Switch Guide Rod */}
          <mesh castShadow>
            <cylinderGeometry args={[0.007, 0.007, 1.4, 10]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Top Wall Mounting Bracket & Wiring Gland */}
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[0.035, 0.035, 0.04]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Bottom E-Clip Stopper */}
          <mesh position={[0, -0.68, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.008, 10]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.98} />
          </mesh>
          {/* Magnetic Cylindrical Doughnut Float Ring (Tracks Liquid Level) */}
          <mesh ref={floatRingRef} position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.045, 16]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
        </InteractiveSensor>
      </group>
    </group>
  );
};
