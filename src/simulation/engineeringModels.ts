import {
  SimulationState,
  StageWaterProfiles,
  FilterHealthState,
  SensorDiagnosticFlags,
  ScenarioDefinition,
} from './types';

export interface TickInput {
  state: SimulationState;
  scenario: ScenarioDefinition;
  dtSeconds: number;
}

/**
 * Deterministic engineering calculations for water purification digital twin.
 * All values are computed from physical mass balances, flow kinetics, and filter attenuation models.
 */
export class EngineeringModels {
  /**
   * Calculate instantaneous hydraulic flow rates based on pump speed and filter loading.
   */
  public static calculateHydraulics(
    state: SimulationState,
    scenario: ScenarioDefinition
  ): {
    inputFlowRate: number;
    outputFlowRate: number;
    wasteFlowRate: number;
    pumpRpm: number;
    recoveryRate: number;
    valveAngleDeg: number;
  } {
    // 1. Dry run protection: If raw tank is depleted, pump must shut down and solenoid must close
    if (state.rawWaterLevel <= 0.05 || !state.simulationRunning) {
      return {
        inputFlowRate: 0,
        outputFlowRate: 0,
        wasteFlowRate: 0,
        pumpRpm: 0,
        recoveryRate: 0.70,
        valveAngleDeg: 0,
      };
    }

    // 2. Pump fault scenario check
    if (scenario.componentWearFactors?.pumpFault || state.pumpStatus === 'FAULT') {
      return {
        inputFlowRate: 0,
        outputFlowRate: 0,
        wasteFlowRate: 0,
        pumpRpm: 0,
        recoveryRate: 0.70,
        valveAngleDeg: 0,
      };
    }

    // 3. Nominal pump operation
    const baseRpm = 1800; // Nominal high-efficiency booster pump speed
    const nominalMaxFlow = 4.8; // Rated L/min at 1800 RPM and 4.2 Bar head

    // Flow restriction from sediment filter clogging (differential pressure drop)
    let cloggingRestriction = 1.0;
    if (state.filterHealth.sediment < 35 || scenario.componentWearFactors?.sedimentClogged) {
      // Linear choke as filter pore paths saturate
      const healthFraction = Math.max(state.filterHealth.sediment / 35, 0.18);
      cloggingRestriction = Math.max(0.25, healthFraction);
    }

    // Actual input feed flow rate
    const pumpRpm = state.pumpStatus === 'RUNNING' ? baseRpm : 0;
    const inputFlowRate = Number(((pumpRpm / baseRpm) * nominalMaxFlow * cloggingRestriction).toFixed(2));

    // Recovery rate (standard 70% permeate recovery, 30% reject brine)
    let recoveryRate = 0.70;
    if (state.filterHealth.ro < 30 || scenario.componentWearFactors?.roDegraded) {
      // Degraded RO membrane loses permeate flux
      recoveryRate = 0.52;
    }

    const outputFlowRate = Number((inputFlowRate * recoveryRate).toFixed(2));
    const wasteFlowRate = Number((inputFlowRate * (1.0 - recoveryRate)).toFixed(2));
    const valveAngleDeg = inputFlowRate > 0 ? 90 : 0;

    return {
      inputFlowRate,
      outputFlowRate,
      wasteFlowRate,
      pumpRpm,
      recoveryRate,
      valveAngleDeg,
    };
  }

