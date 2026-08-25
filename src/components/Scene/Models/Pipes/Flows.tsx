'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

// Moving Shader for Pipe Water Flow
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
      float flow = sin(vUv.x * 50.0 - uTime * uSpeed * uFlowActive) * 0.5 + 0.5;
      float highlight = pow(flow, 6.0) * 0.5;
      vec3 finalColor = mix(uColor * 0.8, vec3(1.0), highlight);
      gl_FragColor = vec4(finalColor, (0.2 + flow * 0.35) * uFlowActive);
    }
  `,
};

export const Flows = () => {
  const { metrics, mode, envMode } = useSystemState();

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

  // 1. DEFINE EXACT 3D PATH CURVES FOR WATER PIPING
  const curves = useMemo(() => {
    // A. Raw Intake Pipe: Borewell [3.6, -2.1] -> Top [3.6, 0.0] -> Secondary Inlet [2.65, -0.25]
    const intakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.6, -2.1, 0),
      new THREE.Vector3(3.6, -1.0, 0),
      new THREE.Vector3(3.6, 0.0, 0),
      new THREE.Vector3(3.1, 0.0, 0),
      new THREE.Vector3(2.65, 0.0, 0),
      new THREE.Vector3(2.65, -0.25, 0),
    ], false, 'catmullrom', 0.02);

    // B. Process Filtration Pipe: Pump [1.55, -1.65] -> Flow Sensor [0.85] -> Solenoid [0.45] -> Sedimentation Top [0.15, -0.20]
    const filterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.55, -1.65, 0),
      new THREE.Vector3(1.10, -1.65, 0),
      new THREE.Vector3(0.85, -1.65, 0),
      new THREE.Vector3(0.45, -1.65, 0),
      new THREE.Vector3(0.15, -1.65, 0),
      new THREE.Vector3(0.15, -0.90, 0),
      new THREE.Vector3(0.15, -0.20, 0),
    ], false, 'catmullrom', 0.02);

    // C. Return Pipe: Sedimentation Bottom [0.15, -1.75] -> Under Tank [0.15, -1.90] -> Primary Inlet [-1.0, -0.55]
    const returnCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, -1.75, 0),
      new THREE.Vector3(0.15, -1.90, 0),
      new THREE.Vector3(-0.45, -1.90, 0),
      new THREE.Vector3(-1.0, -1.90, 0),
      new THREE.Vector3(-1.0, -1.20, 0),
      new THREE.Vector3(-1.0, -0.55, 0),
    ], false, 'catmullrom', 0.02);

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

  // 3. DEFINE WIRE FRAMES FOR POWER FLOW LINES
  const wires = useMemo(() => {
    const solarToBatt = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.0, 0.35, 0),
      new THREE.Vector3(-1.7, 0.35, 0.15),
      new THREE.Vector3(-1.45, 0.32, 0.35),
    ]);
    
    const battToEsp = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 0.32, 0.20),
      new THREE.Vector3(-1.45, 0.32, 0.0),
      new THREE.Vector3(-1.45, 0.32, -0.20),
    ]);
    
    const espToPump = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 0.25, -0.35),
      new THREE.Vector3(-0.5, 0.0, -0.4),
      new THREE.Vector3(0.5, -0.8, -0.3),
      new THREE.Vector3(1.55, -1.55, 0),
    ]);
    
    const espToSensors = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 0.25, -0.35),
      new THREE.Vector3(0.0, 0.1, -0.3),
      new THREE.Vector3(1.2, 0.0, -0.2),
      new THREE.Vector3(2.1, -0.25, 0),
    ]);

    return { solarToBatt, battToEsp, espToPump, espToSensors };
  }, []);

  const wirePoints = useMemo(() => {
    return {
      solar: wires.solarToBatt.getPoints(15),
      batt: wires.battToEsp.getPoints(15),
      pump: wires.espToPump.getPoints(25),
      sensors: wires.espToSensors.getPoints(20),
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
      const step = (metrics.flowRate / 5.0) * 0.20 * delta;

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
      const progress = particleConfig.filter.progress;
      const step = (metrics.flowRate / 5.0) * 0.20 * delta;

      for (let i = 0; i < progress.length; i++) {
        if (metrics.flowRate > 0) {
          progress[i] += step;
          if (progress[i] > 1.0) progress[i] = 0;
        }
        const pt = curves.filterCurve.getPointAt(progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      filterParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    };

    const updateReturnParticles = () => {
      if (!returnParticlesRef.current) return;
      const positions = returnParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const progress = particleConfig.ret.progress;
      const step = (metrics.flowRate / 5.0) * 0.20 * delta;

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
      solarPowerRef.current.material.opacity = isSolarCharging ? 0.9 : 0.05;
    }

    if (battPowerRef.current && battPowerRef.current.material) {
      battPowerRef.current.material.dashOffset = isBatteryDischarging ? -time * 0.6 : 0;
      battPowerRef.current.material.opacity = isBatteryDischarging ? 0.9 : 0.05;
    }

    if (pumpPowerRef.current && pumpPowerRef.current.material) {
      const isPumpOn = metrics.pumpRpm > 10;
      pumpPowerRef.current.material.dashOffset = isPumpOn ? -time * 0.9 : 0;
      pumpPowerRef.current.material.opacity = isPumpOn ? 0.8 : 0.05;
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
    mat.uniforms.uColor.value.set('#0284c7');
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
    mat.uniforms.uColor.value.set('#06b6d4');
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
    mat.uniforms.uColor.value.set('#38bdf8');
    return mat;
  }, []);

  return (
    <group>
      {/* ─── 1. GLOWING INTERNAL FLUID CORES ────────────────────────────── */}
      {/* Intake Flow Tube */}
      <mesh>
        <tubeGeometry args={[curves.intakeCurve, 40, 0.016, 8, false]} />
        <primitive object={intakeShaderMat} ref={intakeTubeMatRef} attach="material" />
      </mesh>

      {/* Process Flow Tube */}
      <mesh>
        <tubeGeometry args={[curves.filterCurve, 40, 0.016, 8, false]} />
        <primitive object={filterShaderMat} ref={filterTubeMatRef} attach="material" />
      </mesh>

      {/* Return Flow Tube */}
      <mesh>
        <tubeGeometry args={[curves.returnCurve, 40, 0.016, 8, false]} />
        <primitive object={returnShaderMat} ref={returnTubeMatRef} attach="material" />
      </mesh>

      {/* ─── 2. FLOWING WATER PARTICLES ─────────────────────────────────── */}
      {/* Intake Particles */}
      <points ref={intakeParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleConfig.intake.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#38bdf8"
          size={0.035}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </points>

      {/* Filter Process Particles */}
      <points ref={filterParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleConfig.filter.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#22d3ee"
          size={0.035}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </points>

      {/* Purified Return Particles */}
      <points ref={returnParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleConfig.ret.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a5f3fc"
          size={0.035}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>

      {/* ─── 3. ELECTRICAL POWER CONDUIT LINES (Dashed Animated Lines) ── */}
      {/* Solar -> Battery */}
      <Line
        ref={solarPowerRef}
        points={wirePoints.solar}
        color="#fbbf24"
        lineWidth={2}
        dashed
        dashScale={5}
        dashSize={0.2}
        gapSize={0.15}
        transparent
        opacity={0.9}
      />

      {/* Battery -> ESP32 */}
      <Line
        ref={battPowerRef}
        points={wirePoints.batt}
        color="#10b981"
        lineWidth={2}
        dashed
        dashScale={5}
        dashSize={0.2}
        gapSize={0.15}
        transparent
        opacity={0.9}
      />

      {/* ESP32 -> Pump Power Conduit */}
      <Line
        ref={pumpPowerRef}
        points={wirePoints.pump}
        color="#06b6d4"
        lineWidth={1.5}
        dashed
        dashScale={4}
        dashSize={0.25}
        gapSize={0.2}
        transparent
        opacity={0.8}
      />

      {/* ESP32 -> Sensors Signal Ribbon */}
      <Line
        ref={sensorPowerRef}
        points={wirePoints.sensors}
        color="#a855f7"
        lineWidth={1.5}
        dashed
        dashScale={4}
        dashSize={0.25}
        gapSize={0.2}
        transparent
        opacity={0.8}
      />
    </group>
  );
};
