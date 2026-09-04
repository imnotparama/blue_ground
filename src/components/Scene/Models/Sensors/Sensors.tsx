'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Interactive Sensor Wrapper ────────────────────────────────────────────────
interface InteractiveSensorProps {
  id: string;
  preset: CameraPreset;
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  children: React.ReactNode;
}

const InteractiveSensor: React.FC<InteractiveSensorProps> = ({
  id, preset, position, rotation = [0, 0, 0], label, children,
}) => {
  const { setActiveHotspot, setCameraPreset, activeHotspot, tanksOnly, filterView } = useSystemState();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const isActive = activeHotspot === id;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isDimmed = tanksOnly || filterView || (activeHotspot !== null && activeHotspot !== id);
    const damp = 1.0 - Math.exp(-8 * delta);
    const targetScale = hovered ? 1.08 : 1.0;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); setActiveHotspot(id); setCameraPreset(preset); }}
    >
      {(hovered || isActive) && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 16, 1, true]} />
          <meshBasicMaterial
            color={isActive ? '#22d3ee' : '#38bdf8'}
            wireframe transparent opacity={0.4}
          />
        </mesh>
      )}
      {children}
      {/* Label Base Plate */}
      <mesh position={[0, -0.06, 0.035]} castShadow>
        <boxGeometry args={[0.07, 0.016, 0.004]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
    </group>
  );
};

