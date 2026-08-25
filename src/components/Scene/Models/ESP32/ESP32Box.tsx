'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const ESP32Box = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredBox, setHoveredBox] = useState(false);
  const [hoveredScreen, setHoveredScreen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const powerLedRef = useRef<THREE.Mesh>(null);
  const statusLedRef = useRef<THREE.Mesh>(null);

  // Draw real-time dynamic 1.8 TFT screen telemetry
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
      ctx.fillText('UNIT & CONTROL', 6, 13);
      
      ctx.fillStyle = metrics.esp32Online ? '#10b981' : '#ef4444';
      ctx.fillRect(110, 6, 8, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.fillText(`FLOW : ${metrics.flowRate.toFixed(1)} L/M`, 6, 36);
      ctx.fillText(`TDS  : ${Math.round(metrics.tds)} PPM`, 6, 49);
      ctx.fillText(`TURB : ${metrics.turbidity.toFixed(1)} NTU`, 6, 62);
      ctx.fillText(`pH   : ${metrics.ph.toFixed(2)}`, 6, 75);
      ctx.fillText(`SOLAR: ${metrics.solarWatts.toFixed(0)}W`, 6, 88);
      ctx.fillText(`BATT : ${Math.round(metrics.batteryPercent)}%`, 6, 101);

      ctx.fillStyle = metrics.waterQuality === 'EXCELLENT' ? '#10b981' : '#f59e0b';
      ctx.fillRect(0, 114, 128, 14);
      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`QUALITY: ${metrics.waterQuality}`, 8, 124);

      const texture = new THREE.CanvasTexture(canvas);
      textureRef.current = texture;
      canvasRef.current = canvas;
    }
  }, [metrics]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      const targetY = exploded ? 0.35 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

      const targetScale = (hoveredBox || hoveredScreen) ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    if (statusLedRef.current) {
      const mat = statusLedRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const isBlinking = metrics.esp32Online && Math.sin(time * 8) > 0;
        mat.emissiveIntensity = isBlinking ? 2.5 : 0.2;
      }
    }

    const isDimmed = activeHotspot !== null && activeHotspot !== 'esp32' && activeHotspot !== 'display';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            if (mat.emissive && child !== powerLedRef.current && child !== statusLedRef.current) {
              if ((hoveredBox || hoveredScreen) && !isDimmed) {
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

  return (
    <group ref={groupRef}>
      {/* Unit & Control Box on right roof at x = 0.40, y = 0.74, z = 0 */}
      <group position={[0.40, 0.74, 0]}>
        
        {/* Main Enclosure Box */}
        <mesh 
          name="enclosure-mesh"
          castShadow 
          receiveShadow
          onPointerOver={handlePointerOverBox}
          onPointerOut={handlePointerOutBox}
          onClick={handleClickBox}
        >
          <boxGeometry args={[0.70, 0.28, 0.38]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* 1.8 TFT Display Mounted on Front-Left of Enclosure */}
        <group 
          position={[-0.18, 0.0, 0.191]}
          onPointerOver={handlePointerOverScreen}
          onPointerOut={handlePointerOutScreen}
          onClick={handleClickScreen}
        >
          {/* Bezel */}
          <mesh name="tft-screen-bezel" castShadow>
            <boxGeometry args={[0.26, 0.20, 0.008]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Active Screen Surface */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.24, 0.18]} />
            <meshStandardMaterial
              map={textureRef.current || undefined}
              roughness={0.1}
              emissive="#ffffff"
              emissiveIntensity={metrics.esp32Online ? 0.95 : 0.0}
            />
          </mesh>
        </group>

        {/* Diagnostic LEDs on Front-Right */}
        <mesh ref={powerLedRef} position={[0.22, 0.06, 0.192]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
        </mesh>
        <mesh ref={statusLedRef} position={[0.22, -0.04, 0.192]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
        </mesh>

        {/* Unit & Control Label */}
        <mesh position={[0.15, 0.01, 0.192]}>
          <boxGeometry args={[0.22, 0.18, 0.002]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
