'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Heavy Excavator Mining Machine Model ──────────────────────────────────────
const MiningExcavator = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, 0.4, 0]}>
    {/* Dual Heavy Crawler Tracks */}
    {[-0.35, 0.35].map((zTrack, i) => (
      <group key={i} position={[0, 0.15, zTrack]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.3, 0.28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.8} />
        </mesh>
        {/* Tread sprockets */}
        {[-0.55, 0, 0.55].map((xSp, sIdx) => (
          <mesh key={sIdx} position={[xSp, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.30, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.95} />
          </mesh>
        ))}
      </group>
    ))}

    {/* Rotating Upper House / Yellow Chassis */}
    <group position={[0, 0.55, 0]}>
      {/* Engine Housing & Counterweight */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.55, 0.9]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Operator Cabin with Tinted Glass */}
      <mesh position={[0.3, 0.25, 0.32]} castShadow>
        <boxGeometry args={[0.55, 0.5, 0.32]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Hydraulic Boom Arm */}
      <group position={[0.6, 0.15, -0.1]} rotation={[0, 0, -0.45]}>
        <mesh position={[0.7, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 0.18, 0.14]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Arm / Stick */}
        <group position={[1.4, 0, 0]} rotation={[0, 0, 0.9]}>
          <mesh position={[0.5, 0, 0]} castShadow>
            <boxGeometry args={[1.1, 0.14, 0.12]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Heavy Digging Bucket */}
          <group position={[1.05, 0, 0]} rotation={[0, 0, 0.7]}>
            <mesh castShadow>
              <boxGeometry args={[0.45, 0.4, 0.38]} />
              <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  </group>
);

// ─── Heavy Haul Mining Dump Truck Model ────────────────────────────────────────
const MiningDumpTruck = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, -0.6, 0]}>
    {/* 6 Giant Mining Tires */}
    {[-0.65, 0.45, 0.95].map((xT, i) =>
      [-0.55, 0.55].map((zT, j) => (
        <mesh key={`${i}-${j}`} position={[xT, 0.25, zT]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.22, 14]} />
          <meshStandardMaterial color="#09090b" roughness={0.95} />
        </mesh>
      ))
    )}

    {/* Heavy Chassis Frame */}
    <mesh position={[0.2, 0.35, 0]} castShadow>
      <boxGeometry args={[2.2, 0.25, 0.85]} />
      <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.8} />
    </mesh>

    {/* Front Yellow Cab */}
    <group position={[-0.65, 0.75, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.65, 0.95]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* Front Windshield */}
      <mesh position={[-0.41, 0.12, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.8]} />
        <meshPhysicalMaterial color="#0284c7" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* Radiator Grille */}
      <mesh position={[-0.41, -0.15, 0]}>
        <boxGeometry args={[0.02, 0.22, 0.7]} />
        <meshStandardMaterial color="#09090b" roughness={0.9} />
      </mesh>
    </group>

    {/* Tilted Heavy Mining Dump Bed with Ore Cargo */}
    <group position={[0.55, 0.8, 0]} rotation={[0, 0, 0.18]}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.6, 1.15]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Raw Mining Ore Rocks inside Dump Bed */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.35, 0.25, 1.0]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
    </group>
  </group>
);

// ─── Industrial Mining Conveyor Belt Truss ─────────────────────────────────────
const MiningConveyor = ({ position }: { position: [number, number, number] }) => (
  <group position={position} rotation={[0, 0.25, 0.22]}>
    {/* Truss Beam */}
    <mesh castShadow>
      <boxGeometry args={[7.0, 0.25, 0.5]} />
      <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
    </mesh>
    {/* Conveyor Rubber Belt with Crushed Ore */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[6.8, 0.04, 0.38]} />
      <meshStandardMaterial color="#27272a" roughness={0.95} />
    </mesh>
    {/* Crushed Ore Stream */}
    <mesh position={[0, 0.18, 0]}>
      <boxGeometry args={[6.6, 0.05, 0.28]} />
      <meshStandardMaterial color="#78716c" roughness={0.98} />
    </mesh>
    {/* Vertical Steel Support A-Frames */}
    {[-2.5, 0, 2.5].map((xPos, idx) => (
      <mesh key={idx} position={[xPos, -1.0, 0]} rotation={[0, 0, -0.22]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.2, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
    ))}
  </group>
);

// ─── Industrial Mining Safety Signs & Barricades ──────────────────────────────
const MiningHazardBarrier = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Concrete Jersey Barrier Base */}
    <mesh position={[0, 0.2, 0]} castShadow>
      <boxGeometry args={[1.6, 0.4, 0.35]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
    </mesh>
    {/* Red/White Reflective Chevron Strip */}
    <mesh position={[0, 0.25, 0.18]}>
      <boxGeometry args={[1.55, 0.12, 0.005]} />
      <meshStandardMaterial color="#dc2626" roughness={0.4} />
    </mesh>
    {/* Warning Sign Post */}
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
      <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Diamond Warning Sign Board */}
    <mesh position={[0, 0.95, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
      <boxGeometry args={[0.35, 0.35, 0.015]} />
      <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0.2} />
    </mesh>
  </group>
);

