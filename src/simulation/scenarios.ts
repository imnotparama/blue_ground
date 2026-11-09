import { ScenarioDefinition } from './types';

export const SCENARIO_DEFINITIONS: Record<string, ScenarioDefinition> = {
  NORMAL: {
    id: 'NORMAL',
    name: 'Normal Operation',
    badge: 'OPTIMAL NOMINAL',
    description: 'Borewell feed at nominal parameters. Full 4-stage purification with 70% recovery and 95% TDS rejection.',
    feedWater: {
      tds: 240,
      turbidity: 2.2,
      ph: 7.25,
      temperature: 24.2,
      rawLevel: 100,
    },
    componentWearFactors: {
      sedimentDegradationMult: 1.0,
      roDegradationMult: 1.0,
    },
  },

  HIGH_TDS: {
    id: 'HIGH_TDS',
    name: 'High TDS Borewell Water',
    badge: 'HEAVY MINERAL FEED',
    description: 'Deep subterranean aquifer with high mineral mineralization (1,180 ppm). RO membrane concentrates brine while delivering <60 ppm permeate.',
    feedWater: {
      tds: 1180,
      turbidity: 3.8,
      ph: 7.75,
      temperature: 25.5,
      rawLevel: 100,
    },
    componentWearFactors: {
      sedimentDegradationMult: 1.2,
      roDegradationMult: 2.5,
    },
  },

  HIGH_TURBIDITY: {
    id: 'HIGH_TURBIDITY',
    name: 'High Turbidity Water',
    badge: 'MINING SLURRY RUNOFF',
    description: 'High suspended particulate load (52 NTU) from mining rainwater runoff. Sediment cartridge faces accelerated particulate loading.',
    feedWater: {
      tds: 480,
      turbidity: 52.0,
      ph: 6.45,
      temperature: 23.8,
      rawLevel: 100,
    },
    componentWearFactors: {
      sedimentDegradationMult: 5.0,
      roDegradationMult: 1.3,
    },
  },

  LOW_WATER: {
    id: 'LOW_WATER',
    name: 'Low Water Level',
    badge: 'FEED DEPLETION DANGER',
    description: 'Raw intake tank depleted to only 3.5 Liters. Demonstrates automated low-water shutoff and dry-run pump safety interlock.',
    feedWater: {
      tds: 220,
      turbidity: 1.8,
      ph: 7.15,
      temperature: 24.0,
      rawLevel: 3.5,
    },
    componentWearFactors: {
      sedimentDegradationMult: 0.5,
      roDegradationMult: 0.5,
    },
  },

  SEDIMENT_CLOGGING: {
    id: 'SEDIMENT_CLOGGING',
    name: 'Sediment Filter Clogging',
    badge: 'CARTRIDGE FOULING',
    description: 'Melt-blown polypropylene cartridge saturated with silt and rust (Health 14%). Differential pressure causes severe flow restriction down to 1.2 L/min.',
    feedWater: {
      tds: 310,
      turbidity: 18.5,
      ph: 7.10,
      temperature: 24.1,
      rawLevel: 100,
    },
    componentWearFactors: {
      sedimentClogged: true,
      sedimentDegradationMult: 3.0,
    },
  },

  RO_DEGRADATION: {
    id: 'RO_DEGRADATION',
    name: 'RO Membrane Degradation',
    badge: 'MEMBRANE SCALING',
    description: 'Polyamide thin-film composite membrane suffered mineral scaling (Health 22%). Salt rejection drops from 95% down to 52%, exceeding potable TDS thresholds.',
    feedWater: {
      tds: 650,
      turbidity: 2.4,
      ph: 7.40,
      temperature: 24.8,
      rawLevel: 100,
    },
    componentWearFactors: {
      roDegraded: true,
      roDegradationMult: 3.5,
    },
  },

  PUMP_FAILURE: {
    id: 'PUMP_FAILURE',
    name: 'Pump Failure',
    badge: 'MECHANICAL FAULT',
    description: 'Booster pump motor thermal overload or mechanical seizure. Zero RPM, flow collapse, automated safety trip shuts solenoid valve.',
    feedWater: {
      tds: 250,
      turbidity: 2.0,
      ph: 7.20,
      temperature: 24.5,
      rawLevel: 100,
    },
    componentWearFactors: {
      pumpFault: true,
    },
  },

  SENSOR_FAILURE: {
    id: 'SENSOR_FAILURE',
    name: 'Sensor Failure',
    badge: 'INSTRUMENTATION FAULT',
    description: 'Output quality sensor wiring fault / probe open-circuit. Output TDS telemetry goes offline or registers out-of-range, triggering diagnostic fail-safe.',
    feedWater: {
      tds: 240,
      turbidity: 2.1,
      ph: 7.25,
      temperature: 24.2,
      rawLevel: 100,
    },
    componentWearFactors: {
      sensorFault: true,
    },
  },

  UV_FAILURE: {
    id: 'UV_FAILURE',
    name: 'UV Failure',
    badge: 'DISINFECTION RISK',
    description: 'High-output germicidal 254nm UV-C LED driver or emitter failure. Pathogen neutralization compromised; system recommends halting potable dispensation.',
    feedWater: {
      tds: 240,
      turbidity: 2.0,
      ph: 7.20,
      temperature: 24.3,
      rawLevel: 100,
    },
    componentWearFactors: {
      uvFault: true,
    },
  },
};
