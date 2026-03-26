# PRODUCT

## Purpose

boil exists to help a user reliably turn intentions into meaningful work by making it easier to start, stay with, and return to tasks throughout the day.

It is designed especially for users with unstable attention (e.g. AuDHD), where the primary challenge is not planning, but follow-through.

---

## Manifesto

- Warm, not cool. Physical, not digital.
- Demanding, not punishing.
- The water is the product.
- Subtract before adding.
- One file. Honest, portable, hackable.
- Copy should sound human.
- Every feature earns its place or gets boiled off.

---

## Core Problem

The gap between **intention and action**.

Users often:
- struggle to start tasks
- lose momentum mid-task
- fail to recover after interruptions
- abandon systems after breaking consistency

boil is designed to reduce that gap.

---

## What the System Does

- makes time **visible and embodied**
- reduces **friction to begin**
- supports **sustained engagement**
- enables **graceful recovery after disruption**

Time-blocking is a tool, not the goal.

---

## Success Criteria (Primary Signals)

These are **use-values** (Marx): qualities of the activity itself, not representations that can be exchanged or accumulated. The anti-signals below are exchange-values — they can be quantified, compared, and optimized precisely because they have been abstracted from the living process they once described.

- **Start latency**  
  Time between intending to begin and actually starting.

- **Meaningful completion / progress rate**  
  Fraction of planned blocks that are completed or meaningfully progressed.

- **Recovery rate**  
  Frequency with which a user returns after interruption or plan break.

- **Continuation depth**  
  Ability to stay engaged across one or more blocks.

---

## Supporting Signals (Secondary)

Useful but less reliable:

- adherence to time blocks
- number of completed blocks
- subjective user feedback (overwhelm, ease)

---

## Anti-Signals (Do Not Optimize For)

These are proxies that can drift from reality (Goodhart’s Law).

- number of blocks created
- streak length
- scores, levels, "personal best"
- perfect-block count
- time spent inside the app

These are representations that, when targeted, cease to measure what they were intended to measure.

Baudrillard's orders of simulacra describe the progression: a metric first **reflects** reality (you completed three blocks of real work), then **masks** reality (you completed three easy blocks to see the number rise), then **masks the absence** of reality (you open the app to maintain the streak, doing no real work), then **bears no relation** to reality (the streak *is* the accomplishment, and the question of underlying work no longer arises). Each stage is harder to detect than the last.

Note: Small rewards contingent on real work (e.g. a coin per completed block) are not themselves anti-signals. The risk begins when those rewards are quantified as scores, compared across sessions, or placed at risk of loss. See Embodied Delight: The delight taxonomy, CYBERNETICS.md: Delight vs. Drift, and NEUROSCIENCE.md: Wanting vs. Liking for the neurochemical mechanism.

---

## Failure Modes

The system must explicitly guard against:

- **Planning theater**  
  Spending effort organizing instead of doing.

- **Streak shame**
  Breaking a streak leads to disengagement. The system should welcome return the way a parish welcomes a lapsed parishioner: the door is open, the absence is not counted against you. The Missionaries' pastoral emphasis is always on return, never on the failure that preceded it. "Come back" is the entire message.

- **Easy-task gaming**  
  Optimizing rewards instead of meaningful work.

- **Hard-task avoidance**  
  Avoiding important but difficult tasks.

- **High-friction restart**  
  Difficulty resuming after interruption.

- **Overstimulation**  
  Feedback becomes distracting instead of supportive.

- **System abandonment**
  User stops using the tool after failure.

- **Data loss**
  Losing accumulated state (tasks, streaks, purchases) destroys trust and causes abandonment. User data is sacred.

---

## Design Principles

- Optimize for **starting and continuing**, not planning.
- Optimize for **recovery**, not perfection.
- Prefer **continuous feedback** over discrete scores.
- Minimize **cognitive load**.
- Never punish the user for breaking flow.
- **Preserve user data across every change.** State must be migratable, never silently dropped.
- The system must work under **instability**, not ideal conditions (Stafford Beer).

---

## Embodied Delight

The system must feel alive, warm, and worth inhabiting.

This is not a secondary concern. For users with unstable attention, the sensory and emotional texture of a tool is a core mechanism for engagement — not a reward layered on top, but the thing that makes starting possible, staying tolerable, and returning natural.

A tool that works well disappears into use — Heidegger's **ready-to-hand** (*Zuhandenheit*), developed for design contexts by Winograd & Flores (*Understanding Computers and Cognition*, 1986). The water is ready-to-hand: the user works *through* it, perceiving time as a rising level without consciously attending to the tool. A dashboard or score display is **present-at-hand** (*Vorhandenheit*): the user steps back from the work to contemplate the tool as an object. Every metric display risks converting the tool from ready-to-hand to present-at-hand — from something you work through to something you look at.

