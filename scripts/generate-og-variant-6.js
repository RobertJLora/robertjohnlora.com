import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const width = 1200;
const height = 630;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Dark background
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, width, height);

// Center offset to the right
const centerX = width * 0.75;
const centerY = height / 2;

// Draw concentric rings
const rings = [
  { radius: 400, color: '#d4a574', opacity: 0.15 },
  { radius: 350, color: '#6b7280', opacity: 0.2 },
  { radius: 300, color: '#d4a574', opacity: 0.12 },
  { radius: 250, color: '#6b7280', opacity: 0.18 },
  { radius: 200, color: '#d4a574', opacity: 0.1 },
  { radius: 150, color: '#6b7280', opacity: 0.15 },
  { radius: 100, color: '#d4a574', opacity: 0.12 },
];

// Draw rings from largest to smallest
rings.forEach(ring => {
  ctx.strokeStyle = ring.color;
  ctx.globalAlpha = ring.opacity;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
  ctx.stroke();
});

// Reset global alpha for text
ctx.globalAlpha = 1;

// Draw amber accent line under tagline
const lineX = 60;
const lineY = 280;
ctx.strokeStyle = '#d4a574';
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(lineX, lineY);
ctx.lineTo(lineX + 200, lineY);
ctx.stroke();

// Draw text
// "Robert Lora" - white, bold, 72px
ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'left';
ctx.fillText('Robert Lora', 60, 180);

// "search · strategy · growth" - gray, 24px
ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
ctx.fillStyle = '#9ca3af';
ctx.fillText('search · strategy · growth', 60, 300);

// Save the image
const outputDir = path.dirname('/Users/RobertLora/Documents/Claude Code Projects/02_Personal/robertjohnlora.com/public/og-variant-6.png');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/Users/RobertLora/Documents/Claude Code Projects/02_Personal/robertjohnlora.com/public/og-variant-6.png', buffer);

console.log('OG image variant created: og-variant-6.png');
