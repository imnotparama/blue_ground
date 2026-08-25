'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────────────────────
   PIPE ROUTING — all coordinates group-local (scene group at world [0,-0.2,0])

   SECONDARY TANK  center=[2.2,-1.0,0]  bottom=-1.75  top=-0.25
   SEDIMENTATION   center=[0.3,-1.0,0]  bottom=-1.75  top=-0.25
   PRIMARY TANK    center=[-2.2,-0.75,0] bottom=-1.75  top=+0.25

   BOREWELL (world [3.8,-2.1,0]) → group-local [3.8,-1.9,0]

   FLOW PATH:
     Borewell vertical riser:  x=3.8, y=-1.9 to y=0.0
     Elbow → horizontal:       y=0.0, x=3.8 to x=2.75
     Elbow → drop into sec:    x=2.75, y=0.0 to y=-0.20 (inside secondary top)

     Sec outlet stub:          x=1.70, y=-1.57 (left wall of secondary bottom)
     Horizontal process:       y=-1.62, x=1.70 to x=0.95
     [Flow sensor at x=1.32]
     [Valve at x=0.70]
     Elbow up:                 x=0.30, y=-1.62 to y=-0.25 (sedimentation top)

     Sedimentation outlet:     x=0.30, y=-1.77 to y=-1.90
     Horizontal return:        y=-1.90, x=0.30 to x=-1.20
     Elbow up → primary inlet: x=-1.20, y=-1.90 to y=-1.03 (primary right wall)

     Primary outlet:           x=-3.20, y=-1.30 left → outlet tap
────────────────────────────────────────────────────────────────────────────── */

// ─── Material helpers ─────────────────────────────────────────────────────────
const WhitePvc = () => (
  <meshStandardMaterial color="#e2e8f0" roughness={0.42} metalness={0.06} />
);
const GrayPvc = () => (
  <meshStandardMaterial color="#64748b" roughness={0.48} metalness={0.06} />
);

// ─── Primitive parts ─────────────────────────────────────────────────────────
const Seg = ({
  pos, len, r=0.026,
  rot=[0,0,0] as [number,number,number],
  mat='white' as 'white'|'gray',
}: {
  pos:[number,number,number]; len:number; r?:number;
  rot?:[number,number,number]; mat?:'white'|'gray';
}) => (
  <mesh position={pos} rotation={rot} castShadow>
    <cylinderGeometry args={[r, r, len, 10]} />
    {mat==='white' ? <WhitePvc /> : <GrayPvc />}
  </mesh>
);

const Elbow = ({
  pos, r=0.030, mat='white' as 'white'|'gray',
}: {
  pos:[number,number,number]; r?:number; mat?:'white'|'gray';
}) => (
  <mesh position={pos} castShadow>
    <sphereGeometry args={[r,10,10]} />
    {mat==='white' ? <WhitePvc /> : <GrayPvc />}
  </mesh>
);

