'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SolarPanel = () => {
  const { exploded, mode, metrics, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const sunRaysRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Create solar grid canvas texture dynamically for a premium monocrystalline panel look
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      const cellSize = 128;
      for (let x = 0; x < 512; x += cellSize) {
        for (let y = 0; y < 512; y += cellSize) {
          ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.moveTo(x + 3, y + 16);
          ctx.lineTo(x + 16, y + 3);
          ctx.lineTo(x + cellSize - 16, y + 3);
          ctx.lineTo(x + cellSize - 3, y + 16);
          ctx.lineTo(x + cellSize - 3, y + cellSize - 16);
          ctx.lineTo(x + cellSize - 16, y + cellSize - 3);
          ctx.lineTo(x + 16, y + cellSize - 3);
          ctx.lineTo(x + 3, y + cellSize - 16);
          ctx.fill();
        }
      }
    }
    canvasRef.current = canvas;
    textureRef.current = new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Exploded view: Solar panel rises
    const targetY = exploded ? 0.9 : 0;
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
      
      // Smooth scale up on hover (3%)
      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Pulse Sun Rays Opacity based on charging speed
    if (sunRaysRef.current) {
      const isCharging = mode === 'NORMAL' && metrics.solarWatts > 10;
      const targetOpacity = isCharging ? 0.08 + Math.sin(time * 3) * 0.03 : 0.0;
      const mat = sunRaysRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
    }

    // 3. Selective Focus Dimming traversal & Cyan outline glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'solar';
    const targetOpacity = isDimmed ? 0.15 : 1.0;
    
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            if (child === sunRaysRef.current) return;
            
            // Lerp opacity for dimming
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            // Apply cyan outline glow on hover
            if (mat.emissive) {
              if (hovered && !isDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                // Restore standard emissives
                const standardEmissive = (child.name === 'photovoltaic-mesh' && mode === 'NORMAL' && metrics.solarWatts > 10) 
                  ? new THREE.Color('#0e7490') 
                  : new THREE.Color('#000000');
                const standardIntensity = (child.name === 'photovoltaic-mesh' && mode === 'NORMAL' && metrics.solarWatts > 10) ? 0.45 : 0.0;
                
                mat.emissive.lerp(standardEmissive, 0.1);
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, standardIntensity, 0.1);
              }
            }
          }
        }
      });
    }
  });

  const isCharging = mode === 'NORMAL' && metrics.solarWatts > 10;

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

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Solar Panel Mounts and Stand */}
      <group position={[-1.4, 0.5, 0]}>
        {/* Support brackets */}
        <mesh castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.7} />
        </mesh>
        
        {/* Hinge */}
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Tilted Solar Panel Board */}
        <group position={[0, 0.18, 0]} rotation={[0.2, 0, -0.15]}>
          {/* Volumetric Sun Ray cylinder beam (additive blend glow) */}
          <mesh ref={sunRaysRef} position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 1.2, 16, 1, true]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.0}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Localized Sun Glow light above panel */}
          {isCharging && (
            <pointLight 
              position={[0, 0.7, 0]} 
              intensity={2.0} 
              color="#fbbf24" 
              distance={2.0} 
              decay={2}
            />
          )}

          {/* Panel Back Frame */}
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.03, 0.9]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.2} />
          </mesh>

          {/* Monocrystalline cells surface */}
          <mesh name="photovoltaic-mesh" position={[0, 0.018, 0]} castShadow>
            <boxGeometry args={[0.96, 0.01, 0.86]} />
            <meshStandardMaterial
              map={textureRef.current || undefined}
              roughness={0.05}
              metalness={0.7}
              emissive={isCharging ? '#0e7490' : '#000000'}
              emissiveIntensity={isCharging ? 0.45 : 0}
            />
          </mesh>

          {/* Polished Frame Glass Panel */}
          <mesh position={[0, 0.024, 0]}>
            <boxGeometry args={[0.98, 0.005, 0.88]} />
            <meshPhysicalMaterial
              transparent
              opacity={0.18}
              roughness={0.01}
              metalness={0.1}
              transmission={0.95}
              clearcoat={1.0}
              clearcoatRoughness={0.01}
            />
          </mesh>

          {/* Premium Anodized Aluminum Outer Bevel Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.02, 0.04, 0.92]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.1} metalness={0.95} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
