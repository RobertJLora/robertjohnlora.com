import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: '#080808',
  amber: '#E8A836',
  amberMuted: '#A67B28',
  white: '#FFFFFF',
  gray: '#505050',
  grayLight: '#888888',
};

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

let seed = 42;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Dense dot field with radial concentration
function drawDotField() {
  const numDots = 12000;
  const centerX = WIDTH * 0.7;  // Offset center to right
  const centerY = HEIGHT * 0.45;

  for (let i = 0; i < numDots; i++) {
    // Distribute with slight concentration toward offset center
    const angle = seededRandom() * Math.PI * 2;
    const maxRadius = Math.max(WIDTH, HEIGHT);
    const radius = Math.pow(seededRandom(), 0.7) * maxRadius;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    // Skip if outside canvas
    if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) continue;

    // Distance from concentration point affects size and opacity
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const normalizedDist = dist / maxRadius;

    // Size variation
    const sizeRand = seededRandom();
    let size;
    if (sizeRand > 0.995) size = 3.5;
    else if (sizeRand > 0.98) size = 2.5;
    else if (sizeRand > 0.9) size = 1.5;
    else if (sizeRand > 0.5) size = 1;
    else size = 0.5;

    // Color and opacity
    const colorRand = seededRandom();
    if (colorRand > 0.96) {
      ctx.fillStyle = COLORS.amber;
      ctx.globalAlpha = 0.85;
    } else if (colorRand > 0.9) {
      ctx.fillStyle = COLORS.amberMuted;
      ctx.globalAlpha = 0.6;
    } else if (colorRand > 0.6) {
      ctx.fillStyle = COLORS.grayLight;
      ctx.globalAlpha = 0.4;
    } else {
      ctx.fillStyle = COLORS.gray;
      ctx.globalAlpha = 0.25 + normalizedDist * 0.2;
    }

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

// Typography - asymmetric, left-aligned, strong hierarchy
function drawTypography() {
  const leftMargin = 80;

  // "Robert Lora" - THE anchor, large and bold
  ctx.fillStyle = COLORS.white;
  ctx.font = '700 72px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Robert Lora', leftMargin, HEIGHT / 2 - 20);

  // "search · strategy · growth" - secondary tagline below
  ctx.fillStyle = COLORS.grayLight;
  ctx.font = '400 24px system-ui, -apple-system, "Segoe UI", sans-serif';

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

  // Subtle amber accent line
  ctx.fillStyle = COLORS.amber;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(leftMargin, HEIGHT / 2 + 80, 60, 2);
  ctx.globalAlpha = 1;
}

// Main render
function render() {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawDotField();
  drawTypography();
}

render();

const buffer = canvas.toBuffer('image/png');
const outputPath = join(__dirname, '..', 'public', 'og-image.png');
writeFileSync(outputPath, buffer);

console.log(`✓ Created: ${outputPath}`);
