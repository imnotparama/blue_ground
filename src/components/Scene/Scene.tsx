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
// Classic Dual Big-Tank Prototype Model
import { ClassicBigTankModel } from './Models/Legacy/ClassicBigTankModel';

export const Scene = () => {
  const { exploded, cadModelMode, photoMode, photoAutoRotate } = useSystemState();

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
          preserveDrawingBuffer: true,
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

        {/* Silky Smooth Studio Orbit controls with optional cinematic 360° turntable in Photo Mode */}
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
          autoRotate={photoMode && photoAutoRotate}
          autoRotateSpeed={0.75}
        />

        {/* Global Atmospheric Ambient Dust Motes & Scenic Landscape */}
        <AmbientLife />
        <ScenicEnvironment />

        {/* Hardware Components Group seated firmly on datum foundation (zero offset for true CAD grounding) */}
        <group position={[0, 0, 0]}>
          {/* Dual Architecture Toggle: SolidCraft v9 CAD vs Classic Dual Big-Tank Prototype */}
          {cadModelMode ? (
            <SolidCraftModel />
          ) : (
            <ClassicBigTankModel />
          )}

          {/* Minimalist Apple-Style Inspection Pins (Cleanly hidden in Photo Mode for pristine presentation) */}
          {!photoMode && <Hotspots />}

          {/* Exploded View 3D Subassembly Callout Tags (CAD Twin mode, hidden in Photo Mode) */}
          {!photoMode && cadModelMode && <ExplodedLabels />}

          {/* Technical CAD coordinate grid visible only during Exploded Engineering View (hidden in Photo Mode) */}
          {!photoMode && exploded && (
            <gridHelper args={[4.2, 14, '#0284c7', '#1e293b']} position={[-0.1065, -2.186, -0.0375]}>
              <lineBasicMaterial attach="material" transparent opacity={0.25} />
            </gridHelper>
          )}
        </group>

        {/* Soft Studio Contact Shadow directly on top of kiosk slate pad (Y = -2.176 with zero clipping/flickering) */}
        <ContactShadows
          position={[-0.1065, -2.176, -0.0375]}
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
