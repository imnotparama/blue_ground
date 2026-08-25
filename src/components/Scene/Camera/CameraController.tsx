'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import gsap from 'gsap';
import * as THREE from 'three';

// Type definition for OrbitControls reference
interface ControlsInterface {
  target: THREE.Vector3;
  update: () => void;
  enabled: boolean;
}

// Camera coordinates based on accurate physical layout
export const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  OVERVIEW: {
    position: [0.0, 0.8, 6.2],
    target: [0.0, -0.7, 0],
  },
  SOLAR: {
    position: [-2.0, 1.3, 1.4],
    target: [-2.0, 0.45, 0],
  },
  BATTERY: {
    position: [-1.45, 0.9, 1.2],
    target: [-1.45, 0.35, 0.35],
  },
  ESP32: {
    position: [-1.45, 0.9, 0.6],
    target: [-1.45, 0.35, -0.35],
  },
  DISPLAY: {
    position: [-1.33, 0.45, 0.4],
    target: [-1.33, 0.32, -0.17],
  },
  FLOAT_SENSOR: {
    position: [-2.6, -0.8, 1.1],
    target: [-2.6, -1.0, 0.3],
  },
  PUMP: {
    position: [1.55, -1.3, 0.9],
    target: [1.55, -1.65, 0],
  },
  UV_LED: {
    position: [2.0, -0.5, 0.7],
    target: [2.02, -0.85, -0.22],
  },
  PH_SENSOR: {
    position: [2.02, 0.1, 0.9],
    target: [2.02, -0.25, 0.20],
  },
  TDS_SENSOR: {
    position: [1.88, 0.1, 0.9],
    target: [1.88, -0.25, 0.15],
  },
  TURBIDITY_SENSOR: {
    position: [2.18, 0.1, 0.9],
    target: [2.18, -0.25, 0.15],
  },
  TEMP_SENSOR: {
    position: [2.32, 0.1, 0.7],
    target: [2.32, -0.25, -0.15],
  },
  FLOW_SENSOR: {
    position: [0.85, -1.3, 0.8],
    target: [0.85, -1.65, 0],
  },
  SEDIMENTATION_TANK: {
    position: [0.15, -0.5, 2.0],
    target: [0.15, -0.95, 0],
  },
  FILTER_HOUSING: {
    position: [0.15, -0.5, 2.0],
    target: [0.15, -0.95, 0],
  },
  INSIDE_FILTER: {
    position: [0.15, -0.8, 1.0],
    target: [0.15, -0.95, 0],
  },
  PRIMARY_TANK: {
    position: [-2.0, -0.5, 3.2],
    target: [-2.0, -0.75, 0],
  },
  SECONDARY_TANK: {
    position: [2.1, -0.6, 2.4],
    target: [2.1, -1.0, 0],
  },
  INTAKE_PIPE: {
    position: [3.6, -0.8, 1.8],
    target: [3.6, -1.0, 0],
  },
  RETURN_PIPE: {
    position: [-0.4, -1.4, 1.8],
    target: [-0.4, -1.90, 0],
  },
  DRAIN_VALVE: {
    position: [-3.35, -1.1, 1.2],
    target: [-3.35, -1.35, 0],
  },
};

export const CameraController = () => {
  const { cameraPreset, setCameraPreset, setActiveHotspot, activeHotspot } = useSystemState();
  const { camera, controls } = useThree();
  const activeTimeline = useRef<gsap.core.Timeline | null>(null);

  // Sync Hotspot selection to Camera Preset
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
        filter_housing: 'FILTER_HOUSING',
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

  // Smooth GSAP camera transition when cameraPreset changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.OVERVIEW;
    const ctrl = controls as unknown as ControlsInterface;

    if (activeTimeline.current) {
      activeTimeline.current.kill();
    }

    const tl = gsap.timeline({
      defaults: {
        duration: 1.4,
        ease: 'power2.inOut',
      },
    });

    activeTimeline.current = tl;

    // Animate Camera Position
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

    // Animate OrbitControls Target LookAt Point
    if (ctrl && ctrl.target) {
      tl.to(
        ctrl.target,
        {
          x: preset.target[0],
          y: preset.target[1],
          z: preset.target[2],
          onUpdate: () => {
            ctrl.update();
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
