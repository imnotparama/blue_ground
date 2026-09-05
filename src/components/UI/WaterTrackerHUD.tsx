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
  Repeat,
} from 'lucide-react';

const STAGES = [
  {
    stage: 1,
    title: 'Raw Borewell Extraction',
    subtitle: 'Deep-Well Aquifer / Slurry Wellhead Intake',
    icon: Droplets,
    badge: 'STAGE 1/6',
    status: 'RAW INFLOW',
    statusColor: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
    description:
      'High-solids raw water is drawn from the wellhead through the stainless mesh foot valve strainer and pumped vertically up the intake conduit past the kinetic hydro turbine generator.',
    metrics: [
      { label: 'Intake Turbidity', value: '450+ NTU' },
      { label: 'Raw Inflow Rate', value: '4.8 L/min' },
      { label: 'Hydro Generation', value: '+28.5 W' },
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
    title: 'Inline Telemetry & Booster Pump',
    subtitle: 'YF-S201 Hall-Effect Meter & 24V Booster',
    icon: Gauge,
    badge: 'STAGE 2/6',
    status: 'PUMP PRESSURIZATION',
    statusColor: 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40',
    description:
      'Water passes through the inline YF-S201 turbine for instantaneous volumetric telemetry before the high-pressure booster pump pressurizes the stream to 4.5 Bar directly into the 4-stage smart filtration train.',
    metrics: [
      { label: 'Measured Flow', value: '4.80 L/min' },
      { label: 'Booster Pressure', value: '4.5 Bar' },
      { label: 'Pulse Frequency', value: '36.0 Hz' },
    ],
    chemistry: {
      turbidityBefore: '450 NTU',
      turbidityAfter: '450 NTU',
      tdsBefore: '520 ppm',
      tdsAfter: '520 ppm',
      ph: '6.4 pH',
      contaminants: 'Volumetric Transfer Verification',
      action: 'Hall-effect magnetic pulse logging & pressure boost',
    },
  },
  {
    stage: 3,
    title: '4-Stage Smart Filtration Train',
    subtitle: 'SediShield ➔ ChemoBlock ➔ RO Maxx ➔ Active Copper',
    icon: Filter,
    badge: 'STAGE 3/6',
    status: '4-STAGE PURIFYING',
    statusColor: 'text-blue-400 bg-blue-950/70 border-blue-500/40',
    description:
      'High-pressure water sequentially flows across the 4 back-mounted cartridges: SediShield traps silt & rust, ChemoBlock strips chlorine & chemicals, RO Maxx cuts 96% of dissolved heavy metals, and Active Copper infuses healthy copper ions (Cu²⁺) for antimicrobial defense.',
    metrics: [
      { label: 'Stage 1 SediShield', value: '92% Health' },
      { label: 'Stage 2 ChemoBlock', value: '85% Health' },
      { label: 'Stage 3 RO Maxx', value: '88% Health (-96% TDS)' },
    ],
    chemistry: {
      turbidityBefore: '450 NTU',
      turbidityAfter: '< 0.3 NTU',
      tdsBefore: '520 ppm',
      tdsAfter: '28 ppm',
      ph: '7.35 pH',
      contaminants: 'Suspended Solids, VOCs, Heavy Metals, Acidic Bite',
      action: 'Sediment trap + Carbon absorption + 0.0001μm RO + Active Copper infusion',
    },
  },
  {
    stage: 4,
    title: 'Quality Verification Chamber',
    subtitle: 'Post-Filtration Multi-Sensor Inspection Gate',
    icon: Activity,
    badge: 'STAGE 4/6',
    status: 'PURITY GATE INSPECTION',
    statusColor: 'text-teal-400 bg-teal-950/70 border-teal-500/40',
    description:
      'Filter train discharge empties directly into the Quality Verification Chamber (Tank 2). Integrated submerged probes (TDS #2, pH #2, Turbidity #2) inspect every drop in real time before approving distribution.',
    metrics: [
      { label: 'Permeate TDS #2', value: '28 ppm (Pass)' },
      { label: 'pH Balance #2', value: '7.35 pH (Optimal)' },
      { label: 'Optical Turbidity #2', value: '0.2 NTU (Clear)' },
    ],
    chemistry: {
      turbidityBefore: '0.5 NTU',
      turbidityAfter: '0.2 NTU',
      tdsBefore: '680 ppm Raw',
      tdsAfter: '28 ppm Verified',
      ph: '7.35 pH (Optimal)',
      contaminants: 'Real-Time Verification Analysis',
      action: 'Multi-probe optical & electrical impedance verification',
    },
  },
  {
    stage: 5,
    title: 'Closed-Loop Decision Gate',
    subtitle: 'Impure Recirculation ➔ Stage 1 OR Pure Delivery',
    icon: Sliders,
    badge: 'STAGE 5/6',
    status: 'CLOSED-LOOP LOGIC',
    statusColor: 'text-purple-400 bg-purple-950/70 border-purple-500/40',
    description:
      'When verification confirms purity, water flows to clean storage. If TDS exceeds 100 ppm, the 3-way solenoid valve diverts flow out the bottom via the recirculation pump directly back to Stage 1 (SediShield) to re-filter!',
    metrics: [
      { label: 'Purity Threshold', value: 'TDS ≤ 100 ppm' },
      { label: 'Recirculation Return', value: 'Direct to Stage 1' },
      { label: 'Return Loop Rate', value: '3.8 L/min' },
    ],
    chemistry: {
      turbidityBefore: '0.2 NTU',
      turbidityAfter: '0.1 NTU',
      tdsBefore: '28 ppm (Verified)',
      tdsAfter: '28 ppm (Stored)',
      ph: '7.35 pH',
      contaminants: 'Automated Fail-Safe Isolation',
      action: 'Solenoid diversion & zero-waste closed-loop re-filtering',
    },
  },
  {
    stage: 6,
    title: 'Primary Clean Water Reservoir',
    subtitle: '250L Potable Reserve with UV-C Sterilization',
    icon: Sparkles,
    badge: 'STAGE 6/6',
    status: 'VERIFIED POTABLE',
    statusColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40',
    description:
      'Verified drinking-grade water cascades into the 250-liter food-grade clean reservoir, protected by continuous germicidal UV-C and monitored by liquid level telemetry for on-demand dispensing.',
    metrics: [
      { label: 'Reservoir Level', value: '78% Full (195L)' },
      { label: 'Germicidal UV-C', value: '254 nm Active' },
      { label: 'Water Quality', value: 'EXCELLENT' },
    ],
    chemistry: {
      turbidityBefore: '0.2 NTU',
      turbidityAfter: '0.1 NTU (Pristine)',
      tdsBefore: '28 ppm',
      tdsAfter: '28 ppm (Drinking Grade)',
      ph: '7.35 pH',
      contaminants: 'E. Coli, Coliforms, Viruses, Cysts',
      action: '254nm UV-C photo-oxidation + clean storage reserve',
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
    dualVerificationMode,
    setDualVerificationMode,
    recirculationTriggered,
    setRecirculationTriggered,
    setTank2Tds,
    metrics,
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
                    {waterTrackStage === 6
                      ? !dualVerificationMode
                        ? 'Setup 1: Direct Single-Pass to 250L Storage'
                        : recirculationTriggered || metrics.tds2 > 100
                        ? 'Setup 2: Recirculation Return (High TDS Fail)'
                        : 'Setup 2: Tank 2 TDS Verified (Potable Pass)'
                      : currentStage.title}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                    waterTrackStage === 6 && (recirculationTriggered || metrics.tds2 > 100)
                      ? 'text-amber-400 bg-amber-950/80 border-amber-500/40'
                      : currentStage.statusColor
                  }`}>
                    {waterTrackStage === 6 && (recirculationTriggered || metrics.tds2 > 100) ? 'RE-FILTERING' : currentStage.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                  {waterTrackStage === 6
                    ? !dualVerificationMode
                      ? 'Setup 1 Standard Pipeline: Direct cascade from RO filter outlet into Primary 250L Reservoir with 254nm UV-C germicidal disinfection.'
                      : recirculationTriggered || metrics.tds2 > 100
                      ? 'Setup 2 Dual-Verification: TDS Sensor #2 sensed elevated dissolved solids (185 ppm > 100 ppm threshold). Solenoid diverter routed fluid into the closed-loop return pipe back to RO pump for secondary re-filtration.'
                      : 'Setup 2 Dual-Verification: TDS Sensor #2 verified potable purity (28 ppm < 100 ppm). Pure water cascades from Tank 2 into the Primary 250L Reservoir for UV-C disinfection.'
                    : currentStage.description}
                </p>

                {/* Stage 6 Interactive Setup & Verification Outcome Switcher */}
                {waterTrackStage === 6 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 mt-1 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 font-semibold">Mode:</span>
                      <button
                        onClick={() => setDualVerificationMode(!dualVerificationMode)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold border transition-all cursor-pointer ${
                          !dualVerificationMode
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-purple-500/20 border-purple-400 text-purple-300'
                        }`}
                      >
                        {dualVerificationMode ? 'Setup 2: Tank 2' : 'Setup 1: Direct'}
                      </button>
                    </div>

                    {dualVerificationMode ? (
                      <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                        <span className="text-[10px] font-mono text-zinc-400 font-semibold">TDS #2 Check:</span>
                        <button
                          onClick={() => setTank2Tds(28)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition-all cursor-pointer ${
                            metrics.tds2 <= 100
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>TDS 28 ppm (Pass ➔ Tank)</span>
                        </button>

                        <button
                          onClick={() => setTank2Tds(185)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition-all cursor-pointer ${
                            metrics.tds2 > 100
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                              : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white'
                          }`}
                        >
                          <Repeat className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" style={{ animationDuration: '6s' }} />
                          <span>TDS 185 ppm (Fail ➔ Re-Filter)</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400/80 italic">
                        (Single-pass mode: Press &apos;V&apos; or toggle to Setup 2 for Tank 2 sensor verification)
                      </span>
                    )}
                  </div>
                )}
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
