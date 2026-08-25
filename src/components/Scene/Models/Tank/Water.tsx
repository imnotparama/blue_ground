'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

// Custom Water Ripple Shader Material (Refined waves and shinier Fresnel reflections)
const WaterShader = {
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color('#0e7490') },
    uRippleSpeed: { value: 1.0 },
    uTransparency: { value: 0.55 },
    uDeepColor: { value: new THREE.Color('#0c4a6e') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uRippleSpeed;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vWaveHeight;

    void main() {
      vUv = uv;
      
      // Calculate realistic wave motion using overlapping sine/cosine waves (refined for more alive waves)
      vec3 pos = position;
      float wave1 = sin(pos.x * 6.0 + uTime * uRippleSpeed * 2.2) * 0.045; // increased height
      float wave2 = cos(pos.z * 5.0 - uTime * uRippleSpeed * 1.8) * 0.035; // increased height
      float wave3 = sin((pos.x + pos.z) * 4.0 + uTime * uRippleSpeed * 1.2) * 0.02; // diagonal wave
      
      pos.y += wave1 + wave2 + wave3;
      vWaveHeight = wave1 + wave2 + wave3;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
    }
  `,
  fragmentShader: `
    uniform vec3 uWaterColor;
    uniform vec3 uDeepColor;
    uniform float uTransparency;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vWaveHeight;

    void main() {
      // Calculate Fresnel reflection (wider glossy rim highlights)
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0); // power 3 for wider highlights
      
      // Mix shallow color, deep color, and wave foam highlights
      vec3 baseColor = mix(uDeepColor, uWaterColor, vWaveHeight * 6.0 + 0.5);
      vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), fresnel * 0.5 + clamp(vWaveHeight * 5.0, 0.0, 0.25)); // shinier highlight

      gl_FragColor = vec4(finalColor, uTransparency + fresnel * 0.45);
    }
  `,
};

export const Water = () => {
  const { metrics, mode } = useSystemState();
  
  // Refs for water mesh and custom materials
  const primaryWaterRef = useRef<THREE.Mesh>(null);
  const secondaryWaterRef = useRef<THREE.Mesh>(null);
  
  const primaryMatRef = useRef<THREE.ShaderMaterial>(null);
  const secondaryMatRef = useRef<THREE.ShaderMaterial>(null);
  
  // Bubble points ref
  const primaryBubblesRef = useRef<THREE.Points>(null);
  const secondaryBubblesRef = useRef<THREE.Points>(null);

  // Initialize rising bubbles positions (Doubled bubble density)
  const primaryBubblesData = useMemo(() => {
    const count = 240; // Doubled from 120
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Primary tank: x in [-1.0, 1.0], z in [-0.65, 0.65]
      positions[i * 3] = (Math.random() - 0.5) * 2.0;
      positions[i * 3 + 1] = Math.random() * 1.5 - 0.9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      speeds[i] = Math.random() * 0.2 + 0.06; // slightly faster drift
    }
    return { positions, speeds };
  }, []);

  const secondaryBubblesData = useMemo(() => {
    const count = 80; // Doubled from 40
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Secondary tank: x in [-0.35, 0.35], z in [-0.6, 0.6]
      positions[i * 3] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 1] = Math.random() * 0.5 - 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
      speeds[i] = Math.random() * 0.25 + 0.09;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Update shader time uniforms
    if (primaryMatRef.current) primaryMatRef.current.uniforms.uTime.value = time;
    if (secondaryMatRef.current) secondaryMatRef.current.uniforms.uTime.value = time;

    // Adjust ripple speed if pump is working harder
    const rippleSpeed = metrics.pumpRpm > 0 ? 2.0 : 0.8;
    if (primaryMatRef.current) primaryMatRef.current.uniforms.uRippleSpeed.value = rippleSpeed;
    if (secondaryMatRef.current) secondaryMatRef.current.uniforms.uRippleSpeed.value = rippleSpeed;

    // Adjust color based on turbidity (cloudy water)
    const isTurbid = metrics.turbidity > 15;
    const targetWaterColor = isTurbid ? new THREE.Color('#45322c') : new THREE.Color('#0e7490'); // brown tint vs cyan
    const targetDeepColor = isTurbid ? new THREE.Color('#291b15') : new THREE.Color('#0c4a6e');
    const targetTransparency = isTurbid ? 0.85 : 0.55;

    if (primaryMatRef.current) {
      primaryMatRef.current.uniforms.uWaterColor.value.lerp(targetWaterColor, 0.05);
      primaryMatRef.current.uniforms.uDeepColor.value.lerp(targetDeepColor, 0.05);
      primaryMatRef.current.uniforms.uTransparency.value = THREE.MathUtils.lerp(
        primaryMatRef.current.uniforms.uTransparency.value,
        targetTransparency,
        0.05
      );
    }
    
    if (secondaryMatRef.current) {
      secondaryMatRef.current.uniforms.uWaterColor.value.lerp(targetWaterColor, 0.05);
      secondaryMatRef.current.uniforms.uDeepColor.value.lerp(targetDeepColor, 0.05);
      secondaryMatRef.current.uniforms.uTransparency.value = THREE.MathUtils.lerp(
        secondaryMatRef.current.uniforms.uTransparency.value,
        targetTransparency,
        0.05
      );
    }

    // 2. Animate Primary Tank Water Level Height
    const targetHeight = (metrics.waterLevel / 100) * 1.78;
    
    if (primaryWaterRef.current) {
      const currentScaleY = primaryWaterRef.current.scale.y;
      const nextScaleY = THREE.MathUtils.lerp(currentScaleY, targetHeight, 0.05);
      primaryWaterRef.current.scale.y = nextScaleY;
      primaryWaterRef.current.position.y = -1.0 + nextScaleY / 2;
    }

    // 3. Animate rising bubbles (Primary Tank points)
    if (primaryBubblesRef.current && primaryWaterRef.current) {
      const positions = primaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const maxY = -1.0 + targetHeight;
      
      for (let i = 0; i < primaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += primaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > maxY) {
          positions[i * 3 + 1] = -0.98;
          positions[i * 3] = (Math.random() - 0.5) * 2.0;
        }
      }
      primaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Animate secondary bubbles (Secondary Tank points)
    if (secondaryBubblesRef.current) {
      const positions = secondaryBubblesRef.current.geometry.attributes.position.array as Float32Array;
      const maxY = 0.38;
      for (let i = 0; i < secondaryBubblesData.positions.length / 3; i++) {
        positions[i * 3 + 1] += secondaryBubblesData.speeds[i] * delta;
        if (positions[i * 3 + 1] > maxY) {
          positions[i * 3 + 1] = -0.38;
          positions[i * 3] = (Math.random() - 0.5) * 0.7;
        }
      }
      secondaryBubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const primaryShaderMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(WaterShader.uniforms),
      vertexShader: WaterShader.vertexShader,
      fragmentShader: WaterShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  const secondaryShaderMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(WaterShader.uniforms),
      vertexShader: WaterShader.vertexShader,
      fragmentShader: WaterShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <group>
      {/* ─── A. PRIMARY TANK WATER (clean storage) ──────── */}
      {/* Primary center: [-2.2, -0.75, 0], H=2.0  bottom=-1.75  top=+0.25 */}
      {/* Clean water BELOW divider at local y=+0.20, so from y=-1.0 to y=+0.20 */}
      <group position={[-2.2, -0.75, 0]}>
        {metrics.waterLevel > 1 && (
          <mesh ref={primaryWaterRef} position={[0, -0.55, 0]} castShadow receiveShadow>
            {/* Max fill = 1.22 height (clean compartment) */}
            <boxGeometry args={[2.12, 1.0, 1.36, 32, 1, 32]} />
            <primitive object={primaryShaderMat} ref={primaryMatRef} attach="material" />
          </mesh>
        )}

        {metrics.waterLevel > 5 && (
          <points ref={primaryBubblesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[primaryBubblesData.positions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#e0f2fe" size={0.016}
              transparent opacity={0.65} depthWrite={false}
            />
          </points>
        )}
      </group>

      {/* ─── B. SECONDARY TANK WATER (raw intake) ────────── */}
      {/* Secondary center: [2.2, -1.0, 0], H=1.5  bottom=-1.75  top=-0.25  */}
      <group position={[2.2, -1.0, 0]}>
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          {/* Slightly murky tinted shader */}
          <boxGeometry args={[1.04, 1.3, 0.94, 16, 1, 16]} />
          <primitive object={secondaryShaderMat} ref={secondaryMatRef} attach="material" />
        </mesh>
        <points ref={secondaryBubblesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[secondaryBubblesData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#e0f2fe" size={0.018}
            transparent opacity={0.5} depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
};
