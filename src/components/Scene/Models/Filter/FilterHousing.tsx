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
    // Splitting Casing shells in exploded view
    const targetSplitX = exploded ? 0.30 : 0;
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

    if (mainGroupRef.current) {
      const targetScale = hovered ? 1.025 : 1.0;
      mainGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(mainGroupRef.current.scale.x, targetScale, 0.15));
    }

    // Material opacity
    const isDimmed = activeHotspot !== null && activeHotspot !== 'filter_housing' && activeHotspot !== 'sedimentation_tank';
    const targetOpacity = isDimmed ? 0.12 : 1.0;
    const casingTargetOpacity = isDimmed ? 0.05 : (transparent || cutaway) ? 0.05 : 0.50;
    
    if (leftMatRef.current) {
      leftMatRef.current.opacity = THREE.MathUtils.lerp(leftMatRef.current.opacity, casingTargetOpacity, 0.1);
    }
    if (rightMatRef.current) {
      rightMatRef.current.opacity = THREE.MathUtils.lerp(rightMatRef.current.opacity, casingTargetOpacity, 0.1);
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
    setActiveHotspot('sedimentation_tank');
    setCameraPreset('SEDIMENTATION_TANK');
  };

  // Stacked multi-stage sedimentation and filter media layers
  const layers = [
    { height: 0.10, y: 0.40, color: '#94a3b8', roughness: 0.2, metalness: 0.9, name: 'Stainless Mesh' },
    { height: 0.24, y: 0.23, color: '#64748b', roughness: 0.85, metalness: 0.1, name: 'Sedimentation Gravel' },
    { height: 0.28, y: -0.03, color: '#eab308', roughness: 0.9, metalness: 0.0, name: 'Quartz Sand' },
    { height: 0.32, y: -0.33, color: '#18181b', roughness: 0.7, metalness: 0.3, name: 'Activated Carbon' },
    { height: 0.14, y: -0.56, color: '#f8fafc', roughness: 0.5, metalness: 0.0, name: 'Fine Filter' },
  ];

  return (
    <group 
      ref={mainGroupRef}
      position={[1.9, 0.05, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 1. TRANSPARENT COMMERCIAL RO/SEDIMENTATION FILTER VESSEL CASING */}
      {/* Left half shell casing */}
      <group ref={leftCasingRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.20, 1.35, 24, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial
            ref={leftMatRef}
            color="#0891b2"
            transparent
            opacity={0.50}
            roughness={0.06}
            metalness={0.08}
            transmission={0.85}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Right half shell casing */}
      <group ref={rightCasingRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.20, 1.35, 24, 1, false, Math.PI, Math.PI]} />
          <meshPhysicalMaterial
            ref={rightMatRef}
            color="#0891b2"
            transparent
            opacity={0.50}
            roughness={0.06}
            metalness={0.08}
            transmission={0.85}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. INNER STACKED FILTER MEDIA */}
      <group ref={filterMediaRef}>
        {layers.map((layer, idx) => {
          const isMesh = idx === 0;
          return (
            <mesh key={idx} position={[0, layer.y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.23, 0.18, layer.height, 20]} />
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
      </group>

      {/* 3. RO FILTER HEAVY BLUE/BLACK TOP HOUSING HEAD */}
      <group position={[0, 0.68, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.29, 0.29, 0.12, 24]} />
          <meshStandardMaterial color="#0369a1" roughness={0.35} metalness={0.6} />
        </mesh>
        {/* Right Inlet Connector (from Borewell) */}
        <mesh position={[0.28, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Left Outlet Connector (to Flow Sensor & Secondary Compartment) */}
        <mesh position={[-0.28, 0.0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 4. BOTTOM DRAIN BOWL & STAND */}
      <mesh position={[0, -0.68, 0]} castShadow>
        <cylinderGeometry args={[0.20, 0.12, 0.08, 20]} />
        <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Identification Label Strip */}
      <mesh position={[0, -0.75, 0.20]}>
        <boxGeometry args={[0.6, 0.08, 0.005]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
    </group>
  );
};
