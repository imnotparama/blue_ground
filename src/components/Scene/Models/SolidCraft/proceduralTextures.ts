import * as THREE from 'three';

// Cache generated textures so they are created once and reused across renders
const textureCache = new Map<string, THREE.CanvasTexture>();

// -------------------------------------------------------------
// 1. HIGH-EFFICIENCY MONOCRYSTALLINE PHOTOVOLTAIC TEXTURE
// -------------------------------------------------------------
export function getSolarCellTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = 'solar_pv_cells_v1';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base White Tedlar Inter-Cell Backsheet
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, w, h);

  // 2. Monocrystalline Pseudo-Square Cells Matrix (6 columns x 10 rows)
  const cols = 6;
  const rows = 10;
  const padX = 20;
  const padY = 20;
  const gap = 8;

  const cellW = (w - padX * 2 - gap * (cols - 1)) / cols;
  const cellH = (h - padY * 2 - gap * (rows - 1)) / rows;
  const chamfer = Math.min(cellW, cellH) * 0.16; // 45° cut corners

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (cellW + gap);
      const y = padY + r * (cellH + gap);

      // Deep dark blue / indigo-black monocrystalline silicon wafer
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#09152b');
      grad.addColorStop(0.5, '#0c1e3d');
      grad.addColorStop(1, '#071024');

      ctx.save();
      ctx.beginPath();
      // Octagonal pseudo-square path with 45° chamfered corners
      ctx.moveTo(x + chamfer, y);
      ctx.lineTo(x + cellW - chamfer, y);
      ctx.lineTo(x + cellW, y + chamfer);
      ctx.lineTo(x + cellW, y + cellH - chamfer);
      ctx.lineTo(x + cellW - chamfer, y + cellH);
      ctx.lineTo(x + chamfer, y + cellH);
      ctx.lineTo(x, y + cellH - chamfer);
      ctx.lineTo(x, y + chamfer);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Ultra-fine conductive silver finger grid lines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.lineWidth = 1;
      const numFingers = 24;
      for (let f = 1; f < numFingers; f++) {
        const fy = y + (f / numFingers) * cellH;
        ctx.beginPath();
        ctx.moveTo(x + 2, fy);
        ctx.lineTo(x + cellW - 2, fy);
        ctx.stroke();
      }

      // 3 Bright Continuous Silver Busbar Ribbons per cell
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      for (let b = 1; b <= 3; b++) {
        const bx = x + (b / 4) * cellW;
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx, y + cellH);
        ctx.stroke();

        // Solder joint pads along the busbars
        ctx.fillStyle = '#f8fafc';
        for (let s = 1; s <= 4; s++) {
          const sy = y + (s / 5) * cellH;
          ctx.fillRect(bx - 2, sy - 2, 4, 4);
        }
      }

      ctx.restore();
    }
  }

  // 3. Perimeter Framing Rubber Gasket Trim
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(6, 6, w - 12, h - 12);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(key, texture);
  return texture;
}

