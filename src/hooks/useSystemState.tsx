'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SimulationEngine, SimulationState, SimulationScenarioId } from '@/simulation';

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
  | 'SETUP1_DIRECT'
  | 'RECIRCULATION_LOOP'
  | 'HYDRO_GENERATOR'
  | 'WATER_STAGE_1'
  | 'WATER_STAGE_2'
  | 'WATER_STAGE_3'
  | 'WATER_STAGE_4'
  | 'WATER_STAGE_5'
  | 'WATER_STAGE_6'
  | 'FILTER_VIEW'
  | 'FILTER_STAGE_1'
  | 'FILTER_STAGE_2'
  | 'FILTER_STAGE_3'
  | 'FILTER_STAGE_4'
  | 'PHOTO_HERO_34'
  | 'PHOTO_SOLAR_TOP'
  | 'PHOTO_FILTERS_DETAIL'
  | 'PHOTO_WATER_TANKS'
  | 'PHOTO_VILLAGE_VISTA'
  | 'PHOTO_HANDPUMP_STATION';

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
  // 4-Stage Filter Individual Health
  stage1Health: number; // Sediment %
  stage2Health: number; // Chemo Block %
  stage3Health: number; // RO Maxx %
  stage4Health: number; // Active Copper Filter %
  // Power Distribution Rails
  pumpRailVoltage: number; // 24.0 V
  logicRailVoltage: number; // 5.0 V
  mcuRailVoltage: number; // 3.3 V
  dischargeWatts: number; // 15.0 W
  valveState: 'CLEAN_OUTLET' | 'RECIRCULATION' | 'MAINTENANCE_FLUSH' | 'BYPASS';
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
  antigravityMode: boolean;
  setAntigravityMode: (val: boolean) => void;
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
  totalDemoSteps: number;
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
  // 4-Stage Filter Focus View
  filterView: boolean;
  setFilterView: (val: boolean) => void;
  filterStageFocus: number; // 0 = all 4, 1 = SediShield, 2 = ChemoBlock, 3 = RO Maxx, 4 = Active Copper Filter
  setFilterStageFocus: (stage: number) => void;
  // Deterministic Real-Time Engineering Simulation Engine
  simState: SimulationState;
  simulationRunning: boolean;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  activeScenario: SimulationScenarioId;
  setScenario: (scenarioId: SimulationScenarioId) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (mult: number) => void;
  simulationViewOpen: boolean;
  setSimulationViewOpen: (val: boolean) => void;
  // Official SolidCraft v9 CAD Digital Twin Model Toggle
  cadModelMode: boolean;
  setCadModelMode: (val: boolean) => void;
  // Dedicated Clean Presentation Photo Mode
  photoMode: boolean;
  setPhotoMode: (val: boolean) => void;
  photoAutoRotate: boolean;
  setPhotoAutoRotate: (val: boolean) => void;
  photoGrid: 'NONE' | 'RULE_OF_THIRDS' | 'GOLDEN_RATIO' | 'SQUARE';
  setPhotoGrid: (val: 'NONE' | 'RULE_OF_THIRDS' | 'GOLDEN_RATIO' | 'SQUARE') => void;
  photoAspect: 'FULL' | '16:9' | '4:3' | '1:1';
  setPhotoAspect: (val: 'FULL' | '16:9' | '4:3' | '1:1') => void;
  photoWatermark: boolean;
  setPhotoWatermark: (val: boolean) => void;
}

const SystemStateContext = createContext<SystemStateContextType | undefined>(undefined);

