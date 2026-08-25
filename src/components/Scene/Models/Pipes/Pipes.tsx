'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

const PvcMaterial = () => (
  <meshStandardMaterial 
    color="#f1f5f9"
    roughness={0.45}
    metalness={0.05} 
  />
);

const GrayPvcMaterial = () => (
  <meshStandardMaterial 
    color="#475569"
    roughness={0.5} 
    metalness={0.05} 
  />
);

export const Pipes = () => {
  const { exploded, mode, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  
  // References to animate exploded views
  const pipesRef = useRef<THREE.Group>(null);
  const intakeRef = useRef<THREE.Group>(null);
  const valveRef = useRef<THREE.Group>(null);
  const valveHandleRef = useRef<THREE.Mesh>(null);

  // Hover states
  const [hoveredPipes, setHoveredPipes] = useState(false);
  const [hoveredIntake, setHoveredIntake] = useState(false);
  const [hoveredValve, setHoveredValve] = useState(false);

  useFrame((state, delta) => {
    // 1. Exploded separation
    const targetPipesZ = exploded ? 0.35 : 0;
    const targetIntakeX = exploded ? 0.6 : 0;

    if (pipesRef.current) {
      pipesRef.current.position.z = THREE.MathUtils.lerp(pipesRef.current.position.z, targetPipesZ, 0.08);

      // Lerp scale on hover (3%)
      const targetScale = hoveredPipes ? 1.03 : 1.0;
      pipesRef.current.scale.setScalar(THREE.MathUtils.lerp(pipesRef.current.scale.x, targetScale, 0.15));
    }
    
    if (intakeRef.current) {
      intakeRef.current.position.x = THREE.MathUtils.lerp(intakeRef.current.position.x, targetIntakeX, 0.08);

      // Lerp scale on hover (3%)
      const targetScale = hoveredIntake ? 1.03 : 1.0;
      intakeRef.current.scale.setScalar(THREE.MathUtils.lerp(intakeRef.current.scale.x, targetScale, 0.15));
    }

    if (valveRef.current) {
      // Lerp scale on hover (3%)
      const targetScale = hoveredValve ? 1.03 : 1.0;
      valveRef.current.scale.setScalar(THREE.MathUtils.lerp(valveRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Drain Valve rotation
    if (valveHandleRef.current) {
      const targetRotation = mode === 'CLEANING' ? Math.PI / 2 : 0;
      valveHandleRef.current.rotation.z = THREE.MathUtils.lerp(valveHandleRef.current.rotation.z, targetRotation, 0.1);
    }

    // 3. Focus dimming traversal & Cyan outline glow
    const isPipesDimmed = activeHotspot !== null && activeHotspot !== 'return_pipe';
    const isIntakeDimmed = activeHotspot !== null && activeHotspot !== 'intake_pipe';
    const isValveDimmed = activeHotspot !== null && activeHotspot !== 'drain_valve';

    const targetPipesOpacity = isPipesDimmed ? 0.15 : 1.0;
    const targetIntakeOpacity = isIntakeDimmed ? 0.15 : 1.0;
    const targetValveOpacity = isValveDimmed ? 0.15 : 1.0;

    // Traversing Groups
    if (pipesRef.current) {
      pipesRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetPipesOpacity, 0.08);

            if (mat.emissive) {
              if (hoveredPipes && !isPipesDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                mat.emissive.set('#000000');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, 0.1);
              }
            }
          }
        }
      });
    }

    if (intakeRef.current) {
      intakeRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetIntakeOpacity, 0.08);

            if (mat.emissive) {
              if (hoveredIntake && !isIntakeDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                mat.emissive.set('#000000');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, 0.1);
              }
            }
          }
        }
      });
    }

    if (valveRef.current) {
      valveRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetValveOpacity, 0.08);

            if (mat.emissive) {
              if (hoveredValve && !isValveDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                const standardEmissive = child === valveHandleRef.current ? new THREE.Color('#3f0707') : new THREE.Color('#000000');
                const standardIntensity = child === valveHandleRef.current ? 0.15 : 0.0;
                mat.emissive.lerp(standardEmissive, 0.1);
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, standardIntensity, 0.1);
              }
            }
          }
        }
      });
    }
  });

  const handlePointerOverIntake = (e: any) => {
    e.stopPropagation();
    setHoveredIntake(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutIntake = () => {
    setHoveredIntake(false);
    document.body.style.cursor = 'default';
  };

  const handlePointerOverPipes = (e: any) => {
    e.stopPropagation();
    setHoveredPipes(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutPipes = () => {
    setHoveredPipes(false);
    document.body.style.cursor = 'default';
  };

  const handlePointerOverValve = (e: any) => {
    e.stopPropagation();
    setHoveredValve(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutValve = () => {
    setHoveredValve(false);
    document.body.style.cursor = 'default';
  };

  const handleClickIntake = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('intake_pipe');
    setCameraPreset('INTAKE_PIPE');
  };

  const handleClickPipes = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('return_pipe');
    setCameraPreset('RETURN_PIPE');
  };

  const handleClickValve = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('drain_valve');
    setCameraPreset('DRAIN_VALVE');
  };

  return (
    <group>
      {/* 1. GENERAL SYSTEM CONNECTING PIPES (White PVC) */}
      <group 
        ref={pipesRef}
        onPointerOver={handlePointerOverPipes}
        onPointerOut={handlePointerOutPipes}
        onClick={handleClickPipes}
      >
        {/* A. PUMP OUTLET TO FILTER PIPE LINE */}
        <group>
          <mesh position={[0.35, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.64, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[0.35, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[0.95, 0.38, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[1.55, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[1.55, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[1.6, -0.15, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[2.0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[2.2, 0.0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
            <PvcMaterial />
          </mesh>
        </group>

        {/* B. FILTER OUTLET TO PRIMARY TANK RETURN LINE */}
        <group>
          <mesh position={[2.2, -1.37, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[2.2, -1.41, 0]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[0.4, -1.41, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 3.6, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[ -1.4, -1.41, 0 ]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[-1.4, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 2.02, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[-1.4, 0.61, 0]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[-1.3, 0.61, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
            <PvcMaterial />
          </mesh>
        </group>
      </group>

      {/* 2. RAW WATER INTAKE PIPE (FAR RIGHT - Gray PVC) */}
      <group 
        ref={intakeRef}
        onPointerOver={handlePointerOverIntake}
        onPointerOut={handlePointerOutIntake}
        onClick={handleClickIntake}
      >
        <mesh position={[3.8, -1.1, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 4.0, 12]} />
          <GrayPvcMaterial />
        </mesh>

        {/* Engineered Strainer */}
        <group position={[3.8, -3.1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.22, 12, 4, true]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} wireframe />
          </mesh>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.2, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.11, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.02, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.02, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        <mesh position={[3.8, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.038, 12, 12]} />
          <GrayPvcMaterial />
        </mesh>
        <mesh position={[2.25, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 3.1, 12]} />
          <GrayPvcMaterial />
        </mesh>
        <mesh position={[0.7, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.038, 12, 12]} />
          <GrayPvcMaterial />
        </mesh>
        <mesh position={[0.7, 0.84, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
          <GrayPvcMaterial />
        </mesh>
      </group>

      {/* 3. DRAIN VALVE / RELEASE TAP */}
      <group 
        ref={valveRef}
        onPointerOver={handlePointerOverValve}
        onPointerOut={handlePointerOutValve}
        onClick={handleClickValve}
      >
        <group position={[0.5, -1.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0.03, 0, 0]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 0.05, 10]} />
            <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh 
            ref={valveHandleRef} 
            position={[0.03, 0.026, 0]} 
            castShadow
          >
            <boxGeometry args={[0.015, 0.035, 0.09]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0.07, -0.04, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* Secondary tank valve at bottom */}
        <group position={[0.6, 0.02, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
            <PvcMaterial />
          </mesh>
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
