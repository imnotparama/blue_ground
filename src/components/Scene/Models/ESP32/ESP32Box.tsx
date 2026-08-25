'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const ESP32Box = () => {
  const { exploded, metrics, mode, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredBox, setHoveredBox] = useState(false);
  const [hoveredScreen, setHoveredScreen] = useState(false);
  
  // Ref to the screen canvas and texture
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  // Red/green diagnostic LEDs on the board
  const powerLedRef = useRef<THREE.Mesh>(null);
  const statusLedRef = useRef<THREE.Mesh>(null);

  // Redraw TFT screen canvas when metrics update
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 128, 128);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < 128; y += 4) {
        ctx.fillRect(0, y, 128, 2);
      }

      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 128, 20);
      
      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('AURA IoT CORE', 6, 13);
      
      ctx.fillStyle = metrics.esp32Online ? '#10b981' : '#ef4444';
      ctx.fillRect(110, 6, 8, 8);

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '7px monospace';

      ctx.fillText(`MODE: ${mode}`, 6, 36);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`TDS:  ${metrics.tds} ppm`, 6, 52);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`pH:   ${metrics.ph.toFixed(1)}`, 6, 68);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`TURB: ${metrics.turbidity.toFixed(1)} NTU`, 6, 84);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`TEMP: ${metrics.temperature.toFixed(1)}C`, 6, 100);

      ctx.fillStyle = '#52525b';
      ctx.fillRect(0, 112, 128, 16);
      
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 7px monospace';
      ctx.fillText(`BATT: ${Math.round(metrics.batteryPercent)}%  ${metrics.flowRate.toFixed(1)}L/m`, 6, 123);
    }

    canvasRef.current = canvas;
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    } else {
      textureRef.current = new THREE.CanvasTexture(canvas);
    }
  }, [metrics, mode]);

  useFrame((state, delta) => {
    // 1. Exploded view: ESP32 unit slides right
    const targetX = exploded ? 0.6 : 0;
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);

      // Smooth scale up on hover (3%)
      const isHovered = hoveredBox || hoveredScreen;
      const targetScale = isHovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Blinking ESP32 status LEDs
    const time = state.clock.getElapsedTime();
    if (powerLedRef.current) {
      const mat = powerLedRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = metrics.esp32Online ? 1.0 : 0.0;
    }
    if (statusLedRef.current) {
      const mat = statusLedRef.current.material as THREE.MeshStandardMaterial;
      const isBlinking = Math.floor(time * 2) % 2 === 0;
      mat.emissiveIntensity = metrics.esp32Online && isBlinking ? 1.2 : 0.0;
    }

    // 3. Focus dimming traversal & Cyan outline glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'esp32' && activeHotspot !== 'display';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Skip board status LEDs
          if (child === powerLedRef.current || child === statusLedRef.current) return;

          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            // Apply cyan outline glow on hover
            if (mat.emissive) {
              const isHoveredPart = (child.name === 'tft-screen-bezel' && hoveredScreen) || (child.name === 'enclosure-mesh' && hoveredBox);
              if (isHoveredPart && !isDimmed) {
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
  });

  const handlePointerOverBox = (e: any) => {
    e.stopPropagation();
    setHoveredBox(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutBox = () => {
    setHoveredBox(false);
    document.body.style.cursor = 'default';
  };

  const handlePointerOverScreen = (e: any) => {
    e.stopPropagation();
    setHoveredScreen(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOutScreen = () => {
    setHoveredScreen(false);
    document.body.style.cursor = 'default';
  };

  const handleClickBox = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('esp32');
    setCameraPreset('ESP32');
  };

  const handleClickScreen = (e: any) => {
    e.stopPropagation();
    setActiveHotspot('display');
    setCameraPreset('DISPLAY');
  };

  // Screw positions on corners of display face
  const screwCoordinates = [
    { x: -0.31, y: 0.08 },
    { x: 0.31, y: 0.08 },
    { x: -0.31, y: -0.08 },
    { x: 0.31, y: -0.08 },
  ];

  return (
    <group ref={groupRef}>
      {/* ESP32 box centered at: x=0.7, y=0.52, z=0 */}
      <group position={[0.7, 0.52, 0]}>
        
        {/* 1. MAIN INDUSTRIAL ELECTRONICS ENCLOSURE */}
        <mesh 
          name="enclosure-mesh"
          castShadow 
          receiveShadow
          onPointerOver={handlePointerOverBox}
          onPointerOut={handlePointerOutBox}
          onClick={handleClickBox}
        >
          <boxGeometry args={[0.7, 0.22, 0.5]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>

        {/* Screw bolts on display plate */}
        {screwCoordinates.map((screw, i) => (
          <mesh key={i} position={[screw.x, screw.y, 0.251]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.005, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.9} />
          </mesh>
        ))}

        {/* 2. TFT SCREEN (1.8 Display on front face) */}
        <group 
          position={[0.0, 0.0, 0.252]}
          onPointerOver={handlePointerOverScreen}
          onPointerOut={handlePointerOutScreen}
          onClick={handleClickScreen}
        >
          {/* Bezel frame */}
          <mesh name="tft-screen-bezel" castShadow>
            <boxGeometry args={[0.32, 0.32, 0.015]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* TFT Screen Surface */}
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.28, 0.28]} />
            <meshStandardMaterial
              map={textureRef.current || undefined}
              roughness={0.1}
              metalness={0.1}
              emissive="#ffffff"
              emissiveIntensity={metrics.esp32Online ? 0.9 : 0.0}
            />
          </mesh>
        </group>

        {/* 3. SIDE CABLE GLANDS (Gland wire outputs) */}
        {[-0.1, 0.1].map((zVal, i) => (
          <group key={i} position={[0.35, -0.04, zVal]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.024, 0.024, 0.03, 6]} />
              <meshStandardMaterial color="#09090b" roughness={0.4} />
            </mesh>
            <mesh position={[0.03, -0.06, 0]} rotation={[0, 0, -0.2]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
              <meshStandardMaterial color="#09090b" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* 4. INTERIOR CIRCUIT BOARD (PCB) */}
        <group position={[0, -0.05, 0]}>
          {/* PCB Fiberglass Board (Green) */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.01, 0.4]} />
            <meshStandardMaterial color="#064e3b" roughness={0.6} metalness={0.15} />
          </mesh>

          {/* Silver ESP32 microchip */}
          <mesh position={[-0.15, 0.01, -0.05]} castShadow>
            <boxGeometry args={[0.1, 0.012, 0.12]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>

          {/* Relay Board */}
          <mesh position={[0.15, 0.015, -0.08]} castShadow>
            <boxGeometry args={[0.08, 0.02, 0.08]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.6} />
          </mesh>

          {/* Board LEDs */}
          <mesh ref={powerLedRef} position={[-0.25, 0.01, 0.15]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
          </mesh>
          <mesh ref={statusLedRef} position={[-0.22, 0.01, 0.15]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
          </mesh>

          {/* Detailed wires running from PCB */}
          <group position={[0.18, -0.08, 0.05]}>
            {[0, 0.05, 0.1].map((zOffset, idx) => (
              <mesh key={idx} position={[0, 0, zOffset]} rotation={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.004, 0.004, 0.15, 6]} />
                <meshStandardMaterial 
                  color={idx === 0 ? '#f59e0b' : idx === 1 ? '#06b6d4' : '#ec4899'} 
                  roughness={0.5} 
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};
