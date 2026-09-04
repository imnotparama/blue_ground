'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '@/hooks/useSystemState';
import {
  Filter,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Activity,
  Droplets,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';

interface StageDetail {
  num: number;
  name: string;
  tagline: string;
  boldName: string;
  subtitle: string;
  poreSize: string;
  coreMedia: string;
  primaryRemoval: string;
  deltaP: string;
  flowVelocity: string;
  effScore: string;
  statusBadge: string;
  colorScheme: {
    text: string;
    bg: string;
    border: string;
    glow: string;
    bar: string;
  };
  overviewMetric: string;
  description: string;
  benefits: string[];
}

const STAGES_CONFIG: StageDetail[] = [
  {
    num: 1,
    name: 'Stage 1 – SediShield',
    boldName: 'SediShield',
    tagline: 'Blocks dirt, silt and rust',
    subtitle: 'Sediment Pre-Filter (Melt-Blown PP)',
    poreSize: '5.0 µm',
    coreMedia: 'High-Density Polypropylene Matrix with Graded Micro-Cavities',
    primaryRemoval: 'Coarse sand, rust flakes, clay silt, and abrasive borehole particulates',
    deltaP: '0.18 Bar',
    flowVelocity: '0.24 m/s',
    effScore: '99.2% Particulate Trap',
    statusBadge: 'RUGGED FIRST-LINE',
    colorScheme: {
      text: 'text-amber-400',
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      bar: 'bg-amber-400',
    },
    overviewMetric: 'Grit Retention: 99.2%',
    description:
      'Engineered specifically for harsh borewells and mining slurry runoff. Traps suspended particles and abrasive silts before they can abrade booster pumps or foul the sensitive downstream RO membrane.',
    benefits: [
      'Protects high-pressure booster pump impellers from slurry wear',
      'Extends reverse-osmosis membrane lifespan by up to 300%',
      'Dual-density graded pore structure for zero premature blinding',
    ],
  },
  {
    num: 2,
    name: 'Stage 2 – ChemoBlock',
    boldName: 'ChemoBlock',
    tagline: 'Cuts chlorine, odour and chemical load',
    subtitle: 'Activated Carbon & Chemical Guard (CTO Block)',
    poreSize: '1.0 µm',
    coreMedia: 'Acid-Washed Extruded Coconut Shell Activated Carbon (1200+ IV)',
    primaryRemoval: 'Chlorine, toxic VOCs, agrochemical residues, odour, and industrial tannins',
    deltaP: '0.32 Bar',
    flowVelocity: '0.21 m/s',
    effScore: '98.6% Chemical Load Cut',
    statusBadge: 'CHEMICAL & ODOUR GUARD',
    colorScheme: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      bar: 'bg-emerald-400',
    },
    overviewMetric: 'Chlorine & VOC: -98.6%',
    description:
      'High-adsorption catalytic carbon block that captures dissolved organic chemicals, pesticides, volatile gases, foul sulfur tastes, and oxidizing chlorine compounds that degrade polymer membranes.',
    benefits: [
      'Eliminates rotten-egg hydrogen sulfide odour common in deep borewells',
      'Shields polyamide RO membranes from chlorine oxidative breakdown',
      'Restores natural fresh spring-water clarity and palatable taste',
    ],
  },
  {
    num: 3,
    name: 'Stage 3 – RO Maxx',
    boldName: 'RO Maxx',
    tagline: 'Drops TDS and heavy metals',
    subtitle: 'High-Pressure Reverse Osmosis Membrane (TFC)',
    poreSize: '0.0001 µm',
    coreMedia: 'Polyamide Thin-Film Composite (TFC) Semi-Permeable Barrier',
    primaryRemoval: 'Dissolved mineral salts, heavy metals (Lead, Arsenic, Mercury), hardness, fluorides',
    deltaP: '4.20 Bar',
    flowVelocity: '0.14 m/s',
    effScore: '96.2% Salt Rejection',
    statusBadge: 'HIGH-PRESSURE DESALT',
    colorScheme: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-950/60',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      bar: 'bg-cyan-400',
    },
    overviewMetric: 'Inflow 680 → 28 ppm TDS',
    description:
      'The core ionic separation engine of the Leviathan rig. Operates under 60–80 PSI solar-boosted pressure to force water through molecular pores, rejecting 96%+ of all dissolved contaminants.',
    benefits: [
      'Strips dangerous mine-tailing leachate and heavy metal ions',
      'Cuts total dissolved solids (TDS) from harsh 680 ppm down to pure 28 ppm',
      'Automated brine recovery channel with secondary recirculation loop support',
    ],
  },
  {
    num: 4,
    name: 'Stage 4 – FinalGuard UV',
    boldName: 'FinalGuard UV',
    tagline: 'Kills microbes before dispense',
    subtitle: 'Microbial Sanitization (254nm Germicidal UV-C)',
    poreSize: 'Molecular Wave',
    coreMedia: 'High-Output 254nm Quartz-Encapsulated Germicidal Lamp',
    primaryRemoval: 'Bacteria, enteric viruses, coliforms, cysts, and pathogenic amoebae',
    deltaP: '0.04 Bar',
    flowVelocity: '0.28 m/s',
    effScore: '99.99% Pathogen Kill',
    statusBadge: 'FINAL SAFETY SHIELD',
    colorScheme: {
      text: 'text-violet-400',
      bg: 'bg-violet-950/60',
      border: 'border-violet-500/40',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      bar: 'bg-violet-400',
    },
    overviewMetric: 'Germicidal Dosage: 42 mJ/cm²',
    description:
      'The ultimate point-of-dispense safety barrier. Destroys microbial DNA and prevents bacterial regrowth in the secondary potable tank with zero chemicals, zero taste alteration, and instant activation.',
    benefits: [
      'Chemical-free sterilization: no chlorine byproduct toxicity',
      'Destroys chlorine-resistant cysts like Cryptosporidium and Giardia',
      'IoT lamp ballast monitoring with instant alert on tube degradation',
    ],
  },
];

