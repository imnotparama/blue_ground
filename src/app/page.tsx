'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SystemStateProvider } from '@/hooks/useSystemState';
import { TopBar } from '@/components/UI/TopBar';
import { PresentationOverlay } from '@/components/UI/PresentationOverlay';
import { Dashboard } from '@/components/UI/Dashboard';
import { BottomDetailCard } from '@/components/UI/BottomDetailCard';
import { SystemControls } from '@/components/UI/SystemControls';
import { LandingHero } from '@/components/UI/LandingHero';
import { WaterTrackerHUD } from '@/components/UI/WaterTrackerHUD';

// Dynamically import the 3D Scene with SSR disabled to prevent WebGL hydration mismatches in Next.js
const Scene = dynamic(
  () => import('@/components/Scene/Scene').then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050507]">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          {/* Spinning core */}
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-cyan-400 animate-spin" style={{ animationDuration: '0.8s' }} />
        </div>
        <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em] mt-6 uppercase animate-pulse">
          INITIALIZING LEVIATHAN 3D CANVAS ENGINE
        </p>
      </div>
    ),
  }
);

// Inner page component that consumes the context provider
const HomePageContent = () => {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050507]">
      {/* Cinematic Vignette Backdrop */}
      <div className="vignette" />

      {/* 3D Scene Rendering Engine */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Header diagnostics and env controls */}
      <TopBar />

      {/* Live Monitoring diagnostics sidebar */}
      <Dashboard />

      {/* Slide-up bottom detail drawer (replaces left panel) */}
      <BottomDetailCard />

      {/* Floating CAD & Scenario engine controller (bottom-left) */}
      <SystemControls />

      {/* Narrative AI Presentation card overlay */}
      <PresentationOverlay />

      {/* Interactive Water Flow Tracker Stepper HUD (Focus View Mode) */}
      <WaterTrackerHUD />

      {/* Fullscreen cinematic landing intro cover */}
      <LandingHero />

      {/* Decorative ambient elements (Apple aesthetics) */}
      <div className="fixed bottom-4 left-6 z-10 pointer-events-none text-[10px] font-mono text-zinc-600 tracking-wider">
        © 2026 BLUEGROUND LEVIATHAN • SMART SOLAR IOT WATER PURIFICATION
      </div>
      <div className="fixed bottom-4 right-6 z-10 pointer-events-none text-[10px] font-mono text-zinc-600 tracking-wider">
        LATITUDE: 13.0827° N / LONGITUDE: 80.2707° E
      </div>
    </main>
  );
};

export default function Home() {
  return (
    <SystemStateProvider>
      <HomePageContent />
    </SystemStateProvider>
  );
}
