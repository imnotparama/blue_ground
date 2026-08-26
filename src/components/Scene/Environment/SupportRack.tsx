'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SupportRack = () => {
  const { activeHotspot, tanksOnly } = useSystemState();
  const rackRef = useRef<THREE.Group>(null);

  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  React.useEffect(() => {
    if (!rackRef.current) return;
    const mats: THREE.MeshStandardMaterial[] = [];
    rackRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        mats.push(child.material as THREE.MeshStandardMaterial);
      }
    });
    materialsRef.current = mats;
  }, []);

  useFrame((_, delta) => {
    const isDimmed = tanksOnly || activeHotspot !== null;
    const targetOpacity = isDimmed ? 0.08 : 1.0;
    const damp = 1.0 - Math.exp(-6 * delta);
    
    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = true;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);
    }
  });

  const columns = [
    { x: -2.6 },
    { x: -0.7 },
    { x: 1.1 },
    { x: 2.9 }
  ];

  const rails = [
    { y: -1.65 },
    { y: -0.40 },
    { y: 0.58 }
  ];

  return (
    <group ref={rackRef}>
      {/* 40x40 Aluminium Extrusion Support Frame placed safely behind the tanks at z = -0.80 */}
      <group position={[0, 0, -0.80]}>
        
        {/* 1. VERTICAL POSTS */}
        {columns.map((col, i) => (
          <group key={i} position={[col.x, -0.65, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.045, 2.5, 0.045]} />
              <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.88} />
            </mesh>
            <mesh position={[0, -1.25, 0]} castShadow>
              <boxGeometry args={[0.12, 0.03, 0.12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[0, 1.25, 0]} castShadow>
              <boxGeometry args={[0.05, 0.015, 0.05]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* 2. HORIZONTAL MOUNTING UNISTRUTS */}
        {rails.map((rail, i) => (
          <group key={i} position={[0.15, rail.y, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[6.0, 0.04, 0.04]} />
              <meshStandardMaterial color="#64748b" roughness={0.25} metalness={0.85} />
            </mesh>
            {columns.map((col, idx) => (
              <mesh key={idx} position={[col.x - 0.15, 0, 0.025]} castShadow>
                <boxGeometry args={[0.07, 0.07, 0.02]} />
                <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};
