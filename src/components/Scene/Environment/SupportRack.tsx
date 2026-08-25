'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SupportRack = () => {
  const { exploded, activeHotspot } = useSystemState();
  const rackRef = useRef<THREE.Group>(null);

  // Focus dimming traversal
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

  // Structural coordinates
  const columns = [
    { x: -2.3 },
    { x: -0.8 },
    { x: 1.0 },
    { x: 2.6 }
  ];

  const rails = [
    { y: -1.0 },
    { y: 0.0 },
    { y: 0.7 }
  ];

  return (
    <group ref={rackRef}>
      {/* Support Rack Frame centered at z = -0.6 */}
      <group position={[0, 0, -0.6]}>
        
        {/* 1. VERTICAL METALLIC COLUMNS */}
        {columns.map((col, i) => (
          <group key={i} position={[col.x, -0.7, 0]}>
            {/* Column Tube */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.025, 0.025, 3.0, 12]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Heavy Base flange mounting bolt block */}
            <mesh position={[0, -1.5, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Top Cap */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.02, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* 2. HORIZONTAL MOUNTING RAILS */}
        {rails.map((rail, i) => (
          <group key={i} position={[0.15, rail.y, 0]}>
            {/* Rails */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[5.0, 0.04, 0.035]} />
              <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Bracket attachments where rails cross columns */}
            {columns.map((col, idx) => (
              <mesh key={idx} position={[col.x - 0.15, 0, 0]} castShadow>
                <boxGeometry args={[0.06, 0.06, 0.05]} />
                <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 3. WALL STABILIZING BRACKETS */}
        {columns.map((col, i) => (
          <mesh key={i} position={[col.x, 0.5, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