The same principle appears in the contemplative tradition as **kenosis** — self-emptying. The Missionaries of Charity practice radical kenosis: emptying the self so one can be fully present to the person in front of them. A tool full of its own numbers is a tool full of itself. A tool that disappears into water is a tool that has emptied itself so the user can be present to their work. The system should practice kenosis — subtract its own self-regard (metrics, dashboards, scores) so that what remains is the user's relationship with their own labor.

### The delight taxonomy

Not all delight is equivalent. The following taxonomy distinguishes delight by what it serves:

- **Delight in the doing** — sensory feedback coupled to the work itself (water, bubbles, haptics, procedural audio). Makes the act of working felt rather than merely endured. The water renders time as embodied cognition (Merleau-Ponty; Varela, Thompson & Rosch) — progress perceived through sensation, not symbolic interpretation — which supports flow (Csíkszentmihályi) by providing continuous feedback without demanding evaluative attention. The Missionaries of Charity insist that fidelity to the small act is the whole practice: "We can do no great things, only small things with great love." The system should never make the user feel that a single completed block is insufficient. One block done with attention is the entire point.

- **Delight in the having** — personalization and cosmetic ownership (a rubber duck in the water, a chosen avatar, a visual theme). Builds attachment to the tool as an inhabited space. Serves return-after-interruption by making the environment feel like the user's own. Personalization makes the tool what Illich (*Tools for Conviviality*, 1973) calls **convivial**: it enhances the user's ability to act without creating dependence on the tool itself. A convivial tool is one the user shapes to their own purposes. By contrast, progression systems (levels, unlockables gated behind metrics) make the tool **industrial** in Illich's sense: the user serves the system's requirements in order to access its features.

- **Delight in the earning** — small rewards contingent on completing real work (a coin for a finished block, a completion sound). Supports habit formation: the cue–routine–reward loop requires a satisfying reward phase to close, and once the behavior becomes automatic the reward becomes less critical. For the informational/controlling distinction, see CYBERNETICS.md: Delight vs. Drift.

- **Delight in the counting** — quantified representations of accumulated rewards (scores, streaks, levels, "personal best," badge progress). This is where Goodhart drift begins. See CYBERNETICS.md: Delight vs. Drift.

The first three serve real outcomes. The fourth drifts.

The boundary between earning and counting is where a reward stops being felt and starts being watched. A coin earned is feedback. A coin displayed as a score is a metric. A coin at risk of loss is a controlling contingency.

### Habit formation

The **cue–routine–reward loop** (Duhigg, drawing on Schultz et al.) requires a satisfying reward phase to close. Research on automaticity (Wood & Rünger, 2016) shows that once the cue–routine link strengthens, the reward becomes less critical — the habit sustains itself. This means sensory rewards (the boil animation, the coin sound) should scaffold early habit formation without becoming the permanent reason for use. The **overjustification effect** (Deci, 1971; Lepper, Greene & Nisbett, 1973) predicts that if the reward is too salient or too quantified, it replaces intrinsic motivation rather than scaffolding it.

The test: does the reward make the user want to **do their work again**, or does it make them want to **use the app again**? These sound similar but diverge over time.

### Rules

- The system should feel like a place worth inhabiting, not a dashboard worth checking.
- Sensory feedback should be coupled to the work itself, not to metrics about the work.
- Personalization that builds attachment to the tool serves return. Progression systems that build attachment to numbers are suspect.
- Small rewards for real work are informational feedback (SDT) and support habit formation. Making those rewards visible as scores, ranks, or streaks converts them to controlling feedback, where overjustification begins.
- If removing a game element would make the system feel dead, it is probably load-bearing. If removing it would only make a number less visible, it is probably drift.

---

## Background Resilience

boil will often be running in a forgotten tab. This is the default case, not an edge case.

- **Time must never silently vanish.** If the app was backgrounded while a task was running, the user must see what happened when they return. A stale screen that looks unchanged is a lie.
- **Time must never be silently gifted.** If the user walked away, the system must not credit that absence as work. Earned time is time the user was present for. Unearned credit erodes the meaning of the whole system.
- **Re-engagement happens on return, not on memory.** The user shouldn't need to remember boil exists. When they switch back to the tab, the system orients them immediately: what's running, how long has passed, what's next.
- **Notifications are the lifeline.** Block-complete and evening nudge notifications are the primary mechanism for pulling the user back. They are a core interaction surface, not a secondary one.
- **`visibilitychange` is a first-class event.** It is as important as a button click — it's the moment the user returns, and the system's one chance to re-anchor them.

---

## Non-Goals

- maximizing engagement time
- maximizing streaks
- maximizing feature count
- becoming a comprehensive productivity suite

---

## Ground Truth

The only real measure of success:

> The user starts work more easily, stays with it longer, and returns after interruption.
