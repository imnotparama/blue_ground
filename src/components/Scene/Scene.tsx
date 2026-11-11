'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sky } from '@react-three/drei';
import { CameraController } from './Camera/CameraController';
import { SceneLighting } from './Lighting/SceneLighting';
import { useSystemState } from '@/hooks/useSystemState';

// Visual environment & inspection systems
import { AmbientLife } from './Environment/AmbientLife';
import { Hotspots } from './Environment/Hotspots';
import { ScenicEnvironment } from './Environment/ScenicEnvironment';

// Exploded 3D Subassembly Callout Labels
import { ExplodedLabels } from './Models/Exploded/ExplodedLabels';

// Official SolidCraft v9 CAD Digital Twin Model (Complete 256 Bodies Assembly)
import { SolidCraftModel } from './Models/SolidCraft/SolidCraftModel';

export const Scene = () => {
  const { exploded } = useSystemState();

  return (
    <div
      className="w-full h-full relative select-none"
      style={{
        background:
          'linear-gradient(180deg, #0284c7 0%, #38bdf8 25%, #7dd3fc 50%, #bae6fd 70%, #fed7aa 90%, #ffedd5 100%)',
      }}
    >
      {/* 3D R3F Canvas with high-DPI crispness and smooth performance */}
      <Canvas
        shadows="soft"
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMappingExposure: 1.25,
        }}
        camera={{
          fov: 46,
          near: 0.1,
          far: 100,
          position: [0.0, 0.25, 4.3],
        }}
        className="w-full h-full"
      >
        {/* Realistic Atmospheric Sky Dome */}
        <Sky
          distance={450000}
          sunPosition={[10, 14, -4]}
          inclination={0.55}
          azimuth={0.25}
          turbidity={6}
          rayleigh={1.1}
        />

        {/* Soft tropical atmospheric depth haze calibrated to panoramic horizon */}
        <fog attach="fog" args={['#bae6fd', 55, 95]} />

        {/* Lighting setup */}
        <SceneLighting />

        {/* Camera state transitions controller */}
        <CameraController />

        {/* Silky Smooth Studio Orbit controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.65}
          zoomSpeed={0.75}
          panSpeed={0.7}
          target={[-0.1, -0.65, -0.05]}
          maxPolarAngle={Math.PI / 2 + 0.04}
          minDistance={1.0}
          maxDistance={12}
        />

        {/* Global Atmospheric Ambient Dust Motes & Scenic Landscape */}
        <AmbientLife />
        <ScenicEnvironment />

        {/* Hardware Components Group seated firmly on datum foundation (zero offset for true CAD grounding) */}
        <group position={[0, 0, 0]}>
          {/* Authentic SolidCraft v9 CAD Digital Twin Model (256 Parametric Bodies) */}
          <SolidCraftModel />

          {/* Minimalist Apple-Style Inspection Pins */}
          <Hotspots />

          {/* Exploded View 3D Subassembly Callout Tags */}
          <ExplodedLabels />

          {/* Technical CAD coordinate grid visible only during Exploded Engineering View */}
          {exploded && (
            <gridHelper args={[4.2, 14, '#0284c7', '#1e293b']} position={[-0.1065, -2.186, -0.0375]}>
              <lineBasicMaterial attach="material" transparent opacity={0.25} />
            </gridHelper>
          )}
        </group>

        {/* Soft Studio Contact Shadow directly beneath Leviathan v9 */}
        <ContactShadows
          position={[-0.1065, -2.186, -0.0375]}
          opacity={0.65}
          scale={5.5}
          blur={2.0}
          far={3.0}
          resolution={512}
          frames={1}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};
