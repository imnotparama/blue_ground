'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import { SOLID_CRAFT_BODIES, CADBodyData } from './cadModelData';
import {
  getSolarCellTexture,
  getEnclosureFaceplateTexture,
  getTankGraduationTexture,
  getFilterCanisterTexture,
  getPressureGaugeTexture,
  getBeakerGraduationTexture,
} from './proceduralTextures';
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
    const outTDS = Math.round(simState?.outputTds ?? 24);
    const inTDS = Math.round(simState?.inputTds ?? 450);
    const outTurb = (simState?.outputTurbidity ?? 0.18).toFixed(2);
    const outpH = (simState?.outputPh ?? 7.2).toFixed(1);
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
// 1.5. DYNAMIC RISING MICRO-BUBBLES FOR WATER RESERVOIRS
// -------------------------------------------------------------
const RisingMicroBubbles: React.FC<{
  bounds: [number, number, number];
  count?: number;
  active: boolean;
}> = ({ bounds, count = 16, active }) => {
  const meshGroup = useRef<THREE.Group>(null);
  const bubbleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * bounds[0] * 0.8,
      y: (Math.random() - 0.5) * bounds[1] * 0.8,
      z: (Math.random() - 0.5) * bounds[2] * 0.8,
      speed: 0.12 + Math.random() * 0.22,
      size: 0.0035 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [bounds, count]);

  useFrame((state, delta) => {
    if (!meshGroup.current || !active) return;
    const children = meshGroup.current.children;
    const minY = -bounds[1] * 0.45;
    const maxY = bounds[1] * 0.45;

    for (let i = 0; i < children.length; i++) {
      const bubble = children[i] as THREE.Mesh;
      const data = bubbleData[i];
      data.y += delta * data.speed;
      if (data.y > maxY) {
        data.y = minY;
      }
      bubble.position.y = data.y;
      bubble.position.x = data.x + Math.sin(state.clock.elapsedTime * 2.5 + data.phase) * 0.008;
      bubble.position.z = data.z + Math.cos(state.clock.elapsedTime * 2.5 + data.phase) * 0.008;
    }
  });

  if (!active) return null;

  return (
    <group ref={meshGroup}>
      {bubbleData.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[d.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// 2. INDIVIDUAL CAD BODY ITEM WITH SILKY LERP & CANVASES
// -------------------------------------------------------------
const CADBodyItem: React.FC<{
  body: CADBodyData;
  exploded: boolean;
  simState: any;
  tftTexture: THREE.CanvasTexture | null;
  isFlowing: boolean;
}> = ({ body, exploded, simState, tftTexture, isFlowing }) => {
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

  // 1. Dedicated handling for 1.8" TFT screen
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

  // 2. Photovoltaic Monocrystalline Silicon Cells Grid
  if (body.name === 'Solar_Cells_Grid') {
    const solarTex = getSolarCellTexture();
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow
        receiveShadow
      >
        <boxGeometry args={body.size as [number, number, number]} />
        <meshStandardMaterial
          map={solarTex || undefined}
          color={solarTex ? '#ffffff' : body.color}
          metalness={0.75}
          roughness={0.18}
          envMapIntensity={1.6}
        />
      </mesh>
    );
  }

  // 3. Low-Iron Anti-Reflective Tempered Solar PV Glass
  if (body.name === 'Solar_PV_Glass') {
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow
      >
        <boxGeometry args={body.size as [number, number, number]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          metalness={0.05}
          roughness={0.04}
          transmission={0.88}
          transparent={true}
          opacity={0.35}
          ior={1.52}
          envMapIntensity={2.5}
        />
      </mesh>
    );
  }

  // 4. Industrial IP66 Enclosure Faceplate Door with Warning Decals & Specs
  if (body.name === 'Bezel_Tier3_EnclosureDoor') {
    const doorTex = getEnclosureFaceplateTexture();
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow
        receiveShadow
      >
        <boxGeometry args={body.size as [number, number, number]} />
        <meshStandardMaterial
          map={doorTex || undefined}
          color={doorTex ? '#ffffff' : body.color}
          metalness={0.4}
          roughness={0.35}
          envMapIntensity={1.2}
        />
      </mesh>
    );
  }

  // 5. Optical PMMA Cast Acrylic Tanks with Laser-Etched Graduated Volume Scales
  if (body.name === 'Tank_Primary_Clean_Shell' || body.name === 'Tank_Secondary_Sensor_Shell') {
    const isPrimary = body.name === 'Tank_Primary_Clean_Shell';
    const scaleTex = getTankGraduationTexture(isPrimary);
    const size = body.size as [number, number, number];

    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow={false}
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          color="#bae6fd"
          metalness={0.02}
          roughness={0.04}
          transmission={0.92}
          transparent={true}
          opacity={0.32}
          ior={1.491}
          envMapIntensity={2.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />

        {/* Laser-Etched Graduated Measurement Scale on Front Face */}
        {scaleTex && (
          <mesh position={[0, 0, size[2] * 0.5 + 0.002]}>
            <planeGeometry args={[size[0] * 0.94, size[1] * 0.94]} />
            <meshBasicMaterial
              map={scaleTex}
              transparent={true}
              opacity={0.9}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Brushed Stainless Corner Edge Extrusions */}
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh
              key={`${sx}-${sz}`}
              position={[sx * (size[0] * 0.5), 0, sz * (size[2] * 0.5)]}
            >
              <boxGeometry args={[0.016, size[1], 0.016]} />
              <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
            </mesh>
          ))
        )}
      </mesh>
    );
  }

  // 6. Dynamic Water Volumes with Rising Micro-Bubbles
  if (body.name === 'Fluid_Primary_Clean_Water' || body.name === 'Fluid_Secondary_Sensor_Water') {
    const size = body.size as [number, number, number];
    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={matRef}
          color={body.color}
          metalness={0.1}
          roughness={0.06}
          opacity={body.opacity}
          transparent={true}
          envMapIntensity={1.8}
        />
        {/* Rising Micro-Bubbles when system is circulating */}
        <RisingMicroBubbles
          bounds={size}
          count={body.name === 'Fluid_Primary_Clean_Water' ? 20 : 12}
          active={isFlowing}
        />
      </mesh>
    );
  }

  // 7. 4-Stage Filtration Train Canisters (F1-F4) with Industrial Branding
  if (
    body.name === 'Filter_F1_Carbon' ||
    body.name === 'Filter_F2_RO' ||
    body.name === 'Filter_F3_Mineral' ||
    body.name === 'Filter_F4_IonResin'
  ) {
    const stageNum =
      body.name === 'Filter_F1_Carbon'
        ? 1
        : body.name === 'Filter_F2_RO'
        ? 2
        : body.name === 'Filter_F3_Mineral'
        ? 3
        : 4;
    const filterTex = getFilterCanisterTexture(stageNum as 1 | 2 | 3 | 4);
    const [radius, height] = body.size as [number, number];

    return (
      <mesh
        ref={meshRef}
        position={body.pos}
        rotation={baseRot}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, height, 48]} />
        <meshStandardMaterial
          map={filterTex || undefined}
          color={filterTex ? '#ffffff' : body.color}
          metalness={0.12}
          roughness={0.25}
          envMapIntensity={1.3}
        />
      </mesh>
    );
  }

  // 8. Raw Water Inlet Pressure Gauge (0-10 bar analog dial)
  if (body.name === 'Bezel_RawWater_Inlet_GaugeRing') {
    const [radius, height] = body.size as [number, number];
    const gaugeTex = getPressureGaugeTexture(simState?.pumpStatus === 'RUNNING' ? 4.2 : 0.8);

    return (
      <group position={body.pos} rotation={baseRot}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, height, 48]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        {gaugeTex && (
          <mesh position={[0, height * 0.5 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[radius * 0.94, 32]} />
            <meshBasicMaterial map={gaugeTex} />
          </mesh>
        )}
      </group>
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
// 3. 100% CAD-CONGRUENT HYDRAULIC CIRCUIT FLUID FLOW VISUALIZER
// -------------------------------------------------------------
interface CADFlowSegment {
  curve: THREE.CatmullRomCurve3;
  beadColor: string;
  beadEmissive: string;
  beadCount: number;
  beadSize: number;
  speedMultiplier: number;
  flowKey: 'inputFlow' | 'permFlow' | 'wasteFlow' | 'dispenseFlow';
  renderSleeve?: boolean;
}

const FullHydraulicFlowVisualizer: React.FC<{
  simState: any;
  running: boolean;
  exploded: boolean;
}> = ({ simState, running, exploded }) => {
  const containerRef = useRef<THREE.Group>(null);
  const beadGroupsRef = useRef<(THREE.Group | null)[]>([]);
  const timesRef = useRef<number[]>(new Array(8).fill(0));
  const beakerTex = useMemo(() => getBeakerGraduationTexture(), []);

  // Define 8 exact CAD centerline Catmull-Rom hydraulic trajectories
  const flowSegments: CADFlowSegment[] = useMemo(() => {
    return [
      // 1. Raw Borewell Feed: Ground Contact -> Pipe_RawWater_Feed_Riser -> Brass Sweep Elbow -> Port_Sediment_RawInlet -> Cartridge Bowl
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.80, -2.18, 0.2505),
          new THREE.Vector3(0.80, -1.33, 0.2505),
          new THREE.Vector3(0.80, -0.485, 0.2505),
          new THREE.Vector3(0.76, -0.485, 0.2505),
          new THREE.Vector3(0.7185, -0.485, 0.228),
          new THREE.Vector3(0.7185, -0.89, 0.1425),
        ]),
        beadColor: '#38bdf8',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.010,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
        renderSleeve: false,
      },

      // 2. Pre-Filtered Intake: Port_Sediment_CleanOutlet -> Crossbar Tubes -> 90° Elbows -> Drop_Intake_To_SecTank -> Secondary Tank Inflow
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.7185, -0.485, 0.012),
          new THREE.Vector3(0.5835, -0.485, 0.0345),
          new THREE.Vector3(0.2385, -0.485, 0.0345),
          new THREE.Vector3(0.0735, -0.485, 0.0345),
          new THREE.Vector3(0.0735, -0.485, -0.0015),
          new THREE.Vector3(0.0735, -0.485, -0.0375),
          new THREE.Vector3(0.0735, -0.575, -0.0375),
          new THREE.Vector3(0.0735, -0.66, -0.0375),
        ]),
        beadColor: '#0ea5e9',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.009,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
        renderSleeve: false,
      },

      // 3. Secondary Tank Suction: Drain_SecTank_Bulkhead -> Rear Rail Circuit -> Elbow Under Pump -> Port_PumpP2_SuctionInlet
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.1065, -1.25, -0.0375),
          new THREE.Vector3(-0.1065, -1.34, -0.0375),
          new THREE.Vector3(-0.1065, -1.34, -0.6075),
          new THREE.Vector3(0.2235, -1.34, -0.6075),
          new THREE.Vector3(0.5535, -1.34, -0.6075),
          new THREE.Vector3(0.5535, -1.2575, -0.6075),
          new THREE.Vector3(0.5535, -1.1525, -0.6075),
        ]),
        beadColor: '#0ea5e9',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.009,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
        renderSleeve: false,
      },

      // 4. High-Pressure Discharge: Port_PumpP2_DischargeOutlet -> Riser_PumpP2_To_Manifold -> Top Rail Manifold -> Filter F1 Carbon
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.5535, -0.7175, -0.6075),
          new THREE.Vector3(0.5535, -0.6125, -0.6075),
          new THREE.Vector3(0.5535, -0.455, -0.6075),
          new THREE.Vector3(-0.4665, -0.455, -0.6075),
          new THREE.Vector3(-0.4665, -0.578, -0.6075),
          new THREE.Vector3(-0.4665, -0.86, -0.6075),
          new THREE.Vector3(-0.4665, -1.05, -0.6075),
        ]),
        beadColor: '#0ea5e9',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.009,
        speedMultiplier: 0.35,
        flowKey: 'inputFlow',
        renderSleeve: false,
      },

      // 5. Pure Permeate Stream: RO F2 Core -> Mineral F3 -> Softener F4 -> DropTube_Collector_To_UV -> Collar_UV_TopDropPort
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2265, -0.62, -0.6075),
          new THREE.Vector3(-0.2265, -1.05, -0.6075),
          new THREE.Vector3(0.0135, -1.05, -0.6075),
          new THREE.Vector3(0.0135, -0.68, -0.6075),
          new THREE.Vector3(0.2535, -0.68, -0.6075),
          new THREE.Vector3(0.2535, -1.05, -0.6075),
          new THREE.Vector3(-0.1065, -1.15, -0.6075),
          new THREE.Vector3(-0.1065, -1.2875, -0.6075),
          new THREE.Vector3(-0.1065, -1.349, -0.6075),
        ]),
        beadColor: '#00f0ff',
        beadEmissive: '#0891b2',
        beadCount: 8,
        beadSize: 0.010,
        speedMultiplier: 0.42,
        flowKey: 'permFlow',
        renderSleeve: false,
      },

      // 6. Brine Reject Concentrate: RO F2 Reject Port -> Rear Rail Collector -> Frame Waste Discharge
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2265, -1.05, -0.55),
          new THREE.Vector3(-0.2265, -1.34, -0.6075),
          new THREE.Vector3(-0.75, -1.34, -0.6075),
        ]),
        beadColor: '#f59e0b',
        beadEmissive: '#d97706',
        beadCount: 4,
        beadSize: 0.009,
        speedMultiplier: 0.45,
        flowKey: 'wasteFlow',
        renderSleeve: false,
      },

      // 7. UV Chamber Discharge: Core UV -> Tube_UV_To_PrimaryReturn -> Bulkhead_UV_CleanTankInlet -> VERTICAL Drop into Reservoir
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.1065, -1.415, -0.6075),
          new THREE.Vector3(-0.1065, -1.415, -0.5325),
          new THREE.Vector3(-0.1065, -1.415, -0.4575),
          new THREE.Vector3(-0.1065, -1.55, -0.4575),
          new THREE.Vector3(-0.1065, -1.75, -0.4575),
        ]),
        beadColor: '#a855f7',
        beadEmissive: '#7e22ce',
        beadCount: 5,
        beadSize: 0.010,
        speedMultiplier: 0.4,
        flowKey: 'permFlow',
        renderSleeve: true, // Render sleeve for vertical downcomer
      },

      // 8. Potable Dispense Circuit: Port_CleanTank_Discharge -> Riser_VDISP -> Pipe Through Rail -> Chrome Tap -> Beaker on Tray
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.3435, -2.06, 0.3825),
          new THREE.Vector3(0.5535, -2.06, 0.3825),
          new THREE.Vector3(0.5535, -1.985, 0.3825),
          new THREE.Vector3(0.5535, -1.91, 0.3825),
          new THREE.Vector3(0.5535, -1.91, 0.465),
          new THREE.Vector3(0.5535, -1.892, 0.5475),
          new THREE.Vector3(0.5535, -1.856, 0.585),
          new THREE.Vector3(0.5535, -1.895, 0.6225),
          new THREE.Vector3(0.5535, -1.98, 0.6225),
          new THREE.Vector3(0.5535, -2.06, 0.6225),
        ]),
        beadColor: '#00f0ff',
        beadEmissive: '#0284c7',
        beadCount: 6,
        beadSize: 0.009,
        speedMultiplier: 0.5,
        flowKey: 'dispenseFlow',
        renderSleeve: false,
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

    flowSegments.forEach((fc, idx) => {
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
        const t = (timesRef.current[idx] * 0.32 + i / fc.beadCount) % 1.0;
        const pt = fc.curve.getPointAt(t);
        bead.position.copy(pt);
      }
    });
  });

  return (
    <group ref={containerRef}>
      {flowSegments.map((fc, idx) => {
        return (
          <group key={idx}>
            {/* Optional sleek crystal sleeve for open lines (e.g. downcomer into clean tank) */}
            {fc.renderSleeve && (
              <mesh visible={!exploded}>
                <tubeGeometry args={[fc.curve, 32, 0.006, 8, false]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  opacity={0.3}
                  transparent={true}
                  roughness={0.08}
                  metalness={0.1}
                />
              </mesh>
            )}

            {/* Glowing Flowing Fluid Beads Inside Authentic CAD Pipes */}
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
                    emissiveIntensity={2.8}
                    roughness={0.1}
                    metalness={0.2}
                  />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {/* Laminar Dispense Stream Pouring from Tap Nozzle directly into Beaker */}
      <mesh position={[0.5535, -2.00, 0.6225]} visible={!exploded && running}>
        <cylinderGeometry args={[0.004, 0.0045, 0.14, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.8}
          transparent={true}
          opacity={0.65}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Precision Borosilicate Laboratory Glass Beaker seated firmly on Basement Skid Shelf */}
      <group position={[0.5535, -2.085, 0.6225]} visible={!exploded}>
        {/* Glass Beaker Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.032, 0.07, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            metalness={0.05}
            roughness={0.04}
            transmission={0.92}
            transparent={true}
            opacity={0.4}
            ior={1.47}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Beaker White Graduations Decal */}
        {beakerTex && (
          <mesh position={[0, 0, 0.034 + 0.001]}>
            <planeGeometry args={[0.04, 0.065]} />
            <meshBasicMaterial
              map={beakerTex}
              transparent
              opacity={0.92}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        {/* Beaker Glass Base (Resting flush on tray at Y = -2.12) */}
        <mesh position={[0, -0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.032, 32]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            metalness={0.05}
            roughness={0.04}
            transparent={true}
            opacity={0.48}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Water Pool Inside Beaker */}
        <mesh position={[0, -0.012, 0]}>
          <cylinderGeometry args={[0.031, 0.031, 0.045, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            metalness={0.1}
            roughness={0.05}
            transparent={true}
            opacity={0.75}
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
          isFlowing={isFlowing}
        />
      ))}

      {/* 100% CAD-CONGRUENT HYDRAULIC CIRCUIT FLUID FLOW */}
      <FullHydraulicFlowVisualizer
        simState={simState}
        running={isFlowing}
        exploded={exploded}
      />
    </group>
  );
};
