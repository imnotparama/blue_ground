'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

// Define the operational modes
export type SystemMode =
  | 'NORMAL'
  | 'NIGHT'
  | 'TURBIDITY'
  | 'LOW_BATTERY'
  | 'PUMP_FAILURE'
  | 'MAINTENANCE'
  | 'CLEANING';

// Define the environmental modes
export type EnvironmentalMode = 'SUNNY' | 'MORNING' | 'CLOUDY' | 'RAIN' | 'NIGHT';

// Camera presets
export type CameraPreset =
  | 'OVERVIEW'
  | 'SOLAR'
  | 'BATTERY'
  | 'ESP32'
  | 'DISPLAY'
  | 'FLOAT_SENSOR'
  | 'PUMP'
  | 'UV_LED'
  | 'PH_SENSOR'
  | 'TDS_SENSOR'
  | 'TURBIDITY_SENSOR'
  | 'TEMP_SENSOR'
  | 'FLOW_SENSOR'
  | 'SEDIMENTATION_TANK'
  | 'FILTER_HOUSING'
  | 'INSIDE_FILTER'
  | 'PRIMARY_TANK'
  | 'SECONDARY_TANK'
  | 'INTAKE_PIPE'
  | 'RETURN_PIPE'
  | 'DRAIN_VALVE';

// Sensor and operational metrics structure
export interface SystemMetrics {
  batteryPercent: number;
  solarWatts: number;
  currentDraw: number;
  waterLevel: number; // 0 to 100
  flowRate: number; // L/min
  ph: number;
  tds: number; // ppm
  turbidity: number; // NTU
  temperature: number; // °C
  pumpRpm: number;
  filterHealth: number; // 0 to 100
  uvStatus: 'ON' | 'OFF';
  esp32Online: boolean;
  wifiSignal: number; // -30 to -90 dBm
  cloudSync: 'SYNCED' | 'SYNCING' | 'ERROR';
  tankCapacity: number; // Liters
  waterQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
}

// Guided presentation step structure
export interface PresentationStep {
  target: CameraPreset;
  title: string;
  description: string;
  duration: number; // in milliseconds
  actions?: (setMetrics: React.Dispatch<React.SetStateAction<SystemMetrics>>, setMode: (m: SystemMode) => void) => void;
}

interface SystemStateContextType {
  mode: SystemMode;
  setMode: (mode: SystemMode) => void;
  envMode: EnvironmentalMode;
  setEnvMode: (envMode: EnvironmentalMode) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  exploded: boolean;
  setExploded: (val: boolean) => void;
  cutaway: boolean;
  setCutaway: (val: boolean) => void;
  transparent: boolean;
  setTransparent: (val: boolean) => void;
  metrics: SystemMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<SystemMetrics>>;
  // Landing screen state
  landingVisited: boolean;
  setLandingVisited: (val: boolean) => void;
  // Guided presentation state
  demoRunning: boolean;
  demoStep: number;
  setDemoStep: (step: number) => void;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStepData: PresentationStep | null;
  // Hotspot interaction
  activeHotspot: string | null;
  setActiveHotspot: (id: string | null) => void;
}

const SystemStateContext = createContext<SystemStateContextType | undefined>(undefined);

// Initial metrics based on normal state
const defaultMetrics: SystemMetrics = {
  batteryPercent: 88,
  solarWatts: 45,
  currentDraw: 12,
  waterLevel: 65,
  flowRate: 4.8,
  ph: 7.2,
  tds: 145,
  turbidity: 1.2,
  temperature: 24.5,
  pumpRpm: 1800,
  filterHealth: 98,
  uvStatus: 'ON',
  esp32Online: true,
  wifiSignal: -55,
  cloudSync: 'SYNCED',
  tankCapacity: 250,
  waterQuality: 'EXCELLENT',
};

