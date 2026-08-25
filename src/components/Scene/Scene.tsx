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

export const Scene = () => {
  const { exploded, transparent, cutaway, mode } = useSystemState();

  return (
    <div className="w-full h-full relative select-none bg-[#050507]">
      {/* 3D R3F Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMappingExposure: 1.0,
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 50,
          position: [0, 1.2, 7.0], // Matches CAMERA_PRESETS.OVERVIEW.position
        }}
        className="w-full h-full"
      >
        {/* Cinematic dark fog to blend edges into background */}
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 8, 18]} />

        {/* Lighting setup */}
        <SceneLighting />

        {/* Camera state transitions controller */}
        <CameraController />

        {/* Orbit controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.05} // don't go below floor
          minDistance={1.5}
          maxDistance={12}
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

          {/* Render dynamic fluids and current animations */}
          <Water />
          <Flows />

          {/* Vision Pro style hotspots */}
          <Hotspots />

          {/* Label indicating model area */}
          <gridHelper args={[20, 20, '#06b6d4', '#1f2937']} position={[0, -2.2, 0]}>
            <lineBasicMaterial attach="material" transparent opacity={0.04} />
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
