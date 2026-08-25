'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SolarPanel = () => {
  const { exploded, mode, metrics, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [hoveredBh1750, setHoveredBh1750] = useState(false);
  
  // Canvas texture for monocrystalline cells
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0b1329';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      const cellSize = 64;
      for (let x = 0; x < 256; x += cellSize) {
        for (let y = 0; y < 256; y += cellSize) {
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    textureRef.current = new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    // 1. Exploded view offset
    const targetY = exploded ? 0.9 : 0;
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
      
      const targetScale = (hovered || hoveredBh1750) ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Traversal Dimming
    const isDimmed = activeHotspot !== null && activeHotspot !== 'solar';
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
                mat.emissiveIntensity = 0.0;
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

  // 3 Panels relative offsets
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
      {/* Solar Array framework: centered at x=-1.4, y=0.5, z=0 */}
      <group position={[-1.4, 0.5, 0]}>
        
        {/* Support brackets */}
        <mesh position={[-0.3, 0.0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0.3, 0.0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.7} />
        </mesh>
        
        {/* Transverse mounting rail */}
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Tilted Solar Panels Deck */}
        <group position={[0, 0.16, 0]} rotation={[0.2, 0, -0.15]}>
          
          {/* THREE SOLAR PANELS */}
          {panels.map((p, idx) => (
            <group key={idx} position={[p.x, 0, 0]}>
              {/* Back Plate */}
              <mesh castShadow>
                <boxGeometry args={[0.32, 0.02, 0.7]} />
                <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.2} />
              </mesh>

              {/* Monocrystalline cells surface */}
              <mesh position={[0, 0.011, 0]} castShadow>
                <boxGeometry args={[0.3, 0.005, 0.66]} />
                <meshStandardMaterial
                  map={textureRef.current || undefined}
                  roughness={0.06}
                  metalness={0.8}
                />
              </mesh>

              {/* Bezel frame */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.33, 0.025, 0.72]} />
                <meshStandardMaterial color="#d4d4d8" roughness={0.1} metalness={0.95} />
              </mesh>
            </group>
          ))}

          {/* BH1750 LUX IRRADIANCE SENSOR */}
          {/* Small blue board with white dome light sensor mounted on the center panel top rail */}
          <group 
            position={[0.22, 0.02, 0.38]}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredBh1750(true); }}
            onPointerOut={() => setHoveredBh1750(false)}
          >
            {/* Small L-Bracket mount */}
            <mesh position={[0, -0.025, -0.02]} castShadow>
              <boxGeometry args={[0.02, 0.04, 0.03]} />
              <meshStandardMaterial color="#3f4f6e" roughness={0.4} metalness={0.8} />
            </mesh>
            
            {/* Blue Sensor PCB */}
            <mesh castShadow>
              <boxGeometry args={[0.035, 0.008, 0.055]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
            </mesh>

            {/* White dome diffuser lens */}
            <mesh position={[0, 0.007, 0.01]} castShadow>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>

            {/* Gold pin headers */}
            <mesh position={[0, -0.006, -0.02]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.005, 0.024, 0.008]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
          </group>

        </group>
      </group>
    </group>
  );
};