export const Sensors = () => {
  const { exploded, metrics } = useSystemState();
  const flowRotorRef = useRef<THREE.Mesh>(null);
  const floatRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (flowRotorRef.current && metrics.flowRate > 0) {
      flowRotorRef.current.rotation.z += metrics.flowRate * 0.15;
    }
    if (floatRingRef.current) {
      const targetY = (metrics.waterLevel / 100) * 0.12 - 0.06;
      floatRingRef.current.position.y = THREE.MathUtils.lerp(floatRingRef.current.position.y, targetY, 0.08);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ══════════════════════════════════════════════════════════════════════
          FRONT MIDDLE DECK (TOP 2) COMPACT SENSOR ARRAY & GHOSTED TRACERS
          Row of 9 physical prototype sensors with real models & connector lines
          ══════════════════════════════════════════════════════════════════════ */}
      
      {/* Sensor Deck Shelf Bed at x = 0.05, y = 0.28, z = 0.45 */}
      <mesh position={[0.05, 0.22, 0.46]} receiveShadow>
        <boxGeometry args={[1.00, 0.018, 0.18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 1. pH SENSOR PROBE (Glass Bulb & Shielded Probe) */}
      <InteractiveSensor id="ph_sensor" preset="PH_SENSOR" position={[-0.38, 0.28, 0.46]} label="pH Probe">
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.12, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Glass Bulb Tip */}
        <mesh position={[0, -0.03, 0]}>
          <sphereGeometry args={[0.011, 16, 16]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.8} roughness={0.1} clearcoat={1.0} />
        </mesh>
      </InteractiveSensor>

      {/* 2. TURBIDITY SENSOR (Optical Chamber) */}
      <InteractiveSensor id="turbidity_sensor" preset="TURBIDITY_SENSOR" position={[-0.28, 0.28, 0.46]} label="Turbidity">
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.035, 0.06, 0.035]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.055, 0]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.03, 12]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.8} />
        </mesh>
      </InteractiveSensor>

      {/* 3. TDS / EC SENSOR (Dual Titanium Pin Electrode) */}
      <InteractiveSensor id="tds_sensor" preset="TDS_SENSOR" position={[-0.18, 0.28, 0.46]} label="TDS/EC">
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.08, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        {/* Dual Titanium Electrodes */}
        {[-0.005, 0.005].map((tx, idx) => (
          <mesh key={idx} position={[tx, -0.025, 0]} castShadow>
            <cylinderGeometry args={[0.0025, 0.0025, 0.03, 8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>
        ))}
      </InteractiveSensor>

      {/* 4. DS18B20 TEMPERATURE SENSOR (Stainless Steel Capsule) */}
      <InteractiveSensor id="temp_sensor" preset="TEMP_SENSOR" position={[-0.08, 0.28, 0.46]} label="DS18B20">
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.09, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
        </mesh>
        {/* Blue Waterproof Heat-Shrink Sleeve */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.03, 12]} />
          <meshStandardMaterial color="#2563eb" roughness={0.5} />
        </mesh>
      </InteractiveSensor>

      {/* 5. FLOW SENSOR (YF-S401 Inline Micro Turbine) */}
      <InteractiveSensor id="flow_sensor" preset="FLOW_SENSOR" position={[0.02, 0.28, 0.46]} label="YF-S401">
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Internal Turbine Rotor */}
        <mesh ref={flowRotorRef} position={[0, 0.02, 0]}>
          <boxGeometry args={[0.028, 0.004, 0.028]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
      </InteractiveSensor>

      {/* 6. WATER LEVEL FLOAT SWITCH (Vertical Stem & Toroidal Ring) */}
      <InteractiveSensor id="float_sensor" preset="FLOAT_SENSOR" position={[0.12, 0.28, 0.46]} label="Float Switch">
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Toroidal Float Ring */}
        <mesh ref={floatRingRef} position={[0, 0.02, 0]}>
          <torusGeometry args={[0.016, 0.007, 12, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
      </InteractiveSensor>

      {/* 7. BH1750 AMBIENT LIGHT SENSOR (I2C Module with Diffuser) */}
      <InteractiveSensor id="solar" preset="SOLAR" position={[0.22, 0.28, 0.46]} label="BH1750">
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.032, 0.012, 0.032]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
        </mesh>
        {/* Hemispherical Translucent Optical Diffuser */}
        <mesh position={[0, 0.022, 0]}>
          <sphereGeometry args={[0.010, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={0.25} />
        </mesh>
      </InteractiveSensor>

      {/* 8. 0–25V VOLTAGE SENSOR MODULE (Resistive Divider with Blue Terminal) */}
      <InteractiveSensor id="battery" preset="BATTERY" position={[0.32, 0.28, 0.46]} label="0-25V Sen">
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.036, 0.012, 0.036]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
        </mesh>
        {/* Blue 2-Pin Screw Terminal Block */}
        <mesh position={[0, 0.024, -0.008]} castShadow>
          <boxGeometry args={[0.022, 0.018, 0.016]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
        </mesh>
      </InteractiveSensor>

      {/* 9. ACS712 CURRENT SENSOR MODULE (Hall-Effect Module) */}
      <InteractiveSensor id="battery_pack" preset="BATTERY" position={[0.42, 0.28, 0.46]} label="ACS712">
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.038, 0.012, 0.038]} />
          <meshStandardMaterial color="#15803d" roughness={0.4} />
        </mesh>
        {/* SOIC-8 Hall Effect IC & Terminal Block */}
        <mesh position={[0, 0.022, 0.008]} castShadow>
          <boxGeometry args={[0.012, 0.008, 0.016]} />
          <meshStandardMaterial color="#09090b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.024, -0.010]} castShadow>
          <boxGeometry args={[0.026, 0.018, 0.016]} />
          <meshStandardMaterial color="#15803d" roughness={0.3} />
        </mesh>
      </InteractiveSensor>

      {/* ══════════════════════════════════════════════════════════════════════
          GHOSTED TRACER CONDUIT LINES CONNECTING TO PHYSICAL MONITORING POINTS
          ══════════════════════════════════════════════════════════════════════ */}
      {/* Tracer 1: Water Quality (pH, TDS, Turbidity) to Treated Line */}
      <mesh position={[-0.28, 0.15, 0.30]}>
        <boxGeometry args={[0.18, 0.004, 0.32]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Tracer 2: Temperature & Float Switch into Primary Tank */}
      <mesh position={[0.02, 0.05, 0.25]}>
        <boxGeometry args={[0.16, 0.004, 0.40]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Tracer 3: Voltage & Current to 24V/5V Power Bus */}
      <mesh position={[0.35, 0.15, 0.28]}>
        <boxGeometry args={[0.15, 0.004, 0.35]} />
        <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
};
