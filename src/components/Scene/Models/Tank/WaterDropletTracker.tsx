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
    title: 'Raw Subterranean Intake',
    metric: '450+ NTU • Borewell / Rural Slurry Inflow',
    badge: 'STAGE 1/6: RAW INTAKE',
    lightIntensity: 2.0,
  },
  2: {
    color: '#eab308',
    emissive: '#ca8a04',
    ringColor: '#fde047',
    trailColor: '#eab308',
    particleSize: 0.038,
    title: 'Sedimentation Tank & Flow Telemetry',
    metric: 'Gravitational Grit Trap • 4.80 L/min Hall Sensor',
    badge: 'STAGE 2/6: SEDIMENTATION & TELEMETRY',
    lightIntensity: 2.4,
  },
  3: {
    color: '#06b6d4',
    emissive: '#0284c7',
    ringColor: '#38bdf8',
    trailColor: '#0ea5e9',
    particleSize: 0.034,
    title: '4-Stage Smart Filtration Train',
    metric: 'SediShield ➔ ChemoBlock ➔ RO Maxx ➔ Active Copper',
    badge: 'STAGE 3/6: 4-STAGE FILTRATION',
    lightIntensity: 2.8,
  },
  4: {
    color: '#8b5cf6',
    emissive: '#6d28d9',
    ringColor: '#a855f7',
    trailColor: '#8b5cf6',
    particleSize: 0.035,
    title: 'Quality Verification Chamber',
    metric: 'TDS #2, pH #2 & Turbidity Sensor Suite',
    badge: 'STAGE 4/6: DUAL VERIFICATION',
    lightIntensity: 2.6,
  },
  5: {
    color: '#10b981',
    emissive: '#059669',
    ringColor: '#34d399',
    trailColor: '#10b981',
    particleSize: 0.032,
    title: 'Quality Decision Gate',
    metric: 'Pure ➔ Clean Reservoir | Impure ➔ Recirculate',
    badge: 'STAGE 5/6: DECISION GATE',
    lightIntensity: 2.8,
  },
  6: {
    color: '#38bdf8',
    emissive: '#0284c7',
    ringColor: '#34d399',
    trailColor: '#38bdf8',
    particleSize: 0.028,
    title: 'Primary Clean Water Reservoir',
    metric: '250L Potable Water • Continuous Monitoring',
    badge: 'STAGE 6/6: POTABLE RESERVOIR',
    lightIntensity: 2.8,
  },
};

