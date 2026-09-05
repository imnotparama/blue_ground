'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import gsap from 'gsap';
import * as THREE from 'three';

interface ControlsInterface {
  target: THREE.Vector3;
  update: () => void;
  enabled: boolean;
}

export const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  OVERVIEW: {
    position: [0.0, 0.25, 4.3],
    target: [0.0, -0.30, 0],
  },
  SOLAR: {
    position: [-1.65, 1.4, 1.3],
    target: [-1.65, 0.75, 0],
  },
  BATTERY: {
    position: [-0.65, 1.3, 1.3],
    target: [-0.65, 0.74, 0],
  },
  ESP32: {
    position: [0.40, 1.3, 1.3],
    target: [0.40, 0.74, 0],
  },
  DISPLAY: {
    position: [0.22, 0.85, 0.7],
    target: [0.22, 0.74, 0.20],
  },
  FLOAT_SENSOR: {
    position: [-1.10, 0.90, 1.1],
    target: [-1.10, 0.60, 0],
  },
  PUMP: {
    position: [1.35, 0.35, 1.1],
    target: [1.35, 0.10, 0],
  },
  UV_LED: {
    position: [0.35, -0.2, 0.9],
    target: [0.35, -0.40, 0.25],
  },
  PH_SENSOR: {
    position: [0.23, 0.78, 0.85],
    target: [0.23, 0.58, 0.20],
  },
  TDS_SENSOR: {
    position: [0.62, 0.78, 0.85],
    target: [0.62, 0.58, 0.20],
  },
  TURBIDITY_SENSOR: {
    position: [0.42, 0.78, 0.85],
    target: [0.42, 0.58, 0.20],
  },
  TEMP_SENSOR: {
    position: [0.80, 0.78, 0.85],
    target: [0.80, 0.58, 0.20],
  },
  FLOW_SENSOR: {
    position: [1.35, 0.50, 0.9],
    target: [1.35, 0.30, 0.0],
  },
  SEDIMENTATION_TANK: {
    position: [1.90, 0.3, 1.8],
    target: [1.90, 0.05, 0],
  },
  FILTER_HOUSING: {
    position: [-0.70, 0.60, 1.15],
    target: [-0.70, 0.40, -0.62],
  },
  INSIDE_FILTER: {
    position: [-0.70, 0.50, 0.45],
    target: [-0.70, 0.45, -0.62],
  },
  PRIMARY_TANK: {
    position: [-0.7, -0.3, 3.2],
    target: [-0.7, -0.55, 0],
  },
  SECONDARY_TANK: {
    position: [0.45, 0.45, 1.8],
    target: [0.45, 0.28, 0],
  },
  INTAKE_PIPE: {
    position: [2.8, 0.2, 1.8],
    target: [2.8, 0.0, 0],
  },
  RETURN_PIPE: {
    position: [1.45, 0.45, 1.5],
    target: [1.45, 0.30, 0],
  },
  DRAIN_VALVE: {
    position: [-2.62, -1.2, 1.2],
    target: [-2.62, -1.45, 0],
  },
  TANK2_VERIFICATION: {
    position: [-1.85, 0.45, 1.6],
    target: [-1.85, 0.15, 0],
  },
  RECIRCULATION_LOOP: {
    position: [-1.85, 0.15, 1.6],
    target: [-1.85, -0.22, 0],
  },
  HYDRO_GENERATOR: {
    position: [3.20, -0.80, 2.40],
    target: [2.85, -1.25, 0],
  },
  WATER_STAGE_1: {
    position: [2.8, 0.0, 2.2],
    target: [2.8, -0.4, 0],
  },
  WATER_STAGE_2: {
    position: [1.90, 0.30, 1.8],
    target: [1.90, 0.15, 0],
  },
  WATER_STAGE_3: {
    position: [-0.70, 0.60, 1.25],
    target: [-0.70, 0.40, -0.62],
  },
  WATER_STAGE_4: {
    position: [-1.85, 0.45, 1.6],
    target: [-1.85, 0.15, 0],
  },
  WATER_STAGE_5: {
    position: [-1.45, 0.35, 1.7],
    target: [-1.40, 0.15, -0.2],
  },
  WATER_STAGE_6: {
    position: [-0.70, -0.40, 2.6],
    target: [-0.70, -0.55, 0],
  },
  FILTER_VIEW: {
    position: [-0.70, 0.52, 1.35],
    target: [-0.70, 0.35, -0.62],
  },
  FILTER_STAGE_1: {
    position: [-1.36, 0.48, 0.55],
    target: [-1.36, 0.36, -0.62],
  },
  FILTER_STAGE_2: {
    position: [-0.92, 0.48, 0.55],
    target: [-0.92, 0.36, -0.62],
  },
  FILTER_STAGE_3: {
    position: [-0.48, 0.48, 0.55],
    target: [-0.48, 0.36, -0.62],
  },
  FILTER_STAGE_4: {
    position: [-0.04, 0.48, 0.55],
    target: [-0.04, 0.36, -0.62],
  },
};

export const CameraController = () => {
  const { cameraPreset, setCameraPreset, setActiveHotspot, activeHotspot } = useSystemState();
  const { camera, controls } = useThree();
  const activeTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (activeHotspot) {
      const presetMap: Record<string, CameraPreset> = {
        solar: 'SOLAR',
        battery: 'BATTERY',
        esp32: 'ESP32',
        display: 'DISPLAY',
        float: 'FLOAT_SENSOR',
        pump: 'PUMP',
        uv: 'UV_LED',
        ph: 'PH_SENSOR',
        tds: 'TDS_SENSOR',
        turbidity: 'TURBIDITY_SENSOR',
        temp: 'TEMP_SENSOR',
        flow: 'FLOW_SENSOR',
        sedimentation_tank: 'SEDIMENTATION_TANK',
        tank2_verification: 'TANK2_VERIFICATION',
        recirculation_loop: 'RECIRCULATION_LOOP',
        filter_housing: 'FILTER_HOUSING',
        filtration_tank: 'FILTER_HOUSING',
        primary_tank: 'PRIMARY_TANK',
        secondary_tank: 'SECONDARY_TANK',
        intake_pipe: 'INTAKE_PIPE',
        return_pipe: 'RETURN_PIPE',
        drain_valve: 'DRAIN_VALVE',
      };

      if (presetMap[activeHotspot] && presetMap[activeHotspot] !== cameraPreset) {
        setCameraPreset(presetMap[activeHotspot]);
      }
    }
  }, [activeHotspot, cameraPreset, setCameraPreset]);

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.OVERVIEW;
    const ctrl = controls as unknown as ControlsInterface;

    if (activeTimeline.current) {
      activeTimeline.current.kill();
    }

    const tl = gsap.timeline({
      defaults: {
        duration: 1.5,
        ease: 'power3.inOut',
      },
    });

    activeTimeline.current = tl;

    tl.to(
      camera.position,
      {
        x: preset.position[0],
        y: preset.position[1],
        z: preset.position[2],
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      },
      0
    );

    if (ctrl && ctrl.target) {
      tl.to(
        ctrl.target,
        {
          x: preset.target[0],
          y: preset.target[1],
          z: preset.target[2],
          onUpdate: () => {
            if (ctrl.update) ctrl.update();
          },
        },
        0
      );
    }

    return () => {
      if (tl) tl.kill();
    };
  }, [cameraPreset, camera, controls]);

  return null;
};
