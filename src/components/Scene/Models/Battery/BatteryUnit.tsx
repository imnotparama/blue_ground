'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const BatteryUnit = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const ledRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame(() => {
    const targetY = exploded ? 0.35 : 0;
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    const activeLedsCount = Math.ceil((metrics.batteryPercent / 100) * 5);
    ledRefs.current.forEach((mat, idx) => {
      if (mat) {
        const isActive = idx < activeLedsCount;
        let ledColor = '#10b981';
        if (metrics.batteryPercent < 20) ledColor = '#ef4444';
        else if (metrics.batteryPercent < 50) ledColor = '#f59e0b';

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
      {/* Battery Source Box in the middle of roof at x = -0.65, y = 0.74, z = 0 */}
      <group position={[-0.65, 0.74, 0]}>
        
        {/* Main Casing Housing */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.70, 0.28, 0.40]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
        </mesh>

        {/* Battery Source Label */}
        <mesh position={[0, 0.04, 0.202]}>
          <boxGeometry args={[0.55, 0.12, 0.005]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Cooling Fins */}
        {[-0.25, -0.15, -0.05, 0.05, 0.15, 0.25].map((xVal, i) => (
          <mesh key={i} position={[xVal, 0.0, -0.205]} castShadow>
            <boxGeometry args={[0.015, 0.22, 0.02]} />
            <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}

        {/* LED 5-Segment State-of-Charge Bar */}
        <group position={[-0.10, -0.08, 0.204]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[i * 0.05, 0, 0]}>
              <boxGeometry args={[0.035, 0.016, 0.004]} />
              <meshStandardMaterial 
                ref={(el) => { if (el) ledRefs.current[i] = el; }}
                color="#10b981" 
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Top Terminal Connectors (+ and -) */}
        {/* Positive Red Terminal (Left side to Solar) */}
        <group position={[-0.24, 0.15, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>

        {/* Negative Black Terminal (Right side to ESP32) */}
        <group position={[0.24, 0.15, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
