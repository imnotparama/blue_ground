'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. ORGANIC COCONUT PALM TREE (SCENIC BACKGROUND CANOPY)
// -------------------------------------------------------------
const CoconutPalmTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
  leanAngle?: number;
}> = ({ position, scale = 1, rotationY = 0, leanAngle = 0.06 }) => {
  // 12 radiating arched palm fronds
  const fronds = useMemo(() => {
    const list: { rotY: number; pitch: number; roll: number; len: number }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      list.push({
        rotY: (i / count) * Math.PI * 2,
        pitch: 0.38 + (i % 2) * 0.12,
        roll: (Math.random() - 0.5) * 0.15,
        len: 1.5 + (i % 3) * 0.25,
      });
    }
    return list;
  }, []);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Slender Curved Organic Palm Trunk (Height ~4.5m) */}
      <group rotation={[leanAngle, 0, leanAngle * 0.5]}>
        {/* Trunk Base */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.095, 1.1, 16]} />
          <meshStandardMaterial color="#5c3818" roughness={0.92} />
        </mesh>
        {/* Trunk Segment 2 */}
        <mesh position={[0.03, 1.6, 0.02]} rotation={[0.04, 0, 0.02]} castShadow>
          <cylinderGeometry args={[0.065, 0.075, 1.1, 16]} />
          <meshStandardMaterial color="#68411e" roughness={0.92} />
        </mesh>
        {/* Trunk Segment 3 */}
        <mesh position={[0.09, 2.65, 0.05]} rotation={[0.07, 0, 0.03]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 1.1, 16]} />
          <meshStandardMaterial color="#744a24" roughness={0.92} />
        </mesh>
        {/* Trunk Top */}
        <mesh position={[0.18, 3.65, 0.10]} rotation={[0.09, 0, 0.05]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 1.0, 16]} />
          <meshStandardMaterial color="#7f532a" roughness={0.92} />
        </mesh>

        {/* Crown of Palm Fronds & Coconuts */}
        <group position={[0.24, 4.15, 0.13]}>
          {/* Coconuts Cluster */}
          {[-0.06, 0, 0.06].map((xOff, cIdx) => (
            <mesh key={cIdx} position={[xOff, -0.06, (cIdx % 2) * 0.06]} castShadow>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color="#713f12" roughness={0.75} />
            </mesh>
          ))}

          {/* Radiating Arching Palm Fronds */}
          {fronds.map((f, idx) => (
            <group key={idx} rotation={[0, f.rotY, 0]}>
              <group rotation={[f.pitch, 0, f.roll]}>
                {/* Central Leaf Spine */}
                <mesh position={[0, f.len * 0.45, 0]} castShadow>
                  <boxGeometry args={[0.015, f.len, 0.012]} />
                  <meshStandardMaterial color="#14532d" roughness={0.65} />
                </mesh>
                {/* Drooping Lush Feather Leaf Blades */}
                <mesh position={[0, f.len * 0.45, 0]} castShadow>
                  <boxGeometry args={[0.34, f.len * 0.88, 0.005]} />
                  <meshStandardMaterial
                    color={idx % 2 === 0 ? '#15803d' : '#16a34a'}
                    roughness={0.5}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 2. TRADITIONAL VILLAGE CLAY & TERRACOTTA COTTAGE
// -------------------------------------------------------------
const VillageHut: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}> = ({ position, rotationY = 0, scale = 1 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Raised Mud / Stone Foundation Plinth */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.8, 0.24, 2.8]} />
        <meshStandardMaterial color="#8c6239" roughness={0.92} />
      </mesh>

      {/* Main Clay / Lime-Washed Walls */}
      <mesh position={[0, 1.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.4, 1.6, 2.4]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.88} />
      </mesh>

      {/* Veranda Timber Porch Posts */}
      {[-1.4, 0, 1.4].map((xP, idx) => (
        <mesh key={idx} position={[xP, 0.9, 1.35]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.5, 10]} />
          <meshStandardMaterial color="#451a03" roughness={0.85} />
        </mesh>
      ))}

      {/* Rustic Wooden Door */}
      <mesh position={[0, 0.85, 1.21]} castShadow>
        <boxGeometry args={[0.7, 1.2, 0.04]} />
        <meshStandardMaterial color="#582f0e" roughness={0.7} />
      </mesh>

      {/* Country Terracotta Tiled Roof */}
      <mesh position={[0, 2.15, 0.1]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[2.6, 1.15, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} />
      </mesh>
      {/* Eaves Trim */}
      <mesh position={[0, 1.7, 0.1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.9, 0.08, 3.0]} />
        <meshStandardMaterial color="#9a3412" roughness={0.8} />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------
// 3. AUTHENTIC INDIA MARK II VILLAGE HAND PUMP
// -------------------------------------------------------------
const IndiaMark2HandPump: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Circular Concrete Splash Platform */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.72, 0.04, 24]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Drainage Trough Rim */}
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.67, 0.67, 0.02, 24, 1, true]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Cast Iron Pump Body (Deep Village Green) */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.085, 0.76, 16]} />
        <meshStandardMaterial color="#166534" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Top Head Cap */}
      <mesh position={[0, 0.83, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
        <meshStandardMaterial color="#14532d" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Water Discharge Spout */}
      <mesh position={[0.14, 0.48, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.18, 12]} />
        <meshStandardMaterial color="#166534" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Stainless Steel Lever Handle with Cast Counterweight Knob */}
      <group position={[-0.06, 0.82, 0]} rotation={[0, 0, 0.18]}>
        <mesh position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.85, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.85, 0, 0]} castShadow>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 4. TRADITIONAL VILLAGE WATER POTS (CLEAR OF TAP / BEAKER)
