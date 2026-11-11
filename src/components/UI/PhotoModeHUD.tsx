'use client';

import React, { useState, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  Sun,
  Sunrise,
  Cloud,
  Moon,
  Grid,
  Maximize2,
  X,
  Check,
  Sparkles,
  Download,
  Eye,
} from 'lucide-react';
import { useSystemState, CameraPreset, EnvironmentalMode } from '@/hooks/useSystemState';

export const PhotoModeHUD: React.FC = () => {
  const {
    photoMode,
    setPhotoMode,
    photoAutoRotate,
    setPhotoAutoRotate,
    photoGrid,
    setPhotoGrid,
    photoAspect,
    setPhotoAspect,
    photoWatermark,
    setPhotoWatermark,
    cameraPreset,
    setCameraPreset,
    envMode,
    setEnvMode,
  } = useSystemState();

  const [shutterFlash, setShutterFlash] = useState(false);
  const [photoSavedToast, setPhotoSavedToast] = useState(false);

  // Synthesized mechanical shutter sound using Web Audio API (100% offline, zero external dependencies)
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // AudioContext not allowed or unsupported in silent environments
    }
  }, []);

  // Capture ultra-crisp photo directly from the Three.js WebGL canvas
  const handleCapturePhoto = useCallback(() => {
    playShutterSound();
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 240);

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      const srcW = canvas.width;
      const srcH = canvas.height;

      // Determine cropping based on chosen aspect ratio
      let cropW = srcW;
      let cropH = srcH;
      let cropX = 0;
      let cropY = 0;

      if (photoAspect === '16:9') {
        if (srcW / srcH > 16 / 9) {
          cropW = Math.round(srcH * (16 / 9));
          cropX = Math.round((srcW - cropW) / 2);
        } else {
          cropH = Math.round(srcW / (16 / 9));
          cropY = Math.round((srcH - cropH) / 2);
        }
      } else if (photoAspect === '4:3') {
        if (srcW / srcH > 4 / 3) {
          cropW = Math.round(srcH * (4 / 3));
          cropX = Math.round((srcW - cropW) / 2);
        } else {
          cropH = Math.round(srcW / (4 / 3));
          cropY = Math.round((srcH - cropH) / 2);
        }
      } else if (photoAspect === '1:1') {
        const minDim = Math.min(srcW, srcH);
        cropW = minDim;
        cropH = minDim;
        cropX = Math.round((srcW - minDim) / 2);
        cropY = Math.round((srcH - minDim) / 2);
      }

      // Offscreen export canvas
      const exportCanvas = document.createElement('canvas');
      const watermarkHeight = photoWatermark ? Math.max(70, Math.round(cropH * 0.075)) : 0;
      exportCanvas.width = cropW;
      exportCanvas.height = cropH + watermarkHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // Draw cropped WebGL scene
      ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Draw Leica/Apple-grade studio typography banner if watermark is active
      if (photoWatermark) {
        const wy = cropH;
        // Dark metallic ribbon base
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, wy, cropW, watermarkHeight);

        // Top cyan accent line
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, wy, cropW, Math.max(2, Math.round(watermarkHeight * 0.035)));

        const padX = Math.round(cropW * 0.04);
        const midY = wy + watermarkHeight * 0.55;

        // Left brand title
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(watermarkHeight * 0.32)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('blueground leviathan v2.0', padX, midY - watermarkHeight * 0.12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `${Math.round(watermarkHeight * 0.20)}px monospace`;
        ctx.fillText('SMART SOLAR IOT WATER PURIFICATION PLATFORM • DIGITAL TWIN', padX, midY + watermarkHeight * 0.20);

        // Right engineering team credit
        ctx.textAlign = 'right';
        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${Math.round(watermarkHeight * 0.26)}px system-ui, sans-serif`;
        ctx.fillText('TEAM CHOOSENONES (PARAMESHWARAN S)', cropW - padX, midY - watermarkHeight * 0.12);

        ctx.fillStyle = '#64748b';
        ctx.font = `${Math.round(watermarkHeight * 0.19)}px monospace`;
        ctx.fillText('LAT 13.0827° N / LON 80.2707° E • WHO POTABLE CERTIFIED', cropW - padX, midY + watermarkHeight * 0.20);
      }

      // Export PNG and trigger browser download
      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Leviathan_Photo_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.png`;
      link.href = dataUrl;
      link.click();

      // Show toast
      setPhotoSavedToast(true);
      setTimeout(() => setPhotoSavedToast(false), 3000);
    } catch (err) {
      console.error('Failed to capture photo:', err);
    }
  }, [photoAspect, photoWatermark, playShutterSound]);

  if (!photoMode) return null;

  const presets: { id: CameraPreset; label: string; icon: string }[] = [
    { id: 'PHOTO_HERO_34', label: 'Hero 3/4 Angle', icon: '💎' },
    { id: 'PHOTO_SOLAR_TOP', label: 'Solar Overhead', icon: '☀️' },
    { id: 'PHOTO_FILTERS_DETAIL', label: 'Filtration Train', icon: '🧪' },
    { id: 'PHOTO_WATER_TANKS', label: 'Pure Reservoir', icon: '💧' },
    { id: 'PHOTO_VILLAGE_VISTA', label: 'Village Vista', icon: '🌴' },
    { id: 'PHOTO_HANDPUMP_STATION', label: 'Village Hand Pump', icon: '🚰' },
  ];

  const lightingModes: { id: EnvironmentalMode; label: string; icon: React.ReactNode }[] = [
    { id: 'SUNNY', label: 'Daylight', icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'MORNING', label: 'Golden Hour', icon: <Sunrise className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'CLOUDY', label: 'Studio Rim', icon: <Cloud className="w-3.5 h-3.5 text-slate-300" /> },
    { id: 'NIGHT', label: 'Moonlight', icon: <Moon className="w-3.5 h-3.5 text-blue-300" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none flex flex-col justify-between p-6">
      {/* 1. Shutter Flash Effect */}
      {shutterFlash && (
        <div className="fixed inset-0 bg-white z-[100] pointer-events-none animate-out fade-out duration-300" />
      )}

      {/* 2. Photo Saved Confirmation Toast */}
      {photoSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-in fade-in slide-in-from-top-4 duration-300">
          <Download className="w-4 h-4 text-cyan-400" />
          <span>High-Resolution Photo Saved to Downloads</span>
        </div>
      )}

      {/* 3. Professional Camera Viewfinder Reticle & L-Corner Brackets */}
      <div className="absolute inset-8 pointer-events-none">
        {/* Top-Left Bracket */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60" />
        {/* Top-Right Bracket */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60" />
        {/* Bottom-Left Bracket */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60" />
        {/* Bottom-Right Bracket */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60" />

        {/* Center Precision Focus Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 border border-cyan-400/70 rounded-full" />
          <div className="absolute w-6 h-[1px] bg-cyan-400/40" />
          <div className="absolute h-6 w-[1px] bg-cyan-400/40" />
        </div>

        {/* Composition Guides */}
        {photoGrid === 'RULE_OF_THIRDS' && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>
        )}

        {photoGrid === 'GOLDEN_RATIO' && (
          <div className="absolute inset-0 pointer-events-none opacity-20 border border-white">
            <div className="absolute top-0 bottom-0 left-[38.2%] w-[1px] bg-white" />
            <div className="absolute top-0 bottom-0 right-[38.2%] w-[1px] bg-white" />
            <div className="absolute left-0 right-0 top-[38.2%] h-[1px] bg-white" />
            <div className="absolute left-0 right-0 bottom-[38.2%] h-[1px] bg-white" />
          </div>
        )}

        {photoGrid === 'SQUARE' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-full aspect-square border-2 border-dashed border-cyan-400/40" />
          </div>
        )}
      </div>

      {/* 4. Top Header: Viewfinder Meta & Camera Settings Deck */}
      <div className="flex items-center justify-between w-full pointer-events-auto z-10">
        {/* Left: Leica-Style Camera Spec Bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-mono font-bold text-xs tracking-widest uppercase">
            PHOTO MODE
          </span>
          <div className="h-3 w-[1px] bg-white/20" />
          <span className="text-cyan-400 font-mono text-[10px] tracking-wider hidden sm:inline">
            35mm F/1.4 • ISO 64 • MATRIX AF
          </span>
          <div className="h-3 w-[1px] bg-white/20 hidden sm:inline" />
          <span className="text-zinc-400 font-mono text-[10px] hidden md:inline">
            CHOOSENONES
          </span>
        </div>

        {/* Center: Lens Filters, Lighting & Aspect Ratio Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Lighting Mode Switcher */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            {lightingModes.map((lm) => (
              <button
                key={lm.id}
                onClick={() => setEnvMode(lm.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                  envMode === lm.id
                    ? 'bg-white/20 text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={lm.label}
              >
                {lm.icon}
                <span className="hidden lg:inline">{lm.label}</span>
              </button>
            ))}
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            {(['FULL', '16:9', '4:3', '1:1'] as const).map((asp) => (
              <button
                key={asp}
                onClick={() => setPhotoAspect(asp)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                  photoAspect === asp
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {asp}
              </button>
            ))}
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => {
              const order: ('NONE' | 'RULE_OF_THIRDS' | 'GOLDEN_RATIO' | 'SQUARE')[] = [
                'NONE',
                'RULE_OF_THIRDS',
                'GOLDEN_RATIO',
                'SQUARE',
              ];
              const nextIdx = (order.indexOf(photoGrid) + 1) % order.length;
              setPhotoGrid(order[nextIdx]);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer border ${
              photoGrid !== 'NONE'
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Cycle Grid Overlay"
          >
            <Grid className="w-3 h-3" />
            <span className="hidden md:inline">{photoGrid === 'NONE' ? 'Grid: Off' : photoGrid.replace('_', ' ')}</span>
          </button>

          {/* Watermark Toggle */}
          <button
            onClick={() => setPhotoWatermark(!photoWatermark)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer border ${
              photoWatermark
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Studio Watermark Ribbon on Exported Image"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">Watermark</span>
          </button>
        </div>

        {/* Right: Exit Photo Mode Button */}
        <button
          onClick={() => {
            setPhotoAutoRotate(false);
            setPhotoMode(false);
            setCameraPreset('OVERVIEW');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-950/70 border border-red-500/40 hover:bg-red-900/80 text-red-200 text-xs font-mono tracking-wider transition-all shadow-xl hover:scale-105 cursor-pointer pointer-events-auto"
          title="Exit Photo Mode (Hotkey: Esc or P)"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-black/50 border border-red-500/30">Esc</span>
        </button>
      </div>

      {/* 5. Bottom Footer: Camera Presets, 360° Turntable & Master Shutter Trigger */}
      <div className="flex flex-col items-center gap-4 w-full pointer-events-auto z-10 pb-2">
        {/* Preset Camera Angles Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-x-auto max-w-full">
          {presets.map((preset) => {
            const isActive = cameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setCameraPreset(preset.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-bold ring-1 ring-cyan-400/40'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Bar: Turntable Orbit Toggle & Master Shutter Trigger */}
        <div className="flex items-center gap-6">
          {/* 360° Product Turntable Auto-Rotation Button */}
          <button
            onClick={() => setPhotoAutoRotate(!photoAutoRotate)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-mono tracking-wide transition-all shadow-xl cursor-pointer ${
              photoAutoRotate
                ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.45)] ring-1 ring-amber-400'
                : 'bg-black/60 backdrop-blur-xl border-white/15 text-zinc-300 hover:text-white hover:border-amber-400/40'
            }`}
            title="Toggle Continuous 360° Studio Turntable Orbit"
          >
            <RotateCw className={`w-4 h-4 ${photoAutoRotate ? 'text-amber-400 animate-spin' : 'text-zinc-400'}`} style={{ animationDuration: '6s' }} />
            <span className="font-semibold">{photoAutoRotate ? 'Turntable: ON' : '360° Turntable'}</span>
          </button>

          {/* Master Shutter Release Button (Leica / Hasselblad Style) */}
          <button
            onClick={handleCapturePhoto}
            className="group relative flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-white/40"
            title="Capture High-Resolution Studio Photograph (Hotkey: Space)"
          >
            <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-black group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-mono">CAPTURE PHOTO</span>
          </button>

          {/* Quick Help Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-zinc-400">
            <span>Drag mouse to freely orbit</span>
            <span className="text-zinc-600">•</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

