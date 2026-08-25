'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

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

  const intakeParticlesRef = useRef<THREE.Points>(null);
  const filterParticlesRef = useRef<THREE.Points>(null);
  const directParticlesRef = useRef<THREE.Points>(null);
  const pumpParticlesRef = useRef<THREE.Points>(null);

  const intakeTubeMatRef = useRef<THREE.ShaderMaterial>(null);
  const filterTubeMatRef = useRef<THREE.ShaderMaterial>(null);

  const solarPowerRef = useRef<any>(null);
  const battPowerRef = useRef<any>(null);
  const espToFlowRef = useRef<any>(null);
  const espToUvRef = useRef<any>(null);
  const espToFloatRef = useRef<any>(null);

  // 1. DEFINE EXACT 3D PATH CURVES ACCORDING TO SKETCH
  const curves = useMemo(() => {
    // A. Borewell to Sedimentation Tank top
    const intakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.8, -1.8, 0),
      new THREE.Vector3(2.8, -0.5, 0),
      new THREE.Vector3(2.8, 0.75, 0),
      new THREE.Vector3(2.35, 0.75, 0),
      new THREE.Vector3(1.90, 0.75, 0),
      new THREE.Vector3(1.90, 0.70, 0),
    ], false, 'catmullrom', 0.02);

    // B. Sedimentation Tank to Secondary Compartment via Flow Sensor
    const filterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.62, 0.30, 0),
      new THREE.Vector3(1.45, 0.30, 0),
      new THREE.Vector3(1.20, 0.30, 0),
      new THREE.Vector3(1.00, 0.30, 0),
    ], false, 'catmullrom', 0.02);

    // C. Direct Passage Valve (Good water)
    const directCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 0.05, 0),
      new THREE.Vector3(0.5, -0.25, 0),
    ], false, 'catmullrom', 0.02);

    // D. Pump Filtration Loop (Bad water)
    const pumpCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 0.16, 0),
      new THREE.Vector3(-0.35, 0.40, 0),
      new THREE.Vector3(-0.825, 0.40, 0),
      new THREE.Vector3(-1.30, 0.40, 0),
      new THREE.Vector3(-1.30, 0.15, 0),
    ], false, 'catmullrom', 0.02);

    return { intakeCurve, filterCurve, directCurve, pumpCurve };
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
      intake: init(40),
      filter: init(25),
      direct: init(15),
      pump: init(25),
    };
  }, []);

  // 3. ELECTRICAL POWER & SIGNAL WIRING
  const wires = useMemo(() => {
    const solarToBatt = new THREE.LineCurve3(
      new THREE.Vector3(-1.65, 0.75, 0),
      new THREE.Vector3(-0.65, 0.75, 0)
    );
    const battToEsp = new THREE.LineCurve3(
      new THREE.Vector3(-0.65, 0.75, 0),
      new THREE.Vector3(0.40, 0.75, 0)
    );
    const espToFlow = new THREE.LineCurve3(
      new THREE.Vector3(0.60, 0.75, 0),
      new THREE.Vector3(1.45, 0.35, 0)
    );
    const espToUv = new THREE.LineCurve3(
      new THREE.Vector3(0.40, 0.60, 0),
      new THREE.Vector3(0.35, -0.35, 0.25)
    );
    const espToFloat = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.20, 0.75, 0),
      new THREE.Vector3(-1.0, 0.60, 0.2),
      new THREE.Vector3(-2.1, -0.40, 0.3),
    ]);

    return { solarToBatt, battToEsp, espToFlow, espToUv, espToFloat };
  }, []);

  const wirePoints = useMemo(() => {
    return {
      solar: wires.solarToBatt.getPoints(10),
      batt: wires.battToEsp.getPoints(10),
      flow: wires.espToFlow.getPoints(10),
      uv: wires.espToUv.getPoints(10),
      float: wires.espToFloat.getPoints(20),
    };
  }, [wires]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

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

    // Particle animations
    const updateParticles = (ref: React.RefObject<THREE.Points | null>, curve: THREE.Curve<THREE.Vector3>, progress: Float32Array) => {
      if (!ref.current) return;
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      const step = (metrics.flowRate / 5.0) * 0.22 * delta;

      for (let i = 0; i < progress.length; i++) {
        if (metrics.flowRate > 0) {
          progress[i] += step;
          if (progress[i] > 1.0) progress[i] = 0;
        }
        const pt = curve.getPointAt(progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    };

    updateParticles(intakeParticlesRef, curves.intakeCurve, particleConfig.intake.progress);
    updateParticles(filterParticlesRef, curves.filterCurve, particleConfig.filter.progress);

    if (metrics.waterQuality === 'EXCELLENT') {
      updateParticles(directParticlesRef, curves.directCurve, particleConfig.direct.progress);
    } else {
      updateParticles(pumpParticlesRef, curves.pumpCurve, particleConfig.pump.progress);
    }

    // Electrical wiring animation
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

    if (espToFlowRef.current && espToFlowRef.current.material) {
      espToFlowRef.current.material.dashOffset = -time * 0.4;
    }
    if (espToUvRef.current && espToUvRef.current.material) {
      espToUvRef.current.material.dashOffset = metrics.uvStatus === 'ON' ? -time * 0.6 : 0;
    }
    if (espToFloatRef.current && espToFloatRef.current.material) {
      espToFloatRef.current.material.dashOffset = -time * 0.3;
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

  return (
    <group>
      {/* ─── 1. GLOWING INTERNAL FLUID CORES ────────────────────────────── */}
      <mesh>
        <tubeGeometry args={[curves.intakeCurve, 30, 0.016, 8, false]} />
        <primitive object={intakeShaderMat} ref={intakeTubeMatRef} attach="material" />
      </mesh>

      <mesh>
        <tubeGeometry args={[curves.filterCurve, 20, 0.016, 8, false]} />
        <primitive object={filterShaderMat} ref={filterTubeMatRef} attach="material" />
      </mesh>

      {/* ─── 2. FLOWING PARTICLES ───────────────────────────────────────── */}
      <points ref={intakeParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleConfig.intake.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#38bdf8" size={0.035} transparent opacity={0.85} depthWrite={false} />
      </points>

      <points ref={filterParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleConfig.filter.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#22d3ee" size={0.035} transparent opacity={0.85} depthWrite={false} />
      </points>

      {metrics.waterQuality === 'EXCELLENT' ? (
        <points ref={directParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particleConfig.direct.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial color="#10b981" size={0.035} transparent opacity={0.85} depthWrite={false} />
        </points>
      ) : (
        <points ref={pumpParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particleConfig.pump.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial color="#f59e0b" size={0.035} transparent opacity={0.85} depthWrite={false} />
        </points>
      )}

      {/* ─── 3. ELECTRICAL WIRING LINES (AS DRAWN IN SKETCH) ────────────── */}
      {/* Solar -> Battery (+/-) */}
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

      {/* Battery -> Unit & Control */}
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

      {/* Unit & Control -> Flow Sensor Signal Line */}
      <Line
        ref={espToFlowRef}
        points={wirePoints.flow}
        color="#06b6d4"
        lineWidth={1.5}
        dashed
        dashScale={4}
        dashSize={0.2}
        gapSize={0.15}
        transparent
        opacity={0.8}
      />

      {/* Unit & Control -> UV Light Wire */}
      <Line
        ref={espToUvRef}
        points={wirePoints.uv}
        color="#fef08a"
        lineWidth={1.5}
        dashed
        dashScale={4}
        dashSize={0.2}
        gapSize={0.15}
        transparent
        opacity={0.8}
      />

      {/* Unit & Control -> Float Sensor Signal Line */}
      <Line
        ref={espToFloatRef}
        points={wirePoints.float}
        color="#a855f7"
        lineWidth={1.5}
        dashed
        dashScale={4}
        dashSize={0.2}
        gapSize={0.15}
        transparent
        opacity={0.8}
      />
    </group>
  );
};