  /**
   * Deterministic mass balance updates for tank fluid volumes.
   */
  public static calculateMassBalance(
    state: SimulationState,
    inputFlowRate: number,
    outputFlowRate: number,
    wasteFlowRate: number,
    dtSeconds: number
  ): {
    rawWaterLevel: number;
    purifiedWaterLevel: number;
    wasteWaterLevel: number;
    totalWaterPurified: number;
    totalWasteWater: number;
    operatingHours: number;
  } {
    // Flow rates are in Liters per minute. Convert to volume in dtSeconds.
    const deltaVIn = (inputFlowRate / 60) * dtSeconds;
    const deltaVOut = (outputFlowRate / 60) * dtSeconds;
    const deltaVWaste = (wasteFlowRate / 60) * dtSeconds;

    const rawWaterLevel = Math.max(0, Number((state.rawWaterLevel - deltaVIn).toFixed(3)));
    const purifiedWaterLevel = Math.min(
      state.purifiedTankCapacity,
      Number((state.purifiedWaterLevel + deltaVOut).toFixed(3))
    );
    const wasteWaterLevel = Math.min(
      state.wasteTankCapacity,
      Number((state.wasteWaterLevel + deltaVWaste).toFixed(3))
    );

    const totalWaterPurified = Number((state.totalWaterPurified + deltaVOut).toFixed(2));
    const totalWasteWater = Number((state.totalWasteWater + deltaVWaste).toFixed(2));
    const operatingHours = state.simulationRunning && inputFlowRate > 0
      ? Number((state.operatingHours + dtSeconds / 3600).toFixed(4))
      : state.operatingHours;

    return {
      rawWaterLevel,
      purifiedWaterLevel,
      wasteWaterLevel,
      totalWaterPurified,
      totalWasteWater,
      operatingHours,
    };
  }

  /**
   * Stage-by-stage water chemistry transformations (Turbidity, TDS, pH).
   */
  public static calculateWaterChemistry(
    state: SimulationState,
    scenario: ScenarioDefinition,
    inputFlowRate: number,
    outputFlowRate: number,
    wasteFlowRate: number
  ): {
    stageProfiles: StageWaterProfiles;
    inputTds: number;
    outputTds: number;
    inputTurbidity: number;
    outputTurbidity: number;
    inputPh: number;
    outputPh: number;
    roRejectionRate: number;
    waterQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
  } {
    const rawTurbidity = scenario.feedWater.turbidity;
    const rawTds = scenario.feedWater.tds;
    const rawPh = scenario.feedWater.ph;

    // ─── 1. Turbidity Attenuation ───
    // Stage 1 Sediment filter removes coarse suspended particulate
    const sedEff = Math.max(0.15, 0.82 * (state.filterHealth.sediment / 100));
    const afterSedTurbidity = Number((rawTurbidity * (1.0 - sedEff)).toFixed(2));

    // Stage 2 Carbon block absorbs organics and fine solids
    const carbEff = Math.max(0.20, 0.65 * (state.filterHealth.carbon / 100));
    const afterCarbTurbidity = Number((afterSedTurbidity * (1.0 - carbEff)).toFixed(2));

    // Stage 3 RO membrane blocks 97% of remaining particulate
    const roTurbEff = Math.max(0.40, 0.97 * (state.filterHealth.ro / 100));
    const afterRoTurbidity = Number((afterCarbTurbidity * (1.0 - roTurbEff)).toFixed(2));

    // Stage 4 UV-C & UF polish
    const afterUvTurbidity = Number((afterRoTurbidity * 0.85).toFixed(2));
    const finalTurbidity = Math.max(0.05, Number((afterUvTurbidity * 0.40).toFixed(2)));

    // ─── 2. TDS Salt Rejection Kinetics ───
    // Sediment and Carbon have minor impact on dissolved minerals (~2%)
    const afterSedTds = Math.round(rawTds);
    const afterCarbTds = Math.round(rawTds * 0.98);

    // RO membrane rejection
    let nominalRejection = 0.95; // 95% nominal rejection rate
    if (state.filterHealth.ro < 35 || scenario.componentWearFactors?.roDegraded) {
      nominalRejection = 0.52; // Severe salt passage under membrane degradation
    }
    const roRejectionRate = Number(nominalRejection.toFixed(2));

    // Permeate TDS
    const roPermeateTds = Math.max(8, Math.round(afterCarbTds * (1.0 - roRejectionRate)));

    // Mass balance for reject brine stream: (Inlet_TDS * Q_in - Permeate_TDS * Q_out) / Q_waste
    let roRejectTds = Math.round(
      inputFlowRate > 0 && wasteFlowRate > 0
        ? (afterCarbTds * inputFlowRate - roPermeateTds * outputFlowRate) / wasteFlowRate
        : rawTds * 1.5
    );
    roRejectTds = Math.max(roRejectTds, Math.round(rawTds * 1.3));

    // Active copper post-filter adds essential trace mineral ions (+12 ppm)
    const finalProductTds = Math.round(roPermeateTds + 12);

    // ─── 3. pH Balancing & Stabilization ───
    // RO membrane naturally slightly acidifies permeate due to carbon dioxide permeation
    const afterRoPh = Number(Math.max(6.1, rawPh - 0.55).toFixed(2));
    // Post-filter mineral cartridge neutralizes and buffers back to healthy drinking pH 7.2 - 7.4
    const finalProductPh = Number((7.35 + (afterRoPh - 6.8) * 0.10).toFixed(2));

    // ─── 4. Sensor Failure Overrides ───
    let displayOutputTds = finalProductTds;
    if (scenario.componentWearFactors?.sensorFault) {
      // Sensor open circuit reads out-of-range value
      displayOutputTds = 999;
    }

    // ─── 5. Potable Water Quality Index Determination ───
    let waterQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL' = 'EXCELLENT';
    if (displayOutputTds > 300 || finalTurbidity > 5.0 || state.uvStatus === 'FAULT') {
      waterQuality = 'CRITICAL';
    } else if (displayOutputTds > 100 || finalTurbidity > 1.0) {
      waterQuality = 'POOR';
    } else if (displayOutputTds > 70 || finalTurbidity > 0.4) {
      waterQuality = 'GOOD';
    }

    const stageProfiles: StageWaterProfiles = {
      turbidity: {
        raw: rawTurbidity,
        afterSediment: afterSedTurbidity,
        afterCarbon: afterCarbTurbidity,
        afterRo: afterRoTurbidity,
        afterUv: afterUvTurbidity,
        afterUf: finalTurbidity,
      },
      tds: {
        raw: rawTds,
        afterSediment: afterSedTds,
        afterCarbon: afterCarbTds,
        roPermeate: roPermeateTds,
        roReject: roRejectTds,
        finalProduct: displayOutputTds,
      },
      ph: {
        raw: rawPh,
        afterRo: afterRoPh,
        finalProduct: finalProductPh,
      },
    };

    return {
      stageProfiles,
      inputTds: rawTds,
      outputTds: displayOutputTds,
      inputTurbidity: rawTurbidity,
      outputTurbidity: finalTurbidity,
      inputPh: rawPh,
      outputPh: finalProductPh,
      roRejectionRate,
      waterQuality,
    };
  }

