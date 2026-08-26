'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '@/hooks/useSystemState';
import { soundSynth } from '@/utils/audioSynthesizer';
import {
  Droplets,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  ShieldCheck,
  Activity,
  Filter,
  Sparkles,
  Gauge,
  Sliders,
  Volume2,
  VolumeX,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';

const STAGES = [
  {
    stage: 1,
    title: 'Borewell & Slurry Intake',
    subtitle: 'Raw Groundwater / Mine Runoff Extraction',
    icon: Droplets,
    badge: 'STAGE 1/6',
    status: 'RAW INFLOW',
    statusColor: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
    description:
      'High-solids raw water is drawn from the wellhead through the stainless mesh foot valve strainer and pumped vertically up the 2.55m intake riser.',
    metrics: [
      { label: 'Intake Turbidity', value: '450+ NTU' },
      { label: 'Raw Inflow Rate', value: '4.8 L/min' },
      { label: 'Suction Head', value: '-1.85m' },
    ],
    chemistry: {
      turbidityBefore: '450 NTU',
      turbidityAfter: '450 NTU',
      tdsBefore: '520 ppm',
      tdsAfter: '520 ppm',
      ph: '6.4 pH',
      contaminants: 'Coarse Sand, Heavy Silt, Organic Debris',
      action: 'Stainless 60-mesh suction filtration',
    },
  },
  {
    stage: 2,
    title: 'Primary Sedimentation Tank',
    subtitle: 'Gravitational Multi-Density Settling',
    icon: Filter,
    badge: 'STAGE 2/6',
    status: 'GRIT SEPARATION',
    statusColor: 'text-yellow-400 bg-yellow-950/70 border-yellow-500/40',
    description:
      'Water descends through layered coarse gravel, quartz sand, and activated charcoal. Heavy particulate matter and mineral silt settle to the bottom.',
    metrics: [
      { label: 'Grit Retention', value: '> 85% Solids' },
      { label: 'Bed Flow Velocity', value: '0.12 m/s' },
      { label: 'Bed Pressure', value: '1.2 Bar' },
    ],
    chemistry: {
      turbidityBefore: '450 NTU',
      turbidityAfter: '42 NTU (90% Drop)',
      tdsBefore: '520 ppm',
      tdsAfter: '410 ppm',
      ph: '6.8 pH',
      contaminants: 'Suspended Solids, Clay Silt, Grit',
      action: 'Tri-layer gravity bed stratification',
    },
  },
  {
    stage: 3,
    title: 'Inline Flow Telemetry (YF-S201)',
    subtitle: 'High-Precision Hall-Effect Turbine',
    icon: Gauge,
    badge: 'STAGE 3/6',
    status: 'ACTIVE LOGGING',
    statusColor: 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40',
    description:
      'The transfer line forces water through the magnetic rotor turbine. Pulse frequencies are sampled in real-time by the ESP32 to calculate instantaneous transfer volumes.',
    metrics: [
      { label: 'Measured Flow', value: '4.80 L/min' },
      { label: 'Pulse Frequency', value: '36.0 Hz' },
      { label: 'Calibration K-Factor', value: '7.5 Pulses/L' },
    ],
    chemistry: {
      turbidityBefore: '42 NTU',
      turbidityAfter: '42 NTU',
      tdsBefore: '410 ppm',
      tdsAfter: '410 ppm',
      ph: '6.8 pH',
      contaminants: 'Volumetric Transfer Verification',
      action: 'Hall-effect magnetic pulse logging',
    },
  },
  {
    stage: 4,
    title: 'IoT Quality Probing Chamber',
    subtitle: 'TDS, pH, and Turbidity Testing',
    icon: Activity,
    badge: 'STAGE 4/6',
    status: 'DECISION LOGIC',
    statusColor: 'text-blue-400 bg-blue-950/70 border-blue-500/40',
    description:
      'Water enters the secondary test compartment. Submerged optical sensors evaluate clarity and mineral content to trigger the intelligent dual-route diverter.',
    metrics: [
      { label: 'TDS Purity', value: '145 ppm' },
      { label: 'pH Balance', value: '7.21 pH' },
      { label: 'Turbidity Clarity', value: '1.2 NTU' },
    ],
    chemistry: {
      turbidityBefore: '42 NTU',
      turbidityAfter: '12 NTU (Intermediate)',
      tdsBefore: '410 ppm',
      tdsAfter: '320 ppm',
      ph: '7.21 pH (Optimal)',
      contaminants: 'Dissolved Minerals & Acidity Level',
      action: 'Tri-sensor multi-spectrum optical probing',
    },
  },
  {
    stage: 5,
    title: '4-Stage RO & Tank 2 Verification',
    subtitle: 'Semi-Permeable Desalination ➔ Secondary Sensor Chamber',
    icon: Sliders,
    badge: 'STAGE 5/6',
    status: 'DEEP PURIFICATION',
    statusColor: 'text-teal-400 bg-teal-950/70 border-teal-500/40',
    description:
      'Water is boosted through 4-stage RO (PP, CTO, 0.0001μm membrane, mineralizer) and discharged directly into Tank 2, where Sensor Array #2 performs dual-verification.',
    metrics: [
      { label: 'Membrane Pore', value: '0.0001 Micron' },
      { label: 'Heavy Metal Rejection', value: '99.4%' },
      { label: 'Tank 2 Sensor Check', value: 'TDS #2 / pH #2 / Turb #2' },
    ],
    chemistry: {
      turbidityBefore: '12 NTU',
      turbidityAfter: '< 0.3 NTU (Crystal Clear)',
      tdsBefore: '320 ppm',
      tdsAfter: '28 ppm (High Purity)',
      ph: '7.35 pH',
      contaminants: 'Arsenic, Lead, Microplastics, VOCs',
      action: '4.5-Bar cross-flow RO & Tank 2 secondary verification',
    },
  },
  {
    stage: 6,
    title: 'Dual-Decision Branch / 250L Potable UV-C',
    subtitle: 'Pure Permeate to Storage OR Closed-Loop Recirculation',
    icon: Sparkles,
    badge: 'STAGE 6/6',
    status: 'READY TO DRINK',
    statusColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40',
    description:
      'If Sensor Array #2 confirms purity, water cascades into the 250L Primary Reservoir with 254nm UV-C sterilization. If sub-standard, the electronic diverter re-circulates water back to the RO pump.',
    metrics: [
      { label: 'Microbial Safety', value: '99.99% Sterile' },
      { label: 'UV-C Wavelength', value: '254 nm' },
      { label: 'Recirculation Loop', value: 'Auto Closed-Loop' },
    ],
    chemistry: {
      turbidityBefore: '< 0.3 NTU',
      turbidityAfter: '0.1 NTU (Pristine)',
      tdsBefore: '145 ppm',
      tdsAfter: '28 ppm (Drinking Grade)',
      ph: '7.35 pH',
      contaminants: 'E. Coli, Coliforms, Viruses, Cysts',
      action: '254nm UV-C photo-oxidation + recirculation diverter',
    },
  },
];

export const WaterTrackerHUD = () => {
  const {
    waterTrackMode,
    setWaterTrackMode,
    waterTrackStage,
    setWaterTrackStage,
    nextWaterStage,
    prevWaterStage,
    autoPlayWater,
    setAutoPlayWater,
  } = useSystemState();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showChemistry, setShowChemistry] = useState(false);

  if (!waterTrackMode) return null;

  const currentStage = STAGES[waterTrackStage - 1] || STAGES[0];
  const IconComponent = currentStage.icon;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundSynth.enabled = next;
    if (next) soundSynth.playStageSound(waterTrackStage);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-auto select-none"
      >
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] p-4 text-white flex flex-col gap-3.5">
          {/* Top Neon Accent Glow Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

          {/* ─── Header: Mode Badge + Stepper Action Controls + Close Button ─── */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Droplets className="w-4 h-4 animate-bounce-subtle" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-mono tracking-wide text-white">
                    WATER FLOW TRACKER
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold text-cyan-300 bg-cyan-950/70 border-cyan-500/40">
                    FOCUS VIEW (W)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Tracing fluid journey through 6 treatment stages
                </span>
              </div>
            </div>

            {/* Stepper Controls, Chemistry Button, Sound & Close */}
            <div className="flex items-center gap-2">
              {/* Chemical Breakdown Toggle Button */}
              <button
                onClick={() => setShowChemistry(!showChemistry)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                  showChemistry
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title="View Stage Chemistry Purity Breakdown"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CHEMISTRY</span>
              </button>

              {/* Sound Synthesizer Toggle */}
              <button
                onClick={toggleSound}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white'
                }`}
                title={soundEnabled ? 'Mute Stage Sound Synthesizer' : 'Enable Stage Sound Synthesizer'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Auto Tour Toggle */}
              <button
                onClick={() => setAutoPlayWater(!autoPlayWater)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                  autoPlayWater
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {autoPlayWater ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>AUTO FLOW</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setWaterTrackMode(false)}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-400 flex items-center justify-center text-zinc-400 transition-all cursor-pointer"
                title="Exit Water Flow Mode (W or Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── 6-Stage Interactive Progress Timeline ─── */}
          <div className="grid grid-cols-6 gap-2">
            {STAGES.map((s) => {
              const isActive = s.stage === waterTrackStage;
              const isPast = s.stage < waterTrackStage;
              const StageIcon = s.icon;

              return (
                <button
                  key={s.stage}
                  onClick={() => setWaterTrackStage(s.stage)}
                  className={`flex flex-col gap-1 p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_18px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                      : isPast
                      ? 'bg-zinc-900/80 border-cyan-500/20 text-zinc-300 hover:bg-zinc-900'
                      : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <StageIcon
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-cyan-400' : isPast ? 'text-cyan-400/60' : 'text-zinc-500'
                        }`}
                      />
                      <span className="text-[10px] font-mono font-bold">
                        {s.stage}
                      </span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium truncate ${
                      isActive ? 'text-white font-bold' : isPast ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {s.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─── Chemistry Purity Breakdown Drawer (Expandable) ─── */}
          {showChemistry && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3 flex flex-col gap-2 font-mono text-[11px]"
            >
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>CHEMICAL PURITY METRICS — {currentStage.title}</span>
                </div>
                <span className="text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/40">
                  {currentStage.chemistry.action}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col">
                  <span className="text-[9px] text-zinc-500">TURBIDITY METAMORPHOSIS</span>
                  <span className="text-amber-400 line-through text-[10px]">{currentStage.chemistry.turbidityBefore}</span>
                  <span className="text-emerald-400 font-bold text-xs">{currentStage.chemistry.turbidityAfter}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col">
                  <span className="text-[9px] text-zinc-500">TOTAL DISSOLVED SOLIDS</span>
                  <span className="text-amber-400 line-through text-[10px]">{currentStage.chemistry.tdsBefore}</span>
                  <span className="text-cyan-300 font-bold text-xs">{currentStage.chemistry.tdsAfter}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col">
                  <span className="text-[9px] text-zinc-500">pH EQUILIBRIUM</span>
                  <span className="text-white font-bold text-xs mt-1">{currentStage.chemistry.ph}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col">
                  <span className="text-[9px] text-zinc-500">CONTAMINANTS FILTERED</span>
                  <span className="text-purple-300 text-[10px] font-semibold truncate mt-1" title={currentStage.chemistry.contaminants}>
                    {currentStage.chemistry.contaminants}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Active Stage Details & Telemetry Row ─── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-white/5 rounded-xl p-3">
            {/* Left Stage Overview */}
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white font-mono">
                    {currentStage.title}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${currentStage.statusColor}`}>
                    {currentStage.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                  {currentStage.description}
                </p>
              </div>
            </div>

            {/* Right Live Stage Metrics & Stepper Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Metrics Pill Grid */}
              <div className="flex items-center gap-2">
                {currentStage.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-center"
                  >
                    <span className="text-[9px] font-mono text-zinc-500">{m.label}</span>
                    <span className="text-[11px] font-mono font-bold text-cyan-300">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Prev / Next Stage Buttons */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                <button
                  onClick={prevWaterStage}
                  className="p-2 rounded-xl bg-zinc-800 border border-white/10 hover:border-cyan-500/50 hover:bg-zinc-700 text-white transition-all cursor-pointer"
                  title="Previous Stage"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextWaterStage}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/60 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
                  title="Next Stage"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
