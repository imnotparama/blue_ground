# 🌊 BlueGround (Leviathan) — Version 1.0.0

> **Industrial IoT Water Purification, Multi-Barrier RO Filtration & Hydro-Energy Harvesting Digital Twin**  
> **Lead Architect & Engineer:** **Parameshwaran S**

---

## 📌 Overview

**BlueGround v1.0.0** is an interactive, photorealistic WebGL/Three.js digital twin of an off-grid solar- and hydro-powered water treatment system designed for mining, quarry, and rural borehole environments. It simulates complete real-time water quality analysis, physical multi-stage filtration, hydro-electric energy harvesting, and dual-sensor recirculation verification.

---

## ✨ Key Features (v1.0.0)

### 1. Dual Pipeline Architecture (Toggle with `V`)
- **Setup 1 (Direct Clean Flow):**  
  Raw borehole water passes through gravity sedimentation and multi-barrier filtration directly into the primary clean reservoir.
- **Setup 2 (Dual Verification & Closed-Loop Recirculation):**  
  Post-filtration water enters **Tank 2 Verification Chamber** where secondary TDS and turbidity sensors inspect purity. If TDS exceeds standard limits ($>100\text{ ppm}$), motorized solenoid valves automatically trigger an overhead riser loop, returning the water back to the RO filter media for re-purification.

### 2. Hydro-Power Generator & Deep-Well Hand Pump (Toggle with `G`)
- **India Mark II Deep-Well Hand Pump:**  
  Modeled to precise mechanical blueprint specifications: concrete foundation apron with drainage trough, triangular reinforcement gussets, lower pedestal stand, machined bolted mid-collar, brass stuffing gland, and slanted pump head with dual pivot trunnions.
- **Animated 3D Field Operator:**  
  A fully rigged, animated mining field worker in high-visibility safety workwear (PPE hard hat, tinted goggles, orange vest, cargo trousers, and work boots) actively pumping the lever handle.
- **In-Line Hydro-Power Turbine Generator:**  
  Water pumped through the intake drives a high-efficiency hydraulic turbine motor ($+28.5\text{ W}$), transmitting electrical energy via an overhead conduit cable directly into the LiFePO4 battery bank.

### 3. ESP32 Industrial IoT Controller & Telemetry
- **Hardware Integration:** Dual-core ESP32 microcontroller with Wi-Fi/ESP-NOW communication, status LEDs, terminal blocks, and an animated 1.8" TFT display showing live voltage, flow rate, TDS, turbidity, and hydro-harvesting status.
- **Power Grid Matrix:** Real-time power balance tracking solar PV input ($+50\text{ W}$), hydro turbine generation ($+28.5\text{ W}$), system discharge load, and battery state-of-charge.

### 4. Interactive "Journey of a Water Packet" (`W`)
- Follow a water droplet across all 6 purification stages:
  1. **Stage 1:** Borewell / Hand Pump Intake
  2. **Stage 2:** Sedimentation & Gravity Grit Trap
  3. **Stage 3:** Inline Flow Telemetry (YF-S201)
  4. **Stage 4:** IoT Probing Chamber (TDS / pH / Turbidity)
  5. **Stage 5:** High-Pressure RO & UV Disinfection
  6. **Stage 6:** Final Verification & Reservoir Delivery / Closed-Loop Recirculation
- Integrated Web Audio API synthesizer generates tonal audio feedback for each stage transition.

### 5. Scenic Mining Environment & Atmospheric Lighting
- Open-pit quarry background featuring low-poly excavators (JCB), heavy dump trucks, floodlight towers, and dust motes.
- Real-time environmental presets: **Sunny**, **Golden Hour (Morning)**, **Overcast (Cloudy)**, **Rainy**, and **Night** mode with dynamic directional shadow mapping.

---

## ⌨️ Global Keyboard Hotkeys

| Hotkey | Action |
| :---: | :--- |
| **`W`** | Toggle Interactive Water Flow Focus Journey |
| **`G`** | Toggle Hydro-Power Turbine Generator & Hand Pump Mode |
| **`V`** | Toggle Dual Pipeline Architecture (Setup 1 vs Setup 2) |
| **`T`** | Toggle Tanks-Only Isolation Mode (Framed 3D Boundaries) |
| **`H`** | Toggle Interactive Hotspot Badges & Telemetry Overlays |
| **`S`** | Toggle Sensors & Tools Hardware Inventory Catalog |
| **`1`** | Launch Simulation 1: High-Purity Water Flow (Setup 1) |
| **`2`** | Launch Simulation 2: Mineral-Heavy Recirculation Flow (Setup 2) |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16.3.3 (App Router, Turbopack)
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Animation & Transitions:** Framer Motion, GSAP
- **Styling:** Vanilla CSS, Tailwind CSS
- **Audio Engine:** Custom Web Audio API Synthesizer (`audioSynthesizer.ts`)
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/imnotparama/blue_ground.git

# Navigate to project directory
cd blue_ground

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 📋 Versioning & Roadmap

- **Version 1.0.0 (Current):**
  - Full 3D Digital Twin with India Mark II Hand Pump, Animated Operator, In-line Hydro Generator, Setup 1 & Setup 2 dual-verification piping, and ESP32 telemetry.
- **Upcoming Sessions (v1.1+ Roadmap):**
  - Expanded IoT telemetry graphs and historical log export
  - Additional environmental weather effects (fog density, dynamic water level physics)
  - Enhanced mobile touch gestures and VR/AR preview modes

---

© 2026 **BlueGround** • Engineered with pride by **Parameshwaran S**.