  /**
   * Deterministic cartridge degradation based on processed volume and influent impurity load.
   */
  public static calculateFilterDegradation(
    currentHealth: FilterHealthState,
    scenario: ScenarioDefinition,
    inputFlowRate: number,
    dtSeconds: number
  ): FilterHealthState {
    if (inputFlowRate <= 0) return currentHealth;

    const volumeLiters = (inputFlowRate / 60) * dtSeconds;
    const sedMult = scenario.componentWearFactors?.sedimentDegradationMult || 1.0;
    const roMult = scenario.componentWearFactors?.roDegradationMult || 1.0;

    // Sediment wear proportional to particulate load
    const sedWear = volumeLiters * (scenario.feedWater.turbidity / 15) * 0.012 * sedMult;
    // Carbon wear proportional to chemical/organic absorption
    const carbWear = volumeLiters * 0.006;
    // RO wear proportional to osmotic scaling pressure
    const roWear = volumeLiters * (scenario.feedWater.tds / 400) * 0.009 * roMult;
    // UV lamp degrades with runtime
    const uvWear = (dtSeconds / 3600) * 0.02;
    // UF wear
    const ufWear = volumeLiters * 0.004;

    const sediment = Math.max(0, Number((currentHealth.sediment - sedWear).toFixed(2)));
    const carbon = Math.max(0, Number((currentHealth.carbon - carbWear).toFixed(2)));
    const ro = Math.max(0, Number((currentHealth.ro - roWear).toFixed(2)));
    const uv = Math.max(0, Number((currentHealth.uv - uvWear).toFixed(2)));
    const uf = Math.max(0, Number((currentHealth.uf - ufWear).toFixed(2)));

    const overall = Math.round((sediment * 0.25 + carbon * 0.2 + ro * 0.35 + uv * 0.1 + uf * 0.1));

    return {
      overall,
      sediment,
      carbon,
      ro,
      uv,
      uf,
    };
  }
}
