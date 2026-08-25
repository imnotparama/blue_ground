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
  
  // Ref to screen canvas and texture
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  // Lid animation ref
  const lidRef = useRef<THREE.Mesh>(null);
  const lidMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Diagnostic board LEDs
  const powerLedRef = useRef<THREE.Mesh>(null);
  const statusLedRef = useRef<THREE.Mesh>(null);

  // Redraw TFT screen canvas metrics
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
      ctx.fillText('LEVIATHAN CORE', 6, 13);
      
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
    // 1. Exploded view offset
    const targetX = exploded ? 0.6 : 0;
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);

      const isHovered = hoveredBox || hoveredScreen;
      const targetScale = isHovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Open enclosure lid when exploded or focused
    const isLidOpen = exploded || activeHotspot === 'esp32';
    const targetLidZ = isLidOpen ? -0.32 : 0.0;
    const targetLidOpacity = isLidOpen ? 0.2 : 0.4;
    
    if (lidRef.current) {
      lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, targetLidZ, 0.08);
    }
    if (lidMatRef.current) {
      lidMatRef.current.opacity = THREE.MathUtils.lerp(lidMatRef.current.opacity, targetLidOpacity, 0.08);
      lidMatRef.current.transparent = true;
    }

    // 3. Status LEDs Blinking
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

    // 4. Focus dimming
    const isDimmed = activeHotspot !== null && activeHotspot !== 'esp32' && activeHotspot !== 'display';
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child === powerLedRef.current || child === statusLedRef.current || child === lidRef.current) return;

          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            if (mat.emissive) {
              const isHoveredPart = (child.name === 'tft-screen-bezel' && hoveredScreen) || (child.name === 'enclosure-mesh' && hoveredBox);
              if (isHoveredPart && !isDimmed) {
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
      {/* ESP32 Control Box — on top shelf of primary tank, rear */}
      {/* Primary tank top y = +0.25, ESP32 sits at y=0.35 */}
      <group position={[-2.2, 0.35, -0.50]}>
        
        {/* 1. TRANSPARENT ENCLOSURE COVER LID */}
        <mesh 
          ref={lidRef} 
          position={[0, 0, 0.252]} 
          castShadow
          onPointerOver={handlePointerOverScreen}
          onPointerOut={handlePointerOutScreen}
          onClick={handleClickScreen}
        >
          <boxGeometry args={[0.71, 0.23, 0.015]} />
          <meshPhysicalMaterial
            ref={lidMatRef}
            color="#0891b2" // translucent cyan cover
            roughness={0.1}
            metalness={0.1}
            transmission={0.85}
            thickness={0.02}
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
          <boxGeometry args={[0.7, 0.22, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.6} />
        </mesh>

        {/* TFT Screen on front face (slightly recessed in the base box lid frame) */}
        <group 
          position={[0.18, 0.0, 0.251]}
          onPointerOver={handlePointerOverScreen}
          onPointerOut={handlePointerOutScreen}
          onClick={handleClickScreen}
        >
          <mesh name="tft-screen-bezel" castShadow>
            <boxGeometry args={[0.26, 0.18, 0.01]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.006]}>
            <planeGeometry args={[0.23, 0.15]} />
            <meshStandardMaterial
              map={textureRef.current || undefined}
              roughness={0.1}
              emissive="#ffffff"
              emissiveIntensity={metrics.esp32Online ? 0.9 : 0.0}
            />
          </mesh>
        </group>

        {/* 3. ELECTRONICS PCB BOARD & MODULES LAYOUT (Inside box) */}
        <group position={[0, -0.04, 0]}>
          
          {/* Main PCB Fiberglass Board (Green) */}
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.62, 0.01, 0.42]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} />
          </mesh>

          {/* Module 1: ESP32-S3 Board */}
          <group position={[-0.18, 0.02, -0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.012, 0.12]} />
              <meshStandardMaterial color="#18181b" roughness={0.6} />
            </mesh>
            {/* Esp32 Silver RF shielding lid */}
            <mesh position={[0, 0.008, 0.01]} castShadow>
              <boxGeometry args={[0.045, 0.008, 0.05]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.9} />
            </mesh>
            {/* Gold Pin Headers */}
            {[-0.038, 0.038].map((xOffset, i) => (
              <mesh key={i} position={[xOffset, -0.006, 0]} castShadow>
                <boxGeometry args={[0.003, 0.018, 0.11]} />
                <meshStandardMaterial color="#eab308" metalness={0.9} />
              </mesh>
            ))}
          </group>

          {/* Module 2: XL6019E1 Boost Converter Module */}
          <group position={[-0.18, 0.02, 0.1]}>
            {/* Blue PCB */}
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.01, 0.13]} />
              <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
            </mesh>
            {/* Copper wire wound Toroidal Inductor Coil */}
            <mesh position={[-0.015, 0.014, 0.025]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.015, 12]} />
              <meshStandardMaterial color="#b45309" roughness={0.15} metalness={0.9} />
            </mesh>
            {/* Gold trimmer screw head potentiometer */}
            <mesh position={[0.028, 0.012, -0.035]} castShadow>
              <boxGeometry args={[0.014, 0.015, 0.014]} />
              <meshStandardMaterial color="#3f3f46" roughness={0.3} />
            </mesh>
            <mesh position={[0.028, 0.021, -0.035]} castShadow>
              <cylinderGeometry args={[0.004, 0.004, 0.006, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
          </group>

          {/* Module 3: Dual-Channel Relay Module */}
          <group position={[0.12, 0.02, -0.11]}>
            {/* Blue Relay Cubes */}
            {[-0.025, 0.025].map((xVal, i) => (
              <mesh key={i} position={[xVal, 0.014, 0]} castShadow>
                <boxGeometry args={[0.036, 0.024, 0.045]} />
                <meshStandardMaterial color="#0284c7" roughness={0.4} />
              </mesh>
            ))}
            {/* PCB */}
            <mesh castShadow position={[0, 0.001, 0]}>
              <boxGeometry args={[0.09, 0.008, 0.12]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>

          {/* Module 4: MOSFET Driver Module (for controlling pumps speed) */}
          <group position={[0.12, 0.02, 0.08]}>
            {/* Black PCB */}
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.01, 0.11]} />
              <meshStandardMaterial color="#09090b" roughness={0.6} />
            </mesh>
            {/* Aluminum Heatsink fins */}
            <mesh position={[-0.015, 0.016, 0]} castShadow>
              <boxGeometry args={[0.02, 0.02, 0.06]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
            </mesh>
            {/* Terminal blocks */}
            <mesh position={[0.025, 0.012, 0]} castShadow>
              <boxGeometry args={[0.018, 0.018, 0.075]} />
              <meshStandardMaterial color="#047857" roughness={0.4} />
            </mesh>
          </group>

          {/* Diagnostic LEDs on main board */}
          <mesh ref={powerLedRef} position={[-0.27, 0.018, 0.16]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
          </mesh>
          <mesh ref={statusLedRef} position={[-0.24, 0.018, 0.16]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
          </mesh>

          {/* Multi-color connecting jumper wires */}
          <group position={[0.0, 0.015, 0.0]}>
            {[0.0, 0.05, 0.1].map((offset, idx) => (
              <mesh key={idx} position={[-0.05, 0.002, offset]} rotation={[0, 0, Math.PI/2]} castShadow>
                <cylinderGeometry args={[0.003, 0.003, 0.16, 6]} />
                <meshStandardMaterial 
                  color={idx === 0 ? '#ef4444' : idx === 1 ? '#3b82f6' : '#eab308'} 
                  roughness={0.6} 
                />
              </mesh>
            ))}
          </group>

        </group>

        {/* 4. SIDE CABLE GLANDS & HARNESSES */}
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

      </group>
    </group>
  );
};
