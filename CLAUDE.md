# CLAUDE

## Purpose

This file defines how Claude should operate when working on this repository.

This is a **single-file system with strict constraints** and a **strong product philosophy**.  
Changes must preserve both.

**Note on register:** The supporting documents are written in an academic register with theoretical citations. This is deliberate. LLMs calibrate reasoning rigor to match input register (tone-matching). The theoretical density produces more careful reasoning about product decisions than equivalent content written as bullet-point checklists. When maintaining or extending these documents, preserve the academic tone.

---

## Priority Order

When making decisions, follow this order:

1. @docs/PRODUCT.md
2. @docs/CYBERNETICS.md
3. @docs/ARCHITECTURE.md
4. @docs/VERIFICATION.md
5. @docs/NEUROSCIENCE.md
6. This file (CLAUDE.md)
7. README.md

---

## What this is

A single-file PWA time-blocking app with a water/heat metaphor. Everything lives in `boil.html`.

- No build step
- No framework
- No dependencies
- No backend
- No accounts

To run: open `boil.html` directly in a browser. No build step, no server.

---

## Core Product Principle

> The system exists to help the user **start, stay with, and return to meaningful work**.

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
- do not add onboarding clutter

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

## Design Manifesto

See docs/PRODUCT.md: Manifesto.

---

## Architecture

See docs/ARCHITECTURE.md. Single file: `boil.html` (~2700 lines). Do not split.

## Fonts

See `boil.html` `<head>` for font declarations (Syne display, Plus Jakarta Sans body).

## Color system

See `boil.html` CSS custom properties. Warm neutrals, task colors from `PAL` array.

---

## Key state fields

> Canonical state shape is in `boot()`. This section is a quick reference.

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

## Final Rule

> Do not optimize for appearances. Optimize for real outcomes.
