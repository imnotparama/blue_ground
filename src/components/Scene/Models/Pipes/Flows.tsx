'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

// Moving Shader for Tube Water Flow (Dashed moving pattern)
const TubeFlowShader = {
  uniforms: {
    uTime: { value: 0 },
    uSpeed: { value: 2.0 },
    uFlowActive: { value: 1.0 },
    uColor: { value: new THREE.Color('#38bdf8') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uFlowActive;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      float flow = sin(vUv.x * 60.0 - uTime * uSpeed * uFlowActive) * 0.5 + 0.5;
      float highlight = pow(flow, 8.0) * 0.6;
      vec3 finalColor = mix(uColor * 0.7, vec3(1.0), highlight);
      gl_FragColor = vec4(finalColor, (0.15 + flow * 0.3) * uFlowActive);
    }
  `,
};

export const Flows = () => {
  const { metrics, mode, envMode, exploded } = useSystemState();

  // Water particle system refs
  const intakeParticlesRef = useRef<THREE.Points>(null);
  const filterParticlesRef = useRef<THREE.Points>(null);
  const returnParticlesRef = useRef<THREE.Points>(null);

  // Moving tube materials references
  const intakeTubeMatRef = useRef<THREE.ShaderMaterial>(null);
  const filterTubeMatRef = useRef<THREE.ShaderMaterial>(null);
  const returnTubeMatRef = useRef<THREE.ShaderMaterial>(null);

  // Power lines refs
  const solarPowerRef = useRef<any>(null);
  const battPowerRef = useRef<any>(null);
  const pumpPowerRef = useRef<any>(null);
  const sensorPowerRef = useRef<any>(null);

  // 1. DEFINE 3D PATH CURVES FOR WATER PIPING
  const curves = useMemo(() => {
    // A. Raw Intake Pipe path
    const intakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.8, -3.1, 0),
      new THREE.Vector3(3.8, -1.0, 0),
      new THREE.Vector3(3.8, 0.9, 0),
      new THREE.Vector3(2.2, 0.9, 0),
      new THREE.Vector3(0.7, 0.9, 0),
      new THREE.Vector3(0.7, 0.76, 0),
    ], false, 'catmullrom', 0.01);

    // B. Pump Outlet path (shifted to start from submerged pump at y=-0.26)
    const filterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.35, -0.26, 0),
      new THREE.Vector3(0.35, 0.06, 0),
      new THREE.Vector3(0.35, 0.38, 0),
      new THREE.Vector3(0.95, 0.38, 0),
      new THREE.Vector3(1.55, 0.38, 0),
      new THREE.Vector3(1.55, 0.2, 0),
      new THREE.Vector3(1.6, -0.15, 0),
      new THREE.Vector3(2.0, -0.1, 0),
      new THREE.Vector3(2.2, 0.0, 0),
    ], false, 'catmullrom', 0.01);

    // C. Return Pipe path
    const returnCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.2, -1.37, 0),
      new THREE.Vector3(2.2, -1.41, 0),
      new THREE.Vector3(0.4, -1.41, 0),
      new THREE.Vector3(-1.4, -1.41, 0),
      new THREE.Vector3(-1.4, -0.4, 0),
      new THREE.Vector3(-1.4, 0.61, 0),
      new THREE.Vector3(-1.25, 0.61, 0),
    ], false, 'catmullrom', 0.01);

    return { intakeCurve, filterCurve, returnCurve };
  }, []);

  // 2. INITIALIZE FLOW PARTICLE SYSTEMS
  const particleConfig = useMemo(() => {
    const init = (count: number) => {
      const positions = new Float32Array(count * 3);
      const progress = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        progress[i] = i / count;
      }
      return { positions, progress };
    };

    return {
      intake: init(45),
      filter: init(35),
      ret: init(45),
    };
  }, []);

  // Initialize a dynamic colors array for the sifting filter particles
  const filterColorsData = useMemo(() => {
    const count = 35;
    return new Float32Array(count * 3);
  }, []);

  // 3. DEFINE WIRE FRAMES FOR POWER FLOW LINES
  const wires = useMemo(() => {
    const solarToBatt = new THREE.LineCurve3(new THREE.Vector3(-1.4, 0.55, 0), new THREE.Vector3(-0.2, 0.52, 0.15));
    const battToEsp = new THREE.LineCurve3(new THREE.Vector3(-0.2, 0.52, -0.15), new THREE.Vector3(0.7, 0.52, 0.15));
    
    // Connected to submerged pump at y = -0.28
    const espToPump = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.7, 0.42, 0),
      new THREE.Vector3(0.5, 0.0, 0.1),
      new THREE.Vector3(0.3, -0.2, 0),
    ]);
    
    const espToSensors = new THREE.LineCurve3(new THREE.Vector3(0.7, 0.42, 0), new THREE.Vector3(0.7, 0.3, 0));

    return { solarToBatt, battToEsp, espToPump, espToSensors };
  }, []);

  // Pre-sample points for Drei <Line> rendering
  const wirePoints = useMemo(() => {
    return {
      solar: wires.solarToBatt.getPoints(20),
      batt: wires.battToEsp.getPoints(20),
      pump: wires.espToPump.getPoints(25),
      sensors: wires.espToSensors.getPoints(10),
    };
  }, [wires]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // A. Update Moving Tube Uniforms
    const isFlowActive = metrics.flowRate > 0.1 ? 1.0 : 0.0;
    const speedScale = 1.0 + (metrics.flowRate / 5.0) * 1.5;

    if (intakeTubeMatRef.current) {
      intakeTubeMatRef.current.uniforms.uTime.value = time;
      intakeTubeMatRef.current.uniforms.uSpeed.value = speedScale;
      intakeTubeMatRef.current.uniforms.uFlowActive.value = isFlowActive;
    }
    if (filterTubeMatRef.current) {
      filterTubeMatRef.current.uniforms.uTime.value = time;
      filterTubeMatRef.current.uniforms.uSpeed.value = speedScale;
      filterTubeMatRef.current.uniforms.uFlowActive.value = isFlowActive;
    }
    if (returnTubeMatRef.current) {
      returnTubeMatRef.current.uniforms.uTime.value = time;
      returnTubeMatRef.current.uniforms.uSpeed.value = speedScale;
      returnTubeMatRef.current.uniforms.uFlowActive.value = isFlowActive;
    }

    // B. Update Water Particles Positions along Splines
    const updateIntakeParticles = () => {
      if (!intakeParticlesRef.current) return;
      const positions = intakeParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const progress = particleConfig.intake.progress;
      const step = (metrics.flowRate / 5.0) * 0.18 * delta;

      for (let i = 0; i < progress.length; i++) {
        if (metrics.flowRate > 0) {
          progress[i] += step;
          if (progress[i] > 1.0) progress[i] = 0;
        }
        const pt = curves.intakeCurve.getPointAt(progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      intakeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    };

    const updateFilterParticles = () => {
      if (!filterParticlesRef.current) return;
      const positions = filterParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const colors = filterParticlesRef.current.geometry.attributes.color.array as Float32Array;
      const progress = particleConfig.filter.progress;
      const step = (metrics.flowRate / 5.0) * 0.18 * delta;

      const c = new THREE.Color();
      for (let i = 0; i < progress.length; i++) {
        if (metrics.flowRate > 0) {
          progress[i] += step;
          if (progress[i] > 1.0) progress[i] = 0;
        }
        const pt = curves.filterCurve.getPointAt(progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;

        // Dynamic sifting color graduation (Brown -> Yellow-Gray -> Clear Cyan)
        const p = progress[i];
        if (p < 0.25) {
          c.set('#92400e'); // Raw muddy brown
        } else if (p < 0.5) {
          c.set('#d97706'); // Light filtration amber
        } else if (p < 0.75) {
          c.set('#64748b'); // clarifying slate gray/yellow
        } else {
          c.set('#22d3ee'); // Purified loop clear cyan
        }

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      filterParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      filterParticlesRef.current.geometry.attributes.color.needsUpdate = true;
    };

    const updateReturnParticles = () => {
      if (!returnParticlesRef.current) return;
      const positions = returnParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const progress = particleConfig.ret.progress;
      const step = (metrics.flowRate / 5.0) * 0.18 * delta;

      for (let i = 0; i < progress.length; i++) {
        if (metrics.flowRate > 0) {
          progress[i] += step;
          if (progress[i] > 1.0) progress[i] = 0;
        }
        const pt = curves.returnCurve.getPointAt(progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      returnParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    };

    updateIntakeParticles();
    updateFilterParticles();
    updateReturnParticles();

    // C. Power Flow Dash Animations
    const isSolarCharging = metrics.solarWatts > 2 && envMode !== 'NIGHT';
    const isBatteryDischarging = metrics.currentDraw > 1 && mode !== 'LOW_BATTERY';

    if (solarPowerRef.current && solarPowerRef.current.material) {
      solarPowerRef.current.material.dashOffset = isSolarCharging ? -time * 0.8 : 0;
      solarPowerRef.current.material.opacity = isSolarCharging ? 1.0 : 0.05;
    }

    if (battPowerRef.current && battPowerRef.current.material) {
      battPowerRef.current.material.dashOffset = isBatteryDischarging ? -time * 0.6 : 0;
      battPowerRef.current.material.opacity = isBatteryDischarging ? 1.0 : 0.05;
    }

    if (pumpPowerRef.current && pumpPowerRef.current.material) {
      const isPumpOn = metrics.pumpRpm > 10;
      pumpPowerRef.current.material.dashOffset = isPumpOn ? -time * 0.9 : 0;
      pumpPowerRef.current.material.opacity = isPumpOn ? 0.9 : 0.05;
    }

    if (sensorPowerRef.current && sensorPowerRef.current.material) {
      const isEspOn = metrics.esp32Online;
      sensorPowerRef.current.material.dashOffset = isEspOn ? -time * 0.4 : 0;
      sensorPowerRef.current.material.opacity = isEspOn ? 0.8 : 0.05;
    }
  });

  const intakeShaderMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(TubeFlowShader.uniforms),
      vertexShader: TubeFlowShader.vertexShader,
      fragmentShader: TubeFlowShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    mat.uniforms.uColor.value.set('#b45309'); // Brown intake water
    return mat;
  }, []);

  const filterShaderMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(TubeFlowShader.uniforms),
      vertexShader: TubeFlowShader.vertexShader,
      fragmentShader: TubeFlowShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    mat.uniforms.uColor.value.set('#d97706'); // Amber/Gravel water
    return mat;
  }, []);

  const returnShaderMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(TubeFlowShader.uniforms),
      vertexShader: TubeFlowShader.vertexShader,
      fragmentShader: TubeFlowShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    mat.uniforms.uColor.value.set('#22d3ee'); // Cyan return water
    return mat;
  }, []);

  if (exploded) return null;

  return (
    <group position={[0, 0, 0.005]}>
      {/* A. SPLINE TUBE FLOW COVERS */}
      {metrics.flowRate > 0.1 && (
        <group>
          {/* Intake Tube */}
          <mesh castShadow={false}>
            <tubeGeometry args={[curves.intakeCurve, 64, 0.038, 8, false]} />
            <primitive object={intakeShaderMat} ref={intakeTubeMatRef} attach="material" />
          </mesh>

          {/* Filter Tube */}
          <mesh castShadow={false}>
            <tubeGeometry args={[curves.filterCurve, 48, 0.024, 8, false]} />
            <primitive object={filterShaderMat} ref={filterTubeMatRef} attach="material" />
          </mesh>

          {/* Return Tube */}
          <mesh castShadow={false}>
            <tubeGeometry args={[curves.returnCurve, 64, 0.024, 8, false]} />
            <primitive object={returnShaderMat} ref={returnTubeMatRef} attach="material" />
          </mesh>
        </group>
      )}

      {/* B. VELOCITY WATER FLOW PARTICLES */}
      {metrics.flowRate > 0.1 && (
        <group>
          {/* Raw Intake particles (Brown mud color) */}
          <points ref={intakeParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[particleConfig.intake.positions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#b45309"
              size={0.032}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </points>

          {/* Filtration particles (Dynamic color transition) */}
          <points ref={filterParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[particleConfig.filter.positions, 3]}
              />
              <bufferAttribute
                attach="attributes-color"
                args={[filterColorsData, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              vertexColors
              size={0.025}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </points>

          {/* Return particles (Purified cyan color) */}
          <points ref={returnParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[particleConfig.ret.positions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#22d3ee"
              size={0.025}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </points>
        </group>
      )}

      {/* C. POWER FLOW ENERGY WIRING CIRCUITS */}
      <group>
        {/* Wire 1: Solar panel to Battery Charging */}
        <Line 
          ref={solarPowerRef}
          points={wirePoints.solar}
          color="#f97316"
          lineWidth={2.2} // increased width for better visibility
          dashed
          dashSize={0.08}
          gapSize={0.05}
          transparent
          opacity={0.9}
        />

        {/* Wire 2: Battery to ESP32 */}
        <Line 
          ref={battPowerRef}
          points={wirePoints.batt}
          color="#eab308"
          lineWidth={2.0}
          dashed
          dashSize={0.06}
          gapSize={0.04}
          transparent
          opacity={0.9}
        />

        {/* Wire 3: ESP32 to Pump */}
        <Line 
          ref={pumpPowerRef}
          points={wirePoints.pump}
          color="#ca8a04"
          lineWidth={1.8}
          dashed
          dashSize={0.06}
          gapSize={0.04}
          transparent
          opacity={0.8}
        />

        {/* Wire 4: ESP32 to Sensors */}
        <Line 
          ref={sensorPowerRef}
          points={wirePoints.sensors}
          color="#ca8a04"
          lineWidth={1.5}
          dashed
          dashSize={0.05}
          gapSize={0.03}
          transparent
          opacity={0.8}
        />
      </group>
    </group>
  );
};
