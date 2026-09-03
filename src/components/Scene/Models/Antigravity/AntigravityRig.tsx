'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const AntigravityRig = ({ children }: { children: React.ReactNode }) => {
  const { antigravityMode } = useSystemState();
  const rigRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const damp = 1.0 - Math.exp(-4 * delta);

    if (rigRef.current) {
      if (antigravityMode) {
        // Floating harmonic lift & gentle magnetic oscillation
        const floatY = 0.42 + Math.sin(time * 1.5) * 0.05;
        const floatRotZ = Math.sin(time * 0.8) * 0.012;
        const floatRotX = Math.cos(time * 0.6) * 0.008;

        rigRef.current.position.y = THREE.MathUtils.lerp(rigRef.current.position.y, floatY, damp);
        rigRef.current.rotation.z = THREE.MathUtils.lerp(rigRef.current.rotation.z, floatRotZ, damp);
        rigRef.current.rotation.x = THREE.MathUtils.lerp(rigRef.current.rotation.x, floatRotX, damp);
      } else {
        // Return to solid ground foundation
        rigRef.current.position.y = THREE.MathUtils.lerp(rigRef.current.position.y, 0, damp * 1.5);
        rigRef.current.rotation.z = THREE.MathUtils.lerp(rigRef.current.rotation.z, 0, damp * 1.5);
        rigRef.current.rotation.x = THREE.MathUtils.lerp(rigRef.current.rotation.x, 0, damp * 1.5);
      }
    }

    // Rotate the 3 magnetic energy subsystem rings when active
    if (antigravityMode) {
      if (ring1Ref.current) ring1Ref.current.rotation.y = time * 0.4;
      if (ring2Ref.current) ring2Ref.current.rotation.y = -time * 0.35;
      if (ring3Ref.current) ring3Ref.current.rotation.y = time * 0.45;
    }
  });

  return (
    <group ref={rigRef}>
      {children}

      {/* ══════════════════════════════════════════════════════════════════════
          ANTIGRAVITY MAGNETIC ENERGY RINGS & SUB-SYSTEM CALLOUTS
          ══════════════════════════════════════════════════════════════════════ */}
      {antigravityMode && (
        <group position={[0, 0, 0]}>
          {/* Ring 1: Solar Grid & Power Subsystem (Amber/Orange) */}
          <group ref={ring1Ref} position={[-1.65, 0.45, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.95, 0.012, 16, 64]} />
              <meshStandardMaterial 
                color="#f59e0b" 
                emissive="#f59e0b" 
                emissiveIntensity={2.5} 
                transparent 
                opacity={0.85} 
              />
            </mesh>
            {/* Tag Plaque */}
            <mesh position={[0, 0.98, 0]}>
              <boxGeometry args={[0.42, 0.08, 0.02]} />
              <meshStandardMaterial color="#09090b" roughness={0.5} />
            </mesh>
            <pointLight color="#f59e0b" intensity={1.5} distance={1.8} />
          </group>

          {/* Ring 2: 4-Stage Multi-Barrier Filtration (Cyan/Blue) */}
          <group ref={ring2Ref} position={[-0.70, 0.50, -0.62]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.25, 0.012, 16, 64]} />
              <meshStandardMaterial 
                color="#06b6d4" 
                emissive="#06b6d4" 
                emissiveIntensity={2.8} 
                transparent 
                opacity={0.85} 
              />
            </mesh>
            {/* Tag Plaque */}
            <mesh position={[0, 1.28, 0]}>
              <boxGeometry args={[0.55, 0.08, 0.02]} />
              <meshStandardMaterial color="#09090b" roughness={0.5} />
            </mesh>
            <pointLight color="#06b6d4" intensity={2.0} distance={2.4} />
          </group>

          {/* Ring 3: Hydraulic Purification Loop & Tanks (Emerald/Teal) */}
          <group ref={ring3Ref} position={[0.45, -0.10, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.10, 0.012, 16, 64]} />
              <meshStandardMaterial 
                color="#10b981" 
                emissive="#10b981" 
                emissiveIntensity={2.6} 
                transparent 
                opacity={0.85} 
              />
            </mesh>
            {/* Tag Plaque */}
            <mesh position={[0, 1.12, 0]}>
              <boxGeometry args={[0.48, 0.08, 0.02]} />
              <meshStandardMaterial color="#09090b" roughness={0.5} />
            </mesh>
            <pointLight color="#10b981" intensity={1.8} distance={2.0} />
          </group>

          {/* Upward Ambient Antigravity Levitation Field Light */}
          <pointLight position={[0, -0.4, 0]} color="#38bdf8" intensity={3.0} distance={4.5} />
        </group>
      )}
    </group>
  );
};
