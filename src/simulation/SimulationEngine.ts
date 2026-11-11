import {
  SimulationState,
  SimulationScenarioId,
  WaterPurifierTelemetrySource,
} from './types';
import { SCENARIO_DEFINITIONS } from './scenarios';
import { EngineeringModels } from './engineeringModels';
import { AiDiagnostics } from './aiDiagnostics';

export class SimulationEngine implements WaterPurifierTelemetrySource {
  private state: SimulationState;
  private intervalTimer: NodeJS.Timeout | null = null;
  private listeners: ((state: SimulationState) => void)[] = [];
  private lastTickTimestamp: number = Date.now();

  constructor() {
    this.state = this.createInitialState('NORMAL');
    this.start();
  }

  public createInitialState(scenarioId: SimulationScenarioId = 'NORMAL'): SimulationState {
    const scenario = SCENARIO_DEFINITIONS[scenarioId] || SCENARIO_DEFINITIONS.NORMAL;
    const initialRawLevel = scenario.feedWater.rawLevel !== undefined ? scenario.feedWater.rawLevel : 100;

    const baseState: SimulationState = {
      rawWaterLevel: initialRawLevel,
      rawTankCapacity: 100,
      purifiedWaterLevel: 75,
      purifiedTankCapacity: 100,
      wasteWaterLevel: 6,
      wasteTankCapacity: 50,

      inputFlowRate: scenario.componentWearFactors?.pumpFault ? 0 : 5.0,
      outputFlowRate: scenario.componentWearFactors?.pumpFault ? 0 : 3.5,
      wasteFlowRate: scenario.componentWearFactors?.pumpFault ? 0 : 1.5,

      inputTds: scenario.feedWater.tds,
      outputTds: 24,
      inputPh: scenario.feedWater.ph,
      outputPh: 7.36,
      inputTurbidity: scenario.feedWater.turbidity,
      outputTurbidity: 0.12,
      temperature: scenario.feedWater.temperature,

      stageProfiles: {
        turbidity: {
          raw: scenario.feedWater.turbidity,
          afterSediment: scenario.feedWater.turbidity * 0.25,
          afterCarbon: scenario.feedWater.turbidity * 0.10,
          afterRo: 0.15,
          afterUv: 0.12,
          afterUf: 0.08,
        },
        tds: {
          raw: scenario.feedWater.tds,
          afterSediment: scenario.feedWater.tds,
          afterCarbon: scenario.feedWater.tds * 0.98,
          roPermeate: Math.round(scenario.feedWater.tds * 0.05),
          roReject: Math.round(scenario.feedWater.tds * 1.4),
          finalProduct: Math.round(scenario.feedWater.tds * 0.05 + 12),
        },
        ph: {
          raw: scenario.feedWater.ph,
          afterRo: Math.max(6.2, scenario.feedWater.ph - 0.55),
          finalProduct: 7.35,
        },
      },

      filterHealth: {
        overall: scenario.componentWearFactors?.sedimentClogged ? 48 : scenario.componentWearFactors?.roDegraded ? 52 : 94,
        sediment: scenario.componentWearFactors?.sedimentClogged ? 14 : 94,
        carbon: 90,
        ro: scenario.componentWearFactors?.roDegraded ? 22 : 95,
        uv: scenario.componentWearFactors?.uvFault ? 0 : 98,
        uf: 96,
      },

      pumpStatus: scenario.componentWearFactors?.pumpFault ? 'FAULT' : 'RUNNING',
      pumpRpm: scenario.componentWearFactors?.pumpFault ? 0 : 1800,
      uvStatus: scenario.componentWearFactors?.uvFault ? 'FAULT' : 'ON',
      uvIntensity: scenario.componentWearFactors?.uvFault ? 0 : 16.5,
      roStatus: scenario.componentWearFactors?.roDegraded ? 'FOULING' : 'ACTIVE',
      roRecoveryRate: 0.70,
      roRejectionRate: 0.95,
      solenoidValveStatus: scenario.componentWearFactors?.pumpFault ? 'CLOSED' : 'OPEN',
      valveAngleDeg: scenario.componentWearFactors?.pumpFault ? 0 : 90,

      totalWaterPurified: 0,
      totalWasteWater: 0,
      operatingHours: 14.2,

      waterQuality: 'EXCELLENT',
      aiHealthScore: 96,
      aiRecommendations: [],
      sensorDiagnostics: {
        tdsInputHealthy: true,
        tdsOutputHealthy: true,
        turbidityInputHealthy: true,
        turbidityOutputHealthy: true,
        phInputHealthy: true,
        phOutputHealthy: true,
        flowRateHealthy: true,
      },

      timestamp: Date.now(),
      simulationRunning: true,
      speedMultiplier: 1,
      activeScenario: scenarioId,
    };

    // Calculate initial AI diagnostics and recommendations
    baseState.sensorDiagnostics = AiDiagnostics.evaluateSensorDiagnostics(baseState);
    baseState.aiHealthScore = AiDiagnostics.calculateAiHealthScore(baseState);
    baseState.aiRecommendations = AiDiagnostics.generateRecommendations(baseState);

    return baseState;
  }

