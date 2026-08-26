'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const MiningEnvironment = () => {
  const { tanksOnly } = useSystemState();
  const dustParticlesRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (dustParticlesRef.current) {
      dustParticlesRef.current.rotation.y += 0.012 * delta;
    }
  });

  if (tanksOnly) return null; // Clean isolation mode hides environment props

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          CLEAN INDUSTRIAL INTAKE WATER SOURCE (Far Right x = 2.8)
          ═══════════════════════════════════════════════════════════════════════ */}
      <group position={[2.8, -2.22, 0.0]}>
        {/* Stainless / Stone Intake Wellhead Ring */}
        <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.38, 0.42, 0.10, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Chrome Collar Flange */}
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.40, 0.40, 0.02, 32]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.9} />
        </mesh>
        {/* Raw Turbid Mineral Runoff Water Surface */}
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.36, 32]} />
          <meshPhysicalMaterial
            color="#92400e"
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.1}
            transmission={0.4}
          />
        </mesh>
      </group>

      {/* Floating Sunlight Atmospheric Dust Particles */}
      <points ref={dustParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 250 }, () => (Math.random() - 0.5) * 22)
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#fef3c7"
          size={0.025}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
