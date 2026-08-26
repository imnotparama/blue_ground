'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Smooth Procedural Cloud Cluster ──────────────────────────────────────────
const CloudCluster = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += 0.08 * delta;
      if (groupRef.current.position.x > 35) {
        groupRef.current.position.x = -35;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {[
        { pos: [0, 0, 0], r: 1.8 },
        { pos: [1.3, -0.2, 0.2], r: 1.4 },
        { pos: [-1.4, -0.3, -0.2], r: 1.3 },
        { pos: [0.6, 0.7, -0.1], r: 1.2 },
        { pos: [-0.6, 0.5, 0.1], r: 1.1 },
        { pos: [2.2, -0.5, 0], r: 0.9 },
        { pos: [-2.2, -0.5, 0], r: 0.9 },
      ].map((p, i) => (
        <mesh key={i} position={p.pos as [number, number, number]}>
          <sphereGeometry args={[p.r, 14, 14]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
            metalness={0.0}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Distant Pine Tree Model ──────────────────────────────────────────────────
const DistantPine = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    {/* Trunk */}
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.12, 1.4, 6]} />
      <meshStandardMaterial color="#451a03" roughness={0.9} />
    </mesh>
    {/* Tier 1 Foliage */}
    <mesh position={[0, 1.5, 0]} castShadow>
      <coneGeometry args={[0.7, 1.3, 7]} />
      <meshStandardMaterial color="#14532d" roughness={0.9} />
    </mesh>
    {/* Tier 2 Foliage */}
    <mesh position={[0, 2.2, 0]} castShadow>
      <coneGeometry args={[0.55, 1.1, 7]} />
      <meshStandardMaterial color="#166534" roughness={0.9} />
    </mesh>
    {/* Tier 3 Foliage */}
    <mesh position={[0, 2.8, 0]} castShadow>
      <coneGeometry args={[0.38, 0.9, 7]} />
      <meshStandardMaterial color="#15803d" roughness={0.9} />
    </mesh>
  </group>
);

// ─── Distant Broadleaf Tree Model ─────────────────────────────────────────────
const DistantBroadleaf = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.9, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.16, 1.8, 6]} />
      <meshStandardMaterial color="#3e2723" roughness={0.9} />
    </mesh>
    <mesh position={[0, 2.3, 0]} castShadow>
      <sphereGeometry args={[1.1, 10, 10]} />
      <meshStandardMaterial color="#1b5e20" roughness={0.88} />
    </mesh>
    <mesh position={[0.4, 2.6, 0.2]} castShadow>
      <sphereGeometry args={[0.8, 8, 8]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.88} />
    </mesh>
  </group>
);

