'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const Water = () => {
  const { metrics, mode, dualVerificationMode } = useSystemState();

  const primaryWaterRef = useRef<THREE.Mesh>(null);
  const secondaryWaterRef = useRef<THREE.Mesh>(null);

  const primaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

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

  // Bubble point particles inside secondary raw intake compartment
  const secondaryBubblesData = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = Math.random() * 0.45 - 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
      speeds[i] = Math.random() * 0.20 + 0.08;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    // 1. Primary Tank Water Level (Clean Water Storage)
    // Floor is at y = -1.65, max top is y = 0.0 (max height = 1.60)
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

    // 2. Turbidity color transition for Secondary Raw Compartment
    const isTurbid = metrics.turbidity > 12 || mode === 'TURBIDITY';
    const targetRawColor = isTurbid ? new THREE.Color('#78350f') : new THREE.Color('#0d9488');

    if (secondaryMatRef.current) {
      secondaryMatRef.current.color.lerp(targetRawColor, dampFactor);
      secondaryMatRef.current.opacity = THREE.MathUtils.lerp(
        secondaryMatRef.current.opacity,
        isTurbid ? 0.78 : 0.55,
        dampFactor
      );
    }

    // 3. Animate Primary Bubbles
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

    // 4. Animate Secondary Bubbles
    if (secondaryBubblesRef.current) {
      const positions = secondaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const topY = 0.50;

      for (let i = 0; i < secondaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += secondaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > topY) {
          positions[i * 3 + 1] = 0.08;
          positions[i * 3] = (Math.random() - 0.5) * 1.2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
        }
      }
      secondaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ════════════════════════════════════════════════════════════════════
          A. PRIMARY TANK PURE WATER (Lower Clean Storage Compartment)
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
            opacity={0.58}
            roughness={0.02}
            metalness={0.05}
            transmission={0.88}
            thickness={0.12}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
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
          B. SECONDARY COMPARTMENT WATER (Top Right Sensor Chamber)
             Bounds: x from -0.08 to 0.98 (center = 0.45, width = 1.06), y = [0.05, 0.55]
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[0.45, 0, 0]}>
        <mesh ref={secondaryWaterRef} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.04, 0.46, 1.20]} />
          <meshPhysicalMaterial
            ref={secondaryMatRef}
            color="#0d9488"
            transparent
            opacity={0.52}
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
            size={0.02}
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </points>
      </group>

      {/* ════════════════════════════════════════════════════════════════════
          C. POST-FILTRATION QUALITY TANK 2 WATER (Chamber 2 at x = -1.85)
             Contains Post-RO water undergoing TDS sensor check
          ════════════════════════════════════════════════════════════════════ */}
      {dualVerificationMode && (
        <group position={[-1.85, 0.15, 0]}>
          <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.42, 0.52]} />
            <meshPhysicalMaterial
              color={(metrics.tds2 || 0) > 100 ? '#f59e0b' : '#38bdf8'}
              transparent
              opacity={0.62}
              roughness={0.02}
              metalness={0.05}
              transmission={0.92}
              thickness={0.10}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
