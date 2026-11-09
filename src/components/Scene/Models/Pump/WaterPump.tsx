'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const WaterPump = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset, tanksOnly, filterView, simState } = useSystemState();
  
  const groupRef = useRef<THREE.Group>(null);
  const impellerRef = useRef<THREE.Group>(null);
  const pumpHeadRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  React.useEffect(() => {
    if (!groupRef.current) return;
    const mats: THREE.MeshStandardMaterial[] = [];
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        mats.push(child.material as THREE.MeshStandardMaterial);
      }
    });
    materialsRef.current = mats;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const damp = 1.0 - Math.exp(-6 * delta);

    // High-frequency vibration when pump is running
    const vibrationAmp = metrics.pumpRpm > 0 ? 0.0015 : 0;
    const vibX = Math.sin(time * 90) * vibrationAmp;
    const vibZ = Math.sin(time * 100) * vibrationAmp;

    if (groupRef.current) {
      const targetX = (exploded ? 1.70 : 1.35) + vibX;
      const targetY = exploded ? 0.65 : 0.05;
      const targetZ = (exploded ? 0.85 : 0.0) + vibZ;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, damp);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, damp);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, damp);

      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
    }

    // Exploded pump head & impeller separation
    if (pumpHeadRef.current) {
      const targetHeadX = exploded ? 0.20 : 0.05;
      pumpHeadRef.current.position.x = THREE.MathUtils.lerp(pumpHeadRef.current.position.x, targetHeadX, damp);
    }

    if (impellerRef.current) {
      const targetImpX = exploded ? 0.11 : 0.05;
      impellerRef.current.position.x = THREE.MathUtils.lerp(impellerRef.current.position.x, targetImpX, damp);

      // Impeller rotation
      if (metrics.pumpRpm > 0) {
        const radPerSec = (metrics.pumpRpm / 60) * 2 * Math.PI;
        impellerRef.current.rotation.y += radPerSec * delta;
      }
    }

    const isDimmed = tanksOnly || filterView || (activeHotspot !== null && activeHotspot !== 'pump' && activeHotspot !== 'water_pump');
    const targetOpacity = isDimmed ? 0.08 : 1.0;

    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = isDimmed;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);

      if (mat.emissive) {
        if (hovered && !isDimmed) {
          mat.emissive.set('#06b6d4');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, damp);
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, damp);
        }
      }
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('pump');
    setCameraPreset('PUMP');
  };

  return (
    <group 
      ref={groupRef}
      position={[1.35, 0.05, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* ─── HEAVY-DUTY GROUNDED EQUIPMENT STAND & UNISTRUT CHASSIS ─── */}
      {/* Heavy Steel Skid Base Plate */}
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.025, 0.22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* 4 Rubber Anti-Vibration Isolator Bushings */}
      {[-0.10, 0.10].map((bx) =>
        [-0.06, 0.06].map((bz) => (
          <mesh key={`vib-${bx}-${bz}`} position={[bx, -0.04, bz]} castShadow>
            <cylinderGeometry args={[0.016, 0.018, 0.025, 12]} />
            <meshStandardMaterial color="#090d16" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Dual Vertical Structural Support Unistrut Legs down to Concrete Ground Floor (y = -1.75) */}
      {[-0.11, 0.11].map((lx) => (
        <group key={`leg-${lx}`} position={[lx, -0.88, 0]}>
          {/* Vertical 40x40mm Structural Channel */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.038, 1.62, 0.038]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Heavy Steel Base Flange on Floor */}
          <mesh position={[0, -0.80, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.10, 0.02, 0.10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Floor Anchor Studs */}
          {[-0.035, 0.035].map((ax) =>
            [-0.035, 0.035].map((az) => (
              <mesh key={`stud-${ax}-${az}`} position={[ax, -0.785, az]}>
                <cylinderGeometry args={[0.006, 0.006, 0.012, 6]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Cross Brace connecting Skid Stand to Main Tank Frame on left */}
      <mesh position={[-0.20, -0.06, 0]} castShadow>
        <boxGeometry args={[0.16, 0.03, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[-0.20, -0.85, 0]} castShadow>
        <boxGeometry args={[0.16, 0.03, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Main High-Pressure DC Booster Motor Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Live Operational Status LED on Booster Motor Body */}
      <mesh position={[0, 0.05, 0.072]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial
          color={
            simState?.pumpStatus === 'FAULT'
              ? '#ef4444'
              : simState?.pumpStatus === 'RUNNING'
              ? '#10b981'
              : '#64748b'
          }
          emissive={
            simState?.pumpStatus === 'FAULT'
              ? '#ef4444'
              : simState?.pumpStatus === 'RUNNING'
              ? '#10b981'
              : '#000000'
          }
          emissiveIntensity={simState?.pumpStatus === 'IDLE' ? 0 : 2.5}
        />
      </mesh>

      {/* Base mounting brackets */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[0.16, 0.02, 0.08]} />
        <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Motor cap */}
      <mesh position={[0, 0.085, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.07, 0.025, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.35} metalness={0.5} />
      </mesh>

      {/* Exploded Pump Head Chamber & Inlet Collar */}
      <group ref={pumpHeadRef} position={[0, 0, 0]}>
        {/* Transparent impeller chamber */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 16, 1, true]} />
          <meshPhysicalMaterial 
            transparent 
            opacity={0.35} 
            roughness={0.05} 
            clearcoat={1.0}
            side={THREE.DoubleSide} 
          />
        </mesh>

        {/* Inlet Suction Collar from Secondary Chamber */}
        <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.04, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Rotating Impeller Fan (Visible in between motor and head in Exploded View) */}
      <group ref={impellerRef} position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.8} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, (i * Math.PI) / 2, 0.2]} 
            position={[0, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.045, 0.007, 0.014]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
