'use client';

import React from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Play, Navigation, Compass, Layers, Zap, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LandingHero = () => {
  const { landingVisited, setLandingVisited, startDemo, setCameraPreset } = useSystemState();

  const handleEnterManual = () => {
    setLandingVisited(true);
    setCameraPreset('OVERVIEW');
  };

  const handleEnterDemo = () => {
    setLandingVisited(true);
    startDemo();
  };

  return (
    <AnimatePresence>
      {!landingVisited && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between py-16 px-6 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-900/90 backdrop-blur-md select-none"
        >
          {/* Top Brand Header */}
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-cyan-400 animate-spin-slow" style={{ animationDuration: '25s' }} />
            <span className="font-semibold tracking-[0.25em] text-white text-base">AURA SYSTEMS</span>
          </div>

          {/* Centered Pitch Card */}
          <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-4xl sm:text-6xl font-extralight tracking-[0.35em] text-white uppercase"
            >
              Aura <span className="font-semibold text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">Purify</span>
            </motion.h1>
            
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-6 mb-8"
            />
            
            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed max-w-lg mb-10"
            >
              Experience the self-sustaining, solar-powered IoT water purification system. An interactive 3D digital-twin built for engineering visualization and telemetry diagnostics.
            </motion.p>

            {/* Quick Feature Grid */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-3 gap-6 max-w-md w-full mb-12 border-y border-white/5 py-6 text-zinc-500 font-mono text-[9px] uppercase tracking-widest"
            >
              <div className="flex flex-col items-center gap-1.5">
                <Zap className="w-4.5 h-4.5 text-amber-500" />
                <span>Solar Grid</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Droplet className="w-4.5 h-4.5 text-cyan-400" />
                <span>Hydraulic Loop</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-violet-400" />
                <span>Multi-Filters</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4"
            >
              {/* Guided Keynote Presentation */}
              <button
                onClick={handleEnterDemo}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:scale-105 cursor-pointer border border-cyan-400/20"
              >
                <Play className="w-4 h-4 fill-white" />
                Guided Presentation
              </button>

              {/* Manual Control */}
              <button
                onClick={handleEnterManual}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/2 text-zinc-300 hover:text-white font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                Manual Diagnostics
              </button>
            </motion.div>
          </div>

          {/* Footer branding */}
          <div className="flex flex-col items-center text-zinc-600 font-mono text-[9px] tracking-widest gap-1">
            <span>© 2026 AURA SYSTEMS INC.</span>
            <span>MODEL: SMART IOT SOLAR PURIFICATION LOOP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
