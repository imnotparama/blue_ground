'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const Water = () => {
  const { metrics, mode } = useSystemState();

  const primaryWaterRef = useRef<THREE.Mesh>(null);
  const secondaryWaterRef = useRef<THREE.Mesh>(null);

  const primaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const primaryBubblesRef = useRef<THREE.Points>(null);
  const secondaryBubblesRef = useRef<THREE.Points>(null);

  // Bubble point particles inside primary clean water
  const primaryBubblesData = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 1] = Math.random() * 0.9 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
      speeds[i] = Math.random() * 0.15 + 0.05;
    }
    return { positions, speeds };
  }, []);

  // Bubble point particles inside secondary raw intake water
  const secondaryBubblesData = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.9;
      positions[i * 3 + 1] = Math.random() * 1.1 - 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.75;
      speeds[i] = Math.random() * 0.18 + 0.06;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Primary Tank Water Level (Fills lower clean water chamber)
    // Clean chamber floor is at y = -1.68, shelf divider is at y = -0.55 (max height = 1.10)
    const fillFraction = Math.max(metrics.waterLevel / 100, 0.08);
    const currentHeight = fillFraction * 1.05;

    if (primaryWaterRef.current) {
      primaryWaterRef.current.scale.y = THREE.MathUtils.lerp(
        primaryWaterRef.current.scale.y,
        currentHeight,
        0.06
      );
      // Base sits at y = -1.68 + currentHeight / 2
      primaryWaterRef.current.position.y = -1.68 + primaryWaterRef.current.scale.y / 2;
    }

    // 2. Turbidity color transition for Secondary Raw Tank
    const isTurbid = metrics.turbidity > 12 || mode === 'TURBIDITY';
    const targetRawColor = isTurbid ? new THREE.Color('#78350f') : new THREE.Color('#0d9488');

    if (secondaryMatRef.current) {
      secondaryMatRef.current.color.lerp(targetRawColor, 0.05);
      secondaryMatRef.current.opacity = THREE.MathUtils.lerp(
        secondaryMatRef.current.opacity,
        isTurbid ? 0.78 : 0.55,
        0.05
      );
    }

    // 3. Animate Primary Bubbles
    if (primaryBubblesRef.current && primaryWaterRef.current) {
      const positions = primaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const topY = -1.68 + currentHeight;

      for (let i = 0; i < primaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += primaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > topY) {
          positions[i * 3 + 1] = -1.65;
          positions[i * 3] = (Math.random() - 0.5) * 1.8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
        }
      }
      primaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Animate Secondary Bubbles
    if (secondaryBubblesRef.current) {
      const positions = secondaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const topY = -0.32;

      for (let i = 0; i < secondaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += secondaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > topY) {
          positions[i * 3 + 1] = -1.65;
          positions[i * 3] = (Math.random() - 0.5) * 0.9;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.75;
        }
      }
      secondaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ════════════════════════════════════════════════════════════════════
          A. PRIMARY TANK PURE WATER (Lower Clean Storage Compartment)
             Primary Tank bounds: x=[-3.0, -1.0], z=[-0.6, 0.6], y=[-1.70, -0.55]
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[-2.0, 0, 0]}>
        {/* Pure Water Block */}
        <mesh ref={primaryWaterRef} position={[0, -1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.92, 1.0, 1.12]} />
          <meshPhysicalMaterial
            ref={primaryMatRef}
            color="#0284c7"
            transparent
            opacity={0.62}
            roughness={0.02}
            metalness={0.05}
            transmission={0.88}
            thickness={0.12}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            depthWrite={false}
          />
        </mesh>

        {/* Sparkling Bubbles */}
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
          B. SECONDARY TANK RAW WATER
             Secondary Tank bounds: x=[1.55, 2.65], z=[-0.45, 0.45], y=[-1.70, -0.28]
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[2.1, 0, 0]}>
        {/* Raw Water Block */}
        <mesh ref={secondaryWaterRef} position={[0, -1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.04, 1.35, 0.84]} />
          <meshPhysicalMaterial
            ref={secondaryMatRef}
            color="#0d9488"
            transparent
            opacity={0.55}
            roughness={0.05}
            metalness={0.05}
            transmission={0.82}
            thickness={0.08}
            depthWrite={false}
          />
        </mesh>

        {/* Bubbles */}
        <points ref={secondaryBubblesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[secondaryBubblesData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#bae6fd"
            size={0.022}
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
};