// -------------------------------------------------------------
// 2. INDUSTRIAL NEMA/IP66 ENCLOSURE DOOR FACEPLATE TEXTURE
// -------------------------------------------------------------
export function getEnclosureFaceplateTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = 'enclosure_faceplate_v1';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Powder-coated dark slate chassis door base
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, w, h);

  // Subtle stippling texture for authentic powder-coat finish
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // EPDM Gasket Bezel Perimeter Groove
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0f172a';
  ctx.strokeRect(12, 12, w - 24, h - 24);

  // Inner beveled highlight line
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // 2. Anodized Brushed Stainless Steel Rating Plate (Top Center)
  const plateX = 50;
  const plateY = 40;
  const plateW = 540;
  const plateH = 210;

  const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX + plateW, plateY + plateH);
  plateGrad.addColorStop(0, '#f1f5f9');
  plateGrad.addColorStop(0.3, '#cbd5e1');
  plateGrad.addColorStop(0.7, '#94a3b8');
  plateGrad.addColorStop(1, '#64748b');

  ctx.fillStyle = plateGrad;
  ctx.fillRect(plateX, plateY, plateW, plateH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  // Corner mounting rivets on rating plate
  ctx.fillStyle = '#1e293b';
  [
    [plateX + 8, plateY + 8],
    [plateX + plateW - 8, plateY + 8],
    [plateX + 8, plateY + plateH - 8],
    [plateX + plateW - 8, plateY + plateH - 8],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Laser-etched technical text on rating plate
  ctx.font = 'bold 24px "Segoe UI", "Helvetica Neue", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('BLUEGROUND SMART LEVIATHAN', plateX + 24, plateY + 38);

  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('AUTONOMOUS SOLAR DESALINATION SYSTEM', plateX + 24, plateY + 60);

  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#334155';
  ctx.fillText('MODEL: BG-LEVIATHAN-S3-2026   | REV: 9.4.2 CAD', plateX + 24, plateY + 88);
  ctx.fillText('POWER BUS: 24V-48V DC BATT / 350W PV CANOPY', plateX + 24, plateY + 108);
  ctx.fillText('WATER PRODUCTION: 120 L/HR WHO DRINKING POTABLE', plateX + 24, plateY + 128);
  ctx.fillText('PROTECTION RATING: NEMA 4X / IP66 DUST & WATERPROOF', plateX + 24, plateY + 148);
  ctx.fillText('CERTIFICATION: WHO-PQS-E003/001 | IS 10500:2012', plateX + 24, plateY + 168);
  ctx.fillText('MANUFACTURED: BLUEGROUND ENGINEERING CORP', plateX + 24, plateY + 188);

  // 3. High-Voltage Warning Decal (Right of Rating Plate)
  const warnX = 640;
  const warnY = 40;
  const warnW = 330;
  const warnH = 210;

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(warnX, warnY, warnW, warnH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(warnX, warnY, warnW, warnH);

  // Black warning header banner
  ctx.fillStyle = '#000000';
  ctx.fillRect(warnX, warnY, warnW, 46);

  ctx.font = 'bold 24px "Segoe UI Black", Arial, sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('! WARNING !', warnX + 85, warnY + 34);

  // Lightning bolt symbol
  ctx.beginPath();
  ctx.moveTo(warnX + 45, warnY + 60);
  ctx.lineTo(warnX + 25, warnY + 120);
  ctx.lineTo(warnX + 48, warnY + 115);
  ctx.lineTo(warnX + 32, warnY + 185);
  ctx.lineTo(warnX + 70, warnY + 105);
  ctx.lineTo(warnX + 46, warnY + 110);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText('HIGH VOLTAGE SOLAR DC BUS', warnX + 90, warnY + 80);
  ctx.fillText('254nm GERMICIDAL UV-C SOURCE', warnX + 90, warnY + 100);
  ctx.fillText('DUAL POWERED FROM PV & BATTERY', warnX + 90, warnY + 120);
  ctx.fillText('ISOLATE CIRCUIT BREAKER BEFORE', warnX + 90, warnY + 145);
  ctx.fillText('OPENING OR SERVICING FILTER TRAIN', warnX + 90, warnY + 165);

  // 4. Silkscreen LED Indicator Cluster at Bottom
  const ledY = 320;
  const leds = [
    { label: 'DC MAINS', color: '#22c55e' },
    { label: 'SOLAR MPPT', color: '#38bdf8' },
    { label: 'PUMP ACTIVE', color: '#06b6d4' },
    { label: 'UV-C STERILIZER', color: '#a855f7' },
    { label: 'ALARM FAULT', color: '#ef4444' },
  ];

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(50, 290, 920, 90);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 290, 920, 90);

  leds.forEach((led, idx) => {
    const lx = 110 + idx * 180;
    // Outer metal bezel
    ctx.beginPath();
    ctx.arc(lx, ledY + 15, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Inner glowing LED jewel
    ctx.beginPath();
    ctx.arc(lx, ledY + 15, 7, 0, Math.PI * 2);
    ctx.fillStyle = led.color;
    ctx.fill();

    // Specular highlight on lens
    ctx.beginPath();
    ctx.arc(lx - 2, ledY + 13, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Silk label below
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText(led.label, lx, ledY + 48);
    ctx.textAlign = 'start';
  });

  // 5. Ventilation Louver Slits at the bottom of the door
  ctx.fillStyle = '#090d16';
  for (let l = 0; l < 8; l++) {
    const ly = 410 + l * 10;
    ctx.fillRect(80, ly, 860, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(key, texture);
  return texture;
}

// -------------------------------------------------------------
// 3. TRANSPARENT ACRYLIC TANK LASER-ETCHED GRADUATED VOLUME SCALE
// -------------------------------------------------------------
export function getTankGraduationTexture(isPrimary: boolean): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = isPrimary ? 'tank_scale_primary_100L' : 'tank_scale_secondary_50L';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // Fully transparent background so only laser engravings are visible
  ctx.clearRect(0, 0, w, h);

  const maxLiters = isPrimary ? 100 : 50;
  const title = isPrimary
    ? 'POTABLE WATER STORAGE'
    : 'RAW WATER SETTLING & SENSOR TANK';
  const sub = isPrimary
    ? 'WHO-PQS POTABLE GRADE • 100 LITERS MAX'
    : 'BOREWELL INTAKE BUFFER • 50 LITERS MAX';

  // Laser-etched border guideline
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Technical Header at Top
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(title, 36, 60);

  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.fillText(sub, 36, 84);

  // Graduated Volume Tick Marks
  const rulerX = 70;
  const topY = 130;
  const botY = h - 80;
  const rulerHeight = botY - topY;

  // Vertical Spine
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.moveTo(rulerX, topY);
  ctx.lineTo(rulerX, botY);
  ctx.stroke();

  const majorStep = isPrimary ? 10 : 5;
  const minorStep = majorStep / 2;
  const totalSteps = maxLiters / minorStep;

  for (let s = 0; s <= totalSteps; s++) {
    const liters = (s * minorStep);
    const ratio = liters / maxLiters;
    // Volume increases upwards
    const y = botY - ratio * rulerHeight;
    const isMajor = (liters % majorStep === 0);

    ctx.beginPath();
    ctx.moveTo(rulerX, y);
    if (isMajor) {
      ctx.lineTo(rulerX + 42, y);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.stroke();

      // Number Callout
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(`${liters}L`, rulerX + 54, y + 6);
    } else {
      ctx.lineTo(rulerX + 22, y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.stroke();
    }
  }

  // Red Max Fill Overflow Cutoff Line
  const maxCutoffY = botY - (0.95 * rulerHeight);
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
  ctx.beginPath();
  ctx.moveTo(rulerX, maxCutoffY);
  ctx.lineTo(w - 36, maxCutoffY);
  ctx.stroke();
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
  ctx.fillText('HIGH LEVEL FLOAT SENSOR TRIP (95%)', rulerX + 10, maxCutoffY - 8);

  // Blue Minimum Pump Protection Cutoff Line
  const minCutoffY = botY - (0.15 * rulerHeight);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.beginPath();
  ctx.moveTo(rulerX, minCutoffY);
  ctx.lineTo(w - 36, minCutoffY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
  ctx.fillText('RUN-DRY INTERLOCK PROTECTION (15%)', rulerX + 10, minCutoffY - 8);

  // BlueGround Etched Emblem at bottom
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('BLUEGROUND LEVIATHAN - OPTICAL PMMA CAST RESIN', 36, h - 36);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(key, texture);
  return texture;
}

// -------------------------------------------------------------
// 4. COMMERCIAL FILTER CANISTER INDUSTRIAL WRAP TEXTURES
// -------------------------------------------------------------
export function getFilterCanisterTexture(stage: 1 | 2 | 3 | 4): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = `filter_wrap_stage_${stage}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // Clean pure white medical/food-grade polypropylene canister shell
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Stage details configuration
  const configs = {
    1: {
      color: '#1e40af', // Royal Blue
      stageName: 'STAGE 1: 5µm SEDIMENT & CARBON CTO',
      technology: 'MELT-BLOWN FIBER + ACTIVATED CARBON',
      specs: 'PARTICLE CUTOFF: 5 MICRON | EFFICIENCY: 99.4%',
      badge: 'NSF/ANSI 42',
    },
    2: {
      color: '#0284c7', // RO Cyan
      stageName: 'STAGE 2: DOW FILMTEC™ RO MEMBRANE',
      technology: 'HIGH-PRESSURE POLYAMIDE TFC 0.0001µm',
      specs: 'DESALINATION REJECTION: 99.2% | RATING: 75 GPD',
      badge: 'NSF/ANSI 58',
    },
    3: {
      color: '#059669', // Emerald Green
      stageName: 'STAGE 3: BIOCERA ALKALINE MINERALIZER',
      technology: 'BIO-CERAMIC BALLS (Ca2+, Mg2+, K+)',
      specs: 'pH ENRICHMENT: 7.8 - 8.5 | ANTIOXIDANT -150mV',
      badge: 'FDA GRADE',
    },
    4: {
      color: '#475569', // Dark Slate
      stageName: 'STAGE 4: POST-CARBON POLISHING STAGE',
      technology: 'ACID-WASHED COCONUT ACTIVATED CARBON',
      specs: 'TASTE POLISHING • VOC REMOVAL • WHO CLASS 1',
      badge: 'WQA GOLD',
    },
  };

  const cfg = configs[stage];

  // Prominent Colored Identity Band across middle
  ctx.fillStyle = cfg.color;
  ctx.fillRect(0, 140, w, 140);

  // Contrast stripes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 136, w, 4);
  ctx.fillRect(0, 280, w, 4);

  // Label Typography
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(cfg.stageName, 24, 180);

  ctx.font = 'bold 15px "Segoe UI", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(cfg.technology, 24, 215);

  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(cfg.specs, 24, 252);

  // Stamp Badge (Circle on right)
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(w - 110, 160, 90, 80);
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFIED', w - 65, 195);
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText(cfg.badge, w - 65, 222);
  ctx.textAlign = 'start';

  // Top and bottom technical barcodes
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 40; i++) {
    const bx = 30 + i * 11;
    const bw = (i % 3 === 0) ? 6 : (i % 2 === 0) ? 3 : 1.5;
    ctx.fillRect(bx, 420, bw, 36);
  }

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`P/N: BGL-FLT-STG${stage}-2026-IND   |   FLOW DIRECTION --->`, 30, 475);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(key, texture);
  return texture;
}

// -------------------------------------------------------------
// 5. ANALOG PRESSURE GAUGE DIAL TEXTURE (0-10 BAR / 0-150 PSI)
// -------------------------------------------------------------
export function getPressureGaugeTexture(operatingBar = 4.2): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = `gauge_dial_${operatingBar.toFixed(1)}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 128;
  const cy = 128;
  const r = 118;

  // Dial background (white dial face)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  // Green Safe Zone Arc (2.5 bar to 6.5 bar: ~135° to 270°)
  ctx.beginPath();
  ctx.arc(cx, cy, r - 20, Math.PI * 0.75 + (2.5 / 10) * Math.PI * 1.5, Math.PI * 0.75 + (6.5 / 10) * Math.PI * 1.5);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#22c55e';
  ctx.stroke();

  // Red Overpressure Zone Arc (8 bar to 10 bar)
  ctx.beginPath();
  ctx.arc(cx, cy, r - 20, Math.PI * 0.75 + (8.0 / 10) * Math.PI * 1.5, Math.PI * 0.75 + Math.PI * 1.5);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ef4444';
  ctx.stroke();

  // Tick Marks & Numbers (0 to 10 bar)
  for (let b = 0; b <= 10; b++) {
    const angle = Math.PI * 0.75 + (b / 10) * Math.PI * 1.5;
    const x1 = cx + Math.cos(angle) * (r - 12);
    const y1 = cy + Math.sin(angle) * (r - 12);
    const x2 = cx + Math.cos(angle) * (r - 28);
    const y2 = cy + Math.sin(angle) * (r - 28);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Major numbers
    if (b % 2 === 0) {
      const tx = cx + Math.cos(angle) * (r - 40);
      const ty = cy + Math.sin(angle) * (r - 40);
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${b}`, tx, ty);
    }
  }

  // Dial Center Branding
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.fillStyle = '#0284c7';
  ctx.textAlign = 'center';
  ctx.fillText('BLUEGROUND', cx, cy - 35);
  ctx.font = '9px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('BAR / PSI • GLYCERIN', cx, cy + 35);

  // Red Pointer Needle
  const needleAngle = Math.PI * 0.75 + (operatingBar / 10) * Math.PI * 1.5;
  const nx = cx + Math.cos(needleAngle) * (r - 18);
  const ny = cy + Math.sin(needleAngle) * (r - 18);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();

  // Needle Hub Pin
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(key, texture);
  return texture;
}

// -------------------------------------------------------------
// 6. BOROSILICATE LABORATORY BEAKER GRADUATION TEXTURE
// -------------------------------------------------------------
export function getBeakerGraduationTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const key = 'beaker_graduations_v1';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // Transparent
  ctx.clearRect(0, 0, w, h);

  // White graduated marks on glass
  const marks = [100, 200, 300, 400, 500];
  const topY = 80;
  const botY = h - 60;

  marks.forEach((ml, idx) => {
    const y = botY - (idx / (marks.length - 1)) * (botY - topY);

    // Major tick
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(60, y);
    ctx.stroke();

    // Callout text
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(`${ml} ml`, 68, y + 5);

    // Minor intermediate tick
    if (idx < marks.length - 1) {
      const nextY = botY - ((idx + 0.5) / (marks.length - 1)) * (botY - topY);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, nextY);
      ctx.lineTo(44, nextY);
      ctx.stroke();
    }
  });

  // Borosilicate 3.3 logo
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('BOROSIL 3.3', 24, topY - 30);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('ISO 3819 CERT', 24, topY - 14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(key, texture);
  return texture;
}
