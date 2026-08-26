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
  | 'DRAIN_VALVE'
  | 'TANK2_VERIFICATION'
  | 'RECIRCULATION_LOOP'
  | 'HYDRO_GENERATOR'
  | 'WATER_STAGE_1'
  | 'WATER_STAGE_2'
  | 'WATER_STAGE_3'
  | 'WATER_STAGE_4'
  | 'WATER_STAGE_5'
  | 'WATER_STAGE_6';

// Sensor and operational metrics structure
export interface SystemMetrics {
  batteryPercent: number;
  solarWatts: number;
  hydroWatts: number; // Hydro-electric turbine generation in Watts
  currentDraw: number;
  waterLevel: number; // 0 to 100
  flowRate: number; // L/min
  ph: number;
  tds: number; // ppm
  turbidity: number; // NTU
  temperature: number; // °C
  // Secondary Sensor Suite (Tank 2 Post-RO Verification)
  tds2: number; // Post-RO TDS ppm
  ph2: number; // Post-RO pH
  turbidity2: number; // Post-RO NTU
  recirculationActive: boolean; // Closed-loop recirculation active
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
  showHotspots: boolean;
  setShowHotspots: (val: boolean) => void;
  // Tank Isolation & Boundary Margin Mode
  tanksOnly: boolean;
  setTanksOnly: (val: boolean) => void;
  // Dual-Stage Verification Loop & Post-Filtration Tank 2
  dualVerificationMode: boolean;
  setDualVerificationMode: (val: boolean) => void;
  recirculationTriggered: boolean;
  setRecirculationTriggered: (val: boolean) => void;
  setTank2Tds: (tdsVal: number) => void;
  // Hydro-Power Motor Energy Harvesting Toggle (Borewell -> Hydro Motor Battery Charge)
  hydroGeneratorMode: boolean;
  setHydroGeneratorMode: (val: boolean) => void;
  // Right Sidebar Tab: Live Telemetry vs Sensors & Tools
  sidebarTab: 'TELEMETRY' | 'TOOLS';
  setSidebarTab: (tab: 'TELEMETRY' | 'TOOLS') => void;
  // Water Flow View Focus Mode (Journey of a Water Packet)
  waterTrackMode: boolean;
  setWaterTrackMode: (val: boolean) => void;
  waterTrackStage: number; // 1 to 6
  setWaterTrackStage: (stage: number) => void;
  nextWaterStage: () => void;
  prevWaterStage: () => void;
  autoPlayWater: boolean;
  setAutoPlayWater: (val: boolean) => void;
}

const SystemStateContext = createContext<SystemStateContextType | undefined>(undefined);

// Initial metrics based on normal state
const defaultMetrics: SystemMetrics = {
  batteryPercent: 88,
  solarWatts: 45,
  hydroWatts: 0,
  currentDraw: 12,
  waterLevel: 65,
  flowRate: 4.8,
  ph: 7.2,
  tds: 145,
  turbidity: 1.2,
  temperature: 24.5,
  tds2: 28,
  ph2: 7.35,
  turbidity2: 0.15,
  recirculationActive: false,
  pumpRpm: 1800,
  filterHealth: 98,
  uvStatus: 'ON',
  esp32Online: true,
  wifiSignal: -55,
  cloudSync: 'SYNCED',
  tankCapacity: 250,
  waterQuality: 'EXCELLENT',
};

