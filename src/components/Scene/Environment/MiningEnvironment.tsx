'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Distant Heavy Excavator (Distant Industrial Backdrop) ─────────────────────
const DistantExcavator = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, 0.5, 0]} scale={0.75}>
    {/* Crawler Tracks */}
    <mesh position={[0, 0.15, 0]} castShadow>
      <boxGeometry args={[1.6, 0.35, 0.9]} />
      <meshStandardMaterial color="#334155" roughness={0.9} />
    </mesh>
    {/* Upper Body Cab */}
    <mesh position={[0, 0.6, 0]} castShadow>
      <boxGeometry args={[1.3, 0.65, 0.85]} />
      <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.5} />
    </mesh>
    {/* Boom Arm */}
    <group position={[0.6, 0.5, 0]} rotation={[0, 0, -0.5]}>
      <mesh position={[0.8, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.16, 0.14]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.5} />
      </mesh>
      <group position={[1.5, 0, 0]} rotation={[0, 0, 1.0]}>
        <mesh position={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 0.12, 0.12]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.5} />
        </mesh>
        <mesh position={[1.0, 0, 0]} rotation={[0, 0, 0.6]} castShadow>
          <boxGeometry args={[0.4, 0.35, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      </group>
    </group>
  </group>
);

// ─── Distant Mining Haul Truck (Distant Industrial Scale) ──────────────────────
const DistantHaulTruck = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, -0.4, 0]} scale={0.75}>
    {/* Wheels */}
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[2.0, 0.5, 1.1]} />
      <meshStandardMaterial color="#0f172a" roughness={0.95} />
    </mesh>
    {/* Chassis Cab */}
    <mesh position={[-0.5, 0.8, 0]} castShadow>
      <boxGeometry args={[0.9, 0.7, 0.95]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.4} />
    </mesh>
    {/* Ore Bed */}
    <mesh position={[0.5, 0.9, 0]} castShadow>
      <boxGeometry args={[1.5, 0.65, 1.1]} />
      <meshStandardMaterial color="#d97706" roughness={0.6} />
    </mesh>
  </group>
);

// ─── Distant Mining Conveyor Truss ────────────────────────────────────────────
const DistantConveyor = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, 0.15, 0.18]} scale={0.8}>
    <mesh castShadow>
      <boxGeometry args={[12.0, 0.25, 0.4]} />
      <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.8} />
    </mesh>
    {[-4, 0, 4].map((x, i) => (
      <mesh key={i} position={[x, -1.8, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 3.6, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

// ─── Main Cinematic Mining Storytelling Environment ───────────────────────────
export const MiningEnvironment = () => {
  const { tanksOnly } = useSystemState();
  const dustParticlesRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (dustParticlesRef.current) {
      dustParticlesRef.current.rotation.y += 0.015 * delta;
    }
  });

  if (tanksOnly) return null; // Clean isolation mode hides environment props

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. DISTANT OPEN-CAST QUARRY HORIZON (Pushed far back to z = -20 to -35)
          ═══════════════════════════════════════════════════════════════════════ */}
      <group position={[-12, -2.2, -22]}>
        {/* Ridge Bench 1 */}
        <mesh position={[0, 1.2, 0]} receiveShadow>
          <boxGeometry args={[26, 2.4, 12]} />
          <meshStandardMaterial color="#9a3412" roughness={0.96} />
        </mesh>
        {/* Ridge Bench 2 */}
        <mesh position={[-4, 3.2, -4]} receiveShadow>
          <boxGeometry args={[20, 2.0, 10]} />
          <meshStandardMaterial color="#b45309" roughness={0.96} />
        </mesh>
        {/* Distant Mountain Peak */}
        <mesh position={[-8, 5.2, -8]} receiveShadow>
          <boxGeometry args={[16, 2.6, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.98} />
        </mesh>
      </group>

      {/* Heavy Mining Machinery (Positioned realistically in the distant quarry) */}
      <DistantExcavator position={[-9.5, -0.9, -15]} />
      <DistantHaulTruck position={[-5.5, -0.9, -13]} />
      <DistantConveyor position={[-12.0, 1.2, -18]} />

      {/* ═══════════════════════════════════════════════════════════════════════
          2. RESTORED GREENERY HORIZON (Right side distant landscape)
          ═══════════════════════════════════════════════════════════════════════ */}
      <group position={[12, -2.2, -20]}>
        <mesh position={[0, 0.8, 0]} receiveShadow>
          <boxGeometry args={[22, 1.8, 14]} />
          <meshStandardMaterial color="#15803d" roughness={0.95} />
        </mesh>
        {/* Distant rolling hill */}
        <mesh position={[3, 2.2, -4]} receiveShadow>
          <boxGeometry args={[16, 1.6, 10]} />
          <meshStandardMaterial color="#166534" roughness={0.95} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. RAW INTAKE SETTLING BASIN (Cleanly positioned on the right side)
          ═══════════════════════════════════════════════════════════════════════ */}
      <group position={[2.8, -2.22, 0.0]}>
        {/* Low-profile stone basin lip */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.45, 0.50, 0.08, 24]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
        {/* Raw Turbid Mineral Runoff Water Surface */}
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.42, 24]} />
          <meshPhysicalMaterial
            color="#78350f"
            transparent
            opacity={0.88}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Clean Distant Sun Disc */}
      <mesh position={[18, 22, -30]}>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Floating Sunlight Ambient Dust Motes */}
      <points ref={dustParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 300 }, () => (Math.random() - 0.5) * 30)
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#fef3c7"
          size={0.03}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
