'use client';

import { useEffect, useRef } from 'react';
import { useSystemState, EnvironmentalMode } from '@/hooks/useSystemState';
import gsap from 'gsap';
import * as THREE from 'three';

export const SceneLighting = () => {
  const { envMode, mode } = useSystemState();

  // References to lights
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const uvGlowRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    // Determine lighting colors and intensities based on environmental modes
    let sunColor = '#ffffff';
    let sunIntensity = 2.5;
    let sunPosition = [8, 10, 5];
    let ambientColor = '#1e1e24';
    let ambientIntensity = 0.5;
    let rimColor = '#3b82f6'; // Neon blue rim light for premium look
    let rimIntensity = 1.5;

    // Apply adjustments based on Environmental Mode
    switch (envMode) {
      case 'SUNNY':
        sunColor = '#fffaf0';
        sunIntensity = 5.5;
        sunPosition = [8, 12, 5];
        ambientColor = '#1e1e2d';
        ambientIntensity = 1.1;
        rimColor = '#06b6d4'; // Cyan highlights
        rimIntensity = 3.0;
        break;
      case 'MORNING':
        sunColor = '#fca5a5'; // Soft rose/golden light
        sunIntensity = 3.8;
        sunPosition = [-6, 5, 4];
        ambientColor = '#242033';
        ambientIntensity = 1.1;
        rimColor = '#f97316'; // Golden orange rim
        rimIntensity = 2.5;
        break;
      case 'CLOUDY':
        sunColor = '#cbd5e1';
        sunIntensity = 2.8;
        sunPosition = [3, 8, 3];
        ambientColor = '#131c30';
        ambientIntensity = 0.9;
        rimColor = '#64748b';
        rimIntensity = 1.5;
        break;
      case 'RAIN':
        sunColor = '#475569';
        sunIntensity = 1.8;
        sunPosition = [2, 6, 2];
        ambientColor = '#050c1e';
        ambientIntensity = 0.6;
        rimColor = '#0284c7';
        rimIntensity = 1.2;
        break;
      case 'NIGHT':
        sunColor = '#1e293b'; // Moonlight
        sunIntensity = 0.8;
        sunPosition = [-5, 8, -2];
        ambientColor = '#060a17';
        ambientIntensity = 0.4;
        rimColor = '#3b82f6'; // Deep blue highlights
        rimIntensity = 2.0;
        break;
    }

    // GSAP Transitions for lights
    if (sunLightRef.current) {
      gsap.to(sunLightRef.current, {
        intensity: sunIntensity,
        duration: 1.8,
        ease: 'power2.out',
      });
      gsap.to(sunLightRef.current.color, {
        r: new THREE.Color(sunColor).r,
        g: new THREE.Color(sunColor).g,
        b: new THREE.Color(sunColor).b,
        duration: 1.8,
        ease: 'power2.out',
      });
      gsap.to(sunLightRef.current.position, {
        x: sunPosition[0],
        y: sunPosition[1],
        z: sunPosition[2],
        duration: 2.0,
        ease: 'power2.out',
      });
    }

    if (ambientLightRef.current) {
      gsap.to(ambientLightRef.current, {
        intensity: ambientIntensity,
        duration: 1.8,
        ease: 'power2.out',
      });
      gsap.to(ambientLightRef.current.color, {
        r: new THREE.Color(ambientColor).r,
        g: new THREE.Color(ambientColor).g,
        b: new THREE.Color(ambientColor).b,
        duration: 1.8,
        ease: 'power2.out',
      });
    }

    if (rimLightRef.current) {
      gsap.to(rimLightRef.current, {
        intensity: rimIntensity,
        duration: 1.8,
        ease: 'power2.out',
      });
      gsap.to(rimLightRef.current.color, {
        r: new THREE.Color(rimColor).r,
        g: new THREE.Color(rimColor).g,
        b: new THREE.Color(rimColor).b,
        duration: 1.8,
        ease: 'power2.out',
      });
    }

    // UV LED glow animation: should glow bright violet-blue when active
    const isUvOn = mode !== 'LOW_BATTERY' && mode !== 'PUMP_FAILURE' && envMode === 'NIGHT' || mode === 'NORMAL' || mode === 'TURBIDITY' || mode === 'NIGHT';
    if (uvGlowRef.current) {
      gsap.to(uvGlowRef.current, {
        intensity: isUvOn ? 4.0 : 0,
        duration: 1.0,
        ease: 'power2.out',
      });
    }
  }, [envMode, mode]);

  return (
    <>
      {/* Soft Ambient Environment light */}
      <ambientLight ref={ambientLightRef} intensity={1.0} color="#1e1e2d" />

      {/* Main Directional Sun Light */}
      <directionalLight
        ref={sunLightRef}
        intensity={4.5}
        position={[8, 12, 5]}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0002}
      />

      {/* Rim light (placed behind the model to create beautiful glossy outlines on glass/metal) */}
      <directionalLight
        ref={rimLightRef}
        intensity={2.5}
        position={[-8, 4, -5]}
        color="#06b6d4"
      />

      {/* Soft fill light (from the bottom front to avoid dark under-shadows) */}
      <pointLight
        ref={fillLightRef}
        intensity={1.8}
        position={[0.5, -2, 4]}
        color="#f8fafc"
      />

      {/* Dedicated point light representing the UV LED Sterilization light */}
      {/* Positioned inside the Secondary Tank aligned with the UV LED probe */}
      <pointLight
        ref={uvGlowRef}
        intensity={0.0}
        position={[0.4, -0.15, 0.3]}
        color="#c084fc"
        distance={3.0}
        decay={1.5}
      />
    </>
  );
};
