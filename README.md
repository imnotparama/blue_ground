# 🌊 BlueGround (Leviathan) — Version 2.0.0

> **Smart IoT Solar Water Purification, Multi-Barrier 4-Stage RO Rack & Antigravity Digital Twin**  
> **Lead Architect & Engineer:** **Parameshwaran S**  
> **Location Anchor:** `LAT 13.0827° N / LON 80.2707° E` (Chennai, India)

---

## 📌 Overview

**BlueGround Leviathan v2.0** represents the official upgrade of the interactive 3D digital twin to match the real physical hardware prototype: a solar-powered, ESP32-S3-controlled smart water purification, aquaculture, and telemetry station. It introduces the **bottom primary raw water reservoir**, the **back-mounted vertical 4-stage filtration rack** (Sediment, Chemo Block, RO Maxx, Final Guard / UV), the **elevated secondary clean water tank** with vertical float switch probe and solenoid valve, a **complete 9-sensor hardware deck**, and the cinematic **Antigravity Levitation View**.

---

## ✨ Version 2.0 Key Enhancements

### 1. Back-Mounted 4-Stage Filtration Rack (Vertical Architecture)
- Attached vertically on the rear extrusion frame with heavy aluminium brackets:
  - **Stage 1: Sediment** — 5µm PP melt-blown pre-filter (`92% Health`), stops sand, rust, and coarse grit.
  - **Stage 2: Chemo Block** — Extruded Activated Carbon Block (CTO) (`85% Health`), adsorbs chlorine, toxic organics, and mining runoff odors.
  - **Stage 3: RO Maxx** — 0.0001µm Thin-Film Composite (TFC) reverse osmosis membrane (`79% Health`), desalinates and strips heavy metals.
  - **Stage 4: Final Guard / UV** — Mineralizer cartridge & 254nm germicidal stainless UV-C disinfection chamber (`95% Health`) with live blue indicator light.
- **3-Way Motorized Diverter Valves**: Located between stages with live status levers indicating Full Purification Chain, Bypass, and Maintenance Flush routing.

### 2. Dual-Tank Stratification
- **Primary Tank (Bottom Layer)**:
  - Large rectangular, transparent acrylic raw water collection reservoir with volume graduation markings, structural corner extrusions, and vibration dampener feet.
- **Secondary Tank (Top Layer / Top 1 - Purified Water Chamber)**:
  - Clear tank elevated on an aluminium shelf above the middle control deck.
  - Receives permeate from Stage 4 Final Guard.
  - **Internal Vertical Float Switch Probe**: Polished stainless steel probe with toroidal magnetic float ring and graduated level markers (25%, 50%, 75%, 100%).
  - **Clean Outlet Solenoid Valve**: Motorized brass solenoid valve with illuminated emerald LED indicator regulating flow to the external clean water tap.

### 3. Front Middle Deck (Top 2) Control & 9-Sensor Real Hardware Suite
- **ESP32-S3 IoT Central Controller Box**:
  - Enclosure with glowing neon cyan border.
  - **1.8-inch TFT LCD Display**: Renders real-time canvas telemetry (Flow, TDS, Turbidity, pH, Solar W, Battery %, Pump Rail V).
  - **16-Channel Touch Sensor Strip**: Capacitive touch interface with gold-plated pads.
- **Compact Prototype Sensor Array**:
  1. **pH Sensor Probe**: Glass electrode bulb in sample flow cell.
  2. **Turbidity Sensor Module**: Optical infrared phototransistor chamber.
  3. **TDS / EC Sensor**: Dual titanium electrode pins.
  4. **DS18B20 Temperature Probe**: Stainless steel waterproof capsule submerged in tank.
  5. **YF-S401 Flow Sensor**: In-line turbine Hall-effect meter.
  6. **Water Level Float Switch**: Vertical magnetic reed stem.
  7. **BH1750 Ambient Light Sensor**: I2C digital lux sensor with hemispherical dome.
  8. **0–25V Voltage Divider Sensor**: Monitors 24V pump and 5V logic rails.
  9. **ACS712 Current Sensor**: Linear Hall-effect module measuring system draw.
- **Ghosted Tracer Lines**: Semi-transparent glowing conduits linking sensors to their physical locations in the tanks, pipes, and power rails.

### 4. Power Subsystem Visualization Slice
- **Solar Input**: Monocrystalline PV input ($56.8\text{ W}$).
- **1S5P Li-ion Battery Bank**: Transparent housing displaying 5 parallel lithium cells, nickel busbars, and 1S BMS protection board ($78\text{--}100\%$).
- **DC-DC Converters**:
  - **XL6009/XL6019 Boost Converter**: Steps battery up to **24.0V Pump Rail**.
  - **LM2596/XL4015 Buck Converter**: Steps down to **5.0V Logic Rail**.
  - **3.3V MCU Rail** powering ESP32-S3 logic.
- Real-time color-coded power indicators: **Green** (Healthy), **Amber** (Low Battery), **Red** (Critical).

### 5. Antigravity Levitation View (Toggle with `A`)
- When enabled, the entire Leviathan rig (primary tank, back filter rack, secondary tank, sensors, pumps, and power slice) lifts into the air ($+0.42\text{m}$) and gently levitates with harmonic magnetic bobbing and slow oscillation.
- All hydraulic piping remains fully connected and active.
- Ground platform and background terrain dim into the background.
- **Three Glowing Magnetic Energy Rings** surround the floating subsystems with 3D tags:
  1. `[ ⚡ SOLAR & POWER GRID ]` (Amber)
  2. `[ 🛡️ 4-STAGE MULTI-BARRIER FILTRATION ]` (Cyan)
  3. `[ 💧 HYDRAULIC PURIFICATION LOOP ]` (Emerald)

---

## ⌨️ Global Keyboard Hotkeys (v2.0)

| Hotkey | Action |
| :---: | :--- |
| **`A`** | **Toggle Antigravity Levitation Cinematic Mode** |
| **`W`** | Toggle Interactive Water Flow Focus Journey (Stages 1–6) |
| **`G`** | Toggle In-Line Hydro Turbine Generator & India Mark II Hand Pump |
| **`V`** | Toggle Pipeline Architecture (Setup 1 Direct vs Setup 2 Dual Verification) |
| **`T`** | Toggle Tanks Isolation Mode (Framed 3D Boundaries) |
| **`H`** | Toggle Interactive Hotspot Badges & Telemetry Overlays |
| **`S`** | Toggle Sensors & Tools Hardware Inventory Catalog |
| **`1`** | Launch Simulation 1: Clean Borewell Water Flow (Setup 1) |
| **`2`** | Launch Simulation 2: Muddy Mining Slurry Recirculation (Setup 2) |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16.3.3 (App Router, Turbopack)
- **3D Engine:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Animation & Transitions:** Framer Motion, GSAP
- **Styling:** Vanilla CSS, Tailwind CSS
- **Audio Engine:** Custom Web Audio API Synthesizer (`audioSynthesizer.ts`)
- **Icons:** Lucide React

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/imnotparama/blue_ground.git

# Navigate into project directory
cd blue_ground

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

© 2026 **BlueGround** • Engineered with pride by **Parameshwaran S**.
