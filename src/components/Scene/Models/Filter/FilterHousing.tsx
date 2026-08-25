'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const FilterHousing = () => {
  const { exploded, transparent, cutaway, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  
  // References to animate splitting casing shells and materials
  const mainGroupRef = useRef<THREE.Group>(null);
  const leftCasingRef = useRef<THREE.Group>(null);
  const rightCasingRef = useRef<THREE.Group>(null);
  const filterMediaRef = useRef<THREE.Group>(null);
  
  const leftMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const rightMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    // 1. Splitting Casing shells in exploded view
    const targetSplitX = exploded ? 0.35 : 0;
    const targetMediaZ = exploded ? 0.18 : 0;

    if (leftCasingRef.current) {
      leftCasingRef.current.position.x = THREE.MathUtils.lerp(leftCasingRef.current.position.x, -targetSplitX, 0.08);
    }
    if (rightCasingRef.current) {
      rightCasingRef.current.position.x = THREE.MathUtils.lerp(rightCasingRef.current.position.x, targetSplitX, 0.08);
    }
    if (filterMediaRef.current) {
      filterMediaRef.current.position.z = THREE.MathUtils.lerp(filterMediaRef.current.position.z, targetMediaZ, 0.08);
    }

    // Smooth scale up on hover (3%)
    if (mainGroupRef.current) {
      const targetScale = hovered ? 1.03 : 1.0;
      mainGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(mainGroupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Adjust housing transparency dynamically when transparent or cutaway is active
    const isDimmed = activeHotspot !== null && activeHotspot !== 'filter_housing' && activeHotspot !== 'filter' && activeHotspot !== 'inside_filter';
    const targetOpacity = isDimmed ? 0.15 : 1.0;
    const casingTargetOpacity = isDimmed ? 0.05 : (transparent || cutaway) ? 0.05 : 0.35;
    
    if (leftMatRef.current) {
      leftMatRef.current.opacity = THREE.MathUtils.lerp(leftMatRef.current.opacity, casingTargetOpacity, 0.1);
      leftMatRef.current.transparent = true;
    }
    if (rightMatRef.current) {
      rightMatRef.current.opacity = THREE.MathUtils.lerp(rightMatRef.current.opacity, casingTargetOpacity, 0.1);
      rightMatRef.current.transparent = true;
    }

    // Media layers dimming & hover glow
    if (filterMediaRef.current) {
      filterMediaRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            // Glow cyan on hover
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

    // Cap dimming and glows
    if (mainGroupRef.current) {
      mainGroupRef.current.traverse((child) => {
        // Exclude meshes inside the filter media stack (handled separately above)
        if (child.parent === filterMediaRef.current) return;
        if (child === leftCasingRef.current || child === rightCasingRef.current) return;

        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat && mat !== leftMatRef.current && mat !== rightMatRef.current) {
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
    setActiveHotspot('filter_housing');
    setCameraPreset('FILTER_HOUSING');
  };

  // Details for filter layers
  const layers = [
    { height: 0.1, y: 0.55, color: '#94a3b8', roughness: 0.2, metalness: 0.9, name: 'Coarse Mesh' },
    { height: 0.25, y: 0.38, color: '#64748b', roughness: 0.8, metalness: 0.1, name: 'Gravel' },
    { height: 0.3, y: 0.1, color: '#eab308', roughness: 0.9, metalness: 0.0, name: 'Sand' },
    { height: 0.35, y: -0.22, color: '#18181b', roughness: 0.7, metalness: 0.3, name: 'Activated Carbon' },
    { height: 0.15, y: -0.48, color: '#f4f4f5', roughness: 0.6, metalness: 0.0, name: 'Fine Filter' },
  ];

  return (
    <group 
      ref={mainGroupRef}
      position={[2.2, -0.6, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 1. CYLINDRICAL SPLIT CASING */}
      
      {/* Left half shell casing */}
      <group ref={leftCasingRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 1.3, 16, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial
            ref={leftMatRef}
            color="#0891b2"
            transparent
            opacity={0.35}
            roughness={0.15}
            metalness={0.1}
            transmission={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        
        {/* Metal banding rims (split) */}
        {[-0.64, 0.64].map((yVal, i) => (
          <mesh key={i} position={[0, yVal, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.27, 0.03, 16, 1, true, 0, Math.PI]} />
            <meshStandardMaterial color="#4b5563" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Right half shell casing */}
      <group ref={rightCasingRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 1.3, 16, 1, false, Math.PI, Math.PI]} />
          <meshPhysicalMaterial
            ref={rightMatRef}
            color="#0891b2"
            transparent
            opacity={0.35}
            roughness={0.15}
            metalness={0.1}
            transmission={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        
        {/* Metal banding rims (split) */}
        {[-0.64, 0.64].map((yVal, i) => (
          <mesh key={i} position={[0, yVal, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.27, 0.03, 16, 1, true, Math.PI, Math.PI]} />
            <meshStandardMaterial color="#4b5563" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 2. INNER STACKED FILTER MEDIA */}
      <group ref={filterMediaRef}>
        {layers.map((layer, idx) => {
          const isMesh = idx === 0;
          return (
            <mesh key={idx} position={[0, layer.y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.23, 0.23, layer.height, 16]} />
              <meshStandardMaterial
                color={layer.color}
                roughness={layer.roughness}
                metalness={layer.metalness}
                wireframe={isMesh}
                transparent={isMesh}
                opacity={isMesh ? 0.75 : 1}
              />
            </mesh>
          );
        })}

        {/* Dynamic Emissive highlight ring for filter activation */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 1.2, 16, 1, true]} />
          <meshBasicMaterial 
            color="#22d3ee" 
            wireframe 
            transparent 
            opacity={exploded ? 0.08 : 0.0} 
          />
        </mesh>
      </group>

      {/* 3. CAP INLETS AND CONNECTIONS */}
      {/* Top cap */}
      <mesh position={[0, 0.66, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.06, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Bottom funnel */}
      <mesh position={[0, -0.71, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.05, 0.1, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
};
