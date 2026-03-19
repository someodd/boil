# CLAUDE

## Purpose

This file defines how Claude should operate when working on this repository.

This is a **single-file system with strict constraints** and a **strong product philosophy**.  
Changes must preserve both.

---

## Priority Order

When making decisions, follow this order:

1. docs/PRODUCT.md
2. docs/CYBERNETICS.md
3. docs/ARCHITECTURE.md
4. docs/VERIFICATION.md
5. This file (CLAUDE.md)
6. README.md

---

## What this is

A single-file PWA time-blocking app with a water/heat metaphor. Everything lives in `boil.html`.

- No build step
- No framework
- No dependencies
- No backend
- No accounts

---

## Core Product Principle

> The system exists to help the user **start, stay with, and return to meaningful work**.

NOT to:
- maximize streaks
- maximize engagement
- maximize feature count

---

## Real vs Proxy Signals

Claude must understand:

### Real (optimize for)
- user starts tasks quickly
- user continues tasks
- user completes or meaningfully progresses work
- user returns after interruption

### Proxy (do NOT optimize for)
- streaks
- coins / stars / badges
- number of blocks
- time spent in app

(see docs/CYBERNETICS.md)

---

## Responsibilities

Claude must:

- preserve product intent (docs/PRODUCT.md)
- avoid proxy optimization (docs/CYBERNETICS.md)
- maintain architectural clarity (docs/ARCHITECTURE.md)
- respect invariants (docs/VERIFICATION.md)
- preserve the water/heat metaphor

---

## Before Writing Code

Claude must:

- understand the purpose of the change
- identify affected invariants
- identify affected interfaces
- check alignment with PRODUCT.md
- check for Goodhart risks (CYBERNETICS.md)

---

## While Writing Code

Claude should:

- prefer small, targeted changes
- preserve existing contracts
- avoid unnecessary abstraction
- maintain separation of concerns
- keep the system understandable in one pass

---

## Evaluation Checklist

Before finalizing any change:

- Does this improve real user outcomes?
- Does this reduce friction to start work?
- Does this help continuation or recovery?
- Does this increase cognitive load?
- Does this introduce a proxy metric risk?
- Does this preserve architectural clarity?

---

## Forbidden Optimizations

Claude must NOT optimize for:

- code size
- feature count
- number of tests alone
- gamification metrics
- visual complexity for its own sake

---

## Allowed Tradeoffs

Prefer:

- simple over optimal
- clear over clever
- sufficient over maximal
- embodied feedback over dashboards

---

## When Unsure

Claude should:

- ask for clarification
- default to simplicity
- avoid introducing new systems
- avoid expanding scope

---

# --- EXISTING SYSTEM (PRESERVED) ---

## Design manifesto

- Warm, not cool. Physical, not digital.
- Punishing, not forgiving.
- The water is the product.
- Subtract before adding.
- One file. Honest, portable, hackable.
- Copy should sound human.
- Every feature earns its place or gets boiled off.

⚠️ NOTE:
“Punishing” must NOT override product intent.
Avoid streak-shame or system abandonment (see PRODUCT.md).

---

## Architecture

- **Single file**: `boil.html` (~2700 lines). Do not split into multiple files.
- **State**: `S` object stored in `localStorage` under key `boil-v1`. Saved on every tick, visibility change, and page unload.
- **Rendering**: Direct DOM manipulation. `render()` rebuilds everything. `fastUpdateAll()` does per-second incremental updates (timers, fill levels) without full re-render. `renderCard(t)` replaces a single card.
- **Water engine**: Canvas-based. `waveLoop()` runs via rAF when a task is running. Drives both the 36x36 pip canvas (per-task) and the full-screen background canvas. Fourier harmonics for surface, bubble pool system with nucleation physics.
- **Particles**: Separate FX canvas (`#fx`) at z-index 999 for confetti, shatter, sparks. Uses `P` class with gravity, rotation, bounce.
- **Audio**: Web Audio API. Procedural tones, no audio files.
- **Haptics**: `navigator.vibrate()` patterns throughout.

## Fonts

- Display: Syne (700, 800) — loaded from Google Fonts
- Body: Plus Jakarta Sans (400–800) — loaded from Google Fonts

## Color system

- Warm neutrals: `--bg:#f5f0e8`, `--card:#faf8f4`, `--brd:#e2dbd0`
- Text: `--ink:#1c1917`, `--mid:#6b6258`, `--dim:#a89e92`
- Task colors from `PAL` array (10 colors)
- Rest phase: `#2e9e6a` (green)
- Danger/urgency: `#c0453a` (red)

---

## Key state fields

- `S.tasks[]` — array of task objects (id, name, color, total blocks, workDur, restDur, completed, rem, running, isRest, done, savedAt, pauseCount, perfectBlocks)
- `S.startTs` — day start timestamp (null = show begin screen)
- `S.continuous` — auto-advance through blocks without pausing
- `S.streak`, `S.lastCompletedDate`, `S.bestScore`, `S.lifetimeCoins`, `S.stars`
- `S.shopItems` — purchased customizations (avatar, theme)
- `S.mercyCoins` — consumable mercy coins (skip a block)
- `S.daysCompleted` — counter for progressive disclosure (0=first day, hides coins/shop/streak)
- `S.seen` — object tracking first-occurrence contextual toasts
- `S.isTrial` — true during first-run trial task flow
- `t.days` — optional array of day numbers (0=Sun..6=Sat), null = every day

---

## Important patterns

- `reconcileTask(t, now)` — catches up elapsed time on resume, looping through multiple phase completions. Used in both `boot()` and `visibilitychange`.
- `resolvePhaseEnd(t, animate)` — handles work→rest→next-block transitions. Returns true if task fully done.
- `GOD_MODE` constant — set to `true` for 1min=1sec, free shop, infinite coins/stars. Shows a "god mode" badge.
- Date rollover checked in: visibilitychange handler, ticker interval, and `schedMidnight()` timeout.

---

## What NOT to do

- do not split into multiple files
- do not add frameworks
- do not add accounts or backend
- do not add onboarding clutter
- do not refactor for cleanliness without reason
- do not break the metaphor

### Updated constraint

- do not add features that optimize **metrics over real work**

---

## Additional Guardrails

- The system must remain **cognitively lightweight**
- The system must work under **interruption and instability**
- The system must favor **continuation over perfection**

---

## Final Rule

> Do not optimize for appearances. Optimize for real outcomes.
