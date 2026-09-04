'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const ESP32Box = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset, tanksOnly, filterView } = useSystemState();
  
  const groupRef = useRef<THREE.Group>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const statusLedRef = useRef<THREE.Mesh>(null);
  const powerLedRef = useRef<THREE.Mesh>(null);

  const [hoveredBox, setHoveredBox] = useState(false);
  const [hoveredScreen, setHoveredScreen] = useState(false);

  // Dynamic 1.8" TFT Display canvas rendering with v2.0 telemetry
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#050c1e';
      ctx.fillRect(0, 0, 128, 128);

      // Top Status Bar
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 128, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('LEVIATHAN v2.0', 4, 11);

      // Dev Credit
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('DEV: PARAMESHWARAN S', 4, 26);

      // Core Live Telemetry Lines
      ctx.fillStyle = '#f8fafc';
      ctx.font = '8px monospace';
      ctx.fillText(`FLOW : ${metrics.flowRate.toFixed(1)} L/M`, 6, 38);
      ctx.fillText(`TDS  : ${metrics.tds} PPM`, 6, 49);
      ctx.fillText(`TURB : ${metrics.turbidity.toFixed(1)} NTU`, 6, 60);
      ctx.fillText(`pH   : ${metrics.ph.toFixed(2)}`, 6, 71);
      ctx.fillText(`SOLAR: ${metrics.solarWatts.toFixed(0)}W`, 6, 82);
      ctx.fillText(`BATT : ${Math.round(metrics.batteryPercent)}% [${(metrics.pumpRailVoltage || 24).toFixed(0)}V]`, 6, 93);
      
      if ((metrics.hydroWatts || 0) > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`HYDRO: +${(metrics.hydroWatts || 0).toFixed(0)}W GEN`, 6, 104);
      } else {
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`RAIL : 5V/3.3V OK`, 6, 104);
      }

      // Quality Badge Bottom Strip
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
    const targetY = exploded ? 0.35 : 0;
    const damp = 1.0 - Math.exp(-6 * delta);

    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, damp);
      const targetScale = hoveredBox || hoveredScreen ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
    }

    if (statusLedRef.current) {
      const mat = statusLedRef.current.material as THREE.MeshStandardMaterial;
      if (metrics.esp32Online) {
        const pulse = Math.sin(time * 6) > 0 ? 2.5 : 0.2;
        mat.emissiveIntensity = pulse;
      } else {
        mat.emissiveIntensity = 0;
      }
    }

    const isDimmed = tanksOnly || filterView || (activeHotspot !== null && activeHotspot !== 'esp32' && activeHotspot !== 'tft_display');
    const targetOpacity = isDimmed ? 0.08 : 1.0;

    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = isDimmed;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);
    }
  });

  return (
    <group 
      ref={groupRef}
      position={[-0.70, 0.40, 0.42]}
      onClick={(e) => {
        e.stopPropagation();
        setActiveHotspot('esp32');
        setCameraPreset('ESP32');
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredBox(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHoveredBox(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          FRONT MIDDLE DECK (TOP 2) - ESP32-S3 WITH GLOWING OUTLINE
          ════════════════════════════════════════════════════════════════════ */}
      {/* Main ABS Flame-Retardant Electronics Enclosure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.26, 0.22]} />
        <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Glowing Neon Outline Border */}
      <mesh>
        <boxGeometry args={[0.546, 0.266, 0.224]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.45} />
      </mesh>

      {/* ─── 1.8-INCH TFT DISPLAY ─── */}
      <group position={[-0.10, 0.02, 0.112]}>
        {/* Bezel Ring */}
        <mesh castShadow>
          <boxGeometry args={[0.20, 0.20, 0.012]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Dynamic TFT Screen with Live Canvas Texture */}
        {textureRef.current && (
          <mesh position={[0, 0, 0.007]}>
            <planeGeometry args={[0.17, 0.17]} />
            <meshBasicMaterial map={textureRef.current} />
          </mesh>
        )}
      </group>

      {/* ─── 16-CHANNEL CAPACITIVE TOUCH SENSOR STRIP ─── */}
      <group position={[0.12, 0.02, 0.112]}>
        {/* Strip PCB Backplate */}
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.19, 0.008]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* 16 Gold-plated Touch Pads (4x4 Grid) */}
        {[-0.06, -0.02, 0.02, 0.06].map((tx, row) =>
          [-0.06, -0.02, 0.02, 0.06].map((ty, col) => (
            <mesh key={`pad-${row}-${col}`} position={[tx, ty, 0.005]}>
              <boxGeometry args={[0.026, 0.026, 0.002]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.9} />
            </mesh>
          ))
        )}
      </group>

      {/* Microcontroller Identification Plaque */}
      <mesh position={[0, -0.10, 0.112]}>
        <boxGeometry args={[0.42, 0.03, 0.002]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Status LEDs on Top Edge */}
      {/* Power LED (Solid Emerald) */}
      <mesh ref={powerLedRef} position={[-0.20, 0.10, 0.112]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.5} />
      </mesh>

      {/* Wi-Fi / ESP-NOW Pulse LED (Pulsing Cyan) */}
      <mesh ref={statusLedRef} position={[-0.16, 0.10, 0.112]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.0} />
      </mesh>

      {/* External Wi-Fi / ESP-NOW High-Gain Whip Antenna */}
      <group position={[0.24, 0.13, 0]} rotation={[0, 0, -0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.22, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.11, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 12]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Bottom Terminal Barrier Blocks */}
      {[-0.18, -0.06, 0.06, 0.18].map((bx, i) => (
        <mesh key={i} position={[bx, -0.13, 0]} castShadow>
          <boxGeometry args={[0.09, 0.02, 0.05]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
};
