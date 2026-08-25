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

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Exploded view: Pump lifts slightly
    const targetY = exploded ? 0.35 : 0;
    
    // High-frequency structural pump vibration when pump is running (RPM > 0)
    const vibrationAmp = metrics.pumpRpm > 0 ? 0.0015 : 0;
    const vibX = Math.sin(time * 90) * vibrationAmp;
    const vibY = Math.cos(time * 80) * vibrationAmp;
    const vibZ = Math.sin(time * 100) * vibrationAmp;

    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
      
      groupRef.current.position.x = vibX;
      groupRef.current.position.z = vibZ;

      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Impeller rotation: rotate relative to pump RPM
    if (impellerRef.current && metrics.pumpRpm > 0) {
      const radPerSec = (metrics.pumpRpm / 60) * 2 * Math.PI;
      impellerRef.current.rotation.y += radPerSec * delta;
    }

    // 3. Focus dimming traversal & Cyan outline glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'pump' && activeHotspot !== 'water_pump';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            if (mat.emissive) {
              if (hovered && !isDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                mat.emissive.set('#000000');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, 0.1);
              }
            }
          }
        }
      });
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
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Pump location at secondary tank bottom outlet: centered at x = 1.55, y = -1.65, z = 0 */}
      <group position={[1.55, -1.65, 0]}>
        {/* Main cylindrical motor housing */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Outer mounting brackets */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <boxGeometry args={[0.18, 0.02, 0.08]} />
          <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.8} />
        </mesh>

        {/* Pump motor red end cap */}
        <mesh name="motor-cap" position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.075, 0.03, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.5} />
        </mesh>

        {/* Fluid Inlet Collar (connects to Secondary Tank outlet) */}
        <mesh position={[0.06, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Transparent impeller chamber window */}
        <mesh position={[-0.05, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 16, 1, true]} />
          <meshPhysicalMaterial 
            transparent 
            opacity={0.35} 
            transmission={0.9} 
            roughness={0.05} 
            side={THREE.DoubleSide} 
          />
        </mesh>

        {/* Rotating Impeller Fan */}
        <group ref={impellerRef} position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.8} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh 
              key={i} 
              rotation={[0, (i * Math.PI) / 2, 0.2]} 
              position={[0, 0, 0]}
              castShadow
            >
              <boxGeometry args={[0.05, 0.008, 0.015]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Pipe Outlet Collar (connects to horizontal pipe run) */}
        <mesh position={[-0.08, 0.0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