// Initial metrics based on normal state (v2.0 specifications)
const defaultMetrics: SystemMetrics = {
  batteryPercent: 91,
  solarWatts: 56.8,
  hydroWatts: 28.5,
  dischargeWatts: 15.0,
  pumpRailVoltage: 24.0,
  logicRailVoltage: 5.0,
  mcuRailVoltage: 3.3,
  currentDraw: 1.25,
  waterLevel: 68,
  flowRate: 4.8,
  ph: 7.40,
  tds: 129,
  turbidity: 0.2,
  temperature: 24.4,
  tds2: 22,
  ph2: 7.38,
  turbidity2: 0.10,
  recirculationActive: false,
  pumpRpm: 1800,
  filterHealth: 92,
  stage1Health: 92,
  stage2Health: 85,
  stage3Health: 88,
  stage4Health: 95,
  valveState: 'CLEAN_OUTLET',
  uvStatus: 'ON',
  esp32Online: true,
  wifiSignal: -52,
  cloudSync: 'SYNCED',
  tankCapacity: 250,
  waterQuality: 'EXCELLENT',
};

// Guided AI Presentation Steps — SIH Mining & Remote Communities Story
const presentationSteps: PresentationStep[] = [
  {
    target: 'OVERVIEW',
    title: 'The Challenge: Mining Water Pollution',
    description: 'In open-cast mining sites and remote off-grid communities, heavy mineral runoff and high turbidity contaminate local water sources. BlueGround Leviathan is an autonomous, solar-powered IoT water purification system engineered to solve this crisis.',
    duration: 6500,
  },
  {
    target: 'SEDIMENTATION_TANK',
    title: 'Phase 1: Raw Feed Inlet & White Sedimentation Filter',
    description: 'Contaminated borewell water enters through the quarter-turn isolation ball valve and analog pressure gauge directly into the 5-micron white spun polypropylene sedimentation filter, removing 85% of coarse sand and slurry silt.',
    duration: 6000,
  },
  {
    target: 'PUMP',
    title: 'Phase 2: High-Pressure 24V Booster Pump P2',
    description: 'Pre-filtered water is drawn into Booster Pump P2, pressurizing the stream up to 6.8 Bar (100 PSI) to force fluid through the high-density reverse osmosis semi-permeable membrane.',
    duration: 5500,
  },
  {
    target: 'FILTER_HOUSING',
    title: 'Phase 3: 4-Stage Smart Filtration Rack',
    description: 'Pressurized water flows across the 4-cartridge array: CTO Carbon removes chlorine and VOCs; RO Maxx membrane strips 95% of dissolved salts and heavy metals (splitting 70% permeate and 30% reject); and Active Minerals balance taste.',
    duration: 6500,
  },
  {
    target: 'UV_LED',
    title: 'Phase 4: UV Germicidal Disinfection Chamber',
    description: 'Permeate flows through the 254nm ultraviolet sterilization chamber, achieving Log-4 bacterial and pathogen neutralization without chemical additives.',
    duration: 5500,
  },
  {
    target: 'PRIMARY_TANK',
    title: 'Phase 5: Clean Storage Reservoir & Basement Skid',
    description: 'Verified potable water collects in the transparent acrylic storage tank, solidly cradled on the heavy-duty 6061 alloy basement skid with vibration isolation mounts and spill containment lip.',
    duration: 6000,
    actions: (setMetrics) => {
      setMetrics(prev => ({ ...prev, waterLevel: 78, waterQuality: 'EXCELLENT' }));
    },
  },
  {
    target: 'SOLAR',
    title: 'Phase 6: 100% Autonomous Solar Energy',
    description: 'Powered entirely by the rooftop monocrystalline photovoltaic canopy and lithium storage, Leviathan operates 24/7 off-grid without requiring diesel generators or grid connectivity.',
    duration: 5500,
    actions: (setMetrics, setMode) => {
      setMode('NORMAL');
      setMetrics(prev => ({ ...prev, solarWatts: 56, batteryPercent: Math.min(prev.batteryPercent + 2, 100) }));
    },
  },
  {
    target: 'ESP32',
    title: 'Phase 7: Edge IoT Diagnostics & Cloud Sync',
    description: 'The ESP32-S3 controller samples inline TDS, pH, and turbidity sensors, driving local diagnostic readouts and syncing live telemetry to remote monitoring dashboards.',
    duration: 5500,
  },
  {
    target: 'OVERVIEW',
    title: 'The Impact: Certified Safe Potable Water',
    description: 'Safe, certified drinking water is delivered to mining personnel and remote villages. Explore the 3D twin freely, toggle Exploded View (E), or inspect individual components.',
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
  const [cadModelMode, setCadModelMode] = useState(true);

  // Dedicated Clean Presentation Photo Mode
  const [photoMode, setPhotoMode] = useState(false);
  const [photoAutoRotate, setPhotoAutoRotate] = useState(false);
  const [photoGrid, setPhotoGrid] = useState<'NONE' | 'RULE_OF_THIRDS' | 'GOLDEN_RATIO' | 'SQUARE'>('RULE_OF_THIRDS');
  const [photoAspect, setPhotoAspect] = useState<'FULL' | '16:9' | '4:3' | '1:1'>('FULL');
  const [photoWatermark, setPhotoWatermark] = useState(true);

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

  // ─── Real-Time Deterministic Engineering Simulation Engine ────────────────────
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine();
  }

  const [simState, setSimState] = useState<SimulationState>(() => engineRef.current!.getState());

  const [simulationViewOpen, setSimulationViewOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = engineRef.current!.subscribe((newSimState) => {
      setSimState(newSimState);
      setMetrics(prev => ({
        ...prev,
        waterLevel: Math.round((newSimState.purifiedWaterLevel / newSimState.purifiedTankCapacity) * 100),
        flowRate: newSimState.inputFlowRate,
        pumpRpm: newSimState.pumpRpm,
        tds: newSimState.inputTds,
        tds2: newSimState.outputTds,
        ph: newSimState.inputPh,
        ph2: newSimState.outputPh,
        turbidity: newSimState.inputTurbidity,
        turbidity2: newSimState.outputTurbidity,
        temperature: newSimState.temperature,
        filterHealth: newSimState.filterHealth.overall,
        stage1Health: newSimState.filterHealth.sediment,
        stage2Health: newSimState.filterHealth.carbon,
        stage3Health: newSimState.filterHealth.ro,
        stage4Health: newSimState.filterHealth.uf,
        uvStatus: newSimState.uvStatus === 'ON' ? 'ON' : 'OFF',
        waterQuality: newSimState.waterQuality,
        tankCapacity: newSimState.purifiedTankCapacity,
      }));
    });
    // Auto-start simulation loop immediately on mount
    engineRef.current?.start();
    return () => unsubscribe();
  }, []);

  const startSimulation = () => engineRef.current?.start();
  const pauseSimulation = () => engineRef.current?.pause();
  const resetSimulation = () => engineRef.current?.reset();
  const stepSimulation = () => engineRef.current?.step();
  const setScenario = (scenarioId: SimulationScenarioId) => {
    engineRef.current?.setScenario(scenarioId);
    if (scenarioId === 'PUMP_FAILURE') setModeState('PUMP_FAILURE');
    else if (scenarioId === 'HIGH_TURBIDITY') setModeState('TURBIDITY');
    else if (scenarioId === 'NORMAL') setModeState('NORMAL');
  };
  const setSpeedMultiplier = (mult: number) => engineRef.current?.setSpeedMultiplier(mult);

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
  const [antigravityMode, setAntigravityMode] = useState(false);
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

  // 4-Stage Filter Focus View
  const [filterView, setFilterViewState] = useState(false);
  const [filterStageFocus, setFilterStageFocusState] = useState(0);

  // Sync Hydro-Electric Generation Telemetry Watts
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      hydroWatts: hydroGeneratorMode ? Math.round(Math.max(prev.flowRate, 3.5) * 5.8 * 10) / 10 : 0,
    }));
  }, [hydroGeneratorMode]);

  const setFilterStageFocus = (stage: number) => {
    const clamped = Math.max(0, Math.min(4, stage));
    setFilterStageFocusState(clamped);
    if (clamped === 0) {
      setCameraPreset('FILTER_VIEW');
    } else {
      setCameraPreset(`FILTER_STAGE_${clamped}` as CameraPreset);
    }
  };

  const setFilterView = (val: boolean) => {
    setFilterViewState(val);
    if (val) {
      // Exit competing focus modes
      setWaterTrackModeState(false);
      setAutoPlayWater(false);
      setFilterStageFocusState(0);
      setCameraPreset('FILTER_VIEW');
    } else {
      setFilterStageFocusState(0);
      setCameraPreset('OVERVIEW');
    }
  };

  const setWaterTrackStage = (stage: number) => {
    const clamped = Math.max(1, Math.min(6, stage));
    setWaterTrackStageState(clamped);
    setCameraPreset(`WATER_STAGE_${clamped}` as CameraPreset);
  };

  const setWaterTrackMode = (val: boolean) => {
    setWaterTrackModeState(val);
    if (val) {
      setFilterViewState(false);
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

  // Global Hotkeys: 'E' for CAD Exploded View, 'H' for Hotspots, 'T' for Tanks Only, 'S' for Sensors & Tools, 'W' for Water Flow Focus, 'V' for Dual Verification, 'G' for Hydro Generator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'e' || e.key === 'E') {
        setExploded(prev => !prev);
      }
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
            setFilterViewState(false);
            setWaterTrackStageState(1);
            setCameraPreset('WATER_STAGE_1');
          } else {
            setAutoPlayWater(false);
            setCameraPreset('OVERVIEW');
          }
          return next;
        });
      }
      if (e.key === 'f' || e.key === 'F') {
        setFilterViewState(prev => {
          const next = !prev;
          if (next) {
            setWaterTrackModeState(false);
            setAutoPlayWater(false);
            setFilterStageFocusState(0);
            setCameraPreset('FILTER_VIEW');
          } else {
            setFilterStageFocusState(0);
            setCameraPreset('OVERVIEW');
          }
          return next;
        });
      }
      if (e.key === 'p' || e.key === 'P') {
        setPhotoMode(prev => {
          const next = !prev;
          if (next) {
            setCameraPreset('PHOTO_HERO_34');
            setActiveHotspot(null);
            setFilterViewState(false);
            setWaterTrackModeState(false);
          } else {
            setPhotoAutoRotate(false);
            setCameraPreset('OVERVIEW');
          }
          return next;
        });
      }
      if (e.key === 'Escape') {
        setActiveHotspot(null);
        setPhotoMode(prev => {
          if (prev) {
            setPhotoAutoRotate(false);
            setCameraPreset('OVERVIEW');
            return false;
          }
          return prev;
        });
        setFilterViewState(prev => {
          if (prev) {
            setFilterStageFocusState(0);
            setCameraPreset('OVERVIEW');
            return false;
          }
          return prev;
        });
        setWaterTrackModeState(prev => {
          if (prev) {
            setAutoPlayWater(false);
            setCameraPreset('OVERVIEW');
            return false;
          }
          return prev;
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
        antigravityMode,
        setAntigravityMode,
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
        totalDemoSteps: presentationSteps.length,
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
        filterView,
        setFilterView,
        filterStageFocus,
        setFilterStageFocus,
        simState,
        simulationRunning: simState.simulationRunning,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        stepSimulation,
        activeScenario: simState.activeScenario,
        setScenario,
        speedMultiplier: simState.speedMultiplier,
        setSpeedMultiplier,
        simulationViewOpen,
        setSimulationViewOpen,
        cadModelMode,
        setCadModelMode,
        photoMode,
        setPhotoMode,
        photoAutoRotate,
        setPhotoAutoRotate,
        photoGrid,
        setPhotoGrid,
        photoAspect,
        setPhotoAspect,
        photoWatermark,
        setPhotoWatermark,
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
