const fs = require('fs');
const path = require('path');

const solidcraftPath = path.resolve('blueground_leviathan_v9.solidcraft');
const data = JSON.parse(fs.readFileSync(solidcraftPath, 'utf8'));

const scale = 0.003;
const datumY = -2.18;
const centerX = 35.5;
const centerY = -32.5;

function toThreePos(xCad, yCad, zCad) {
  const x3d = (xCad - centerX) * scale;
  const y3d = zCad * scale + datumY;
  const z3d = -(yCad - centerY) * scale;
  return [
    Math.round(x3d * 10000) / 10000,
    Math.round(y3d * 10000) / 10000,
    Math.round(z3d * 10000) / 10000
  ];
}

const bodies = [];

data.features.forEach(f => {
  const bodyKey = 'Body' + f.id;
  const app = data.appearances?.bodies?.[bodyKey] || {
    name: 'Custom',
    color: [180, 190, 205],
    opacity: 1,
    pbr: { metallic: 0.5, roughness: 0.3 }
  };

  let colorHex = '#' + app.color.map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
  let metalness = app.pbr?.metallic !== undefined ? app.pbr.metallic : 0.5;
  let roughness = app.pbr?.roughness !== undefined ? app.pbr.roughness : 0.35;
  let opacity = app.opacity !== undefined ? app.opacity : 1.0;
  let transparent = opacity < 0.99;

  const n = f.name;

  // 1. Transparent Clear Polycarbonate Tank Shells for Fluid Visibility
  if (n === 'Tank_Primary_Clean_Shell') {
    colorHex = '#38bdf8';
    opacity = 0.32;
    transparent = true;
    roughness = 0.08;
    metalness = 0.05;
  } else if (n === 'Fluid_Primary_Clean_Water') {
    colorHex = '#0284c7';
    opacity = 0.82;
    transparent = true;
    roughness = 0.15;
    metalness = 0.1;
  } else if (n === 'Tank_Secondary_Sensor_Shell') {
    colorHex = '#0d9488';
    opacity = 0.35;
    transparent = true;
    roughness = 0.08;
    metalness = 0.05;
  } else if (n === 'Fluid_Secondary_Sensor_Water') {
    colorHex = '#0ea5e9';
    opacity = 0.80;
    transparent = true;
    roughness = 0.15;
    metalness = 0.1;
  } else if (n.startsWith('Post_') || n.startsWith('Base_') || n.startsWith('Tier') || n.startsWith('Top_')) {
    // Brushed Structural Aluminium Rack
    colorHex = '#94a3b8';
    metalness = 0.85;
    roughness = 0.22;
  } else if (n.startsWith('Deck_')) {
    // Rigid Dark Delrin Deck Shelves
    colorHex = '#1e293b';
    metalness = 0.2;
    roughness = 0.5;
  } else if (n.includes('Stainless') || n.includes('Reactor') || n.includes('Probe_Temp') || n.includes('Body_FrontChromeTap')) {
    // Polished 316L Stainless Steel
    colorHex = '#f1f5f9';
    metalness = 0.95;
    roughness = 0.12;
  } else if (n.includes('Brass') || n.includes('NRV') || n.includes('Fitting') || n.includes('Nipple')) {
    // Machined Brass Valves & Compression Fittings
    colorHex = '#d97706';
    metalness = 0.88;
    roughness = 0.25;
  } else if (n === 'Cartridge_Sediment_SpunPP') {
    // Spun Polypropylene 5-Micron White Fiber Cartridge
    colorHex = '#f1f5f9';
    metalness = 0.05;
    roughness = 0.40;
    opacity = 1.0;
    transparent = false;
  } else if (n === 'Housing_Sediment_Bowl' || n === 'Housing_Sediment_Dome') {
    // Semi-Opaque Medical White Polypropylene Filter Bowl
    colorHex = '#f8fafc';
    opacity = 0.88;
    transparent = true;
    metalness = 0.08;
    roughness = 0.16;
  } else if (n.includes('Filter_F') || n.includes('Housing_Sediment')) {
    // Medical Pure White Filter Bodies
    colorHex = '#f8fafc';
    metalness = 0.05;
    roughness = 0.20;
  }

  let subassembly = 'FRAME';
  if (n.startsWith('Post_') || n.startsWith('Base_') || n.startsWith('Tier') || n.startsWith('Top_') || n.startsWith('Deck_')) subassembly = 'FRAME';
  else if (n.includes('Solar') || n.includes('Slant')) subassembly = 'SOLAR';
  else if (n.includes('Primary') || n.includes('Clean') || n.includes('PathA')) subassembly = 'CLEAN_TANK';
  else if (n.includes('Sediment')) subassembly = 'SEDIMENT_FILTER';
  else if (n.includes('Secondary') || n.includes('Sec') || n.includes('Probe') || n.includes('Gland') || n.includes('Intake')) subassembly = 'SENSOR_TANK';
  else if (n.includes('Filter') || n.includes('Valve_V') || n.includes('Coil_V') || n.includes('Manifold') || n.includes('CheckValve') || n.includes('Bypass') || n.includes('PushFit') || n.includes('NRV') || n.includes('Collector') || n.includes('Supply') || n.includes('Tube_V') || n.includes('Cap_F')) subassembly = 'FILTRATION_RACK';
  else if (n.includes('UV') || n.includes('Reactor')) subassembly = 'UV_DISINFECTION';
  else if (n.includes('Pump') || n.includes('P2') || n.includes('PathB')) subassembly = 'BOOSTER_PUMP';
  else if (n.includes('Flow') || n.includes('Turbine') || n.includes('Tap') || n.includes('Dispense') || n.includes('Tray') || n.includes('Grate') || n.includes('VDISP') || n.includes('Gooseneck')) subassembly = 'DISPENSE_FLOW';
  else if (n.includes('Tier3') || n.includes('TFT') || n.includes('ESP32') || n.includes('Battery') || n.includes('Relay') || n.includes('SMPS') || n.includes('PSU') || n.includes('ADC') || n.includes('XL6019') || n.includes('ACS712') || n.includes('Harness')) subassembly = 'ELECTRONICS';

  // Subassembly explosion vector [ox, oy, oz]
  let explodedOffset = [0, 0, 0];
  switch(subassembly) {
    case 'SOLAR': explodedOffset = [0, 0.45, 0]; break;
    case 'CLEAN_TANK': explodedOffset = [-0.60, 0, 0.20]; break;
    case 'SEDIMENT_FILTER': explodedOffset = [0.65, 0.10, 0]; break;
    case 'SENSOR_TANK': explodedOffset = [0.35, 0.15, 0.35]; break;
    case 'FILTRATION_RACK': explodedOffset = [0, 0.15, -0.45]; break;
    case 'UV_DISINFECTION': explodedOffset = [-0.25, -0.15, -0.35]; break;
    case 'BOOSTER_PUMP': explodedOffset = [0.30, -0.15, -0.30]; break;
    case 'DISPENSE_FLOW': explodedOffset = [0, -0.10, 0.50]; break;
    case 'ELECTRONICS': explodedOffset = [0, 0.30, 0.40]; break;
    case 'FRAME': explodedOffset = [0, 0, 0]; break;
  }

  if (f.type === 'box') {
    const lx = parseFloat(f.length);
    const ly = parseFloat(f.width);
    const lz = parseFloat(f.height);
    const cx = f.corner[0] + lx / 2;
    const cy = f.corner[1] + ly / 2;
    const cz = f.corner[2] + lz / 2;
    const pos = toThreePos(cx, cy, cz);
    const size = [
      Math.round(lx * scale * 10000) / 10000,
      Math.round(lz * scale * 10000) / 10000,
      Math.round(ly * scale * 10000) / 10000
    ];
    bodies.push({
      id: f.id,
      name: f.name,
      type: 'box',
      subassembly,
      pos,
      rot: [0, 0, 0],
      size,
      color: colorHex,
      metalness,
      roughness,
      opacity,
      transparent,
      explodedOffset,
      isFluid: f.name.includes('Fluid'),
    });
  } else if (f.type === 'cylinder') {
    const r = parseFloat(f.radius);
    const h = parseFloat(f.height);
    const ax = f.axis[0], ay = f.axis[1], az = f.axis[2];
    const cx = f.base[0] + ax * (h / 2);
    const cy = f.base[1] + ay * (h / 2);
    const cz = f.base[2] + az * (h / 2);
    const pos = toThreePos(cx, cy, cz);

    let rot = [0, 0, 0];
    if (ax === 1) rot = [0, 0, -Math.PI / 2];
    else if (ax === -1) rot = [0, 0, Math.PI / 2];
    else if (az === 1) rot = [0, 0, 0];
    else if (az === -1) rot = [Math.PI, 0, 0];
    else if (ay === 1) rot = [-Math.PI / 2, 0, 0];
    else if (ay === -1) rot = [Math.PI / 2, 0, 0];

    const size = [
      Math.round(r * scale * 10000) / 10000,
      Math.round(h * scale * 10000) / 10000
    ];
    bodies.push({
      id: f.id,
      name: f.name,
      type: 'cylinder',
      subassembly,
      pos,
      rot,
      size,
      color: colorHex,
      metalness,
      roughness,
      opacity,
      transparent,
      explodedOffset,
      isFluid: false,
    });
  }
});

