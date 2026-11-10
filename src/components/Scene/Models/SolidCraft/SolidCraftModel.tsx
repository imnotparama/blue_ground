'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import { SOLID_CRAFT_BODIES, CADBodyData } from './cadModelData';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. DYNAMIC 1.8" TFT CANVAS TEXTURE GENERATOR
// -------------------------------------------------------------
function useLiveTFTTexture(simState: any, isRunning: boolean) {
  const canvas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 384;
    return c;
  }, []);

  const texture = useMemo(() => {
    if (!canvas) return null;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, [canvas]);

  const sparklineData = useRef<number[]>(new Array(40).fill(25));
  const lastUpdate = useRef(0);

  useFrame((state) => {
    if (!canvas || !texture) return;
    const now = state.clock.getElapsedTime();
    if (now - lastUpdate.current < 0.065) return; // ~15 FPS redraw
    lastUpdate.current = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background: Deep dark technical terminal
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Bezel border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // Top Header Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 4, w - 8, 48);

    // WiFi LED indicator
    ctx.beginPath();
    ctx.arc(24, 28, 6, 0, Math.PI * 2);
    ctx.fillStyle = isRunning ? '#22c55e' : '#ef4444';
    ctx.fill();

    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('LEVIATHAN OS v9.4', 40, 34);

    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('IP: 192.168.4.1', w - 170, 34);

    // WHO Potable Water Quality Badge
    const outTDS = Math.round(simState?.outputTDS ?? 24);
    const inTDS = Math.round(simState?.inputTDS ?? 450);
    const outTurb = (simState?.outputTurbidity ?? 0.18).toFixed(2);
    const outpH = (simState?.outputpH ?? 7.2).toFixed(1);
    const outFlow = (simState?.outputFlowRate ?? 3.4).toFixed(1);
    const pumpRpm = isRunning && simState?.pumpStatus === 'RUNNING' ? '1800 RPM' : 'IDLE';

    ctx.fillStyle = '#052e16';
    ctx.fillRect(16, 62, w - 32, 42);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#15803d';
    ctx.strokeRect(16, 62, w - 32, 42);

    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`STATUS: WHO POTABLE CERTIFIED (${outTDS} ppm)`, 28, 90);

    // Telemetry Grid
    const col1 = 20;
    const col2 = 270;
    let y = 135;

    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RAW INLET TDS', col1, y);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${inTDS} ppm`, col1 + 140, y);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PERMEATE TDS', col2, y);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${outTDS} ppm`, col2 + 130, y);

    y += 28;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('WATER pH', col1, y);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`${outpH} pH`, col1 + 140, y);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TURBIDITY', col2, y);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`${outTurb} NTU`, col2 + 130, y);

    y += 28;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('BOOSTER PUMP', col1, y);
    ctx.fillStyle = isRunning ? '#22c55e' : '#64748b';
    ctx.fillText(`${pumpRpm}`, col1 + 140, y);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('FLOW RATE', col2, y);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${outFlow} L/m`, col2 + 130, y);

    y += 28;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('UV-C 254nm', col1, y);
    ctx.fillStyle = simState?.uvStatus === 'ON' ? '#c084fc' : '#64748b';
    ctx.fillText(`${simState?.uvStatus ?? 'ON'}`, col1 + 140, y);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RO RECOVERY', col2, y);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('70.4% (Perm)', col2 + 130, y);

    // Energy Strip Banner
    y += 34;
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(16, y, w - 32, 28);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#818cf8';
    ctx.fillText('SOLAR: +56.8W | BATT: 91% (25.4V) | NET: +28.1W', 28, y + 19);

    // Live Sparkline Chart at bottom
    y += 38;
    const chartW = w - 32;
    const chartH = 65;

    ctx.fillStyle = '#020617';
    ctx.fillRect(16, y, chartW, chartH);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(16, y, chartW, chartH);

    // Update sparkline data
    sparklineData.current.shift();
    const noise = Math.sin(now * 3) * 1.5;
    sparklineData.current.push(Math.max(5, Math.min(outTDS + noise, 80)));

    ctx.beginPath();
    const data = sparklineData.current;
    for (let i = 0; i < data.length; i++) {
      const px = 16 + (i / (data.length - 1)) * chartW;
      const normalized = (data[i] - 10) / 70; // 10 to 80 ppm
      const py = y + chartH - normalized * (chartH - 10) - 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('REAL-TIME TDS WAVEFORM (ppm)', 24, y + 14);

    texture.needsUpdate = true;
  });

  return texture;
}

