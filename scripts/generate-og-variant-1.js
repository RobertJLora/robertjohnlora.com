import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  amber: '#E8A836',
  amberMuted: '#A67B28',
  white: '#FFFFFF',
  gray: '#505050',
  grayLight: '#888888',
  purple: '#2D1B4E',
  deepPurple: '#1A0F2E',
  black: '#000000',
};

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

let seed = 42;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Radial gradient from amber center to purple/black edges
function drawGradientBackground() {
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const maxRadius = Math.sqrt(WIDTH * WIDTH + HEIGHT * HEIGHT) / 2;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);

  // Gradient stops: amber center → deep purple/black edges
  gradient.addColorStop(0, COLORS.amber);
  gradient.addColorStop(0.3, '#6B5A2F');
  gradient.addColorStop(0.6, COLORS.purple);
  gradient.addColorStop(1, COLORS.black);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Sparse nebula particles (500-1000)
function drawNebula() {
  const numParticles = 750;
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const maxRadius = Math.max(WIDTH, HEIGHT) * 0.8;

  for (let i = 0; i < numParticles; i++) {
    // Distribute particles throughout canvas with slight central bias
    const angle = seededRandom() * Math.PI * 2;
    const radiusFactor = Math.pow(seededRandom(), 0.6); // Slight bias toward center
    const radius = radiusFactor * maxRadius;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    // Skip if outside canvas
    if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) continue;

    // Distance from center affects opacity
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const normalizedDist = Math.min(dist / maxRadius, 1);

    // Size variation - mostly small, some larger
    const sizeRand = seededRandom();
    let size;
    if (sizeRand > 0.98) size = 3;
    else if (sizeRand > 0.95) size = 2;
    else if (sizeRand > 0.85) size = 1.5;
    else size = 0.8;

    // Color variation - mostly whites/ambers, fading at edges
    const colorRand = seededRandom();
    let color;
    let opacity;

    if (colorRand > 0.92) {
      color = COLORS.amber;
      opacity = 0.8 * (1 - normalizedDist * 0.3);
    } else if (colorRand > 0.8) {
      color = COLORS.amberMuted;
      opacity = 0.6 * (1 - normalizedDist * 0.4);
    } else if (colorRand > 0.5) {
      color = COLORS.white;
      opacity = 0.5 * (1 - normalizedDist * 0.5);
    } else {
      color = COLORS.grayLight;
      opacity = 0.3 * (1 - normalizedDist * 0.6);
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
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
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(tagX, taglineY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
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
  drawGradientBackground();
  drawNebula();
  drawTypography();
}

render();

const buffer = canvas.toBuffer('image/png');
const outputPath = join(__dirname, '..', 'public', 'og-variant-1.png');
writeFileSync(outputPath, buffer);

console.log(`✓ Created: ${outputPath}`);
