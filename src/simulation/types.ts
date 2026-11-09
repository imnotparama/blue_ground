export type PumpStatus = 'RUNNING' | 'IDLE' | 'FAULT';
export type UVStatus = 'ON' | 'OFF' | 'FAULT';
export type ROStatus = 'ACTIVE' | 'FOULING' | 'OFF';
export type SolenoidValveStatus = 'OPEN' | 'CLOSED';

export type SimulationScenarioId =
  | 'NORMAL'
  | 'HIGH_TDS'
  | 'HIGH_TURBIDITY'
  | 'LOW_WATER'
  | 'SEDIMENT_CLOGGING'
  | 'RO_DEGRADATION'
  | 'PUMP_FAILURE'
  | 'SENSOR_FAILURE'
  | 'UV_FAILURE';

export interface FilterHealthState {
  overall: number; // 0-100
  sediment: number; // 0-100
  carbon: number; // 0-100
  ro: number; // 0-100
  uv: number; // 0-100
  uf: number; // 0-100
}

export interface StageWaterProfiles {
  turbidity: {
    raw: number;
    afterSediment: number;
    afterCarbon: number;
    afterRo: number;
    afterUv: number;
    afterUf: number;
  };
  tds: {
    raw: number;
    afterSediment: number;
    afterCarbon: number;
    roPermeate: number;
    roReject: number;
    finalProduct: number;
  };
  ph: {
    raw: number;
    afterRo: number;
    finalProduct: number;
  };
}

export interface AIRecommendation {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  category: 'FILTER' | 'RO' | 'PUMP' | 'UV' | 'WATER_QUALITY' | 'SAFETY';
  title: string;
  message: string;
  action: string;
  predictedDaysRemaining?: number;
}

export interface SensorDiagnosticFlags {
  tdsInputHealthy: boolean;
  tdsOutputHealthy: boolean;
  turbidityInputHealthy: boolean;
  turbidityOutputHealthy: boolean;
  phInputHealthy: boolean;
  phOutputHealthy: boolean;
  flowRateHealthy: boolean;
}

export interface SimulationState {
  // Tank Levels (Liters)
  rawWaterLevel: number;
  rawTankCapacity: number; // 100 L
  purifiedWaterLevel: number;
  purifiedTankCapacity: number; // 100 L
  wasteWaterLevel: number;
  wasteTankCapacity: number; // 50 L

  // Flow Rates (L/min)
  inputFlowRate: number;
  outputFlowRate: number; // Permeate
  wasteFlowRate: number; // Concentrate / Reject

  // Water Quality Sensor Data
  inputTds: number; // ppm
  outputTds: number; // ppm
  inputPh: number;
  outputPh: number;
  inputTurbidity: number; // NTU
  outputTurbidity: number; // NTU
  temperature: number; // °C

  // Multi-stage water profile breakdown
  stageProfiles: StageWaterProfiles;

  // Component Health & Status
  filterHealth: FilterHealthState;
  pumpStatus: PumpStatus;
  pumpRpm: number;
  uvStatus: UVStatus;
  uvIntensity: number; // mW/cm²
  roStatus: ROStatus;
  roRecoveryRate: number; // e.g. 0.70 (70%)
  roRejectionRate: number; // e.g. 0.95 (95%)
  solenoidValveStatus: SolenoidValveStatus;
  valveAngleDeg: number; // 0 (closed) to 90 (fully open)

  // Cumulative Metrics
  totalWaterPurified: number; // Liters
  totalWasteWater: number; // Liters
  operatingHours: number; // Hours

  // High-level AI & Health Intelligence
  waterQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
  aiHealthScore: number; // 0 - 100
  aiRecommendations: AIRecommendation[];
  sensorDiagnostics: SensorDiagnosticFlags;

  // Metadata
  timestamp: number;
  simulationRunning: boolean;
  speedMultiplier: number;
  activeScenario: SimulationScenarioId;
}

export interface ScenarioDefinition {
  id: SimulationScenarioId;
  name: string;
  badge: string;
  description: string;
  initialOverrides?: Partial<SimulationState>;
  feedWater: {
    tds: number;
    turbidity: number;
    ph: number;
    temperature: number;
    rawLevel?: number;
  };
  componentWearFactors?: {
    sedimentDegradationMult?: number;
    roDegradationMult?: number;
    pumpFault?: boolean;
    uvFault?: boolean;
    sensorFault?: boolean;
    sedimentClogged?: boolean;
    roDegraded?: boolean;
  };
}

// Contract for MQTT or HTTP real-time hardware telemetry ingestion
export interface WaterPurifierTelemetrySource {
  subscribe(callback: (state: SimulationState) => void): () => void;
  sendControlCommand?(command: {
    pump?: 'START' | 'STOP';
    solenoid?: 'OPEN' | 'CLOSE';
    uv?: 'ON' | 'OFF';
  }): Promise<boolean>;
}
