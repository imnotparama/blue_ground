'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const FilterHousing = () => {
  const { 
    exploded, 
    transparent, 
    cutaway, 
    activeHotspot, 
    setActiveHotspot, 
    setCameraPreset, 
    mode, 
    metrics,
    tanksOnly,
  } = useSystemState();
  
  const mainGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (mainGroupRef.current) {
      const targetY = exploded ? 0.25 : 0;
      const targetZ = exploded ? -0.20 : 0;
      const damp = 1.0 - Math.exp(-6 * delta);
      mainGroupRef.current.position.y = THREE.MathUtils.lerp(mainGroupRef.current.position.y, 0.45 + targetY, damp);
      mainGroupRef.current.position.z = THREE.MathUtils.lerp(mainGroupRef.current.position.z, -0.62 + targetZ, damp);
    }
  });

  const stages = [
    {
      id: 'stage1',
      num: 1,
      x: -0.66,
      name: 'Stage 1: Sediment',
      shortName: 'Sediment',
      subtitle: '5µm PP Melt-Blown',
      color: '#f8fafc',
      stripColor: '#0284c7',
      health: metrics.stage1Health || 92,
      desc: 'Removes silt, rust, and coarse mining particulate',
    },
    {
      id: 'stage2',
      num: 2,
      x: -0.22,
      name: 'Stage 2: Chemo Block',
      shortName: 'Chemo Block',
      subtitle: 'Extruded Carbon CTO',
      color: '#1e293b',
      stripColor: '#10b981',
      health: metrics.stage2Health || 85,
      desc: 'Adsorbs chlorine, organic chemicals, and heavy odours',
    },
    {
      id: 'stage3',
      num: 3,
      x: 0.22,
      name: 'Stage 3: RO Maxx',
      shortName: 'RO Maxx',
      subtitle: '0.0001µm TFC Membrane',
      color: '#0369a1',
      stripColor: '#06b6d4',
      health: metrics.stage3Health || 79,
      desc: 'High-rejection desalination & heavy metal stripping',
    },
    {
      id: 'stage4',
      num: 4,
      x: 0.66,
      name: 'Stage 4: Final Guard / UV',
      shortName: 'Final Guard',
      subtitle: 'Mineralizer + UV-C',
      color: '#e2e8f0',
      stripColor: '#38bdf8',
      health: metrics.stage4Health || 95,
      desc: 'Remineralization & 254nm germicidal disinfection',
    },
  ];

  const isDimmed = tanksOnly || (activeHotspot !== null && activeHotspot !== 'filter_housing' && activeHotspot !== 'filtration_tank');

  return (
    <group 
      ref={mainGroupRef}
      position={[-0.70, 0.45, -0.62]}
      onClick={(e) => {
        e.stopPropagation();
        setActiveHotspot('filter_housing');
        setCameraPreset('FILTER_HOUSING');
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          BACK-MOUNTED 4-STAGE FILTRATION RACK (ALUMINIUM HEAVY BRACKET)
          ════════════════════════════════════════════════════════════════════ */}
      {/* Upper & Lower Horizontal Anodized Aluminium Mounting Rails */}
      <mesh position={[0, 0.36, -0.07]} castShadow>
        <boxGeometry args={[1.75, 0.05, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.36, -0.07]} castShadow>
        <boxGeometry args={[1.75, 0.05, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Structural Support Clamps linking to main rack */}
      {[-0.82, 0.82].map((cx, i) => (
        <mesh key={i} position={[cx, 0, -0.05]} castShadow>
          <boxGeometry args={[0.04, 0.78, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.85} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════════════
          THE 4 VERTICAL CARTRIDGE HOUSINGS
          ════════════════════════════════════════════════════════════════════ */}
      {stages.map((st, i) => {
        const isHovered = hovered === i;
        const healthFrac = st.health / 100;
        const isUvStage = st.num === 4;

        return (
          <group 
            key={st.id} 
            position={[st.x, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = 'default';
            }}
          >
            {/* Top Reinforced Manifold Cap with Inlet/Outlet Ports */}
            <mesh position={[0, 0.34, 0]} castShadow>
              <cylinderGeometry args={[0.078, 0.082, 0.09, 24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
            </mesh>
            {/* Pressure Relief Vent Valve on Cap */}
            <mesh position={[0, 0.39, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
            </mesh>

            {/* Main Cylindrical Filter Cartridge Housing */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.072, 0.068, 0.60, 28]} />
              <meshStandardMaterial 
                color={st.color} 
                roughness={0.35} 
                metalness={isUvStage ? 0.95 : 0.4}
                transparent={transparent || cutaway}
                opacity={(transparent || cutaway) ? 0.25 : 1.0}
              />
            </mesh>

            {/* Cartridge Status Color ID Identification Strip */}
            <mesh position={[0, 0.20, 0]} castShadow>
              <cylinderGeometry args={[0.073, 0.073, 0.035, 28]} />
              <meshStandardMaterial color={st.stripColor} roughness={0.2} metalness={0.7} />
            </mesh>

            {/* Clear Viewing Window Slit */}
            <mesh position={[0, -0.04, 0.069]} castShadow>
              <boxGeometry args={[0.025, 0.36, 0.01]} />
              <meshPhysicalMaterial 
                color="#38bdf8" 
                transmission={0.85} 
                transparent 
                opacity={0.85} 
                roughness={0.1} 
              />
            </mesh>

            {/* UV-C Internal Glow Emission for Stage 4 */}
            {isUvStage && (
              <group position={[0, -0.04, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.025, 0.025, 0.45, 16]} />
                  <meshStandardMaterial 
                    color="#38bdf8" 
                    emissive={metrics.uvStatus === 'ON' ? '#0284c7' : '#000000'}
                    emissiveIntensity={metrics.uvStatus === 'ON' ? 2.5 : 0}
                    roughness={0.2} 
                  />
                </mesh>
                {metrics.uvStatus === 'ON' && (
                  <pointLight color="#38bdf8" intensity={1.2} distance={0.6} />
                )}
              </group>
            )}

            {/* Bottom Sump Cap / Drain Port */}
            <mesh position={[0, -0.32, 0]} castShadow>
              <cylinderGeometry args={[0.068, 0.055, 0.06, 24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
            </mesh>

            {/* Filter Health Bar Plate on Front */}
            <group position={[0, -0.16, 0.075]}>
              {/* Backplate */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.09, 0.022, 0.004]} />
                <meshStandardMaterial color="#09090b" roughness={0.8} />
              </mesh>
              {/* Health Progress Fill */}
              <mesh position={[-0.042 + (healthFrac * 0.084) / 2, 0, 0.003]}>
                <boxGeometry args={[healthFrac * 0.084, 0.014, 0.004]} />
                <meshStandardMaterial 
                  color={healthFrac > 0.8 ? '#10b981' : healthFrac > 0.5 ? '#f59e0b' : '#ef4444'} 
                  emissive={healthFrac > 0.8 ? '#059669' : '#d97706'}
                  emissiveIntensity={0.6}
                />
              </mesh>
            </group>

            {/* 3D Label Plaque for Cartridge Stage */}
            <group position={[0, 0.08, 0.075]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.11, 0.04, 0.004]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
              </mesh>
            </group>

            {/* Hover Highlight Ring */}
            {isHovered && (
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.085, 0.085, 0.72, 24, 1, true]} />
                <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
              </mesh>
            )}

            {/* ════════════════════════════════════════════════════════════════
                3-WAY DYNAMIC ROUTING VALVES (Between Adjacent Filter Stages)
                ════════════════════════════════════════════════════════════════ */}
            {i < 3 && (
              <group position={[0.22, 0.34, 0]}>
                {/* Horizontal Inter-Stage Jumper Pipe */}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.014, 0.014, 0.22, 12]} />
                  <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.85} />
                </mesh>

                {/* 3-Way Valve Brass Body */}
                <mesh position={[0, 0, 0]} castShadow>
                  <sphereGeometry args={[0.022, 12, 12]} />
                  <meshStandardMaterial color="#ca8a04" roughness={0.25} metalness={0.9} />
                </mesh>
                <mesh position={[0, -0.025, 0]} castShadow>
                  <cylinderGeometry args={[0.010, 0.010, 0.03, 8]} />
                  <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.85} />
                </mesh>

                {/* Valve Handle Lever (Changes angle/color on selection) */}
                <group position={[0, 0.024, 0]} rotation={[0, 0, mode === 'MAINTENANCE' ? Math.PI / 2 : 0]}>
                  <mesh position={[0.025, 0, 0]} castShadow>
                    <boxGeometry args={[0.055, 0.008, 0.012]} />
                    <meshStandardMaterial 
                      color={mode === 'TURBIDITY' ? '#0ea5e9' : mode === 'MAINTENANCE' ? '#f59e0b' : '#10b981'} 
                      roughness={0.3} 
                      metalness={0.4} 
                    />
                  </mesh>
                </group>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
