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
import { TankMargins } from './Models/Tank/TankMargins';
import { Flows } from './Models/Pipes/Flows';
import { AmbientLife } from './Environment/AmbientLife';
import { Hotspots } from './Environment/Hotspots';
import { SupportRack } from './Environment/SupportRack';
import { MiningEnvironment } from './Environment/MiningEnvironment';

export const Scene = () => {
  const { exploded, transparent, cutaway, mode } = useSystemState();

  return (
    <div
      className="w-full h-full relative select-none"
      style={{
        background:
          'radial-gradient(ellipse at 60% 15%, #bfdbfe 0%, #93c5fd 40%, #cbd5e1 75%, #94a3b8 100%)',
      }}
    >
      {/* 3D R3F Canvas with high-DPI crispness and smooth performance */}
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMappingExposure: 1.2,
        }}
        camera={{
          fov: 46,
          near: 0.1,
          far: 100,
          position: [0.0, 0.8, 6.8],
        }}
        className="w-full h-full"
      >
        {/* Soft atmospheric depth haze */}
        <fog attach="fog" args={['#cbd5e1', 18, 55]} />

        {/* Lighting setup */}
        <SceneLighting />

        {/* Natural Ground Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.24, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color="#64748b"
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>

        {/* Clean Architectural Concrete Installation Platform */}
        <mesh position={[-0.5, -2.22, -0.1]} receiveShadow castShadow>
          <boxGeometry args={[9.2, 0.08, 2.6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Platform safety border strip */}
        <mesh position={[-0.5, -2.20, 1.25]} castShadow>
          <boxGeometry args={[9.2, 0.06, 0.08]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Camera state transitions controller */}
        <CameraController />

        {/* Silky Smooth Orbit controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.075}
          rotateSpeed={0.8}
          zoomSpeed={0.9}
          panSpeed={0.8}
          target={[0.0, -0.5, 0]}
          maxPolarAngle={Math.PI / 2 + 0.08}
          minDistance={0.8}
          maxDistance={20}
        />

        {/* Global Atmospheric Ambient Dust Motes & Mining Story Environment */}
        <AmbientLife />
        <MiningEnvironment />

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
          <TankMargins />
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
