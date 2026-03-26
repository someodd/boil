# CYBERNETICS

## Purpose

This document defines how the system avoids drifting away from real user outcomes.

It exists to prevent optimization of **proxies** instead of **reality**.

For what counts as real vs proxy, see PRODUCT.md.

---

## Core Principle

> When a measure becomes a target, it ceases to be a good measure. (Goodhart's Law)

Three distinct theoretical traditions describe how this drift operates:

**Metric-induced reality deformation** (Fisher, *Capitalist Realism*, 2009): Metrics do not merely fail to capture reality — they actively reshape behavior to match the metric. The system teaches to the test. Fisher's insight is that this deformation is experienced as normal: participants internalize the metric as the goal and lose access to the pre-metric reality. In boil: users create easy blocks to inflate coin counts, and this feels like productive planning.

**Symbolic substitution** (Žižek): The representation is mistaken for the thing it represents. The metric *becomes* the experienced reality. Where Fisher describes behavioral adaptation, Žižek describes perceptual replacement — the subject genuinely experiences the symbol as the thing. In boil: the streak counter *feels like* the accomplishment, and this is not a conscious choice but a structural effect of how symbolic systems operate.

**Simulation** (Baudrillard, *Simulacra and Simulation*, 1981): The metric progresses through orders of simulacra — from faithful representation, to unfaithful representation, to masking absence, to pure simulation with no referent. Baudrillard's framework explains why late-stage drift is invisible: there is no longer a "real" against which to measure the representation, because the representation has consumed the real. In boil: a long-running streak becomes its own self-referential reality, disconnected from any question about the work it once measured.

The underlying mechanism is semiotic. All three traditions describe the same process: a sign detaching from its referent. Saussure established that the relationship between signifier and signified is arbitrary; what Fisher, Žižek, and Baudrillard each show is what happens when systems exploit that arbitrariness. The result is an **empty signifier** (Barthes; Laclau): a sign that has lost its referent but retains its social force — it still organizes behavior, still motivates, still creates anxiety, but the question "what does it point to?" has become unanswerable. A streak number that no longer refers to real work is an empty signifier. It drives behavior precisely *because* it has been abstracted from the living process it once described. Abstraction is powerful, but only while it touches ground. The moment it floats free, it becomes more potent as a motivator and less meaningful as a signal — and that divergence is the definition of drift.

This document exists to resist that drift.

---

## Drift Detection

Signal drift occurs when proxy metrics improve while real outcomes stagnate or decline. Watch for:

- rising engagement + falling completion
- rising complexity + falling clarity
- increased features + reduced usability
- more blocks created, fewer completed
- user abandonment after short use

---

## Requisite Variety (Ashby; applied by Beer)

The Law of Requisite Variety (Ashby, 1956) states that a controller must have at least as much variety as the system it controls. Beer's **Viable System Model** (VSM) applies this to organizational design through five recursive subsystems. For boil, the relevant insight is that **System 5** (identity/purpose) must constrain **System 3** (operational management) — the system's sense of what it is for must override its operational metrics. When System 3 metrics (blocks completed, streaks maintained) override System 5 purpose (the user does meaningful work), the organization becomes pathological. Beer called this **autopoietic crisis**: the system maintains its own structure at the expense of its purpose.

For boil, the "system to be controlled" is the user's attentional and motivational state, which varies across:

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

For the neurochemical mechanisms underlying these drifts, see NEUROSCIENCE.md: Anti-Patterns.

### Metric Capture (Fisher)
Metrics reshape behavior to match the metric rather than the underlying goal. The system teaches to the test.

### Symbolic Substitution (Žižek)
The representation is mistaken for the reality it represents. The metric becomes the experienced accomplishment.

### Reification (Lukács)
Living processes (doing work, building focus) are treated as fixed quantities (coin counts, streak numbers). The qualitative is reduced to the quantitative, and the quantitative is then optimized as if it were the original thing.

### Single-Metric Collapse (Cockshott)
Optimizing a single metric leads to gaming and system failure. Soviet planning by tonnage produced heavy, useless goods. In boil: optimizing for block count produces many short, unserious blocks.

### Simulation (Baudrillard)
The metric progresses through orders of removal from reality: faithful copy → distortion → masking of absence → pure simulacrum. Late-stage metrics are undetectable as drift because the referent has been consumed. A streak that has run long enough becomes self-justifying — the question "but did you do real work?" no longer arises naturally.

### Spectacle (Debord)
The accumulated representation of activity replaces lived experience. The user's relationship with their own productivity becomes mediated through the app's representations of it. The end-of-day summary *becomes* the day's work in retrospect. Debord's warning: the spectacle is not a collection of images but a social relation mediated by images.

### Ideology over facts (Deng Xiaoping)
Deng's critique of Soviet-style planning — "seek truth from facts" (实事求是) — is a direct analogue to Goodhart drift in system design. When ideological commitments (or metric targets) override empirical observation, the system optimizes for its own internal logic rather than for outcomes in the world. "It doesn't matter whether the cat is black or white, as long as it catches mice." The test of a productivity tool is whether the user does meaningful work, not whether the tool's internal metrics are satisfied.

### Alienation from labor (John Paul II)
*Laborem Exercens* (1981) holds that work has intrinsic dignity — it is not merely instrumental toward a product or a metric. Reducing work to its measurable outputs (blocks completed, streaks maintained) violates this dignity in the same way that reducing a worker to their productivity violates their personhood. Catholic social teaching recognizes metric capture as a form of alienation: the worker is separated from the meaning of their own activity by the interposition of a quantitative representation.

---

## Design Rules

- Metrics are **diagnostic tools**, not goals.
- All signals must remain **coupled to reality**.
- Systems must be evaluated against **real outcomes**, not dashboards.
- Assume all metrics will eventually be gamed.
- Never rely on a single metric — use multiple weak signals, interpreted in context.

---

## Delight vs. Drift

Not all game elements are drift risks. The system's sensory and emotional texture is load-bearing for the target user (see PRODUCT.md: Embodied Delight).

Under Self-Determination Theory (Deci & Ryan), the distinction is between **informational** and **controlling** feedback:

- **Informational feedback** affirms competence without imposing contingencies. It supports intrinsic motivation. Examples: water rising during a block, a coin earned on completion, a satisfying haptic.
- **Controlling feedback** creates obligations, comparisons, or loss aversion. It undermines intrinsic motivation through the overjustification effect. Examples: a streak at risk, a score compared to a personal best, a badge collection with visible gaps.

The test is not whether a game element involves a metric, but whether the metric is **felt as feedback** or **watched as a score**.

Personalization (cosmetic items, avatars, themes) carries low drift risk because it builds attachment to the tool as an inhabited environment, not to a number. This is delight in the having (PRODUCT.md), and it serves return-after-interruption.

---

## Practical Heuristic

Before adding any metric, reward, or feedback mechanism:

1. **Goodhart test:** How could this be gamed without improving real user outcomes? If the answer is obvious, redesign or reject it.

2. **SDT test:** Is this informational feedback (affirms competence) or controlling feedback (creates obligation)? If controlling, it will undermine intrinsic motivation over time.

3. **Fisher test:** Will this metric reshape behavior to match itself? Will users change how they plan or work in order to optimize the number?

4. **Overjustification test:** If this reward were removed, would the user still want to do the underlying activity? If not, the reward has replaced the motivation rather than scaffolding it.

---

## Final Principle

> The system must continuously align its internal signals with real human outcomes, while resisting the drift toward optimizing representations instead of reality.
