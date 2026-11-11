'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getVillagePanoramaTexture, getRuralGroundTexture } from './villagePanorama';

// -------------------------------------------------------------
// 1. ORGANIC CASCADING COCONUT PALM TREE (REALISTIC NATURAL DROOP)
// -------------------------------------------------------------
const GracefulCoconutPalm: React.FC<{
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
  leanAngle?: number;
}> = ({ position, scale = 1, rotationY = 0, leanAngle = 0.07 }) => {
  // Cascading umbrella fronds with natural downward gravity droop
  const fronds = useMemo(() => {
    const list: { rotY: number; pitch: number; roll: number; len: number }[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      list.push({
        rotY: (i / count) * Math.PI * 2 + (i % 2) * 0.1,
        pitch: Math.PI * 0.40 + (i % 4) * 0.08, // 72° to 90° downward cascading umbrella
        roll: (Math.random() - 0.5) * 0.2,
        len: 2.6 + (i % 3) * 0.35,
      });
    }
    return list;
  }, []);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Naturally Curved Tapered Palm Trunk */}
      <group rotation={[leanAngle, 0, leanAngle * 0.4]}>
        {/* Trunk Base */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.11, 1.4, 16]} />
          <meshStandardMaterial color="#5c3818" roughness={0.92} />
        </mesh>
        {/* Trunk Mid Section */}
        <mesh position={[0.04, 2.05, 0.03]} rotation={[0.05, 0, 0.02]} castShadow>
          <cylinderGeometry args={[0.072, 0.085, 1.4, 16]} />
          <meshStandardMaterial color="#68411e" roughness={0.92} />
        </mesh>
        {/* Trunk Upper Section */}
        <mesh position={[0.12, 3.4, 0.08]} rotation={[0.08, 0, 0.04]} castShadow>
          <cylinderGeometry args={[0.06, 0.072, 1.4, 16]} />
          <meshStandardMaterial color="#744a24" roughness={0.92} />
        </mesh>
        {/* Trunk Crown Top */}
        <mesh position={[0.24, 4.65, 0.15]} rotation={[0.11, 0, 0.06]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.2, 16]} />
          <meshStandardMaterial color="#7f532a" roughness={0.92} />
        </mesh>

        {/* Crown of Palm Fronds & Coconuts */}
        <group position={[0.32, 5.25, 0.2]}>
          {/* Coconuts Cluster */}
          {[-0.08, 0, 0.08].map((xOff, cIdx) => (
            <mesh key={cIdx} position={[xOff, -0.08, (cIdx % 2) * 0.08]} castShadow>
              <sphereGeometry args={[0.065, 12, 12]} />
              <meshStandardMaterial color="#713f12" roughness={0.75} />
            </mesh>
          ))}

          {/* Gracefully Cascading Arched Palm Fronds */}
          {fronds.map((f, idx) => (
            <group key={idx} rotation={[0, f.rotY, 0]}>
              <group rotation={[f.pitch, 0, f.roll]}>
                {/* Curved Midrib Spine */}
                <mesh position={[0, f.len * 0.45, -0.05]} rotation={[-0.15, 0, 0]} castShadow>
                  <boxGeometry args={[0.018, f.len, 0.014]} />
                  <meshStandardMaterial color="#14532d" roughness={0.65} />
                </mesh>
                {/* Feathered Leaf Blades with Natural Downward Droop */}
                <mesh position={[0, f.len * 0.45, -0.08]} rotation={[-0.22, 0, 0]} castShadow>
                  <boxGeometry args={[0.38, f.len * 0.9, 0.005]} />
                  <meshStandardMaterial
                    color={idx % 2 === 0 ? '#15803d' : '#166534'}
                    roughness={0.55}
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
// 2. TRADITIONAL VILLAGE CLAY & TERRACOTTA COTTAGE SHELTER
// -------------------------------------------------------------
const VillageHut: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}> = ({ position, rotationY = 0, scale = 1 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Stone Foundation Plinth */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.8, 0.24, 2.8]} />
        <meshStandardMaterial color="#785938" roughness={0.92} />
      </mesh>

      {/* Main Lime-Washed Clay Walls */}
      <mesh position={[0, 1.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.4, 1.6, 2.4]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.88} />
      </mesh>

      {/* Veranda Timber Porch Posts */}
      {[-1.4, 0, 1.4].map((xP, idx) => (
        <mesh key={idx} position={[xP, 0.9, 1.35]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.5, 12]} />
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

      {/* Cast Iron Pump Body (Deep Village Green Enamel) */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.085, 0.76, 20]} />
        <meshStandardMaterial color="#166534" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Top Head Cap */}
      <mesh position={[0, 0.83, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 20]} />
        <meshStandardMaterial color="#14532d" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Water Discharge Spout */}
      <mesh position={[0.14, 0.48, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.18, 16]} />
        <meshStandardMaterial color="#166534" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Stainless Steel Lever Handle with Cast Counterweight Knob */}
      <group position={[-0.04, 0.82, 0]} rotation={[0, 0, 0.22]}>
        <mesh position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.95, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[-0.95, 0, 0]} castShadow>
          <sphereGeometry args={[0.048, 16, 16]} />
          <meshStandardMaterial color="#14532d" metalness={0.8} roughness={0.3} />
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
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color="#c2410c" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.075, 0.07, 20]} />
          <meshStandardMaterial color="#9a3412" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.065, 0.02, 20]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
      </group>

      <group position={[-1.32, -2.187, 0.38]} scale={0.92}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#b45309" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.06, 20]} />
          <meshStandardMaterial color="#9a3412" roughness={0.75} />
        </mesh>
      </group>

      {/* Traditional Indian Polished Brass Water Pot (Safely positioned near Hand Pump) */}
      <group position={[1.75, -2.187, 0.25]} scale={0.95}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.06, 20]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.30, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.055, 0.025, 20]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 5. GLIDING VILLAGE BIRDS HIGH IN SKY
