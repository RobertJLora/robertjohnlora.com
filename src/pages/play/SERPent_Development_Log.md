# SERPent – Development Log

**File**: `src/pages/play/serpent.astro`
**URL**: [robertjohnlora.com/play/serpent](https://robertjohnlora.com/play/serpent)
**Built**: February 5, 2026
**Size**: 1,867 lines (single-file Astro component – HTML + CSS + JS, no dependencies)

---

## Overview

SERPent is a snake game built for SEOs. It lives on Robert's personal portfolio site as part of the `/play` hub alongside the halftone avatar generator, SEO keywords quiz, and Google algorithm update quiz. The entire game is self-contained in one `.astro` file with zero external dependencies – no frameworks, no libraries, no build-time JS imports. Everything is vanilla.

---

## Commit History

| Commit | Date | Description |
|--------|------|-------------|
| `388c2cb` | 2026-02-05 | Initial build – full game from scratch |
| `2fd3adb` | 2026-02-05 | Game over overlay polish – SERP rank visualization, staggered animations, text overlap fix |
| `2639091` | 2026-02-05 | Achievement toast moved inside canvas as horizontal slide-down bar |

Also updated `src/pages/play/index.astro` in the initial commit to add SERPent to the `/play` hub page.

---

## Architecture

### Single-File Structure

```
serpent.astro
├── Astro frontmatter (Layout import)
├── HTML (~55 lines)
│   ├── Score bar (score, best, combo, speed)
│   ├── Canvas wrapper (400×400 game canvas + overlay + toast)
│   ├── Controls hint
│   ├── Theme selector
│   ├── Meta bar (Stats/Achievements buttons + streak)
│   ├── Collapsible panels (stats, achievements)
│   └── Milestone message
├── Scoped CSS (~10 lines, back-link only)
├── Global CSS (~510 lines)
│   ├── CSS variables (design tokens)
│   ├── Keyframe animations (8 total)
│   ├── Layout components
│   ├── Overlay states (start screen, game over, pause)
│   ├── Toast styles
│   ├── Panel/grid styles
│   └── Mobile responsive (440px breakpoint)
└── Script (~1,290 lines, IIFE)
    ├── Constants & DOM refs
    ├── Retina canvas setup
    ├── Theme system
    ├── Achievement definitions
    ├── Persistence (localStorage)
    ├── Streak tracking
    ├── Audio engine (Web Audio API)
    ├── Music engine (ambient generative)
    ├── Particle system
    ├── Floating text system
    ├── Screen shake
    ├── Freeze frames
    ├── Flash effects
    ├── Game state & tick logic
    ├── Collision detection
    ├── Game events (eat, death)
    ├── Milestone system
    ├── Achievement toast queue
    ├── Overlay rendering
    ├── Score messages (SEO-themed)
    ├── Game over screen (SERP rank vis)
    ├── Start screen
    ├── Konami code
    ├── Calendar surprises
    ├── Rendering pipeline
    ├── UI updates
    ├── Theme selector builder
    ├── Stats/achievements panels
    ├── Input handling (keyboard + touch)
    ├── Game loop (requestAnimationFrame)
    └── Initialization
```

### Key Design Decisions

* **No framework** – Vanilla JS in an IIFE. No React, no Svelte, no state library. Just `var` declarations and DOM manipulation. Keeps the game instant-loading with zero bundle overhead.

* **Canvas rendering** – All gameplay rendered on a 400×400 `<canvas>` element with retina support (`devicePixelRatio` scaling). Grid lines, snake, food, particles, floating text, vignette – all drawn per frame.

* **HTML overlay system** – Start screen, pause, and game over states use an absolutely-positioned `<div>` overlay on top of the canvas rather than drawing text on canvas. This allows CSS animations and easier text layout.

* **Single localStorage key** – All persistence (`snakeUltimate`) lives in one JSON blob: stats, achievements, milestones, theme preference, music preference.

---

## Game Mechanics

### Core Loop

* 20×20 grid, 20px cells, 400×400 canvas
* Snake starts at center, moving right, length 3
* Speed increases with score: `interval = max(70, 120 - score * 3)` ms per tick
* Speed level displayed as 1-20 scale
* Max 3 ticks processed per animation frame to prevent spiral-of-death lag

### Combo System

* 3-second window between food pickups to maintain combo
* Combo multiplier directly adds to score (combo x5 = +5 points per food)
* Visual/audio milestones every 5x combo (particles, shake, sound, floating text)
* Best combo tracked per game and lifetime

### Collision

* Wall collision and self collision tracked separately
* Death type determines which stat increments
* Each death triggers: 20 particles, max screen shake, 8 freeze frames, flash, death sound

### Scoring Messages (SEO-Themed)

| Score | Message |
|-------|---------|
| 0 | "Crawl error." |
| 1-10 | "Noindexed." |
| 11-25 | "Page 2. So close." |
| 26-50 | "Indexed and climbing." |
| 51-99 | "Top 10 material." |
| 100+ | "Position #1." |

---

## Visual Systems

### Particle System

* Spawns at food/death locations with configurable count, speed, color
* Physics: velocity with drag (0.96 multiplier per frame)
* Fade based on remaining life ratio
* Used for: eating food (8 particles), combo milestones (15), death (20), Konami (100), New Year's (90)

### Floating Text

* "+1", "+5", "COMBO x10!" etc. rise from event locations
* Eased scale-in animation (bounce overshoot)
* Fade out over 0.8 seconds
* Font size scales with multiplier value

### Screen Shake

* Trauma-based system: trauma² = intensity, decays by 0.9 per frame
* Random offset applied to canvas translation
* Eating: 0.2 trauma. Combo milestone: 0.4. Death: 1.0 (full shake). Konami: 0.6.

### Freeze Frames

* Pauses game ticks but continues rendering (particles still move)
* Eating: 2 frames. Combo milestone: 4. Death: 8.

### Flash Effect

* Full-canvas color overlay with exponential decay (0.88 per frame)
* White flash on eat. White flash on death. Gold flash on new high score. Magenta on Konami.

### Vignette

* Radial gradient overlay rendered every frame
* Transparent center → 40% black at edges
* Adds depth/focus to gameplay area

### Dynamic Snake Color (Classic Theme)

| Score | Body | Head |
|-------|------|------|
| 0-9 | Green (#10b981) | Light green (#34d399) |
| 10-19 | Teal (#14b8a6) | Light teal (#2dd4bf) |
| 20-29 | Cyan (#06b6d4) | Light cyan (#22d3ee) |
| 30-39 | Blue (#3b82f6) | Light blue (#60a5fa) |
| 40+ | Purple (#8b5cf6) | Light purple (#a78bfa) |

### Canvas Rendering Pipeline (per frame)

1. Save context, apply shake offset
2. Clear/trail: idle → full clear, playing → 25% opacity fill (motion trail)
3. Full clear every 120 frames to prevent artifact buildup
4. Draw grid lines (8% opacity)
5. Calendar-specific effects (Christmas snowflakes)
6. Render food (pulsing glow, shadow)
7. Render snake (back-to-front, rounded rects, glow shadows)
8. Render particles
9. Render floating texts
10. Apply vignette gradient
11. Apply flash overlay
12. Restore context

---

## Theme System

7 themes total. 2 unlocked by default via Konami code, rest by gameplay milestones.

| Theme | Colors | Unlock Requirement |
|-------|--------|--------------------|
| Classic | Green snake, amber food, dark blue bg | Default |
| Neon | Cyan snake, magenta food, dark purple bg | Score 30+ |
| Sunset | Orange snake, gold food, dark red bg | Score 50+ |
| Arctic | Sky blue snake, white food, navy bg | 25 games played |
| Blood Moon | Red snake, gold food, dark crimson bg | 50 games played |
| Matrix | Green snake, light green food, dark green bg | Konami code |
| Party | Rainbow snake (hue-cycling), magenta food, purple bg | Konami code |

* Theme selector renders as color circles below the canvas
* Locked themes show a padlock emoji, 60% opacity
* Active theme has white border
* Selection persisted to localStorage

---

## Achievement System

### 14 Achievements

| Key | Name | Description | Trigger |
|-----|------|-------------|---------|
| firstBlood | First Blood | Eat your first food | totalFoodEaten === 1 |
| combo5 | Combo Master | Reach a 5x combo | combo >= 5 |
| combo10 | Unstoppable | Reach a 10x combo | combo >= 10 |
| score25 | Quarter Century | Score 25 points | score >= 25 |
| score50 | Half Century | Score 50 points | score >= 50 |
| score100 | Century | Score 100 points | score >= 100 |
| games10 | Getting Hooked | Play 10 games | totalGames >= 10 |
| games50 | Dedicated | Play 50 games | totalGames >= 50 |
| games100 | Obsessed | Play 100 games | totalGames >= 100 |
| nightOwl | Night Owl | Play between midnight and 5 AM | Hour check on game start |
| speedDemon | Speed Demon | Reach maximum speed | interval <= 70ms |
| konami | ↑↑↓↓←→←→BA | Enter the code | Konami sequence completed |
| streak7 | Weekly Warrior | 7-day play streak | currentStreak >= 7 |
| wallHugger | Wall Hugger | Hit a wall 10 times | deathsByWall >= 10 |
| selfDestruct | Self Destruct | Hit yourself 10 times | deathsBySelf >= 10 |

### Toast Notification System

* Queue-based: multiple achievements earned simultaneously are shown one after another
* Toast slides down from top of canvas as a thin horizontal bar (icon + name + description inline)
* Displays for 2.5 seconds, then slides back up
* 400ms gap between consecutive toasts
* `pointer-events: none` so it doesn't block gameplay
* Contained inside `.sg-canvas-wrapper` (clipped by `overflow: hidden`)

### Achievements Panel

* Toggled by "Achievements" button below game
* 2-column grid of all 14 achievements
* Earned achievements at full opacity; unearned at 35%
* Each shows icon, name, and description

---

## Audio System

### Web Audio API Sound Effects

All sounds generated programmatically – no audio files.

| Sound | Trigger | Type | Character |
|-------|---------|------|-----------|
| Eat | Food collected | Triangle wave, pitch rises with combo | Quick chirp |
| Death | Game over | Sawtooth, 440→50 Hz sweep | Descending buzz |
| Combo milestone | Every 5x combo | Three square wave notes (C-E-G) | Ascending arpeggio |
| Turn click | Direction change | Square wave, 800 Hz | Subtle tick |
| High score | New personal best | Three triangle notes (D-F#-A) | Triumphant chord |

### Generative Ambient Music

Toggleable with M key. Persisted preference in localStorage.

* **Pad layer**: Two detuned sawtooth oscillators at 55 Hz (±10 cents) through a low-pass filter with LFO modulation (0.08 Hz, ±150 Hz sweep). Creates a warm, breathing drone.
* **Noise layer**: White noise through bandpass filter at 2 kHz, very quiet (0.02 gain). Adds subtle texture/air.
* **Arp layer**: Random pentatonic notes (A2-E4) played as triangle waves every 2-6 seconds. Each note fades in over 300ms and decays over 1.5 seconds. Creates a sparse, ambient melody.
* 2-second fade-in on start, 1-second fade-out on stop

---

## Persistence

### localStorage Schema (`snakeUltimate`)

```json
{
  "totalGames": 0,
  "totalScore": 0,
  "highScore": 0,
  "totalMoves": 0,
  "deathsByWall": 0,
  "deathsBySelf": 0,
  "longestCombo": 0,
  "totalFoodEaten": 0,
  "currentStreak": 0,
  "longestStreak": 0,
  "lastPlayDate": "20260205",
  "firstPlayed": 1738749000000,
  "konami": false,
  "achievements": {},
  "milestonesShown": {},
  "activeTheme": "classic",
  "musicMuted": false
}
```

### Streak System

* Tracks consecutive days played using `YYYYMMDD` format
* Compares against yesterday's date to determine streak continuation
* Displayed as "🔥 X day streak" below the game
* 7-day streak unlocks "Weekly Warrior" achievement

---

## Milestone Messages

Context-sensitive messages that appear below the game panel for 5 seconds. Each only shows once (tracked in `milestonesShown`).

| Trigger | Message |
|---------|---------|
| First game ever | "Every journey starts somewhere." |
| 10th game | "You're getting the hang of this." |
| 50th game | "50 games. You could've learned 3 chords on guitar by now. But this is better." |
| 100th game | "Triple digits. Respect." |
| Doubled previous best | "You just doubled your best. That's not luck." |
| Return after 30+ days | "Welcome back. The snake waited." |
| First 5x combo | "Now you're cooking." |

---

## Secret Features

### Konami Code

Sequence: ↑ ↑ ↓ ↓ ← → ← → B A

* Works at any time (even during gameplay)
* One-time reward: unlocks Matrix and Party themes
* Visual celebration: 100 magenta particles, 0.6 shake, 0.4 magenta flash, combo milestone sound
* Tracked in stats as `konami: true`
* Input tracking resets if wrong key pressed (but re-starts if the wrong key is the first key of the sequence)

### Calendar Surprises

Checked once on page load. Visual-only, no gameplay changes.

| Date | Effect |
|------|--------|
| December 25 | Food alternates red/green every 30 frames |
| October 31 | Food turns orange |
| February 14 | Food turns pink with enhanced glow |
| January 1 | 90 particles burst from top-center (gold, red, blue) |

---

## Game Over Screen

Redesigned in commit `2fd3adb` with staggered entrance animations:

1. **"Game Over" label** – fades up (0s delay)
2. **Score number** – drops in with bounce (0.1s delay, custom `sgScoreDrop` keyframes)
3. **"New Best!" badge** – fades up + gold pulse glow (0.3s delay, only if new high)
4. **SERP rank visualization** – three horizontal bars representing #1, You, #3 positions. Bar widths calculated relative to high score. Your bar uses green→blue gradient. Bars animate from 0 width (0.4-0.6s delays). Position labels slide in from left (0.6s delay).
5. **SEO quip** – fades up (0.5s delay)
6. **Best combo stat** – fades up (0.6s delay, only if combo >= 2)
7. **"Space to Restart"** – fades up + blue pulse glow (0.8s delay)

---

## Input Handling

### Keyboard

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Change direction |
| Space | Start / Restart / Pause toggle |
| P | Pause toggle |
| M | Music toggle |
| Konami sequence | Unlock secret themes |

* Direction input buffering: stores up to 2 pending directions (nextDirection + pendingDirection)
* Anti-180: can't reverse direction directly (e.g., moving right → can't go left)
* Input responsiveness: if >60% of current tick interval has elapsed when you press a direction key, the tick accumulator is bumped to trigger the next tick sooner

### Touch

* Swipe detection on canvas element (threshold: 30px)
* Tap (< 30px movement): Start / Restart / Pause toggle
* Horizontal swipe > vertical: Left/Right
* Vertical swipe > horizontal: Up/Down
* `touchstart` and `touchmove` use `{ passive: false }` with `preventDefault()` to block page scrolling during play

---

## CSS Architecture

### Design Tokens

```
--sg-bg-primary:    #0f172a  (main background)
--sg-bg-secondary:  #1e293b  (panels, cards)
--sg-bg-tertiary:   #334155  (inputs, score bar)
--sg-text-primary:  #f1f5f9  (headings, values)
--sg-text-secondary:#94a3b8  (body text)
--sg-text-muted:    #64748b  (labels, hints)
--sg-accent-blue:   #3b82f6  (SERP gradient start)
--sg-accent-green:  #10b981  (SERP gradient end, classic snake)
--sg-accent-orange: #f59e0b  (achievements, food)
--sg-accent-red:    #ef4444  (errors, blood moon)
--sg-border:        #475569  (borders, dividers)
```

### Keyframe Animations (8)

| Name | Used For |
|------|----------|
| `sgFadeSlideUp` | Start screen elements entrance |
| `sgPulseGlow` | "Press Space" prompt breathing glow |
| `sgSnakeSlither` | Start screen snake art bobbing |
| `sgOverlayDismiss` | Overlay fade-out with slight scale |
| `sgScoreDrop` | Game over score number bounce-in |
| `sgFadeUp` | Game over elements staggered entrance |
| `sgSlitherIn` | SERP rank position labels slide-in |
| `sgRankBar` | SERP rank bars width animation |

### Responsive

Single breakpoint at 440px:
* Container padding: 24px → 12px
* Title: 2.8rem → 2rem
* Score bar padding reduced
* Achievement/stats grids collapse to single column

---

## Stats Panel

Toggled by "Stats" button. 2-column grid showing 10 lifetime stats:

* Games Played
* High Score
* Total Score
* Food Eaten
* Longest Combo
* Total Moves
* Wall Deaths
* Self Deaths
* Current Streak (days)
* Best Streak (days)

---

## Performance Notes

* Retina support: canvas internally renders at `400 * devicePixelRatio` and scales down via CSS
* Motion trail effect: instead of clearing canvas fully each frame, a 25% opacity background fill creates the trail. Full clear every 120 frames prevents long-term artifact buildup.
* `image-rendering: pixelated` on canvas for crisp pixel edges
* All audio uses Web Audio API oscillators (no file loading, no decoding latency)
* Particle/floating text arrays use splice-from-end iteration for safe removal during update loops

---

## What's Not Here (By Design)

* No leaderboard or server-side anything – fully client-side
* No difficulty selector – speed auto-scales with score
* No power-ups or special food types – pure snake mechanics
* No tutorial – the start screen and controls hint are enough
* No settings menu – M for music, P for pause, themes below canvas
* No analytics or tracking on the game itself
