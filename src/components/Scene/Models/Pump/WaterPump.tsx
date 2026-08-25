'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const WaterPump = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  
  // References for pump displacement and impeller rotation
  const groupRef = useRef<THREE.Group>(null);
  const impellerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Exploded view: Pump lifts upwards by 0.5 units
    const targetY = exploded ? 0.5 : 0;
    
    // High-frequency structural pump vibration when pump is running (RPM > 0)
    const vibrationAmp = metrics.pumpRpm > 0 ? 0.0015 : 0;
    const vibX = Math.sin(time * 90) * vibrationAmp;
    const vibY = Math.cos(time * 80) * vibrationAmp;
    const vibZ = Math.sin(time * 100) * vibrationAmp;

    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
      
      // Apply vibration offset
      groupRef.current.position.x = vibX;
      groupRef.current.position.z = vibZ;

      // Smooth scale up on hover (3%)
      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Impeller rotation: rotate relative to pump RPM
    if (impellerRef.current && metrics.pumpRpm > 0) {
      const radPerSec = (metrics.pumpRpm / 60) * 2 * Math.PI;
      impellerRef.current.rotation.y += radPerSec * delta;
    }

    // 3. Focus dimming traversal & Cyan outline glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'pump';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            // Glow pump body cyan on hover
            if (mat.emissive) {
              if (hovered && !isDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                // Restore motor cap red emissive, or clear others
                const standardEmissive = child.name === 'motor-cap' ? new THREE.Color('#3b0712') : new THREE.Color('#000000');
                const standardIntensity = child.name === 'motor-cap' ? 0.2 : 0.0;
                
                mat.emissive.lerp(standardEmissive, 0.1);
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, standardIntensity, 0.1);
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
      {/* Pump at secondary tank bottom outlet — secondary bottom y=-1.75, pump at y=-1.78 */}
      <group position={[2.2, -1.78, 0]}>
        {/* Main cylindrical pump body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Outer bracket clamps */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <boxGeometry args={[0.18, 0.02, 0.08]} />
          <meshStandardMaterial color="#4b5563" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Pump motor cap */}
        <mesh name="motor-cap" position={[0, 0.085, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Fluid Inlet Grate (bottom of the pump) */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Transparent impeller chamber window (shows rotating fan) */}
        <mesh position={[0, -0.01, 0.0]}>
          <cylinderGeometry args={[0.081, 0.081, 0.05, 16, 1, true]} />
          <meshPhysicalMaterial 
            transparent 
            opacity={0.3} 
            transmission={0.9} 
            roughness={0.05} 
            side={THREE.DoubleSide} 
          />
        </mesh>

        {/* Rotating Impeller Fan */}
        <group ref={impellerRef} position={[0, -0.01, 0]}>
          {/* Central pin shaft */}
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Impeller Blades */}
          {[0, 1, 2, 3].map((i) => (
            <mesh 
              key={i} 
              rotation={[0, (i * Math.PI) / 2, 0.2]} 
              position={[0, 0, 0]}
              castShadow
            >
              <boxGeometry args={[0.065, 0.008, 0.015]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Pipe Outlet Collar */}
        <mesh position={[0.05, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          <meshStandardMaterial color="#374151" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
