'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const Water = () => {
  const { metrics, mode, dualVerificationMode } = useSystemState();

  const primaryWaterRef = useRef<THREE.Mesh>(null);
  const secondaryWaterRef = useRef<THREE.Mesh>(null);
  const sedWaterRef = useRef<THREE.Mesh>(null);

  const primaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const sedMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const tank2MatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const primaryBubblesRef = useRef<THREE.Points>(null);
  const secondaryBubblesRef = useRef<THREE.Points>(null);

  // Bubble point particles inside primary clean water
  const primaryBubblesData = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.1;
      positions[i * 3 + 1] = Math.random() * 1.5 - 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
      speeds[i] = Math.random() * 0.16 + 0.06;
    }
    return { positions, speeds };
  }, []);

  // Bubble point particles inside secondary raw settling chamber
  const secondaryBubblesData = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.0;
      positions[i * 3 + 1] = Math.random() * 0.44 + 0.06;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
      speeds[i] = Math.random() * 0.18 + 0.06;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    // 1. Primary Tank Water Level (Clean Water Storage)
    const fillFraction = Math.max(metrics.waterLevel / 100, 0.08);
    const currentHeight = fillFraction * 1.55;
    const dampFactor = 1.0 - Math.exp(-4.0 * delta);

    if (primaryWaterRef.current) {
      primaryWaterRef.current.scale.y = THREE.MathUtils.lerp(
        primaryWaterRef.current.scale.y,
        currentHeight,
        dampFactor
      );
      primaryWaterRef.current.position.y = -1.65 + primaryWaterRef.current.scale.y / 2;
    }

    // 2. Turbidity color transition for Sedimentation Tank & Secondary Raw Compartment
    const isTurbid = metrics.turbidity > 10 || mode === 'TURBIDITY';
    const targetSedColor = isTurbid ? new THREE.Color('#92400e') : new THREE.Color('#0284c7');
    const targetRawColor = isTurbid ? new THREE.Color('#b45309') : new THREE.Color('#0d9488');

    if (sedMatRef.current) {
      sedMatRef.current.color.lerp(targetSedColor, dampFactor);
      sedMatRef.current.opacity = THREE.MathUtils.lerp(sedMatRef.current.opacity, isTurbid ? 0.88 : 0.60, dampFactor);
    }

    if (secondaryMatRef.current) {
      secondaryMatRef.current.color.lerp(targetRawColor, dampFactor);
      secondaryMatRef.current.opacity = THREE.MathUtils.lerp(
        secondaryMatRef.current.opacity,
        isTurbid ? 0.85 : 0.62,
        dampFactor
      );
    }

    // 3. Tank 2 Water Color (Amber for High TDS / Recirculate vs Azure Blue for Potable Pass)
    if (tank2MatRef.current) {
      const isTank2HighTds = (metrics.tds2 || 0) > 100;
      const targetTank2Color = isTank2HighTds ? new THREE.Color('#f59e0b') : new THREE.Color('#38bdf8');
      tank2MatRef.current.color.lerp(targetTank2Color, dampFactor);
    }

    // 4. Animate Primary Bubbles
    if (primaryBubblesRef.current && primaryWaterRef.current) {
      const positions = primaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const topY = -1.65 + currentHeight;

      for (let i = 0; i < primaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += primaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > topY) {
          positions[i * 3 + 1] = -1.62;
          positions[i * 3] = (Math.random() - 0.5) * 3.1;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
        }
      }
      primaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Animate Secondary Bubbles
    if (secondaryBubblesRef.current) {
      const positions = secondaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const topY = 0.52;

      for (let i = 0; i < secondaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += secondaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > topY) {
          positions[i * 3 + 1] = 0.06;
          positions[i * 3] = (Math.random() - 0.5) * 1.0;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
        }
      }
      secondaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ════════════════════════════════════════════════════════════════════
          A. PRIMARY TANK PURE WATER (Clean Potable Storage Compartment)
             Bounds: x from -2.35 to 0.95 (center = -0.7), z from -0.6 to 0.6
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[-0.7, 0, 0]}>
        {/* Pure Water Volume */}
        <mesh ref={primaryWaterRef} position={[0, -0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.30, 1.0, 1.22]} />
          <meshPhysicalMaterial
            ref={primaryMatRef}
            color="#0284c7"
            transparent
            opacity={0.65}
            roughness={0.05}
            metalness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            depthWrite={false}
          />
        </mesh>

        {/* Bubbles */}
        <points ref={primaryBubblesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[primaryBubblesData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#e0f2fe"
            size={0.02}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </points>
      </group>

      {/* ════════════════════════════════════════════════════════════════════
          B. SECONDARY COMPARTMENT RAW WATER (Raw Settling & Sensor Chamber)
             Center: [0.45, 0.28, 0], Size: [1.06, 0.48, 1.20]
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[0.45, 0, 0]}>
        <mesh ref={secondaryWaterRef} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.06, 0.48, 1.20]} />
          <meshPhysicalMaterial
            ref={secondaryMatRef}
            color="#0d9488"
            transparent
            opacity={0.62}
            roughness={0.05}
            metalness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            depthWrite={false}
          />
        </mesh>

        {/* Secondary Tank Rising Micro-Bubbles */}
        <points ref={secondaryBubblesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[secondaryBubblesData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#bae6fd"
            size={0.02}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </points>
      </group>

      {/* ════════════════════════════════════════════════════════════════════
          C. SEDIMENTATION TANK RAW WATER (Grit & Sediment Settling Cylinder)
             Center: [1.90, 0.05, 0]
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[1.90, 0.05, 0]}>
        <mesh ref={sedWaterRef} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 1.25, 24]} />
          <meshPhysicalMaterial
            ref={sedMatRef}
            color="#0284c7"
            transparent
            opacity={0.65}
            roughness={0.08}
            metalness={0.05}
            thickness={0.12}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ════════════════════════════════════════════════════════════════════
          D. POST-FILTRATION QUALITY VERIFICATION TANK WATER (Chamber 2 at x = -1.85)
             Contains water undergoing secondary sensor suite verification
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[-1.85, 0.15, 0]}>
        <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.42, 0.52]} />
          <meshPhysicalMaterial
            ref={tank2MatRef}
            color={(metrics.tds2 || 0) > 100 ? '#f59e0b' : '#38bdf8'}
            transparent
            opacity={0.65}
            roughness={0.02}
            metalness={0.05}
            thickness={0.10}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