// -------------------------------------------------------------
// 2. INDIVIDUAL CAD BODY ITEM WITH SILKY LERP & CANVASES
// -------------------------------------------------------------
const CADBodyItem: React.FC<{
  body: CADBodyData;
  exploded: boolean;
  simState: any;
  tftTexture: THREE.CanvasTexture | null;
}> = ({ body, exploded, simState, tftTexture }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

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

    // 1. Silky Smooth Exploded View Interpolation
    const targetPos = exploded ? explodedPos : basePos;
    if (meshRef.current.position.distanceToSquared(targetPos) > 0.00001) {
      meshRef.current.position.lerp(targetPos, damp);
    }

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
        const targetColor = isTurbid ? new THREE.Color('#92400e') : new THREE.Color('#0ea5e9');
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
        isUvOn ? 1.5 : 0.0,
        damp
      );
    }

    // 5. Dynamic 5-Micron Spun PP Cartridge Reaction to Silt/Clogging
    if (body.name === 'Cartridge_Sediment_SpunPP' && matRef.current) {
      const isClogged = simState ? simState.filterHealth.stage1 < 45 : false;
      const isTurbid = simState ? simState.inputTurbidity > 8 : false;
      const targetColor =
        isClogged || isTurbid ? new THREE.Color('#92400e') : new THREE.Color('#f1f5f9');
      matRef.current.color.lerp(targetColor, damp);
    }
  });

  // Dedicated handling for 1.8" TFT screen
  if (body.name === 'Screen_TFT_ActiveGlass' && tftTexture) {
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow
        receiveShadow
      >
        <boxGeometry args={body.size as [number, number, number]} />
        <meshBasicMaterial map={tftTexture} />
      </mesh>
    );
  }

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
          envMapIntensity={1.2}
        />
      </mesh>
    );
  }

  // Render Cylinder Geometry with 48 Radial Segments for Silky Smoothness
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
        <cylinderGeometry args={[radius, radius, height, 48]} />
        <meshStandardMaterial
          ref={matRef}
          color={body.color}
          metalness={body.metalness}
          roughness={body.roughness}
          opacity={body.opacity}
          transparent={body.transparent}
          envMapIntensity={1.2}
        />
      </mesh>
    );
  }

  return null;
};

// -------------------------------------------------------------
// 3. 7-STAGE COMPLETE HYDRAULIC PIPING & FLUID VISUALIZER
// -------------------------------------------------------------
interface FlowCurveData {
  curve: THREE.CatmullRomCurve3;
  tubeRadius: number;
  tubeColor: string;
  beadColor: string;
  beadEmissive: string;
  beadCount: number;
  beadSize: number;
  speedMultiplier: number;
  flowKey: 'inputFlow' | 'permFlow' | 'wasteFlow' | 'dispenseFlow';
}

