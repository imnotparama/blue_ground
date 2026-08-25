'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { CameraController } from './Camera/CameraController';
import { SceneLighting } from './Lighting/SceneLighting';
import { useSystemState } from '@/hooks/useSystemState';

// Hardware components imported for Phase 2
import { Tanks } from './Models/Tank/Tanks';
import { SolarPanel } from './Models/Solar/SolarPanel';
import { BatteryUnit } from './Models/Battery/BatteryUnit';
import { ESP32Box } from './Models/ESP32/ESP32Box';
import { WaterPump } from './Models/Pump/WaterPump';
import { Sensors } from './Models/Sensors/Sensors';
import { FilterHousing } from './Models/Filter/FilterHousing';
import { Pipes } from './Models/Pipes/Pipes';

// Flow and environment simulations imported for Phase 3
import { Water } from './Models/Tank/Water';
import { Flows } from './Models/Pipes/Flows';
import { AmbientLife } from './Environment/AmbientLife';
import { Hotspots } from './Environment/Hotspots';
import { SupportRack } from './Environment/SupportRack';

export const Scene = () => {
  const { exploded, transparent, cutaway, mode } = useSystemState();

  return (
    <div
      className="w-full h-full relative select-none"
      style={{
        background:
          'linear-gradient(180deg, #87ceeb 0%, #bfdbfe 40%, #dbeafe 65%, #dcfce7 85%, #bbf7d0 100%)',
      }}
    >
      {/* 3D R3F Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMappingExposure: 1.3,
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 80,
          position: [0, 1.2, 10.0],
        }}
        className="w-full h-full"
      >
        {/* Light outdoor haze — very subtle */}
        <fog attach="fog" args={['#e0f2fe', 20, 60]} />

        {/* Lighting setup */}
        <SceneLighting />

        {/* Sunny Green Grassy Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.24, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color="#4ade80"
            roughness={0.92}
            metalness={0.0}
          />
        </mesh>

        {/* Concrete Installation Platform — wider to span all 3 tanks */}
        <mesh position={[-0.5, -2.22, -0.1]} receiveShadow castShadow>
          <boxGeometry args={[10.0, 0.07, 2.8]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Platform edge border strip */}
        <mesh position={[-0.5, -2.20, 1.45]} castShadow>
          <boxGeometry args={[10.0, 0.06, 0.12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Stone Borewell / Water Wellhead Source — far right */}
        <group position={[3.8, -2.1, 0.0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.34, 0.35, 16, 1, false]} />
            <meshStandardMaterial color="#78716c" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.025, 12]} />
            <meshStandardMaterial color="#4b5563" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshPhysicalMaterial
              color="#0e7490"
              transparent opacity={0.75}
              transmission={0.9} roughness={0.08}
            />
          </mesh>
        </group>

        {/* Distant trees backdrop (billboard-style cylinders + cones) */}
        {([-8,-6,-4, 6, 8, 10, 12] as number[]).map((x, i) => (
          <group key={i} position={[x, -1.5, -6]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.18, 0.22, 1.2, 8]} />
              <meshStandardMaterial color="#713f12" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow>
              <coneGeometry args={[0.7 + i * 0.05, 2.0 + i * 0.1, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.95} />
            </mesh>
          </group>
        ))}

        {/* Camera state transitions controller */}
        <CameraController />

        {/* Orbit controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.08}
          minDistance={0.5}
          maxDistance={18}
        />

        {/* Global Atmospheric Ambient Dust Motes */}
        <AmbientLife />

        {/* Hardware Components Group */}
        <group position={[0, -0.2, 0]}>
          {/* Render the physical hardware system components */}
          <Tanks />
          <SolarPanel />
          <BatteryUnit />
          <ESP32Box />
          <WaterPump />
          <Sensors />
          <FilterHousing />
          <Pipes />
          <SupportRack />

          {/* Render dynamic fluids and current animations */}
          <Water />
          <Flows />

          {/* Vision Pro style hotspots */}
          <Hotspots />

          {/* Subtle grid overlay on platform */}
          <gridHelper args={[10, 20, '#94a3b8', '#e2e8f0']} position={[-0.5, -2.18, 0]}>
            <lineBasicMaterial attach="material" transparent opacity={0.08} />
          </gridHelper>
        </group>

        {/* Soft Contact Shadows on the floor */}
        <ContactShadows
          position={[0, -2.19, 0]}
          opacity={0.65}
          scale={15}
          blur={2.4}
          far={4.5}
          resolution={512}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};
