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

// ─── High-Detail JCB Crawler Excavator Model ──────────────────────────────────
const JCBExcavator = ({ position, rotation = [0, 0.6, 0], scale = 0.85 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* Dual Heavy Crawler Tracks */}
    {[-0.45, 0.45].map((zTrack, i) => (
      <group key={i} position={[0, 0.22, zTrack]}>
        {/* Track Belt */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.38, 0.34]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.8} />
        </mesh>
        {/* Track Sprockets / Rollers */}
        {[-0.7, -0.25, 0.25, 0.7].map((xSp, sIdx) => (
          <mesh key={sIdx} position={[xSp, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.36, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.9} />
          </mesh>
        ))}
      </group>
    ))}

    {/* Center Undercarriage Turntable */}
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.35, 0.40, 0.15, 16]} />
      <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.8} />
    </mesh>

    {/* Rotating Upper Carriage (JCB Yellow & Charcoal Body) */}
    <group position={[0, 0.75, 0]}>
      {/* Main Engine Enclosure */}
      <mesh position={[-0.2, 0.2, 0]} castShadow>
        <boxGeometry args={[1.3, 0.65, 1.1]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* Rear Counterweight (Dark Slate with Hazard Stripes) */}
      <mesh position={[-0.85, 0.18, 0]} castShadow>
        <boxGeometry args={[0.35, 0.60, 1.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.9} />
      </mesh>

      {/* Operator Cabin with Tinted Glass */}
      <group position={[0.25, 0.32, 0.38]}>
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.65, 0.42]} />
          <meshStandardMaterial color="#09090b" roughness={0.4} />
        </mesh>
        {/* Glass Windshield & Windows */}
        <mesh position={[0.02, 0.05, 0.02]}>
          <boxGeometry args={[0.62, 0.55, 0.40]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.65}
            roughness={0.1}
            metalness={0.8}
            clearcoat={1.0}
          />
        </mesh>
        {/* Roof Spotlight */}
        <mesh position={[0.32, 0.32, 0]} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.12]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Hydraulic Articulating Boom Arm */}
      <group position={[0.45, 0.15, -0.15]} rotation={[0, 0, -0.45]}>
        {/* Main Boom Segment */}
        <mesh position={[0.85, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.22, 0.16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.6} />
        </mesh>
        {/* Hydraulic Cylinder */}
        <mesh position={[0.5, 0.12, 0]} rotation={[0, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Dipper / Arm Stick */}
        <group position={[1.7, 0, 0]} rotation={[0, 0, 0.95]}>
          <mesh position={[0.65, 0, 0]} castShadow>
            <boxGeometry args={[1.35, 0.18, 0.14]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.6} />
          </mesh>

          {/* Heavy Digging Bucket with Teeth */}
          <group position={[1.3, 0, 0]} rotation={[0, 0, 0.65]}>
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.45, 0.45]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.9} />
            </mesh>
            {/* Digging Teeth */}
            {[-0.16, -0.05, 0.05, 0.16].map((zTooth, tIdx) => (
              <mesh key={tIdx} position={[0.3, -0.18, zTooth]} rotation={[0, 0, -0.4]} castShadow>
                <coneGeometry args={[0.03, 0.12, 4]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.9} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  </group>
);

// ─── Heavy Mining Tipper Lorry / Dump Truck ────────────────────────────────────
const MiningLorry = ({ position, rotation = [0, -0.5, 0], scale = 0.85 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* 6 Large Off-Road Mining Wheels */}
    {[-0.9, 0.5, 1.1].map((xW, i) =>
      [-0.65, 0.65].map((zW, j) => (
        <mesh key={`${i}-${j}`} position={[xW, 0.32, zW]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.26, 16]} />
          <meshStandardMaterial color="#09090b" roughness={0.95} />
        </mesh>
      ))
    )}

    {/* Heavy Steel Truck Chassis Frame */}
    <mesh position={[0.2, 0.45, 0]} castShadow>
      <boxGeometry args={[2.7, 0.28, 0.95]} />
      <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.8} />
    </mesh>

    {/* Driver Cab (Front) */}
    <group position={[-0.85, 0.95, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.95, 0.85, 1.15]} />
        <meshStandardMaterial color="#ea580c" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-0.49, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.45, 1.0]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* Roof Amber Hazard Flasher */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 10]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.0} />
      </mesh>
    </group>

    {/* Tipper Ore Dump Bed (Tilted Back) */}
    <group position={[0.65, 1.05, 0]} rotation={[0, 0, -0.08]}>
      {/* Heavy Ribbed Dump Body */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.75, 1.25]} />
        <meshStandardMaterial color="#d97706" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Mined Raw Ore Payload Chunks inside tipper */}
      <mesh position={[0, 0.25, 0]}>
        <dodecahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
    </group>
  </group>
);

