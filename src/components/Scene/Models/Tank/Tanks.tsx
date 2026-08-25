'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const Tanks = () => {
  const { transparent, cutaway, exploded, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  
  // References for animating exploded position and material opacity
  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);
  
  const outerMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const innerMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Hover states
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  useFrame((state, delta) => {
    // 1. Smoothly interpolate exploded offset
    const targetPrimaryY = exploded ? -0.3 : 0;
    const targetSecondaryY = exploded ? 0.3 : 0;
    
    if (primaryRef.current) {
      primaryRef.current.position.y = THREE.MathUtils.lerp(primaryRef.current.position.y, targetPrimaryY, 0.08);

      // Smooth scale on hover (2%)
      const targetScale = hoveredPrimary ? 1.02 : 1.0;
      primaryRef.current.scale.setScalar(THREE.MathUtils.lerp(primaryRef.current.scale.x, targetScale, 0.15));
    }
    if (secondaryRef.current) {
      secondaryRef.current.position.y = THREE.MathUtils.lerp(secondaryRef.current.position.y, targetSecondaryY, 0.08);

      // Smooth scale on hover (2%)
      const targetScale = hoveredSecondary ? 1.02 : 1.0;
      secondaryRef.current.scale.setScalar(THREE.MathUtils.lerp(secondaryRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Material opacities for glass walls, reacting to active hotspots
    const targetOuterOpacity = (transparent || cutaway) ? 0.08 : (activeHotspot !== null && activeHotspot !== 'primary_tank') ? 0.04 : 0.45;
    const targetInnerOpacity = (transparent || cutaway) ? 0.08 : (activeHotspot !== null && activeHotspot !== 'secondary_tank' && activeHotspot !== 'sedimentation_tank') ? 0.04 : 0.45;
    
    if (outerMatRef.current) {
      outerMatRef.current.opacity = THREE.MathUtils.lerp(outerMatRef.current.opacity, targetOuterOpacity, 0.1);
    }
    if (innerMatRef.current) {
      innerMatRef.current.opacity = THREE.MathUtils.lerp(innerMatRef.current.opacity, targetInnerOpacity, 0.1);
    }

    // 3. Highlight corner frame elements on hover
    const isPrimaryDimmed = activeHotspot !== null && activeHotspot !== 'primary_tank';
    const isSecondaryDimmed = activeHotspot !== null && activeHotspot !== 'secondary_tank' && activeHotspot !== 'sedimentation_tank';

    if (primaryRef.current) {
      primaryRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material !== outerMatRef.current) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, isPrimaryDimmed ? 0.15 : 1.0, 0.08);

            if (mat.emissive) {
              if (hoveredPrimary && !isPrimaryDimmed) {
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

    if (secondaryRef.current) {
      secondaryRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material !== innerMatRef.current) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, isSecondaryDimmed ? 0.15 : 1.0, 0.08);

            if (mat.emissive) {
              if (hoveredSecondary && !isSecondaryDimmed) {
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

  const handlePointerOverPrimary = (e: any) => {
    e.stopPropagation();
    setHoveredPrimary(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutPrimary = () => {
    setHoveredPrimary(false);
    document.body.style.cursor = 'default';
  };

  const handlePointerOverSecondary = (e: any) => {
    e.stopPropagation();
    setHoveredSecondary(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutSecondary = () => {
    setHoveredSecondary(false);
    document.body.style.cursor = 'default';
  };

  const handleClickPrimary = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('primary_tank');
    setCameraPreset('PRIMARY_TANK');
  };

  const handleClickSecondary = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('secondary_tank');
    setCameraPreset('SECONDARY_TANK');
  };

  return (
    <group>
      {/* 1. PRIMARY TANK CONTAINER */}
      <group 
        ref={primaryRef} 
        position={[-0.6, -0.6, 0]}
        onPointerOver={handlePointerOverPrimary}
        onPointerOut={handlePointerOutPrimary}
        onClick={handleClickPrimary}
      >
        {/* Main Tank Glass Box */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.0, 1.4]} />
          <meshPhysicalMaterial
            ref={outerMatRef}
            color="#083344" // Deep cyan glass
            transparent
            opacity={0.45}
            roughness={0.05} // lower roughness for shinier glass
            metalness={0.1}
            transmission={0.9} // higher transmission
            thickness={0.06} // Simulates glass thickness
            clearcoat={1.0} // clearcoat for glossy reflections
            clearcoatRoughness={0.01}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Structural Metal Corners */}
        <group>
          {/* Top Frame */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[2.22, 0.04, 1.42]} />
            <meshStandardMaterial color="#27272a" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Bottom Frame */}
          <mesh position={[0, -1.0, 0]} castShadow>
            <boxGeometry args={[2.22, 0.04, 1.42]} />
            <meshStandardMaterial color="#27272a" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Vertical Pillars */}
          {[-1.1, 1.1].map((x, i) => 
            [-0.7, 0.7].map((z, j) => (
              <mesh key={`${i}-${j}`} position={[x, 0, z]} castShadow>
                <boxGeometry args={[0.04, 2.0, 0.04]} />
                <meshStandardMaterial color="#27272a" roughness={0.4} metalness={0.8} />
              </mesh>
            ))
          )}
        </group>
      </group>

      {/* 2. SECONDARY TANK CONTAINER */}
      <group 
        ref={secondaryRef} 
        position={[0.1, 0.0, 0]}
        onPointerOver={handlePointerOverSecondary}
        onPointerOut={handlePointerOutSecondary}
        onClick={handleClickSecondary}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.8, 1.36]} />
          <meshPhysicalMaterial
            ref={innerMatRef}
            color="#0e7490"
            transparent
            opacity={0.45}
            roughness={0.08}
            metalness={0.1}
            transmission={0.88}
            thickness={0.04}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Support brackets holding secondary tank in place */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.82, 0.02, 1.38]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