// Add the high-detail Solar Canopy assemblies with dark glass & monocrystalline cells
bodies.push({
  id: 2001,
  name: 'Solar_Canopy_Frame',
  type: 'box',
  subassembly: 'SOLAR',
  pos: toThreePos(0, 2.5, 879.5),
  rot: [0.297, 0, 0],
  size: [500 * scale, 0.045, 415 * scale],
  color: '#334155',
  metalness: 0.85,
  roughness: 0.22,
  opacity: 1,
  transparent: false,
  explodedOffset: [0, 0.45, 0],
  isFluid: false
});

bodies.push({
  id: 2002,
  name: 'Solar_PV_Glass',
  type: 'box',
  subassembly: 'SOLAR',
  pos: toThreePos(0, 2.5, 882.5),
  rot: [0.297, 0, 0],
  size: [480 * scale, 0.010, 395 * scale],
  color: '#0284c7',
  metalness: 0.25,
  roughness: 0.05,
  opacity: 0.85,
  transparent: true,
  explodedOffset: [0, 0.45, 0],
  isFluid: false
});

bodies.push({
  id: 2003,
  name: 'Solar_Cells_Grid',
  type: 'box',
  subassembly: 'SOLAR',
  pos: toThreePos(0, 2.5, 884.0),
  rot: [0.297, 0, 0],
  size: [460 * scale, 0.003, 380 * scale],
  color: '#0f172a',
  metalness: 0.65,
  roughness: 0.15,
  opacity: 1,
  transparent: false,
  explodedOffset: [0, 0.45, 0],
  isFluid: false
});

