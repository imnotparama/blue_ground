'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSystemState } from '@/hooks/useSystemState';

export const HandPumpWithOperator = ({ pos = [2.80, -1.95, 0] as [number, number, number] }) => {
  const { metrics, hydroGeneratorMode } = useSystemState();
  const leverGroupRef = useRef<THREE.Group>(null);
  const chainLinkRef = useRef<THREE.Mesh>(null);
  const pistonRodRef = useRef<THREE.Mesh>(null);
  const operatorTorsoRef = useRef<THREE.Group>(null);
  const operatorLeftArmRef = useRef<THREE.Group>(null);
  const operatorRightArmRef = useRef<THREE.Group>(null);
  const operatorHeadRef = useRef<THREE.Group>(null);
  const waterFlowRef = useRef<THREE.Mesh>(null);

  // Synchronize the handle stroke, chain quadrant, pump rod, and operator biomechanics
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isPumping = hydroGeneratorMode && metrics.flowRate > 0.1;
    const pumpSpeed = isPumping ? 3.8 : 0.8;
    const pumpMagnitude = isPumping ? 0.20 : 0.02;

    const stroke = Math.sin(time * pumpSpeed) * pumpMagnitude;

    // 1. Lever Handle Angular Oscillation
    if (leverGroupRef.current) {
      leverGroupRef.current.rotation.z = -0.12 + stroke;
    }

    // 2. Vertical Piston Rod Reciprocation
    if (pistonRodRef.current) {
      pistonRodRef.current.position.y = 1.06 - stroke * 0.22;
    }

    if (chainLinkRef.current) {
      chainLinkRef.current.position.y = 1.15 - stroke * 0.18;
    }

    // 3. Operator Kinematics (Natural Biomechanical Leaning & Arm Flexion)
    if (operatorTorsoRef.current) {
      operatorTorsoRef.current.rotation.z = 0.14 - stroke * 0.50;
      operatorTorsoRef.current.position.y = -1.14 + stroke * 0.09;
    }

    if (operatorHeadRef.current) {
      operatorHeadRef.current.rotation.z = 0.10 - stroke * 0.28;
    }

    if (operatorLeftArmRef.current) {
      operatorLeftArmRef.current.rotation.z = 0.38 + stroke * 0.65;
    }

    if (operatorRightArmRef.current) {
      operatorRightArmRef.current.rotation.z = 0.42 + stroke * 0.70;
    }

    // 4. Water Flow Stream inside Spout
    if (waterFlowRef.current) {
      const flowScale = isPumping ? 0.9 + Math.sin(time * 10.0) * 0.15 : 0.001;
      waterFlowRef.current.scale.set(flowScale, flowScale, flowScale);
      waterFlowRef.current.visible = isPumping;
    }
  });

  return (
    <group position={pos}>
      {/* ══════════════════════════════════════════════════════════════════════
          1. REINFORCED CONCRETE FOUNDATION APRON & DRAINAGE SLAB
          ══════════════════════════════════════════════════════════════════════ */}
      <group position={[0.22, 0.03, 0.05]}>
        {/* Main Concrete Pedestal Slab */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.40, 0.065, 1.30]} />
          <meshStandardMaterial color="#475569" roughness={0.92} metalness={0.08} />
        </mesh>

        {/* Outer Masonry Beveled Retaining Curbs */}
        <mesh castShadow receiveShadow position={[0, 0.04, 0.62]}>
          <boxGeometry args={[1.40, 0.04, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.04, -0.62]}>
          <boxGeometry args={[1.40, 0.04, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.67, 0.04, 0]}>
          <boxGeometry args={[0.06, 0.04, 1.30]} />
          <meshStandardMaterial color="#334155" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.67, 0.04, 0]}>
          <boxGeometry args={[0.06, 0.04, 1.30]} />
          <meshStandardMaterial color="#334155" roughness={0.88} />
        </mesh>

        {/* Recessed Drainage Catchment Channel */}
        <mesh position={[-0.32, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.38, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          2. PHOTOREALISTIC INDIA MARK II DEEP-WELL HAND PUMP
          ══════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.065, 0]}>
        {/* A. Heavy Cast Steel Ground Baseplate */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.03, 0.38]} />
          <meshStandardMaterial color="#334155" roughness={0.32} metalness={0.88} />
        </mesh>

        {/* 4 Heavy-Duty Foundation Anchor Bolt Assemblies */}
        {[
          [-0.15, -0.15],
          [0.15, -0.15],
          [-0.15, 0.15],
          [0.15, 0.15],
        ].map(([bx, bz], i) => (
          <group key={i} position={[bx, 0.03, bz]}>
            {/* Hardened Base Washer */}
            <mesh castShadow>
              <cylinderGeometry args={[0.026, 0.026, 0.006, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.92} />
            </mesh>
            {/* Lower High-Tensile Hex Nut */}
            <mesh position={[0, 0.012, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.017, 0.018, 6]} />
              <meshStandardMaterial color="#64748b" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Upper Jam Lock-Nut */}
            <mesh position={[0, 0.025, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.017, 0.010, 6]} />
              <meshStandardMaterial color="#64748b" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Protruding Threaded Stud */}
            <mesh position={[0, 0.036, 0]} castShadow>
              <cylinderGeometry args={[0.009, 0.009, 0.016, 10]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.12} metalness={0.96} />
            </mesh>
          </group>
        ))}

        {/* 4 Robust Triangular Stiffener Gusset Ribs with Fillet Welds */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <group key={i} rotation={[0, ang, 0]}>
            <mesh position={[0.095, 0.10, 0]} castShadow>
              <boxGeometry args={[0.11, 0.16, 0.012]} />
              <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.86} />
            </mesh>
            {/* Weld Bead Fillet */}
            <mesh position={[0.095, 0.025, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.11, 8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* B. Seamless Galvanized Lower Stand Pedestal Column */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <cylinderGeometry args={[0.076, 0.084, 0.82, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.28} metalness={0.88} />
        </mesh>

        {/* Circumferential Casting Seam Ribs */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <torusGeometry args={[0.082, 0.005, 8, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.65, 0]} castShadow>
          <torusGeometry args={[0.079, 0.005, 8, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.85} />
        </mesh>

        {/* C. Machined Flanged Mid-Collar Joint */}
        <group position={[0, 0.85, 0]}>
          {/* Lower Stand Flange */}
          <mesh position={[0, -0.014, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.024, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Neoprene Sealing Gasket */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.112, 0.112, 0.005, 24]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
          {/* Upper Cylinder Flange */}
          <mesh position={[0, 0.014, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.024, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
          </mesh>

          {/* 6 Perimeter Connecting Bolts & Nuts */}
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const rad = (idx * Math.PI * 2) / 6;
            const fx = Math.cos(rad) * 0.088;
            const fz = Math.sin(rad) * 0.088;
            return (
              <group key={idx} position={[fx, 0, fz]}>
                <mesh position={[0, 0.028, 0]} castShadow>
                  <cylinderGeometry args={[0.010, 0.010, 0.014, 6]} />
                  <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.95} />
                </mesh>
                <mesh position={[0, -0.028, 0]} castShadow>
                  <cylinderGeometry args={[0.010, 0.010, 0.014, 6]} />
                  <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.95} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* D. Upper Water Tank Cylinder (Plunger Chamber) */}
        <mesh position={[0, 1.01, 0]} castShadow>
          <cylinderGeometry args={[0.086, 0.086, 0.28, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.28} metalness={0.88} />
        </mesh>

        {/* Top Cylinder Gland Cover Plate & Brass Stuffing Box */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.092, 0.086, 0.025, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
        </mesh>
        <mesh position={[0, 1.17, 0]} castShadow>
          <cylinderGeometry args={[0.030, 0.030, 0.020, 16]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.20} metalness={0.95} />
        </mesh>

        {/* Embossed Brass Manufacturer ID Plate */}
        <mesh position={[0, 1.01, 0.088]} castShadow>
          <boxGeometry args={[0.11, 0.045, 0.006]} />
          <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.96} />
        </mesh>

        {/* E. Heavy-Walled Water Discharge Spout (Welded Outlet Nozzle) */}
        <group position={[-0.086, 0.95, 0]}>
          {/* Flared Reinforcement Collar */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.044, 0.044, 0.025, 20]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Horizontal Discharge Spout Tube */}
          <mesh position={[-0.10, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.034, 0.034, 0.20, 20]} />
            <meshStandardMaterial color="#475569" roughness={0.28} metalness={0.88} />
          </mesh>
          {/* Downward Angled Discharge Spout Elbow */}
          <mesh position={[-0.194, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.036, 0.030, 0.10, 20]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Brass Beaded Lip Ring at Spout Mouth */}
          <mesh position={[-0.194, -0.10, 0]} castShadow>
            <torusGeometry args={[0.032, 0.007, 12, 24]} />
            <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.96} />
          </mesh>

          {/* Connected Sealing Gland / Union Coupling to Intake Pipe */}
          <mesh position={[-0.194, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.030, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
          </mesh>

          {/* Internal Flowing Water Stream pulsing through nozzle */}
          <mesh ref={waterFlowRef} position={[-0.194, -0.14, 0]}>
            <cylinderGeometry args={[0.018, 0.034, 0.14, 12]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.80}
              transmission={0.90}
              roughness={0.04}
            />
          </mesh>
        </group>

        {/* F. Slanted Pump Head Box (India Mark II Trapezoidal Hood Blueprint) */}
        <group position={[-0.02, 1.28, 0]} rotation={[0, 0, -0.22]}>
          {/* Cast Iron Trapezoidal Head Box Casing */}
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.30, 0.15]} />
            <meshStandardMaterial color="#334155" roughness={0.32} metalness={0.88} />
          </mesh>

          {/* Top Sloped Inspection Cover Plate with Fastening Bolts */}
          <mesh position={[0, 0.155, 0]} castShadow>
            <boxGeometry args={[0.175, 0.018, 0.16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.22} metalness={0.94} />
          </mesh>
          <mesh position={[-0.05, 0.168, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.010, 6]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.95} />
          </mesh>
          <mesh position={[0.05, 0.168, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.010, 6]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.95} />
          </mesh>

          {/* Front Chain Guide Aperture Slot */}
          <mesh position={[-0.075, -0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.08, 0.16]} />
            <meshStandardMaterial color="#09090b" roughness={0.95} />
          </mesh>

          {/* The Two Distinct Machined Pivot Pin Bosses (Exact Match to Diagram) */}
          {/* Upper Pivot Pin Bushing & Rivet */}
          <group position={[-0.035, 0.06, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.024, 0.024, 0.156, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.95} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.164, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.98} />
            </mesh>
          </group>

          {/* Lower Pivot Pin Bushing & Rivet */}
          <group position={[0.035, -0.05, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.024, 0.024, 0.156, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.95} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.164, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.98} />
            </mesh>
          </group>

          {/* G. Long Operating Handle Lever & Chain Mechanism */}
          <group ref={leverGroupRef} position={[0.035, 0.06, 0]}>
            {/* Front Curved Chain Guide Quadrant */}
            <mesh position={[-0.06, -0.02, 0]} rotation={[0, 0, 0.4]} castShadow>
              <boxGeometry args={[0.06, 0.08, 0.02]} />
              <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
            </mesh>

            {/* Roller Chain Links connected to Piston Rod */}
            <mesh ref={chainLinkRef} position={[-0.055, -0.10, 0]} castShadow>
              <cylinderGeometry args={[0.009, 0.009, 0.16, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.10} metalness={0.96} />
            </mesh>

            {/* Rear Balance Counterweight Bob */}
            <mesh position={[-0.09, 0.025, 0]} castShadow>
              <cylinderGeometry args={[0.036, 0.036, 0.10, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
            </mesh>
            <mesh position={[-0.14, 0.025, 0]} castShadow>
              <sphereGeometry args={[0.036, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.92} />
            </mesh>

            {/* High-Tensile Forged Steel Lever Arm extending back/up */}
            <mesh position={[0.44, 0.28, 0]} rotation={[0, 0, 0.58]} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 1.02, 20]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.18} metalness={0.92} />
            </mesh>

            {/* Heavy-Duty Ergonomic Ribbed Grip Sleeve */}
            <mesh position={[0.88, 0.54, 0]} rotation={[0, 0, 0.58]} castShadow>
              <cylinderGeometry args={[0.024, 0.024, 0.20, 20]} />
              <meshStandardMaterial color="#0f172a" roughness={0.75} metalness={0.15} />
            </mesh>

            {/* High-Vis End Flange Knob */}
            <mesh position={[0.98, 0.60, 0]} rotation={[0, 0, 0.58]} castShadow>
              <cylinderGeometry args={[0.030, 0.030, 0.024, 16]} />
              <meshStandardMaterial color="#eab308" roughness={0.25} metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* H. Polished Stainless Steel Piston Connecting Rod */}
        <mesh ref={pistonRodRef} position={[-0.04, 1.06, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.32, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.08} metalness={0.98} />
        </mesh>
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          3. FULLY RIGGED & ANIMATED MINING FIELD OPERATOR (Pumping Character)
          ══════════════════════════════════════════════════════════════════════ */}
      <group position={[0.66, 0.065, 0.16]} rotation={[0, -Math.PI / 2 + 0.22, 0]}>
        {/* A. Work Boots with Deep Lug Tread */}
        {/* Left Foot */}
        <group position={[-0.10, 0.04, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.085, 0.08, 0.19]} />
            <meshStandardMaterial color="#0f172a" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.032, 0.04]} castShadow>
            <boxGeometry args={[0.09, 0.022, 0.13]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Foot */}
        <group position={[0.10, 0.04, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.085, 0.08, 0.19]} />
            <meshStandardMaterial color="#0f172a" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.032, 0.04]} castShadow>
            <boxGeometry args={[0.09, 0.022, 0.13]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.7} />
          </mesh>
        </group>

        {/* B. Sturdy Legs & Heavy Cargo Pants */}
        <mesh position={[-0.10, 0.30, 0]} castShadow>
          <cylinderGeometry args={[0.056, 0.048, 0.48, 14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.78} />
        </mesh>
        <mesh position={[0.10, 0.30, 0]} castShadow>
          <cylinderGeometry args={[0.056, 0.048, 0.48, 14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.78} />
        </mesh>

        {/* C. Articulated Torso, Vest & High-Vis Rig */}
        <group ref={operatorTorsoRef} position={[0, 0.65, 0]}>
          {/* Heavy Utility Belt & Pouch */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.125, 0.115, 0.10, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0.125, -0.06, 0.02]} castShadow>
            <boxGeometry args={[0.05, 0.08, 0.06]} />
            <meshStandardMaterial color="#78350f" roughness={0.65} />
          </mesh>

          {/* Navy Work Shirt / Jacket */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.145, 0.125, 0.30, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.72} />
          </mesh>

          {/* High-Visibility Neon Orange Safety Vest */}
          <mesh position={[0, 0.14, 0.005]} castShadow>
            <cylinderGeometry args={[0.150, 0.130, 0.28, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.45} metalness={0.12} />
          </mesh>

          {/* Crossed Retroreflective Silver Bands */}
          <mesh position={[0, 0.18, 0.008]}>
            <cylinderGeometry args={[0.152, 0.152, 0.038, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.08, 0.008]}>
            <cylinderGeometry args={[0.143, 0.143, 0.038, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.85} />
          </mesh>

          {/* D. Head, Face & Safety Hard Hat */}
          <group ref={operatorHeadRef} position={[0, 0.36, 0]}>
            {/* Neck */}
            <mesh position={[0, -0.04, 0]} castShadow>
              <cylinderGeometry args={[0.042, 0.046, 0.06, 12]} />
              <meshStandardMaterial color="#d4a373" roughness={0.6} />
            </mesh>

            {/* Stylized Head */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <sphereGeometry args={[0.078, 18, 18]} />
              <meshStandardMaterial color="#d4a373" roughness={0.6} />
            </mesh>

            {/* Industrial Safety Goggles */}
            <mesh position={[0, 0.05, 0.068]} castShadow>
              <boxGeometry args={[0.115, 0.036, 0.03]} />
              <meshPhysicalMaterial color="#0284c7" roughness={0.08} transmission={0.75} />
            </mesh>

            {/* High-Vis Yellow Hard Hat (Safety Helmet) */}
            <mesh position={[0, 0.085, -0.005]} castShadow>
              <sphereGeometry args={[0.088, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#eab308" roughness={0.28} metalness={0.35} />
            </mesh>
            {/* Hard Hat Brim */}
            <mesh position={[0, 0.085, 0.02]} rotation={[-0.1, 0, 0]} castShadow>
              <cylinderGeometry args={[0.104, 0.104, 0.014, 18]} />
              <meshStandardMaterial color="#eab308" roughness={0.28} metalness={0.35} />
            </mesh>
          </group>

          {/* E. Left Arm & Gripping Glove */}
          <group ref={operatorLeftArmRef} position={[-0.17, 0.24, 0]}>
            {/* Shoulder */}
            <mesh castShadow>
              <sphereGeometry args={[0.048, 12, 12]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0.04]} rotation={[0.42, 0, 0]} castShadow>
              <cylinderGeometry args={[0.040, 0.035, 0.22, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Forearm */}
            <mesh position={[0.02, -0.25, 0.15]} rotation={[0.92, 0, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.031, 0.22, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Heavy-Duty Work Glove */}
            <mesh position={[0.02, -0.32, 0.24]} castShadow>
              <boxGeometry args={[0.065, 0.065, 0.075]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
          </group>

          {/* F. Right Arm & Gripping Glove */}
          <group ref={operatorRightArmRef} position={[0.17, 0.24, 0]}>
            {/* Shoulder */}
            <mesh castShadow>
              <sphereGeometry args={[0.048, 12, 12]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0.04]} rotation={[0.42, 0, 0]} castShadow>
              <cylinderGeometry args={[0.040, 0.035, 0.22, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Forearm */}
            <mesh position={[-0.02, -0.25, 0.15]} rotation={[0.92, 0, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.031, 0.22, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Heavy-Duty Work Glove */}
            <mesh position={[-0.02, -0.32, 0.24]} castShadow>
              <boxGeometry args={[0.065, 0.065, 0.075]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
