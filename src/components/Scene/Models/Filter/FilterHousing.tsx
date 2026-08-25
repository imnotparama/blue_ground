'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const FilterHousing = () => {
  const { exploded, transparent, cutaway, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  
  const mainGroupRef = useRef<THREE.Group>(null);
  const leftCasingRef = useRef<THREE.Group>(null);
  const rightCasingRef = useRef<THREE.Group>(null);
  const filterMediaRef = useRef<THREE.Group>(null);
  
  const leftMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const rightMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    // 1. Splitting Casing shells in exploded view
    const targetSplitX = exploded ? 0.35 : 0;
    const targetMediaZ = exploded ? 0.20 : 0;

    if (leftCasingRef.current) {
      leftCasingRef.current.position.x = THREE.MathUtils.lerp(leftCasingRef.current.position.x, -targetSplitX, 0.08);
    }
    if (rightCasingRef.current) {
      rightCasingRef.current.position.x = THREE.MathUtils.lerp(rightCasingRef.current.position.x, targetSplitX, 0.08);
    }
    if (filterMediaRef.current) {
      filterMediaRef.current.position.z = THREE.MathUtils.lerp(filterMediaRef.current.position.z, targetMediaZ, 0.08);
    }

    // Smooth scale up on hover
    if (mainGroupRef.current) {
      const targetScale = hovered ? 1.025 : 1.0;
      mainGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(mainGroupRef.current.scale.x, targetScale, 0.15));
    }

    // Adjust housing transparency
    const isDimmed = activeHotspot !== null && activeHotspot !== 'filter_housing' && activeHotspot !== 'filter' && activeHotspot !== 'inside_filter' && activeHotspot !== 'sedimentation_tank';
    const targetOpacity = isDimmed ? 0.12 : 1.0;
    const casingTargetOpacity = isDimmed ? 0.05 : (transparent || cutaway) ? 0.05 : 0.45;
    
    if (leftMatRef.current) {
      leftMatRef.current.opacity = THREE.MathUtils.lerp(leftMatRef.current.opacity, casingTargetOpacity, 0.1);
      leftMatRef.current.transparent = true;
    }
    if (rightMatRef.current) {
      rightMatRef.current.opacity = THREE.MathUtils.lerp(rightMatRef.current.opacity, casingTargetOpacity, 0.1);
      rightMatRef.current.transparent = true;
    }

    // Media layers hover glow & dimming
    if (filterMediaRef.current) {
      filterMediaRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
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
    setActiveHotspot('filter_housing');
    setCameraPreset('FILTER_HOUSING');
  };

  // Stacked multi-stage filter media layers
  const layers = [
    { height: 0.12, y: 0.52, color: '#94a3b8', roughness: 0.2, metalness: 0.9, name: 'Stainless Mesh' },
    { height: 0.28, y: 0.32, color: '#64748b', roughness: 0.85, metalness: 0.1, name: 'Sedimentation Gravel' },
    { height: 0.32, y: 0.02, color: '#eab308', roughness: 0.9, metalness: 0.0, name: 'Quartz Sand' },
    { height: 0.36, y: -0.32, color: '#18181b', roughness: 0.7, metalness: 0.3, name: 'Activated Carbon' },
    { height: 0.16, y: -0.58, color: '#f8fafc', roughness: 0.5, metalness: 0.0, name: 'Fine Polishing Filter' },
  ];

  return (
    <group 
      ref={mainGroupRef}
      position={[0.15, -0.95, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 1. CYLINDRICAL SPLIT CASING */}
      
      {/* Left half shell casing */}
      <group ref={leftCasingRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.28, 1.45, 24, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial
            ref={leftMatRef}
            color="#0891b2"
            transparent
            opacity={0.45}
            roughness={0.06}
            metalness={0.08}
            transmission={0.84}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        
        {/* Metal banding rims (split) */}
        {[-0.60, 0.0, 0.60].map((yVal, i) => (
          <mesh key={i} position={[0, yVal, 0]} castShadow>
            <cylinderGeometry args={[0.29, 0.29, 0.025, 24, 1, true, 0, Math.PI]} />
            <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Right half shell casing */}
      <group ref={rightCasingRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.28, 1.45, 24, 1, false, Math.PI, Math.PI]} />
          <meshPhysicalMaterial
            ref={rightMatRef}
            color="#0891b2"
            transparent
            opacity={0.45}
            roughness={0.06}
            metalness={0.08}
            transmission={0.84}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        
        {/* Metal banding rims (split) */}
        {[-0.60, 0.0, 0.60].map((yVal, i) => (
          <mesh key={i} position={[0, yVal, 0]} castShadow>
            <cylinderGeometry args={[0.29, 0.29, 0.025, 24, 1, true, Math.PI, Math.PI]} />
            <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 2. INNER STACKED FILTER MEDIA */}
      <group ref={filterMediaRef}>
        {layers.map((layer, idx) => {
          const isMesh = idx === 0;
          return (
            <mesh key={idx} position={[0, layer.y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.25, 0.25, layer.height, 20]} />
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
          <cylinderGeometry args={[0.255, 0.255, 1.35, 20, 1, true]} />
          <meshBasicMaterial 
            color="#22d3ee" 
            wireframe 
            transparent 
            opacity={exploded ? 0.12 : 0.0} 
          />
        </mesh>
      </group>

      {/* 3. CAP INLETS AND CONNECTIONS */}
      {/* Top cap with pipe inlet nozzle */}
      <group position={[0, 0.75, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.30, 0.30, 0.06, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Inlet connection collar */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Bottom Funnel Outlet */}
      <group position={[0, -0.78, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.30, 0.05, 0.12, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Outlet connection collar */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Tank Base Mount Flange on floor */}
      <mesh position={[0, -0.80, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.33, 0.33, 0.03, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.85} />
      </mesh>
    </group>
  );
};
