# Image Generation Scripts

Scripts for generating OG images and favicons for robertjohnlora.com.

## Design System

**Style:** Halftone Fade – graduated dot pattern that gets denser/larger toward the edges. Dark background (#080808) with gray dots and occasional amber (#E8A836) accents.

**Typography:** System font stack (`system-ui, -apple-system, sans-serif`) renders as San Francisco on Mac – matches Apple Notes aesthetic.

## Scripts

### generate-og-image.js

Generates the main social sharing image at 1200×630px.

```bash
node scripts/generate-og-image.js
```

**Output:** `public/og-image.png`

**Features:**
* Dense dot field (12,000 dots) with radial concentration
* Left-aligned typography: "Robert Lora" (72px bold) + "search · strategy · growth" tagline
* Amber dot separators between tagline words
* Subtle amber accent line below text

### generate-favicon.js

Generates favicon set with matching halftone style + "RL" initials.

```bash
node scripts/generate-favicon.js
```

**Output:**
* `public/favicon.svg` – Vector, crisp at any size
* `public/favicon-32.png` – Legacy browsers
* `public/apple-touch-icon.png` – iOS home screen (180×180)
* `public/favicon-192.png` – Android/PWA
* `public/favicon-512.png` – PWA splash

### generate-all-variants.js

Generates alternative OG image designs for A/B testing or future use.

```bash
node scripts/generate-all-variants.js
```

**Output:** `public/og-variant-{1-10}.png`

**Variants:**
1. Gradient Nebula
2. Noise Texture
3. Geometric Grid
4. Halftone Fade ← current default
5. Constellation
6. Concentric Rings
7. Vertical Lines
8. Particle Burst
9. Bokeh Lights
10. Pure Minimal

## Dependencies

```bash
npm install @napi-rs/canvas --save-dev
```

## Regenerating Images

After making changes to any script:

```bash
node scripts/generate-og-image.js
node scripts/generate-favicon.js
git add public/
git commit -m "Regenerate images"
git push
```

Cloudflare Pages auto-deploys on push.
