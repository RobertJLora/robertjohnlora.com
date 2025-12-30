import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public');

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: '#080808',
  amber: '#E8A836',
  amberMuted: '#A67B28',
  amberDark: '#8B6914',
  white: '#FFFFFF',
  gray: '#505050',
  grayLight: '#888888',
  purple: '#2D1B4E',
};

let seed = 42;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function resetSeed(s = 42) {
  seed = s;
}

// Shared typography function
function drawTypography(ctx) {
  const leftMargin = 80;

  ctx.fillStyle = COLORS.white;
  ctx.font = '700 72px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Robert Lora', leftMargin, HEIGHT / 2 - 20);

  ctx.fillStyle = COLORS.grayLight;
  ctx.font = '400 24px system-ui, -apple-system, sans-serif';

  const taglineY = HEIGHT / 2 + 40;
  let tagX = leftMargin;

  const words = ['search', 'strategy', 'growth'];
  words.forEach((word, i) => {
    ctx.fillStyle = COLORS.grayLight;
    ctx.fillText(word, tagX, taglineY);
    tagX += ctx.measureText(word).width;

    if (i < words.length - 1) {
      tagX += 16;
      ctx.fillStyle = COLORS.amber;
      ctx.beginPath();
      ctx.arc(tagX, taglineY, 3, 0, Math.PI * 2);
      ctx.fill();
      tagX += 20;
    }
  });

  ctx.fillStyle = COLORS.amber;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(leftMargin, HEIGHT / 2 + 80, 60, 2);
  ctx.globalAlpha = 1;
}

// Variant 2: Noise Texture
function generateVariant2() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  resetSeed(100);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Simple noise approximation
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (seededRandom() - 0.5) * 30;
    const amberNoise = seededRandom() > 0.97 ? seededRandom() * 40 : 0;

    data[i] = Math.max(0, Math.min(255, 8 + noise + amberNoise));     // R
    data[i + 1] = Math.max(0, Math.min(255, 8 + noise + amberNoise * 0.6)); // G
    data[i + 2] = Math.max(0, Math.min(255, 8 + noise));              // B
  }

  ctx.putImageData(imageData, 0, 0);
  drawTypography(ctx);

  return canvas;
}

// Variant 3: Geometric Grid
function generateVariant3() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  resetSeed(200);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const spacing = 60;

  // Grid lines
  ctx.strokeStyle = COLORS.gray;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;

  for (let x = spacing; x < WIDTH; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  for (let y = spacing; y < HEIGHT; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // Diagonal lines
  ctx.globalAlpha = 0.08;
  for (let i = -10; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(i * spacing * 2, 0);
    ctx.lineTo(i * spacing * 2 + HEIGHT, HEIGHT);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // Glowing nodes at some intersections
  for (let x = spacing; x < WIDTH; x += spacing) {
    for (let y = spacing; y < HEIGHT; y += spacing) {
      if (seededRandom() > 0.85) {
        // Glow
        ctx.fillStyle = COLORS.amber;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.globalAlpha = 1;
  drawTypography(ctx);

  return canvas;
}

// Variant 4: Halftone Fade
function generateVariant4() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  resetSeed(300);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const spacing = 20;

  for (let x = spacing / 2; x < WIDTH; x += spacing) {
    for (let y = spacing / 2; y < HEIGHT; y += spacing) {
      // Size based on position - larger on right
      const normalizedX = x / WIDTH;
      const size = 1 + normalizedX * 6;

      // Skip where text will be
      const inTextArea = x < 500 && y > HEIGHT / 2 - 80 && y < HEIGHT / 2 + 100;
      if (inTextArea) continue;

      ctx.fillStyle = seededRandom() > 0.9 ? COLORS.amber : COLORS.gray;
      ctx.globalAlpha = 0.3 + normalizedX * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  drawTypography(ctx);

  return canvas;
}

// Variant 5: Constellation
function generateVariant5() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  resetSeed(400);

  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Generate nodes
  const nodes = [];
  for (let i = 0; i < 80; i++) {
    nodes.push({
      x: seededRandom() * WIDTH,
      y: seededRandom() * HEIGHT,
      isAmber: seededRandom() > 0.85,
    });
  }

  // Draw connections
  ctx.strokeStyle = COLORS.gray;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;

  nodes.forEach((node, i) => {
    nodes.slice(i + 1).forEach(other => {
      const dist = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
      if (dist < 150) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
  });

  // Draw nodes
  ctx.globalAlpha = 1;
  nodes.forEach(node => {
    if (node.isAmber) {
      ctx.fillStyle = COLORS.amber;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = node.isAmber ? COLORS.amber : COLORS.grayLight;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  drawTypography(ctx);

  return canvas;
}

// Variant 7: Vertical Lines
function generateVariant7() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  resetSeed(600);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Lines get denser toward right
  for (let x = 50; x < WIDTH; x += 8 + (1 - x / WIDTH) * 20) {
    const opacity = 0.1 + (x / WIDTH) * 0.4;
    const isAmber = seededRandom() > 0.92;

    ctx.strokeStyle = isAmber ? COLORS.amber : COLORS.gray;
    ctx.globalAlpha = isAmber ? opacity * 1.5 : opacity;
    ctx.lineWidth = isAmber ? 2 : 1;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  drawTypography(ctx);

  return canvas;
}

// Variant 10: Pure Minimal
function generateVariant10() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#080808');
  gradient.addColorStop(1, '#12100a');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawTypography(ctx);

  return canvas;
}

// Generate all missing variants
const variants = [
  { num: 2, fn: generateVariant2, name: 'Noise Texture' },
  { num: 3, fn: generateVariant3, name: 'Geometric Grid' },
  { num: 4, fn: generateVariant4, name: 'Halftone Fade' },
  { num: 5, fn: generateVariant5, name: 'Constellation' },
  { num: 7, fn: generateVariant7, name: 'Vertical Lines' },
  { num: 10, fn: generateVariant10, name: 'Pure Minimal' },
];

variants.forEach(({ num, fn, name }) => {
  const canvas = fn();
  const buffer = canvas.toBuffer('image/png');
  const path = join(outputDir, `og-variant-${num}.png`);
  writeFileSync(path, buffer);
  console.log(`✓ Variant ${num}: ${name}`);
});

console.log('\nAll variants generated!');