// ─── Clean Water Jerricans & Dispensing Impact Zone (Right side) ───────────────
const CommunityWaterStation = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Wooden Palette Stand */}
    <mesh position={[0, 0.06, 0]} castShadow>
      <boxGeometry args={[0.9, 0.12, 0.7]} />
      <meshStandardMaterial color="#a16207" roughness={0.9} />
    </mesh>
    {/* Food-Grade Blue Water Jerrican 1 */}
    <group position={[-0.22, 0.32, 0.12]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.40, 0.18]} />
        <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
    </group>
    {/* Food-Grade Blue Water Jerrican 2 */}
    <group position={[0.22, 0.32, -0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.40, 0.18]} />
        <meshStandardMaterial color="#0369a1" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
    </group>
    {/* Stainless Steel Water Vessel with Clean Water */}
    <group position={[0, 0.28, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.14, 0.32, 16]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.95} />
      </mesh>
    </group>
  </group>
);

// ─── Main Cinematic Mining Storytelling Environment ───────────────────────────
export const MiningEnvironment = () => {
  const { tanksOnly } = useSystemState();
  const pondRef = useRef<THREE.Mesh>(null);
  const dustParticlesRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    // Subtle slurry pond wave motion
    if (pondRef.current) {
      pondRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.015;
    }

    // Drifting mining sunlight dust particles
    if (dustParticlesRef.current) {
      dustParticlesRef.current.rotation.y += 0.02 * delta;
    }
  });

  if (tanksOnly) return null; // Clean isolation mode hides environment props

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════════════
          ZONE 1 (LEFT SIDE: THE PROBLEM — OPEN-CAST MINING & CONTAMINATED RUNOFF)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* Terraced Quarry Steps / Open-Cast Excavation Pit (Background Left) */}
      <group position={[-9.0, -1.8, -8.0]}>
        {/* Tier 1 Bench */}
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[14, 1.2, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.95} />
        </mesh>
        {/* Tier 2 Bench */}
        <mesh position={[-2.5, 1.5, -2.5]} receiveShadow>
          <boxGeometry args={[10, 1.4, 6]} />
          <meshStandardMaterial color="#92400e" roughness={0.95} />
        </mesh>
        {/* Tier 3 Mountain Quarry Crest */}
        <mesh position={[-4.5, 2.8, -4.5]} receiveShadow>
          <boxGeometry args={[8, 1.6, 5]} />
          <meshStandardMaterial color="#a16207" roughness={0.95} />
        </mesh>
      </group>

      {/* Mining Pit Excavator */}
      <MiningExcavator position={[-7.5, -2.15, -4.5]} />

      {/* Heavy Haul Mining Dump Truck carrying Ore */}
      <MiningDumpTruck position={[-4.8, -2.15, -3.8]} />

      {/* Industrial Conveyor Belt */}
      <MiningConveyor position={[-8.5, -0.4, -6.5]} />

      {/* Mining Safety Hazard Barriers */}
      <MiningHazardBarrier position={[-3.2, -2.2, 0.8]} />
      <MiningHazardBarrier position={[-1.5, -2.2, 1.8]} />

      {/* Contaminated Brown Slurry Settling Pond (Right intake water source) */}
      <group position={[3.6, -2.22, 0.2]}>
        {/* Excavated Mud Basin Rim */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[1.6, 1.8, 0.12, 20]} />
          <meshStandardMaterial color="#451a03" roughness={0.98} />
        </mesh>
        {/* Muddy Brown Turbid Water Surface */}
        <mesh ref={pondRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.5, 24]} />
          <meshPhysicalMaterial
            color="#78350f"
            transparent
            opacity={0.92}
            roughness={0.35}
            metalness={0.1}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════
          ZONE 3 (RIGHT SIDE: THE IMPACT — COMMUNITY WATER DISPENSE & RESTORATION)
          ═══════════════════════════════════════════════════════════════════════ */}
      {/* Clean Water Dispensing Station (Beside Primary Tank Clean Outlet) */}
      <CommunityWaterStation position={[-3.4, -2.2, 0.1]} />

      {/* Restored Lush Greenery & Vegetation Patches on Right */}
      <group position={[6.5, -2.2, -2.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#22c55e" roughness={0.88} />
        </mesh>
      </group>

      {/* Sun Disc in Bright Blue Sky */}
      <mesh position={[12, 16, -18]}>
        <sphereGeometry args={[1.8, 20, 20]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Volumetric Floating Mining Dust Motes in Sunlight */}
      <points ref={dustParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 450 }, () => (Math.random() - 0.5) * 25)
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#fef3c7"
          size={0.035}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
