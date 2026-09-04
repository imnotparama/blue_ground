'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AmbientLife = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const mistRef = useRef<THREE.Points>(null);

  // 1. Generate 90 floating dust motes (optimized for 60fps on integrated GPUs)
  const particles = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6 + 1.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      velocities[i * 3] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01; // drifting slowly upwards
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    }
    return { positions, velocities };
  }, []);

  // 2. Generate 25 swirling water mist particles around the sedimentation filter
  const mist = useMemo(() => {
    const count = 25;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.16 + 0.12;
      positions[i * 3] = 1.9 + Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 1.0 - 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      speeds[i] = Math.random() * 0.10 + 0.03;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // A. Update Dust Motes
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = particles.velocities;

      for (let i = 0; i < particles.positions.length / 3; i++) {
        positions[i * 3] += (velocities[i * 3] + Math.sin(time + positions[i * 3 + 1]) * 0.02) * delta;
        positions[i * 3 + 1] += (velocities[i * 3 + 1] + Math.cos(time + positions[i * 3]) * 0.01) * delta;
        positions[i * 3 + 2] += (velocities[i * 3 + 2] + Math.sin(time * 0.5 + positions[i * 3]) * 0.01) * delta;

        if (positions[i * 3 + 1] > 4.0) {
          positions[i * 3 + 1] = -2.0;
          positions[i * 3] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // B. Update Spiraling Water Mist around Sedimentation Filter
    if (mistRef.current) {
      const positions = mistRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < mist.positions.length / 3; i++) {
        positions[i * 3 + 1] += mist.speeds[i] * delta;
        
        const dx = positions[i * 3] - 1.9;
        const dz = positions[i * 3 + 2];
        const angle = Math.atan2(dz, dx) + 0.6 * delta;
        const radius = Math.sqrt(dx * dx + dz * dz);
        
        positions[i * 3] = 1.9 + Math.cos(angle) * radius;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        if (positions[i * 3 + 1] > 0.65) {
          positions[i * 3 + 1] = -0.65;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.16 + 0.12;
          positions[i * 3] = 1.9 + Math.cos(a) * r;
          positions[i * 3 + 2] = Math.sin(a) * r;
        }
      }
      mistRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Dust motes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e4e4e7"
          size={0.014}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </points>

      {/* 2. Water mist around filter */}
      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[mist.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a5f3fc" // soft cyan water mist color
          size={0.018}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
