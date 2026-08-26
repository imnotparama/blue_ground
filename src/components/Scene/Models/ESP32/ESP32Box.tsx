'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const ESP32Box = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset, tanksOnly } = useSystemState();
  
  const groupRef = useRef<THREE.Group>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const statusLedRef = useRef<THREE.Mesh>(null);
  const powerLedRef = useRef<THREE.Mesh>(null);

  const [hoveredBox, setHoveredBox] = useState(false);
  const [hoveredScreen, setHoveredScreen] = useState(false);

  // Dynamic 1.8 TFT Display canvas rendering
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#050c1e';
      ctx.fillRect(0, 0, 128, 128);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 128, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('LEVIATHAN IoT', 4, 11);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '8px monospace';
      ctx.fillText(`FLOW : ${metrics.flowRate.toFixed(1)} L/M`, 6, 36);
      ctx.fillText(`TDS  : ${metrics.tds} PPM`, 6, 49);
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

  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
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

    if (groupRef.current) {
      const targetY = exploded ? 0.35 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, damp);

      const targetScale = (hoveredBox || hoveredScreen) ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
    }

    if (statusLedRef.current) {
      const mat = statusLedRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const isBlinking = metrics.esp32Online && Math.sin(time * 8) > 0;
        mat.emissiveIntensity = isBlinking ? 2.5 : 0.2;
      }
    }

    const isDimmed = tanksOnly || (activeHotspot !== null && activeHotspot !== 'esp32' && activeHotspot !== 'display');
    const targetOpacity = isDimmed ? 0.08 : 1.0;

    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = isDimmed;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);

      if (mat.emissive && mat !== powerLedRef.current?.material && mat !== statusLedRef.current?.material) {
        if ((hoveredBox || hoveredScreen) && !isDimmed) {
          mat.emissive.set('#06b6d4');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.4, damp);
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, damp);
        }
      }
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
        
        {/* Main IP65 Industrial Polycarbonate Enclosure Box */}
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
          {/* Protective Acrylic Glass Lens */}
          <mesh position={[0, 0, 0.007]}>
            <planeGeometry args={[0.245, 0.185]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} transmission={0.95} roughness={0.02} />
          </mesh>
        </group>

        {/* Tactile Pushbutton Switches on Front-Right */}
        <group position={[0.10, 0.0, 0.192]}>
          {[-0.04, 0.04].map((by, bIdx) => (
            <group key={bIdx} position={[0, by, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.008, 12]} />
                <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.5} />
              </mesh>
              <mesh position={[0, 0, 0.005]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.006, 12]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Diagnostic LEDs on Front-Right */}
        <group position={[0.24, 0, 0.192]}>
          <mesh ref={powerLedRef} position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
          </mesh>
          <mesh ref={statusLedRef} position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Bottom Screw Terminal Header Block (for sensor probe wires) */}
        <group position={[0, -0.14, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.02, 0.08]} />
            <meshStandardMaterial color="#15803d" roughness={0.4} />
          </mesh>
          {/* Individual screw terminals */}
          {[-0.18, -0.12, -0.06, 0, 0.06, 0.12, 0.18].map((tx, idx) => (
            <mesh key={idx} position={[tx, -0.01, 0.02]} castShadow>
              <cylinderGeometry args={[0.004, 0.004, 0.01, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