// -------------------------------------------------------------
const VillageGlidingBirds: React.FC = () => {
  const birdsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!birdsRef.current) return;
    const t = state.clock.getElapsedTime();
    birdsRef.current.position.x = ((t * 1.8) % 100) - 50;
    birdsRef.current.position.y = 12 + Math.sin(t * 0.4) * 0.8;
  });

  return (
    <group ref={birdsRef} position={[-25, 12, -22]}>
      {[
        [0, 0, 0],
        [1.8, 0.4, 0.8],
        [-1.6, -0.3, 0.5],
        [3.2, 0.1, 1.4],
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]} scale={0.28}>
          <mesh rotation={[0.2, 0, 0.4]}>
            <boxGeometry args={[0.42, 0.02, 0.09]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.38, 0, 0]} rotation={[0.2, 0, -0.4]}>
            <boxGeometry args={[0.42, 0.02, 0.09]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// MAIN SCENIC ENVIRONMENT: PHOTOREALISTIC RURAL VILLAGE PANORAMA
// -------------------------------------------------------------
export const ScenicEnvironment: React.FC = () => {
  const panoramaTex = useMemo(() => getVillagePanoramaTexture(), []);
  const groundTex = useMemo(() => getRuralGroundTexture(), []);

  return (
    <group name="Photorealistic_Rural_Village_Environment">
      {/* 1. SEAMLESS 360° PANORAMIC RURAL VISTA CYLINDER (Eliminates all choppy cones/primitives) */}
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[65, 65, 42, 64, 1, true]} />
        <meshBasicMaterial
          map={panoramaTex || undefined}
          color={panoramaTex ? '#ffffff' : '#bae6fd'}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. NATURAL TEXTURED RURAL RED-EARTH TERRAIN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.205, 0]} receiveShadow>
        <planeGeometry args={[140, 140, 1, 1]} />
        <meshStandardMaterial
          map={groundTex || undefined}
          color={groundTex ? '#ffffff' : '#523a28'}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* 3. HONED NATURAL SLATE/GRANITE KIOSK PLATFORM (NO CHOPPY ORANGE MAT!) */}
      <mesh position={[-0.1065, -2.195, -0.0375]} receiveShadow>
        <boxGeometry args={[2.8, 0.024, 2.4]} />
        <meshStandardMaterial
          color="#64748b"
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>
      {/* Natural Weathered Stone Curb Trim */}
      <mesh position={[-0.1065, -2.187, -0.0375]}>
        <boxGeometry args={[2.84, 0.008, 2.44]} />
        <meshStandardMaterial
          color="#7c2d12"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 4. DEEP-BOREWELL WELLHEAD ASSEMBLY (UNDER RAW WATER INLET RISER) */}
      <group position={[0.80, -2.187, 0.2505]}>
        {/* Ground casing flange */}
        <mesh position={[0, -0.015, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.085, 0.04, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Machined bolt ring flange */}
        <mesh position={[0, 0.008, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.015, 20]} />
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

      {/* 5. TRADITIONAL TERRACOTTA WATER POTS & BRASS VESSEL */}
      <VillageWaterPots />

      {/* 6. ICONIC INDIA MARK II VILLAGE HAND PUMP ON CIRCULAR SPLASH APRON */}
      <IndiaMark2HandPump position={[2.2, -2.20, 0.35]} rotationY={-0.35} />

      {/* 7. ORGANIC CASCADING COCONUT PALMS FLANKING THE MIDGROUND VIEW */}
      <GracefulCoconutPalm position={[-10.0, -2.20, -14.0]} scale={1.25} rotationY={0.5} leanAngle={0.06} />
      <GracefulCoconutPalm position={[-13.5, -2.20, -18.0]} scale={1.4} rotationY={1.1} leanAngle={0.08} />
      <GracefulCoconutPalm position={[10.0, -2.20, -14.0]} scale={1.25} rotationY={-0.6} leanAngle={-0.06} />
      <GracefulCoconutPalm position={[13.5, -2.20, -18.0]} scale={1.4} rotationY={-1.2} leanAngle={-0.08} />

      {/* 8. TRADITIONAL VILLAGE SHELTER COTTAGE IN MIDGROUND */}
      <VillageHut position={[-13.0, -2.20, -16.0]} rotationY={0.35} scale={1.1} />

      {/* 9. GLIDING VILLAGE BIRDS */}
      <VillageGlidingBirds />
    </group>
  );
};