// -------------------------------------------------------------
const VillageWaterPots: React.FC = () => {
  return (
    <group name="Village_Water_Pots">
      {/* Terracotta Matkas on Left Resting Step */}
      <group position={[-1.55, -2.187, 0.15]} scale={1.05}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#c2410c" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.075, 0.07, 16]} />
          <meshStandardMaterial color="#9a3412" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.065, 0.02, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
      </group>

      <group position={[-1.32, -2.187, 0.38]} scale={0.92}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.06, 16]} />
          <meshStandardMaterial color="#9a3412" roughness={0.75} />
        </mesh>
      </group>

      {/* Traditional Indian Polished Brass Water Pot (Safely positioned near Hand Pump) */}
      <group position={[1.75, -2.187, 0.25]} scale={0.95}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.06, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.30, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.055, 0.025, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 5. RUSTIC WOODEN FENCE WITH VINTAGE CART WHEEL
// -------------------------------------------------------------
const RusticFenceAndWheel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-1.2, -0.4, 0.4, 1.2].map((xP, i) => (
        <mesh key={i} position={[xP, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.85, 8]} />
          <meshStandardMaterial color="#5c3818" roughness={0.88} />
        </mesh>
      ))}
      {[0.25, 0.6].map((yRail, j) => (
        <mesh key={j} position={[0, yRail, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 2.5, 8]} />
          <meshStandardMaterial color="#6c4424" roughness={0.85} />
        </mesh>
      ))}

      {/* Vintage Wooden Cart Wheel */}
      <group position={[0.42, 0.28, 0.12]} rotation={[0.15, 0.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.03, 20, 1, true]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
          <meshStandardMaterial color="#291203" roughness={0.7} />
        </mesh>
        {[0, 1, 2].map((sIdx) => (
          <mesh key={sIdx} rotation={[0, 0, (sIdx * Math.PI) / 3]}>
            <boxGeometry args={[0.02, 0.54, 0.02]} />
            <meshStandardMaterial color="#5c3818" roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 6. GLIDING VILLAGE BIRDS
// -------------------------------------------------------------
const VillageGlidingBirds: React.FC = () => {
  const birdsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!birdsRef.current) return;
    const t = state.clock.getElapsedTime();
    birdsRef.current.position.x = ((t * 1.5) % 80) - 40;
    birdsRef.current.position.y = 8.5 + Math.sin(t * 0.4) * 0.6;
    birdsRef.current.position.z = -18 + Math.cos(t * 0.3) * 1.5;
  });

  return (
    <group ref={birdsRef}>
      {[
        [0, 0, 0],
        [1.2, 0.3, 0.6],
        [-1.0, -0.2, 0.4],
        [2.1, 0.5, 1.2],
        [-1.8, 0.1, 0.9],
      ].map((bPos, idx) => (
        <group key={idx} position={bPos as [number, number, number]}>
          <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.22, 0.02, 0.04]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.22, 0.02, 0.04]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// 7. DISTANT ROLLING VILLAGE HILLS
// -------------------------------------------------------------
const DistantHills: React.FC = () => {
  return (
    <group position={[0, -2.2, -45]}>
      {[
        { pos: [-24, 4.5, 0], r: 18, h: 10, c: '#1f3e2b' },
        { pos: [-6, 6.0, -6], r: 24, h: 13, c: '#183323' },
        { pos: [14, 5.0, -3], r: 20, h: 11, c: '#1f3e2b' },
        { pos: [32, 4.0, 2], r: 16, h: 9, c: '#274b34' },
      ].map((hill, i) => (
        <mesh key={i} position={hill.pos as [number, number, number]}>
          <coneGeometry args={[hill.r, hill.h, 16]} />
          <meshStandardMaterial color={hill.c} roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// MAIN SCENIC ENVIRONMENT: PHOTOREALISTIC RURAL VILLAGE
// -------------------------------------------------------------
export const ScenicEnvironment: React.FC = () => {
  return (
    <group name="Rural_Village_Environment">
      {/* 1. Seamless Natural Rural Earth Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.205, 0]} receiveShadow>
        <planeGeometry args={[180, 180, 1, 1]} />
        <meshStandardMaterial
          color="#523a28"
          roughness={0.96}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Paved Village Community Kiosk Apron (Top flush with feet at Y = -2.187) */}
      <mesh position={[-0.1065, -2.202, -0.0375]} receiveShadow>
        <boxGeometry args={[3.2, 0.03, 2.6]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.72}
          metalness={0.12}
        />
      </mesh>
      {/* Terracotta Curb Perimeter */}
      <mesh position={[-0.1065, -2.187, -0.0375]}>
        <boxGeometry args={[3.24, 0.005, 2.64]} />
        <meshStandardMaterial
          color="#9a3412"
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>

      {/* 3. Deep-Borewell Wellhead Assembly (Under Raw Water Inlet Riser) */}
      <group position={[0.80, -2.187, 0.2505]}>
        {/* Ground casing flange */}
        <mesh position={[0, -0.015, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.085, 0.04, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Machined bolt ring flange */}
        <mesh position={[0, 0.008, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.015, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* 6 Stainless Flange Stud Bolts */}
        {[0, 1, 2, 3, 4, 5].map((bIdx) => {
          const angle = (bIdx * Math.PI * 2) / 6;
          return (
            <mesh
              key={bIdx}
              position={[Math.cos(angle) * 0.075, 0.02, Math.sin(angle) * 0.075]}
            >
              <cylinderGeometry args={[0.006, 0.006, 0.012, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
            </mesh>
          );
        })}
        {/* Heavy-Duty Cast Iron Isolation Valve Body */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.065, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Red Quarter-Turn Valve Handle */}
        <mesh position={[0.042, 0.065, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.085, 0.008, 0.02]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* 4. Traditional Terracotta Water Pots & Brass Vessel */}
      <VillageWaterPots />

      {/* 5. Iconic India Mark II Village Hand Pump on Splash Apron */}
      <IndiaMark2HandPump position={[2.2, -2.20, 0.35]} rotationY={-0.35} />

      {/* 6. Distant Tropical Coconut Palm Groves (Positioned far in background, framing the view) */}
      <CoconutPalmTree position={[-8.5, -2.20, -9.0]} scale={1.2} rotationY={0.6} leanAngle={0.05} />
      <CoconutPalmTree position={[-11.5, -2.20, -13.0]} scale={1.35} rotationY={1.4} leanAngle={0.06} />
      <CoconutPalmTree position={[-15.0, -2.20, -17.0]} scale={1.5} rotationY={-0.8} leanAngle={0.04} />

      <CoconutPalmTree position={[8.5, -2.20, -9.0]} scale={1.2} rotationY={-0.6} leanAngle={-0.05} />
      <CoconutPalmTree position={[11.5, -2.20, -13.0]} scale={1.35} rotationY={-1.4} leanAngle={-0.06} />
      <CoconutPalmTree position={[15.0, -2.20, -17.0]} scale={1.5} rotationY={0.8} leanAngle={-0.04} />

      {/* 7. Traditional Village Thatched Cottages in Background */}
      <VillageHut position={[-11.0, -2.20, -11.0]} rotationY={0.35} scale={1.0} />
      <VillageHut position={[11.0, -2.20, -12.5]} rotationY={-0.45} scale={1.1} />
      <VillageHut position={[-18.0, -2.20, -18.0]} rotationY={0.2} scale={1.2} />

      {/* 8. Rustic Split-Rail Fences */}
      <RusticFenceAndWheel position={[-3.6, -2.20, 2.2]} rotationY={0.25} />
      <RusticFenceAndWheel position={[3.4, -2.20, 2.3]} rotationY={-0.2} />

      {/* 9. Distant Mountain Ridge & Gliding Birds */}
      <DistantHills />
      <VillageGlidingBirds />
    </group>
  );
};