export const WaterDropletTracker = () => {
  const { 
    waterTrackMode, 
    waterTrackStage, 
    metrics, 
    recirculationTriggered,
    hydroGeneratorMode,
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

  const isRecirculating = (metrics.tds2 || 0) > 100 || (metrics.turbidity2 || 0) > 1.0 || recirculationTriggered;

  // ─── 1. Exact 3D Path Curves for Each Stage ─────────────────────────────────
  const stageCurves = useMemo(() => {
    // Stage 1: Raw Borewell / Hand Pump Intake -> Riser -> Top of Sedimentation Tank
    const stage1 = hydroGeneratorMode
      ? new THREE.CatmullRomCurve3([
          new THREE.Vector3(2.52, -1.27, 0),
          new THREE.Vector3(2.52, -0.40, 0),
          new THREE.Vector3(2.52, 0.78, 0),
          new THREE.Vector3(2.18, 0.78, 0),
        ], false, 'catmullrom', 0.05)
      : new THREE.CatmullRomCurve3([
          new THREE.Vector3(2.8, -1.85, 0),
          new THREE.Vector3(2.8, -0.50, 0),
          new THREE.Vector3(2.8, 0.78, 0),
          new THREE.Vector3(2.18, 0.78, 0),
        ], false, 'catmullrom', 0.05);

    // Stage 2: Sedimentation Tank Settling Beds -> Flow Sensor -> Booster Pump Inlet
    const stage2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.18, 0.78, 0), // Top inlet of Sedimentation Tank
      new THREE.Vector3(1.90, 0.45, 0), // Settling through sand & gravel
      new THREE.Vector3(1.64, 0.30, 0), // Sedimentation outlet
      new THREE.Vector3(1.48, 0.30, 0), // Inline YF-S201 Flow Sensor
      new THREE.Vector3(1.35, 0.30, 0), // Elbow above booster pump
      new THREE.Vector3(1.35, 0.10, 0), // Booster Pump impeller core
    ], false, 'catmullrom', 0.05);

    // Stage 3: High-Pressure Pump through 4-Stage Smart Filtration Train (SediShield -> ChemoBlock -> RO Maxx -> Active Copper)
    const stage3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.35, 0.12, 0),        // Booster Pump outlet
      new THREE.Vector3(1.35, 0.45, 0),        // Riser
      new THREE.Vector3(1.35, 0.79, 0),        // Overhead elbow
      new THREE.Vector3(1.35, 0.79, -0.62),    // Turn to back rack
      new THREE.Vector3(0.00, 0.79, -0.62),    // Top rack conduit
      new THREE.Vector3(-1.36, 0.79, -0.62),   // Stage 1 SediShield top inlet
      new THREE.Vector3(-1.36, 0.45, -0.62),   // Stage 1 SediShield core (silt/rust trapped)
      new THREE.Vector3(-1.14, 0.79, -0.62),   // Jumper to Stage 2
      new THREE.Vector3(-0.92, 0.79, -0.62),   // Stage 2 ChemoBlock top inlet
      new THREE.Vector3(-0.92, 0.45, -0.62),   // Stage 2 ChemoBlock core (chemicals stripped)
      new THREE.Vector3(-0.70, 0.79, -0.62),   // Jumper to Stage 3
      new THREE.Vector3(-0.48, 0.79, -0.62),   // Stage 3 RO Maxx top inlet
      new THREE.Vector3(-0.48, 0.45, -0.62),   // Stage 3 RO Maxx membrane core (TDS dropped)
      new THREE.Vector3(-0.26, 0.79, -0.62),   // Jumper to Stage 4
      new THREE.Vector3(-0.04, 0.79, -0.62),   // Stage 4 Active Copper top inlet
      new THREE.Vector3(-0.04, 0.45, -0.62),   // Stage 4 Active Copper core (copper ion infusion & antimicrobial polish)
    ], false, 'catmullrom', 0.05);

    // Stage 4: Discharge from Stage 4 Active Copper into Quality Verification Tank (Chamber 2) & Multi-Sensor Testing
    const stage4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.45, -0.62),   // Stage 4 Active Copper core
      new THREE.Vector3(-0.04, 0.79, -0.62),   // Stage 4 top discharge
      new THREE.Vector3(-0.04, 0.79, 0),       // Return forward
      new THREE.Vector3(-0.945, 0.79, 0),      // Overhead conduit to Verification Tank
      new THREE.Vector3(-1.85, 0.79, 0),       // Over Verification Tank
      new THREE.Vector3(-1.85, 0.50, 0),       // Inlet drop
      new THREE.Vector3(-1.85, 0.15, 0),       // Center of Verification Chamber (sensor probing)
    ], false, 'catmullrom', 0.05);

    // Stage 5 Path A: Clean Approved -> Transfer to Primary Clean Storage
    const stage5Clean = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.85, 0.15, 0),       // Verification Tank
      new THREE.Vector3(-1.85, -0.16, 0),      // Bottom outlet
      new THREE.Vector3(-1.85, -0.22, 0),      // 3-way valve
      new THREE.Vector3(-1.50, -0.22, 0),      // Horizontal to clean reservoir inlet
      new THREE.Vector3(-1.50, -0.45, 0),      // Drop into clean tank
      new THREE.Vector3(-0.90, -0.80, 0),      // Cascading into potable reservoir
    ], false, 'catmullrom', 0.05);

    // Stage 5 Path B: Sub-Standard Impure -> Recirculation Loop back to Stage 1 SediShield
    const stage5Recirc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.85, 0.15, 0),       // Verification Tank (impure)
      new THREE.Vector3(-1.85, -0.16, 0),      // Bottom drain port
      new THREE.Vector3(-1.85, -0.22, 0),      // 3-way diverter valve
      new THREE.Vector3(-1.85, -0.22, -0.62),  // Depth pipe to back rack
      new THREE.Vector3(-1.85, 0.28, -0.62),   // Return riser
      new THREE.Vector3(-1.85, 0.79, -0.62),   // Top rack elbow
      new THREE.Vector3(-1.36, 0.79, -0.62),   // Return to Stage 1 SediShield top inlet!
      new THREE.Vector3(-1.36, 0.45, -0.62),   // Re-entering filtration train
    ], false, 'catmullrom', 0.05);

    // Stage 6: Primary Clean Storage & Dispense Tap
    const stage6 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.20, -0.70, 0),
      new THREE.Vector3(-0.70, -0.80, 0),
      new THREE.Vector3(-1.50, -1.10, 0),
      new THREE.Vector3(-2.40, -1.45, 0),
      new THREE.Vector3(-2.85, -1.72, 0),
    ], false, 'catmullrom', 0.05);

    return { 
      1: stage1, 
      2: stage2, 
      3: stage3, 
      4: stage4, 
      5: stage5Clean,
      '5_clean': stage5Clean,
      '5_recirc': stage5Recirc,
      6: stage6,
    };
  }, [hydroGeneratorMode]);

  // Trail history buffer (25 trailing positions)
  const trailPositions = useMemo(() => new Float32Array(25 * 3), []);

  useFrame((state) => {
    if (!waterTrackMode) return;

    const time = state.clock.getElapsedTime();
    const progress = (time * 0.28) % 1.0;

    let activeCurve: THREE.CatmullRomCurve3;
    if (waterTrackStage === 5) {
      activeCurve = isRecirculating ? stageCurves['5_recirc'] : stageCurves['5_clean'];
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

  if (!waterTrackMode) return null;

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
            clearcoat={1.0}
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