// ─── Steel Lattice Transmission Pylon (Far Mining Infrastructure) ─────────────
const TransmissionPylon = ({ position }: { position: [number, number, number] }) => (
  <group position={position} scale={0.85}>
    {/* 4 Main Steel Legs */}
    <mesh position={[0, 4.0, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.9, 8.0, 4]} />
      <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
    </mesh>
    {/* Horizontal Crossarms */}
    {[-1.2, 0.5, 2.2].map((yOff, i) => (
      <mesh key={i} position={[0, 4.0 + yOff, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4 - i * 0.4, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
    ))}
    {/* High-Voltage Power Lines */}
    <mesh position={[0, 6.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.015, 0.015, 40.0, 4]} />
      <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
    </mesh>
  </group>
);

// ─── Distant Birds Gliding in Sky ─────────────────────────────────────────────
const GlidingBirds = () => {
  const birdsRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (birdsRef.current) {
      birdsRef.current.position.x += 0.4 * delta;
      birdsRef.current.position.y += Math.sin(state.clock.getElapsedTime() * 0.8) * 0.01;
      if (birdsRef.current.position.x > 40) {
        birdsRef.current.position.x = -40;
      }
    }
  });

  return (
    <group ref={birdsRef} position={[-20, 9.5, -20]}>
      {[
        [0, 0, 0],
        [1.2, 0.4, -0.6],
        [-1.3, 0.2, -0.5],
        [2.3, 0.8, -1.2],
        [-2.4, 0.6, -1.0],
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]} scale={0.25} rotation={[0, 0.3, 0]}>
          {/* Left Wing */}
          <mesh position={[-0.4, 0, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─── Main Scenic Environment Component ─────────────────────────────────────────
export const ScenicEnvironment = () => {
  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. DISTANT ROLLING MOUNTAIN RIDGES (Z: -18 to -35)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* Left Mining Escarpment Ridge (Reddish-Ochre Quarry Mountains) */}
      <group position={[-16, -2.2, -22]}>
        <mesh receiveShadow>
          <coneGeometry args={[16, 7.5, 12]} />
          <meshStandardMaterial color="#92400e" roughness={0.95} />
        </mesh>
        <mesh position={[7, -0.5, 3]} receiveShadow>
          <coneGeometry args={[12, 6.0, 10]} />
          <meshStandardMaterial color="#b45309" roughness={0.95} />
        </mesh>
        <mesh position={[-8, -1.0, -4]} receiveShadow>
          <coneGeometry args={[18, 9.0, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.98} />
        </mesh>
      </group>

      {/* Right Ecological Restoration Hills (Lush Green Forest Ridges) */}
      <group position={[16, -2.2, -22]}>
        <mesh receiveShadow>
          <coneGeometry args={[15, 6.5, 12]} />
          <meshStandardMaterial color="#15803d" roughness={0.95} />
        </mesh>
        <mesh position={[-6, -0.5, 2]} receiveShadow>
          <coneGeometry args={[11, 5.0, 10]} />
          <meshStandardMaterial color="#166534" roughness={0.95} />
        </mesh>
        <mesh position={[9, -0.8, -4]} receiveShadow>
          <coneGeometry args={[17, 8.0, 12]} />
          <meshStandardMaterial color="#14532d" roughness={0.98} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. INDUSTRIAL INFRASTRUCTURE (Distant Left)
          ═══════════════════════════════════════════════════════════════════════ */}
      <TransmissionPylon position={[-14, -2.2, -18]} />
      <TransmissionPylon position={[-24, -2.2, -24]} />

      {/* ═══════════════════════════════════════════════════════════════════════
          3. DISTANT FORESTS & VEGETATION
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* Right Green Forest Belt */}
      {[
        { pos: [6.5, -2.2, -10], s: 1.1, type: 'pine' },
        { pos: [8.0, -2.2, -12], s: 1.3, type: 'broad' },
        { pos: [9.5, -2.2, -9], s: 0.9, type: 'pine' },
        { pos: [11.0, -2.2, -13], s: 1.4, type: 'broad' },
        { pos: [13.0, -2.2, -11], s: 1.2, type: 'pine' },
        { pos: [15.5, -2.2, -14], s: 1.5, type: 'pine' },
      ].map((item, idx) => (
        item.type === 'pine' ? (
          <DistantPine key={idx} position={item.pos as [number, number, number]} scale={item.s} />
        ) : (
          <DistantBroadleaf key={idx} position={item.pos as [number, number, number]} scale={item.s} />
        )
      ))}

      {/* Left Sparse Vegetation transitioning to Quarry */}
      {[
        { pos: [-6.8, -2.2, -10], s: 0.85 },
        { pos: [-9.0, -2.2, -12], s: 1.0 },
        { pos: [-11.5, -2.2, -14], s: 1.15 },
      ].map((item, idx) => (
        <DistantPine key={`left-${idx}`} position={item.pos as [number, number, number]} scale={item.s} />
      ))}

      {/* ═══════════════════════════════════════════════════════════════════════
          4. ATMOSPHERIC DRIFTING CLOUDS & BIRDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <CloudCluster position={[-18, 9.0, -18]} scale={1.4} />
      <CloudCluster position={[4, 11.5, -22]} scale={1.8} />
      <CloudCluster position={[22, 8.5, -16]} scale={1.2} />

      <GlidingBirds />

      {/* ═══════════════════════════════════════════════════════════════════════
          5. SURROUNDING TERRAIN & ROCK OUTCROPS
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* Natural Landscape Soil Ground Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.23, 0]} receiveShadow>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial
          color="#64748b"
          roughness={0.94}
          metalness={0.05}
        />
      </mesh>

      {/* Decorative Natural Boulders around platform */}
      {[
        { pos: [-4.8, -2.15, 0.8], s: 0.35 },
        { pos: [-5.4, -2.18, 0.4], s: 0.25 },
        { pos: [4.4, -2.15, 0.7], s: 0.32 },
        { pos: [4.9, -2.18, 0.2], s: 0.22 },
      ].map((b, i) => (
        <mesh key={i} position={b.pos as [number, number, number]} scale={b.s} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
