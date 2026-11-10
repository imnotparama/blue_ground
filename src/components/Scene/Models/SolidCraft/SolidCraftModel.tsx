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

export const SolidCraftModel: React.FC = () => {
  const { exploded, simState } = useSystemState();

  return (
    <group name="SolidCraft_Leviathan_v9_Assembly">
      {/* RENDER ALL 239 AUTHENTIC SOLIDCRAFT CAD BODIES */}
      {SOLID_CRAFT_BODIES.map((body) => (
        <CADBodyItem
          key={body.id}
          body={body}
          exploded={exploded}
          simState={simState}
        />
      ))}
    </group>
  );
};
