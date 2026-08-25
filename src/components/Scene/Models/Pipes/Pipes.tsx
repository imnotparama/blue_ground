'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Shared pipe materials ────────────────────────────────────────────────────
const WhitePvc = () => (
  <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.06} />
);
const GrayPvc = () => (
  <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.06} />
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Straight pipe segment — axis aligned along Y by default, rotation moves it */
const Pipe = ({
  pos,
  rot = [0, 0, 0] as [number, number, number],
  len,
  r = 0.025,
  color = 'white',
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
  len: number;
  r?: number;
  color?: 'white' | 'gray';
}) => (
  <mesh position={pos} rotation={rot} castShadow>
    <cylinderGeometry args={[r, r, len, 10]} />
    {color === 'white' ? <WhitePvc /> : <GrayPvc />}
  </mesh>
);

/** Elbow / corner sphere joint */
const Joint = ({
  pos,
  r = 0.028,
  color = 'white',
}: {
  pos: [number, number, number];
  r?: number;
  color?: 'white' | 'gray';
}) => (
  <mesh position={pos} castShadow>
    <sphereGeometry args={[r, 10, 10]} />
    {color === 'white' ? <WhitePvc /> : <GrayPvc />}
  </mesh>
);

/** Inline solenoid / gate valve body */
const Valve = ({
  pos,
  rot = [0, 0, Math.PI / 2] as [number, number, number],
  open = true,
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
  open?: boolean;
}) => {
  const handleRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (handleRef.current) {
      const target = open ? 0 : Math.PI / 2;
      handleRef.current.rotation.z = THREE.MathUtils.lerp(
        handleRef.current.rotation.z, target, 0.1,
      );
    }
  });
  return (
    <group position={pos} rotation={rot}>
      {/* Valve body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
        <meshStandardMaterial color="#1e2937" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Actuator stem */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Handle lever */}
      <mesh ref={handleRef} position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.12, 0.015, 0.02]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Pipes = () => {
  const { mode, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();

  // Is the main filtration valve open?
  const valveOpen = mode !== 'PUMP_FAILURE' && mode !== 'MAINTENANCE';

  // Outlet valve: open when quality is good (CLEANING = bad quality re-route)
  const outletOpen = mode !== 'CLEANING' && mode !== 'PUMP_FAILURE';

  /*
   * COORDINATE REFERENCE (all within scene group [0, -0.2, 0]):
   *
   * Borewell wellhead:      x= 3.8,  y=-2.1
   * Secondary tank center:  x= 2.4,  y=-0.5  (h=1.6 → bottom y=-1.3, top y=0.3)
   * Sedimentation center:   x= 0.5,  y=-0.5  (h=1.7 → bottom y=-1.35, top y=0.35)
   * Primary tank center:    x=-2.0,  y=-0.55 (h=2.1 → bottom y=-1.6,  top y=0.5)
   * Pump body:              x= 2.4,  y=-1.6
   *
   * FLOW PATH:
   *   Borewell → vertical intake pipe → horizontal across to secondary top
   *   → secondary tank → pump outlet at bottom-left
   *   → horizontal pipe → flow sensor → solenoid valve
   *   → up → sedimentation top inlet
   *   → sedimentation bottom → horizontal return → primary tank right inlet
   *   → outlet pipe with solenoid valve (left side of primary)
   */

  return (
    <group>

      {/* ══════════════════════════════════════════════════════════════════
          A. RAW WATER INTAKE — borewell → secondary tank
             Gray PVC pipe rising from borewell at x=3.8
          ══════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => { e.stopPropagation(); setActiveHotspot('intake_pipe'); setCameraPreset('INTAKE_PIPE'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        {/* Vertical riser inside borewell → above ground */}
        <Pipe pos={[3.8, -1.5, 0]} len={2.6} r={0.032} color="gray" />

        {/* Strainer foot cap */}
        <mesh position={[3.8, -2.8, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.18, 12, 3, true]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} wireframe />
        </mesh>
        <mesh position={[3.8, -2.8, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.16, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Top elbow */}
        <Joint pos={[3.8, 0.25, 0]} color="gray" r={0.035} />

        {/* Horizontal run across to secondary tank right wall */}
        {/* Length = 3.8 - 2.95 = 0.85, midpoint = 3.375 */}
        <Pipe pos={[3.375, 0.25, 0]} rot={[0, 0, Math.PI/2]} len={0.85} r={0.032} color="gray" />

        {/* Elbow down into secondary tank */}
        <Joint pos={[2.95, 0.25, 0]} color="gray" r={0.035} />

        {/* Short drop into secondary tank top */}
        <Pipe pos={[2.95, 0.04, 0]} len={0.42} r={0.032} color="gray" />
      </group>

      {/* ══════════════════════════════════════════════════════════════════
          B. SECONDARY TANK → PUMP OUTLET → FLOW SENSOR → VALVE → SED. TANK
             White PVC — main filtration run
          ══════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => { e.stopPropagation(); setActiveHotspot('return_pipe'); setCameraPreset('RETURN_PIPE'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        {/* Drop from secondary tank left wall bottom → pump inlet */}
        <Pipe pos={[1.85, -1.38, 0]} len={0.2} />
        <Joint pos={[1.85, -1.48, 0]} />

        {/* Horizontal run from pump to flow sensor area */}
        {/* x from 1.85 to 1.1 = 0.75, midpoint 1.475 */}
        <Pipe pos={[1.475, -1.48, 0]} rot={[0, 0, Math.PI/2]} len={0.75} />

        {/* Flow sensor inline (center of horizontal run) rendered separately by Sensors.tsx */}
        {/* Just pipe connections on either side of sensor at x=1.1 */}
        <Joint pos={[1.1, -1.48, 0]} />

        {/* Short segment before valve at x=0.82 */}
        <Pipe pos={[0.965, -1.48, 0]} rot={[0, 0, Math.PI/2]} len={0.27} />
        <Joint pos={[0.82, -1.48, 0]} />

        {/* Solenoid valve — inline in horizontal pipe */}
        <Valve pos={[0.7, -1.48, 0]} open={valveOpen} />

        {/* Short segment after valve → up elbow */}
        <Pipe pos={[0.575, -1.48, 0]} rot={[0, 0, Math.PI/2]} len={0.24} />
        <Joint pos={[0.5, -1.48, 0]} />

        {/* Vertical riser to sedimentation top inlet */}
        {/* y from -1.48 to 0.3 = 1.78, midpoint -0.59 */}
        <Pipe pos={[0.5, -0.59, 0]} len={1.78} />

        {/* Elbow into sedimentation top cap */}
        <Joint pos={[0.5, 0.31, 0]} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════
          C. SEDIMENTATION BOTTOM OUTLET → RETURN PIPE → PRIMARY TANK
          ══════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => { e.stopPropagation(); setActiveHotspot('return_pipe'); setCameraPreset('RETURN_PIPE'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        {/* Short drop from sedimentation funnel */}
        <Pipe pos={[0.5, -1.5, 0]} len={0.28} />
        <Joint pos={[0.5, -1.65, 0]} />

        {/* Long horizontal return to primary tank right inlet */}
        {/* x from 0.5 to -0.82 = 1.32, midpoint = -0.16 */}
        <Pipe pos={[-0.16, -1.65, 0]} rot={[0, 0, Math.PI/2]} len={1.32} />
        <Joint pos={[-0.82, -1.65, 0]} />

        {/* Riser into primary tank right wall (inlet at y=-0.2 relative to primary tank center y=-0.55) */}
        {/* Absolute y target = -0.55 + (-0.2) = -0.75, so from -1.65 to -0.75 = 0.9 */}
        <Pipe pos={[-0.82, -1.2, 0]} len={0.9} />
        <Joint pos={[-0.82, -0.75, 0]} />

        {/* Short horizontal connector into primary tank wall at x=-0.82 → x=-0.8 (right wall) */}
        <Pipe pos={[-0.87, -0.75, 0]} rot={[0, 0, Math.PI/2]} len={0.1} />
      </group>

      {/* ══════════════════════════════════════════════════════════════════
          D. PRIMARY TANK OUTLET — clean water leaves left wall
          ══════════════════════════════════════════════════════════════════ */}
      <group
        onClick={(e) => { e.stopPropagation(); setActiveHotspot('drain_valve'); setCameraPreset('DRAIN_VALVE'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        {/* Short stub from primary left wall outlet nozzle */}
        <Pipe pos={[-3.18, -1.05, 0]} rot={[0, 0, Math.PI/2]} len={0.34} />
        <Joint pos={[-3.36, -1.05, 0]} />

        {/* Outlet solenoid valve */}
        <Valve pos={[-3.5, -1.05, 0]} open={outletOpen} />

        {/* Outlet pipe going further left to "tap" */}
        <Pipe pos={[-3.72, -1.05, 0]} rot={[0, 0, Math.PI/2]} len={0.44} />

        {/* Downward turn */}
        <Joint pos={[-3.95, -1.05, 0]} />
        <Pipe pos={[-3.95, -1.35, 0]} len={0.6} />

        {/* Outlet tap opening */}
        <mesh position={[-3.95, -1.68, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.02, 0.05, 10]} />
          <meshStandardMaterial color="#374151" roughness={0.25} metalness={0.9} />
        </mesh>
      </group>

    </group>
  );
};
