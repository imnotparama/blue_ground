'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import * as THREE from 'three';

// ─── Interactive Sensor Wrapper ────────────────────────────────────────────────
interface InteractiveSensorProps {
  id: string;
  preset: CameraPreset;
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  liveValue?: string;
  children: React.ReactNode;
}

const InteractiveSensor: React.FC<InteractiveSensorProps> = ({
  id, preset, position, rotation = [0, 0, 0], label, liveValue, children,
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

      {/* Floating In-Situ Telemetry Label */}
      {liveValue && (
        <Html position={[0, 0.16, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center select-none whitespace-nowrap pointer-events-none">
            <div className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all ${
              isActive 
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50'
                : 'bg-zinc-950/85 text-zinc-200 border-white/20'
            }`}>
              <span className="text-[7.5px] text-zinc-400 uppercase tracking-wider">{label}</span>
              <span className="text-cyan-300 font-extrabold">{liveValue}</span>
            </div>
            <div className="w-0.5 h-1.5 bg-cyan-400/70" />
          </div>
        </Html>
      )}

      {/* Label Base Plate */}
      <mesh position={[0, -0.06, 0.035]} castShadow>
        <boxGeometry args={[0.07, 0.016, 0.004]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
    </group>
  );
};

export const Sensors = () => {
  const { exploded, metrics, simState } = useSystemState();
  const flowRotorRef = useRef<THREE.Mesh>(null);
  const floatRingRef = useRef<THREE.Mesh>(null);

  const groupARef = useRef<THREE.Group>(null);
  const ultraRef = useRef<THREE.Group>(null);
  const tank2SensorsRef = useRef<THREE.Group>(null);
  const powerSensorsRef = useRef<THREE.Group>(null);
  const bhRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const damp = 1.0 - Math.exp(-6 * delta);

    if (flowRotorRef.current && metrics.flowRate > 0) {
      flowRotorRef.current.rotation.z += metrics.flowRate * 0.18;
    }
    if (floatRingRef.current) {
      // Float ring tracks clean reservoir water level surface
      const targetY = -0.65 + Math.max(metrics.waterLevel / 100, 0.08) * 0.60;
      floatRingRef.current.position.y = THREE.MathUtils.lerp(floatRingRef.current.position.y, targetY, 0.08);
    }

    if (groupARef.current) {
      const targetY = exploded ? 0.42 : 0;
      groupARef.current.position.y = THREE.MathUtils.lerp(groupARef.current.position.y, targetY, damp);
    }

    if (ultraRef.current) {
      const targetY = exploded ? 0.35 : 0;
      ultraRef.current.position.y = THREE.MathUtils.lerp(ultraRef.current.position.y, targetY, damp);
    }

    if (tank2SensorsRef.current) {
      const targetX = exploded ? -0.10 : 0;
      const targetY = exploded ? 0.55 : 0;
      const targetZ = exploded ? 0.85 : 0;
      tank2SensorsRef.current.position.x = THREE.MathUtils.lerp(tank2SensorsRef.current.position.x, targetX, damp);
      tank2SensorsRef.current.position.y = THREE.MathUtils.lerp(tank2SensorsRef.current.position.y, targetY, damp);
      tank2SensorsRef.current.position.z = THREE.MathUtils.lerp(tank2SensorsRef.current.position.z, targetZ, damp);
    }

    if (powerSensorsRef.current) {
      const targetX = exploded ? -0.85 : 0;
      const targetY = exploded ? 0.95 : 0;
      const targetZ = exploded ? 0.55 : 0;
      powerSensorsRef.current.position.x = THREE.MathUtils.lerp(powerSensorsRef.current.position.x, targetX, damp);
      powerSensorsRef.current.position.y = THREE.MathUtils.lerp(powerSensorsRef.current.position.y, targetY, damp);
      powerSensorsRef.current.position.z = THREE.MathUtils.lerp(powerSensorsRef.current.position.z, targetZ, damp);
    }

    if (bhRef.current) {
      const targetX = exploded ? -0.45 : 0;
      const targetY = exploded ? 1.15 : 0;
      const targetZ = exploded ? -0.45 : 0;
      bhRef.current.position.x = THREE.MathUtils.lerp(bhRef.current.position.x, targetX, damp);
      bhRef.current.position.y = THREE.MathUtils.lerp(bhRef.current.position.y, targetY, damp);
      bhRef.current.position.z = THREE.MathUtils.lerp(bhRef.current.position.z, targetZ, damp);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ══════════════════════════════════════════════════════════════════════
          GROUP A: PRIMARY WATER QUALITY SENSOR SUITE (Secondary Tank Bridge at y = 0.58)
          Probes securely seated in stainless bridge collars, dipped into raw water
          ══════════════════════════════════════════════════════════════════════ */}
      <group ref={groupARef}>
        {/* 1. pH SENSOR PROBE (Secondary Tank Bridge, Collar 1) */}
        <InteractiveSensor 
          id="ph_sensor" 
          preset="PH_SENSOR" 
          position={[0.23, 0.58, 0.20]} 
          label="Raw pH"
          liveValue={`${(simState ? simState.inputPh : metrics.ph).toFixed(2)} pH`}
        >
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
        <InteractiveSensor 
          id="turbidity_sensor" 
          preset="TURBIDITY_SENSOR" 
          position={[0.42, 0.58, 0.20]} 
          label="Turbidity"
          liveValue={`${(simState ? simState.inputTurbidity : metrics.turbidity).toFixed(1)} NTU`}
        >
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
        <InteractiveSensor 
          id="tds_sensor" 
          preset="TDS_SENSOR" 
          position={[0.62, 0.58, 0.20]} 
          label="Raw TDS"
          liveValue={`${simState ? simState.inputTds : metrics.tds} ppm`}
        >
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
        <InteractiveSensor 
          id="temp_sensor" 
          preset="TEMP_SENSOR" 
          position={[0.80, 0.58, 0.20]} 
          label="Temp"
          liveValue={`${(simState ? simState.temperature : metrics.temperature).toFixed(1)} °C`}
        >
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
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          GROUP B: PRIMARY CLEAN POTABLE RESERVOIR & PIPE SENSORS
          ══════════════════════════════════════════════════════════════════════ */}

      {/* 5. WATER LEVEL FLOAT SWITCH (Clamped to Clean Reservoir Top Rim) */}
      <group ref={ultraRef}>
        <InteractiveSensor 
          id="float_sensor" 
          preset="FLOAT_SENSOR" 
          position={[-1.10, 0.60, 0]} 
          label="Clean Vol"
          liveValue={`${simState ? simState.purifiedWaterLevel.toFixed(1) : metrics.waterLevel} L`}
        >
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
      </group>

      {/* 6. INLINE YF-S201 FLOW SENSOR (Plumbed directly on intake transfer pipe) */}
      <InteractiveSensor 
        id="flow_sensor" 
        preset="FLOW_SENSOR" 
        position={[1.35, 0.30, 0]} 
        label="Feed Flow"
        liveValue={`${(simState ? simState.inputFlowRate : metrics.flowRate).toFixed(2)} L/m`}
      >
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
      <group ref={tank2SensorsRef}>
        {/* TDS #2 Verifier on Tank 2 Lid */}
        <InteractiveSensor 
          id="tds2_sensor" 
          preset="TANK2_VERIFICATION" 
          position={[-1.85, 0.41, 0.15]} 
          label="Permeate TDS"
          liveValue={`${simState ? simState.outputTds : metrics.tds2} ppm`}
        >
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
        <InteractiveSensor 
          id="ph2_sensor" 
          preset="TANK2_VERIFICATION" 
          position={[-1.73, 0.41, 0.10]} 
          label="Output pH"
          liveValue={`${(simState ? simState.outputPh : metrics.ph2).toFixed(2)} pH`}
        >
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
      </group>

      {/* ══════════════════════════════════════════════════════════════════════
          GROUP D: SOLAR & ELECTRICAL TELEMETRY SENSORS
          Firmly bolted to the solar panel structural strut and power DIN rail
          ══════════════════════════════════════════════════════════════════════ */}

      {/* 7. BH1750 AMBIENT LIGHT SENSOR (Clamped directly to Solar Panel Support Strut at x=-1.20, y=0.92, z=0.25) */}
      <group ref={bhRef}>
        <InteractiveSensor 
          id="solar" 
          preset="SOLAR" 
          position={[-1.20, 0.92, 0.25]} 
          label="Solar"
          liveValue={`${(metrics.solarWatts || 56.8).toFixed(1)} W`}
        >
          {/* CNC Aluminum Strut Collar Clamp */}
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.03, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Mounting Angle Arm */}
          <mesh position={[0.02, 0, 0]} castShadow>
            <boxGeometry args={[0.03, 0.008, 0.03]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* I2C Sensor Module PCB */}
          <mesh position={[0.02, 0.008, 0]} castShadow>
            <boxGeometry args={[0.028, 0.006, 0.028]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
          </mesh>
          {/* Hemispherical Translucent Optical Dome (Oriented upward to the sky) */}
          <mesh position={[0.02, 0.014, 0]}>
            <sphereGeometry args={[0.010, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.9} roughness={0.15} />
          </mesh>
        </InteractiveSensor>
      </group>

      {/* DIN Rail and Power Sensors (0-25V & ACS712) */}
      <group ref={powerSensorsRef}>
        {/* Slotted 35mm Steel Industrial DIN Rail on Power Shelf */}
        <mesh position={[-1.08, 0.67, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[0.038, 0.26, 0.008]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.92} />
        </mesh>

        {/* 8. 0–25V VOLTAGE SENSOR (Clipped firmly onto Power Shelf DIN Rail) */}
        <InteractiveSensor id="battery" preset="BATTERY" position={[-1.08, 0.70, 0.08]} label="0-25V Sen">
          {/* DIN Rail Heavy Mounting Clip */}
          <mesh position={[0, 0, -0.01]} castShadow>
            <boxGeometry args={[0.036, 0.036, 0.008]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Blue PCB */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.032, 0.032, 0.008]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
          </mesh>
          {/* Blue 2-Pin Screw Terminal Block */}
          <mesh position={[0, 0.010, 0.010]} castShadow>
            <boxGeometry args={[0.022, 0.014, 0.014]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
        </InteractiveSensor>

        {/* 9. ACS712 CURRENT SENSOR (Clipped firmly onto Power Shelf DIN Rail) */}
        <InteractiveSensor id="battery_pack" preset="BATTERY" position={[-1.08, 0.70, -0.06]} label="ACS712">
          {/* DIN Rail Heavy Mounting Clip */}
          <mesh position={[0, 0, -0.01]} castShadow>
            <boxGeometry args={[0.036, 0.036, 0.008]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Green PCB */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.034, 0.034, 0.008]} />
            <meshStandardMaterial color="#15803d" roughness={0.4} />
          </mesh>
          {/* Heavy-Duty Copper Screw Terminal */}
          <mesh position={[0, 0.010, 0.010]} castShadow>
            <boxGeometry args={[0.024, 0.014, 0.014]} />
            <meshStandardMaterial color="#16a34a" roughness={0.3} />
          </mesh>
        </InteractiveSensor>
      </group>

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