// =========================================================================
// 1. REINFORCED TANK BASEMENT DECK & CRADLE FOUNDATION (FOR CLEAN TANK)
// =========================================================================
bodies.push({
  id: 2101,
  name: 'Deck_Tank_Basement_Platform',
  type: 'box',
  subassembly: 'CLEAN_TANK',
  pos: [-0.1065, -2.145, -0.0375],
  rot: [0, 0, 0],
  size: [1.20, 0.045, 0.90],
  color: '#475569',
  metalness: 0.85,
  roughness: 0.25,
  opacity: 1,
  transparent: false,
  explodedOffset: [0, 0, 0],
  isFluid: false
});

bodies.push({
  id: 2102,
  name: 'Rim_Tank_Basement_ContainmentLip',
  type: 'box',
  subassembly: 'CLEAN_TANK',
  pos: [-0.1065, -2.115, -0.0375],
  rot: [0, 0, 0],
  size: [1.22, 0.015, 0.92],
  color: '#334155',
  metalness: 0.70,
  roughness: 0.35,
  opacity: 1,
  transparent: false,
  explodedOffset: [0, 0, 0],
  isFluid: false
});

// Anti-vibration rubber mounts at 4 basement corners
const basementCorners = [
  [-0.64, -2.17, -0.44],
  [0.42, -2.17, -0.44],
  [-0.64, -2.17, 0.36],
  [0.42, -2.17, 0.36],
];

basementCorners.forEach((pos, idx) => {
  bodies.push({
    id: 2110 + idx,
    name: `Mount_Tank_Basement_RubberFoot_${idx + 1}`,
    type: 'cylinder',
    subassembly: 'CLEAN_TANK',
    pos: [pos[0], pos[1], pos[2]],
    rot: [0, 0, 0],
    size: [0.035, 0.025],
    color: '#0f172a',
    metalness: 0.1,
    roughness: 0.8,
    opacity: 1,
    transparent: false,
    explodedOffset: [0, 0, 0],
    isFluid: false
  });
});

// Stainless tank retention brackets at 4 corners
const bracketCorners = [
  [-0.63, -2.10, -0.43],
  [0.41, -2.10, -0.43],
  [-0.63, -2.10, 0.35],
  [0.41, -2.10, 0.35],
];

