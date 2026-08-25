'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SolarPanel = () => {
  const { exploded, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [hovered, setHovered] = useState(false);
  const [hoveredBh1750, setHoveredBh1750] = useState(false);

  // Generate procedural Photovoltaic Solar Cell grid texture
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Deep blue/black monocrystalline silicon base
      ctx.fillStyle = '#0a1128';
      ctx.fillRect(0, 0, 512, 512);

      // Antireflective coating shimmer
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#0c1a40');
      gradient.addColorStop(0.5, '#071026');
      gradient.addColorStop(1, '#030814');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Silver Busbar Conductors
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      for (let x = 64; x < 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Micro-Fingers Grid lines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 16; y < 512; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Photovoltaic Cell Separation Chamfers
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4;
      for (let x = 0; x <= 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      textureRef.current = texture;
    }
  }, []);

  useFrame(() => {
    // Exploded View: solar array lifts upward
    const targetY = exploded ? 0.35 : 0;
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

      const targetScale = hovered ? 1.02 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // Focus dimming & Cyan glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'solar' && activeHotspot !== 'solar_panel';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            if (mat.emissive) {
              if (hovered && !isDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.4, 0.1);
              } else {
                mat.emissive.set('#000000');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, 0.1);
              }
            }
          }
        }
      });
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
    setActiveHotspot('solar');
    setCameraPreset('SOLAR');
  };

  // 3 photovoltaic panel modules
  const panels = [
    { x: -0.36 },
    { x: 0.0 },
    { x: 0.36 }
  ];

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Mounted on Top of Primary Tank at x = -2.0, y = 0.22, z = 0 */}
      <group position={[-2.0, 0.22, 0]}>
        
        {/* Support Strut Legs anchored to Primary Tank Frame */}
        <mesh position={[-0.45, 0.08, -0.3]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.45, 0.08, -0.3]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-0.45, 0.14, 0.3]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.28, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.45, 0.14, 0.3]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.28, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Transverse Cross Mounting Rails */}
        <mesh position={[0, 0.16, -0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.1, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.28, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.1, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Tilted Solar Panels Deck (tilted slightly back for sun angle) */}
        <group position={[0, 0.22, 0]} rotation={[-0.22, 0, 0]}>
          
          {/* THREE SOLAR PANELS */}
          {panels.map((p, idx) => (
            <group key={idx} position={[p.x, 0, 0]}>
              {/* Back Plate Enclosure */}
              <mesh castShadow>
                <boxGeometry args={[0.33, 0.02, 0.72]} />
                <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.2} />
              </mesh>

              {/* Photovoltaic Cells Surface */}
              <mesh position={[0, 0.011, 0]} castShadow>
                <boxGeometry args={[0.31, 0.005, 0.68]} />
                <meshStandardMaterial
                  map={textureRef.current || undefined}
                  roughness={0.06}
                  metalness={0.8}
                />
              </mesh>

              {/* Silver Bezel Edge Frame */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.34, 0.024, 0.73]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.9} />
              </mesh>
            </group>
          ))}

          {/* BH1750 LUX IRRADIANCE SENSOR */}
          <group 
            position={[0.24, 0.02, 0.36]}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredBh1750(true); }}
            onPointerOut={() => setHoveredBh1750(false)}
          >
            {/* L-Bracket mount */}
            <mesh position={[0, -0.02, -0.02]} castShadow>
              <boxGeometry args={[0.02, 0.035, 0.03]} />
              <meshStandardMaterial color="#3f4f6e" roughness={0.4} metalness={0.8} />
            </mesh>
            
            {/* Blue Sensor PCB */}
            <mesh castShadow>
              <boxGeometry args={[0.035, 0.008, 0.05]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
            </mesh>

            {/* White dome light sensor */}
            <mesh position={[0, 0.007, 0.01]} castShadow>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>

            {/* Gold header pins */}
            <mesh position={[0, -0.005, -0.018]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.004, 0.022, 0.006]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
          </group>

        </group>
      </group>
    </group>
  );
};
