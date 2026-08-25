'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const BatteryUnit = () => {
  const { exploded, metrics, mode, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // LED battery level indicator light refs
  const ledRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame(() => {
    // Exploded View
    const targetY = exploded ? 0.35 : 0;
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // Dynamic LED illumination based on battery percentage
    const activeLedsCount = Math.ceil((metrics.batteryPercent / 100) * 5);
    ledRefs.current.forEach((mat, idx) => {
      if (mat) {
        const isActive = idx < activeLedsCount;
        let ledColor = '#10b981'; // Green for normal
        if (metrics.batteryPercent < 20) ledColor = '#ef4444'; // Red for low
        else if (metrics.batteryPercent < 50) ledColor = '#f59e0b'; // Amber

        if (isActive) {
          mat.color.set(ledColor);
          mat.emissive.set(ledColor);
          mat.emissiveIntensity = 2.0;
        } else {
          mat.color.set('#27272a');
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0.0;
        }
      }
    });

    // Focus dimming & Cyan glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'battery' && activeHotspot !== 'battery_pack';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat && !ledRefs.current.includes(mat)) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            if (mat.emissive) {
              if (hovered && !isDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.4, 0.1);
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
    setActiveHotspot('battery');
    setCameraPreset('BATTERY');
  };

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Battery Box — mounted on top-front of Primary Tank lid at x = -1.45, y = 0.32, z = 0.35 */}
      <group position={[-1.45, 0.32, 0.35]}>
        
        {/* Main Casing Housing */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.20, 0.32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
        </mesh>

        {/* Heat dissipation cooling fins on rear */}
        {[-0.20, -0.10, 0.0, 0.10, 0.20].map((xVal, i) => (
          <mesh key={i} position={[xVal, 0.0, -0.165]} castShadow>
            <boxGeometry args={[0.015, 0.16, 0.02]} />
            <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}

        {/* Front Metal Bezel & Battery Status Panel */}
        <mesh position={[0, 0, 0.162]} castShadow>
          <boxGeometry args={[0.48, 0.14, 0.005]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* LED 5-Segment State-of-Charge Bar */}
        <group position={[-0.10, 0.02, 0.166]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[i * 0.045, 0, 0]}>
              <boxGeometry args={[0.028, 0.015, 0.004]} />
              <meshStandardMaterial 
                ref={(el) => { if (el) ledRefs.current[i] = el; }}
                color="#10b981" 
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Top Terminal Connectors (+ and -) */}
        {/* Positive Red Terminal */}
        <group position={[-0.18, 0.11, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.025, 12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.015, 8]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>

        {/* Negative Black Terminal */}
        <group position={[0.18, 0.11, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.025, 12]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.015, 8]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>

        {/* Mounting Brackets */}
        {[-0.26, 0.26].map((xVal, idx) => (
          <mesh key={idx} position={[xVal, -0.09, 0]} castShadow>
            <boxGeometry args={[0.04, 0.02, 0.28]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
