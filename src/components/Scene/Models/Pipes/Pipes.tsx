'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Shared Pipe Materials ────────────────────────────────────────────────────
const WhitePvc = () => (
  <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.08} />
);
const GrayPvc = () => (
  <meshStandardMaterial color="#64748b" roughness={0.45} metalness={0.08} />
);

// ─── Primitive Pipe Segment ───────────────────────────────────────────────────
const PipeSeg = ({
  pos,
  len,
  r = 0.026,
  rot = [0, 0, 0] as [number, number, number],
  mat = 'white' as 'white' | 'gray',
}: {
  pos: [number, number, number];
  len: number;
  r?: number;
  rot?: [number, number, number];
  mat?: 'white' | 'gray';
}) => (
  <mesh position={pos} rotation={rot} castShadow>
    <cylinderGeometry args={[r, r, len, 12]} />
    {mat === 'white' ? <WhitePvc /> : <GrayPvc />}
  </mesh>
);

const PipeElbow = ({
  pos,
  r = 0.030,
  mat = 'white' as 'white' | 'gray',
}: {
  pos: [number, number, number];
  r?: number;
  mat?: 'white' | 'gray';
}) => (
  <mesh position={pos} castShadow>
    <sphereGeometry args={[r, 12, 12]} />
    {mat === 'white' ? <WhitePvc /> : <GrayPvc />}
  </mesh>
);

// ─── Industrial Solenoid Valve ────────────────────────────────────────────────
const SolenoidValve = ({
  pos,
  rot = [0, 0, Math.PI / 2] as [number, number, number],
  open = true,
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
  open?: boolean;
}) => {
  const leverRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (leverRef.current) {
      const targetZ = open ? 0 : Math.PI / 2;
      leverRef.current.rotation.z = THREE.MathUtils.lerp(leverRef.current.rotation.z, targetZ, 0.1);
    }
  });

  return (
    <group position={pos} rotation={rot}>
      {/* Valve Main Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.09, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Solenoid Coil Cylinder / Stem */}
      <mesh position={[0, 0.065, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.055, 10]} />
        <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Manual Actuator Lever */}
      <mesh ref={leverRef} position={[0, 0.095, 0]} castShadow>
        <boxGeometry args={[0.12, 0.014, 0.02]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
};

export const Pipes = () => {
  const { mode, setActiveHotspot, setCameraPreset } = useSystemState();

  const isProcessValveOpen = mode !== 'PUMP_FAILURE' && mode !== 'MAINTENANCE';
  const isOutletValveOpen = mode !== 'CLEANING' && mode !== 'PUMP_FAILURE';

  return (
    <group>
      {/* ══════════════════════════════════════════════════════════════════════
          1. RAW WATER INTAKE PIPE (Gray PVC)
             Borewell [3.6, -2.1, 0] → Riser to [3.6, 0.0] → Horizontal to [2.65, 0.0] → Drop to Secondary Tank
          ══════════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('intake_pipe');
          setCameraPreset('INTAKE_PIPE');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Foot Valve Strainer inside Wellhead */}
        <mesh position={[3.6, -2.15, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.16, 12, 3, true]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} wireframe />
        </mesh>
        <mesh position={[3.6, -2.15, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.14, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Vertical Riser Pipe */}
        <PipeSeg pos={[3.6, -1.05, 0]} len={2.1} r={0.032} mat="gray" />
        <PipeElbow pos={[3.6, 0.0, 0]} r={0.036} mat="gray" />

        {/* Horizontal Overhead Pipe to Secondary Tank */}
        <PipeSeg pos={[3.125, 0.0, 0]} len={0.95} r={0.032} rot={[0, 0, Math.PI / 2]} mat="gray" />
        <PipeElbow pos={[2.65, 0.0, 0]} r={0.036} mat="gray" />

        {/* Short Drop into Secondary Tank Inlet */}
        <PipeSeg pos={[2.65, -0.125, 0]} len={0.25} r={0.032} mat="gray" />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN FILTRATION PROCESS PIPE (White PVC)
             Secondary Tank Outlet [1.55, -1.60] → Pump [1.55, -1.65] → Flow Sensor [0.85] → Solenoid [0.45] → Sedimentation Riser [0.15, -0.20]
          ══════════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('return_pipe');
          setCameraPreset('RETURN_PIPE');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Pipe from Pump Outlet to Flow Sensor */}
        <PipeSeg pos={[1.20, -1.65, 0]} len={0.50} rot={[0, 0, Math.PI / 2]} />

        {/* Pipe from Flow Sensor to Solenoid Valve */}
        <PipeSeg pos={[0.65, -1.65, 0]} len={0.25} rot={[0, 0, Math.PI / 2]} />

        {/* Process Solenoid Valve */}
        <SolenoidValve pos={[0.45, -1.65, 0]} open={isProcessValveOpen} />

        {/* Pipe from Valve to Corner Elbow */}
        <PipeSeg pos={[0.30, -1.65, 0]} len={0.20} rot={[0, 0, Math.PI / 2]} />
        <PipeElbow pos={[0.15, -1.65, 0]} />

        {/* Vertical Riser to Sedimentation Tank Top Cap */}
        <PipeSeg pos={[0.15, -0.925, 0]} len={1.45} />
        <PipeElbow pos={[0.15, -0.20, 0]} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          3. PURIFIED WATER RETURN PIPE (White PVC)
             Sedimentation Funnel [0.15, -1.75] → Drop to -1.90 → Horizontal under tanks → Riser into Primary Tank Upper Chamber [-1.0, -0.55]
          ══════════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('return_pipe');
          setCameraPreset('RETURN_PIPE');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Drop from Sedimentation Bottom Funnel */}
        <PipeSeg pos={[0.15, -1.825, 0]} len={0.15} />
        <PipeElbow pos={[0.15, -1.90, 0]} />

        {/* Long Under-Tank Horizontal Return Pipe */}
        <PipeSeg pos={[-0.425, -1.90, 0]} len={1.15} rot={[0, 0, Math.PI / 2]} />
        <PipeElbow pos={[-1.0, -1.90, 0]} />

        {/* Vertical Riser to Primary Tank Upper Chamber Inlet */}
        <PipeSeg pos={[-1.0, -1.225, 0]} len={1.35} />
        <PipeElbow pos={[-1.0, -0.55, 0]} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          4. CLEAN WATER OUTLET PIPE & SOLENOID TAP (White PVC)
             Primary Tank Left Wall [-3.0, -1.35] → Solenoid Valve [-3.35] → Pure Water Dispense Tap [-3.65, -1.68]
          ══════════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          setActiveHotspot('drain_valve');
          setCameraPreset('DRAIN_VALVE');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Stub from Primary Outlet Nozzle */}
        <PipeSeg pos={[-3.125, -1.35, 0]} len={0.25} rot={[0, 0, Math.PI / 2]} />

        {/* Clean Water Solenoid Dispense Valve */}
        <SolenoidValve pos={[-3.35, -1.35, 0]} open={isOutletValveOpen} />

        {/* Pipe to Tap Elbow */}
        <PipeSeg pos={[-3.50, -1.35, 0]} len={0.20} rot={[0, 0, Math.PI / 2]} />
        <PipeElbow pos={[-3.65, -1.35, 0]} />

        {/* Vertical Drop to Tap */}
        <PipeSeg pos={[-3.65, -1.515, 0]} len={0.33} />

        {/* Polished Stainless Steel Dispense Spout Nozzle */}
        <mesh position={[-3.65, -1.68, 0]} castShadow>
          <cylinderGeometry args={[0.028, 0.018, 0.055, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>
    </group>
  );
};
