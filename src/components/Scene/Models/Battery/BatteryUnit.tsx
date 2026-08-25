'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const BatteryUnit = () => {
  const { exploded, metrics, mode, cameraPreset, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // References for lid sliding and opacity animation
  const lidRef = useRef<THREE.Mesh>(null);
  const lidMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // LED mesh references for charge level indicators
  const chargeLedRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  useFrame((state, delta) => {
    // 1. Exploded view: Whole battery slides left
    const targetX = exploded ? -0.6 : 0;
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);

      // Smooth scale up on hover (3%)
      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Battery Lid Opening: Slide lid backward and fade opacity when battery is active preset or exploded
    const isOpen = cameraPreset === 'BATTERY' || exploded || activeHotspot === 'battery';
    const targetLidZ = isOpen ? -0.3 : 0.0;
    const targetLidY = isOpen ? 0.08 : 0.0;
    const targetLidOpacityVal = isOpen ? 0.2 : 1.0;

    if (lidRef.current) {
      lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, targetLidZ, 0.08);
      lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, targetLidY, 0.08);
    }

    // 3. LED pulse animation if battery is charging (solarWatts > 5)
    const isCharging = metrics.solarWatts > 5 && mode === 'NORMAL';
    if (isCharging) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 6) * 0.4 + 0.6;
      const activeLedsCount = Math.ceil(metrics.batteryPercent / 20);
      const activeLedIndex = Math.min(4, Math.max(0, activeLedsCount - 1));
      
      chargeLedRefs.forEach((ref, index) => {
        if (ref.current) {
          const mat = ref.current.material as THREE.MeshStandardMaterial;
          if (index === activeLedIndex) {
            mat.emissiveIntensity = pulse * 1.5;
          } else if (index < activeLedIndex) {
            mat.emissiveIntensity = 1.0;
          } else {
            mat.emissiveIntensity = 0.0;
          }
        }
      });
    } else {
      const activeLedsCount = Math.round(metrics.batteryPercent / 20);
      chargeLedRefs.forEach((ref, index) => {
        if (ref.current) {
          const mat = ref.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = index < activeLedsCount ? 1.0 : 0.0;
        }
      });
    }

    // 4. Focus dimming traversal & Cyan outline glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'battery';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Skip charge indicators LEDs
          if (chargeLedRefs.some(ref => ref.current === child)) return;

          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            
            // Lid has its own opacity targets
            if (child === lidRef.current) {
              const currentLidTarget = isDimmed ? 0.15 : targetLidOpacityVal;
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, currentLidTarget, 0.08);
            } else {
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
            }

            // Glow casing cyan on hover
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
    setActiveHotspot('battery');
    setCameraPreset('BATTERY');
  };

  // Green battery cells layout
  const cells = [
    { x: -0.22 }, { x: -0.11 }, { x: 0 }, { x: 0.11 }, { x: 0.22 }
  ];

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Battery Box position: centered at x=-0.2, y=0.52, z=0 */}
      <group position={[-0.2, 0.52, 0]}>
        
        {/* A. BOTTOM CASING HOUSING */}
        <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.1, 0.5]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* B. DETAILED INTERNAL BATTERY CELLS */}
        <group position={[0, -0.04, 0]}>
          {cells.map((cell, idx) => (
            <mesh key={idx} position={[cell.x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.042, 0.042, 0.38, 12]} />
              <meshStandardMaterial color="#047857" roughness={0.15} metalness={0.4} />
            </mesh>
          ))}
          {/* Silver/copper connection busbars on top of cells */}
          {[-0.165, 0.055].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, 0.045, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <boxGeometry args={[0.008, 0.18, 0.03]} />
              <meshStandardMaterial color="#b45309" roughness={0.1} metalness={0.9} />
            </mesh>
          ))}
          {[-0.055, 0.165].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, 0.045, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <boxGeometry args={[0.008, 0.18, 0.03]} />
              <meshStandardMaterial color="#b45309" roughness={0.1} metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* C. SLIDING TOP COVER LID */}
        <mesh ref={lidRef} position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.704, 0.12, 0.504]} />
          <meshStandardMaterial
            ref={lidMatRef}
            color="#27272a"
            roughness={0.2}
            metalness={0.8}
            depthWrite={false}
          />
        </mesh>

        {/* Heatsink Fins */}
        {[-0.355, 0.355].map((xSide, i) => (
          <group key={i} position={[xSide, -0.02, 0]}>
            {[-0.15, -0.05, 0.05, 0.15].map((zOffset, idx) => (
              <mesh key={idx} position={[0, 0, zOffset]} castShadow>
                <boxGeometry args={[0.012, 0.14, 0.015]} />
                <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.9} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Battery Power terminals */}
        <group position={[0.2, 0.12, 0.15]}>
          <mesh position={[-0.05, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0.05, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.1} metalness={0.9} />
          </mesh>
        </group>

        {/* Status LED Indicator Panel */}
        <group position={[0, -0.06, 0.252]}>
          <mesh>
            <boxGeometry args={[0.36, 0.06, 0.005]} />
            <meshStandardMaterial color="#09090b" roughness={0.7} metalness={0.2} />
          </mesh>

          {[-0.12, -0.06, 0, 0.06, 0.12].map((xOffset, index) => {
            const isLow = metrics.batteryPercent < 15;
            const ledColor = isLow ? '#ef4444' : '#10b981';
            return (
              <mesh key={index} ref={chargeLedRefs[index]} position={[xOffset, 0, 0.003]}>
                <sphereGeometry args={[0.016, 8, 8]} />
                <meshStandardMaterial
                  color={ledColor}
                  emissive={ledColor}
                  emissiveIntensity={index * 20 < metrics.batteryPercent ? 1.0 : 0.0}
                  roughness={0.1}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
};