export const FilterViewHUD: React.FC = () => {
  const {
    filterView,
    setFilterView,
    filterStageFocus,
    setFilterStageFocus,
    metrics,
  } = useSystemState();

  const [autoTour, setAutoTour] = useState(false);

  // Auto-tour timer to cycle through stages 1 to 4
  useEffect(() => {
    if (!filterView || !autoTour) return;
    const timer = setInterval(() => {
      setFilterStageFocus((filterStageFocus % 4) + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [filterView, autoTour, filterStageFocus, setFilterStageFocus]);

  if (!filterView) return null;

  const currentStageConfig =
    filterStageFocus > 0 && filterStageFocus <= 4
      ? STAGES_CONFIG[filterStageFocus - 1]
      : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-auto select-none"
      >
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/92 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.22)] p-4 text-white flex flex-col gap-3.5">
          {/* Top Neon Accent Glow Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

          {/* ─── HEADER: Filter View Branding + Stage Selector Tabs + Controls ─── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
            {/* Left Title & Status */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Layers className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm font-mono tracking-wide text-white">
                    4-STAGE SMART FILTRATION TRAIN
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold text-cyan-300 bg-cyan-950/70 border-cyan-500/40">
                    FILTER VIEW [F]
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Back-mounted industrial purification rack — Borewell & Mine Slurry Guard
                </span>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2">
              {/* Auto Tour Toggle Button */}
              <button
                onClick={() => setAutoTour(!autoTour)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                  autoTour
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title="Automatically tour all 4 stages"
              >
                {autoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{autoTour ? 'PAUSE TOUR' : 'AUTO TOUR'}</span>
              </button>

              {/* Close / Exit Button */}
              <button
                onClick={() => setFilterView(false)}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-400 flex items-center justify-center text-zinc-400 transition-all cursor-pointer"
                title="Exit Filter View (Hotkey: F or Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── STAGE SELECTOR TABS (All 4 Filters + Individual Cartridges) ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* Tab 0: All 4 Filters Overview */}
            <button
              onClick={() => {
                setAutoTour(false);
                setFilterStageFocus(0);
              }}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                filterStageFocus === 0
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-400 text-white shadow-[0_0_18px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400 font-bold'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900/90 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono tracking-wide">All 4 Filters</span>
            </button>

            {/* Tabs 1 to 4: Individual Cartridges */}
            {STAGES_CONFIG.map((st) => {
              const isActive = filterStageFocus === st.num;
              const healthVal =
                st.num === 1
                  ? metrics.stage1Health
                  : st.num === 2
                  ? metrics.stage2Health
                  : st.num === 3
                  ? metrics.stage3Health
                  : metrics.stage4Health;

              return (
                <button
                  key={st.num}
                  onClick={() => {
                    setAutoTour(false);
                    setFilterStageFocus(st.num);
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer text-left ${
                    isActive
                      ? `${st.colorScheme.bg} border-cyan-400 text-white shadow-[0_0_18px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400`
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900/90 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col truncate pr-1">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold">
                      STAGE {st.num}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold truncate ${
                        isActive ? 'text-white' : st.colorScheme.text
                      }`}
                    >
                      {st.boldName}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${st.colorScheme.text}`}>
                    {healthVal || 90}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─── PROCESS FLOW PIPELINE VISUALIZER ─── */}
          <div className="flex items-center justify-between gap-1 bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-mono overflow-x-auto">
            <div className="flex items-center gap-1 text-zinc-400 whitespace-nowrap">
              <span className="text-zinc-500 font-bold">FLOW:</span>
              <span className="text-amber-300 font-bold">1. SediShield (5µm)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
            <div className="flex items-center gap-1 text-emerald-300 whitespace-nowrap font-bold">
              <span>2. ChemoBlock (CTO)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
            <div className="flex items-center gap-1 text-cyan-300 whitespace-nowrap font-bold">
              <span>3. RO Maxx (0.0001µm)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
            <div className="flex items-center gap-1 text-violet-300 whitespace-nowrap font-bold">
              <span>4. FinalGuard UV (254nm)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />
            <div className="flex items-center gap-1 text-emerald-400 whitespace-nowrap font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Potable Dispense</span>
            </div>
          </div>

          {/* ─── MAIN CONTENT AREA: Rack Overview or Focused Stage ─── */}
          {filterStageFocus === 0 ? (
            /* ── ALL 4 FILTERS COMPARISON GRID ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STAGES_CONFIG.map((st) => {
                const health =
                  st.num === 1
                    ? metrics.stage1Health
                    : st.num === 2
                    ? metrics.stage2Health
                    : st.num === 3
                    ? metrics.stage3Health
                    : metrics.stage4Health;

                return (
                  <div
                    key={st.num}
                    onClick={() => setFilterStageFocus(st.num)}
                    className="flex flex-col justify-between gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-cyan-400/60 transition-all cursor-pointer group shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold">
                          STAGE {st.num}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {st.boldName}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${st.colorScheme.text}`}>
                        {health}%
                      </span>
                    </div>

                    {/* Tagline & Specs */}
                    <div className="flex flex-col gap-1 text-[10px] font-mono">
                      <span className="text-zinc-300 font-semibold leading-tight">{st.tagline}</span>
                      <span className="text-zinc-400 text-[9px] truncate">{st.subtitle}</span>
                      <div className="mt-1 px-2 py-1 rounded bg-black/40 border border-white/5 text-[9px] font-mono text-cyan-300 truncate">
                        {st.overviewMetric}
                      </div>
                    </div>

                    {/* Health Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full ${st.colorScheme.bar} transition-all duration-500`}
                        style={{ width: `${health}%` }}
                      />
                    </div>

                    {/* Footer click hint */}
                    <div className="flex items-center justify-between text-[9px] text-zinc-400 group-hover:text-cyan-400 transition-colors pt-1 border-t border-white/5">
                      <span>Inspect Cartridge</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : currentStageConfig ? (
            /* ── SINGLE FOCUSED STAGE DEEP-DIVE CARD ── */
            <div className="flex flex-col lg:flex-row gap-4 bg-zinc-900/80 border border-white/10 rounded-xl p-3.5">
              {/* Left Column: Description, Tagline, and Benefits */}
              <div className="flex-1 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${currentStageConfig.colorScheme.text} ${currentStageConfig.colorScheme.bg} ${currentStageConfig.colorScheme.border}`}
                  >
                    {currentStageConfig.statusBadge}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">
                    {currentStageConfig.subtitle}
                  </span>
                </div>

                <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{currentStageConfig.name}</span>
                  <span className="text-xs text-zinc-400 font-mono font-normal">
                    — &ldquo;{currentStageConfig.tagline}&rdquo;
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {currentStageConfig.description}
                </p>

                {/* Key Benefits */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                    OPERATIONAL ADVANTAGES:
                  </span>
                  {currentStageConfig.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Technical Telemetry & Specifications */}
              <div className="lg:w-80 flex flex-col gap-2 bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                    STAGE {currentStageConfig.num} TELEMETRY
                  </span>
                  <span className={`font-bold ${currentStageConfig.colorScheme.text}`}>
                    HEALTH:{' '}
                    {currentStageConfig.num === 1
                      ? metrics.stage1Health
                      : currentStageConfig.num === 2
                      ? metrics.stage2Health
                      : currentStageConfig.num === 3
                      ? metrics.stage3Health
                      : metrics.stage4Health}
                    %
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex flex-col bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-zinc-400">PORE MICRON</span>
                    <span className="text-white font-bold text-xs">{currentStageConfig.poreSize}</span>
                  </div>
                  <div className="flex flex-col bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-zinc-400">PRESSURE DROP</span>
                    <span className="text-amber-400 font-bold text-xs">{currentStageConfig.deltaP}</span>
                  </div>
                  <div className="flex flex-col bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-zinc-400">FLOW VELOCITY</span>
                    <span className="text-cyan-300 font-bold text-xs">{currentStageConfig.flowVelocity}</span>
                  </div>
                  <div className="flex flex-col bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-zinc-400">EFFICIENCY</span>
                    <span className="text-emerald-400 font-bold text-xs">{currentStageConfig.effScore}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1 bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-[9px] text-zinc-400">CORE FILTRATION MEDIA:</span>
                  <span className="text-[10px] text-zinc-200 leading-tight">
                    {currentStageConfig.coreMedia}
                  </span>
                </div>

                {/* Stage Navigation buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 mt-1">
                  <button
                    onClick={() =>
                      setFilterStageFocus(currentStageConfig.num > 1 ? currentStageConfig.num - 1 : 4)
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev Stage</span>
                  </button>
                  <button
                    onClick={() => setFilterStageFocus(0)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-xs text-cyan-300 transition-colors cursor-pointer font-bold"
                  >
                    <span>All 4 Rack</span>
                  </button>
                  <button
                    onClick={() =>
                      setFilterStageFocus(currentStageConfig.num < 4 ? currentStageConfig.num + 1 : 1)
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <span>Next Stage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
