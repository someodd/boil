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

## Constraints

> Constraints are not limitations. They are design tools. (how-i-publish.gopher.md)

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
