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
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const lidRef = useRef<THREE.Mesh>(null);
  const lidMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const powerLedRef = useRef<THREE.Mesh>(null);
  const statusLedRef = useRef<THREE.Mesh>(null);

  // Draw real-time dynamic TFT screen telemetry
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
      ctx.fillText('AURA PURIFY CORE', 6, 13);
      
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
      ctx.fillText(`SYS: ${metrics.waterQuality}`, 10, 124);

      const texture = new THREE.CanvasTexture(canvas);
      textureRef.current = texture;
      canvasRef.current = canvas;
    }
  }, [metrics]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Exploded view: Lid opens upward & hinges
    const targetLidY = exploded ? 0.22 : 0.11;
    const targetLidRotX = exploded ? -0.8 : 0;
    
    if (lidRef.current) {
      lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, targetLidY, 0.08);
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetLidRotX, 0.08);
    }

    if (groupRef.current) {
      const targetY = exploded ? 0.35 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

      const targetScale = (hoveredBox || hoveredScreen) ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Status LEDs blinking
    if (statusLedRef.current) {
      const mat = statusLedRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const isBlinking = metrics.esp32Online && Math.sin(time * 8) > 0;
        mat.emissiveIntensity = isBlinking ? 2.5 : 0.2;
      }
    }

    // 3. Focus dimming & Cyan glow
    const isDimmed = activeHotspot !== null && activeHotspot !== 'esp32' && activeHotspot !== 'display' && activeHotspot !== 'esp32_box';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat && mat !== lidMatRef.current) {
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
      {/* ESP32 Control Box — on top shelf of Primary Tank at x = -1.45, y = 0.32, z = -0.35 */}
      <group position={[-1.45, 0.32, -0.35]}>
        
        {/* 1. TRANSPARENT ENCLOSURE COVER LID */}
        <mesh 
          ref={lidRef} 
          position={[0, 0.11, 0]} 
          castShadow
          onPointerOver={handlePointerOverScreen}
          onPointerOut={handlePointerOutScreen}
          onClick={handleClickScreen}
        >
          <boxGeometry args={[0.55, 0.02, 0.35]} />
          <meshPhysicalMaterial
            ref={lidMatRef}
            color="#0891b2"
            roughness={0.1}
            metalness={0.1}
            transmission={0.85}
            thickness={0.03}
            clearcoat={1.0}
            depthWrite={false}
          />
        </mesh>

        {/* 2. MAIN ENCLOSURE BASE */}
        <mesh 
          name="enclosure-mesh"
          castShadow 
          receiveShadow
          onPointerOver={handlePointerOverBox}
          onPointerOut={handlePointerOutBox}
          onClick={handleClickBox}
        >
          <boxGeometry args={[0.55, 0.20, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* TFT Screen on front face */}
        <group 
          position={[0.12, 0.0, 0.176]}
          onPointerOver={handlePointerOverScreen}
          onPointerOut={handlePointerOutScreen}
          onClick={handleClickScreen}
        >
          <mesh name="tft-screen-bezel" castShadow>
            <boxGeometry args={[0.24, 0.16, 0.008]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.22, 0.14]} />
            <meshStandardMaterial
              map={textureRef.current || undefined}
              roughness={0.1}
              emissive="#ffffff"
              emissiveIntensity={metrics.esp32Online ? 0.95 : 0.0}
            />
          </mesh>
        </group>

        {/* 3. INTERNAL PCB & ELECTRONIC MODULES */}
        <group position={[-0.10, -0.02, 0]}>
          {/* Main PCB Green/Black Board */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.28, 0.008, 0.28]} />
            <meshStandardMaterial color="#064e3b" roughness={0.4} metalness={0.2} />
          </mesh>

          {/* ESP32-S3 Microcontroller Module */}
          <group position={[-0.06, 0.015, -0.04]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.006, 0.11]} />
              <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
            </mesh>
            {/* ESP32 Metal RF Shielding Can */}
            <mesh position={[0, 0.004, -0.015]} castShadow>
              <boxGeometry args={[0.06, 0.006, 0.06]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>

          {/* Dual-Channel Relay Module */}
          <group position={[0.06, 0.02, -0.04]}>
            {[-0.02, 0.02].map((xVal, i) => (
              <mesh key={i} position={[xVal, 0.014, 0]} castShadow>
                <boxGeometry args={[0.03, 0.024, 0.04]} />
                <meshStandardMaterial color="#0284c7" roughness={0.4} />
              </mesh>
            ))}
            <mesh castShadow position={[0, 0.001, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.10]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>

          {/* MOSFET Driver Module */}
          <group position={[0.06, 0.02, 0.07]}>
            <mesh castShadow>
              <boxGeometry args={[0.07, 0.008, 0.08]} />
              <meshStandardMaterial color="#09090b" roughness={0.6} />
            </mesh>
            <mesh position={[-0.012, 0.014, 0]} castShadow>
              <boxGeometry args={[0.018, 0.018, 0.05]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
            </mesh>
          </group>

          {/* Diagnostic LEDs on PCB */}
          <mesh ref={powerLedRef} position={[-0.10, 0.014, 0.10]}>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
          </mesh>
          <mesh ref={statusLedRef} position={[-0.07, 0.014, 0.10]}>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Cable Gland Connectors on Right Side */}
        {[-0.06, 0.06].map((zVal, i) => (
          <group key={i} position={[0.28, -0.02, zVal]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.025, 8]} />
              <meshStandardMaterial color="#09090b" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
