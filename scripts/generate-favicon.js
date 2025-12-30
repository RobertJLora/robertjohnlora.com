import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public');

const COLORS = {
  background: '#080808',
  amber: '#E8A836',
  amberMuted: '#A67B28',
  white: '#FFFFFF',
  gray: '#505050',
  grayLight: '#888888',
};

let seed = 42;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function generateFavicon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  seed = 300; // Same seed as halftone variant

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, size, size);

  // Halftone dots - scaled for favicon size
  const spacing = Math.max(3, Math.floor(size / 40));

  for (let x = spacing / 2; x < size; x += spacing) {
    for (let y = spacing / 2; y < size; y += spacing) {
      // Size based on position - larger toward bottom-right
      const normalizedX = x / size;
      const normalizedY = y / size;
      const normalizedPos = (normalizedX + normalizedY) / 2;
      const dotSize = 0.5 + normalizedPos * (spacing * 0.4);

      // Dots everywhere - no exclusion zone

      ctx.fillStyle = seededRandom() > 0.88 ? COLORS.amber : COLORS.gray;
      ctx.globalAlpha = 0.3 + normalizedPos * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;

  // "RL" text - bold, centered
  const fontSize = Math.floor(size * 0.5);
  ctx.fillStyle = COLORS.white;
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RL', size / 2, size / 2 + fontSize * 0.03);

  return canvas;
}

// Generate multiple sizes
const sizes = [
  { size: 32, name: 'favicon-32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'favicon-192.png' },
  { size: 512, name: 'favicon-512.png' },
];

sizes.forEach(({ size, name }) => {
  const canvas = generateFavicon(size);
  const buffer = canvas.toBuffer('image/png');
  const path = join(outputDir, name);
  writeFileSync(path, buffer);
  console.log(`✓ ${name} (${size}x${size})`);
});

// Also create an SVG favicon for crisp scaling
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#080808"/>
  <text x="16" y="17" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="800" font-size="16" fill="#FFFFFF">RL</text>
  <circle cx="4" cy="4" r="1.5" fill="#505050" opacity="0.5"/>
  <circle cx="28" cy="4" r="1.5" fill="#E8A836" opacity="0.6"/>
  <circle cx="4" cy="28" r="1.5" fill="#505050" opacity="0.5"/>
  <circle cx="28" cy="28" r="2" fill="#E8A836" opacity="0.7"/>
  <circle cx="8" cy="28" r="1.8" fill="#505050" opacity="0.5"/>
  <circle cx="28" cy="8" r="1.8" fill="#505050" opacity="0.5"/>
  <circle cx="24" cy="28" r="1.8" fill="#E8A836" opacity="0.6"/>
  <circle cx="28" cy="24" r="1.8" fill="#505050" opacity="0.5"/>
</svg>`;

writeFileSync(join(outputDir, 'favicon.svg'), svgContent);
console.log('✓ favicon.svg (vector)');

console.log('\nAll favicons generated!');
