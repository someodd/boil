# ARCHITECTURE

## Purpose

This document defines structural constraints that preserve clarity, replaceability, and correctness.

Architecture is not aesthetic. It is a control mechanism.

---

## Core Principle

> Systems must remain small enough to be understood and composed (how-i-publish.gopher.md).

---

## Design Goals

- **Knowability** — understandable in one mind
- **Replaceability** — components can be swapped
- **Stability** — interfaces remain consistent
- **Isolation** — failures do not cascade

---

## Interfaces

> Interfaces are promises. (how-i-publish.gopher.md)

Winograd & Flores (*Understanding Computers and Cognition*, 1986) observe that design is fundamentally about anticipating and managing **breakdowns** — moments where the tool ceases to be ready-to-hand and becomes an obstacle. Every interface is a site of potential breakdown. Clean interfaces minimize breakdown surface area.

Rules:

- define clear inputs and outputs
- document intent and invariants
- do not leak implementation details
- version carefully and minimally

---

## Separation of Concerns

- each module has a single responsibility
- modules should not depend on internal details of others
- avoid implicit coupling

---

## Law of Demeter

- only interact with direct dependencies
- do not reach through layers
- do not depend on internal structure of other modules

This prevents hidden coupling and signal corruption.

---

## Compositional Design

- prefer small, composable units
- prefer predictable transformations
- separate pure logic from effects where possible

(category theory translated into engineering terms)

---

## Stable Interfaces, Swappable Internals

- internals may change freely
- interfaces must remain stable
- improvements should not break contracts

---

## Locality

- keep related logic close together
- avoid unnecessary indirection
- avoid abstraction without purpose

---

## Anti-Patterns

- large, opaque modules
- implicit coupling
- over-abstraction
- architecture that exceeds human comprehension

---

## State & Data Preservation

User data lives in `localStorage` under a single key. It is the only persistent artifact of the user's relationship with the system. Losing it is a critical failure.

Rules:

- **Never drop fields.** When removing a feature, leave its state inert rather than deleting it from the schema. Dead fields cost nothing; lost data costs trust.
- **Always migrate forward.** When the state shape changes, `boot()` must fill missing fields with safe defaults so old state loads cleanly in new code.
- **Never rename the storage key** without a migration path from the old key.
- **Test the upgrade path.** Before finalizing a change that touches state, verify: old state loads in new code, new defaults are sensible, no field is silently dropped.

---

## Background Time Accounting

The app spends most of its life in a background tab. Three mechanisms handle this, and all three are load-bearing:

- **`reconcileTask(t, now)`** — On resume, replays elapsed time through phase boundaries. Must credit exactly the time that passed — no more, no less.
- **`visibilitychange` handler** — Fires when the user returns. Runs reconciliation, updates UI, shows reopen toast.
- **`schedMidnight()` / ticker** — Catches day rollover even if the tab was asleep. Resets tasks for the new day.

For the product principles behind these mechanisms, see PRODUCT.md: Background Resilience.

---

## Constraints

> Constraints are not limitations. They are design tools. (how-i-publish.gopher.md)

Christopher Alexander (*Notes on the Synthesis of Form*, 1964; *A Pattern Language*, 1977) argued that good design emerges from the interaction of well-chosen constraints, not from unconstrained freedom. The single-file constraint, the no-framework constraint, the no-backend constraint — these are not limitations on what boil can become but generators of what it must be. Each constraint eliminates a class of accidental complexity and forces the system toward essential simplicity.

The same principle operates in the Rule of St. Benedict: fixed hours, limited possessions, defined routines — constraints that do not restrict the monks but create the conditions under which contemplative work can happen. Monastic rule is an architecture document. The poverty of means creates the richness of attention.

- single-file bias where practical
- minimal dependencies
- local-first design

---

## Practical Rule

Before adding complexity:

Ask:

- does this improve clarity?
- does this improve replaceability?
- does this preserve contracts?

If not, do not add it.