  public getState(): SimulationState {
    return { ...this.state };
  }

  public subscribe(callback: (state: SimulationState) => void): () => void {
    this.listeners.push(callback);
    callback(this.getState());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(cb => cb(currentState));
  }

  /**
   * Starts the 1-second simulation loop.
   */
  public start(): void {
    if (this.state.simulationRunning) return;

    this.state.simulationRunning = true;
    const scenario = SCENARIO_DEFINITIONS[this.state.activeScenario];

    // Engage actuators upon starting simulation
    if (!scenario.componentWearFactors?.pumpFault && this.state.rawWaterLevel > 0.05) {
      this.state.pumpStatus = 'RUNNING';
      this.state.pumpRpm = 1800;
      this.state.solenoidValveStatus = 'OPEN';
      this.state.valveAngleDeg = 90;
    }
    if (!scenario.componentWearFactors?.uvFault) {
      this.state.uvStatus = 'ON';
    }

    this.lastTickTimestamp = Date.now();
    this.tick(); // Immediate first tick

    if (this.intervalTimer) clearInterval(this.intervalTimer);
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, 1000);

    this.notify();
  }

  /**
   * Pauses the simulation loop.
   */
  public pause(): void {
    this.state.simulationRunning = false;
    this.state.pumpStatus = 'IDLE';
    this.state.pumpRpm = 0;
    this.state.solenoidValveStatus = 'CLOSED';
    this.state.valveAngleDeg = 0;
    this.state.inputFlowRate = 0;
    this.state.outputFlowRate = 0;
    this.state.wasteFlowRate = 0;

    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    this.notify();
  }

  /**
   * Resets the simulation to the initial state of the active scenario.
   */
  public reset(): void {
    const wasRunning = this.state.simulationRunning;
    const currentSpeed = this.state.speedMultiplier;
    const activeScenario = this.state.activeScenario;

    this.pause();
    this.state = this.createInitialState(activeScenario);
    this.state.speedMultiplier = currentSpeed;

    if (wasRunning) {
      this.start();
    } else {
      this.notify();
    }
  }

  /**
   * Selects an operational or failure scenario.
   */
  public setScenario(scenarioId: SimulationScenarioId): void {
    const wasRunning = this.state.simulationRunning;
    const currentSpeed = this.state.speedMultiplier;

    this.state = this.createInitialState(scenarioId);
    this.state.speedMultiplier = currentSpeed;

    if (wasRunning) {
      this.start();
    } else {
      this.notify();
    }
  }

  /**
   * Sets simulation speed multiplier (1x, 2x, 5x, 10x)
   */
  public setSpeedMultiplier(mult: number): void {
    this.state.speedMultiplier = Math.max(1, Math.min(20, mult));
    this.notify();
  }

  /**
   * Step simulation by 1 tick manually
   */
  public step(): void {
    this.tick(1.0);
  }

  /**
   * Core simulation tick executed every second.
   * Completely deterministic physics and mass balance.
   */
  public tick(manualDt?: number): void {
    const now = Date.now();
    const rawDt = manualDt !== undefined ? manualDt : Math.min(2.0, (now - this.lastTickTimestamp) / 1000 || 1.0);
    this.lastTickTimestamp = now;

    // Apply speed multiplier to simulated delta-time
    const dtSeconds = rawDt * this.state.speedMultiplier;
    const scenario = SCENARIO_DEFINITIONS[this.state.activeScenario] || SCENARIO_DEFINITIONS.NORMAL;

    // 1. Dry run protection check
    if (this.state.rawWaterLevel <= 0.05) {
      this.state.rawWaterLevel = 0;
      this.state.pumpStatus = 'IDLE';
      this.state.pumpRpm = 0;
      this.state.solenoidValveStatus = 'CLOSED';
      this.state.valveAngleDeg = 0;
      this.state.inputFlowRate = 0;
      this.state.outputFlowRate = 0;
      this.state.wasteFlowRate = 0;
    }

    // 2. Compute Hydraulics
    const hydraulics = EngineeringModels.calculateHydraulics(this.state, scenario);
    this.state.inputFlowRate = hydraulics.inputFlowRate;
    this.state.outputFlowRate = hydraulics.outputFlowRate;
    this.state.wasteFlowRate = hydraulics.wasteFlowRate;
    this.state.pumpRpm = hydraulics.pumpRpm;
    this.state.roRecoveryRate = hydraulics.recoveryRate;
    this.state.valveAngleDeg = hydraulics.valveAngleDeg;
    this.state.solenoidValveStatus = hydraulics.valveAngleDeg > 0 ? 'OPEN' : 'CLOSED';

    // 3. Compute Mass Balance
    const massBalance = EngineeringModels.calculateMassBalance(
      this.state,
      hydraulics.inputFlowRate,
      hydraulics.outputFlowRate,
      hydraulics.wasteFlowRate,
      dtSeconds
    );
    this.state.rawWaterLevel = massBalance.rawWaterLevel;
    this.state.purifiedWaterLevel = massBalance.purifiedWaterLevel;
    this.state.wasteWaterLevel = massBalance.wasteWaterLevel;
    this.state.totalWaterPurified = massBalance.totalWaterPurified;
    this.state.totalWasteWater = massBalance.totalWasteWater;
    this.state.operatingHours = massBalance.operatingHours;

    // 4. Compute Water Chemistry & Stage Profiles
    const chemistry = EngineeringModels.calculateWaterChemistry(
      this.state,
      scenario,
      hydraulics.inputFlowRate,
      hydraulics.outputFlowRate,
      hydraulics.wasteFlowRate
    );
    this.state.stageProfiles = chemistry.stageProfiles;
    this.state.inputTds = chemistry.inputTds;
    this.state.outputTds = chemistry.outputTds;
    this.state.inputTurbidity = chemistry.inputTurbidity;
    this.state.outputTurbidity = chemistry.outputTurbidity;
    this.state.inputPh = chemistry.inputPh;
    this.state.outputPh = chemistry.outputPh;
    this.state.roRejectionRate = chemistry.roRejectionRate;
    this.state.waterQuality = chemistry.waterQuality;

    // 5. Compute Filter Degradation Kinetics
    this.state.filterHealth = EngineeringModels.calculateFilterDegradation(
      this.state.filterHealth,
      scenario,
      hydraulics.inputFlowRate,
      dtSeconds
    );

    // 6. Sensor Diagnostics
    this.state.sensorDiagnostics = AiDiagnostics.evaluateSensorDiagnostics(this.state);

    // 7. AI Health Score & Dynamic Predictive Recommendations
    this.state.aiHealthScore = AiDiagnostics.calculateAiHealthScore(this.state);
    this.state.aiRecommendations = AiDiagnostics.generateRecommendations(this.state);

    this.state.timestamp = now;
    this.notify();
  }
}
