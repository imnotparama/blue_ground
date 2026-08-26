'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const WaterDropletTracker = () => {
  const { waterTrackMode, waterTrackStage, metrics } = useSystemState();

  const dropletMeshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  // ─── 1. Exact 3D Path Curves for Each Stage ─────────────────────────────────
  const stageCurves = useMemo(() => {
    // Stage 1: Raw Borewell Intake -> Top of Sedimentation Tank
    const stage1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.8, -1.85, 0),
      new THREE.Vector3(2.8, -0.50, 0),
      new THREE.Vector3(2.8, 0.78, 0),
      new THREE.Vector3(2.35, 0.78, 0),
      new THREE.Vector3(1.90, 0.78, 0),
      new THREE.Vector3(1.90, 0.70, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 2: Sedimentation Tank Internal Settling Downward
    const stage2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.90, 0.70, 0),
      new THREE.Vector3(1.90, 0.20, 0),
      new THREE.Vector3(1.90, -0.20, 0),
      new THREE.Vector3(1.90, -0.50, 0),
      new THREE.Vector3(1.75, -0.30, 0),
      new THREE.Vector3(1.62, 0.30, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 3: Transfer to Inline Flow Sensor & Quality Chamber Inflow
    const stage3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.62, 0.30, 0),
      new THREE.Vector3(1.45, 0.30, 0),
      new THREE.Vector3(1.20, 0.30, 0),
      new THREE.Vector3(1.00, 0.30, 0),
      new THREE.Vector3(0.85, 0.30, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 4: Secondary Chamber Testing Probes & Pump Intake
    const stage4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.85, 0.30, 0),
      new THREE.Vector3(0.60, 0.25, 0),
      new THREE.Vector3(0.45, 0.20, 0),
      new THREE.Vector3(0.20, 0.12, 0),
      new THREE.Vector3(0.05, 0.08, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 5: High-Pressure Pump through 4-Stage RO Multi-Barrier
    const stage5 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.08, 0),
      new THREE.Vector3(0.05, 0.38, 0),
      new THREE.Vector3(-0.45, 0.38, 0),
      new THREE.Vector3(-0.95, 0.38, 0),
      new THREE.Vector3(-1.85, 0.38, 0),
      new THREE.Vector3(-1.95, 0.38, 0),
      new THREE.Vector3(-1.95, 0.10, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 6: Cascading into Primary 250L Clean Storage Reservoir & UV-C
    const stage6 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.95, 0.10, 0),
      new THREE.Vector3(-1.60, -0.20, 0),
      new THREE.Vector3(-1.10, -0.45, 0),
      new THREE.Vector3(-0.70, -0.55, 0),
      new THREE.Vector3(-0.40, -0.60, 0),
    ], false, 'catmullrom', 0.05);

    return { 1: stage1, 2: stage2, 3: stage3, 4: stage4, 5: stage5, 6: stage6 };
  }, []);

  // Trail history buffer (20 trailing positions)
  const trailPositions = useMemo(() => new Float32Array(20 * 3), []);

  useFrame((state) => {
    if (!waterTrackMode) return;

    const time = state.clock.getElapsedTime();
    // Continuous loop progression through the active stage curve (loops every 3.5s)
    const progress = (time * 0.28) % 1.0;

    const activeCurve = stageCurves[waterTrackStage as keyof typeof stageCurves] || stageCurves[1];
    const point = activeCurve.getPointAt(progress);

    if (dropletMeshRef.current) {
      dropletMeshRef.current.position.copy(point);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.04;
      const pulse = 1.0 + Math.sin(time * 6) * 0.15;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }

    // Update sparkling particle trail
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 19; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3];
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
      }
      positions[0] = point.x + (Math.random() - 0.5) * 0.04;
      positions[1] = point.y + (Math.random() - 0.5) * 0.04;
      positions[2] = point.z + (Math.random() - 0.5) * 0.04;
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!waterTrackMode) return null;

  const stageData = {
    1: { title: 'Raw Intake Wellhead', metric: 'Mineral Runoff • 450 ppm', color: 'from-amber-500 to-orange-600', badge: 'STAGE 1/6' },
    2: { title: 'Primary Sedimentation', metric: 'Gravity Settling • Grit Trap', color: 'from-amber-600 to-yellow-500', badge: 'STAGE 2/6' },
    3: { title: 'YF-S201 Flow Telemetry', metric: `${metrics.flowRate.toFixed(1)} L/min Inline Rate`, color: 'from-cyan-500 to-blue-600', badge: 'STAGE 3/6' },
    4: { title: 'IoT Probing Chamber', metric: `TDS: ${metrics.tds} • pH: ${metrics.ph.toFixed(1)}`, color: 'from-blue-500 to-cyan-400', badge: 'STAGE 4/6' },
    5: { title: '4-Stage RO Purifier', metric: 'PP + CTO + RO + Post-C', color: 'from-cyan-400 to-teal-400', badge: 'STAGE 5/6' },
    6: { title: 'Clean Storage & UV-C', metric: '254nm Active Sterilization', color: 'from-emerald-400 to-teal-300', badge: 'STAGE 6/6' },
  }[waterTrackStage as 1 | 2 | 3 | 4 | 5 | 6] || { title: 'Water Tracking', metric: 'In Progress', color: 'from-cyan-500 to-blue-500', badge: 'FLOW ACTIVE' };

  return (
    <group>
      {/* ─── Glowing Holographic Water Packet ─── */}
      <group ref={dropletMeshRef} position={[2.8, -1.8, 0]}>
        {/* Outer Pulsing Neon Tracking Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.10, 24]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>

        {/* Luminous Inner Core Water Droplet */}
        <mesh castShadow>
          <sphereGeometry args={[0.055, 20, 20]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.2}
            transmission={0.8}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Point Light Illuminating Immediate Plumbing */}
        <pointLight color="#38bdf8" intensity={1.8} distance={1.2} decay={2} />

        {/* Floating 3D Micro-Label Follower Badge */}
        <Html
          position={[0, 0.18, 0]}
          center
          distanceFactor={6.5}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="flex flex-col items-center gap-1 -translate-y-2 animate-bounce-subtle">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-bold font-mono text-cyan-300 uppercase tracking-wider">
                {stageData.badge}
              </span>
              <span className="text-[10px] font-mono text-white/90">
                {stageData.title}
              </span>
            </div>
            <div className="w-0.5 h-3 bg-gradient-to-b from-cyan-400 to-transparent" />
          </div>
        </Html>
      </group>

      {/* ─── Trailing Sparkle Particle Trail ─── */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#38bdf8"
          size={0.035}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
