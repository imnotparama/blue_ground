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
  r = 0.024,
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
  r = 0.028,
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

// ─── Solenoid Valve Component ─────────────────────────────────────────────────
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
        <cylinderGeometry args={[0.038, 0.038, 0.08, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Solenoid Coil */}
      <mesh position={[0, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 10]} />
        <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Manual Actuator Lever */}
      <mesh ref={leverRef} position={[0, 0.085, 0]} castShadow>
        <boxGeometry args={[0.11, 0.012, 0.018]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
};

export const Pipes = () => {
  const { mode, setActiveHotspot, setCameraPreset } = useSystemState();

  const isDirectValveOpen = mode !== 'TURBIDITY' && mode !== 'CLEANING' && mode !== 'PUMP_FAILURE';
  const isDrainValveOpen = mode === 'CLEANING';
  const isTapOpen = mode !== 'PUMP_FAILURE';

  return (
    <group>
      {/* ══════════════════════════════════════════════════════════════════════
          1. INTAKE: BOREWELL [2.8, -1.8] → SEDIMENTATION TANK TOP [1.9, 0.73]
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
        {/* Foot valve strainer inside borewell */}
        <mesh position={[2.8, -1.85, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.15, 12, 3, true]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} wireframe />
        </mesh>

        {/* Vertical Riser */}
        <PipeSeg pos={[2.8, -0.50, 0]} len={2.5} r={0.030} mat="gray" />
        <PipeElbow pos={[2.8, 0.75, 0]} r={0.034} mat="gray" />

        {/* Horizontal run to Sedimentation top */}
        <PipeSeg pos={[2.35, 0.75, 0]} len={0.90} r={0.030} rot={[0, 0, Math.PI / 2]} mat="gray" />
        <PipeElbow pos={[1.90, 0.75, 0]} r={0.034} mat="gray" />

        {/* Drop into Sedimentation Tank Top Cap */}
        <PipeSeg pos={[1.90, 0.74, 0]} len={0.04} r={0.030} mat="gray" />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          2. PROCESS: SEDIMENTATION OUTLET [1.62, 0.30] → FLOW SENSOR [1.45] → SECONDARY COMPARTMENT [1.0, 0.30]
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
        {/* Pipe between Sedimentation Tank and Flow Sensor */}
        <PipeSeg pos={[1.56, 0.30, 0]} len={0.18} rot={[0, 0, Math.PI / 2]} />

        {/* Pipe between Flow Sensor and Secondary Tank Inlet */}
        <PipeSeg pos={[1.20, 0.30, 0]} len={0.36} rot={[0, 0, Math.PI / 2]} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          3. DIRECT PASSAGE VALVE (Secondary Floor → Primary Tank for Good Water)
             Position: [0.5, 0.0, 0]
          ══════════════════════════════════════════════════════════════════════ */}
      <group>
        <SolenoidValve pos={[0.5, 0.0, 0]} rot={[Math.PI / 2, 0, 0]} open={isDirectValveOpen} />
        <PipeSeg pos={[0.5, -0.15, 0]} len={0.24} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          4. SECONDARY FILTRATION PUMP LOOP (Bad Quality Water)
             Pump [-0.35, 0.16] → Up to 0.45 → Horizontal to -1.30 → Down into Primary Tank
          ══════════════════════════════════════════════════════════════════════ */}
      <group>
        {/* Riser from Pump */}
        <PipeSeg pos={[-0.35, 0.28, 0]} len={0.24} />
        <PipeElbow pos={[-0.35, 0.40, 0]} />

        {/* Horizontal Loop Pipe */}
        <PipeSeg pos={[-0.825, 0.40, 0]} len={0.95} rot={[0, 0, Math.PI / 2]} />
        <PipeElbow pos={[-1.30, 0.40, 0]} />

        {/* Drop Pipe into Primary Tank */}
        <PipeSeg pos={[-1.30, 0.22, 0]} len={0.36} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          5. CLEAN WATER DISPENSE TAP (Primary Tank Bottom-Left)
             Primary Outlet [-2.4, -1.45] → Solenoid Valve [-2.6] → Tap Spout [-2.85, -1.70]
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
        <PipeSeg pos={[-2.48, -1.45, 0]} len={0.16} rot={[0, 0, Math.PI / 2]} />
        <SolenoidValve pos={[-2.62, -1.45, 0]} open={isTapOpen} />
        <PipeSeg pos={[-2.76, -1.45, 0]} len={0.14} rot={[0, 0, Math.PI / 2]} />
        <PipeElbow pos={[-2.85, -1.45, 0]} />
        <PipeSeg pos={[-2.85, -1.58, 0]} len={0.26} />

        {/* Dispense Spout Nozzle */}
        <mesh position={[-2.85, -1.72, 0]} castShadow>
          <cylinderGeometry args={[0.026, 0.016, 0.05, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          6. RELEASE TAP / DRAIN VALVE FOR CLEANING (Primary Tank Bottom-Right)
             Primary Bottom-Right [1.0, -1.50] → Release Tap [1.25, -1.50]
          ══════════════════════════════════════════════════════════════════════ */}
      <group>
        <PipeSeg pos={[1.08, -1.50, 0]} len={0.16} rot={[0, 0, Math.PI / 2]} />
        <SolenoidValve pos={[1.22, -1.50, 0]} open={isDrainValveOpen} />
        <PipeSeg pos={[1.36, -1.50, 0]} len={0.12} rot={[0, 0, Math.PI / 2]} />
      </group>
    </group>
  );
};
