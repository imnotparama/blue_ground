'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const WaterPump = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  
  const groupRef = useRef<THREE.Group>(null);
  const impellerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  React.useEffect(() => {
    if (!groupRef.current) return;
    const mats: THREE.MeshStandardMaterial[] = [];
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        mats.push(child.material as THREE.MeshStandardMaterial);
      }
    });
    materialsRef.current = mats;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const damp = 1.0 - Math.exp(-6 * delta);

    const targetY = exploded ? 0.25 : 0;
    
    // High-frequency vibration when pump is running
    const vibrationAmp = metrics.pumpRpm > 0 ? 0.0015 : 0;
    const vibX = Math.sin(time * 90) * vibrationAmp;
    const vibZ = Math.sin(time * 100) * vibrationAmp;

    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.08 + targetY, damp);
      groupRef.current.position.x = 0.05 + vibX;
      groupRef.current.position.z = vibZ;

      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
    }

    // Impeller rotation
    if (impellerRef.current && metrics.pumpRpm > 0) {
      const radPerSec = (metrics.pumpRpm / 60) * 2 * Math.PI;
      impellerRef.current.rotation.y += radPerSec * delta;
    }

    const isDimmed = activeHotspot !== null && activeHotspot !== 'pump' && activeHotspot !== 'water_pump';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = true;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);

      if (mat.emissive) {
        if (hovered && !isDimmed) {
          mat.emissive.set('#06b6d4');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, damp);
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, damp);
        }
      }
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('pump');
    setCameraPreset('PUMP');
  };

  return (
    <group 
      ref={groupRef}
      position={[0.05, 0.08, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Water Pump (for filtration) mounted on secondary compartment shelf */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Base mounting brackets */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[0.16, 0.02, 0.08]} />
        <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Motor cap */}
      <mesh position={[0, 0.085, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.07, 0.025, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.5} />
      </mesh>

      {/* Transparent impeller chamber */}
      <mesh position={[0.05, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.04, 16, 1, true]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.35} 
          transmission={0.9} 
          roughness={0.05} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Rotating Impeller Fan */}
      <group ref={impellerRef} position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.8} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, (i * Math.PI) / 2, 0.2]} 
            position={[0, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.045, 0.007, 0.014]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Inlet Suction Collar from Secondary Chamber */}
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.04, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
};
