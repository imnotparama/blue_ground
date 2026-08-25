'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SupportRack = () => {
  const { activeHotspot } = useSystemState();
  const rackRef = useRef<THREE.Group>(null);

  // Focus dimming
  useFrame(() => {
    const isDimmed = activeHotspot !== null;
    const targetOpacity = isDimmed ? 0.15 : 1.0;
    
    if (rackRef.current) {
      rackRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
          }
        }
      });
    }
  });

  // Vertical structural columns placed behind the tanks at z = -0.85
  const columns = [
    { x: -3.2 },
    { x: -0.9 },
    { x: 1.2 },
    { x: 3.0 }
  ];

  const rails = [
    { y: -1.65 },
    { y: -0.50 },
    { y: 0.25 }
  ];

  return (
    <group ref={rackRef}>
      {/* Heavy-Duty Industrial Aluminium Support Unistrut Frame positioned behind the tanks at z = -0.85 */}
      <group position={[0, 0, -0.85]}>
        
        {/* 1. VERTICAL STRUCTURAL POSTS */}
        {columns.map((col, i) => (
          <group key={i} position={[col.x, -0.75, 0]}>
            {/* 40x40 Aluminium Extrusion Column */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.045, 2.4, 0.045]} />
              <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.88} />
            </mesh>
            {/* Concrete Pad Base Flange Plate */}
            <mesh position={[0, -1.20, 0]} castShadow>
              <boxGeometry args={[0.12, 0.03, 0.12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Column Top Protective Cap */}
            <mesh position={[0, 1.20, 0]} castShadow>
              <boxGeometry args={[0.05, 0.015, 0.05]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* 2. HORIZONTAL MOUNTING UNISTRUTS */}
        {rails.map((rail, i) => (
          <group key={i} position={[-0.10, rail.y, 0]}>
            {/* Horizontal Rail Bar */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[6.4, 0.04, 0.04]} />
              <meshStandardMaterial color="#64748b" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Steel Gusset Bracket Joints at each column intersection */}
            {columns.map((col, idx) => (
              <mesh key={idx} position={[col.x + 0.10, 0, 0.025]} castShadow>
                <boxGeometry args={[0.07, 0.07, 0.02]} />
                <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 3. TANK STABILIZING TIE BRACKETS (Connecting back frame to tanks) */}
        {/* Left tie bracket to Primary Tank */}
        <mesh position={[-2.0, 0.20, 0.15]} castShadow>
          <boxGeometry args={[0.03, 0.03, 0.30]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Right tie bracket to Secondary Tank */}
        <mesh position={[2.1, -0.30, 0.20]} castShadow>
          <boxGeometry args={[0.03, 0.03, 0.40]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
