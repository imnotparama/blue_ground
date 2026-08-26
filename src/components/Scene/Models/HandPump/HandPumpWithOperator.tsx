'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSystemState } from '@/hooks/useSystemState';

export const HandPumpWithOperator = ({ pos = [2.80, -1.95, 0] as [number, number, number] }) => {
  const { metrics, hydroGeneratorMode } = useSystemState();
  const leverGroupRef = useRef<THREE.Group>(null);
  const operatorTorsoRef = useRef<THREE.Group>(null);
  const operatorLeftArmRef = useRef<THREE.Group>(null);
  const operatorRightArmRef = useRef<THREE.Group>(null);
  const operatorHeadRef = useRef<THREE.Group>(null);
  const splashRef = useRef<THREE.Mesh>(null);

  // Animate the pump handle, internal rod, and operator character synchronously
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isPumping = hydroGeneratorMode && metrics.flowRate > 0.1;
    const pumpSpeed = isPumping ? 3.6 : 0.8;
    const pumpMagnitude = isPumping ? 0.18 : 0.02;

    const stroke = Math.sin(time * pumpSpeed) * pumpMagnitude;

    // 1. Lever Handle Angular Oscillation
    if (leverGroupRef.current) {
      leverGroupRef.current.rotation.z = -0.15 + stroke;
    }

    // 2. Operator Torso & Arm Kinematics
    if (operatorTorsoRef.current) {
      // Torso leans forward on down-stroke, pulls back on up-stroke
      operatorTorsoRef.current.rotation.z = 0.12 - stroke * 0.45;
      operatorTorsoRef.current.position.y = -1.15 + stroke * 0.08;
    }

    if (operatorHeadRef.current) {
      operatorHeadRef.current.rotation.z = 0.08 - stroke * 0.25;
    }

    if (operatorLeftArmRef.current) {
      operatorLeftArmRef.current.rotation.z = 0.35 + stroke * 0.60;
    }

    if (operatorRightArmRef.current) {
      operatorRightArmRef.current.rotation.z = 0.40 + stroke * 0.65;
    }

    // 3. Spout Water Splash Pulsing
    if (splashRef.current) {
      const splashScale = isPumping ? 0.8 + Math.sin(time * 8.0) * 0.25 : 0.001;
      splashRef.current.scale.set(splashScale, splashScale, splashScale);
      splashRef.current.visible = isPumping;
    }
  });

  return (
    <group position={pos}>
      {/* ══════════════════════════════════════════════════════════════════════
          1. CONCRETE APRON & FOUNDATION PLATFORM (Drainage Slab)
          ══════════════════════════════════════════════════════════════════════ */}
      <group position={[0.25, 0.03, 0.10]}>
        {/* Concrete Platform Base */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.35, 0.06, 1.25]} />
          <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Raised Masonry Curb Perimeter Rim */}
        <mesh castShadow receiveShadow position={[0, 0.035, 0.60]}>
          <boxGeometry args={[1.35, 0.03, 0.05]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.035, -0.60]}>
          <boxGeometry args={[1.35, 0.03, 0.05]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.65, 0.03, 0]}>
          <boxGeometry args={[0.05, 0.03, 1.25]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.65, 0.03, 0]}>
          <boxGeometry args={[0.05, 0.03, 1.25]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>

        {/* Drainage Channel Trough under Spout */}
        <mesh position={[-0.30, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 0.20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          2. INDIA MARK II DEEP-WELL HAND PUMP STRUCTURE
          ══════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.06, 0]}>
        {/* A. Base Plate Flange */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.03, 0.36]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.85} />
        </mesh>

        {/* 4 Foundation Heavy Hex Nuts & Washers */}
        {[
          [-0.14, -0.14],
          [0.14, -0.14],
          [-0.14, 0.14],
          [0.14, 0.14],
        ].map(([bx, bz], i) => (
          <group key={i} position={[bx, 0.03, bz]}>
            {/* Washer */}
            <mesh castShadow>
              <cylinderGeometry args={[0.024, 0.024, 0.006, 12]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Hex Nut */}
            <mesh position={[0, 0.012, 0]} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.018, 6]} />
              <meshStandardMaterial color="#64748b" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Threaded Stud */}
            <mesh position={[0, 0.024, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.95} />
            </mesh>
          </group>
        ))}

        {/* 4 Triangular Reinforcement Gusset Ribs */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <group key={i} rotation={[0, ang, 0]}>
            <mesh position={[0.08, 0.09, 0]} castShadow>
              <boxGeometry args={[0.10, 0.14, 0.010]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* B. Lower Stand Cylinder (Pedestal Column) */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.070, 0.078, 0.78, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* C. Flanged Mid-Collar Joint */}
        <group position={[0, 0.81, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.028, 0.18]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Flange Perimeter Hex Bolts */}
          {[
            [-0.065, -0.065],
            [0.065, -0.065],
            [-0.065, 0.065],
            [0.065, 0.065],
          ].map(([fx, fz], i) => (
            <mesh key={i} position={[fx, 0.016, fz]} castShadow>
              <cylinderGeometry args={[0.010, 0.010, 0.010, 6]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* D. Upper Water Tank Cylinder (Plunger Chamber) */}
        <mesh position={[0, 0.96, 0]} castShadow>
          <cylinderGeometry args={[0.082, 0.082, 0.28, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Manufacturer Nameplate Relief Badge */}
        <mesh position={[0, 0.96, 0.083]} castShadow>
          <boxGeometry args={[0.10, 0.04, 0.005]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.25} metalness={0.95} />
        </mesh>

        {/* E. Water Discharge Spout (Welded Outlet Nozzle) */}
        <group position={[-0.08, 0.90, 0]}>
          {/* Spout Weld Collar */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.040, 0.040, 0.02, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Horizontal Discharge Spout Tube extending left */}
          <mesh position={[-0.10, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.20, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Downward Angled Discharge Nozzle with Beaded Lip */}
          <mesh position={[-0.20, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.034, 0.028, 0.10, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
          </mesh>
          <mesh position={[-0.20, -0.10, 0]} castShadow>
            <torusGeometry args={[0.030, 0.006, 8, 16]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
          </mesh>

          {/* Dynamic Water Splash Effect pulsing out of nozzle */}
          <mesh ref={splashRef} position={[-0.20, -0.14, 0]}>
            <cylinderGeometry args={[0.015, 0.032, 0.12, 10]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.75}
              transmission={0.85}
              roughness={0.05}
            />
          </mesh>
        </group>

        {/* F. Slanted Pump Head Box (Matching User Image Blueprint) */}
        <group position={[-0.02, 1.20, 0]} rotation={[0, 0, -0.22]}>
          {/* Slanted Hood Steel Box */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.28, 0.14]} />
            <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.85} />
          </mesh>

          {/* Top Inspection Cover Plate */}
          <mesh position={[0, 0.145, 0]} castShadow>
            <boxGeometry args={[0.16, 0.015, 0.15]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Two Distinct Pivot Pin Rivets (as in user's diagram) */}
          <mesh position={[-0.03, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.152, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.95} />
          </mesh>
          <mesh position={[0.03, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.152, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.95} />
          </mesh>

          {/* G. Long Operating Handle Lever & Chain Mechanism */}
          <group ref={leverGroupRef} position={[0.03, 0.05, 0]}>
            {/* Internal Connecting Chain Link to Piston Rod */}
            <mesh position={[-0.04, -0.10, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.95} />
            </mesh>

            {/* Rear Balance Counterweight Knob */}
            <mesh position={[-0.08, 0.02, 0]} castShadow>
              <cylinderGeometry args={[0.032, 0.032, 0.08, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
            </mesh>

            {/* Long Steel Lever Arm extending up and back */}
            <mesh position={[0.42, 0.26, 0]} rotation={[0, 0, 0.58]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.98, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
            </mesh>

            {/* Heavy-Duty Ergonomic Handle Grip Sleeve */}
            <mesh position={[0.84, 0.52, 0]} rotation={[0, 0, 0.58]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.18, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
            </mesh>

            {/* T-Bar Grip Stop Collar */}
            <mesh position={[0.93, 0.58, 0]} rotation={[0, 0, 0.58]} castShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.02, 16]} />
              <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          3. ANIMATED 3D MINING FIELD OPERATOR (Pumping Character)
          ══════════════════════════════════════════════════════════════════════ */}
      <group position={[0.62, 0.06, 0.18]} rotation={[0, -Math.PI / 2 + 0.25, 0]}>
        {/* A. Work Boots (Steel Toe) */}
        {/* Left Boot */}
        <group position={[-0.10, 0.04, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.08, 0.18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.03, 0.04]} castShadow>
            <boxGeometry args={[0.085, 0.02, 0.12]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Boot */}
        <group position={[0.10, 0.04, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.08, 0.18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.03, 0.04]} castShadow>
            <boxGeometry args={[0.085, 0.02, 0.12]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.7} />
          </mesh>
        </group>

        {/* B. Legs (Industrial Work Cargo Pants) */}
        {/* Left Leg */}
        <mesh position={[-0.10, 0.30, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.048, 0.48, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.75} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.10, 0.30, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.048, 0.48, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.75} />
        </mesh>

        {/* C. Operator Upper Body, Vest & Arms (Kinematic Rig) */}
        <group ref={operatorTorsoRef} position={[0, 0.65, 0]}>
          {/* Pelvis & Belt */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.11, 0.10, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Tool Pouch on Belt */}
          <mesh position={[0.12, -0.06, 0.02]} castShadow>
            <boxGeometry args={[0.05, 0.08, 0.06]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>

          {/* Torso / Field Jacket */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.30, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>

          {/* High-Visibility Neon Orange Safety Vest */}
          <mesh position={[0, 0.14, 0.005]} castShadow>
            <cylinderGeometry args={[0.145, 0.125, 0.28, 14]} />
            <meshStandardMaterial color="#ea580c" roughness={0.5} metalness={0.1} />
          </mesh>

          {/* Silver Reflective Safety Stripes */}
          <mesh position={[0, 0.18, 0.008]}>
            <cylinderGeometry args={[0.147, 0.147, 0.035, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.08, 0.008]}>
            <cylinderGeometry args={[0.138, 0.138, 0.035, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
          </mesh>

          {/* D. Head, Face & Hard Hat */}
          <group ref={operatorHeadRef} position={[0, 0.36, 0]}>
            {/* Neck */}
            <mesh position={[0, -0.04, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.045, 0.06, 10]} />
              <meshStandardMaterial color="#d4a373" roughness={0.6} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshStandardMaterial color="#d4a373" roughness={0.6} />
            </mesh>

            {/* Industrial Safety Goggles */}
            <mesh position={[0, 0.05, 0.065]} castShadow>
              <boxGeometry args={[0.11, 0.035, 0.03]} />
              <meshPhysicalMaterial color="#0284c7" roughness={0.1} transmission={0.7} />
            </mesh>

            {/* High-Vis Yellow Hard Hat (Safety Helmet) */}
            <mesh position={[0, 0.08, -0.005]} castShadow>
              <sphereGeometry args={[0.085, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.3} />
            </mesh>
            {/* Helmet Brim */}
            <mesh position={[0, 0.08, 0.02]} rotation={[-0.1, 0, 0]} castShadow>
              <cylinderGeometry args={[0.10, 0.10, 0.012, 16]} />
              <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.3} />
            </mesh>
          </group>

          {/* E. Left Arm & Gripping Glove */}
          <group ref={operatorLeftArmRef} position={[-0.16, 0.24, 0]}>
            {/* Shoulder */}
            <mesh castShadow>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0.04]} rotation={[0.4, 0, 0]} castShadow>
              <cylinderGeometry args={[0.038, 0.034, 0.22, 10]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Forearm extending forward to handle */}
            <mesh position={[0.02, -0.25, 0.15]} rotation={[0.9, 0, 0]} castShadow>
              <cylinderGeometry args={[0.034, 0.030, 0.22, 10]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Heavy-Duty Work Glove wrapping around handle */}
            <mesh position={[0.02, -0.32, 0.24]} castShadow>
              <boxGeometry args={[0.06, 0.06, 0.07]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
          </group>

          {/* F. Right Arm & Gripping Glove */}
          <group ref={operatorRightArmRef} position={[0.16, 0.24, 0]}>
            {/* Shoulder */}
            <mesh castShadow>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0.04]} rotation={[0.4, 0, 0]} castShadow>
              <cylinderGeometry args={[0.038, 0.034, 0.22, 10]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Forearm extending forward to handle */}
            <mesh position={[-0.02, -0.25, 0.15]} rotation={[0.9, 0, 0]} castShadow>
              <cylinderGeometry args={[0.034, 0.030, 0.22, 10]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Heavy-Duty Work Glove wrapping around handle */}
            <mesh position={[-0.02, -0.32, 0.24]} castShadow>
              <boxGeometry args={[0.06, 0.06, 0.07]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
