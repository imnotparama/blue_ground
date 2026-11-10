'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSystemState } from '@/hooks/useSystemState';
import { SOLID_CRAFT_BODIES, CADBodyData } from './cadModelData';
import * as THREE from 'three';

// Group component for individual CAD body with smooth exploded animation
const CADBodyItem: React.FC<{
  body: CADBodyData;
  exploded: boolean;
  simState: any;
  showLabels: boolean;
}> = ({ body, exploded, simState, showLabels }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // Initial target positions
  const basePos = useMemo(() => new THREE.Vector3(...body.pos), [body.pos]);
  const explodedPos = useMemo(
    () =>
      new THREE.Vector3(
        body.pos[0] + body.explodedOffset[0],
        body.pos[1] + body.explodedOffset[1],
        body.pos[2] + body.explodedOffset[2]
      ),
    [body.pos, body.explodedOffset]
  );

  const baseRot = useMemo(() => new THREE.Euler(...body.rot), [body.rot]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const damp = 1.0 - Math.exp(-6.0 * delta);

    // 1. Smooth Exploded View Animation
    const targetPos = exploded ? explodedPos : basePos;
    meshRef.current.position.lerp(targetPos, damp);

    // 2. Dynamic Fluid Reaction: Primary Clean Tank Water
    if (body.name === 'Fluid_Primary_Clean_Water') {
      const cleanRatio = simState
        ? Math.max(simState.purifiedWaterLevel / simState.purifiedTankCapacity, 0.08)
        : 0.7;
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, cleanRatio, damp);
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetPos.y - (1 - cleanRatio) * (body.size[1] as number) * 0.5,
        damp
      );
    }

    // 3. Dynamic Fluid Reaction: Secondary Raw Sensor Tank Water
    if (body.name === 'Fluid_Secondary_Sensor_Water') {
      const rawRatio = simState
        ? Math.max(simState.rawWaterLevel / simState.rawTankCapacity, 0.08)
        : 0.85;
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, rawRatio, damp);

      // Turbidity color shift to brown when contaminated
      if (matRef.current) {
        const isTurbid = simState ? simState.inputTurbidity > 10 : false;
        const targetColor = isTurbid ? new THREE.Color('#92400e') : new THREE.Color('#0284c7');
        matRef.current.color.lerp(targetColor, damp);
      }
    }

    // 4. Dynamic UV Chamber Germicidal Purple/Cyan Glow
    if (body.name === 'Reactor_UV_Disinfection' && matRef.current) {
      const isUvOn = simState?.uvStatus === 'ON';
      const targetEmissive = isUvOn ? new THREE.Color('#a855f7') : new THREE.Color('#000000');
      matRef.current.emissive.lerp(targetEmissive, damp);
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        isUvOn ? 1.8 : 0.0,
        damp
      );
    }

    // 5. Booster Pump Vibration while running
    if (body.name.includes('PumpP2') && simState?.pumpStatus === 'RUNNING') {
      const jitter = (Math.sin(Date.now() * 0.08) * 0.0006) * (simState.pumpRpm / 2000);
      meshRef.current.position.x += jitter;
    }
  });

  // Render Box Geometry
  if (body.type === 'box') {
    const size = body.size as [number, number, number];
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow={!body.transparent}
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={matRef}
          color={body.color}
          metalness={body.metalness}
          roughness={body.roughness}
          opacity={body.opacity}
          transparent={body.transparent}
        />
      </mesh>
    );
  }

  // Render Cylinder Geometry
  if (body.type === 'cylinder') {
    const [radius, height] = body.size as [number, number];
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow={!body.transparent}
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, height, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color={body.color}
          metalness={body.metalness}
          roughness={body.roughness}
          opacity={body.opacity}
          transparent={body.transparent}
        />
      </mesh>
    );
  }

  return null;
};

export const SolidCraftModel: React.FC = () => {
  const { exploded, simState, showHotspots } = useSystemState();

  // Key Sensor Coordinates for In-Situ 3D Digital Twin HTML Badges
  const sensorBadges = useMemo(() => [
    {
      name: 'pH Probe',
      tag: 'SEN_PH_01',
      pos: [-0.2415, -0.92, -0.0375] as [number, number, number],
      val: `${simState ? simState.inputPh : 7.2} pH`,
      status: 'OPTIMAL',
    },
    {
      name: 'TDS Probe',
      tag: 'SEN_TDS_01',
      pos: [-0.1575, -0.92, -0.0375] as [number, number, number],
      val: `${simState ? simState.inputTds : 320} ppm`,
      status: simState?.inputTds > 500 ? 'ELEVATED' : 'NOMINAL',
    },
    {
      name: 'Turbidity Sensor',
      tag: 'SEN_TURB_01',
      pos: [-0.0615, -0.92, -0.0375] as [number, number, number],
      val: `${simState ? simState.inputTurbidity : 1.2} NTU`,
      status: simState?.inputTurbidity > 5 ? 'DIRTY' : 'CLEAR',
    },
    {
      name: 'Water Temp',
      tag: 'SEN_TEMP_01',
      pos: [0.0285, -0.75, -0.0375] as [number, number, number],
      val: `${simState ? simState.temperature.toFixed(1) : 24.5} °C`,
      status: 'STABLE',
    },
    {
      name: 'Flow Meter',
      tag: 'SEN_FLOW_01',
      pos: [0.4035, -1.95, 0.3825] as [number, number, number],
      val: `${simState ? simState.inputFlowRate : 5.0} L/m`,
      status: 'ACTIVE',
    },
    {
      name: 'Booster Pump P2',
      tag: 'ACT_PUMP_01',
      pos: [0.5535, -0.85, -0.6075] as [number, number, number],
      val: `${simState ? simState.pumpRpm : 1800} RPM`,
      status: simState?.pumpStatus || 'RUNNING',
    },
    {
      name: 'UV Disinfection',
      tag: 'ACT_UV_01',
      pos: [-0.1065, -1.25, -0.6075] as [number, number, number],
      val: `254nm (${simState?.uvStatus || 'ON'})`,
      status: simState?.uvStatus === 'ON' ? 'STERILIZING' : 'OFF',
    },
    {
      name: 'Potable Dispense Tap',
      tag: 'DISPENSE_TAP',
      pos: [0.5535, -1.65, 0.5475] as [number, number, number],
      val: `${simState ? simState.outputTds : 16} ppm pure`,
      status: 'POTABLE',
    },
  ], [simState]);

  return (
    <group name="SolidCraft_Leviathan_v9_Assembly">
      {/* 1. RENDER ALL 239 AUTHENTIC SOLIDCRAFT CAD BODIES */}
      {SOLID_CRAFT_BODIES.map((body) => (
        <CADBodyItem
          key={body.id}
          body={body}
          exploded={exploded}
          simState={simState}
          showLabels={showHotspots}
        />
      ))}

      {/* 2. IN-SITU 3D SENSOR TELEMETRY FLOATING BADGES */}
      {sensorBadges.map((badge, idx) => (
        <group key={idx} position={badge.pos}>
          <Html
            center
            distanceFactor={5.5}
            className="pointer-events-none select-none"
          >
            <div className="flex flex-col items-center">
              <div className="px-2 py-1 rounded-md bg-zinc-950/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.35)] flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono text-zinc-400 font-bold">{badge.name}:</span>
                <span className="text-[9px] font-mono font-bold text-white">{badge.val}</span>
              </div>
              <div className="w-[1px] h-3 bg-gradient-to-b from-cyan-400/60 to-transparent" />
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

