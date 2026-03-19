# CYBERNETICS

## Purpose

This document defines how the system avoids drifting away from real user outcomes.

It exists to prevent optimization of **proxies** instead of **reality**.

For what counts as real vs proxy, see PRODUCT.md.

---

## Core Principle

> When a measure becomes a target, it ceases to be a good measure. (Goodhart's Law)

All systems tend to drift toward optimizing representations instead of real outcomes (Mark Fisher, Žižek).

This document exists to resist that drift.

---

## Signal Drift

Signal drift occurs when:

- proxy metrics improve
- real outcomes stagnate or decline

Examples:
- more blocks created, fewer completed
- longer streaks, less meaningful work
- more usage, more overwhelm

---

## Drift Detection

Watch for:

- rising engagement + falling completion
- rising complexity + falling clarity
- increased features + reduced usability
- user abandonment after short use

---

## Requisite Variety (Stafford Beer)

The system must handle:

- interruptions
- fluctuating motivation
- emotional variation
- inconsistent schedules

Therefore:

- plans must be flexible
- recovery must be easy
- the system must not assume consistency

---

## Anti-Patterns

### Metric Capture (Fisher)
Treating metrics as reality.

### Symbolic Optimization (Žižek)
Optimizing appearances instead of outcomes.

### Single-Metric Systems
Leads to gaming and collapse (Cockshott, Soviet planning failures).

---

## Design Rules

- Metrics are **diagnostic tools**, not goals.
- All signals must remain **coupled to reality**.
- Systems must be evaluated against **real outcomes**, not dashboards.
- Assume all metrics will eventually be gamed.
- Never rely on a single metric — use multiple weak signals, interpreted in context.

---

## Practical Heuristic

Before adding any metric or reward:

Ask:

> How could this be gamed without improving real user outcomes?

If the answer is obvious, redesign or reject it.

---

## Final Principle

> The system must continuously align its internal signals with real human outcomes, while resisting the drift toward optimizing representations instead of reality.