bracketCorners.forEach((pos, idx) => {
  bodies.push({
    id: 2120 + idx,
    name: `Bracket_Tank_Basement_Anchor_${idx + 1}`,
    type: 'box',
    subassembly: 'CLEAN_TANK',
    pos: [pos[0], pos[1], pos[2]],
    rot: [0, 0, 0],
    size: [0.045, 0.065, 0.045],
    color: '#cbd5e1',
    metalness: 0.9,
    roughness: 0.18,
    opacity: 1,
    transparent: false,
    explodedOffset: [0, 0, 0],
    isFluid: false
  });
});

// =========================================================================
// 2. RAW WATER INLET ASSEMBLY INTO THE WHITE SEDIMENTATION FILTER
// =========================================================================
// Riser pipe from floor up to white sediment filter inlet port
bodies.push({
  id: 2201,
  name: 'Pipe_RawWater_Feed_Riser',
  type: 'cylinder',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.80, -1.33, 0.2505],
  rot: [0, 0, 0],
  size: [0.016, 1.70],
  color: '#0284c7',
  metalness: 0.15,
  roughness: 0.25,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

// Brass 90-degree sweep elbow into Port_Sediment_RawInlet
bodies.push({
  id: 2202,
  name: 'Fitting_RawWater_Inlet_Elbow',
  type: 'cylinder',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.76, -0.485, 0.2505],
  rot: [0, 0, Math.PI / 2],
  size: [0.018, 0.08],
  color: '#d97706',
  metalness: 0.88,
  roughness: 0.25,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

// Brass isolation ball valve body
bodies.push({
  id: 2203,
  name: 'Valve_RawWater_Inlet_BallBody',
  type: 'cylinder',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.80, -0.75, 0.2505],
  rot: [0, 0, 0],
  size: [0.026, 0.06],
  color: '#d97706',
  metalness: 0.88,
  roughness: 0.25,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

// Ball valve quarter-turn safety-yellow handle
bodies.push({
  id: 2204,
  name: 'Handle_RawWater_Inlet_Valve',
  type: 'box',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.84, -0.75, 0.2505],
  rot: [0, 0, 0],
  size: [0.06, 0.012, 0.02],
  color: '#eab308',
  metalness: 0.3,
  roughness: 0.4,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

// Pressure gauge stem & dial face
bodies.push({
  id: 2205,
  name: 'Stem_RawWater_Inlet_Gauge',
  type: 'cylinder',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.80, -0.44, 0.2505],
  rot: [0, 0, 0],
  size: [0.008, 0.05],
  color: '#d97706',
  metalness: 0.88,
  roughness: 0.25,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

bodies.push({
  id: 2206,
  name: 'Gauge_RawWater_Inlet_Pressure',
  type: 'cylinder',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.80, -0.40, 0.2505],
  rot: [Math.PI / 2, 0, 0],
  size: [0.038, 0.02],
  color: '#f8fafc',
  metalness: 0.2,
  roughness: 0.2,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

bodies.push({
  id: 2207,
  name: 'Bezel_RawWater_Inlet_GaugeRing',
  type: 'cylinder',
  subassembly: 'SEDIMENT_FILTER',
  pos: [0.80, -0.40, 0.261],
  rot: [Math.PI / 2, 0, 0],
  size: [0.040, 0.005],
  color: '#0284c7',
  metalness: 0.85,
  roughness: 0.2,
  opacity: 1,
  transparent: false,
  explodedOffset: [0.65, 0.1, 0],
  isFluid: false
});

const outDir = path.resolve('src/components/Scene/Models/SolidCraft');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tsContent = `// Auto-generated from blueground_leviathan_v9.solidcraft
// Contains all 250 parametric features transformed to Three.js datum with high-PBR finishes

export interface CADBodyData {
  id: number;
  name: string;
  type: 'box' | 'cylinder';
  subassembly: string;
  pos: [number, number, number];
  rot: [number, number, number];
  size: [number, number, number] | [number, number];
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  transparent: boolean;
  explodedOffset: [number, number, number];
  isFluid: boolean;
}

export const SOLID_CRAFT_BODIES: CADBodyData[] = ${JSON.stringify(bodies, null, 2)};
`;

fs.writeFileSync(path.join(outDir, 'cadModelData.ts'), tsContent, 'utf8');
console.log('Successfully re-compiled cadModelData.ts with', bodies.length, 'bodies!');
