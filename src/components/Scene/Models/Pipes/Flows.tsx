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
  const { 
    metrics, 
    mode, 
    envMode, 
    dualVerificationMode, 
    recirculationTriggered, 
    hydroGeneratorMode 
  } = useSystemState();

  const intakeParticlesRef = useRef<THREE.Points>(null);
  const filterParticlesRef = useRef<THREE.Points>(null);
  const directParticlesRef = useRef<THREE.Points>(null);
  const pumpParticlesRef = useRef<THREE.Points>(null);
  const recircParticlesRef = useRef<THREE.Points>(null);

  const intakeTubeMatRef = useRef<THREE.ShaderMaterial>(null);
  const filterTubeMatRef = useRef<THREE.ShaderMaterial>(null);
  const roTubeMatRef = useRef<THREE.ShaderMaterial>(null);

  const solarPowerRef = useRef<any>(null);
  const battPowerRef = useRef<any>(null);
  const hydroPowerRef = useRef<any>(null);
  const espToFlowRef = useRef<any>(null);
  const espToUvRef = useRef<any>(null);
  const espToFloatRef = useRef<any>(null);

  // 1. DEFINE EXACT 3D PATH CURVES FOR WATER PIPING
  const curves = useMemo(() => {
    // A. Borewell / Hand Pump to Sedimentation Tank top
    const intakeCurve = hydroGeneratorMode
      ? new THREE.CatmullRomCurve3([
          new THREE.Vector3(2.52, -1.09, 0),
          new THREE.Vector3(2.52, -0.40, 0),
          new THREE.Vector3(2.52, 0.78, 0),
          new THREE.Vector3(2.21, 0.78, 0),
          new THREE.Vector3(1.90, 0.78, 0),
          new THREE.Vector3(1.90, 0.72, 0),
        ], false, 'catmullrom', 0.02)
      : new THREE.CatmullRomCurve3([
          new THREE.Vector3(2.8, -1.8, 0),
          new THREE.Vector3(2.8, -0.5, 0),
          new THREE.Vector3(2.8, 0.78, 0),
          new THREE.Vector3(2.35, 0.78, 0),
          new THREE.Vector3(1.90, 0.78, 0),
          new THREE.Vector3(1.90, 0.72, 0),
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
      new THREE.Vector3(0.70, 0.05, 0),
      new THREE.Vector3(0.70, -0.25, 0),
    ], false, 'catmullrom', 0.02);

    // D. Pump [0.05, 0.08] -> RO Filtration Tank [-1.40, 0.38] -> Tank 2 Inlet [-1.85, 0.15]
    const pumpCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.08, 0),
      new THREE.Vector3(0.05, 0.38, 0),
      new THREE.Vector3(-0.45, 0.38, 0),
      new THREE.Vector3(-0.95, 0.38, 0),
      new THREE.Vector3(-1.85, 0.38, 0),
      new THREE.Vector3(-1.85, 0.15, 0),
    ], false, 'catmullrom', 0.02);

    // E. Tank 2 to Primary Clean Reservoir (Good Post-RO Water)
    const tank2DeliveryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.19, 0.03, 0),
      new THREE.Vector3(-2.27, 0.03, 0),
      new THREE.Vector3(-2.27, -0.45, 0),
    ], false, 'catmullrom', 0.02);

    // F. Tank 2 Recirculation Return Loop (Sub-Standard Post-RO Water -> Riser -> RO Filter Inlet -> Filter Media)
    const recirculationCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.70, -0.11, 0),
      new THREE.Vector3(-1.70, -0.22, 0),
      new THREE.Vector3(-1.25, -0.22, 0),
      new THREE.Vector3(-0.88, -0.22, 0),
      new THREE.Vector3(-0.88, 0.10, 0),
      new THREE.Vector3(-0.88, 0.38, 0),
      new THREE.Vector3(-1.15, 0.38, 0),
      new THREE.Vector3(-1.40, 0.38, 0),
      new THREE.Vector3(-1.85, 0.38, 0),
      new THREE.Vector3(-1.85, 0.15, 0),
    ], false, 'catmullrom', 0.02);

    return { intakeCurve, filterCurve, directCurve, pumpCurve, tank2DeliveryCurve, recirculationCurve };
  }, [hydroGeneratorMode]);

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
      pump: init(35),
      recirc: init(30),
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
    const hydroToBatt = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.52, -0.22, 0.09),
      new THREE.Vector3(2.52, 0.78, 0.05),
      new THREE.Vector3(1.2, 0.78, 0.05),
      new THREE.Vector3(-0.65, 0.75, 0),
    ]);

    return { solarToBatt, battToEsp, espToFlow, espToUv, espToFloat, hydroToBatt };
  }, [hydroGeneratorMode]);

  const wirePoints = useMemo(() => {
    return {
      solar: wires.solarToBatt.getPoints(10),
      batt: wires.battToEsp.getPoints(10),
      flow: wires.espToFlow.getPoints(10),
      uv: wires.espToUv.getPoints(10),
      float: wires.espToFloat.getPoints(20),
      hydro: wires.hydroToBatt.getPoints(25),
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
    if (roTubeMatRef.current) {
      roTubeMatRef.current.uniforms.uTime.value = time;
      roTubeMatRef.current.uniforms.uSpeed.value = speedScale;
      roTubeMatRef.current.uniforms.uFlowActive.value = metrics.waterQuality !== 'EXCELLENT' ? 1.0 : 0.0;
    }

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

    const isRecirculating = dualVerificationMode && (recirculationTriggered || (metrics.tds2 || 0) > 100 || (metrics.turbidity2 || 0) > 1.0);

    if (metrics.waterQuality === 'EXCELLENT') {
      updateParticles(directParticlesRef, curves.directCurve, particleConfig.direct.progress);
    } else {
      updateParticles(pumpParticlesRef, curves.pumpCurve, particleConfig.pump.progress);
      if (dualVerificationMode) {
        if (isRecirculating) {
          updateParticles(recircParticlesRef, curves.recirculationCurve, particleConfig.recirc.progress);
        } else {
          updateParticles(directParticlesRef, curves.tank2DeliveryCurve, particleConfig.direct.progress);
        }
      } else {
        // Setup 1 Direct Single-Pass to Primary Clean Tank
        updateParticles(directParticlesRef, curves.directCurve, particleConfig.direct.progress);
      }
    }

    // Power wiring animations
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

    if (hydroPowerRef.current && hydroPowerRef.current.material) {
      const isHydroCharging = hydroGeneratorMode && metrics.flowRate > 0.2;
      hydroPowerRef.current.material.dashOffset = isHydroCharging ? -time * 1.6 : 0;
      hydroPowerRef.current.material.opacity = isHydroCharging ? 0.95 : 0.02;
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

  const roShaderMat = useMemo(() => {
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
      {/* Fluid Tube Meshes */}
      <mesh>
        <tubeGeometry args={[curves.intakeCurve, 30, 0.016, 8, false]} />
        <primitive object={intakeShaderMat} ref={intakeTubeMatRef} attach="material" />
      </mesh>

      <mesh>
        <tubeGeometry args={[curves.filterCurve, 20, 0.016, 8, false]} />
        <primitive object={filterShaderMat} ref={filterTubeMatRef} attach="material" />
      </mesh>

      <mesh>
        <tubeGeometry args={[curves.pumpCurve, 30, 0.016, 8, false]} />
        <primitive object={roShaderMat} ref={roTubeMatRef} attach="material" />
      </mesh>

      {/* Flowing Water Particles */}
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
        <>
          <points ref={pumpParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[particleConfig.pump.positions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial color="#38bdf8" size={0.035} transparent opacity={0.85} depthWrite={false} />
          </points>

          <points ref={recircParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[particleConfig.recirc.positions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial color="#f59e0b" size={0.035} transparent opacity={0.85} depthWrite={false} />
          </points>
        </>
      )}

      {/* Electrical Power & Signal Wiring */}
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

      {hydroGeneratorMode && (
        <Line
          ref={hydroPowerRef}
          points={wirePoints.hydro}
          color="#38bdf8"
          lineWidth={2.5}
          dashed
          dashScale={6}
          dashSize={0.25}
          gapSize={0.12}
          transparent
          opacity={0.95}
        />
      )}
    </group>
  );
};
