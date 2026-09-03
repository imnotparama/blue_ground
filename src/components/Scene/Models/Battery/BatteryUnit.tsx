'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const BatteryUnit = () => {
  const { exploded, metrics, activeHotspot, setActiveHotspot, setCameraPreset, tanksOnly } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const ledRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;
    const mats: THREE.MeshStandardMaterial[] = [];
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material && !ledRefs.current.includes(child.material as any)) {
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
      const targetScale = hovered ? 1.03 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
    }

    const activeLedsCount = Math.ceil((metrics.batteryPercent / 100) * 5);
    ledRefs.current.forEach((mat, idx) => {
      if (mat) {
        const isActive = idx < activeLedsCount;
        let ledColor = '#10b981';
        if (metrics.batteryPercent < 20) ledColor = '#ef4444';
        else if (metrics.batteryPercent < 50) ledColor = '#f59e0b';

        if (isActive) {
          mat.color.set(ledColor);
          mat.emissive.set(ledColor);
          mat.emissiveIntensity = 2.0;
        } else {
          mat.color.set('#27272a');
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0.0;
        }
      }
    });

    const isDimmed = tanksOnly || (activeHotspot !== null && activeHotspot !== 'battery' && activeHotspot !== 'battery_pack');
    const targetOpacity = isDimmed ? 0.08 : 1.0;

    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = isDimmed;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);
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
    setActiveHotspot('battery');
    setCameraPreset('BATTERY');
  };

  // Power Health Color
  const pwrColor = metrics.batteryPercent < 20 ? '#ef4444' : metrics.batteryPercent < 50 ? '#f59e0b' : '#10b981';

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* ════════════════════════════════════════════════════════════════════
          POWER SUBSYSTEM VISUALIZATION SLICE (Side Platform at x = -1.65, y = 0.55)
          Solar Input + Battery Bank (1S5P) + DC-DC Boost & Buck Rails
          ════════════════════════════════════════════════════════════════════ */}
      <group position={[-1.65, 0.55, 0]}>
        
        {/* Transparent Polycarbonate Electronics Shelf */}
        <mesh position={[0, -0.16, 0]} receiveShadow>
          <boxGeometry args={[0.85, 0.02, 0.46]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* ─── 1. BATTERY BANK (1S5P Li-ion Pack) ─── */}
        <group position={[-0.14, 0, 0]}>
          {/* Transparent Acrylic Protective Battery Enclosure */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.42, 0.22, 0.32]} />
            <meshPhysicalMaterial 
              color="#0f172a" 
              transparent 
              opacity={0.45} 
              roughness={0.15} 
              metalness={0.4} 
            />
          </mesh>

          {/* 5 x Li-ion 18650/21700 Cylindrical Cells in Parallel (1S5P) */}
          {[-0.14, -0.07, 0, 0.07, 0.14].map((cx, idx) => (
            <group key={idx} position={[cx, -0.02, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.024, 0.024, 0.14, 20]} />
                <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
              </mesh>
              {/* Positive Top Terminal Cap */}
              <mesh position={[0, 0.074, 0]} castShadow>
                <cylinderGeometry args={[0.009, 0.009, 0.008, 12]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.95} />
              </mesh>
            </group>
          ))}

          {/* Top Nickel Busbar Interconnects */}
          <mesh position={[0, 0.065, 0]}>
            <boxGeometry args={[0.34, 0.004, 0.03]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
          </mesh>

          {/* 1S BMS Protection Board on End */}
          <mesh position={[0, 0.02, 0.14]}>
            <boxGeometry args={[0.32, 0.05, 0.008]} />
            <meshStandardMaterial color="#15803d" roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Battery Bank 1S5P Identification Plaque */}
          <mesh position={[0, -0.07, 0.162]}>
            <boxGeometry args={[0.26, 0.04, 0.004]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>

          {/* 5-LED State of Charge Bar */}
          <group position={[-0.08, 0.07, 0.162]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[i * 0.04, 0, 0]}>
                <boxGeometry args={[0.025, 0.012, 0.004]} />
                <meshStandardMaterial 
                  ref={(el) => { if (el) ledRefs.current[i] = el; }}
                  color="#10b981" 
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* ─── 2. DC-DC STEP-UP BOOST CONVERTER (XL6009 / XL6019: Boost to 24V Pump Rail) ─── */}
        <group position={[0.24, 0.05, 0.09]}>
          {/* Blue PCB */}
          <mesh castShadow>
            <boxGeometry args={[0.20, 0.025, 0.12]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
          </mesh>
          {/* Toroidal High-Current Inductor Coil */}
          <mesh position={[-0.04, 0.022, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.022, 0.009, 12, 24]} />
            <meshStandardMaterial color="#b45309" roughness={0.25} metalness={0.8} />
          </mesh>
          {/* Trimmer Potentiometer (Blue Box with Brass Screw) */}
          <mesh position={[0.04, 0.022, 0.02]} castShadow>
            <boxGeometry args={[0.025, 0.025, 0.025]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          {/* 24V Rail Indicator LED */}
          <mesh position={[0.06, 0.02, -0.03]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* ─── 3. DC-DC STEP-DOWN BUCK CONVERTER (LM2596 / XL4015: Buck to 5V Logic Rail) ─── */}
        <group position={[0.24, 0.05, -0.09]}>
          {/* Blue/Red PCB */}
          <mesh castShadow>
            <boxGeometry args={[0.20, 0.025, 0.12]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.4} />
          </mesh>
          {/* Ferrite Core Shielded Inductor */}
          <mesh position={[-0.04, 0.022, 0]} castShadow>
            <boxGeometry args={[0.035, 0.03, 0.035]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* 5V Rail Indicator LED */}
          <mesh position={[0.06, 0.02, -0.03]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* ─── 4. GLOWING POWER CONDUIT LINES ─── */}
        {/* 24V Heavy Line down to main pump */}
        <mesh position={[0.24, -0.22, 0.09]}>
          <cylinderGeometry args={[0.006, 0.006, 0.28, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
        </mesh>

        {/* 5V & 3.3V Logic Rail over to ESP32 */}
        <mesh position={[0.40, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.25, 8]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.2} />
        </mesh>

        {/* Solar Input Cable coming from roof */}
        <mesh position={[-0.32, 0.16, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.32, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>

        {/* Power Status Ambient Glow */}
        <pointLight position={[0, 0.12, 0]} color={pwrColor} intensity={1.4} distance={1.2} />
      </group>
    </group>
  );
};