// Guided AI Presentation Steps — SIH Mining & Remote Communities Story
const presentationSteps: PresentationStep[] = [
  {
    target: 'OVERVIEW',
    title: 'The Challenge: Mining Water Pollution',
    description: 'In open-cast mining sites and remote off-grid communities, heavy mineral runoff and high turbidity contaminate local water sources. blueground Leviathan is an autonomous, solar-powered IoT water purification system engineered to solve this crisis.',
    duration: 6500,
  },
  {
    target: 'INTAKE_PIPE',
    title: 'Phase 1: Raw Intake from Mining Runoff Pit',
    description: 'The system draws contaminated slurry water directly from open-cast settling ponds and borewells, passing through industrial strainer foot valves into the primary filtration circuit.',
    duration: 5500,
  },
  {
    target: 'HYDRO_GENERATOR',
    title: 'Phase 1B: Hydro-Power Energy Harvester',
    description: 'An inline micro-hydro turbine generator recovers kinetic flow energy directly from the incoming water stream, generating +28.5W of supplementary power transmitted via overhead conduit to charge the lithium battery system.',
    duration: 6000,
    actions: (setMetrics) => {
      setMetrics(prev => ({ ...prev, hydroWatts: 28.5, batteryPercent: Math.min(prev.batteryPercent + 1, 100) }));
    },
  },
  {
    target: 'SEDIMENTATION_TANK',
    title: 'Phase 2: Gravitational Sedimentation Trap',
    description: 'Raw water enters the primary sedimentation vessel. Multi-density settling layers of coarse aggregate, gravel, and activated carbon trap heavy suspended solids and mining grit.',
    duration: 6000,
  },
  {
    target: 'FLOW_SENSOR',
    title: 'Phase 3: Real-Time Flow Telemetry',
    description: 'As settled water leaves the sedimentation tank, an inline Hall-effect flow sensor measures volumetric inflow rate (L/min), providing live throughput telemetry to the ESP32.',
    duration: 5000,
  },
  {
    target: 'SECONDARY_TANK',
    title: 'Phase 4: Sensor Quality & Dual Routing',
    description: 'Water fills the secondary quality analysis chamber where immersed TDS, pH, and optical Turbidity probes evaluate purity in real time. Good water drops directly to storage; bad water is routed to RO filtration.',
    duration: 6500,
  },
  {
    target: 'FILTER_HOUSING',
    title: 'Phase 5: 4-Stage RO Multi-Barrier Purifier',
    description: 'When water quality is sub-standard, the filtration pump pushes water through the multi-stage RO filter (PP sediment, CTO carbon, RO membrane, post-mineralizer) with real-time pressure dial feedback.',
    duration: 6500,
  },
  {
    target: 'PRIMARY_TANK',
    title: 'Phase 6: Clean Storage & UV-C Sterilization',
    description: 'Purified water cascades into the 250-liter primary clean reservoir. A high-output germicidal UV-C emitter sterilizes pathogens while a float switch continuously tracks reservoir volume.',
    duration: 6000,
    actions: (setMetrics) => {
      setMetrics(prev => ({ ...prev, waterLevel: 78, waterQuality: 'EXCELLENT' }));
    },
  },
  {
    target: 'SOLAR',
    title: 'Phase 7: 100% Autonomous Solar Energy',
    description: 'Powered entirely by rooftop monocrystalline photovoltaics and smart lithium storage, Leviathan operates 24/7 off-grid without requiring diesel generators or grid connectivity.',
    duration: 5500,
    actions: (setMetrics, setMode) => {
      setMode('NORMAL');
      setMetrics(prev => ({ ...prev, solarWatts: 56, batteryPercent: Math.min(prev.batteryPercent + 2, 100) }));
    },
  },
  {
    target: 'DISPLAY',
    title: 'Phase 8: Edge IoT Diagnostics & Cloud Sync',
    description: 'The ESP32 controller renders live water metrics on its 1.8 TFT color screen and transmits encrypted telemetry to remote cloud monitoring dashboards for mining supervisors.',
    duration: 5500,
  },
  {
    target: 'OVERVIEW',
    title: 'The Impact: Safe Drinking Water Restored',
    description: 'Safe, certified drinking water is dispensed to local mining workers and remote communities. Explore the 3D twin freely, press "T" for Tanks Only Margins, or press "H" for Clean Showroom View.',
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

  const [showHotspots, setShowHotspots] = useState(true);
  const [tanksOnly, setTanksOnly] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'TELEMETRY' | 'TOOLS'>('TELEMETRY');

  // Dual-Stage Verification Loop & Post-Filtration Tank 2
  const [dualVerificationMode, setDualVerificationMode] = useState(false);
  const [recirculationTriggered, setRecirculationTriggered] = useState(false);

  // Hydro-Power Motor Energy Harvesting Toggle (Borewell -> Hydro Motor Battery Charge)
  const [hydroGeneratorMode, setHydroGeneratorMode] = useState(false);

  // Water Flow View Focus Mode
  const [waterTrackMode, setWaterTrackModeState] = useState(false);
  const [waterTrackStage, setWaterTrackStageState] = useState(1);
  const [autoPlayWater, setAutoPlayWater] = useState(false);

  // Sync Hydro-Electric Generation Telemetry Watts
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      hydroWatts: hydroGeneratorMode ? Math.round(Math.max(prev.flowRate, 3.5) * 5.8 * 10) / 10 : 0,
    }));
  }, [hydroGeneratorMode]);

  const setWaterTrackStage = (stage: number) => {
    const clamped = Math.max(1, Math.min(6, stage));
    setWaterTrackStageState(clamped);
    setCameraPreset(`WATER_STAGE_${clamped}` as CameraPreset);
  };

  const setWaterTrackMode = (val: boolean) => {
    setWaterTrackModeState(val);
    if (val) {
      setWaterTrackStage(1);
      setCameraPreset('WATER_STAGE_1');
    } else {
      setAutoPlayWater(false);
      setCameraPreset('OVERVIEW');
    }
  };

  const nextWaterStage = () => {
    if (waterTrackStage < 6) {
      setWaterTrackStage(waterTrackStage + 1);
    } else {
      setWaterTrackStage(1); // loop back to raw intake
    }
  };

  const prevWaterStage = () => {
    if (waterTrackStage > 1) {
      setWaterTrackStage(waterTrackStage - 1);
    } else {
      setWaterTrackStage(6);
    }
  };

  // Auto-play timer for water flow focus journey
  useEffect(() => {
    if (!waterTrackMode || !autoPlayWater) return;
    const interval = setInterval(() => {
      setWaterTrackStageState(prev => {
        const next = prev < 6 ? prev + 1 : 1;
        setCameraPreset(`WATER_STAGE_${next}` as CameraPreset);
        return next;
      });
    }, 5500);
    return () => clearInterval(interval);
  }, [waterTrackMode, autoPlayWater]);

  // Global Hotkeys: 'H' for Hotspots, 'T' for Tanks Only, 'S' for Sensors & Tools, 'W' for Water Flow Focus, 'V' for Dual Verification, 'G' for Hydro Generator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'h' || e.key === 'H') {
        setShowHotspots(prev => !prev);
      }
      if (e.key === 't' || e.key === 'T') {
        setTanksOnly(prev => !prev);
      }
      if (e.key === 's' || e.key === 'S') {
        setSidebarTab(prev => (prev === 'TOOLS' ? 'TELEMETRY' : 'TOOLS'));
      }
      if (e.key === 'v' || e.key === 'V') {
        setDualVerificationMode(prev => !prev);
      }
      if (e.key === 'g' || e.key === 'G') {
        setHydroGeneratorMode(prev => !prev);
      }
      if (e.key === 'w' || e.key === 'W') {
        setWaterTrackModeState(prev => {
          const next = !prev;
          if (next) {
            setWaterTrackStageState(1);
            setCameraPreset('WATER_STAGE_1');
          } else {
            setAutoPlayWater(false);
            setCameraPreset('OVERVIEW');
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setTank2Tds = (tdsVal: number) => {
    setMetrics(prev => ({
      ...prev,
      tds2: tdsVal,
      recirculationActive: tdsVal > 100,
      turbidity2: tdsVal > 100 ? 4.5 : 0.15,
    }));
    setRecirculationTriggered(tdsVal > 100);
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
        showHotspots,
        setShowHotspots,
        tanksOnly,
        setTanksOnly,
        dualVerificationMode,
        setDualVerificationMode,
        recirculationTriggered,
        setRecirculationTriggered,
        setTank2Tds,
        hydroGeneratorMode,
        setHydroGeneratorMode,
        sidebarTab,
        setSidebarTab,
        waterTrackMode,
        setWaterTrackMode,
        waterTrackStage,
        setWaterTrackStage,
        nextWaterStage,
        prevWaterStage,
        autoPlayWater,
        setAutoPlayWater,
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
