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
      flowRotorRef.current.rotation.z += metrics.flowRate * 0.18;
    }
    if (floatRingRef.current) {
      // Float ring tracks clean reservoir water level surface
      const targetY = -0.65 + Math.max(metrics.waterLevel / 100, 0.08) * 0.60;
      floatRingRef.current.position.y = THREE.MathUtils.lerp(floatRingRef.current.position.y, targetY, 0.08);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ══════════════════════════════════════════════════════════════════════
          GROUP A: PRIMARY WATER QUALITY SENSOR SUITE (Secondary Tank Bridge at y = 0.58)
          Probes securely seated in stainless bridge collars, dipped into raw water
          ══════════════════════════════════════════════════════════════════════ */}

      {/* 1. pH SENSOR PROBE (Secondary Tank Bridge, Collar 1) */}
      <InteractiveSensor id="ph_sensor" preset="PH_SENSOR" position={[0.23, 0.58, 0.20]} label="pH Probe">
        {/* Stainless Threaded Cable Gland Collar */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.020, 0.04, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Shielded Probe Stem reaching down into Secondary Tank water */}
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.010, 0.010, 0.20, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Sensitive Glass Bulb Tip (Submerged in raw water) */}
        <mesh position={[0, -0.21, 0]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.85} roughness={0.1} clearcoat={1.0} />
        </mesh>
        {/* Top Signal Cable with Strain Relief Boot */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.005, 0.007, 0.03, 12]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} />
        </mesh>
      </InteractiveSensor>

      {/* 2. TURBIDITY SENSOR (Secondary Tank Bridge, Collar 2) */}
      <InteractiveSensor id="turbidity_sensor" preset="TURBIDITY_SENSOR" position={[0.42, 0.58, 0.20]} label="Turbidity">
        {/* Top Flanged Electronic Header Box */}
        <mesh position={[0, 0.028, 0]} castShadow>
          <boxGeometry args={[0.034, 0.042, 0.034]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Optical Shroud Tube extending into Secondary Tank water */}
        <mesh position={[0, -0.09, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.19, 16]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Infrared Emitter / Photodiode Optical Slot */}
        <mesh position={[0, -0.19, 0]}>
          <boxGeometry args={[0.010, 0.016, 0.018]} />
          <meshStandardMaterial color="#0e7490" roughness={0.3} />
        </mesh>
      </InteractiveSensor>

      {/* 3. TDS / EC SENSOR (Secondary Tank Bridge, Collar 3) */}
      <InteractiveSensor id="tds_sensor" preset="TDS_SENSOR" position={[0.62, 0.58, 0.20]} label="TDS/EC">
        {/* Industrial Waterproof Hex Collar */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.04, 6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Insulating Probe Body */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.17, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        {/* Dual Titanium Pin Electrodes (Submerged in raw water) */}
        {[-0.004, 0.004].map((tx, idx) => (
          <mesh key={idx} position={[tx, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.002, 0.002, 0.035, 8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.98} />
          </mesh>
        ))}
      </InteractiveSensor>

      {/* 4. DS18B20 TEMPERATURE SENSOR (Secondary Tank Bridge, Collar 4) */}
      <InteractiveSensor id="temp_sensor" preset="TEMP_SENSOR" position={[0.80, 0.58, 0.20]} label="DS18B20">
        {/* Frame Cable Gland */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.035, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Waterproof Heat-Shrink Sleeve */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.12, 12]} />
          <meshStandardMaterial color="#2563eb" roughness={0.5} />
        </mesh>
        {/* Stainless Steel Thermowell Capsule (Submerged in raw water) */}
        <mesh position={[0, -0.17, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.10, 12]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.95} />
        </mesh>
      </InteractiveSensor>

      {/* ══════════════════════════════════════════════════════════════════════
          GROUP B: PRIMARY CLEAN POTABLE RESERVOIR & PIPE SENSORS
          ══════════════════════════════════════════════════════════════════════ */}

      {/* 5. WATER LEVEL FLOAT SWITCH (Clamped to Clean Reservoir Top Rim) */}
      <InteractiveSensor id="float_sensor" preset="FLOAT_SENSOR" position={[-1.10, 0.60, 0]} label="Float Switch">
        {/* Frame Mounting Bracket Clamp */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.045, 0.03, 0.045]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Vertical Stainless Steel Guide Rod dropping into clean reservoir */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.70, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
        </mesh>
        {/* Toroidal Magnetic Float Ring (Rides on clean water surface) */}
        <mesh ref={floatRingRef} position={[0, -0.20, 0]}>
          <torusGeometry args={[0.020, 0.009, 16, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Laser Etched Travel Stops */}
        <mesh position={[0, -0.68, 0]}>
          <cylinderGeometry args={[0.010, 0.010, 0.015, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
        </mesh>
      </InteractiveSensor>

      {/* 6. INLINE YF-S201 FLOW SENSOR (Plumbed directly on intake transfer pipe) */}
      <InteractiveSensor id="flow_sensor" preset="FLOW_SENSOR" position={[1.35, 0.30, 0]} label="YF-S201">
        {/* Brass Threaded Coupling Unions */}
        {[-0.045, 0.045].map((ux, uIdx) => (
          <mesh key={uIdx} position={[ux, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.02, 12]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.25} metalness={0.85} />
          </mesh>
        ))}
        {/* Main Flow Sensor Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.040, 0.040, 0.07, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Spinning Internal Turbine Rotor */}
        <mesh ref={flowRotorRef} position={[0, 0, 0]}>
          <boxGeometry args={[0.030, 0.004, 0.030]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Top Hall Effect Sensor Telemetry Cap */}
        <mesh position={[0, 0.042, 0]} castShadow>
          <boxGeometry args={[0.032, 0.020, 0.032]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} />
        </mesh>
      </InteractiveSensor>

      {/* ══════════════════════════════════════════════════════════════════════
          GROUP C: QUALITY VERIFICATION CHAMBER SENSORS (Tank 2 at x = -1.85)
          Post-Filtration Verification Probes
          ══════════════════════════════════════════════════════════════════════ */}
      {/* TDS #2 Verifier on Tank 2 Lid */}
      <InteractiveSensor id="tds2_sensor" preset="TANK2_VERIFICATION" position={[-1.85, 0.41, 0.15]} label="TDS #2">
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.035, 6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.06, 0]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.14, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        {[-0.003, 0.003].map((tx, idx) => (
          <mesh key={idx} position={[tx, -0.14, 0]} castShadow>
            <cylinderGeometry args={[0.002, 0.002, 0.03, 8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.98} />
          </mesh>
        ))}
      </InteractiveSensor>

      {/* pH #2 Verifier on Tank 2 Lid */}
      <InteractiveSensor id="ph2_sensor" preset="TANK2_VERIFICATION" position={[-1.73, 0.41, 0.10]} label="pH #2">
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.035, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.15, 12]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <sphereGeometry args={[0.010, 16, 16]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.85} roughness={0.1} clearcoat={1.0} />
        </mesh>
      </InteractiveSensor>

      {/* ══════════════════════════════════════════════════════════════════════
          GROUP D: SOLAR & ELECTRICAL TELEMETRY SENSORS
          Mounted firmly on the solar array and controller chassis
          ══════════════════════════════════════════════════════════════════════ */}

      {/* 7. BH1750 AMBIENT LIGHT SENSOR (Mounted on Solar Panel Frame) */}
      <InteractiveSensor id="solar" preset="SOLAR" position={[0.25, 1.25, 0.15]} label="BH1750">
        {/* Mounting Angle Bracket */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.008, 0.04]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* I2C PCB Module */}
        <mesh position={[0, 0.008, 0]} castShadow>
          <boxGeometry args={[0.032, 0.008, 0.032]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
        </mesh>
        {/* Hemispherical Translucent Optical Dome (Pointed skyward) */}
        <mesh position={[0, 0.016, 0]}>
          <sphereGeometry args={[0.011, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.9} roughness={0.2} />
        </mesh>
      </InteractiveSensor>

      {/* 8. 0–25V VOLTAGE SENSOR (Mounted on Control Chassis DIN Rail) */}
      <InteractiveSensor id="battery" preset="BATTERY" position={[0.42, 0.78, 0.23]} label="0-25V Sen">
        {/* DIN Rail Mounting Clip */}
        <mesh position={[0, 0, -0.01]} castShadow>
          <boxGeometry args={[0.038, 0.038, 0.008]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Blue PCB */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.034, 0.034, 0.008]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
        </mesh>
        {/* Blue 2-Pin Screw Terminal Block */}
        <mesh position={[0, 0.012, 0.012]} castShadow>
          <boxGeometry args={[0.024, 0.016, 0.016]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
        </mesh>
      </InteractiveSensor>

      {/* 9. ACS712 CURRENT SENSOR (Mounted on Control Chassis DIN Rail) */}
      <InteractiveSensor id="battery_pack" preset="BATTERY" position={[0.42, 0.70, 0.23]} label="ACS712">
        {/* DIN Rail Mounting Clip */}
        <mesh position={[0, 0, -0.01]} castShadow>
          <boxGeometry args={[0.038, 0.038, 0.008]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Green PCB */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.036, 0.036, 0.008]} />
          <meshStandardMaterial color="#15803d" roughness={0.4} />
        </mesh>
        {/* Heavy-Duty Copper Screw Terminal */}
        <mesh position={[0, 0.012, 0.012]} castShadow>
          <boxGeometry args={[0.026, 0.016, 0.016]} />
          <meshStandardMaterial color="#16a34a" roughness={0.3} />
        </mesh>
      </InteractiveSensor>

      {/* ══════════════════════════════════════════════════════════════════════
          SENSOR CABLE LOOMS: Clean industrial black conduit routing to ESP32
          ══════════════════════════════════════════════════════════════════════ */}
      {/* Verification Chamber Sensor Wire Loom running across top rail */}
      <mesh position={[-1.35, 0.61, 0]}>
        <boxGeometry args={[1.05, 0.006, 0.006]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} />
      </mesh>
      {/* Clean Tank Sensor Wire Loom running across front frame */}
      <mesh position={[-0.30, 0.61, 0]}>
        <boxGeometry args={[1.10, 0.006, 0.006]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} />
      </mesh>
    </group>
  );
};
