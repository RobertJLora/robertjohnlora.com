import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: '#0a0a0a',
  amber: '#D4963D',
  amberLight: '#E8A836',
  white: '#FFFFFF',
  gray: '#707070',
};

// Simple 2D Perlin-like noise using sine interpolation
let noisePermutation = [];
function initNoise() {
  for (let i = 0; i < 256; i++) {
    noisePermutation[i] = Math.floor(Math.random() * 256);
  }
  // Duplicate for wrapping
  noisePermutation = [...noisePermutation, ...noisePermutation];
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
  return a + t * (b - a);
}

function grad(hash, x, y) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 8 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlinNoise(x, y) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const n00 = grad(noisePermutation[noisePermutation[xi] + yi], xf, yf);
  const n10 = grad(noisePermutation[noisePermutation[xi + 1] + yi], xf - 1, yf);
  const n01 = grad(noisePermutation[noisePermutation[xi] + yi + 1], xf, yf - 1);
  const n11 = grad(noisePermutation[noisePermutation[xi + 1] + yi + 1], xf - 1, yf - 1);

  const nx0 = lerp(u, n00, n10);
  const nx1 = lerp(u, n01, n11);
  return lerp(v, nx0, nx1);
}

// Generate continuous noise texture with fractal layers
function drawNoiseTexture() {
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  const data = imageData.data;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // Fractal Brownian Motion for richer texture
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxValue = 0;

      for (let octave = 0; octave < 5; octave++) {
        value += amplitude * perlinNoise(x * frequency * 0.005, y * frequency * 0.005);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }

      value /= maxValue;
      value = (value + 1) / 2; // Normalize to 0-1

      // Index in the image data
      const index = (y * WIDTH + x) * 4;

      // Base dark color
      let r = 10;
      let g = 10;
      let b = 10;

      // Add amber/gold noise (subtle)
      const amberInfluence = Math.pow(value, 2.2) * 0.25;
      const goldenNoise = Math.sin(x * 0.01 + y * 0.008) * 0.5 + 0.5;

      r += Math.floor(212 * amberInfluence * goldenNoise * 0.4);
      g += Math.floor(150 * amberInfluence * goldenNoise * 0.35);
      b += Math.floor(61 * amberInfluence * goldenNoise * 0.3);

      // Add slight grayscale noise for depth
      const grayNoise = value * 0.15;
      r += Math.floor(grayNoise * 100);
      g += Math.floor(grayNoise * 100);
      b += Math.floor(grayNoise * 100);

      // Clamp values
      r = Math.min(255, r);
      g = Math.min(255, g);
      b = Math.min(255, b);

      data[index] = r;      // Red
      data[index + 1] = g;  // Green
      data[index + 2] = b;  // Blue
      data[index + 3] = 255; // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Overlay darker gradient at bottom for depth
  const gradient = ctx.createLinearGradient(0, HEIGHT * 0.5, 0, HEIGHT);
  gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
  gradient.addColorStop(1, 'rgba(10, 10, 10, 0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Typography - left-aligned, asymmetric
function drawTypography() {
  const leftMargin = 80;

  // "Robert Lora" - white, bold, 72px
  ctx.fillStyle = COLORS.white;
  ctx.font = '700 72px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Robert Lora', leftMargin, HEIGHT / 2 - 25);

  // "search · strategy · growth" - gray, 24px
  ctx.fillStyle = COLORS.gray;
  ctx.font = '400 24px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';

  const taglineY = HEIGHT / 2 + 50;
  const taglineText = 'search · strategy · growth';
  ctx.fillText(taglineText, leftMargin, taglineY);

  // Amber accent line under tagline
  ctx.fillStyle = COLORS.amberLight;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(leftMargin, HEIGHT / 2 + 85, 80, 3);
  ctx.globalAlpha = 1;
}

// Main render
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Initialize noise
initNoise();

// Draw background and noise
ctx.fillStyle = COLORS.background;
ctx.fillRect(0, 0, WIDTH, HEIGHT);
drawNoiseTexture();

// Draw typography
drawTypography();

// Save to file
const buffer = canvas.toBuffer('image/png');
const outputPath = join(__dirname, '..', 'public', 'og-variant-2.png');
writeFileSync(outputPath, buffer);

console.log(`✓ Created: ${outputPath}`);
