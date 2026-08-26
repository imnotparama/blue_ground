'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import { Html } from '@react-three/drei';
import { soundSynth } from '@/utils/audioSynthesizer';
import * as THREE from 'three';

// ─── Stage Metamorphosis Configurations ───────────────────────────────────────
const STAGE_THEMES = {
  1: {
    color: '#d97706',
    emissive: '#92400e',
    ringColor: '#f59e0b',
    trailColor: '#b45309',
    particleSize: 0.045,
    title: 'Raw Mineral Intake',
    metric: '450+ NTU • Turbid Inflow',
    badge: 'STAGE 1/6',
    lightIntensity: 2.0,
  },
  2: {
    color: '#eab308',
    emissive: '#ca8a04',
    ringColor: '#fde047',
    trailColor: '#ca8a04',
    particleSize: 0.040,
    title: 'Primary Sedimentation',
    metric: 'Gravity Settling • Grit Trap',
    badge: 'STAGE 2/6',
    lightIntensity: 2.2,
  },
  3: {
    color: '#0284c7',
    emissive: '#0369a1',
    ringColor: '#38bdf8',
    trailColor: '#0ea5e9',
    particleSize: 0.035,
    title: 'YF-S201 Flow Telemetry',
    metric: '4.80 L/min Inline Rate',
    badge: 'STAGE 3/6',
    lightIntensity: 2.4,
  },
  4: {
    color: '#06b6d4',
    emissive: '#0891b2',
    ringColor: '#22d3ee',
    trailColor: '#06b6d4',
    particleSize: 0.035,
    title: 'IoT Probing Chamber',
    metric: 'TDS: 145 ppm • pH: 7.21',
    badge: 'STAGE 4/6',
    lightIntensity: 2.5,
  },
  5: {
    color: '#14b8a6',
    emissive: '#0d9488',
    ringColor: '#2dd4bf',
    trailColor: '#14b8a6',
    particleSize: 0.030,
    title: '4-Stage RO Purifier',
    metric: '0.0001μm Multi-Barrier',
    badge: 'STAGE 5/6',
    lightIntensity: 2.6,
  },
  6: {
    color: '#38bdf8',
    emissive: '#0284c7',
    ringColor: '#34d399',
    trailColor: '#38bdf8',
    particleSize: 0.028,
    title: 'Clean Storage & UV-C',
    metric: '99.99% Sterile Drinking Water',
    badge: 'STAGE 6/6',
    lightIntensity: 2.8,
  },
};