// Solenoid valve body
const Valve = ({
  pos, rot=[0,0,Math.PI/2] as [number,number,number], open=true,
}: {
  pos:[number,number,number];
  rot?:[number,number,number];
  open?:boolean;
}) => {
  const handleRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (handleRef.current) {
      const tgt = open ? 0 : Math.PI/2;
      handleRef.current.rotation.z = THREE.MathUtils.lerp(handleRef.current.rotation.z, tgt, 0.1);
    }
  });
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.1, 12]} />
        <meshStandardMaterial color="#1e2937" roughness={0.28} metalness={0.88} />
      </mesh>
      <mesh position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.013, 0.013, 0.06, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh ref={handleRef} position={[0, 0.105, 0]} castShadow>
        <boxGeometry args={[0.13, 0.016, 0.022]} />
        <meshStandardMaterial color="#ef4444" roughness={0.28} metalness={0.5} />
      </mesh>
    </group>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Pipes = () => {
  const { mode, setActiveHotspot, setCameraPreset } = useSystemState();

  const valveOpen   = mode !== 'PUMP_FAILURE' && mode !== 'MAINTENANCE';
  const outletOpen  = mode !== 'CLEANING' && mode !== 'PUMP_FAILURE';

  const clickIntake = (e: any) => { e.stopPropagation(); setActiveHotspot('intake_pipe');  setCameraPreset('INTAKE_PIPE'); };
  const clickMain   = (e: any) => { e.stopPropagation(); setActiveHotspot('return_pipe');  setCameraPreset('RETURN_PIPE'); };
  const clickDrain  = (e: any) => { e.stopPropagation(); setActiveHotspot('drain_valve');  setCameraPreset('DRAIN_VALVE'); };
  const hover       = (e: any) => { e.stopPropagation(); document.body.style.cursor='pointer'; };
  const out         = ()       => { document.body.style.cursor='default'; };

  return (
    <group>

      {/* ════════════════════════════════════════════════════════════════
          A. RAW WATER INTAKE  (gray PVC)
             Borewell group-local [3.8, -1.9, 0] →
             vertical riser → elbow → horizontal → drop into secondary
          ════════════════════════════════════════════════════════════════ */}
      <group onClick={clickIntake} onPointerOver={hover} onPointerOut={out}>

        {/* Borewell strainer at bottom */}
        <mesh position={[3.8, -2.0, 0]} castShadow>
          <cylinderGeometry args={[0.056, 0.056, 0.18, 12, 3, true]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.9} wireframe />
        </mesh>
        <mesh position={[3.8, -2.0, 0]} castShadow>
          <cylinderGeometry args={[0.034, 0.034, 0.16, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Vertical riser: from y=-1.90 to y=0.0  len=1.9  center=-0.95 */}
        <Seg pos={[3.8, -0.95, 0]} len={1.9} r={0.034} mat="gray" />
        <Elbow pos={[3.8, 0.0, 0]} r={0.038} mat="gray" />

        {/* Horizontal: x=3.8→2.75  len=1.05  center=(3.275, 0.0) */}
        <Seg pos={[3.275, 0.0, 0]} len={1.05} rot={[0,0,Math.PI/2]} r={0.034} mat="gray" />
        <Elbow pos={[2.75, 0.0, 0]} r={0.038} mat="gray" />

        {/* Drop into secondary tank top: y=0.0→-0.20  len=0.20  center=-0.10 */}
        <Seg pos={[2.75, -0.10, 0]} len={0.20} r={0.034} mat="gray" />
      </group>

      {/* ════════════════════════════════════════════════════════════════
          B. SECONDARY → PUMP → FLOW SENSOR → VALVE → SEDIMENTATION
             White PVC — main filtration circuit
          ════════════════════════════════════════════════════════════════ */}
      <group onClick={clickMain} onPointerOver={hover} onPointerOut={out}>

        {/* Short stub from secondary left-wall outlet at (1.70, -1.57) */}
        <Seg pos={[1.70, -1.57, 0]} len={0.22} />
        <Elbow pos={[1.70, -1.68, 0]} />

        {/* Horizontal run: x=1.70→0.30  y=-1.72  len=1.40  center=(1.00,-1.72) */}
        {/* Split with flow sensor visible gap (handled in Sensors.tsx) */}
        {/* Left segment: x=1.52→0.50  len=1.02 center=(1.01,-1.72) */}
        <Seg pos={[1.51, -1.72, 0]} len={1.02} rot={[0,0,Math.PI/2]} />

        {/* Right segment (pump→flow sensor): x=1.70→1.60  len=0.10 */}
        <Seg pos={[1.65, -1.72, 0]} len={0.10} rot={[0,0,Math.PI/2]} />

        {/* Inline solenoid valve before sedimentation */}
        <Valve pos={[0.60, -1.72, 0]} open={valveOpen} />

        {/* Short stub after valve: x=0.49→0.30  len=0.19 */}
        <Seg pos={[0.40, -1.72, 0]} len={0.19} rot={[0,0,Math.PI/2]} />
        <Elbow pos={[0.30, -1.72, 0]} />

        {/* Vertical riser to sedimentation top: y=-1.72→-0.25  len=1.47  center=-0.985 */}
        <Seg pos={[0.30, -0.985, 0]} len={1.47} />
        <Elbow pos={[0.30, -0.24, 0]} />
      </group>

      {/* ════════════════════════════════════════════════════════════════
          C. SEDIMENTATION BOTTOM → RETURN → PRIMARY TANK
          ════════════════════════════════════════════════════════════════ */}
      <group onClick={clickMain} onPointerOver={hover} onPointerOut={out}>

        {/* Down from sedimentation funnel: y=-1.76→-1.92  len=0.16 */}
        <Seg pos={[0.30, -1.84, 0]} len={0.16} />
        <Elbow pos={[0.30, -1.92, 0]} />

        {/* Horizontal return: x=0.30→-1.20  y=-1.92  len=1.50  center=(-0.45,-1.92) */}
        <Seg pos={[-0.45, -1.92, 0]} len={1.50} rot={[0,0,Math.PI/2]} />
        <Elbow pos={[-1.20, -1.92, 0]} />

        {/* Riser to primary right inlet: y=-1.92→-1.03  len=0.89  center=-1.475 */}
        <Seg pos={[-1.20, -1.475, 0]} len={0.89} />
        <Elbow pos={[-1.20, -1.03, 0]} />

        {/* Short horizontal into primary right wall at x=-1.20→-1.19 */}
        <Seg pos={[-1.215, -1.03, 0]} len={0.06} rot={[0,0,Math.PI/2]} />
      </group>

      {/* ════════════════════════════════════════════════════════════════
          D. PRIMARY OUTLET → SOLENOID VALVE → CLEAN WATER TAP
          ════════════════════════════════════════════════════════════════ */}
      <group onClick={clickDrain} onPointerOver={hover} onPointerOut={out}>

        {/* Stub from primary left wall outlet nozzle: x=-3.20→-3.38 */}
        <Seg pos={[-3.29, -1.30, 0]} len={0.18} rot={[0,0,Math.PI/2]} />
        <Elbow pos={[-3.38, -1.30, 0]} />

        {/* Outlet solenoid valve */}
        <Valve pos={[-3.52, -1.30, 0]} open={outletOpen} />

        {/* Continue left: x=-3.62→-3.88  len=0.26 */}
        <Seg pos={[-3.75, -1.30, 0]} len={0.26} rot={[0,0,Math.PI/2]} />
        <Elbow pos={[-3.90, -1.30, 0]} />

        {/* Drop to tap: y=-1.30→-1.72  len=0.42  center=-1.51 */}
        <Seg pos={[-3.90, -1.51, 0]} len={0.42} />

        {/* Outlet nozzle at bottom */}
        <mesh position={[-3.90, -1.74, 0]} castShadow>
          <cylinderGeometry args={[0.030, 0.022, 0.055, 10]} />
          <meshStandardMaterial color="#374151" roughness={0.22} metalness={0.92} />
        </mesh>
      </group>

    </group>
  );
};
