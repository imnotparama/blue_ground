'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const FilterHousing = () => {
  const { exploded, transparent, cutaway, activeHotspot, setActiveHotspot, setCameraPreset, mode } = useSystemState();
  
  const mainGroupRef = useRef<THREE.Group>(null);
  const leftCasingRef = useRef<THREE.Group>(null);
  const rightCasingRef = useRef<THREE.Group>(null);
  const filterMediaRef = useRef<THREE.Group>(null);
  const pressureGaugeNeedleRef = useRef<THREE.Mesh>(null);
  
  const leftMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const rightMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Exploded View splitting
    const targetSplitZ = exploded ? 0.25 : 0;
    const targetMediaY = exploded ? 0.15 : 0;

    if (leftCasingRef.current) {
      leftCasingRef.current.position.z = THREE.MathUtils.lerp(leftCasingRef.current.position.z, targetSplitZ, 0.08);
    }
    if (rightCasingRef.current) {
      rightCasingRef.current.position.z = THREE.MathUtils.lerp(rightCasingRef.current.position.z, -targetSplitZ, 0.08);
    }
    if (filterMediaRef.current) {
      filterMediaRef.current.position.y = THREE.MathUtils.lerp(filterMediaRef.current.position.y, targetMediaY, 0.08);
    }

    if (mainGroupRef.current) {
      const targetScale = hovered ? 1.03 : 1.0;
      mainGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(mainGroupRef.current.scale.x, targetScale, 0.15));
    }

    // Dynamic Pressure Gauge Needle flutter
    if (pressureGaugeNeedleRef.current) {
      const isFiltering = mode === 'TURBIDITY' || mode === 'NORMAL';
      const baseAngle = isFiltering ? -0.4 : -1.2;
      const flutter = isFiltering ? Math.sin(time * 12) * 0.04 : 0;
      pressureGaugeNeedleRef.current.rotation.z = baseAngle + flutter;
    }

    // Material opacity
    const isDimmed = activeHotspot !== null && activeHotspot !== 'filter_housing' && activeHotspot !== 'filtration_tank';
    const targetOpacity = isDimmed ? 0.12 : 1.0;
    const casingTargetOpacity = isDimmed ? 0.05 : (transparent || cutaway) ? 0.05 : 0.48;
    
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
    setActiveHotspot('filter_housing');
    setCameraPreset('FILTER_HOUSING');
  };

  // Multi-stage RO Drinking Water Filter Stages
  const filterStages = [
    { x: 0.36, width: 0.22, radius: 0.11, color: '#f8fafc', roughness: 0.3, metalness: 0.1, name: 'Stage 1: PP Sediment Pre-Filter' },
    { x: 0.12, width: 0.22, radius: 0.11, color: '#18181b', roughness: 0.7, metalness: 0.3, name: 'Stage 2: Granular Carbon Block (CTO)' },
    { x: -0.14, width: 0.26, radius: 0.12, color: '#0284c7', roughness: 0.2, metalness: 0.7, name: 'Stage 3: RO Membrane Cartridge' },
    { x: -0.38, width: 0.18, radius: 0.10, color: '#fef08a', roughness: 0.4, metalness: 0.2, name: 'Stage 4: Post-Carbon Mineralizer' },
  ];

  return (
    <group 
      ref={mainGroupRef}
      position={[-1.40, 0.38, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* ════════════════════════════════════════════════════════════════════
          SECONDARY DRINKING WATER RO FILTRATION TANK / MODULE
          Positioned inline on the bad-water pump loop: [-0.85, 0.40, 0]
          ════════════════════════════════════════════════════════════════════ */}

      {/* 1. HORIZONTAL MULTI-STAGE COMMERCIAL RO CARTRIDGE HOUSING */}
      {/* Front Half Transparent Polycarbonate Shell */}
      <group ref={leftCasingRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.135, 0.135, 1.05, 24, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial
            ref={leftMatRef}
            color="#0891b2"
            transparent
            opacity={0.48}
            roughness={0.06}
            metalness={0.08}
            transmission={0.88}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Rear Half Shell */}
      <group ref={rightCasingRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.135, 0.135, 1.05, 24, 1, false, Math.PI, Math.PI]} />
          <meshPhysicalMaterial
            ref={rightMatRef}
            color="#0891b2"
            transparent
            opacity={0.48}
            roughness={0.06}
            metalness={0.08}
            transmission={0.88}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. INNER RO FILTER CARTRIDGE MEDIA LAYERS */}
      <group ref={filterMediaRef}>
        {filterStages.map((stage, idx) => (
          <group key={idx} position={[stage.x, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[stage.radius, stage.radius, stage.width, 20]} />
              <meshStandardMaterial
                color={stage.color}
                roughness={stage.roughness}
                metalness={stage.metalness}
              />
            </mesh>
            {/* Stage Sealing O-Ring Ring */}
            <mesh position={[stage.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[stage.radius + 0.005, 0.006, 8, 20]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Dynamic Glow Tube when filtration is active */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.138, 0.138, 1.02, 20, 1, true]} />
          <meshBasicMaterial
            color="#22d3ee"
            wireframe
            transparent
            opacity={exploded ? 0.15 : 0.0}
          />
        </mesh>
      </group>

      {/* 3. HEAVY END CAPS & QUICK-CONNECT INLET / OUTLET FITTINGS */}
      {/* Right Inlet Cap (receives bad water from filtration pump) */}
      <group position={[0.54, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.145, 0.145, 0.08, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* Quick-connect John Guest Fitting with Blue Locking Clip */}
        <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.036, 0.005, 8, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* Left Outlet Cap (discharges purified water to Primary Tank) */}
      <group position={[-0.54, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.145, 0.145, 0.08, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* Quick-connect Fitting with Blue Locking Clip */}
        <mesh position={[-0.06, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.036, 0.005, 8, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* 4. ANALOG RO PRESSURE GAUGE (Dial Indicator with Dual PSI/Bar Scale) */}
      <group position={[0.20, 0.18, 0.08]} rotation={[0.2, 0, 0]}>
        {/* Brass Stem */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Dial Stainless Bezel */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 20]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Dial Face White Background */}
        <mesh position={[0, 0, 0.011]}>
          <circleGeometry args={[0.058, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Green Safe Pressure Zone Arc */}
        <mesh position={[0, 0, 0.0115]}>
          <ringGeometry args={[0.038, 0.048, 16, 1, Math.PI * 0.25, Math.PI * 0.7]} />
          <meshStandardMaterial color="#22c55e" roughness={0.5} />
        </mesh>
        {/* Red Overpressure Warning Zone Arc */}
        <mesh position={[0, 0, 0.0115]}>
          <ringGeometry args={[0.038, 0.048, 16, 1, Math.PI * 0.95, Math.PI * 0.35]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
        {/* Pressure Gauge Red Needle */}
        <mesh ref={pressureGaugeNeedleRef} position={[0, 0, 0.013]}>
          <boxGeometry args={[0.005, 0.045, 0.002]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
        {/* Center Chrome Cap */}
        <mesh position={[0, 0, 0.014]}>
          <cylinderGeometry args={[0.008, 0.008, 0.004, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* 5. WALL MOUNTING CLAMP BRACKETS */}
      {[-0.35, 0.35].map((xVal, i) => (
        <group key={i} position={[xVal, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.145, 0.015, 8, 24]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Identification Nameplate Label */}
      <mesh position={[0, -0.15, 0.13]}>
        <boxGeometry args={[0.60, 0.08, 0.004]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
    </group>
  );
};
