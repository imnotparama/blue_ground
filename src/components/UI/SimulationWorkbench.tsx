'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { SCENARIO_DEFINITIONS, SimulationScenarioId } from '@/simulation';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  X,
  Gauge,
  Droplets,
  Layers,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Zap,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Maximize2,
  Minimize2,
  Sliders,
  Filter,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCertifiedLabReport } from '@/utils/generateLabReport';

// Telemetry historical packet type for live rolling charts
interface TelemetryPoint {
  time: string;
  rawTds: number;
  outputTds: number;
  rejectTds: number;
  inFlow: number;
  outFlow: number;
  wasteFlow: number;
  rawTurbidity: number;
  outputTurbidity: number;
  rawLevel: number;
  cleanLevel: number;
  wasteLevel: number;
  pumpRpm: number;
  pressureBar: number;
  ph: number;
  powerWatts: number;
}

export const SimulationWorkbench: React.FC = () => {
  const {
    simState,
    simulationRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    stepSimulation,
    activeScenario,
    setScenario,
    speedMultiplier,
    setSpeedMultiplier,
    simulationViewOpen,
    setSimulationViewOpen,
  } = useSystemState();

  const [activeTab, setActiveTab] = useState<'SCHEMATIC' | 'CHARTS' | 'SENSORS' | 'TERMINAL'>('SCHEMATIC');
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const packetCountRef = useRef(1000);

  // Accumulate live telemetry historical points every second
  useEffect(() => {
    if (!simState) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    packetCountRef.current += 1;
    const seq = packetCountRef.current;

    const pressure = simState.pumpStatus === 'RUNNING'
      ? Math.round((5.8 + (simState.pumpRpm / 2000) * 1.4) * 10) / 10
      : 0.4;

    const power = simState.pumpStatus === 'RUNNING'
      ? Math.round(45 + (simState.pumpRpm / 2000) * 22)
      : 4;

    const rejectTds = simState.stageProfiles?.tds?.roReject || Math.round(simState.inputTds * 1.4);

    const newPoint: TelemetryPoint = {
      time: timeStr,
      rawTds: simState.inputTds,
      outputTds: simState.outputTds,
      rejectTds,
      inFlow: simState.inputFlowRate,
      outFlow: simState.outputFlowRate,
      wasteFlow: simState.wasteFlowRate,
      rawTurbidity: simState.inputTurbidity,
      outputTurbidity: simState.outputTurbidity,
      rawLevel: Math.round(simState.rawWaterLevel * 10) / 10,
      cleanLevel: Math.round(simState.purifiedWaterLevel * 10) / 10,
      wasteLevel: Math.round(simState.wasteWaterLevel * 10) / 10,
      pumpRpm: simState.pumpRpm,
      pressureBar: pressure,
      ph: simState.outputPh,
      powerWatts: power,
    };

    setHistory(prev => {
      const next = [...prev, newPoint];
      if (next.length > 25) next.shift();
      return next;
    });

    // Generate real-time telemetry log packet
    const logPkt = `[${timeStr}] ESP32_TX >> #SEQ:${seq} [RAW:${newPoint.rawLevel}L, CLN:${newPoint.cleanLevel}L] Q_IN:${newPoint.inFlow}L/m | TDS_IN:${newPoint.rawTds} -> TDS_OUT:${newPoint.outputTds} | TURB:${newPoint.outputTurbidity}NTU | PUMP:${newPoint.pumpRpm}RPM (${newPoint.pressureBar}bar) | CRC:0x${((seq * 31) % 65535).toString(16).toUpperCase()}`;

    setLogLines(prev => {
      const nextLogs = [...prev, logPkt];
      if (nextLogs.length > 80) nextLogs.shift();
      return nextLogs;
    });
  }, [simState]);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (autoScrollLogs && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logLines, autoScrollLogs]);

  // Export accumulated telemetry data to CSV file
  const exportCsv = () => {
    if (history.length === 0) return;
    const headers = [
      'Timestamp',
      'Raw_Level_L',
      'Clean_Level_L',
      'Waste_Level_L',
      'Feed_Flow_Lpm',
      'Permeate_Flow_Lpm',
      'Reject_Flow_Lpm',
      'Raw_TDS_ppm',
      'Permeate_TDS_ppm',
      'Reject_TDS_ppm',
      'Raw_Turbidity_NTU',
      'Permeate_Turbidity_NTU',
      'Output_pH',
      'Pump_RPM',
      'Discharge_Pressure_bar',
      'Power_Consumption_W',
    ];

    const rows = history.map(p => [
      p.time,
      p.rawLevel,
      p.cleanLevel,
      p.wasteLevel,
      p.inFlow,
      p.outFlow,
      p.wasteFlow,
      p.rawTds,
      p.outputTds,
      p.rejectTds,
      p.rawTurbidity,
      p.outputTurbidity,
      p.ph,
      p.pumpRpm,
      p.pressureBar,
      p.powerWatts,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blueground_simulation_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard shortcut listener: Shift + S toggles workbench
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'S' && e.shiftKey) {
        e.preventDefault();
        setSimulationViewOpen(!simulationViewOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [simulationViewOpen, setSimulationViewOpen]);

  if (!simulationViewOpen) return null;

  const currentScenario = SCENARIO_DEFINITIONS[activeScenario] || SCENARIO_DEFINITIONS.NORMAL;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative flex flex-col bg-zinc-950/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden transition-all ${
            isFullscreen ? 'w-full h-full rounded-none border-0' : 'w-[96vw] max-w-7xl h-[90vh]'
          }`}
        >
          {/* Top Bar: Mission Control Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-mono">
                    BlueGround Leviathan • Complete Simulation Workbench
                  </h2>
                  <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest font-bold rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    REAL-TIME DIGITAL TWIN ENGINE v2.0
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                  <span>CLK: 1.0Hz (1000ms)</span>
                  <span>•</span>
                  <span>MODE: {simState.waterQuality}</span>
                  <span>•</span>
                  <span>RATING: 70% PERMEATE RECOVERY</span>
                  <span>•</span>
                  <span>AI HEALTH: <strong className="text-cyan-400">{simState.aiHealthScore}/100</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle */}
              <button
                onClick={() => (simulationRunning ? pauseSimulation() : startSimulation())}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                  simulationRunning
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                }`}
                title={simulationRunning ? 'Pause simulation loop' : 'Start simulation loop'}
              >
                {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{simulationRunning ? 'PAUSE' : 'RUN'}</span>
              </button>

              {/* Step 1 Second */}
              <button
                onClick={() => stepSimulation()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                title="Single Step (1s)"
              >
                <FastForward className="w-3 h-3 text-cyan-400" />
                <span>STEP</span>
              </button>

              {/* Reset State */}
              <button
                onClick={() => resetSimulation()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                title="Reset simulation variables"
              >
                <RotateCcw className="w-3 h-3 text-zinc-400" />
                <span>RESET</span>
              </button>

              {/* Speed Multiplier Selector */}
              <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-white/10">
                {[1, 2, 5, 10].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setSpeedMultiplier(mult)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                      speedMultiplier === mult
                        ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>

              {/* CSV Telemetry Downloader */}
              <button
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
                title="Download complete telemetry logs as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EXPORT CSV</span>
              </button>

              {/* Certified WHO Potability Lab Report Generator */}
              <button
                onClick={() => {
                  if (!simState) return;
                  generateCertifiedLabReport({
                    inputTds: simState.inputTds,
                    outputTds: simState.outputTds,
                    inputTurbidity: simState.inputTurbidity,
                    outputTurbidity: simState.outputTurbidity,
                    inputPh: simState.inputPh,
                    outputPh: simState.outputPh,
                    totalPurified: simState.totalWaterPurified,
                    totalWaste: simState.totalWasteWater,
                    operatingHours: simState.operatingHours,
                    recoveryRate: simState.roRecoveryRate,
                    rejectionRate: simState.roRejectionRate,
                    uvStatus: simState.uvStatus,
                    aiScore: simState.aiHealthScore,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer"
                title="Generate and download WHO drinking water quality laboratory test certificate"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WHO LAB REPORT</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 transition-all"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setSimulationViewOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 hover:bg-rose-950/50 hover:border-rose-500/40 hover:text-rose-400 transition-all"
                title="Close Simulation View (Shift+S)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader: Scenario Selector & View Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-zinc-900/50 border-b border-white/5">
            {/* Scenario Selector Dropdown */}
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono text-zinc-400">ENGINEERING SCENARIO:</span>
              <select
                value={activeScenario}
                onChange={(e) => setScenario(e.target.value as SimulationScenarioId)}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-zinc-900 border border-cyan-500/30 text-cyan-300 focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                {Object.values(SCENARIO_DEFINITIONS).map((sc) => (
                  <option key={sc.id} value={sc.id} className="bg-zinc-900 text-white">
                    {sc.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 hidden md:inline font-mono">
                — {currentScenario.description}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('SCHEMATIC')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'SCHEMATIC'
                    ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>P&ID FLOW CIRCUIT</span>
              </button>

              <button
                onClick={() => setActiveTab('CHARTS')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'CHARTS'
                    ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>REAL-TIME CHARTS ({history.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('SENSORS')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'SENSORS'
                    ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Gauge className="w-3 h-3" />
                <span>SENSOR MATRIX (16 CHANNELS)</span>
              </button>

              <button
                onClick={() => setActiveTab('TERMINAL')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'TERMINAL'
                    ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>SERIAL STREAM</span>
              </button>
            </div>
          </div>

          {/* Main Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-black">
            {/* ─────────────────────────────────────────────────────────────
                TAB 1: P&ID SCHEMATIC WATER FLOW PROCESS CIRCUIT
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'SCHEMATIC' && (
              <div className="space-y-6">
                {/* Visual Pipeline Schematic Card */}
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                        PROCESS FLOW DIAGRAM (P&ID) • STAGE-BY-STAGE CONTINUOUS WATER TRANSFORMATION
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      INPUT FLOW: <strong className="text-cyan-400">{simState.inputFlowRate} L/min</strong> → PERMEATE:{' '}
                      <strong className="text-emerald-400">{simState.outputFlowRate} L/min</strong> | REJECT:{' '}
                      <strong className="text-amber-400">{simState.wasteFlowRate} L/min</strong>
                    </span>
                  </div>

                  {/* Flow Stages Pipeline Visualizer */}
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 relative">
                    {/* Stage 1: Raw Water Tank */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-cyan-500/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-cyan-400">STAGE 1</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-2">Raw Feed Tank</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>Level:</span>
                            <strong className="text-white">{Math.round(simState.rawWaterLevel)} L</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>TDS:</span>
                            <strong className="text-amber-400">{simState.inputTds} ppm</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Turbidity:</span>
                            <strong className="text-amber-400">{simState.inputTurbidity} NTU</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>pH:</span>
                            <strong className="text-zinc-300">{simState.inputPh}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-cyan-400/90">
                        → Q_in: {simState.inputFlowRate} L/m
                      </div>
                    </div>

                    {/* Stage 2: Sediment Filter */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-400">STAGE 2</span>
                        <h4 className="text-xs font-bold text-white mb-2">Sediment Trap</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>Removes:</span>
                            <span className="text-white font-bold">85% Turbidity</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Post-Turb:</span>
                            <strong className="text-emerald-400">
                              {Math.round((simState.stageProfiles?.turbidity?.afterSediment || 2.1) * 10) / 10} NTU
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Health:</span>
                            <strong className={simState.filterHealth.sediment < 30 ? 'text-rose-400' : 'text-emerald-400'}>
                              {simState.filterHealth.sediment}%
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>ΔP Loss:</span>
                            <span className="text-zinc-300">0.2 bar</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-zinc-400">
                        5-Micron Spun PP
                      </div>
                    </div>

                    {/* Stage 3: Carbon Block */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-400">STAGE 3</span>
                        <h4 className="text-xs font-bold text-white mb-2">Pre-Carbon</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>Chlorine:</span>
                            <span className="text-emerald-400 font-bold">99% Elim</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VOCs:</span>
                            <span className="text-emerald-400">Adsorbed</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Health:</span>
                            <strong className="text-emerald-400">{simState.filterHealth.carbon}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>TDS:</span>
                            <span className="text-zinc-300">{simState.inputTds} ppm</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-zinc-400">
                        Coconut Shell CTO
                      </div>
                    </div>

                    {/* Stage 4: Booster Pump */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-cyan-500/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-cyan-400">STAGE 4</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold ${
                              simState.pumpStatus === 'RUNNING'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : simState.pumpStatus === 'FAULT'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {simState.pumpStatus}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-2">Booster Pump</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>Speed:</span>
                            <strong className="text-white">{simState.pumpRpm} RPM</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Discharge:</span>
                            <strong className="text-cyan-300">
                              {simState.pumpStatus === 'RUNNING' ? '6.8 bar' : '0.4 bar'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Power:</span>
                            <span className="text-zinc-300">
                              {simState.pumpStatus === 'RUNNING' ? '58 W' : '0 W'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valve:</span>
                            <span className="text-emerald-400">{simState.solenoidValveStatus}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-cyan-400">
                        24V DC Diaphragm
                      </div>
                    </div>

                    {/* Stage 5: RO Membrane (STREAM SPLIT) */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-b from-cyan-950/40 to-amber-950/30 border border-cyan-500/40 flex flex-col justify-between col-span-1 md:col-span-1 lg:col-span-1 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-cyan-300">STAGE 5 (SPLIT)</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-400">
                            {Math.round(simState.roRejectionRate * 100)}% REJ
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-2">RO Membrane</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between text-emerald-300">
                            <span>Permeate (70%):</span>
                            <strong>{simState.outputFlowRate} L/m</strong>
                          </div>
                          <div className="flex justify-between text-emerald-300">
                            <span>Perm TDS:</span>
                            <strong>{simState.stageProfiles?.tds?.roPermeate || 16} ppm</strong>
                          </div>
                          <div className="flex justify-between text-amber-400 pt-1 border-t border-white/5">
                            <span>Reject (30%):</span>
                            <strong>{simState.wasteFlowRate} L/m</strong>
                          </div>
                          <div className="flex justify-between text-amber-400">
                            <span>Brine TDS:</span>
                            <strong>{simState.stageProfiles?.tds?.roReject || Math.round(simState.inputTds * 1.4)} ppm</strong>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-cyan-300">
                        Polyamide Thin-Film
                      </div>
                    </div>

                    {/* Stage 6: UV Disinfection */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-purple-500/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-purple-400">STAGE 6</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold ${
                              simState.uvStatus === 'ON'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {simState.uvStatus}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-2">UV Disinfection</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>Dose:</span>
                            <strong className="text-purple-300">
                              {simState.uvStatus === 'ON' ? '42 mJ/cm²' : '0 mJ/cm²'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Wavelength:</span>
                            <span className="text-white">254 nm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pathogens:</span>
                            <strong className="text-emerald-400">Log-4 (99.99%)</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Lamp Life:</span>
                            <span className="text-zinc-300">{simState.filterHealth.uv}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-purple-400">
                        Quartz Sleeve Tube
                      </div>
                    </div>

                    {/* Stage 7: UF & Remineralization */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-400">STAGE 7</span>
                        <h4 className="text-xs font-bold text-white mb-2">UF & Minerals</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>UF Pore:</span>
                            <span className="text-white font-bold">0.01 Micron</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ca²⁺ / Mg²⁺:</span>
                            <span className="text-cyan-300">+12 ppm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Final pH:</span>
                            <strong className="text-emerald-400">{simState.outputPh}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Turbidity:</span>
                            <strong className="text-emerald-400">{simState.outputTurbidity} NTU</strong>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-zinc-400">
                        Active Copper / Bio
                      </div>
                    </div>

                    {/* Stage 8: Clean Water Storage */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-emerald-400">STAGE 8</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-2">Clean Storage</h4>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span>Stored:</span>
                            <strong className="text-emerald-300">{Math.round(simState.purifiedWaterLevel)} L</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>TDS:</span>
                            <strong className="text-emerald-300">{simState.outputTds} ppm</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality:</span>
                            <strong className="text-emerald-400 font-bold">{simState.waterQuality}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Dispense:</span>
                            <span className="text-zinc-300">Ready</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-emerald-400">
                        Certified Potable
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mass Balance & Real-Time Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card 1: Mass Balance Summary */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                      MASS BALANCE EQUILIBRIUM
                    </span>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Raw Water Tank (100L):</span>
                        <strong className="text-cyan-400">{Math.round(simState.rawWaterLevel * 10) / 10} L</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${(simState.rawWaterLevel / simState.rawTankCapacity) * 100}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-zinc-400">Clean Permeate Tank (100L):</span>
                        <strong className="text-emerald-400">{Math.round(simState.purifiedWaterLevel * 10) / 10} L</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-300"
                          style={{ width: `${(simState.purifiedWaterLevel / simState.purifiedTankCapacity) * 100}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-zinc-400">Reject Brine Tank (50L):</span>
                        <strong className="text-amber-400">{Math.round(simState.wasteWaterLevel * 10) / 10} L</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${(simState.wasteWaterLevel / simState.wasteTankCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Cumulative Volumetric Counters */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                      CUMULATIVE PRODUCTION METRICS
                    </span>
                    <div className="space-y-3 font-mono">
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Total Water Purified:</span>
                        <span className="text-xl font-bold text-emerald-400">
                          {Math.round(simState.totalWaterPurified * 100) / 100} L
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Total Brine Rejected:</span>
                        <span className="text-xl font-bold text-amber-400">
                          {Math.round(simState.totalWasteWater * 100) / 100} L
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-zinc-400">
                        <span>Engine Run Time:</span>
                        <span className="text-white font-bold">{Math.round(simState.operatingHours * 10) / 10} hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Reverse Osmosis Separation Kinetics */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                      RO SEPARATION MEMBRANE METRICS
                    </span>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Salt Rejection:</span>
                        <strong className="text-emerald-400">{Math.round(simState.roRejectionRate * 1000) / 10}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Permeate Recovery:</span>
                        <strong className="text-cyan-400">{Math.round(simState.roRecoveryRate * 100)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Net Driving Pressure:</span>
                        <strong className="text-zinc-200">5.4 bar</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Osmotic Pressure (Π):</span>
                        <strong className="text-zinc-200">2.3 bar</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Concentration Factor:</span>
                        <strong className="text-amber-400">1.43x</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Membrane Health:</span>
                        <strong className={simState.filterHealth.ro < 40 ? 'text-rose-400' : 'text-emerald-400'}>
                          {simState.filterHealth.ro}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: AI Recommendations & Anomaly Detection */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 flex items-center justify-between">
                      <span>AI DIAGNOSTIC ENGINE</span>
                      <span className="text-cyan-400 font-bold">{simState.aiHealthScore}/100</span>
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                      {simState.aiRecommendations.length > 0 ? (
                        simState.aiRecommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-[10px] font-mono border flex items-start gap-1.5 ${
                              rec.severity === 'CRITICAL'
                                ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                                : rec.severity === 'WARNING'
                                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                            }`}
                          >
                            {rec.severity === 'CRITICAL' ? (
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                            ) : rec.severity === 'WARNING' ? (
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-cyan-400 mt-0.5" />
                            )}
                            <div>
                              <strong className="block font-bold">{rec.message}</strong>
                              <span className="text-zinc-400 text-[9px]">{rec.action}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-zinc-500 font-mono py-4 text-center">
                          All components operating in nominal state.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 2: REAL-TIME ROLLING TELEMETRY CHARTS
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'CHARTS' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chart 1: TDS Trajectory */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold text-white uppercase">
                          TDS SEPARATION CURVE (ppm)
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-amber-400">■ Raw: {simState.inputTds}</span>
                        <span className="text-emerald-400">■ Permeate: {simState.outputTds}</span>
                        <span className="text-rose-400">
                          ■ Reject: {simState.stageProfiles?.tds?.roReject || Math.round(simState.inputTds * 1.4)}
                        </span>
                      </div>
                    </div>
                    {/* SVG Rolling Time-Series Graph */}
                    <div className="h-44 w-full bg-zinc-950/80 rounded-lg p-2 border border-white/5 relative flex flex-col justify-end">
                      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#27272a" strokeDasharray="3 3" />

                        {history.length > 1 && (
                          <>
                            {/* Raw TDS Line */}
                            <polyline
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.rawTds / 20, 110)}`)
                                .join(' ')}
                            />
                            {/* Permeate TDS Line */}
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.outputTds * 1.5, 110)}`)
                                .join(' ')}
                            />
                            {/* Reject TDS Line */}
                            <polyline
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="1.5"
                              strokeDasharray="4 2"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.rejectTds / 25, 110)}`)
                                .join(' ')}
                            />
                          </>
                        )}
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                        <span>T - 25s</span>
                        <span>LIVE NOW ({history[history.length - 1]?.time || '00:00:00'})</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Hydraulic Volumetric Flow Rates */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold text-white uppercase">
                          HYDRAULIC FLOW RATES (L/min)
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-cyan-400">■ Feed: {simState.inputFlowRate}</span>
                        <span className="text-emerald-400">■ Clean: {simState.outputFlowRate}</span>
                        <span className="text-amber-400">■ Reject: {simState.wasteFlowRate}</span>
                      </div>
                    </div>
                    <div className="h-44 w-full bg-zinc-950/80 rounded-lg p-2 border border-white/5 relative flex flex-col justify-end">
                      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#27272a" strokeDasharray="3 3" />

                        {history.length > 1 && (
                          <>
                            <polyline
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="2"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.inFlow * 16, 110)}`)
                                .join(' ')}
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.outFlow * 16, 110)}`)
                                .join(' ')}
                            />
                            <polyline
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.wasteFlow * 16, 110)}`)
                                .join(' ')}
                            />
                          </>
                        )}
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                        <span>0 L/min</span>
                        <span>SCALE MAX: 7.5 L/min</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 3: Fluid Volumes Mass Balance (Tank Depletion & Accumulation) */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-mono font-bold text-white uppercase">
                          TANK MASS BALANCE DYNAMICS (LITERS)
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-cyan-400">■ Raw Tank: {Math.round(simState.rawWaterLevel)}L</span>
                        <span className="text-emerald-400">■ Clean Tank: {Math.round(simState.purifiedWaterLevel)}L</span>
                      </div>
                    </div>
                    <div className="h-44 w-full bg-zinc-950/80 rounded-lg p-2 border border-white/5 relative flex flex-col justify-end">
                      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#27272a" strokeDasharray="3 3" />

                        {history.length > 1 && (
                          <>
                            <polyline
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="2.5"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - (pt.rawLevel / 100) * 110}`)
                                .join(' ')}
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - (pt.cleanLevel / 100) * 110}`)
                                .join(' ')}
                            />
                          </>
                        )}
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                        <span>0 Liters</span>
                        <span>FULL: 100 Liters Capacity</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 4: Turbidity Filtration Decay & Pump Pressure */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-mono font-bold text-white uppercase">
                          PRESSURE (bar) & TURBIDITY (NTU)
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-purple-400">■ Pump Bar: 6.8</span>
                        <span className="text-emerald-400">■ Product Turbidity: {simState.outputTurbidity} NTU</span>
                      </div>
                    </div>
                    <div className="h-44 w-full bg-zinc-950/80 rounded-lg p-2 border border-white/5 relative flex flex-col justify-end">
                      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#27272a" strokeDasharray="3 3" />

                        {history.length > 1 && (
                          <>
                            <polyline
                              fill="none"
                              stroke="#c084fc"
                              strokeWidth="2"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.pressureBar * 12, 110)}`)
                                .join(' ')}
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              points={history
                                .map((pt, i) => `${(i / (history.length - 1)) * 400},${120 - Math.min(pt.outputTurbidity * 40, 110)}`)
                                .join(' ')}
                            />
                          </>
                        )}
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                        <span>Baseline</span>
                        <span>Telemetry Integrated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 3: GRANULAR SENSOR INSTRUMENTATION DATA GRID
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'SENSORS' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                        ESP32 SENSOR BUS TELEMETRY MATRIX • 16 HARDWARE CHANNELS
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      ● ALL BUS CHANNELS NOMINAL (100% HEALTHY)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-400 text-[10px] bg-zinc-950/70">
                          <th className="py-2.5 px-3">SENSOR TAG</th>
                          <th className="py-2.5 px-3">HARDWARE INTERFACE</th>
                          <th className="py-2.5 px-3">PARAMETER / PHYSICAL DOMAIN</th>
                          <th className="py-2.5 px-3">SIMULATED VALUE</th>
                          <th className="py-2.5 px-3">UNIT</th>
                          <th className="py-2.5 px-3">SAFE THRESHOLD</th>
                          <th className="py-2.5 px-3">SIGNAL STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TDS_RAW_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">ADC1_CH0 (GPIO 36)</td>
                          <td className="py-2.5 px-3 text-white">Borewell Intake TDS</td>
                          <td className="py-2.5 px-3 text-amber-400 font-bold">{simState.inputTds}</td>
                          <td className="py-2.5 px-3 text-zinc-400">ppm / mg/L</td>
                          <td className="py-2.5 px-3 text-zinc-500">&lt; 2000 ppm</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● OK</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TDS_PERM_02</td>
                          <td className="py-2.5 px-3 text-zinc-400">ADC1_CH3 (GPIO 39)</td>
                          <td className="py-2.5 px-3 text-white">Purified Permeate TDS</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{simState.outputTds}</td>
                          <td className="py-2.5 px-3 text-zinc-400">ppm / mg/L</td>
                          <td className="py-2.5 px-3 text-zinc-500">&lt; 150 ppm (WHO)</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● EXCELLENT</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TURB_OPT_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">ADC1_CH6 (GPIO 34)</td>
                          <td className="py-2.5 px-3 text-white">Raw Settling Turbidity</td>
                          <td className="py-2.5 px-3 text-amber-400 font-bold">{simState.inputTurbidity}</td>
                          <td className="py-2.5 px-3 text-zinc-400">NTU</td>
                          <td className="py-2.5 px-3 text-zinc-500">&lt; 50 NTU</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● OK</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TURB_PROD_02</td>
                          <td className="py-2.5 px-3 text-zinc-400">ADC1_CH7 (GPIO 35)</td>
                          <td className="py-2.5 px-3 text-white">Product Water Turbidity</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{simState.outputTurbidity}</td>
                          <td className="py-2.5 px-3 text-zinc-400">NTU</td>
                          <td className="py-2.5 px-3 text-zinc-500">&lt; 1.0 NTU (IS 10500)</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● PRISTINE</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_FLOW_FEED_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">INT_EXT (GPIO 14 Pulse)</td>
                          <td className="py-2.5 px-3 text-white">Primary Inflow Rate</td>
                          <td className="py-2.5 px-3 text-cyan-300 font-bold">{simState.inputFlowRate}</td>
                          <td className="py-2.5 px-3 text-zinc-400">L/min</td>
                          <td className="py-2.5 px-3 text-zinc-500">2.0 – 6.5 L/m</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● STREAMING</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_FLOW_PERM_02</td>
                          <td className="py-2.5 px-3 text-zinc-400">INT_EXT (GPIO 27 Pulse)</td>
                          <td className="py-2.5 px-3 text-white">RO Permeate Flow</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{simState.outputFlowRate}</td>
                          <td className="py-2.5 px-3 text-zinc-400">L/min</td>
                          <td className="py-2.5 px-3 text-zinc-500">1.4 – 4.5 L/m</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● 70% RECOVERY</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_FLOW_BRINE_03</td>
                          <td className="py-2.5 px-3 text-zinc-400">INT_EXT (GPIO 26 Pulse)</td>
                          <td className="py-2.5 px-3 text-white">RO Reject Brine Stream</td>
                          <td className="py-2.5 px-3 text-amber-400 font-bold">{simState.wasteFlowRate}</td>
                          <td className="py-2.5 px-3 text-zinc-400">L/min</td>
                          <td className="py-2.5 px-3 text-zinc-500">0.5 – 2.0 L/m</td>
                          <td className="py-2.5 px-3 text-amber-400 font-bold">● DISCHARGING</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_PH_PROBE_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">ADC2_CH8 (GPIO 25)</td>
                          <td className="py-2.5 px-3 text-white">Raw Water pH</td>
                          <td className="py-2.5 px-3 text-zinc-200 font-bold">{simState.inputPh}</td>
                          <td className="py-2.5 px-3 text-zinc-400">pH scale</td>
                          <td className="py-2.5 px-3 text-zinc-500">6.5 – 8.5</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● NOMINAL</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_PH_PROBE_02</td>
                          <td className="py-2.5 px-3 text-zinc-400">ADC2_CH9 (GPIO 32)</td>
                          <td className="py-2.5 px-3 text-white">Dispensed Water pH</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{simState.outputPh}</td>
                          <td className="py-2.5 px-3 text-zinc-400">pH scale</td>
                          <td className="py-2.5 px-3 text-zinc-500">7.2 – 7.6</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● BALANCED</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_PUMP_TACH_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">PCNT_UNIT_0 (GPIO 19)</td>
                          <td className="py-2.5 px-3 text-white">Diaphragm Booster Speed</td>
                          <td className="py-2.5 px-3 text-white font-bold">{simState.pumpRpm}</td>
                          <td className="py-2.5 px-3 text-zinc-400">RPM</td>
                          <td className="py-2.5 px-3 text-zinc-500">1200 – 2400 RPM</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">
                            {simState.pumpStatus === 'RUNNING' ? '● SPINNING' : '○ STANDBY'}
                          </td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_PRESS_HEAD_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">I2C (0x48 ADS1115)</td>
                          <td className="py-2.5 px-3 text-white">Membrane Feed Pressure</td>
                          <td className="py-2.5 px-3 text-cyan-300 font-bold">
                            {simState.pumpStatus === 'RUNNING' ? '6.8' : '0.4'}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">bar</td>
                          <td className="py-2.5 px-3 text-zinc-500">4.5 – 8.0 bar</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● OPTIMAL</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_UV_IRRAD_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">I2C (0x39 VEML6075)</td>
                          <td className="py-2.5 px-3 text-white">Germicidal UVC Flux</td>
                          <td className="py-2.5 px-3 text-purple-300 font-bold">
                            {simState.uvStatus === 'ON' ? '42.4' : '0.0'}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">mJ/cm²</td>
                          <td className="py-2.5 px-3 text-zinc-500">&gt; 30 mJ/cm²</td>
                          <td className="py-2.5 px-3 text-purple-400 font-bold">
                            {simState.uvStatus === 'ON' ? '● ACTIVE (254nm)' : '○ OFF'}
                          </td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TEMP_DS18B20</td>
                          <td className="py-2.5 px-3 text-zinc-400">OneWire (GPIO 4)</td>
                          <td className="py-2.5 px-3 text-white">Chamber Water Temp</td>
                          <td className="py-2.5 px-3 text-white font-bold">{simState.temperature}</td>
                          <td className="py-2.5 px-3 text-zinc-400">°C</td>
                          <td className="py-2.5 px-3 text-zinc-500">10 – 35 °C</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● NOMINAL</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TANK_RAW_LVL</td>
                          <td className="py-2.5 px-3 text-zinc-400">UART RX/TX (HC-SR04)</td>
                          <td className="py-2.5 px-3 text-white">Raw Settling Reservoir</td>
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">{Math.round(simState.rawWaterLevel * 10) / 10}</td>
                          <td className="py-2.5 px-3 text-zinc-400">Liters</td>
                          <td className="py-2.5 px-3 text-zinc-500">&gt; 10 Liters</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● CALIBRATED</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">SEN_TANK_CLN_LVL</td>
                          <td className="py-2.5 px-3 text-zinc-400">UART RX/TX (HC-SR04)</td>
                          <td className="py-2.5 px-3 text-white">Clean Storage Reservoir</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{Math.round(simState.purifiedWaterLevel * 10) / 10}</td>
                          <td className="py-2.5 px-3 text-zinc-400">Liters</td>
                          <td className="py-2.5 px-3 text-zinc-500">&lt; 100 Liters</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● ACCUMULATING</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">ACT_SOLENOID_01</td>
                          <td className="py-2.5 px-3 text-zinc-400">MOSFET Driver (GPIO 22)</td>
                          <td className="py-2.5 px-3 text-white">Feed Cutoff Solenoid</td>
                          <td className="py-2.5 px-3 text-cyan-300 font-bold">{simState.solenoidValveStatus}</td>
                          <td className="py-2.5 px-3 text-zinc-400">State (0/90°)</td>
                          <td className="py-2.5 px-3 text-zinc-500">NC 12V DC</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">● ENERGIZED</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 4: LIVE SERIAL PACKET STREAM LOGS
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'TERMINAL' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 font-mono">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase">
                        ESP32 SERIAL TELEMETRY STREAM (115200 BAUD • UART0)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoScrollLogs}
                          onChange={(e) => setAutoScrollLogs(e.target.checked)}
                          className="rounded bg-zinc-900 border-zinc-700 text-cyan-500"
                        />
                        <span>Auto-scroll</span>
                      </label>
                      <button
                        onClick={() => setLogLines([])}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="h-96 overflow-y-auto space-y-1 text-[11px] text-zinc-300 custom-scrollbar bg-black/60 p-3 rounded-lg border border-white/5">
                    {logLines.map((line, i) => (
                      <div key={i} className="leading-relaxed hover:bg-white/5 px-1 rounded flex gap-2">
                        <span className="text-zinc-600 select-none">{String(i + 1).padStart(3, '0')}</span>
                        <span className={line.includes('FAULT') ? 'text-rose-400' : 'text-emerald-400/90'}>
                          {line}
                        </span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Operational Status & Shortcuts */}
          <div className="px-6 py-2.5 bg-zinc-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SIMULATION TICK: <strong className="text-white">ACTIVE (1 SEC)</strong>
              </span>
              <span>•</span>
              <span>
                TOTAL PURIFIED:{' '}
                <strong className="text-emerald-400">
                  {Math.round(simState.totalWaterPurified * 10) / 10} L
                </strong>
              </span>
              <span>•</span>
              <span>
                WASTE DISCHARGED:{' '}
                <strong className="text-amber-400">
                  {Math.round(simState.totalWasteWater * 10) / 10} L
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-zinc-500">Shortcut: Press <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-white/20 rounded text-zinc-300">Shift + S</kbd> to toggle</span>
              <button
                onClick={() => setSimulationViewOpen(false)}
                className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 transition-all font-semibold"
              >
                RETURN TO 3D TWIN
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
