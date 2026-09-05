'use client';

import React from 'react';
import { useSystemState, CameraPreset } from '@/hooks/useSystemState';
import { 
  X, 
  Cpu, 
  Settings, 
  Info, 
  Zap, 
  Activity, 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComponentDetail {
  name: string;
  purpose: string;
  principle: string;
  specifications: string[];
  power: string;
  maintenance: string;
  processRole: string;
  getLiveReadout?: (m: any) => string;
}

const componentCatalog: Record<string, ComponentDetail> = {
  solar: {
    name: 'Monocrystalline Solar Panel Array',
    purpose: 'Generates green electrical power from incident sunlight to charge the battery bank.',
    principle: 'Utilizes silicon photovoltaic cells to convert light photons into direct current (DC) electricity via the photoelectric effect.',
    specifications: ['Peak Output: 60 Watts', 'Open Circuit Voltage: 21.6V', 'Conversion Efficiency: 22.4%'],
    power: 'Generating: +58.0W (Sunlight dependent)',
    maintenance: '98% - Clean surface dust monthly',
    processRole: 'Primary energy harvester. Offsets battery discharge during daylight hours, ensuring self-sustaining remote loops.',
    getLiveReadout: (m) => `Generating: ${m.solarWatts.toFixed(1)}W`,
  },
  battery: {
    name: 'Smart LiFePO4 Battery Storage Pack',
    purpose: 'Buffers energy and powers all loads when solar charging is offline or insufficient.',
    principle: 'Houses 5 cylindrical Lithium Iron Phosphate cells wired in series-parallel, managed by an integrated battery management system (BMS).',
    specifications: ['Capacity: 12.8V 20Ah (256Wh)', 'Cell chemistry: LFP (Safe, 3000+ cycles)', 'Overcharge protection active'],
    power: 'Capacity: 100% | Discharge: Up to 150W',
    maintenance: '96% - Nominal voltage balance',
    processRole: 'Energy buffer. Stores solar energy to sustain operations overnight or in overcast/rain conditions.',
    getLiveReadout: (m) => `Charge: ${Math.round(m.batteryPercent)}% (${m.batteryPercent < 15 ? 'Critical Charge' : 'Optimal'})`,
  },
  esp32: {
    name: 'ESP32-S3 IoT Central Controller Box',
    purpose: 'Orchestrates system automation, processes sensor signals, and syncs telemetry to the cloud.',
    principle: 'Dual-core Tensilica microprocessor running a FreeRTOS loop, logging digital inputs and outputting PWM control signals.',
    specifications: ['Processor: Dual-core 240MHz', 'Connectivity: WiFi + Bluetooth BLE', 'ADC resolution: 12-bit (calibrated)'],
    power: 'Active load: 1.2W',
    maintenance: '100% - Firmware: v2.4.1 (Latest)',
    processRole: 'The brain of the system. Manages pump cycles, monitors threshold alarms, and drives local display indicators.',
    getLiveReadout: (m) => m.esp32Online ? 'Status: 🟢 ONLINE | Cloud Synced' : 'Status: 🔴 OFFLINE',
  },
  display: {
    name: '1.8" TFT Diagnostic Screen Interface',
    purpose: 'Renders local numerical measurements and alarm warnings for on-site operators.',
    principle: 'Active-matrix liquid crystal display driven via high-speed SPI serial communication from the ESP32 board.',
    specifications: ['Resolution: 128x128 pixels', 'Display driver: ST7735', 'Backlight: Adjustable PWM dimming'],
    power: 'Active load: 0.35W',
    maintenance: '100% - Display healthy',
    processRole: 'Local diagnostic display. Allows visual check of pH, TDS, temp, and battery without cellular/cloud connection.',
    getLiveReadout: (m) => `Displaying: Loop Metrics | Backlight: 85%`,
  },
  float: {
    name: 'Magnetic Float Level Switch',
    purpose: 'Monitors the absolute water level inside the primary clean tank to prevent dry-running or overflows.',
    principle: 'A magnetic float ring slides vertically along a stem. Passing reed switches closes or opens electrical contacts at set heights.',
    specifications: ['Switch rating: 50W DC', 'Material: SUS304 Stainless steel', 'Mounting position: Top flange'],
    power: 'Signal load: <0.02W',
    maintenance: '98% - Clean shaft quarterly',
    processRole: 'Operational safety switch. Stops the pump when the clean water tank reaches 100% capacity to prevent overflow.',
    getLiveReadout: (m) => `Level: ${m.waterLevel}% (${Math.round(m.waterLevel * 2.5)}L Reserve)`,
  },
  pump: {
    name: 'High-Efficiency DC Submersible Sump Pump',
    purpose: 'Drives raw intake water through the multi-layer filtration cylinder.',
    principle: 'Brushless DC motor spins an impeller at high angular velocity, creating centrifugal force that pushes fluid outward.',
    specifications: ['Max flow: 12 L/min', 'Max lift: 4.5 meters', 'Brushless motor with dry-run protection'],
    power: 'Draw: 12.0W (Load variable)',
    maintenance: '94% - Inspect impeller blades in 45 days',
    processRole: 'The circulatory heart. Provides the necessary pressure head to overcome resistance in the dense filtration media.',
    getLiveReadout: (m) => `Operating speed: ${m.pumpRpm} RPM | Flow: ${m.flowRate.toFixed(1)} L/min`,
  },
  uv: {
    name: 'UV-C LED Sterilization Module',
    purpose: 'Neutralizes pathogens, bacteria, and active biological contaminants.',
    principle: 'Exposes water flow to 254nm ultraviolet light, breaking down nucleic acids in pathogen DNA, preventing replication.',
    specifications: ['Wavelength: 254nm (UVC band)', 'LED Lifespan: 10,000 hrs', 'Emissive core: Quartz sleeve cover'],
    power: 'Active load: 3.5W',
    maintenance: '99% - Quartz tube clean',
    processRole: 'Final biological purification barrier. Ensures raw surface bacteria are destroyed before water enters the storage tank.',
    getLiveReadout: (m) => `Emitter Status: ${m.uvStatus}`,
  },
  ph: {
    name: 'Industrial pH Glass Electrode Probe',
    purpose: 'Monitors acidity or alkalinity to verify that drinking water meets safety standard guidelines.',
    principle: 'Measures hydrogen-ion activity across a thin glass membrane, creating a differential voltage relative to a reference cell.',
    specifications: ['Measurement range: 0-14 pH', 'Accuracy: ±0.05 pH', 'Temp compensation active'],
    power: 'Signal load: <0.05W',
    maintenance: '91% - Recalibrate probe with buffer solutions',
    processRole: 'Chemical safety guard. Alarms if water enters dangerous acidic or alkaline ranges (e.g. chemical spill).',
    getLiveReadout: (m) => `Current reading: ${m.ph.toFixed(2)} pH (Target: 6.5 - 8.5)`,
  },
  tds: {
    name: 'Electrical Conductivity TDS Probe',
    purpose: 'Measures the concentration of total dissolved solids and ionic minerals.',
    principle: 'Passes a high-frequency AC voltage between two stainless steel pins to measure electrical conductance, converting it to ppm.',
    specifications: ['Measurement range: 0-1000 ppm', 'Accuracy: ±2% F.S.', 'Temperature compensated'],
    power: 'Signal load: <0.05W',
    maintenance: '95% - Polish pins yearly',
    processRole: 'Chemical purity index. Evaluates mineral content and verifies successful removal of dissolved salts and heavy metals.',
    getLiveReadout: (m) => `Mineral purity: ${m.tds} ppm (WHO limit: <300 ppm)`,
  },
  turbidity: {
    name: '90-Degree Optical Turbidity Sensor',
    purpose: 'Measures water clarity by estimating suspended physical particulates.',
    principle: 'Projects an infrared light beam. A phototransistor positioned at 90 degrees measures scattered light intensity.',
    specifications: ['Range: 0-100 NTU', 'Light source: 850nm Infrared LED', 'Detection angle: 90 degrees'],
    power: 'Active draw: 0.15W',
    maintenance: '97% - Wipe glass window clean',
    processRole: 'Physical clarity check. Identifies mud, clay, or sediment loading, triggering warning flags if source is highly turbid.',
    getLiveReadout: (m) => `Suspended sediment: ${m.turbidity.toFixed(1)} NTU (Target: <5.0)`,
  },
  temp: {
    name: 'DS18B20 Digital Temperature Sensor',
    purpose: 'Measures water temperature, calibrating temperature-sensitive pH and TDS probes.',
    principle: 'Silicon bandgap sensor translates temperature changes to digital pulse counts using the 1-Wire protocol.',
    specifications: ['Range: -55°C to +125°C', 'Accuracy: ±0.5°C', 'Resolution: 12-bit programmable'],
    power: 'Signal load: <0.01W',
    maintenance: '100% - Calibrated',
    processRole: 'Calibration compensation. Adjusts voltage offset calculations of chemical sensors as water temperature changes.',
    getLiveReadout: (m) => `Temperature: ${m.temperature.toFixed(1)} °C`,
  },
  flow: {
    name: 'Inline Impeller Flow Sensor',
    purpose: 'Measures volumetric fluid speed to calculate total throughput and detect pipeline leaks.',
    principle: 'Fluid rotates a magnetic paddle wheel. An external Hall-effect chip outputs electrical pulses per revolution.',
    specifications: ['Flow range: 1.0 - 15.0 L/min', 'Pulse frequency: 7.5Hz per L/min', 'Fitting diameter: 1/2" NPT'],
    power: 'Active load: 0.05W',
    maintenance: '96% - Check rotation clearance',
    processRole: 'Hydraulic telemetry monitor. Tracks filter clogging rate (pressure-drop dropoff) and verifies pump throughput.',
    getLiveReadout: (m) => `Flow Rate: ${m.flowRate.toFixed(1)} L/min | Output frequency: ${Math.round(m.flowRate * 7.5)} Hz`,
  },
  tank2_verification: {
    name: 'Quality Verification Chamber (Chamber 2)',
    purpose: 'Inspects water purity immediately after 4-stage filtration. If pure, releases to clean storage; if impure, triggers automated closed-loop recirculation to Stage 1.',
    principle: 'Automated closed-loop verification: dual inline TDS, pH, and Turbidity probes inspect permeate. If parameters fail safety thresholds (TDS > 100 ppm), a bottom 3-way solenoid valve diverts the stream to the recirculation pump, returning it directly to Stage 1 (SediShield) to be re-filtered.',
    specifications: ['Volume: 65 Liters', 'Sensors: Secondary TDS, pH, Turbidity Probes', 'Valves: 12V DC Solenoid Recirculation Diverter', 'Loop: Stainless return riser directly to SediShield'],
    power: 'Verification telemetry: 0.15W | Recirculation diverter: 4.8W',
    maintenance: '98% - Probes self-calibrating',
    processRole: 'Quality gatekeeper. Guarantees 0% contaminated water enters clean drinking storage.',
    getLiveReadout: (m) => m.tds > 100 
      ? `VERIFICATION: IMPURE (${m.tds} ppm) ➔ Closed-Loop Recirculating to Stage 1 SediShield` 
      : `VERIFICATION: PURE (${m.tds || 28} ppm) ➔ Direct Dispense to Clean Potable Storage`,
  },
  recirculation_loop: {
    name: 'Closed-Loop Recirculation Loop',
    purpose: 'Automatically returns sub-standard permeate back to Stage 1 (SediShield) of the 4-stage filtration train.',
    principle: 'Closed-loop bypass: when post-filtration inspection detects elevated mineral salts, heavy metals, or turbidity, this dedicated conduit prevents contaminated discharge by feeding water back through the entire 4-stage purification cycle.',
    specifications: ['Return rate: 3.8 L/min', 'Pipe: Stainless steel sanitary tubing', 'Actuator: 12V DC brass solenoid valve'],
    power: 'Recirculation boost: 6.5W when active',
    maintenance: '96% - Automatic flushing cycle',
    processRole: 'Zero-waste re-filtration loop. Ensures 100% compliance before water enters the clean potable reservoir.',
    getLiveReadout: (m) => m.tds > 100 ? 'Status: ACTIVE RECIRCULATION (3.8 L/min)' : 'Status: STANDBY (Valve Closed)',
  },
  sedimentation_tank: {
    name: 'Primary Sedimentation Tank',
    purpose: 'Allows heavy physical silt, sand, and mining particulates to settle out gravitationally before water enters the pump.',
    principle: 'Multi-layer gravity stratification: water decelerates through stainless mesh, coarse gravel, graded quartz sand, and activated charcoal, trapping abrasive solids.',
    specifications: ['Volume: 45 Liters', 'Media: Stainless Screen, Gravel, Quartz Sand, Activated Carbon', 'Flow Velocity: 0.12 m/s'],
    power: 'Passive (Gravity-driven settling)',
    maintenance: '92% - Flush settled sludge weekly via bottom port',
    processRole: 'Primary physical pre-treatment. Shields the booster pump and 4-stage filters from abrasive wear by removing coarse sand/grit.',
    getLiveReadout: (m) => `Settling Chamber: Active | Inflow Turbidity: ${m.turbidity.toFixed(1)} NTU`,
  },
  sedimentation: {
    name: 'Primary Sedimentation Tank',
    purpose: 'Allows heavy physical silt, sand, and mining particulates to settle out gravitationally before water enters the pump.',
    principle: 'Multi-layer gravity stratification: water decelerates through stainless mesh, coarse gravel, graded quartz sand, and activated charcoal, trapping abrasive solids.',
    specifications: ['Volume: 45 Liters', 'Media: Stainless Screen, Gravel, Quartz Sand, Activated Carbon', 'Flow Velocity: 0.12 m/s'],
    power: 'Passive (Gravity-driven settling)',
    maintenance: '92% - Flush settled sludge weekly via bottom port',
    processRole: 'Primary physical pre-treatment. Shields the booster pump and 4-stage filters from abrasive wear by removing coarse sand/grit.',
    getLiveReadout: (m) => `Settling Chamber: Active | Inflow Turbidity: ${m.turbidity.toFixed(1)} NTU`,
  },
  filter_housing: {
    name: 'Four-Stage Smart Filtration Train (Borewell & Mining Defense)',
    purpose: 'Engineered 4-stage sequential defense line designed for borewell, mining-slurry, and rural tank water to strip particles, chemicals, dissolved salts, and infuse active copper ions.',
    principle: 'Combines Stage 1 SediShield (5µm sediment trap), Stage 2 ChemoBlock (activated carbon & chemical media), Stage 3 RO Maxx (0.0001µm high-pressure RO membrane), and Stage 4 Active Copper Filter (Cu²⁺ ion infusion & antimicrobial polish) connected in series with thin glowing manifold conduits.',
    specifications: [
      'Stage 1 – SediShield (92% Health): Blocks sand, rust, silt and coarse mining particulate',
      'Stage 2 – ChemoBlock (85% Health): Cuts chlorine, odour, colour and organic chemical contaminants',
      'Stage 3 – RO Maxx (88% Health): Drops TDS (680 → 28 ppm, -96%) and strips heavy metals',
      'Stage 4 – Active Copper (95% Health): Infuses active bio-available copper ions (Cu²⁺) for natural antimicrobial protection and crisp taste',
    ],
    power: 'DC Pump Boost: 12V–24V / 24W',
    maintenance: '91% Train Health • SediShield: 92% | ChemoBlock: 85% | RO Maxx: 88% | Active Copper: 95%',
    processRole: 'The core multi-stage purification engine. Protects pumps, drops TDS into safe drinking/aquaculture bands, and infuses active copper minerals before storage.',
    getLiveReadout: (m) => `Train Status: NOMINAL | TDS Drop: ${m.tds || 680} → ${m.tds2 || 28} ppm (-96%) | Active Copper: 95%`,
  },
  filter: {
    name: 'Four-Stage Smart Filtration Train',
    purpose: 'Engineered multi-barrier purification for borewell, mining-slurry, and rural tank water.',
    principle: 'SediShield (sediment) ➔ ChemoBlock (chemical) ➔ RO Maxx (high-pressure RO) ➔ Active Copper (mineral & antimicrobial).',
    specifications: [
      'Stage 1 – SediShield: Blocks dirt, silt & rust (92%)',
      'Stage 2 – ChemoBlock: Cuts chlorine & odour (85%)',
      'Stage 3 – RO Maxx: Drops TDS & metals (88%)',
      'Stage 4 – Active Copper: Infuses copper ions & antimicrobial polish (95%)',
    ],
    power: 'Active load: 24W Booster',
    maintenance: 'Health: 91% • All 4 cartridges online',
    processRole: 'Primary borewell and mining purification stack.',
    getLiveReadout: (m) => `Filter Train: Active | SediShield: 92% | ChemoBlock: 85% | RO Maxx: 88% | Active Copper: 95%`,
  },
  primary_tank: {
    name: 'Primary Pure Water Storage Tank',
    purpose: 'Stores purified water, maintaining clean reserves ready for distribution.',
    principle: 'Clear, food-grade glass holding vessel equipped with an automated drain tap and liquid level sensors.',
    specifications: ['Capacity: 250 Liters', 'Drain valve: 1/2" Solenoid actuated', 'Construction: Polished impact glass'],
    power: 'Passive storage',
    maintenance: '98% - Clean container interior yearly',
    processRole: 'Purified reserve holding tank. Stores clean UVC-treated water, buffering it for immediate drinking use.',
    getLiveReadout: (m) => `Volume Reserve: ${m.waterLevel}% (${Math.round(m.waterLevel * 2.5)} Liters)`,
  },
  secondary_tank: {
    name: 'Secondary Monitoring Tank Frame',
    purpose: 'Houses sensor probes and the submerged pump, managing raw water inlet flow.',
    principle: 'Acts as a buffer reservoir that maintains constant immersion height for probes, preventing drying out.',
    specifications: ['Volume: 10.0 Liters', 'Immersion depth: 220mm', 'Material: Impact clear acrylic'],
    power: 'Passive buffer',
    maintenance: '97% - Flush scale buildup monthly',
    processRole: 'Sensor well. Keeps the pH and TDS probes constantly submerged in fresh flowing water for stable readings.',
    getLiveReadout: (m) => `Probe Well: Submerged | Water Quality: ${m.waterQuality}`,
  },
  intake_pipe: {
    name: 'Industrial Raw Water Intake Pipe',
    purpose: 'Draws raw water from the source body (lake, pond, or river) into the system.',
    principle: 'Sub-atmospheric suction pipeline containing a bottom strainer mesh that prevents debris ingestion.',
    specifications: ['Length: 3.5 meters', 'Material: Industrial PVC', 'Strainer mesh: 40-mesh steel sieve'],
    power: 'Passive suction line',
    maintenance: '92% - Clear intake screen weekly',
    processRole: 'Raw inlet conduit. Draws turbid source water, utilizing the bottom mesh to sieve out leaves, twigs, and small fish.',
    getLiveReadout: (m) => `Intake flow: ${m.flowRate.toFixed(1)} L/min (Vacuum pressure: OK)`,
  },
  return_pipe: {
    name: 'Purified Water Return Pipe',
    purpose: 'Conveys UVC-treated pure water back into the primary storage tank.',
    principle: 'Gravity-assisted horizontal PVC conduit carrying sieved, filtered, and sterilized water.',
    specifications: ['Length: 2.2 meters', 'Diameter: 3/4" (schedule 40)', 'Connections: Solvent-welded elbow joints'],
    power: 'Passive gravity flow',
    maintenance: '100% - Clean conduit',
    processRole: 'Distribution loop. Final plumbing loop returning pure, clean water into the storage reservoir.',
    getLiveReadout: (m) => `Loop status: ${m.flowRate > 0.1 ? 'Flowing Pure' : 'Standby'}`,
  },
  drain_valve: {
    name: 'Solenoid Actuated Tank Drain Valve',
    purpose: 'Releases storage water for distribution or empties the tank during clean cycles.',
    principle: 'Normally-closed electromagnetic solenoid valve. Opening the coil pulls a steel plunger back, letting water flow.',
    specifications: ['Voltage: 12V DC', 'Valve type: Direct-acting Solenoid', 'Action: Rotational status indicator'],
    power: 'Active draw: 6.0W when open',
    maintenance: '99% - Inspect valve seal yearly',
    processRole: 'Discharge tap. Controls outlet flow and handles the self-cleaning tank draining program.',
    getLiveReadout: (m) => m.mode === 'CLEANING' ? 'Valve Status: OPEN (Draining loop active)' : 'Valve Status: CLOSED',
  },
  hydro_generator: {
    name: 'Hydro-Power Turbine Generator Motor',
    purpose: 'Harvests kinetic and gravitational water flow energy to charge the on-board Lithium battery system.',
    principle: 'High-head water vortex spins an internal turbine impeller runner, turning a permanent-magnet dynamo generator stator.',
    specifications: ['Output: 12V DC / up to 35W Peak', 'Impeller: Vortex runner', 'Coupling: In-line hydraulic flange', 'Charging wire: High-flex copper harness'],
    power: 'Energy generation: +15W to +35W clean power',
    maintenance: '98% - Dynamo bearings sealed (10,000 hrs)',
    processRole: 'Hydraulic energy recovery unit. Converts raw intake flow pressure directly into electrical energy to charge the battery bank.',
    getLiveReadout: (m) => `Hydro Generation: +${(m.hydroWatts || 0).toFixed(1)}W | Battery Charge Rate: +${((m.hydroWatts || 0) / 12).toFixed(2)}A`,
  },
  hand_pump: {
    name: 'India Mark II Deep-Well Hand Pump',
    purpose: 'Provides manual mechanical deep-well water extraction from underground aquifers or settling ponds.',
    principle: 'Lever arm actuates a vertical connecting rod and down-hole cylinder plunger with leather/nitrile bucket seals.',
    specifications: ['Stroke length: 100–125 mm', 'Material: Hot-dip galvanized cast steel', 'Handle mechanical advantage: ~4:1'],
    power: 'Manual mechanical human power (0W electrical)',
    maintenance: '95% - Inspect plunger seals annually',
    processRole: 'Primary manual intake mechanism. Lifts raw subterranean water and discharges it through the hydro turbine and booster pump into the 4-stage filtration train.',
    getLiveReadout: (m) => `Intake Throughput: ${m.flowRate.toFixed(1)} L/min | Mechanism Status: OPERATIONAL`,
  },
};

export const BottomDetailCard = () => {
  const { activeHotspot, setActiveHotspot, setCameraPreset, metrics } = useSystemState();

  const handleClose = () => {
    setActiveHotspot(null);
    setCameraPreset('OVERVIEW');
  };

  const detail = activeHotspot ? componentCatalog[activeHotspot] : null;

  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          initial={{ y: 220, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 220, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 150 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-6 pointer-events-none"
        >
          {/* Glassmorphic Panel Container */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden pointer-events-auto shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            
            {/* Header: Component Name + Close Button */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4 animate-pulse text-cyan-400" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase font-mono">Component Diagnostics</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Title / Value Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-wide">{detail.name}</h2>
                <p className="text-[11px] text-zinc-400 font-light mt-0.5 max-w-xl">{detail.purpose}</p>
              </div>
              
              {/* Live readout badge */}
              {detail.getLiveReadout && (
                <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs font-bold tracking-wide shrink-0">
                  {detail.getLiveReadout(metrics)}
                </div>
              )}
            </div>

            {/* Grid details (Three columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: System Connection & Process Role */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Process Integration
                </span>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  {detail.processRole}
                </p>
              </div>

              {/* Column 2: Working Principle */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-zinc-400" /> Working Principle
                </span>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  {detail.principle}
                </p>
              </div>

              {/* Column 3: Specifications & Power */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-zinc-400" /> Hardware Specs
                </span>
                <ul className="flex flex-col gap-1 text-[10px] text-zinc-300 font-mono">
                  {detail.specifications.map((spec, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-cyan-400/60" />
                      <span>{spec}</span>
                    </li>
                  ))}
                  <li className="mt-2 text-amber-300 flex items-center gap-1.5 font-bold">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{detail.power}</span>
                  </li>
                  <li className="mt-1 text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span className="text-zinc-500 font-semibold uppercase text-[8px] tracking-wider">Health:</span>
                    <span>{detail.maintenance}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
