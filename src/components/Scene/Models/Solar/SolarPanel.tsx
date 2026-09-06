'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const SolarPanel = () => {
  const { exploded, activeHotspot, setActiveHotspot, setCameraPreset, tanksOnly, filterView } = useSystemState();
  const groupRef = useRef<THREE.Group>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Dark navy monocrystalline base
      ctx.fillStyle = '#050c1e';
      ctx.fillRect(0, 0, 512, 512);

      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#091838');
      gradient.addColorStop(0.5, '#040d21');
      gradient.addColorStop(1, '#020612');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Silver Busbar Ribbons (3 main vertical conductors per cell)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      for (let x = 42; x < 512; x += 85) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Micro Finger Grid Wires
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
      ctx.lineWidth = 1;
      for (let y = 8; y < 512; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Cell Border Isolation Grooves
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4;
      for (let x = 0; x <= 512; x += 170) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += 170) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      textureRef.current = texture;
    }
  }, []);

  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const deckRef = useRef<THREE.Group>(null);
  const panelGroupRefs = useRef<(THREE.Group | null)[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;
    const mats: THREE.MeshStandardMaterial[] = [];
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        mats.push(child.material as THREE.MeshStandardMaterial);
      }
    });
    materialsRef.current = mats;
  }, []);

  useFrame((_, delta) => {
    const damp = 1.0 - Math.exp(-6 * delta);

    if (groupRef.current) {
      const targetX = exploded ? -0.45 : 0;
      const targetY = exploded ? 1.15 : 0;
      const targetZ = exploded ? -0.45 : 0;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, damp);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, damp);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, damp);

      const targetScale = hovered ? 1.02 : 1.0;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp * 1.5));
    }

    // Explode tilted deck and separate individual PV modules
    if (deckRef.current) {
      const targetDeckY = exploded ? 0.58 : 0.28;
      deckRef.current.position.y = THREE.MathUtils.lerp(deckRef.current.position.y, targetDeckY, damp);
    }

    const spreadFactor = exploded ? 2.3 : 1.0;
    const baseSpacing = [-0.32, 0.0, 0.32];
    panelGroupRefs.current.forEach((ref, idx) => {
      if (ref) {
        const targetX = baseSpacing[idx] * spreadFactor;
        ref.position.x = THREE.MathUtils.lerp(ref.position.x, targetX, damp);
        // Individual panels also float slightly above deck in exploded view
        const targetPanelY = exploded ? 0.05 : 0.0;
        ref.position.y = THREE.MathUtils.lerp(ref.position.y, targetPanelY, damp);
      }
    });

    const isDimmed = tanksOnly || filterView || (activeHotspot !== null && activeHotspot !== 'solar' && activeHotspot !== 'solar_panel');
    const targetOpacity = isDimmed ? 0.08 : 1.0;

    for (let i = 0; i < materialsRef.current.length; i++) {
      const mat = materialsRef.current[i];
      mat.transparent = isDimmed;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);

      if (mat.emissive) {
        if (hovered && !isDimmed) {
          mat.emissive.set('#06b6d4');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.4, damp);
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, damp);
        }
      }
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
    setActiveHotspot('solar');
    setCameraPreset('SOLAR');
  };

  // 3 photovoltaic panel modules
  const panels = [
    { x: -0.32 },
    { x: 0.0 },
    { x: 0.32 }
  ];

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Far Left Roof Assembly at x = -1.65, y = 0.60, z = 0 */}
      <group position={[-1.65, 0.60, 0]}>
        
        {/* Support Struts Elevated Frame */}
        {[-0.45, 0.45].map((xVal, i) => (
          <group key={i} position={[xVal, 0, 0]}>
            {/* Rear Strut */}
            <mesh position={[0, 0.10, -0.25]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.20, 8]} />
              <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Front Strut */}
            <mesh position={[0, 0.18, 0.25]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.36, 8]} />
              <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Stainless Mounting Base Flange */}
            <mesh position={[0, 0.005, -0.25]} castShadow>
              <boxGeometry args={[0.04, 0.01, 0.04]} />
              <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.005, 0.25]} castShadow>
              <boxGeometry args={[0.04, 0.01, 0.04]} />
              <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        ))}
        
        {/* Cross Mounting Rails */}
        <mesh position={[0, 0.20, -0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.0, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.36, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.0, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Tilted Solar Panels Deck */}
        <group ref={deckRef} position={[0, 0.28, 0]} rotation={[-0.22, 0, 0]}>
          {panels.map((p, idx) => (
            <group 
              key={idx} 
              ref={(el) => { panelGroupRefs.current[idx] = el; }} 
              position={[p.x, 0, 0]}
            >
              {/* Back Plate */}
              <mesh castShadow>
                <boxGeometry args={[0.30, 0.018, 0.65]} />
                <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.2} />
              </mesh>

              {/* Photovoltaic Cells Surface */}
              <mesh position={[0, 0.010, 0]} castShadow>
                <boxGeometry args={[0.28, 0.004, 0.61]} />
                <meshStandardMaterial
                  map={textureRef.current || undefined}
                  roughness={0.06}
                  metalness={0.8}
                />
              </mesh>

              {/* Silver Bezel Edge Frame */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.31, 0.022, 0.66]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.9} />
              </mesh>

              {/* IP68 Waterproof MC4 Junction Box on Underneath Backplate */}
              <mesh position={[0, -0.018, -0.15]} castShadow>
                <boxGeometry args={[0.08, 0.016, 0.06]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
              </mesh>
              {/* Output Cable Gland */}
              <mesh position={[0.035, -0.018, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
                <meshStandardMaterial color="#1e293b" roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};
