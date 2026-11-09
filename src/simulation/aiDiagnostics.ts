import { SimulationState, AIRecommendation, SensorDiagnosticFlags } from './types';

export class AiDiagnostics {
  /**
   * Deterministic composite AI Health Score (0 - 100)
   */
  public static calculateAiHealthScore(state: SimulationState): number {
    let score = 100;

    // 1. Filter Health degradation impact (up to -30 pts)
    const filterDeduction = (100 - state.filterHealth.overall) * 0.30;
    score -= filterDeduction;

    // 2. RO Membrane Efficiency (up to -25 pts)
    if (state.roRejectionRate < 0.90) {
      const roLoss = (0.95 - state.roRejectionRate) / 0.50; // fraction lost
      score -= Math.min(25, roLoss * 25);
    }

    // 3. Pump Status & Cavitation (up to -20 pts)
    if (state.pumpStatus === 'FAULT') {
      score -= 20;
    } else if (state.pumpStatus === 'IDLE' && state.simulationRunning) {
      score -= 10;
    }

    // 4. UV Sterilization Health (up to -15 pts)
    if (state.uvStatus === 'FAULT') {
      score -= 15;
    } else if (state.uvStatus === 'OFF' && state.simulationRunning) {
      score -= 8;
    }

    // 5. Sensor instrumentation reliability (up to -10 pts)
    if (!state.sensorDiagnostics.tdsOutputHealthy || state.outputTds >= 999) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Evaluates sensor diagnostic health flags
   */
  public static evaluateSensorDiagnostics(state: SimulationState): SensorDiagnosticFlags {
    const tdsOutputHealthy = state.outputTds < 900 && !isNaN(state.outputTds);
    const tdsInputHealthy = state.inputTds > 10 && state.inputTds < 3000;
    const turbidityInputHealthy = state.inputTurbidity >= 0 && state.inputTurbidity < 200;
    const turbidityOutputHealthy = state.outputTurbidity >= 0 && state.outputTurbidity < 50;
    const phInputHealthy = state.inputPh >= 4 && state.inputPh <= 11;
    const phOutputHealthy = state.outputPh >= 5 && state.outputPh <= 9;
    const flowRateHealthy = state.inputFlowRate >= 0 && state.inputFlowRate < 15;

    return {
      tdsInputHealthy,
      tdsOutputHealthy,
      turbidityInputHealthy,
      turbidityOutputHealthy,
      phInputHealthy,
      phOutputHealthy,
      flowRateHealthy,
    };
  }

  /**
   * Generates dynamic, state-dependent AI recommendations and predictive maintenance notices.
   */
  public static generateRecommendations(state: SimulationState): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // ─── 1. Predictive Sediment Filter Replacement ───
    const sedHealth = state.filterHealth.sediment;
    // Assuming typical daily household / community draw of 120 L/day
    // Daily degradation at current turbidity
    const dailyVolume = 120; // Liters/day
    const degradationPerLiter = (state.inputTurbidity / 15) * 0.012;
    const dailyDegradation = Math.max(0.4, dailyVolume * degradationPerLiter);
    const healthRemainingUntilThreshold = Math.max(0, sedHealth - 20); // replace at 20% health
    const daysRemaining = Math.max(1, Math.round(healthRemainingUntilThreshold / dailyDegradation));

    if (sedHealth < 25) {
      recommendations.push({
        id: 'rec-sed-critical',
        severity: 'CRITICAL',
        category: 'FILTER',
        title: 'Sediment Filter Clogging Alert',
        message: `Stage 1 SediShield at ${sedHealth.toFixed(1)}% health. Flow choked to ${state.inputFlowRate.toFixed(1)} L/min due to high particulate loading.`,
        action: 'Replace SediShield 5µm cartridge immediately to avoid booster pump cavitation.',
        predictedDaysRemaining: daysRemaining,
      });
    } else if (sedHealth < 60) {
      recommendations.push({
        id: 'rec-sed-warning',
        severity: 'WARNING',
        category: 'FILTER',
        title: 'Predictive Filter Maintenance',
        message: `Replace sediment filter in ~${daysRemaining} days. Current particulate load is ${state.inputTurbidity.toFixed(1)} NTU.`,
        action: `Order replacement 5µm melt-blown PP cartridge (Part #LEVI-SED-01). Expected life: ${daysRemaining} days remaining.`,
        predictedDaysRemaining: daysRemaining,
      });
    } else {
      recommendations.push({
        id: 'rec-sed-ok',
        severity: 'SUCCESS',
        category: 'FILTER',
        title: 'Sediment Filter Healthy',
        message: `SediShield running optimally at ${sedHealth.toFixed(0)}% health (~${daysRemaining} days remaining).`,
        action: 'No action required. Upstream turbidity within design envelope.',
        predictedDaysRemaining: daysRemaining,
      });
    }

    // ─── 2. RO Membrane Efficiency Diagnostics ───
    const nominalRejection = 0.95;
    const actualRejection = state.roRejectionRate;
    const efficiencyDropPct = Math.round((nominalRejection - actualRejection) * 100);

    if (efficiencyDropPct > 15 || state.filterHealth.ro < 30) {
      recommendations.push({
        id: 'rec-ro-foul',
        severity: 'CRITICAL',
        category: 'RO',
        title: 'RO Membrane Degradation',
        message: `RO efficiency reduced by ${efficiencyDropPct}%. Current salt rejection is only ${(actualRejection * 100).toFixed(0)}% (Output TDS: ${state.outputTds} ppm).`,
        action: 'Perform chemical clean-in-place (CIP) or replace 75 GPD thin-film composite membrane.',
      });
    } else if (efficiencyDropPct > 3) {
      recommendations.push({
        id: 'rec-ro-warning',
        severity: 'WARNING',
        category: 'RO',
        title: 'RO Membrane Efficiency Dip',
        message: `RO efficiency reduced by ${efficiencyDropPct}%. Membrane flux is stabilizing at 70% recovery.`,
        action: 'Monitor permeate conductivity. Schedule anti-scalant flush cycle.',
      });
    } else {
      recommendations.push({
        id: 'rec-ro-nominal',
        severity: 'SUCCESS',
        category: 'RO',
        title: 'RO Membrane Nominal',
        message: `RO membrane operating at ${(actualRejection * 100).toFixed(0)}% salt rejection. Reject brine safely flushed.`,
        action: 'Optimal separation performance. Mineral permeate within potable limits.',
      });
    }

    // ─── 3. UV Disinfection Subsystem ───
    if (state.uvStatus === 'FAULT') {
      recommendations.push({
        id: 'rec-uv-fault',
        severity: 'CRITICAL',
        category: 'UV',
        title: 'UV Disinfection Failure',
        message: 'Germicidal 254nm UV-C LED emitter offline. Pathogen sterilization compromised.',
        action: 'Do not consume unsterilized water directly. Check 12V LED ballast and quartz sleeve.',
      });
    } else if (state.uvStatus === 'ON') {
      recommendations.push({
        id: 'rec-uv-ok',
        severity: 'INFO',
        category: 'UV',
        title: 'UV Operating Normally',
        message: `UV operating normally. Delivered dosage: 16.5 mJ/cm² (4-log 99.99% microbial eradication).`,
        action: 'Quartz sleeve clean. Routine inspection scheduled at 2,000 operating hours.',
      });
    }

    // ─── 4. High Input TDS Alert ───
    if (state.inputTds > 800) {
      recommendations.push({
        id: 'rec-high-tds',
        severity: 'WARNING',
        category: 'WATER_QUALITY',
        title: 'High Input TDS Detected',
        message: `High input TDS detected (${state.inputTds} ppm). Reject brine stream concentrated to ${state.stageProfiles.tds.roReject} ppm.`,
        action: 'Ensure reject drain tube is routed to brine disposal pit. Verify 70% recovery ratio.',
      });
    }

    // ─── 5. Booster Pump Mechanical Diagnostics ───
    if (state.pumpStatus === 'FAULT') {
      recommendations.push({
        id: 'rec-pump-fault',
        severity: 'CRITICAL',
        category: 'PUMP',
        title: 'Pump Failure Detected',
        message: 'Booster pump stopped running. Zero flow rate and high thermal signature detected.',
        action: 'Check pump 24V supply relay, inspect impeller for debris obstruction.',
      });
    } else if (state.rawWaterLevel <= 0.05) {
      recommendations.push({
        id: 'rec-dry-run',
        severity: 'WARNING',
        category: 'SAFETY',
        title: 'Dry-Run Protection Active',
        message: 'Raw intake tank depleted. Booster pump automatically halted to prevent seal damage.',
        action: 'Refill raw water tank or engage borehole submersible transfer line.',
      });
    } else if (state.pumpStatus === 'RUNNING') {
      recommendations.push({
        id: 'rec-pump-ok',
        severity: 'SUCCESS',
        category: 'PUMP',
        title: 'Pump Healthy',
        message: `Pump healthy: Operating at ${state.pumpRpm} RPM, delivery pressure 4.2 Bar, stable current draw.`,
        action: 'Motor bearings and diaphragm operating within nominal acoustic thresholds.',
      });
    }

    // ─── 6. Sensor Failure Diagnostics ───
    if (!state.sensorDiagnostics.tdsOutputHealthy || state.outputTds >= 999) {
      recommendations.push({
        id: 'rec-sensor-fault',
        severity: 'CRITICAL',
        category: 'SAFETY',
        title: 'Instrumentation Sensor Fault',
        message: 'Post-RO TDS sensor probe open-circuit or out-of-range telemetry (999 ppm).',
        action: 'Inspect probe BNC connection, clean platinum electrodes, and recalibrate sensor ADC.',
      });
    }

    return recommendations;
  }
}