// ─── Mining Site Mobile Floodlight Tower ───────────────────────────────────────
const MiningLightTower = ({ position }: { position: [number, number, number] }) => (
  <group position={position} scale={0.75}>
    {/* Trailer Base */}
    <mesh position={[0, 0.2, 0]} castShadow>
      <boxGeometry args={[0.8, 0.3, 0.6]} />
      <meshStandardMaterial color="#eab308" roughness={0.4} />
    </mesh>
    {/* Trailer Wheels */}
    {[-0.35, 0.35].map((z, i) => (
      <mesh key={i} position={[0, 0.15, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 12]} />
        <meshStandardMaterial color="#09090b" roughness={0.9} />
      </mesh>
    ))}
    {/* Telescoping Mast */}
    <mesh position={[0, 1.8, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 3.2, 8]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* 4 Floodlight Fixtures */}
    {[-0.15, 0.15].map((x, i) =>
      [-0.15, 0.15].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 3.4, z]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.10, 0.08]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.8} />
        </mesh>
      ))
    )}
  </group>
);

// ─── Distant Pine Tree Model ──────────────────────────────────────────────────
const DistantPine = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.12, 1.4, 6]} />
      <meshStandardMaterial color="#451a03" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.5, 0]} castShadow>
      <coneGeometry args={[0.7, 1.3, 7]} />
      <meshStandardMaterial color="#14532d" roughness={0.9} />
    </mesh>
    <mesh position={[0, 2.2, 0]} castShadow>
      <coneGeometry args={[0.55, 1.1, 7]} />
      <meshStandardMaterial color="#166534" roughness={0.9} />
    </mesh>
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
    <mesh position={[0, 4.0, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.9, 8.0, 4]} />
      <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
    </mesh>
    {[-1.2, 0.5, 2.2].map((yOff, i) => (
      <mesh key={i} position={[0, 4.0 + yOff, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4 - i * 0.4, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
    ))}
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
          <mesh position={[-0.4, 0, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.8, 0.02, 0.15]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
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
          2. MINING SITE HEAVY MACHINERY (JCB Excavators, Tipper Lorries, Towers)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* JCB Heavy Excavator working on left quarry ridge */}
      <JCBExcavator position={[-10.5, -1.9, -15]} rotation={[0, 0.45, 0]} scale={0.9} />

      {/* Heavy Mining Tipper Lorry / Dump Truck on haul road */}
      <MiningLorry position={[-6.8, -2.15, -13]} rotation={[0, -0.55, 0]} scale={0.88} />

      {/* Second Tipper Lorry further along the haul path */}
      <MiningLorry position={[-13.5, -2.15, -18]} rotation={[0, 0.25, 0]} scale={0.75} />

      {/* Mobile Site Light Tower */}
      <MiningLightTower position={[-4.8, -2.2, -11]} />

      {/* ═══════════════════════════════════════════════════════════════════════
          3. INDUSTRIAL INFRASTRUCTURE (Distant Left)
          ═══════════════════════════════════════════════════════════════════════ */}
      <TransmissionPylon position={[-16, -2.2, -19]} />
      <TransmissionPylon position={[-26, -2.2, -25]} />

      {/* ═══════════════════════════════════════════════════════════════════════
          4. DISTANT FORESTS & VEGETATION (East Sector)
          ═══════════════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════════════
          5. ATMOSPHERIC DRIFTING CLOUDS & BIRDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <CloudCluster position={[-18, 9.0, -18]} scale={1.4} />
      <CloudCluster position={[4, 11.5, -22]} scale={1.8} />
      <CloudCluster position={[22, 8.5, -16]} scale={1.2} />

      <GlidingBirds />

      {/* ═══════════════════════════════════════════════════════════════════════
          6. SURROUNDING TERRAIN & ROCK OUTCROPS
          ═══════════════════════════════════════════════════════════════════════ */}
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
