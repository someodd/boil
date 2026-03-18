# CLAUDE.md — boil

## What this is
A single-file PWA time-blocking app with a water/heat metaphor. Everything lives in `boil.html` — HTML, CSS, JS, inline PWA manifest. No build step, no framework, no dependencies.

## Design manifesto
- Warm, not cool. Physical, not digital.
- Punishing, not forgiving. One metaphor, committed fully.
- The water is the product. Everything else is seasoning.
- Subtract before adding. If it doesn't serve heat, cut it.
- No accounts. No sync. No analytics. No settings page.
- One file. Honest, portable, hackable.
- Copy should sound human, never like software.
- Every feature earns its place or gets boiled off.

## Architecture
- **Single file**: `boil.html` (~2700 lines). Do not split into multiple files.
- **State**: `S` object stored in `localStorage` under key `boil-v1`. Saved on every tick, visibility change, and page unload.
- **Rendering**: Direct DOM manipulation. `render()` rebuilds everything. `fastUpdateAll()` does per-second incremental updates (timers, fill levels) without full re-render. `renderCard(t)` replaces a single card.
- **Water engine**: Canvas-based. `waveLoop()` runs via rAF when a task is running. Drives both the 36x36 pip canvas (per-task) and the full-screen background canvas. Fourier harmonics for surface, bubble pool system with nucleation physics.
- **Particles**: Separate FX canvas (`#fx`) at z-index 999 for confetti, shatter, sparks. Uses `P` class with gravity, rotation, bounce.
- **Audio**: Web Audio API. Procedural tones, no audio files.
- **Haptics**: `navigator.vibrate()` patterns throughout.

## Key state fields
- `S.tasks[]` — array of task objects (id, name, color, total blocks, workDur, restDur, completed, rem, running, isRest, done, savedAt, pauseCount, perfectBlocks)
- `S.startTs` — day start timestamp (null = show begin screen)
- `S.continuous` — auto-advance through blocks without pausing
- `S.streak`, `S.lastCompletedDate`, `S.bestScore`, `S.lifetimeCoins`, `S.stars`
- `S.shopItems` — purchased customizations (avatar, theme)

## Important patterns
- `reconcileTask(t, now)` — catches up elapsed time on resume, looping through multiple phase completions. Used in both `boot()` and `visibilitychange`.
- `resolvePhaseEnd(t, animate)` — handles work→rest→next-block transitions. Returns true if task fully done.
- `DEBUG_FAST` constant — set to `true` to make 1 minute = 1 second for testing.
- Date rollover checked in: visibilitychange handler, ticker interval, and `schedMidnight()` timeout.

## What NOT to do
- Do not split into multiple files or add a build step
- Do not add a framework (React, Vue, etc.)
- Do not add accounts, auth, or server-side anything
- Do not add tooltips, onboarding carousels, or "Did you know?" prompts
- Do not add comments/docstrings to code you didn't change
- Do not refactor working code for "cleanliness" unless asked
- Do not add features that don't serve the heat/water metaphor
- Do not make the streak system more forgiving (the punishment is a feature)
- Streak maintenance threshold is 70% block completion — this is intentional

## Fonts
- Display: Syne (700, 800) — loaded from Google Fonts
- Body: Plus Jakarta Sans (400–800) — loaded from Google Fonts

## Color system
- Warm neutrals: `--bg:#f5f0e8`, `--card:#faf8f4`, `--brd:#e2dbd0`
- Text: `--ink:#1c1917`, `--mid:#6b6258`, `--dim:#a89e92`
- Task colors from `PAL` array (10 colors)
- Rest phase: `#2e9e6a` (green)
- Danger/urgency: `#c0453a` (red)
