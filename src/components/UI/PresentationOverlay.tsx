'use client';

import React, { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { ArrowLeft, ArrowRight, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PresentationOverlay = () => {
  const { 
    demoRunning, 
    demoStep, 
    nextStep, 
    prevStep, 
    stopDemo, 
    currentStepData 
  } = useSystemState();

  const [progressWidth, setProgressWidth] = useState(0);

  // Trigger progress bar reset and animation on step change
  useEffect(() => {
    if (!demoRunning || !currentStepData) return;

    setProgressWidth(0);
    const start = Date.now();
    const duration = currentStepData.duration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgressWidth(progress);
    }, 50);

    return () => clearInterval(interval);
  }, [demoStep, demoRunning, currentStepData]);

  if (!demoRunning || !currentStepData) return null;

  const stepIndexFormatted = String(demoStep + 1).padStart(2, '0');
  const totalStepsFormatted = '11'; // Fixed total presentation steps

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none">
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="glass-panel-heavy rounded-2xl w-full border border-white/10 relative overflow-hidden pointer-events-auto shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Step Progress Bar at top of card */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75 ease-linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Narrative Card Content */}
        <div className="p-6">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 font-mono">
              SYSTEM GUIDE — STEP {stepIndexFormatted} OF {totalStepsFormatted}
            </span>
            <div className="flex items-center gap-3">
              {/* Decorative Audio/Voice narration indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-zinc-400">
                <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>NARRATOR ACTIVE</span>
              </div>
              <button 
                onClick={stopDemo}
                className="p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
                title="Cancel Demo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title and Narration description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={demoStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-lg font-semibold text-white tracking-wide mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-zinc-400 text-xs leading-relaxed font-light">
                {currentStepData.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
            {/* Previous Button */}
            <button
              onClick={prevStep}
              disabled={demoStep === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/2 hover:bg-white/5 text-zinc-400 hover:text-zinc-200 text-[10px] tracking-wider uppercase font-medium transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            {/* Step circles indicator */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 11 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === demoStep 
                      ? 'w-4 bg-cyan-400 shadow-[0_0_8px_#06b6d4]' 
                      : 'w-1.5 bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 text-cyan-300 text-[10px] tracking-wider uppercase font-semibold transition-all hover:scale-105"
            >
              {demoStep === 10 ? 'Finish' : 'Next'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
