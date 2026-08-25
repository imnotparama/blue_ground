'use client';

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import * as THREE from 'three';

// Sensor interactive helper type
interface InteractiveSensorProps {
  id: string;
  preset: CameraPreset;
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

const InteractiveSensor: React.FC<InteractiveSensorProps> = ({ id, preset, position, rotation = [0, 0, 0], children }) => {
  const { setActiveHotspot, setCameraPreset, activeHotspot, demoRunning, metrics } = useSystemState();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  const handlePointerOver = (e: any) => {
    if (demoRunning) return;
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    if (demoRunning) return;
    e.stopPropagation();
    setActiveHotspot(id);
    setCameraPreset(preset);
  };

  const isActive = activeHotspot === id;

  useFrame(() => {
    // 1. Lerp Scale on hover
    if (groupRef.current) {
      const targetScale = hovered ? 1.05 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15));
    }

    // 2. Traversal Dimming & Emissive Glow
    const isDimmed = activeHotspot !== null && activeHotspot !== id;
    const targetOpacity = isDimmed ? 0.15 : 1.0;

    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.name === 'highlight-ring') return;
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);

            // Glow cyan on hover
            if (mat.emissive) {
              if (hovered && !isDimmed) {
                mat.emissive.set('#06b6d4');
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.45, 0.1);
              } else {
                // Restore standard emissives
                const standardEmissive = (child.name === 'uv-emitter-mesh' && metrics.uvStatus === 'ON') 
                  ? new THREE.Color('#a855f7') 
                  : new THREE.Color('#000000');
                const standardIntensity = (child.name === 'uv-emitter-mesh' && metrics.uvStatus === 'ON') ? 3.0 : 0.0;
                
                mat.emissive.lerp(standardEmissive, 0.1);
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, standardIntensity, 0.1);
              }
            }
          }
        }
      });
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 3D Emissive highlight ring shown when hovered or clicked */}
      {(hovered || isActive) && (
        <mesh name="highlight-ring" position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 12, 1, true]} />
          <meshBasicMaterial 
            color={isActive ? '#22d3ee' : '#3b82f6'} 
            wireframe 
            transparent 
            opacity={0.35} 
          />
        </mesh>
      )}
      {children}
    </group>
  );
};

