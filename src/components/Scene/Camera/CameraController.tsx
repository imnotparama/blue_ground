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

// Camera coordinates based on engineering layout
// Centered around:
// Primary tank: x in [-2.0, 1.0], y in [-1.5, 1.2], z in [-1.0, 1.0]
// Secondary tank: x in [0.2, 1.0], y in [0.2, 1.2], z in [-0.8, 0.8] (inside primary)
// Electronics: on top (y in [1.2, 1.8])
// Solar: top-left (x=-1.5)
// Battery: top-middle (x=-0.2)
// ESP32: top-right (x=0.7)
// Filtration: right-side (x=2.2, y=-0.5)
// Intake: far-right (x=3.8, extending down to y=-3.5)
export const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  OVERVIEW: {
    position: [0.3, 0.2, 4.4],
    target: [0.3, -0.5, 0],
  },
  SOLAR: {
    position: [-1.4, 1.3, 1.3],
    target: [-1.4, 0.7, 0],
  },
  BATTERY: {
    position: [-0.2, 1.0, 1.1],
    target: [-0.2, 0.52, 0],
  },
  ESP32: {
    position: [0.7, 1.0, 1.0],
    target: [0.7, 0.52, 0],
  },
  DISPLAY: {
    position: [0.7, 0.65, 0.6],
    target: [0.7, 0.52, 0.25],
  },
  FLOAT_SENSOR: {
    position: [-1.2, -0.2, 1.0],
    target: [-1.5, -0.5, 0],
  },
  PUMP: {
    position: [0.3, -0.1, 0.9],
    target: [0.3, -0.28, 0],
  },
  UV_LED: {
    position: [0.4, 0.1, 0.9],
    target: [0.4, -0.15, 0.3],
  },
  PH_SENSOR: {
    position: [0.7, 0.4, 0.9],
    target: [0.7, 0.18, -0.1],
  },
  TDS_SENSOR: {
    position: [0.55, 0.4, 0.9],
    target: [0.55, 0.18, 0.15],
  },
  TURBIDITY_SENSOR: {
    position: [0.85, 0.4, 0.9],
    target: [0.85, 0.18, 0.15],
  },
  TEMP_SENSOR: {
    position: [0.62, 0.4, 0.9],
    target: [0.62, 0.14, -0.22],
  },
  FLOW_SENSOR: {
    position: [1.6, 0.2, 0.9],
    target: [1.6, 0.0, 0],
  },
  SEDIMENTATION_TANK: {
    position: [0.1, 0.3, 1.4],
    target: [0.1, 0.0, 0],
  },
  FILTER_HOUSING: {
    position: [2.2, -0.4, 1.6],
    target: [2.2, -0.6, 0],
  },
  INSIDE_FILTER: {
    position: [2.2, -0.6, 0.9],
    target: [2.2, -0.6, 0],
  },
  PRIMARY_TANK: {
    position: [-0.6, -0.6, 2.4],
    target: [-0.6, -0.6, 0],
  },
  SECONDARY_TANK: {
    position: [0.1, 0.3, 1.4],
    target: [0.1, 0.0, 0],
  },
  INTAKE_PIPE: {
    position: [3.8, -2.0, 1.8],
    target: [3.8, -2.5, 0],
  },
  RETURN_PIPE: {
    position: [-0.4, -0.6, 1.8],
    target: [-0.6, -0.6, 0],
  },
  DRAIN_VALVE: {
    position: [0.5, -1.2, 0.9],
    target: [0.5, -1.5, 0],
  },
};

export const CameraController = () => {
  const { cameraPreset, demoRunning } = useSystemState();
  const { camera, controls } = useThree();
  
  // Track ongoing tweens to prevent overlaps
  const tweenRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    if (!preset) return;

    // Clean up active animations
    tweenRef.current.forEach(t => t.kill());
    tweenRef.current = [];

    // Duration based on demo state (slightly faster cuts in demo, slower/gentler in manual mode)
    const duration = demoRunning ? 2.2 : 2.5;

    // Cast controls to ControlsInterface
    const orbitControls = controls as unknown as ControlsInterface;

    if (orbitControls) {
      // Temporarily lock user control during auto-move
      orbitControls.enabled = false;

      // Tween controls target
      const targetTween = gsap.to(orbitControls.target, {
        x: preset.target[0],
        y: preset.target[1],
        z: preset.target[2],
        duration: duration,
        ease: 'power3.inOut',
        onUpdate: () => orbitControls.update(),
      });

      // Tween camera position
      const posTween = gsap.to(camera.position, {
        x: preset.position[0],
        y: preset.position[1],
        z: preset.position[2],
        duration: duration,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
        onComplete: () => {
          // Re-enable controls, unless demo is running (keep it cinematic/guided)
          orbitControls.enabled = !demoRunning;
        },
      });

      tweenRef.current = [targetTween, posTween];
    } else {
      // If OrbitControls is not ready yet, update camera directly
      const targetVec = new THREE.Vector3(...preset.target);
      
      const posTween = gsap.to(camera.position, {
        x: preset.position[0],
        y: preset.position[1],
        z: preset.position[2],
        duration: duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(targetVec);
          camera.updateProjectionMatrix();
        },
      });
      tweenRef.current = [posTween];
    }

    return () => {
      tweenRef.current.forEach(t => t.kill());
    };
  }, [cameraPreset, camera, controls, demoRunning]);

  // In demo running mode, ensure the user cannot interact with the orbit controls
  useEffect(() => {
    const orbitControls = controls as unknown as ControlsInterface;
    if (orbitControls) {
      orbitControls.enabled = !demoRunning;
    }
  }, [demoRunning, controls]);

  return null;
};
