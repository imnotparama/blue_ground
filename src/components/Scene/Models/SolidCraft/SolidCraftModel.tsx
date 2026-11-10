'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import { SOLID_CRAFT_BODIES, CADBodyData } from './cadModelData';
import * as THREE from 'three';

// Individual CAD body item with silky smooth lerp transitions
const CADBodyItem: React.FC<{
  body: CADBodyData;
  exploded: boolean;
  simState: any;
}> = ({ body, exploded, simState }) => {
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
      const targetColor = (isClogged || isTurbid)
        ? new THREE.Color('#92400e')
        : new THREE.Color('#f1f5f9');
      matRef.current.color.lerp(targetColor, damp);
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

// Animated stream of incoming borewell water entering the white sedimentation filter
const RawWaterInletFlow: React.FC<{ running: boolean; flowRate: number; exploded: boolean }> = ({
  running,
  flowRate,
  exploded,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const speed = Math.max(0.4, Math.min(flowRate * 0.35, 2.5));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta * speed;
    const xOffset = exploded ? 0.65 : 0;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, xOffset, 0.1);

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as THREE.Mesh;
      const progress = (timeRef.current * 0.4 + i * 0.16) % 1.0;
      // Interpolate along the vertical riser and into the inlet elbow
      if (progress < 0.85) {
        child.position.set(0.80, -2.15 + (progress / 0.85) * 1.65, 0.2505);
      } else {
        const elbowT = (progress - 0.85) / 0.15;
        child.position.set(0.80 - elbowT * 0.08, -0.485, 0.2505);
      }
    }
  });

  if (!running || flowRate < 0.05) return null;

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0.80, -2.15, 0.2505]}>
          <sphereGeometry args={[0.011, 16, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={2.0}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

export const SolidCraftModel: React.FC = () => {
  const { exploded, simState, simulationRunning } = useSystemState();

  const isFlowing = simulationRunning && (simState?.inputFlowRate || 0) > 0.05;

  return (
    <group name="SolidCraft_Leviathan_v9_Assembly">
      {/* RENDER ALL 256 AUTHENTIC SOLIDCRAFT CAD BODIES */}
      {SOLID_CRAFT_BODIES.map((body) => (
        <CADBodyItem
          key={body.id}
          body={body}
          exploded={exploded}
          simState={simState}
        />
      ))}

      {/* Dynamic Water Flow Stream: Entering Directly into White Sedimentation Filter */}
      <RawWaterInletFlow
        running={isFlowing}
        flowRate={simState?.inputFlowRate ?? 4.8}
        exploded={exploded}
      />
    </group>
  );
};