export const WaterDropletTracker = () => {
  const { 
    waterTrackMode, 
    waterTrackStage, 
    metrics, 
    dualVerificationMode, 
    recirculationTriggered 
  } = useSystemState();

  const dropletMeshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const scanLaserRef = useRef<THREE.Group>(null);
  const uvHaloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Play audio synthesizer sound upon stage transition
  useEffect(() => {
    if (waterTrackMode) {
      soundSynth.playStageSound(waterTrackStage);
    }
  }, [waterTrackMode, waterTrackStage]);

  const isRecirculating = waterTrackStage === 6 && (recirculationTriggered || metrics.recirculationActive);

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

    // Stage 5: High-Pressure Pump through 4-Stage RO Multi-Barrier -> Tank 2
    const stage5 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.08, 0),
      new THREE.Vector3(0.05, 0.38, 0),
      new THREE.Vector3(-0.45, 0.38, 0),
      new THREE.Vector3(-0.95, 0.38, 0),
      new THREE.Vector3(-1.85, 0.38, 0),
      new THREE.Vector3(-1.85, 0.15, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 6 Path A (Potable Pass): Tank 2 -> Clean 250L Reservoir + UV-C
    const stage6Pass = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.85, 0.15, 0),
      new THREE.Vector3(-2.19, 0.03, 0),
      new THREE.Vector3(-2.27, -0.20, 0),
      new THREE.Vector3(-1.60, -0.45, 0),
      new THREE.Vector3(-0.70, -0.55, 0),
      new THREE.Vector3(-0.40, -0.60, 0),
    ], false, 'catmullrom', 0.05);

    // Stage 6 Path B (Sub-Standard Fail): Tank 2 -> Recirculation Return -> Pump -> RO Filter
    const stage6Recirc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.85, 0.15, 0),
      new THREE.Vector3(-1.70, -0.18, 0),
      new THREE.Vector3(-1.70, -0.25, 0),
      new THREE.Vector3(-0.85, -0.25, 0),
      new THREE.Vector3(0.05, -0.25, 0),
      new THREE.Vector3(0.05, 0.08, 0),
      new THREE.Vector3(0.05, 0.38, 0),
      new THREE.Vector3(-0.45, 0.38, 0),
      new THREE.Vector3(-0.95, 0.38, 0),
      new THREE.Vector3(-1.40, 0.38, 0),
    ], false, 'catmullrom', 0.05);

    return { 1: stage1, 2: stage2, 3: stage3, 4: stage4, 5: stage5, 6: stage6Pass, '6_recirc': stage6Recirc };
  }, []);

  // Trail history buffer (25 trailing positions)
  const trailPositions = useMemo(() => new Float32Array(25 * 3), []);

  useFrame((state) => {
    if (!waterTrackMode) return;

    const time = state.clock.getElapsedTime();
    const progress = (time * 0.28) % 1.0;

    let activeCurve: THREE.CatmullRomCurve3;
    if (waterTrackStage === 6 && isRecirculating) {
      activeCurve = stageCurves['6_recirc'];
    } else {
      activeCurve = (stageCurves[waterTrackStage as keyof typeof stageCurves] as THREE.CatmullRomCurve3) || stageCurves[1];
    }
    const point = activeCurve.getPointAt(progress);

    if (dropletMeshRef.current) {
      dropletMeshRef.current.position.copy(point);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.04;
      const pulse = 1.0 + Math.sin(time * 6) * 0.15;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }

    // Stage 4: Optical laser scan cone pulsing
    if (scanLaserRef.current && waterTrackStage === 4) {
      scanLaserRef.current.rotation.y = time * 2.0;
    }

    // Stage 6: UV-C Germicidal ionization halo rotation
    if (uvHaloRef.current && waterTrackStage === 6) {
      uvHaloRef.current.rotation.z += 0.03;
      const uvPulse = 1.0 + Math.sin(time * 8) * 0.12;
      uvHaloRef.current.scale.set(uvPulse, uvPulse, uvPulse);
    }

    // Update sparkling particle trail
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 24; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3];
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
      }
      positions[0] = point.x + (Math.random() - 0.5) * 0.035;
      positions[1] = point.y + (Math.random() - 0.5) * 0.035;
      positions[2] = point.z + (Math.random() - 0.5) * 0.035;
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const baseTheme = STAGE_THEMES[waterTrackStage as 1 | 2 | 3 | 4 | 5 | 6] || STAGE_THEMES[1];
  const currentTheme = isRecirculating
    ? {
        color: '#f59e0b',
        emissive: '#d97706',
        ringColor: '#ef4444',
        trailColor: '#f59e0b',
        particleSize: 0.038,
        title: 'Recirculation Return Loop',
        metric: 'Sub-Standard ➔ Re-Filtering via RO',
        badge: 'STAGE 6: RE-FILTER',
        lightIntensity: 2.8,
      }
    : baseTheme;

  return (
    <group>
      {/* ─── Glowing Holographic Water Packet ─── */}
      <group ref={dropletMeshRef} position={[2.8, -1.8, 0]}>
        {/* Outer Pulsing Neon Tracking Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.10, 24]} />
          <meshBasicMaterial color={currentTheme.ringColor} side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>

        {/* Luminous Inner Core Water Droplet (Metamorphosis Shader Material) */}
        <mesh castShadow>
          <sphereGeometry args={[0.058, 24, 24]} />
          <meshPhysicalMaterial
            color={currentTheme.color}
            emissive={currentTheme.emissive}
            emissiveIntensity={1.4}
            roughness={0.08}
            metalness={0.2}
            transmission={0.82}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Stage 4: Optical Laser Scan Beams (Probing Chamber Active Analysis) */}
        {waterTrackStage === 4 && (
          <group ref={scanLaserRef} position={[0, 0, 0]}>
            {/* TDS Probe Blue Laser Line */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.24, 6]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
            </mesh>
            {/* pH Sensor Magenta Scan Fan */}
            <mesh position={[0.04, 0.10, 0]} rotation={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.20, 6]} />
              <meshBasicMaterial color="#ec4899" transparent opacity={0.8} />
            </mesh>
            {/* Turbidity Yellow Probe Scan */}
            <mesh position={[-0.04, 0.10, 0]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.20, 6]} />
              <meshBasicMaterial color="#eab308" transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {/* Stage 6: UV-C Germicidal Disinfection Ionization Aura */}
        {waterTrackStage === 6 && (
          <mesh ref={uvHaloRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.16, 24]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Point Light Illuminating Immediate Plumbing */}
        <pointLight
          ref={lightRef}
          color={currentTheme.color}
          intensity={currentTheme.lightIntensity}
          distance={1.4}
          decay={2}
        />

        {/* Floating 3D Micro-Label Follower Badge */}
        <Html
          position={[0, 0.20, 0]}
          center
          distanceFactor={6.5}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="flex flex-col items-center gap-1 -translate-y-2 animate-bounce-subtle">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/90 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_18px_rgba(6,182,212,0.45)] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-bold font-mono text-cyan-300 uppercase tracking-wider">
                {currentTheme.badge}
              </span>
              <span className="text-[10px] font-mono text-white/90 font-medium">
                {currentTheme.title}
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
          color={currentTheme.trailColor}
          size={currentTheme.particleSize}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
