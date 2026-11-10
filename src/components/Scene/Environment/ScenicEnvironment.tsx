'use client';

import React from 'react';
import * as THREE from 'three';

/**
 * Architectural Engineering Showroom Stage
 * Perfectly aligned with blueground_leviathan_v9 datum foundation (Y = -2.187)
 * Zero floating, zero sinking, solid elastomer foot grounding.
 */
export const ScenicEnvironment: React.FC = () => {
  return (
    <group name="Architectural_Studio_Stage">
      {/* 1. Seamless Studio Infinity Ground with Soft Vignette */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.205, 0]} receiveShadow>
        <planeGeometry args={[180, 180, 1, 1]} />
        <meshStandardMaterial
          color="#080e1a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* 2. Precision Datum Skid Pedestal (Top surface exactly flush with feet at Y = -2.187) */}
      <mesh position={[-0.1065, -2.202, -0.0375]} receiveShadow>
        <boxGeometry args={[3.2, 0.03, 2.6]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.35}
          metalness={0.85}
        />
      </mesh>

      {/* 3. Subtle Cyan Calibration Perimeter Trim */}
      <mesh position={[-0.1065, -2.187, -0.0375]}>
        <boxGeometry args={[3.24, 0.004, 2.64]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 4. Sleek Corner Datum Alignment Pucks */}
      {[
        [-1.65, -2.187, -1.30],
        [1.45, -2.187, -1.30],
        [-1.65, -2.187, 1.25],
        [1.45, -2.187, 1.25],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.012, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};
