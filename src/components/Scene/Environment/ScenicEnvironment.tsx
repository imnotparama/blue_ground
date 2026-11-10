'use client';

import React from 'react';
import * as THREE from 'three';

/**
 * Clean Architectural Engineering Showroom Stage
 * Replaces distracting cartoon excavators, low-poly cone mounds, and 40m sky wires
 * with a high-end, clean studio presentation stage with soft horizon gradients.
 */
export const ScenicEnvironment: React.FC = () => {
  return (
    <group name="Architectural_Studio_Stage">
      {/* 1. Seamless Studio Infinity Ground with Soft Radial Vignette */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.235, 0]} receiveShadow>
        <planeGeometry args={[180, 180, 1, 1]} />
        <meshStandardMaterial
          color="#0b1120"
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* 2. Precision Datum Platform Border Glow */}
      <mesh position={[-0.1, -2.21, -0.05]} receiveShadow>
        <boxGeometry args={[3.6, 0.04, 3.2]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Subtle Cyan Calibration Perimeter Trim */}
      <mesh position={[-0.1, -2.19, -0.05]}>
        <boxGeometry args={[3.64, 0.01, 3.24]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 4. Soft Corner Studio Ground Accent Blocks */}
      {[
        [-1.9, -2.18, -1.65],
        [1.7, -2.18, -1.65],
        [-1.9, -2.18, 1.55],
        [1.7, -2.18, 1.55],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.05, 0.08]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
};