const FullHydraulicFlowVisualizer: React.FC<{
  simState: any;
  running: boolean;
  exploded: boolean;
}> = ({ simState, running, exploded }) => {
  const containerRef = useRef<THREE.Group>(null);
  const beadGroupsRef = useRef<(THREE.Group | null)[]>([]);
  const timesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Define the exact 7 CAD Catmull-Rom hydraulic splines
  const flowCurves: FlowCurveData[] = useMemo(() => {
    return [
      // 1. Raw Borewell Inlet: Basement Skid -> High-pressure Riser -> Sediment Filter Raw Inlet
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.80, -2.145, 0.2505),
          new THREE.Vector3(0.80, -1.30, 0.2505),
          new THREE.Vector3(0.80, -0.485, 0.2505),
          new THREE.Vector3(0.725, -0.485, 0.228),
        ]),
        tubeRadius: 0.009,
        tubeColor: '#38bdf8',
        beadColor: '#38bdf8',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.012,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
      },

      // 2. Sediment Filter Outlet -> Booster Pump P2 Suction Inlet
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.7185, -0.485, 0.012),
          new THREE.Vector3(0.7185, -1.1525, 0.012),
          new THREE.Vector3(0.7185, -1.1525, -0.6075),
          new THREE.Vector3(0.5535, -1.1525, -0.6075),
        ]),
        tubeRadius: 0.008,
        tubeColor: '#0ea5e9',
        beadColor: '#38bdf8',
        beadEmissive: '#0284c7',
        beadCount: 5,
        beadSize: 0.011,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
      },

      // 3. Booster Pump P2 Discharge -> 4-Stage Filter Rack (CTO Carbon F1)
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.5535, -0.7175, -0.6075),
          new THREE.Vector3(0.5535, -0.62, -0.6075),
          new THREE.Vector3(-0.4665, -0.62, -0.6075),
          new THREE.Vector3(-0.4665, -0.72, -0.6075),
        ]),
        tubeRadius: 0.008,
        tubeColor: '#0ea5e9',
        beadColor: '#38bdf8',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.011,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
      },

      // 4. RO Permeate Train: RO F2 -> Mineral F3 -> Softener F4 -> UV Reactor
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2265, -1.05, -0.6075), // RO Permeate port
          new THREE.Vector3(-0.10, -1.05, -0.6075),
          new THREE.Vector3(0.0135, -0.70, -0.6075), // Mineral F3
          new THREE.Vector3(0.2535, -0.70, -0.6075), // Softener F4
          new THREE.Vector3(0.2535, -1.05, -0.6075),
          new THREE.Vector3(0.10, -1.415, -0.6075), // Entering UV
          new THREE.Vector3(-0.1065, -1.415, -0.6075),
        ]),
        tubeRadius: 0.008,
        tubeColor: '#06b6d4',
        beadColor: '#00f0ff',
        beadEmissive: '#0891b2',
        beadCount: 8,
        beadSize: 0.012,
        speedMultiplier: 0.42,
        flowKey: 'permFlow',
      },

      // 5. RO Brine Reject Train (30% Waste Stream): RO F2 Reject Port -> Frame Drain
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2265, -1.05, -0.55), // RO Brine port
          new THREE.Vector3(-0.2265, -1.75, -0.55),
          new THREE.Vector3(-0.45, -2.10, -0.55),
          new THREE.Vector3(-0.75, -2.10, -0.55), // Waste outlet
        ]),
        tubeRadius: 0.008,
        tubeColor: '#f59e0b',
        beadColor: '#f59e0b',
        beadEmissive: '#d97706',
        beadCount: 6,
        beadSize: 0.011,
        speedMultiplier: 0.45,
        flowKey: 'wasteFlow',
      },

      // 6. UV Reactor -> Primary Clean Storage Reservoir Downcomer
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.1065, -1.415, -0.4575),
          new THREE.Vector3(-0.1065, -1.52, -0.38),
          new THREE.Vector3(-0.1065, -1.68, -0.25),
        ]),
        tubeRadius: 0.009,
        tubeColor: '#818cf8',
        beadColor: '#a855f7',
        beadEmissive: '#7e22ce',
        beadCount: 5,
        beadSize: 0.012,
        speedMultiplier: 0.4,
        flowKey: 'permFlow',
      },

      // 7. Active Front Tap Potable Dispense Stream (To Beaker on Drip Tray)
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.5535, -1.93, 0.6225),
          new THREE.Vector3(0.5535, -2.01, 0.6225),
          new THREE.Vector3(0.5535, -2.09, 0.6225),
        ]),
        tubeRadius: 0.007,
        tubeColor: '#00f0ff',
        beadColor: '#38bdf8',
        beadEmissive: '#0284c7',
        beadCount: 5,
        beadSize: 0.011,
        speedMultiplier: 0.55,
        flowKey: 'dispenseFlow',
      },
    ];
  }, []);

  // Frame animation for fluid beads
  useFrame((_, delta) => {
    if (!running) return;

    const inputFlow = simState?.inputFlowRate ?? 4.8;
    const permFlow = simState?.outputFlowRate ?? 3.4;
    const wasteFlow = simState?.wasteFlowRate ?? 1.4;
    const dispenseFlow = permFlow > 0.1 ? permFlow : 0;

    const rates = {
      inputFlow,
      permFlow,
      wasteFlow,
      dispenseFlow,
    };

    flowCurves.forEach((fc, idx) => {
      const group = beadGroupsRef.current[idx];
      if (!group) return;

      const rate = rates[fc.flowKey];
      if (rate < 0.05) {
        group.visible = false;
        return;
      }
      group.visible = true;

      const speed = Math.max(0.2, rate * fc.speedMultiplier);
      timesRef.current[idx] += delta * speed;

      const children = group.children;
      for (let i = 0; i < children.length; i++) {
        const bead = children[i] as THREE.Mesh;
        const t = (timesRef.current[idx] * 0.35 + i / fc.beadCount) % 1.0;
        const pt = fc.curve.getPointAt(t);
        bead.position.copy(pt);
      }
    });
  });

  return (
    <group ref={containerRef}>
      {flowCurves.map((fc, idx) => {
        // Hide/ghost tubing when exploded
        const tubeOpacity = exploded ? 0.06 : 0.42;

        return (
          <group key={idx}>
            {/* Transparent Polyurethane Tubing Sleeve */}
            <mesh>
              <tubeGeometry args={[fc.curve, 64, fc.tubeRadius, 10, false]} />
              <meshStandardMaterial
                color={fc.tubeColor}
                opacity={tubeOpacity}
                transparent={true}
                roughness={0.12}
                metalness={0.1}
                envMapIntensity={1.4}
              />
            </mesh>

            {/* Glowing Flowing Fluid Beads Inside Tubing */}
            <group
              ref={(el) => {
                beadGroupsRef.current[idx] = el;
              }}
              visible={!exploded}
            >
              {Array.from({ length: fc.beadCount }).map((_, bIdx) => (
                <mesh key={bIdx}>
                  <sphereGeometry args={[fc.beadSize, 16, 16]} />
                  <meshStandardMaterial
                    color={fc.beadColor}
                    emissive={fc.beadEmissive}
                    emissiveIntensity={2.5}
                    roughness={0.1}
                    metalness={0.2}
                  />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {/* Laboratory Borosilicate Glass Beaker on Drip Tray */}
      <group position={[0.5535, -2.08, 0.6225]} visible={!exploded}>
        {/* Glass Beaker Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.032, 0.075, 32, 1, true]} />
          <meshStandardMaterial
            color="#e0f2fe"
            metalness={0.1}
            roughness={0.05}
            transparent={true}
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Beaker Glass Base */}
        <mesh position={[0, -0.037, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.032, 32]} />
          <meshStandardMaterial
            color="#e0f2fe"
            metalness={0.1}
            roughness={0.05}
            transparent={true}
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Water Level Inside Beaker */}
        <mesh position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.031, 0.031, 0.05, 32]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            metalness={0.1}
            roughness={0.1}
            transparent={true}
            opacity={0.65}
          />
        </mesh>
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 4. MAIN EXPORT: SOLIDCRAFT LEVIATHAN v9 ASSEMBLY
// -------------------------------------------------------------
export const SolidCraftModel: React.FC = () => {
  const { exploded, simState, simulationRunning } = useSystemState();

  const isFlowing = simulationRunning && (simState?.inputFlowRate || 0) > 0.05;

  // Real-time TFT LCD Display Texture
  const tftTexture = useLiveTFTTexture(simState, simulationRunning);

  return (
    <group name="SolidCraft_Leviathan_v9_Assembly">
      {/* RENDER ALL 256 AUTHENTIC SOLIDCRAFT CAD BODIES */}
      {SOLID_CRAFT_BODIES.map((body) => (
        <CADBodyItem
          key={body.id}
          body={body}
          exploded={exploded}
          simState={simState}
          tftTexture={tftTexture}
        />
      ))}

      {/* 7-STAGE COMPLETE HYDRAULIC PIPING & FLOW VISUALIZER */}
      <FullHydraulicFlowVisualizer
        simState={simState}
        running={isFlowing}
        exploded={exploded}
      />
    </group>
  );
};
