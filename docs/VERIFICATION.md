# VERIFICATION

## Purpose

This document defines how correctness is ensured.

Verification prevents the system from appearing correct while being wrong.

---

## Core Principle

Prefer guarantees over assumptions.

---

## Verification Ladder

### 1. Proof (strongest)

Where possible:

- encode invariants in types
- use refinement types (e.g. LiquidHaskell)

---

### 2. Property Testing

- test behavior across wide input space
- prefer properties over examples

---

### 3. Example Testing

- test known cases
- ensure expected outputs

---

### 4. Observation (weakest)

- runtime behavior
- telemetry
- logs

---

## Invariants

### Project-specific invariants (boil)

- Only one task may have `running: true` at a time.
- `reconcileTask` must credit exactly the elapsed time — no more (gifting unearned progress), no less (losing real work).
- A paused task in a background tab must not advance. Absence is not work.
- After reconciliation, the UI must immediately reflect the true state. No stale screens.
- `S.tasks` array order is the user's chosen order. Never silently reorder.
- State must survive code changes (see ARCHITECTURE.md: State & Data Preservation).
- Only one task may be in a rest phase at a time (rest follows the running task's block completion).
- Day rollover must reset daily task state without losing lifetime data (coins, shop items, streak).

### General invariant patterns

- time progresses monotonically
- block completion is consistent with elapsed time
- transitions preserve state integrity

---

## Contracts

Each module must define:

- what it guarantees
- what it assumes
- what must never happen

---

## Property Examples

- starting a block eventually leads to completion or interruption
- elapsed time matches visual state
- transitions do not corrupt data

---

## Anti-Patterns

- relying only on example tests
- testing outputs without testing behavior
- assuming correctness without constraints

---

## Practical Rule

If behavior is critical:

- encode it in a type or invariant if possible
- otherwise, write a property test