// Guided AI Presentation Steps
const presentationSteps: PresentationStep[] = [
  {
    target: 'OVERVIEW',
    title: 'Smart Water Purification System',
    description: 'Welcome to the premium Apple-inspired 3D experience. This IoT-enabled water purifier is self-sustaining and solar-powered. Let\'s take a tour of the system.',
    duration: 6000,
  },
  {
    target: 'SOLAR',
    title: 'Monocrystalline Solar Array',
    description: 'The system is crowned by a high-efficiency solar panel. Under sunny conditions, it outputs up to 60W, harvesting energy to power the ESP32 controller, water pump, and UV sterilizer.',
    duration: 5000,
    actions: (setMetrics, setMode) => {
      setMode('NORMAL');
      setMetrics(prev => ({ ...prev, solarWatts: 58, batteryPercent: Math.min(prev.batteryPercent + 1, 100) }));
    },
  },
  {
    target: 'BATTERY',
    title: 'Smart Lithium Storage Enclosure',
    description: 'A custom battery enclosure houses high-capacity lithium cells. It regulates power delivery, tracks charging status, and provides 24-hour backup energy storage.',
    duration: 5000,
  },
  {
    target: 'ESP32',
    title: 'ESP32 IoT Central Core',
    description: 'The brain of the system is an ESP32 microcontroller, housed inside a dustproof electronics box. It polls sensors, regulates pump speeds, drives the TFT display, and syncs data to the cloud.',
    duration: 5500,
  },
  {
    target: 'SECONDARY_TANK',
    title: 'Secondary Monitoring Tank',
    description: 'Raw water fills this upper-right secondary chamber. Embedded TDS, pH, and Turbidity probes analyze chemical and physical water quality before any filtration begins.',
    duration: 5500,
  },
  {
    target: 'PUMP',
    title: 'High-Efficiency Filtration Pump',
    description: 'Inside the secondary tank, a submerged water pump activates. It pushes raw water upward through the pipe, passing the external flow sensor toward the filter housing.',
    duration: 5000,
    actions: (setMetrics) => {
      setMetrics(prev => ({ ...prev, pumpRpm: 2400, flowRate: 5.2, uvStatus: 'ON' }));
    },
  },
  {
    target: 'FLOW_SENSOR',
    title: 'Inline Flow Rate Sensor',
    description: 'A physical flow-wheel sensor monitors real-time volumetric throughput (L/min). Any drop in flow speed triggers a warning on the ESP32 and alerts maintenance.',
    duration: 4500,
  },
  {
    target: 'FILTER_HOUSING',
    title: 'Sedimentation & Multi-Layer Filter',
    description: 'Water enters the external filtration housing, gravity-filtering through Coarse Mesh, Gravel, Sand, Activated Carbon, and Fine Filters to strip away physical particles and contaminants.',
    duration: 6500,
  },
  {
    target: 'RETURN_PIPE',
    title: 'Purified Return Pipe',
    description: 'Pure, sparkling water leaves the filter base and returns through the PVC return pipe, cascading back into the main storage chamber.',
    duration: 5000,
  },
  {
    target: 'PRIMARY_TANK',
    title: 'Primary Storage Water Tank',
    description: 'A spacious transparent main reservoir holds the clean water. An internal float sensor monitors capacity, and a drain valve at the bottom allows for automatic flushing and cleaning.',
    duration: 6000,
    actions: (setMetrics) => {
      setMetrics(prev => ({ ...prev, waterLevel: 75, waterQuality: 'EXCELLENT' }));
    },
  },
  {
    target: 'OVERVIEW',
    title: 'Eco-System Fully Operational',
    description: 'All nodes are online. The system is operating at 98% filter efficiency. You can now explore the system manually, toggle visual modes, or run specific operational simulations.',
    duration: 7000,
  },
];

