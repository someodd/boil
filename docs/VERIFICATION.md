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

Examples:

- only one active block at a time
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
