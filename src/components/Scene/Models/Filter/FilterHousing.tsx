'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSystemState } from '@/hooks/useSystemState';
import * as THREE from 'three';

export const FilterHousing = () => {
  const { 
    exploded, 
    transparent, 
    cutaway, 
    activeHotspot, 
    setActiveHotspot, 
    setCameraPreset, 
    mode, 
    metrics,
    tanksOnly,
    filterView,
    setFilterView,
    filterStageFocus,
    setFilterStageFocus,
  } = useSystemState();
  
  const mainGroupRef = useRef<THREE.Group>(null);
  const glowPipeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (mainGroupRef.current) {
      const targetY = exploded ? 0.25 : 0;
      const targetZ = exploded ? -0.20 : 0;
      const damp = 1.0 - Math.exp(-6 * delta);
      mainGroupRef.current.position.y = THREE.MathUtils.lerp(mainGroupRef.current.position.y, 0.45 + targetY, damp);
      mainGroupRef.current.position.z = THREE.MathUtils.lerp(mainGroupRef.current.position.z, -0.62 + targetZ, damp);
    }

    if (glowPipeMatRef.current) {
      // Dynamic pulsing glow along the thin inter-cartridge pipes
      const pulse = 1.8 + Math.sin(time * 5.0) * 0.8;
      glowPipeMatRef.current.emissiveIntensity = pulse;
    }
  });

  // 4-Stage Smart Filtration Train specifications
  const stages = [
    {
      id: 'stage1',
      num: 1,
      x: -0.66,
      name: 'Stage 1 – SediShield',
      boldName: 'SediShield',
      roleTag: 'Blocks dirt, silt and rust',
      fullTag: 'SediShield – Blocks dirt, silt and rust',
      subtitle: 'Sediment Pre-Filter (5µm Melt-Blown PP)',
      color: '#cbd5e1', // Rugged stone-cream base
      accentColor: '#f97316', // Rugged amber-rust accent
      stripColor: '#ea580c',
      health: metrics.stage1Health || 92,
      healthColor: 'text-amber-400',
      barColor: 'bg-amber-400',
      iconType: 'dust',
      badgeText: 'Rugged First-Line Defense',
      desc: 'Traps sand, rust, silt, and heavy suspended mining particles before they reach pumps.',
    },
    {
      id: 'stage2',
      num: 2,
      x: -0.22,
      name: 'Stage 2 – ChemoBlock',
      boldName: 'ChemoBlock',
      roleTag: 'Cuts chlorine, odour and chemical load',
      fullTag: 'ChemoBlock – Cuts chlorine, odour and chemical load',
      subtitle: 'Activated Carbon & Chemical Guard (CTO Block)',
      color: '#1e293b', // Deep charcoal body
      accentColor: '#059669', // Deep emerald green
      stripColor: '#10b981',
      health: metrics.stage2Health || 85,
      healthColor: 'text-emerald-400',
      barColor: 'bg-emerald-400',
      iconType: 'chemical',
      badgeText: 'Chemical & Odour Guard',
      desc: 'Uses high-adsorption activated carbon to strip chlorine, colours, odour, and organic contaminants.',
    },
    {
      id: 'stage3',
      num: 3,
      x: 0.22,
      name: 'Stage 3 – RO Maxx',
      boldName: 'RO Maxx',
      roleTag: 'Drops TDS and heavy metals',
      fullTag: 'RO Maxx – Drops TDS and heavy metals',
      subtitle: 'High-Pressure RO Membrane (0.0001µm TFC)',
      color: '#0369a1', // High-pressure ocean blue
      accentColor: '#06b6d4', // Cyan high-pressure accent
      stripColor: '#38bdf8',
      health: metrics.stage3Health || 88,
      healthColor: 'text-cyan-400',
      barColor: 'bg-cyan-400',
      iconType: 'tds',
      badgeText: 'TDS: 680 → 28 ppm (-96%)',
      desc: 'Core high-pressure reverse-osmosis stage stripping dissolved salts, hardness, and heavy metals.',
    },
    {
      id: 'stage4',
      num: 4,
      x: 0.66,
      name: 'Stage 4 – Active Copper Filter',
      boldName: 'Active Copper',
      roleTag: 'Infuses copper ions & antimicrobial polish',
      fullTag: 'Active Copper – Infuses copper ions & antimicrobial polish',
      subtitle: 'Active Copper Infusion & Mineral Polishing',
      color: '#b87333', // Burnished metallic copper
      accentColor: '#f97316', // Warm copper glow
      stripColor: '#ea580c',
      health: metrics.stage4Health || 95,
      healthColor: 'text-amber-400',
      barColor: 'bg-amber-400',
      iconType: 'copper',
      badgeText: 'Cu²⁺ Ion Infusion',
      desc: 'Enriches purified water with bio-available copper ions (Cu²⁺) for natural antimicrobial protection, alkalinity balance, and crisp taste.',
    },
  ];

  const isDimmed = !filterView && (tanksOnly || (activeHotspot !== null && activeHotspot !== 'filter_housing' && activeHotspot !== 'filtration_tank'));

  return (
    <group 
      ref={mainGroupRef}
      position={[-0.70, 0.45, -0.62]}
      onClick={(e) => {
        e.stopPropagation();
        setActiveHotspot('filter_housing');
        if (!filterView) {
          setFilterView(true);
          setFilterStageFocus(0);
        }
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          BACK-MOUNTED 4-STAGE FILTRATION RACK (ALUMINIUM HEAVY BRACKET)
          ════════════════════════════════════════════════════════════════════ */}
      {/* Upper & Lower Horizontal Anodized Aluminium Mounting Rails */}
      <mesh position={[0, 0.38, -0.08]} castShadow>
        <boxGeometry args={[1.78, 0.05, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.38, -0.08]} castShadow>
        <boxGeometry args={[1.78, 0.05, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Structural Support Clamps linking to main rig frame */}
      {[-0.82, 0, 0.82].map((cx, i) => (
        <mesh key={i} position={[cx, 0, -0.06]} castShadow>
          <boxGeometry args={[0.04, 0.82, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.85} />
        </mesh>
      ))}

      {/* Rack Title Plaque */}
      <mesh position={[0, 0.43, -0.07]}>
        <boxGeometry args={[0.65, 0.04, 0.005]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* ════════════════════════════════════════════════════════════════════
          THE 4 VERTICAL CARTRIDGE HOUSINGS (LEFT TO RIGHT)
          ════════════════════════════════════════════════════════════════════ */}
      {stages.map((st, i) => {
        const isHovered = hovered === i;
        const healthFrac = st.health / 100;
        const isCopperStage = st.num === 4;
        const isRoStage = st.num === 3;
        const isChemoStage = st.num === 2;
        const isSediStage = st.num === 1;

        const isStageFocused = filterView && filterStageFocus === st.num;

        return (
          <group 
            key={st.id} 
            position={[st.x, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot('filter_housing');
              if (!filterView) {
                setFilterView(true);
                setFilterStageFocus(st.num);
              } else {
                if (filterStageFocus === st.num) {
                  setFilterStageFocus(0);
                } else {
                  setFilterStageFocus(st.num);
                }
              }
            }}
          >
            {/* Top Reinforced Manifold Cap with Inlet/Outlet Ports */}
            <mesh position={[0, 0.34, 0]} castShadow>
              <cylinderGeometry args={[0.078, 0.082, 0.09, 24]} />
              <meshStandardMaterial color={isChemoStage ? "#064e3b" : isRoStage ? "#075985" : isCopperStage ? "#7c2d12" : "#0f172a"} roughness={0.35} metalness={0.8} />
            </mesh>

            {/* Pressure Relief Vent Valve / Gauge Port on Cap */}
            <mesh position={[0, 0.39, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
              <meshStandardMaterial color={isRoStage ? "#0284c7" : "#ef4444"} roughness={0.3} metalness={0.6} />
            </mesh>

            {/* ─── STAGE-SPECIFIC DISTINCT CARTRIDGE CASING ─── */}
            {isSediStage && (
              /* Stage 1: SediShield — Rugged ribbed sediment pre-filter */
              <group>
                {/* Main Rugged Cylinder Body */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.072, 0.070, 0.60, 28]} />
                  <meshStandardMaterial 
                    color="#e2e8f0" 
                    roughness={0.5} 
                    metalness={0.2}
                    transparent={transparent || cutaway}
                    opacity={(transparent || cutaway) ? 0.25 : 1.0}
                  />
                </mesh>
                {/* Heavy Industrial Protective Sediment Ribs / Rings */}
                {[-0.20, -0.10, 0.0, 0.10, 0.20].map((ry, idx) => (
                  <mesh key={idx} position={[0, ry, 0]} castShadow>
                    <torusGeometry args={[0.073, 0.005, 8, 28]} />
                    <meshStandardMaterial color="#d97706" roughness={0.4} metalness={0.7} />
                  </mesh>
                ))}
                {/* Silt & Rust Trap Bottom Chamber */}
                <mesh position={[0, -0.24, 0]} castShadow>
                  <cylinderGeometry args={[0.074, 0.068, 0.08, 24]} />
                  <meshStandardMaterial color="#b45309" roughness={0.4} metalness={0.5} />
                </mesh>
              </group>
            )}

            {isChemoStage && (
              /* Stage 2: ChemoBlock — Deep charcoal & emerald green carbon block */
              <group>
                {/* Matte Deep Charcoal Body */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.072, 0.068, 0.60, 28]} />
                  <meshStandardMaterial 
                    color="#09090b" 
                    roughness={0.6} 
                    metalness={0.3}
                    transparent={transparent || cutaway}
                    opacity={(transparent || cutaway) ? 0.25 : 1.0}
                  />
                </mesh>
                {/* Deep Green Activated Carbon Media Core Band */}
                <mesh position={[0, -0.02, 0]} castShadow>
                  <cylinderGeometry args={[0.073, 0.073, 0.38, 28]} />
                  <meshStandardMaterial color="#065f46" roughness={0.35} metalness={0.4} />
                </mesh>
                {/* Chemical Guard Rings */}
                {[-0.18, 0.16].map((gy, idx) => (
                  <mesh key={idx} position={[0, gy, 0]} castShadow>
                    <cylinderGeometry args={[0.074, 0.074, 0.025, 28]} />
                    <meshStandardMaterial color="#10b981" roughness={0.25} metalness={0.8} />
                  </mesh>
                ))}
              </group>
            )}

            {isRoStage && (
              /* Stage 3: RO Maxx — High-Pressure Blue Pressure Vessel */
              <group>
                {/* Ocean-Blue High-Pressure Cylindrical Shell */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.075, 0.073, 0.60, 28]} />
                  <meshStandardMaterial 
                    color="#0284c7" 
                    roughness={0.25} 
                    metalness={0.6}
                    transparent={transparent || cutaway}
                    opacity={(transparent || cutaway) ? 0.25 : 1.0}
                  />
                </mesh>
                {/* Stainless High-Pressure Retaining Clamps */}
                {[-0.22, 0.22].map((py, idx) => (
                  <mesh key={idx} position={[0, py, 0]} castShadow>
                    <cylinderGeometry args={[0.077, 0.077, 0.03, 28]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
                  </mesh>
                ))}
                {/* High Pressure Membrane Core Spine */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.54, 16]} />
                  <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
                </mesh>
              </group>
            )}

            {isCopperStage && (
              /* Stage 4: Active Copper Filter — Burnished Metallic Copper Vessel & Copper Mineral Granules Core */
              <group>
                {/* Burnished Metallic Copper Cartridge Body */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.072, 0.068, 0.60, 32]} />
                  <meshStandardMaterial 
                    color="#b87333" 
                    roughness={0.22} 
                    metalness={0.88}
                    transparent={transparent || cutaway}
                    opacity={(transparent || cutaway) ? 0.25 : 1.0}
                  />
                </mesh>
                {/* Genuine Copper Reinforcing Bands */}
                {[-0.18, 0.0, 0.18].map((cy, idx) => (
                  <mesh key={idx} position={[0, cy, 0]} castShadow>
                    <cylinderGeometry args={[0.075, 0.075, 0.024, 28]} />
                    <meshStandardMaterial color="#d97706" roughness={0.15} metalness={0.95} />
                  </mesh>
                ))}
                {/* Internal Active Copper (Cu2+) Mineral Media Chamber */}
                <group position={[0, -0.02, 0]}>
                  {/* Copper Media Core */}
                  <mesh>
                    <cylinderGeometry args={[0.038, 0.038, 0.44, 20]} />
                    <meshStandardMaterial 
                      color="#ea580c" 
                      emissive="#c2410c"
                      emissiveIntensity={0.6}
                      roughness={0.4}
                      metalness={0.7} 
                    />
                  </mesh>
                  {/* Inspection Window showing Active Copper Granules */}
                  <mesh position={[0, 0, 0.070]}>
                    <boxGeometry args={[0.035, 0.38, 0.005]} />
                    <meshPhysicalMaterial 
                      color="#fed7aa" 
                      transparent 
                      opacity={0.80} 
                      roughness={0.05} 
                      clearcoat={1.0}
                    />
                  </mesh>
                  {/* Warm Copper Ion Halo Light */}
                  <pointLight color="#f97316" intensity={1.2} distance={0.6} />
                </group>
              </group>
            )}

            {/* Bottom Sump Cap / Drain Port */}
            <mesh position={[0, -0.32, 0]} castShadow>
              <cylinderGeometry args={[0.068, 0.055, 0.06, 24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
            </mesh>

            {/* 3D Physical Health Bar Plate on Front Face of Cartridge */}
            <group position={[0, -0.18, 0.075]}>
              {/* Backplate */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.096, 0.024, 0.004]} />
                <meshStandardMaterial color="#09090b" roughness={0.8} />
              </mesh>
              {/* Health Progress Fill */}
              <mesh position={[-0.044 + (healthFrac * 0.088) / 2, 0, 0.003]}>
                <boxGeometry args={[healthFrac * 0.088, 0.016, 0.004]} />
                <meshStandardMaterial 
                  color={healthFrac > 0.85 ? '#10b981' : healthFrac > 0.6 ? '#f59e0b' : '#ef4444'} 
                  emissive={healthFrac > 0.85 ? '#059669' : '#d97706'}
                  emissiveIntensity={0.8}
                />
              </mesh>
            </group>

            {/* Hover / Active Focus Highlight Ring */}
            {(isHovered || isStageFocused) && (
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.088, 0.088, 0.76, 28, 1, true]} />
                <meshBasicMaterial 
                  color={isStageFocused ? '#06b6d4' : '#38bdf8'} 
                  wireframe 
                  transparent 
                  opacity={isStageFocused ? 0.9 : 0.5} 
                />
              </mesh>
            )}

            {/* ════════════════════════════════════════════════════════════════
                THIN GLOWING PIPES CONNECTING THE 4 CARTRIDGES IN SERIES
                ════════════════════════════════════════════════════════════════ */}
            {i < 3 && (
              <group position={[0.22, 0.34, 0]}>
                {/* Thin Structural Conduit */}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.014, 0.014, 0.22, 12]} />
                  <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
                </mesh>

                {/* Thin Glowing Fluid Pipe with Dynamic Pulse Illumination */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.218, 12]} />
                  <meshStandardMaterial 
                    ref={glowPipeMatRef}
                    color="#38bdf8" 
                    emissive="#0284c7"
                    emissiveIntensity={2.0}
                    roughness={0.1}
                  />
                </mesh>

                {/* 3-Way Valve Fitting at Jumper Junction */}
                <mesh position={[0, 0, 0]} castShadow>
                  <sphereGeometry args={[0.022, 12, 12]} />
                  <meshStandardMaterial color="#ca8a04" roughness={0.25} metalness={0.9} />
                </mesh>
                <mesh position={[0, -0.025, 0]} castShadow>
                  <cylinderGeometry args={[0.010, 0.010, 0.03, 8]} />
                  <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.85} />
                </mesh>

                {/* Valve Handle Lever */}
                <group position={[0, 0.024, 0]} rotation={[0, 0, mode === 'MAINTENANCE' ? Math.PI / 2 : 0]}>
                  <mesh position={[0.025, 0, 0]} castShadow>
                    <boxGeometry args={[0.055, 0.008, 0.012]} />
                    <meshStandardMaterial 
                      color={mode === 'TURBIDITY' ? '#0ea5e9' : mode === 'MAINTENANCE' ? '#f59e0b' : '#10b981'} 
                      roughness={0.3} 
                      metalness={0.4} 
                    />
                  </mesh>
                </group>
              </group>
            )}

            {/* ════════════════════════════════════════════════════════════════
                INTERACTIVE 3D FLOATING INSTRUMENT CARD UNDER EACH CARTRIDGE
                (Shown ONLY in Filter View Mode, hidden in Normal Mode)
                ════════════════════════════════════════════════════════════════ */}
            {filterView && (
              <Html
                position={[0, 0.48, 0.10]}
                center
                distanceFactor={5.6}
                style={{ pointerEvents: 'auto', userSelect: 'none' }}
              >
              <div 
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isHovered || isStageFocused ? 'scale-105 -translate-y-1' : 'opacity-95'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot('filter_housing');
                  if (!filterView) {
                    setFilterView(true);
                    setFilterStageFocus(st.num);
                  } else {
                    if (filterStageFocus === st.num) {
                      setFilterStageFocus(0);
                    } else {
                      setFilterStageFocus(st.num);
                    }
                  }
                }}
              >
                {/* Main Card Container */}
                <div className={`flex flex-col gap-1 px-3 py-2 rounded-xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] min-w-[170px] max-w-[200px] cursor-pointer transition-all ${
                  isStageFocused 
                    ? 'bg-zinc-950/95 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]' 
                    : 'bg-black/90 border border-white/15 hover:border-cyan-400/60'
                }`}>
                  
                  {/* Header: Stage Badge + Icon */}
                  <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1.5">
                      {/* Stage Specific Icon */}
                      <span className="p-1 rounded-md bg-white/5 flex items-center justify-center">
                        {st.iconType === 'dust' && (
                          /* Dust Cloud Icon for SediShield */
                          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                            <path d="M8 19h1" />
                            <path d="M12 19h2" />
                            <path d="M17 19h1" />
                          </svg>
                        )}
                        {st.iconType === 'chemical' && (
                          /* Chemical / Drop Icon for ChemoBlock */
                          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 2v7.31M14 2v7.31" />
                            <path d="M8.5 2h7" />
                            <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
                            <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                          </svg>
                        )}
                        {st.iconType === 'tds' && (
                          /* Crystal-clear droplet with TDS digits for RO Maxx */
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                            </svg>
                            <span className="text-[8px] font-black text-cyan-300 font-mono">TDS</span>
                          </div>
                        )}
                        {st.iconType === 'copper' && (
                          /* Active Copper Molecule / Ion Icon */
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="8" />
                              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                            </svg>
                            <span className="text-[7.5px] font-black text-amber-300 font-mono">Cu²⁺</span>
                          </div>
                        )}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide">
                        STAGE {st.num}
                      </span>
                    </div>

                    {/* Health percentage readout */}
                    <span className={`text-[10px] font-mono font-extrabold ${st.healthColor}`}>
                      {st.health}%
                    </span>
                  </div>

                  {/* Bold Name */}
                  <div className="text-[11px] font-extrabold text-white tracking-tight flex items-center justify-between">
                    <span>{st.boldName}</span>
                    {isRoStage && (
                      <span className="text-[7.5px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                        -96% TDS
                      </span>
                    )}
                  </div>

                  {/* One-Line Role Tagline */}
                  <div className="text-[8.5px] text-zinc-300 font-medium leading-tight">
                    {st.roleTag}
                  </div>

                  {/* Health Bar under name */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5 border border-white/5">
                    <div 
                      className={`h-full ${st.barColor} transition-all duration-500`}
                      style={{ width: `${st.health}%` }}
                    />
                  </div>

                  {/* Specific Metric or Highlight Banner */}
                  {isRoStage && (
                    <div className="text-[8px] font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-center font-bold">
                      Inflow: 680 → 28 ppm
                    </div>
                  )}
                  {isCopperStage && (
                    <div className="text-[8px] font-mono text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 text-center font-bold">
                      Active Cu²⁺ Ion Infusion
                    </div>
                  )}
                  {isSediStage && (
                    <div className="text-[8px] font-mono text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 text-center font-bold">
                      Traps Sand & Mining Slurry
                    </div>
                  )}
                  {isChemoStage && (
                    <div className="text-[8px] font-mono text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 text-center font-bold">
                      Active Carbon CTO Block
                    </div>
                  )}
                </div>

                {/* Subtle downward stem pointing to physical mount */}
                <div className="w-0.5 h-2 bg-gradient-to-b from-white/20 to-transparent" />
              </div>
            </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

