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
    target: [-0.10, -0.75, -0.05],
  },
  SOLAR: {
    position: [0.0, 1.6, 2.2],
    target: [0.0, 0.75, 0.1],
  },
  BATTERY: {
    position: [0.0, 0.65, 1.5],
    target: [0.0, 0.28, 0.38],
  },
  ESP32: {
    position: [0.0, 0.65, 1.5],
    target: [0.0, 0.28, 0.38],
  },
  DISPLAY: {
    position: [0.0, 0.55, 1.1],
    target: [0.0, 0.28, 0.38],
  },
  FLOAT_SENSOR: {
    position: [-0.10, -1.10, 1.8],
    target: [-0.10, -1.45, -0.04],
  },
  PUMP: {
    position: [1.40, -0.65, -0.10],
    target: [0.55, -0.95, -0.62],
  },
  UV_LED: {
    position: [-0.10, -1.15, -1.8],
    target: [-0.10, -1.35, -0.62],
  },
  PH_SENSOR: {
    position: [-0.10, -0.55, 1.2],
    target: [-0.10, -0.85, -0.04],
  },
  TDS_SENSOR: {
    position: [-0.10, -0.55, 1.2],
    target: [-0.10, -0.85, -0.04],
  },
  TURBIDITY_SENSOR: {
    position: [-0.10, -0.55, 1.2],
    target: [-0.10, -0.85, -0.04],
  },
  TEMP_SENSOR: {
    position: [-0.10, -0.55, 1.2],
    target: [-0.10, -0.85, -0.04],
  },
  FLOW_SENSOR: {
    position: [1.35, -0.65, 0.8],
    target: [0.72, -0.70, 0.20],
  },
  SEDIMENTATION_TANK: {
    position: [1.65, -0.50, 1.6],
    target: [0.72, -0.70, 0.20],
  },
  FILTER_HOUSING: {
    position: [-0.10, -0.40, -1.9],
    target: [-0.10, -0.75, -0.62],
  },
  INSIDE_FILTER: {
    position: [-0.10, -0.55, -1.3],
    target: [-0.10, -0.75, -0.62],
  },
  PRIMARY_TANK: {
    position: [-0.10, -1.30, 2.4],
    target: [-0.10, -1.85, -0.04],
  },
  SECONDARY_TANK: {
    position: [-0.10, -0.55, 1.4],
    target: [-0.10, -0.85, -0.04],
  },
  INTAKE_PIPE: {
    position: [1.65, -0.40, 1.6],
    target: [0.80, -0.48, 0.25],
  },
  RETURN_PIPE: {
    position: [-0.10, -1.30, 2.0],
    target: [-0.10, -1.75, -0.04],
  },
  DRAIN_VALVE: {
    position: [0.95, -1.50, 1.2],
    target: [0.55, -1.75, 0.55],
  },
  TANK2_VERIFICATION: {
    position: [-0.10, -0.55, 1.4],
    target: [-0.10, -0.85, -0.04],
  },
  SETUP1_DIRECT: {
    position: [-0.10, -1.30, 2.4],
    target: [-0.10, -1.85, -0.04],
  },
  RECIRCULATION_LOOP: {
    position: [-0.10, -0.50, -1.8],
    target: [-0.10, -0.75, -0.62],
  },
  HYDRO_GENERATOR: {
    position: [0.95, -1.50, 1.2],
    target: [0.55, -1.75, 0.55],
  },
  WATER_STAGE_1: {
    position: [1.65, -0.40, 1.6],
    target: [0.80, -0.48, 0.25],
  },
  WATER_STAGE_2: {
    position: [1.65, -0.65, 1.4],
    target: [0.72, -0.89, 0.14],
  },
  WATER_STAGE_3: {
    position: [1.40, -0.70, -0.10],
    target: [0.55, -0.95, -0.62],
  },
  WATER_STAGE_4: {
    position: [-0.10, -0.50, -1.8],
    target: [-0.10, -0.75, -0.62],
  },
  WATER_STAGE_5: {
    position: [-0.10, -1.15, -1.8],
    target: [-0.10, -1.35, -0.62],
  },
  WATER_STAGE_6: {
    position: [-0.10, -1.30, 2.4],
    target: [-0.10, -1.85, -0.04],
  },
  FILTER_VIEW: {
    position: [-0.10, -0.40, -1.9],
    target: [-0.10, -0.75, -0.62],
  },
  FILTER_STAGE_1: {
    position: [-0.35, -0.55, -1.5],
    target: [-0.25, -0.75, -0.62],
  },
  FILTER_STAGE_2: {
    position: [-0.10, -0.55, -1.5],
    target: [-0.10, -0.75, -0.62],
  },
  FILTER_STAGE_3: {
    position: [0.10, -0.55, -1.5],
    target: [0.05, -0.75, -0.62],
  },
  FILTER_STAGE_4: {
    position: [0.30, -0.55, -1.5],
    target: [0.20, -0.75, -0.62],
  },
  // Studio Photo Mode Cinematic Camera Angles
  PHOTO_HERO_34: {
    position: [2.1, 0.35, 3.2],
    target: [-0.10, -0.65, -0.05],
  },
  PHOTO_SOLAR_TOP: {
    position: [0.0, 1.85, 1.7],
    target: [-0.10, 0.45, -0.10],
  },
  PHOTO_FILTERS_DETAIL: {
    position: [-0.85, -0.55, -1.25],
    target: [-0.10, -0.75, -0.62],
  },
  PHOTO_WATER_TANKS: {
    position: [0.85, -1.35, 1.95],
    target: [-0.10, -1.65, -0.05],
  },
  PHOTO_VILLAGE_VISTA: {
    position: [0.0, 0.35, 5.2],
    target: [-0.10, -0.65, -0.05],
  },
  PHOTO_HANDPUMP_STATION: {
    position: [3.1, -1.45, 2.2],
    target: [1.4, -1.55, 0.2],
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
        temp_sensor: 'TEMP_SENSOR',
        flow: 'FLOW_SENSOR',
        sedimentation_tank: 'SEDIMENTATION_TANK',
        sedimentation: 'SEDIMENTATION_TANK',
        tank2_verification: 'TANK2_VERIFICATION',
        tank2: 'TANK2_VERIFICATION',
        setup1_direct: 'SETUP1_DIRECT',
        recirculation_loop: 'RECIRCULATION_LOOP',
        filter_housing: 'FILTER_HOUSING',
        filters: 'FILTER_VIEW',
        filter: 'FILTER_HOUSING',
        filtration_tank: 'FILTER_HOUSING',
        primary_tank: 'PRIMARY_TANK',
        secondary_tank: 'SECONDARY_TANK',
        intake_pipe: 'INTAKE_PIPE',
        return_pipe: 'RETURN_PIPE',
        drain_valve: 'DRAIN_VALVE',
        tds2: 'TANK2_VERIFICATION',
        ph2: 'TANK2_VERIFICATION',
        turbidity2: 'TANK2_VERIFICATION',
        hydro_generator: 'HYDRO_GENERATOR',
        hand_pump: 'INTAKE_PIPE',
        raw_inlet: 'SEDIMENTATION_TANK',
        tank_basement: 'PRIMARY_TANK',
        clean_tank: 'PRIMARY_TANK',
        sediment: 'SEDIMENTATION_TANK',
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
