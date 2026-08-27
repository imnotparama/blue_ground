'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';
import { HandPumpWithOperator } from '../HandPump/HandPumpWithOperator';

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

// ─── Realistic Threaded PTFE Teflon Tape Ring ─────────────────────────────────
const TeflonRing = ({
  pos,
  rot = [0, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
}) => (
  <mesh position={pos} rotation={rot}>
    <cylinderGeometry args={[0.026, 0.026, 0.012, 12]} />
    <meshStandardMaterial color="#ffffff" roughness={0.95} />
  </mesh>
);

// ─── Heavy-Duty Industrial Pipe Mounting Saddle Clamp ──────────────────────────
const PipeClamp = ({
  pos,
  rot = [0, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
}) => (
  <group position={pos} rotation={rot}>
    <mesh castShadow>
      <torusGeometry args={[0.033, 0.007, 6, 16]} />
      <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.8} />
    </mesh>
    <mesh position={[0, 0, -0.035]} castShadow>
      <boxGeometry args={[0.024, 0.024, 0.025]} />
      <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
    </mesh>
  </group>
);

// ─── 3-Way T-Junction Manifold Fitting ─────────────────────────────────────────
const PipeTee = ({
  pos,
  rot = [0, 0, 0] as [number, number, number],
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
}) => (
  <group position={pos} rotation={rot}>
    {/* Horizontal through-pipe collar */}
    <mesh castShadow>
      <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
      <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
    </mesh>
    {/* Branch pipe collar */}
    <mesh position={[0.025, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.024, 0.024, 0.045, 12]} />
      <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
    </mesh>
  </group>
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

// ─── Hydro-Power Turbine Generator Motor Component ─────────────────────────────
const HydroTurbineMotor = ({ pos }: { pos: [number, number, number] }) => {
  const impellerRef = useRef<THREE.Group>(null);
  const { metrics } = useSystemState();

  useFrame((_, delta) => {
    if (impellerRef.current && metrics.flowRate > 0) {
      impellerRef.current.rotation.y += metrics.flowRate * 5.0 * delta;
    }
  });

  return (
    <group position={pos}>
      {/* Heavy-Duty Cast Motor Stator Housing with Cooling Fins */}
      <mesh castShadow>
        <cylinderGeometry args={[0.085, 0.085, 0.42, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Radial Motor Cooling Fins */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, i) => (
        <mesh key={i} rotation={[0, ang, 0]} castShadow>
          <boxGeometry args={[0.19, 0.36, 0.008]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* Top Generator Stator Cap */}
      <mesh position={[0, 0.23, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.085, 0.06, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Waterproof Electrical Power Terminal Box */}
      <group position={[0, 0.18, 0.09]}>
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.08, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Glowing Hydro Energy Generation LED */}
        <mesh position={[0, 0.02, 0.026]}>
          <sphereGeometry args={[0.008, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Transparent Hydro-Vortex Viewport Window */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.088, 0.088, 0.14, 16, 1, true]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.65} transmission={0.9} roughness={0.05} />
      </mesh>

      {/* Spinning Internal Turbine Impeller Runner */}
      <group ref={impellerRef} position={[0, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 10]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
        </mesh>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} rotation={[0, angle, 0.4]} position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.065, 0.08, 0.005]} />
            <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Heavy Flange Couplings */}
      <mesh position={[0, -0.22, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.095, 0.03, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.095, 0.03, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
      </mesh>
    </group>
  );
};

export const Pipes = () => {
  const { 
    mode, 
    setActiveHotspot, 
    setCameraPreset, 
    tanksOnly, 
    dualVerificationMode,
    hydroGeneratorMode 
  } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);

  const isDirectValveOpen = mode !== 'TURBIDITY' && mode !== 'CLEANING' && mode !== 'PUMP_FAILURE';
  const isDrainValveOpen = mode === 'CLEANING';
  const isTapOpen = mode !== 'PUMP_FAILURE';

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = tanksOnly ? 0.001 : 1.0;
    const damp = 1.0 - Math.exp(-8 * delta);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp));
    groupRef.current.visible = groupRef.current.scale.x > 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* ══════════════════════════════════════════════════════════════════════
          1. INTAKE: BOREWELL / HYDRO-POWER GENERATOR MOTOR [2.8, -1.8] → SEDIMENTATION TANK [1.9, 0.78]
          ══════════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          if (hydroGeneratorMode) {
            setActiveHotspot('hydro_generator');
            setCameraPreset('HYDRO_GENERATOR');
          } else {
            setActiveHotspot('intake_pipe');
            setCameraPreset('INTAKE_PIPE');
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Stainless Steel Borewell / Raw Intake Wellhead */}
        <group position={[2.8, -1.95, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.38, 0.12, 24]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.07, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.025, 24]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 24]} />
            <meshPhysicalMaterial
              color="#0e7490"
              transparent
              opacity={0.80}
              roughness={0.1}
              metalness={0.1}
              transmission={0.5}
            />
          </mesh>
        </group>

        {/* Foot valve strainer inside borewell */}
        <mesh position={[2.8, -1.85, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.15, 12, 3, true]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} wireframe />
        </mesh>

        {/* ─── HYDRO-POWER MOTOR GENERATOR & HAND PUMP SETUP ─── */}
        {hydroGeneratorMode ? (
          <group>
            {/* Deep-Well Manual Hand Pump & Animated Field Operator Character sitting firmly on ground floor */}
            <HandPumpWithOperator pos={[2.80, -2.18, 0]} />

            {/* Direct Intake Spout Connector & Union Flange from Hand Pump Outlet */}
            <mesh position={[2.52, -1.22, 0]} castShadow>
              <cylinderGeometry args={[0.038, 0.038, 0.04, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
            </mesh>

            {/* Lower suction intake pipe from Hand Pump spout up to Hydro Motor */}
            <PipeSeg pos={[2.52, -0.81, 0]} len={0.78} r={0.030} mat="gray" />
            <TeflonRing pos={[2.52, -0.62, 0]} />

            {/* In-Line Hydro Power Turbine Generator Motor */}
            <HydroTurbineMotor pos={[2.52, -0.40, 0]} />

            {/* Upper discharge pipe rising from motor up to overhead elbow */}
            <TeflonRing pos={[2.52, -0.18, 0]} />
            <PipeSeg pos={[2.52, 0.30, 0]} len={0.96} r={0.030} mat="gray" />
            <PipeClamp pos={[2.52, 0.40, 0]} rot={[0, 0, 0]} />

            {/* Heavy-Duty Conduit Cable Clamping along vertical pipe */}
            <mesh position={[2.52, 0.50, 0.05]} castShadow>
              <boxGeometry args={[0.016, 0.40, 0.016]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>

            {/* Top Elbow and Horizontal Feed into Sedimentation Tank */}
            <PipeElbow pos={[2.52, 0.78, 0]} r={0.034} mat="gray" />
            <TeflonRing pos={[2.52, 0.74, 0]} />
            <PipeSeg pos={[2.21, 0.78, 0]} len={0.62} r={0.030} rot={[0, 0, Math.PI / 2]} mat="gray" />
            <TeflonRing pos={[2.0, 0.78, 0]} rot={[0, 0, Math.PI / 2]} />
          </group>
        ) : (
          /* Standard Borewell Riser Pipe Setup */
          <group>
            <PipeSeg pos={[2.8, -0.50, 0]} len={2.55} r={0.030} mat="gray" />
            <PipeClamp pos={[2.8, 0.20, 0]} rot={[0, 0, 0]} />
            <PipeElbow pos={[2.8, 0.78, 0]} r={0.034} mat="gray" />
            <TeflonRing pos={[2.8, 0.74, 0]} />
            <PipeSeg pos={[2.35, 0.78, 0]} len={0.90} r={0.030} rot={[0, 0, Math.PI / 2]} mat="gray" />
            <TeflonRing pos={[2.0, 0.78, 0]} rot={[0, 0, Math.PI / 2]} />
          </group>
        )}

        {/* Common Drop into Sedimentation Tank Top Cap */}
        <PipeElbow pos={[1.90, 0.78, 0]} r={0.034} mat="gray" />
        <PipeSeg pos={[1.90, 0.76, 0]} len={0.04} r={0.030} mat="gray" />
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
        <TeflonRing pos={[1.60, 0.30, 0]} rot={[0, 0, Math.PI / 2]} />

        {/* Pipe between Flow Sensor and Secondary Tank Inlet */}
        <PipeSeg pos={[1.20, 0.30, 0]} len={0.36} rot={[0, 0, Math.PI / 2]} />
        <TeflonRing pos={[1.05, 0.30, 0]} rot={[0, 0, Math.PI / 2]} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          3. DIRECT PASSAGE VALVE (Secondary Floor → Primary Tank for Good Water)
             Position: [0.70, 0.0, 0]
          ══════════════════════════════════════════════════════════════════════ */}
      <group>
        <SolenoidValve pos={[0.70, 0.0, 0]} rot={[Math.PI / 2, 0, 0]} open={isDirectValveOpen} />
        <TeflonRing pos={[0.70, -0.04, 0]} />
        <PipeSeg pos={[0.70, -0.15, 0]} len={0.24} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          4. BAD WATER FILTRATION LOOP & RECIRCULATION RETURN MANIFOLD
             Pump [0.05, 0.08] → RO Filtration Tank [-1.40, 0.38] → Tank 2 [-1.85, 0.15]
             Recirculation Loop: Tank 2 Bottom [-1.70, -0.22] → Return Riser [-0.88] → RO Inlet Manifold [-0.88, 0.38]
          ══════════════════════════════════════════════════════════════════════ */}
      <group>
        {/* Pipe from Pump Outlet rising up to elbow */}
        <PipeSeg pos={[0.05, 0.27, 0]} len={0.22} />
        <PipeElbow pos={[0.05, 0.38, 0]} />
        <TeflonRing pos={[0.05, 0.36, 0]} />

        {/* Horizontal pipe spanning left from Chamber 1 to RO Filtration Tank Inlet Manifold */}
        <PipeSeg pos={[-0.41, 0.38, 0]} len={0.92} rot={[0, 0, Math.PI / 2]} />
        <TeflonRing pos={[-0.88, 0.38, 0]} rot={[0, 0, Math.PI / 2]} />

        {/* ─── SETUP 1: Direct Single-Pass Piping (RO -> Primary Clean Tank) ─── */}
        {!dualVerificationMode ? (
          <group>
            <PipeSeg pos={[-1.85, 0.38, 0]} len={0.10} rot={[0, 0, Math.PI / 2]} />
            <TeflonRing pos={[-1.85, 0.38, 0]} rot={[0, 0, Math.PI / 2]} />
            <PipeElbow pos={[-1.95, 0.38, 0]} />
            <PipeSeg pos={[-1.95, 0.10, 0]} len={0.56} />
            <PipeElbow pos={[-1.95, -0.20, 0]} />
            <PipeSeg pos={[-1.60, -0.20, 0]} len={0.70} rot={[0, 0, Math.PI / 2]} />
          </group>
        ) : (
          /* ─── SETUP 2: Dual-Stage Tank 2 & Recirculation Loop ─── */
          <group>
            {/* 3-Way T-Junction Manifold at RO Filtration Tank Inlet joining Pump line + Recirculation Return */}
            <PipeTee pos={[-0.88, 0.38, 0]} rot={[0, 0, -Math.PI / 2]} />

            {/* Pipe from Filtration Tank Outlet dropping into Post-Filtration Tank 2 Inlet */}
            <PipeSeg pos={[-1.85, 0.38, 0]} len={0.10} rot={[0, 0, Math.PI / 2]} />
            <TeflonRing pos={[-1.85, 0.38, 0]} rot={[0, 0, Math.PI / 2]} />
            <PipeElbow pos={[-1.85, 0.38, 0]} />
            <PipeSeg pos={[-1.85, 0.30, 0]} len={0.16} />

            {/* Tank 2 Clean Delivery Line (Path A: Post-RO Confirmed Pure -> Primary Clean Tank) */}
            <PipeSeg pos={[-2.19, 0.03, 0]} len={0.16} rot={[0, 0, Math.PI / 2]} />
            <PipeElbow pos={[-2.27, 0.03, 0]} />
            <PipeSeg pos={[-2.27, -0.25, 0]} len={0.56} />

            {/* Tank 2 Closed-Loop Recirculation System (Path B: Sub-Standard -> Return to RO Filtration Inlet) */}
            <group
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot('recirculation_loop');
                setCameraPreset('RECIRCULATION_LOOP');
              }}
            >
              {/* Recirculation Bottom Drop Pipe from Tank 2 */}
              <PipeSeg pos={[-1.70, -0.16, 0]} len={0.12} />
              <PipeElbow pos={[-1.70, -0.22, 0]} />
              
              {/* Solenoid Diverter Valve */}
              <SolenoidValve pos={[-1.52, -0.22, 0]} open={true} />
              
              {/* Mini Inline Recirculation Booster Pump */}
              <group position={[-1.28, -0.22, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.032, 0.032, 0.07, 12]} />
                  <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.03, 0]} castShadow>
                  <boxGeometry args={[0.045, 0.035, 0.045]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
              </group>

              {/* Horizontal Recirculation Return Line Spanning Right to Filter Riser */}
              <PipeSeg pos={[-1.29, -0.22, 0]} len={0.82} rot={[0, 0, Math.PI / 2]} mat="gray" />
              
              {/* Elbow turning upward into the RO filter inlet */}
              <PipeElbow pos={[-0.88, -0.22, 0]} mat="gray" />
              
              {/* Vertical Recirculation Return Riser Pipe feeding DIRECTLY into RO Filter Inlet Manifold */}
              <PipeSeg pos={[-0.88, 0.08, 0]} len={0.60} mat="gray" />
              <TeflonRing pos={[-0.88, 0.35, 0]} />
            </group>
          </group>
        )}
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          5. CLEAN WATER DISPENSE TAP (Primary Tank Bottom-Left)
             Primary Outlet [-2.4, -1.45] → Solenoid Valve [-2.62] → Tap Spout [-2.85, -1.72]
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
             Primary Bottom-Right [1.0, -1.50] → Release Tap [1.22, -1.50]
          ══════════════════════════════════════════════════════════════════════ */}
      <group>
        <PipeSeg pos={[1.08, -1.50, 0]} len={0.16} rot={[0, 0, Math.PI / 2]} />
        <SolenoidValve pos={[1.22, -1.50, 0]} open={isDrainValveOpen} />
        <PipeSeg pos={[1.36, -1.50, 0]} len={0.12} rot={[0, 0, Math.PI / 2]} />
      </group>
    </group>
  );
};