export const SystemStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SystemMode>('NORMAL');
  const [envMode, setEnvMode] = useState<EnvironmentalMode>('SUNNY');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('OVERVIEW');
  const [exploded, setExploded] = useState(false);
  const [cutaway, setCutaway] = useState(false);
  const [transparent, setTransparent] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [landingVisited, setLandingVisited] = useState(false);

  // Guided tour state
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Mode changes and adjust metrics dynamically
  const setMode = (newMode: SystemMode) => {
    setModeState(newMode);
    setActiveHotspot(null);

    // Dynamic state adjustments based on Mode
    switch (newMode) {
      case 'NORMAL':
        setEnvMode('SUNNY');
        setMetrics(prev => ({
          ...prev,
          batteryPercent: 85,
          solarWatts: 52,
          currentDraw: 14,
          flowRate: 5.0,
          pumpRpm: 1800,
          uvStatus: 'ON',
          turbidity: 1.1,
          tds: 130,
          ph: 7.2,
          esp32Online: true,
          waterQuality: 'EXCELLENT',
        }));
        break;
      case 'NIGHT':
        setEnvMode('NIGHT');
        setMetrics(prev => ({
          ...prev,
          solarWatts: 0,
          currentDraw: 16, // battery discharge
          batteryPercent: 62,
          pumpRpm: 1200,
          flowRate: 3.2,
          uvStatus: 'ON',
          esp32Online: true,
        }));
        break;
      case 'TURBIDITY':
        setMetrics(prev => ({
          ...prev,
          turbidity: 48.5, // Critical levels
          tds: 380,
          ph: 6.4,
          waterQuality: 'POOR',
          flowRate: 4.2,
          pumpRpm: 2200, // pumping harder
        }));
        break;
      case 'LOW_BATTERY':
        setMetrics(prev => ({
          ...prev,
          batteryPercent: 6,
          currentDraw: 3.5, // Power conservation mode
          solarWatts: 2,
          pumpRpm: 400, // slow speed
          flowRate: 1.1,
          uvStatus: 'OFF', // Shut off UV to conserve power
          waterQuality: 'GOOD',
        }));
        break;
      case 'PUMP_FAILURE':
        setMetrics(prev => ({
          ...prev,
          pumpRpm: 0,
          flowRate: 0.0,
          currentDraw: 4.1, // only controller + sensors active
          uvStatus: 'OFF',
          waterQuality: 'GOOD',
        }));
        break;
      case 'MAINTENANCE':
        setExploded(true);
        setTransparent(true);
        setMetrics(prev => ({
          ...prev,
          esp32Online: true,
          pumpRpm: 0,
          flowRate: 0,
          currentDraw: 2,
        }));
        break;
      case 'CLEANING':
        setMetrics(prev => ({
          ...prev,
          waterLevel: 25, // dropping water level
          flowRate: 0,
          pumpRpm: 0,
          currentDraw: 6,
        }));
        break;
    }
  };

  // Keep metrics animating dynamically (ambient fluctuation)
  useEffect(() => {
    const interval = setInterval(() => {
      if (demoRunning) return; // Presentation overrides fluctuations

      setMetrics(prev => {
        // Simple helper to add tiny noise
        const noise = (min: number, max: number) => Math.random() * (max - min) + min;

        // Fluctuations based on system mode
        if (mode === 'PUMP_FAILURE') {
          return {
            ...prev,
            batteryPercent: Math.max(1, prev.batteryPercent - 0.01),
            solarWatts: envMode === 'SUNNY' ? 48 + noise(-2, 2) : envMode === 'NIGHT' ? 0 : 15 + noise(-1, 1),
            temperature: 24.0 + noise(-0.1, 0.1),
            wifiSignal: -55 + Math.round(noise(-2, 2)),
          };
        }

        if (mode === 'LOW_BATTERY') {
          return {
            ...prev,
            batteryPercent: Math.max(1, prev.batteryPercent - 0.005),
            temperature: 22.0 + noise(-0.05, 0.05),
          };
        }

        // Standard fluctuations
        const isSolarActive = envMode !== 'NIGHT';
        const batteryDelta = isSolarActive
          ? (prev.solarWatts - prev.currentDraw > 0 ? 0.05 : -0.01)
          : -0.05;

        return {
          ...prev,
          batteryPercent: Math.max(0, Math.min(100, prev.batteryPercent + batteryDelta)),
          solarWatts: isSolarActive
            ? envMode === 'SUNNY'
              ? 55 + noise(-2, 2)
              : envMode === 'CLOUDY'
              ? 18 + noise(-1, 1)
              : envMode === 'RAIN'
              ? 8 + noise(-0.5, 0.5)
              : 35 + noise(-1.5, 1.5) // morning
            : 0,
          currentDraw: prev.pumpRpm > 0 ? 12 + noise(-0.5, 0.5) + (prev.uvStatus === 'ON' ? 3 : 0) : 4 + noise(-0.1, 0.1),
          ph: prev.ph + noise(-0.02, 0.02),
          tds: prev.tds + Math.round(noise(-1, 1)),
          temperature: 24.5 + noise(-0.1, 0.1),
          turbidity: Math.max(0.1, prev.turbidity + noise(-0.05, 0.05)),
          wifiSignal: Math.min(-30, Math.max(-90, prev.wifiSignal + Math.round(noise(-1, 1)))),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [mode, envMode, demoRunning]);

  // Adjust environmental mode impact on metrics
  useEffect(() => {
    if (demoRunning) return;
    switch (envMode) {
      case 'SUNNY':
        setMetrics(prev => ({ ...prev, solarWatts: 55 }));
        break;
      case 'MORNING':
        setMetrics(prev => ({ ...prev, solarWatts: 25 }));
        break;
      case 'CLOUDY':
        setMetrics(prev => ({ ...prev, solarWatts: 15 }));
        break;
      case 'RAIN':
        setMetrics(prev => ({ ...prev, solarWatts: 5 }));
        break;
      case 'NIGHT':
        setMetrics(prev => ({ ...prev, solarWatts: 0 }));
        break;
    }
  }, [envMode, demoRunning]);

  // Guided Presentation Step Execution
  useEffect(() => {
    if (!demoRunning) return;

    const currentStep = presentationSteps[demoStep];
    setCameraPreset(currentStep.target);

    // Fire step actions
    if (currentStep.actions) {
      currentStep.actions(setMetrics, setMode);
    }

    // Set timer for next step
    demoTimerRef.current = setTimeout(() => {
      if (demoStep < presentationSteps.length - 1) {
        setDemoStep(prev => prev + 1);
      } else {
        stopDemo();
      }
    }, currentStep.duration);

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [demoStep, demoRunning]);

  const startDemo = () => {
    setExploded(false);
    setCutaway(false);
    setTransparent(false);
    setDemoStep(0);
    setDemoRunning(true);
  };

  const stopDemo = () => {
    setDemoRunning(false);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    if (demoStep === presentationSteps.length - 1) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const nextStep = () => {
    if (demoStep < presentationSteps.length - 1) {
      setDemoStep(prev => prev + 1);
    } else {
      stopDemo();
    }
  };

  const prevStep = () => {
    if (demoStep > 0) {
      setDemoStep(prev => prev - 1);
    }
  };

  const currentStepData = demoRunning ? presentationSteps[demoStep] : null;

  return (
    <SystemStateContext.Provider
      value={{
        mode,
        setMode,
        envMode,
        setEnvMode,
        cameraPreset,
        setCameraPreset,
        exploded,
        setExploded,
        cutaway,
        setCutaway,
        transparent,
        setTransparent,
        metrics,
        setMetrics,
        landingVisited,
        setLandingVisited,
        demoRunning,
        demoStep,
        setDemoStep,
        startDemo,
        stopDemo,
        nextStep,
        prevStep,
        currentStepData,
        activeHotspot,
        setActiveHotspot,
      }}
    >
      {children}
    </SystemStateContext.Provider>
  );
};

export const useSystemState = () => {
  const context = useContext(SystemStateContext);
  if (context === undefined) {
    throw new Error('useSystemState must be used within a SystemStateProvider');
  }
  return context;
};