export const Sensors = () => {
  const { exploded, metrics } = useSystemState();
  
  // Impeller ref for flow sensor & float ring ref for water level
  const flowRotorRef = useRef<THREE.Group>(null);
  const floatRingRef = useRef<THREE.Mesh>(null);
  
  const probeGroupRef = useRef<THREE.Group>(null);
  const flowSensorGroupRef = useRef<THREE.Group>(null);
  const floatSensorGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // 1. Exploded animations:
    const targetProbeY = exploded ? -0.35 : 0;
    if (probeGroupRef.current) {
      probeGroupRef.current.position.y = THREE.MathUtils.lerp(probeGroupRef.current.position.y, targetProbeY, 0.08);
    }
    
    const targetFlowX = exploded ? 0.35 : 0;
    if (flowSensorGroupRef.current) {
      flowSensorGroupRef.current.position.x = THREE.MathUtils.lerp(flowSensorGroupRef.current.position.x, targetFlowX, 0.08);
    }

    const targetFloatX = exploded ? -0.2 : 0;
    if (floatSensorGroupRef.current) {
      floatSensorGroupRef.current.position.x = THREE.MathUtils.lerp(floatSensorGroupRef.current.position.x, targetFloatX, 0.08);
    }

    // 2. Rotate flow sensor impeller proportional to flowRate
    if (flowRotorRef.current && metrics.flowRate > 0) {
      flowRotorRef.current.rotation.y += metrics.flowRate * 1.5 * delta;
    }

    // 3. Slide float sensor ring according to tank waterLevel
    if (floatRingRef.current) {
      const waterHeight = -1.5 + (metrics.waterLevel / 100) * 1.68;
      const targetRingY = waterHeight - (-0.5); // align with primary tank coordinates
      floatRingRef.current.position.y = THREE.MathUtils.lerp(floatRingRef.current.position.y, targetRingY, 0.1);
    }
  });

  return (
    <group>
      {/* ======================================================== */}
      {/* A. SENSOR PROBES (TDS, pH, Turbidity, Temp, UV LED) */}
      {/* ======================================================== */}
      <group ref={probeGroupRef}>
        {/* 1. TDS Probe */}
        <InteractiveSensor id="tds" preset="TDS_SENSOR" position={[0.55, 0.18, 0.15]}>
          {/* Casing */}
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.45, 12]} />
            <meshStandardMaterial color="#1e2937" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Silver electrodes at tip */}
          <mesh position={[0, -0.225, 0]}>
            <boxGeometry args={[0.008, 0.02, 0.02]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.1} metalness={0.9} />
          </mesh>
        </InteractiveSensor>

        {/* 2. pH Probe */}
        <InteractiveSensor id="ph" preset="PH_SENSOR" position={[0.7, 0.18, -0.1]}>
          {/* Casing */}
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.45, 12]} />
            <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Glass bulb tip */}
          <mesh position={[0, -0.225, 0]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshPhysicalMaterial 
              color="#0284c7" 
              transparent 
              opacity={0.7} 
              transmission={0.9} 
              roughness={0.05} 
            />
          </mesh>
        </InteractiveSensor>

        {/* 3. Turbidity Probe */}
        <InteractiveSensor id="turbidity" preset="TURBIDITY_SENSOR" position={[0.85, 0.18, 0.15]}>
          {/* Optical body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.45, 12]} />
            <meshStandardMaterial color="#18181b" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Metal base cap */}
          <mesh position={[0, 0.225, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.02, 12]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Tiny sensor lens at bottom */}
          <mesh position={[0, -0.225, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.005, 8]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} transmission={0.9} />
          </mesh>
        </InteractiveSensor>

        {/* 4. Temperature Probe */}
        <InteractiveSensor id="temp" preset="TEMP_SENSOR" position={[0.62, 0.14, -0.22]}>
          {/* Metal probe stem */}
          <mesh castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.52, 8]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.9} />
          </mesh>
          {/* Brass threads */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.02, 8]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.2} metalness={0.8} />
          </mesh>
        </InteractiveSensor>

        {/* 5. UV LED Sterilizer */}
        <InteractiveSensor id="uv" preset="UV_LED" position={[0.4, -0.15, 0.3]} rotation={[0, 0, -Math.PI / 4]}>
          {/* Metal base sleeve & bracket mount */}
          <mesh castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.08, 12]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Glass quartz sleeve bulb */}
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.12, 10]} />
            <meshPhysicalMaterial 
              color="#a855f7" 
              transparent 
              opacity={0.4} 
              transmission={0.9} 
              roughness={0.05} 
            />
          </mesh>
          {/* Emissive internal LED element */}
          <mesh name="uv-emitter-mesh" position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
            <meshStandardMaterial 
              color="#c084fc" 
              emissive="#a855f7" 
              emissiveIntensity={metrics.uvStatus === 'ON' ? 3.0 : 0.0} 
              roughness={0.1}
            />
          </mesh>
        </InteractiveSensor>
      </group>

      {/* ======================================================== */}
      {/* B. FLOW SENSOR */}
      {/* ======================================================== */}
      <group ref={flowSensorGroupRef}>
        <InteractiveSensor id="flow" preset="FLOW_SENSOR" position={[1.6, 0.0, 0]}>
          {/* Valve/T-Joint Pipe Fitting */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
            <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Rotor center chamber cylinder */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.07, 16]} />
            <meshStandardMaterial color="#1e2937" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Translucent plexiglass cover */}
          <mesh position={[0, 0.056, 0]}>
            <cylinderGeometry args={[0.066, 0.066, 0.005, 16]} />
            <meshPhysicalMaterial transparent opacity={0.3} transmission={0.9} roughness={0.05} />
          </mesh>

          {/* Rotating Flow wheel rotor */}
          <group ref={flowRotorRef} position={[0, 0.02, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Rotor Blades */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh 
                key={i} 
                rotation={[(i * Math.PI) / 3, 0, 0]} 
                position={[0, 0, 0]}
                castShadow
              >
                <boxGeometry args={[0.008, 0.055, 0.01]} />
                <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
              </mesh>
            ))}
          </group>
        </InteractiveSensor>
      </group>

      {/* ======================================================== */}
      {/* C. FLOAT SENSOR */}
      {/* ======================================================== */}
      <group ref={floatSensorGroupRef}>
        <InteractiveSensor id="float" preset="FLOAT_SENSOR" position={[-1.5, -0.5, 0]}>
          {/* Support bracket */}
          <mesh position={[-0.1, 0.4, 0]} castShadow>
            <boxGeometry args={[0.1, 0.04, 0.06]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.4} metalness={0.8} />
          </mesh>
          
          {/* Vertical steel guide rod */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.9, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.95} />
          </mesh>

          {/* Stopper rings */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.015, 8]} />
            <meshStandardMaterial color="#1e2937" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.015, 8]} />
            <meshStandardMaterial color="#1e2937" roughness={0.3} metalness={0.7} />
          </mesh>

          {/* Sliding Float Ring */}
          <mesh ref={floatRingRef} position={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.025, 0.014, 8, 16]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} metalness={0.6} />
          </mesh>
        </InteractiveSensor>
      </group>
    </group>
  );
};
