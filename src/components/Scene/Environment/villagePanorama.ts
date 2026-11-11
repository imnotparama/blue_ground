import * as THREE from 'three';

// Cache generated textures so they are created once and reused across renders
let cachedPanoramaTexture: THREE.CanvasTexture | null = null;
let cachedGroundTexture: THREE.CanvasTexture | null = null;

// -------------------------------------------------------------
// 1. HIGH-RESOLUTION 360° RURAL VILLAGE PANORAMIC BACKDROP
// -------------------------------------------------------------
export function getVillagePanoramaTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedPanoramaTexture) return cachedPanoramaTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Beautiful Morning Sky Gradient (Top to Horizon)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.72);
  skyGrad.addColorStop(0, '#0369a1');     // Deep Sky Azure
  skyGrad.addColorStop(0.25, '#0284c7');  // Bright Morning Blue
  skyGrad.addColorStop(0.5, '#38bdf8');   // Soft Sky Blue
  skyGrad.addColorStop(0.72, '#bae6fd');  // Atmospheric Cyan Haze
  skyGrad.addColorStop(0.88, '#fed7aa');  // Golden Morning Sunrise Horizon
  skyGrad.addColorStop(1.0, '#ffedd5');   // Warm Horizon Glow

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft Atmospheric Morning Cirrus Clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  for (let i = 0; i < 18; i++) {
    const cx = (i * 125) % w;
    const cy = 90 + (i % 6) * 45;
    const cw = 220 + (i % 4) * 80;
    const ch = 18 + (i % 3) * 12;

    ctx.beginPath();
    ctx.ellipse(cx, cy, cw * 0.5, ch * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Also wrap around edge for seamless 360°
    if (cx + cw * 0.5 > w) {
      ctx.beginPath();
      ctx.ellipse(cx - w, cy, cw * 0.5, ch * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Layer 1: Distant Misty Western Ghats Mountain Silhouette (Seamless 360°)
  ctx.fillStyle = '#6b8299'; // Distant blue-gray mountain haze
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 4) {
    const angle = (x / w) * Math.PI * 2;
    // Harmonic wave for seamless wrapping
    const y =
      h * 0.50 +
      Math.sin(angle * 2) * 55 +
      Math.sin(angle * 4 + 1.2) * 28 +
      Math.cos(angle * 6) * 16;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // 4. Layer 2: Mid-Distance Forested Rolling Hills
  ctx.fillStyle = '#345243'; // Deep tropical forest green
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 4) {
    const angle = (x / w) * Math.PI * 2;
    const y =
      h * 0.58 +
      Math.sin(angle * 3 + 2.1) * 45 +
      Math.cos(angle * 5) * 22 +
      Math.sin(angle * 8) * 12;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // 5. Layer 3: Lush Near-Horizon Tropical Tree Line, Palms & Rural Settlement
  // A. Organic Tree Canopy Silhouette
  ctx.fillStyle = '#1c3824'; // Rich dense foliage
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 3) {
    const angle = (x / w) * Math.PI * 2;
    const y =
      h * 0.65 +
      Math.sin(angle * 5 + 0.8) * 25 +
      Math.cos(angle * 11) * 14 +
      Math.sin(angle * 22) * 6;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // B. Photorealistic Silhouetted Coconut Palm Groves Along Horizon
  const numPalms = 36;
  for (let p = 0; p < numPalms; p++) {
    const px = (p / numPalms) * w + ((p * 37) % 30);
    const baseY = h * 0.74;
    const trunkH = 85 + (p % 5) * 22;
    const crownX = px + Math.sin(p) * 12;
    const crownY = baseY - trunkH;

    // Slender curving trunk
    ctx.strokeStyle = '#14291a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, baseY);
    ctx.quadraticCurveTo(px + Math.sin(p) * 6, baseY - trunkH * 0.5, crownX, crownY);
    ctx.stroke();

    // Natural Cascading Palm Fronds (Arched downwards gracefully)
    const fronds = 14;
    for (let f = 0; f < fronds; f++) {
      const fAngle = (f / fronds) * Math.PI * 2;
      const fLen = 32 + (f % 3) * 10;
      const tipX = crownX + Math.cos(fAngle) * fLen;
      // Parabolic gravity droop: fronds cascade downwards
      const tipY = crownY + Math.sin(fAngle) * fLen * 0.45 + (fLen * 0.4);

      ctx.strokeStyle = '#19361f';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      ctx.quadraticCurveTo(
        crownX + Math.cos(fAngle) * (fLen * 0.6),
        crownY + Math.sin(fAngle) * (fLen * 0.3) - 5,
        tipX,
        tipY
      );
      ctx.stroke();
    }
  }

  // C. Traditional Village Hut Gables & Red Tiled Roof Silhouettes
  const numHuts = 12;
  for (let u = 0; u < numHuts; u++) {
    const hx = ((u + 0.5) / numHuts) * w + ((u * 41) % 40);
    const hy = h * 0.68;
    const hw = 50 + (u % 3) * 15;
    const hh = 26;

    // Hut clay wall base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(hx - hw * 0.4, hy, hw * 0.8, hh);

    // Terracotta thatched roof triangle
    ctx.fillStyle = '#b45309'; // Warm terracotta
    ctx.beginPath();
    ctx.moveTo(hx - hw * 0.5, hy);
    ctx.lineTo(hx + hw * 0.5, hy);
    ctx.lineTo(hx, hy - 22);
    ctx.closePath();
    ctx.fill();
  }

  // 6. Layer 4: Warm Rural Earth Horizon (Seamless transition to 3D floor)
  const groundGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
  groundGrad.addColorStop(0, 'rgba(82, 58, 40, 0.85)');
  groundGrad.addColorStop(0.3, '#523a28');
  groundGrad.addColorStop(1.0, '#3d291b');

  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, h * 0.74, w, h * 0.26);

  // Soft atmospheric fog horizon veil
  const hazeGrad = ctx.createLinearGradient(0, h * 0.62, 0, h * 0.76);
  hazeGrad.addColorStop(0, 'rgba(254, 215, 170, 0)');
  hazeGrad.addColorStop(0.5, 'rgba(254, 215, 170, 0.25)');
  hazeGrad.addColorStop(1, 'rgba(82, 58, 40, 0.4)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, h * 0.62, w, h * 0.14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  cachedPanoramaTexture = texture;
  return texture;
}

// -------------------------------------------------------------
// 2. NATURAL RURAL EARTH GROUND TEXTURE WITH FINE DETAIL
// -------------------------------------------------------------
export function getRuralGroundTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedGroundTexture) return cachedGroundTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // Rich warm red-brown earth base
  ctx.fillStyle = '#523a28';
  ctx.fillRect(0, 0, w, h);

  // Organic soil grain & fine gravel noise
  for (let i = 0; i < 25000; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    const sz = Math.random() < 0.85 ? 1.5 : 3.0;
    const brightness = Math.random();
    ctx.fillStyle =
      brightness > 0.6
        ? `rgba(180, 140, 100, ${Math.random() * 0.22})`
        : `rgba(40, 25, 15, ${Math.random() * 0.28})`;
    ctx.fillRect(rx, ry, sz, sz);
  }

  // Scattered dry golden grass blades & small organic patches
  ctx.strokeStyle = 'rgba(161, 98, 7, 0.25)';
  ctx.lineWidth = 1.2;
  for (let g = 0; g < 400; g++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    const len = 4 + Math.random() * 8;
    const rot = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + Math.cos(rot) * len, gy + Math.sin(rot) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  cachedGroundTexture = texture;
  return texture;
}

