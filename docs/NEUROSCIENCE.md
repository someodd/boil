# NEUROSCIENCE

## Purpose

This document grounds the design decisions in PRODUCT.md and CYBERNETICS.md in empirical neuroscience and behavioral research. It explains *why* the system's mechanisms work at a neurochemical level, documents *what strategies* the evidence supports (ranked by strength), identifies gaps where research suggests untapped opportunities, and flags anti-patterns where the research contradicts common design intuitions.

The theoretical frameworks in PRODUCT.md (SDT, flow, habit loops, embodied cognition) are correct but operate at the psychological level of description. This document adds the lower level: what is happening in the dopaminergic, opioid, and serotonergic systems when the user interacts with the water, hears a completion sound, or feels a haptic pulse — and what the behavioral research says about which strategies actually move the needle.

---

## Dopamine: Prediction, Not Reward

The popular framing of dopamine as the "reward chemical" is wrong in a way that matters for design.

Schultz, Dayan & Montague (1997, *Science*) established that midbrain dopamine neurons encode **reward prediction errors** (RPEs): the difference between expected and received reward. Three distinct response patterns emerge: (1) an unexpected reward produces a dopamine burst (positive prediction error), (2) a fully predicted reward produces no change in firing (zero error), (3) omission of an expected reward produces a depression below baseline (negative error). Once a cue reliably predicts reward, the dopamine burst *transfers* from the reward to the cue. The reward itself, now expected, generates no signal.

This has a direct design consequence: predictable rewards habituate. A completion sound that plays identically every time generates zero prediction error after the first few sessions. The dopamine signal extinguishes not because the reward is absent but because it is fully predicted. The system teaches to the test — Schultz's neurons learn the pattern and stop responding.

The implication is not that rewards should be withheld (negative prediction error is aversive) but that **small procedural variation within a predictable structure** generates positive prediction errors without creating anxiety. Water that rises with slight variation in bubble behavior, a completion sound with micro-variation in timbre or timing, a haptic pattern that shifts subtly across sessions — these maintain the prediction error signal within a safe, familiar envelope. The structure is expected; the details are not.

Bromberg-Martin, Matsumoto & Hikosaka (2010, *Neuron*) further showed that dopamine neurons are not monolithic. At least two functional populations exist: **value-coding neurons** (excited by reward cues, inhibited by aversive cues) and **salience-coding neurons** (excited by *both* reward and aversive/alerting cues). Salience neurons orient attention to anything worth noticing. This is why urgency activates the dopamine system — not because deadlines are rewarding but because they are salient. A visible timer creates mild salience (orienting attention) without requiring threat. The design challenge is to keep salience signals informational rather than anxiogenic: a rising water level is a salience signal; a flashing red countdown is an anxiety trigger. Both activate the same dopamine pathway, but the phenomenological experience differs.

---

## Wanting vs. Liking

Berridge & Robinson (1998, *Brain Research Reviews*; 2016, *American Psychologist*) demonstrated that dopamine does not produce pleasure. It produces **wanting** — the motivational pull toward a reward, which Berridge terms *incentive salience*. The hedonic experience of pleasure ("liking") is mediated by a separate, smaller opioid and endocannabinoid system operating through tiny hedonic hotspots in the nucleus accumbens shell and ventral pallidum.

These systems are dissociable: intense wanting without liking is addiction; liking without wanting is satiation. Mesolimbic dopamine handles the large, robust wanting system. Wanting is forward-looking — it makes you *approach*. Liking is experienced during consumption — it is present-focused.

This distinction maps directly onto the core problem. The intention-action gap is a wanting deficit, not a liking deficit. The ADHD user does not dislike their work (they may enjoy it once started); they cannot generate sufficient motivational pull to begin. The app's role is to function as a **dopaminergic cue** — a stimulus that triggers approach behavior toward the work. The water, the warmth of the interface, the ambient sensory texture function as reward-associated cues that generate wanting.

The critical design constraint: wanting is directed toward whatever stimulus is associated with the reward. If the sensory rewards are coupled to the *act of working* (water rises during work), wanting points toward work. If rewards are coupled to *app metrics* (a score rises after work), wanting points toward the app. This is the neurochemical mechanism underlying the distinction in PRODUCT.md between "delight in the doing" and "delight in the counting."

---

## The ADHD Reward System

ADHD is not a single deficit. Sonuga-Barke (2003, *Neuroscience & Biobehavioral Reviews*; 2010, *JAACAP*) identified at least three independent neuropsychological pathways: (1) an **executive dysfunction pathway** — impaired inhibitory control via fronto-dorsal-striatal circuits and mesocortical dopamine, manifesting as inattention; (2) a **delay aversion pathway** — altered reward processing via fronto-ventral-striatal reward circuits and mesolimbic dopamine, where delay is experienced as aversive and the individual is motivated to escape or minimize it; (3) a **temporal processing deficit** — impaired time perception and estimation, independent of both executive function and delay aversion.

### The dopamine transfer deficit

Tripp & Wickens (2008, *JCPP*) proposed the **dopamine transfer deficit** (DTD) theory. In typical development, dopamine neuron firing transfers from the reward itself to the cue that predicts the reward (per Schultz's RPE model). This transfer is what allows predicted rewards to motivate behavior in advance — you feel the pull when you see the cue, not just when you receive the reward.

In ADHD, this transfer is diminished. Consequences: (1) cues that predict future rewards have weaker motivational power (the "I know I should but I can't start" experience); (2) actual reward delivery produces a larger-than-expected dopamine response (because it was not fully predicted), making ADHD individuals more responsive to immediate, delivered rewards than to promised future ones; (3) behavior becomes controlled by actual reinforcement rather than predicted reinforcement, producing the characteristic pattern of responding to what is happening *now* rather than what will happen *later*.

This is arguably the most directly relevant finding for the system's design. It explains the intention-action gap at the neurochemical level and prescribes the remedy: reward must occur at the point of action, not after it.

### Measurable receptor differences

Volkow et al. (2009, *JAMA*; 2011, *Molecular Psychiatry*) used PET imaging in 53 unmedicated ADHD adults to demonstrate significantly lower dopamine D2/D3 receptor availability and lower dopamine transporter availability in the nucleus accumbens and midbrain — the core reward pathway. The 2011 follow-up showed these receptor levels correlated with trait motivation specifically in ADHD participants. Lower D2/D3 receptors in the accumbens = lower motivation scores.

The implication: the ADHD brain requires more dopaminergic stimulation to reach the same motivational threshold as a neurotypical brain. The system's sensory richness — water, bubbles, haptics, procedural audio — is not decorative. It is **compensatory**. It provides external dopaminergic stimulation that the internal system undersupplies.

### Delay discounting

Meta-analyses (Jackson & MacKillop, 2016, *Biological Psychiatry*; Marx et al., 2021, *Journal of Attention Disorders*) confirm that ADHD is robustly associated with steeper delay discounting — preferring smaller-sooner over larger-later rewards. The Marx et al. meta-analysis found that offering *real* rewards nearly doubled the effect compared to hypothetical rewards, suggesting the ADHD delay aversion is driven by the motivational system's response to actual reward availability, not just cognitive bias.

Design implication: felt, embodied feedback (water rising, haptic response, coin sound) is more motivationally effective for ADHD users than abstract, symbolic feedback (a number incrementing, a progress bar). The more *felt* the reward, the more it compensates for delay aversion.

### The narrow window

ADHD involves a **narrowed window of tolerance** between understimulation (boredom, disengagement) and overstimulation (overwhelm, shutdown). Both sensory seeking and sensory avoidance stem from the same dopamine/sensory gating differences (Frontiers in Integrative Neuroscience, 2019). The optimal stimulation zone is harder to reach and harder to maintain.

This is the central design constraint. The system must provide enough sensory richness to help ADHD users reach their activation threshold (making starting possible) without tipping into overstimulation (which triggers avoidance). The solution is a narrow band of warm, consistent sensory feedback — rich enough to engage, predictable enough to be safe. The user must be able to modulate stimulation level (battery saver mode, reduced animation) as a self-regulation tool.

### Reinforcement timing

Luman, Oosterlaan & Sergeant (2005, *Clinical Psychology Review*) and Hulsbosch et al. (2023, *JCPP*) found that starting with continuous reinforcement (reward every time) and gradually reducing to partial reinforcement produces both rapid acquisition and persistent behavior. Reward *salience* (how vivid and multi-sensory the feedback is) matters more than reward *speed* within the immediate range. A warm, multi-sensory block-completion moment that takes 1.5 seconds is more effective than an instant but flat acknowledgment.

---

## Sensory Pathways to Affect

### Water

Wallace J. Nichols (*Blue Mind*, 2014) synthesized fMRI, EEG, and cortisol research showing that proximity to water — visual, auditory, or immersive — increases dopamine, serotonin, and oxytocin while decreasing cortisol. The epidemiological evidence is stronger: White et al. (2020, *Scientific Reports*) found significant associations between blue-space proximity and wellbeing in large population studies.

Buxton et al. (2021, *PNAS*) conducted a meta-analysis of 18 studies finding that natural sounds decreased stress and annoyance (Hedges' g = -0.60) and improved positive affect (g = 1.63). **Water sounds were the most effective category for improving positive emotions and health outcomes.** Bird sounds were most effective for reducing stress. The effect was largest when natural sounds replaced anthropogenic noise.

The water metaphor is not arbitrary. Even simulated water exposure activates some of the same affective pathways as real water proximity. The rising water level may function as a low-grade Blue Mind trigger — calming rather than stimulating, which is precisely what is needed to help an ADHD user stay with a task rather than flee from it.

### Haptics

Hampton & Hildebrand (2025, *Journal of Consumer Research*) demonstrated across six studies that mobile vibrations evoke a reward response distinct from visual or auditory feedback. Separately, research published in *Cell* (2023) identified specific C-tactile afferent neurons that directly trigger dopamine release in the nucleus accumbens — the brain's core reward circuit. The vibration-to-reward link is neurochemically grounded, not metaphorical.

Parameters matter: feedback must be contingent on the completed action to function as reward rather than noise. Short duration (100-300ms), timed precisely to the completion event, not used for routine notifications (which habituate the response).

### Embodied metaphor

Lakoff & Johnson (*Metaphors We Live By*, 1980) established that abstract concepts are systematically structured by physical metaphors: MORE IS UP, PROGRESS IS UPWARD MOTION, HAPPY IS UP. These are not linguistic conventions — behavioral experiments show faster response times when spatial direction is congruent with conceptual valence. Neural imaging confirms that metaphor comprehension activates sensorimotor cortex.

"Water rising = progress" maps onto two primary metaphors simultaneously: MORE IS UP and CONTAINER FILLED = COMPLETION. The user does not need to interpret rising water as progress — they perceive it as progress pre-reflectively, because the conceptual system already equates upward filling with accumulation. This is the strongest theoretical grounding for why the water metaphor works better than a percentage counter. The counter must be read; the water is felt.

### Biophilia

Gaekwad et al. (2022, *Frontiers in Psychology*) conducted a meta-analysis of 49 studies (n=3,201) finding medium-to-large effects of natural environment exposure on increasing positive affect and decreasing negative affect. Even laboratory simulations showed significant effects. For ADHD users who need to stay with a task, the biophilic element provides a baseline of comfort that makes the environment tolerable rather than aversive.

### Warmth

Williams & Bargh (2008, *Science*) reported that holding warm objects promoted "warmer" social judgments. However, multiple replication attempts with larger samples and double-blind procedures found near-zero effects (Chabris et al.; Bayesian analysis favored the null). The direct physical-warmth-to-social-warmth priming effect is unreliable. The association between warm colors and positive affect operates through conventional color-affect associations, not embodied temperature priming. The warm color palette works, but the mechanism is associative, not embodied in the strong Bargh sense.

---

## Sound and Dopamine

Blood & Zatorre (2001, *PNAS*) demonstrated that self-selected music producing "chills" activated the ventral striatum, midbrain, and orbitofrontal cortex — the same reward circuitry activated by food, sex, and drugs. This was the first direct evidence that music engages the dopaminergic reward system.

Salimpoor et al. (2011, *Nature Neuroscience*) showed that dopamine is released in two anatomically distinct phases: the **caudate nucleus** during *anticipation* of a musical peak, and the **nucleus accumbens** during the peak experience itself. The anticipatory release is driven by prediction and expectation — the brain rewards itself for correctly predicting what comes next. The approach matters as much as the arrival.

This is directly relevant to the water metaphor. The gradual fill creates anticipation; the completion moment is the peak. If the final minutes of a block build toward completion — water approaching the top, a sound that subtly intensifies, a visual glow deepening — the system leverages anticipatory dopamine release in the caudate before the accumbens fires at completion.

Juslin (2013, *Physics of Life Reviews*) identified eight mechanisms (BRECVEMA) by which music induces emotion. Four are most applicable: **brain stem reflex** (sudden sounds trigger automatic arousal — use sparingly), **rhythmic entrainment** (rhythm synchronizes heart rate and breathing — ambient sounds at work-appropriate tempos could entrain calm focus), **evaluative conditioning** (sounds consistently paired with completion acquire positive valence — the completion sound *becomes* rewarding through association), and **musical expectancy** (violation or confirmation of expectations produces emotion — short sonic patterns that resolve satisfyingly).

Consonant intervals (perfect fifth, perfect fourth, major third) are rated as more pleasant than dissonant intervals at a brainstem level, with measurable differences in neural response quality (psychoacoustic research on critical bands; PMC2804402). Low-frequency sounds (30-120Hz) increase GABA (inhibitory neurotransmitter) and promote parasympathetic activity (vibroacoustic therapy literature; pilot RCT in *Frontiers in Psychology*, 2022). Completion sounds should favor consonant intervals and warm registers.

---

## Progress and Completion

### The goal gradient

Hull (1932, *Psychological Review*) showed that organisms accelerate effort as they approach a goal. Kivetz, Urminsky & Zheng (2006, *Journal of Marketing Research*) demonstrated the same in humans: cafe loyalty card holders accelerated purchase frequency as they approached the reward stamp. The effect operates on *perceived* proximity — people who feel closer to a goal work harder, regardless of objective distance.

Water rising in a container is a continuous, visible goal gradient. As the water approaches the top, the user perceives themselves as closer to completion and should experience increased motivation. This is especially powerful in the final minutes of a work block, precisely when ADHD-driven restlessness peaks. The gradient is felt, not read.

### Small wins

Amabile & Kramer (2011, *The Progress Principle*) analyzed 12,000+ daily diary entries from 238 knowledge workers and found that **making progress in meaningful work is the single strongest predictor of positive inner work life** — stronger than recognition, incentives, interpersonal support, or clear goals. The qualifier "meaningful" is critical: progress on trivial or artificially easy work does not produce the same effect.

Each completed work block is a small win. The system must frame blocks as meaningful progress on the user's actual work, not as progress toward an in-app metric. The moment the "win" becomes "I earned a coin" rather than "I did 25 minutes of real writing," the Progress Principle is subverted.

### Endowed progress

Nunes & Dreze (2006, *Journal of Consumer Research*) found that people given artificial head starts toward a goal are more likely to complete it. A loyalty card requiring 10 stamps with 2 pre-filled (8 remaining) had 34% redemption versus 19% for a card requiring 8 stamps with none pre-filled. The task is reframed from "not yet begun" to "underway but incomplete," triggering the tension of an open loop.

The act of planning the day — choosing tasks, setting blocks — is itself endowed progress. The user has already started before the first timer runs.

### Self-efficacy

Bandura (1977, *Psychological Review*; 1997) established that mastery experiences — successfully completing a challenging task through one's own effort — are the most powerful source of self-efficacy beliefs. Research shows that self-efficacy effects are **disproportionately stronger for ADHD users** than for neurotypical peers. A single completed block may shift self-belief more for an ADHD user than for a neurotypical one. The first block of the day is disproportionately important — it seeds the efficacy spiral.

### The Zeigarnik risk

The classic claim that unfinished tasks create productive tension (Zeigarnik, 1927) has not reliably replicated in modern meta-analysis (2025 systematic review). What is established: unfinished tasks create intrusive thoughts that interfere with other tasks (Masicampo & Baumeister, 2011), and this interference is eliminated by committing to a specific completion plan.

For ADHD users, the Zeigarnik effect is a risk as much as an asset. A running timer creates productive tension (stay with this block). A screen full of incomplete tasks creates toxic load. The system should make the current block salient and remaining tasks backgrounded. Time-blocking is itself a Zeigarnik discharge mechanism — having a plan eliminates the intrusive rumination about what to do next.

---

## Variable Reward and Attention

Bunzeck & Duzel (2006, *Neuron*) showed that the substantia nigra/VTA responds to stimulus novelty *per se* — not reward, not salience, but absolute novelty. This novelty signal triggers an "exploration bonus" and enhances hippocampal plasticity. The SN/VTA codes absolute novelty (how new is this stimulus in general?) rather than relative novelty, meaning the system does not quickly habituate to "slightly novel."

Skinner established that variable ratio reinforcement schedules produce the highest and most stable response rates. The ethical constraint: variable schedules become manipulative when they target vulnerable populations or reinforce behavior that does not serve the individual's interests. The test from PRODUCT.md applies: does the variability make the user want to do their work again, or use the app again?

The convergence of Schultz (prediction error), Bunzeck (novelty), and Skinner (variable ratio) suggests: **predictable ambient feedback with small procedural micro-variation** is the optimal design. The structure is expected (water rises during work — zero prediction error, ready-to-hand); the sensory details are slightly different each time (positive prediction error + novelty signal, without creating a watching/counting dynamic).

---

## Hedonic Adaptation and Sustainability

Frederick & Loewenstein (1999) established that people return toward baseline happiness after both positive and negative events through shifting adaptation levels and desensitization. Every sensory reward in the system will lose its impact over time. The completion sound that feels magical on day 1 will feel routine by day 30. This is not a design failure but a fundamental property of human hedonic processing.

Sheldon & Lyubomirsky (2012, *PSPB*) tested the Hedonic Adaptation Prevention (HAP) model and identified two moderators that forestall adaptation: **continued variety** (varying the reward-related experiences) and **continued appreciation** (attention to the positive change). In a 3-month longitudinal study (n=481), both showed significant effects. Experiential rewards resist adaptation better than material rewards.

The practical lever is variety: rotate feedback modalities across sessions (sometimes emphasizing visual, sometimes auditory, sometimes haptic), vary the details within modalities (slightly different completion sounds, water animations, bubble patterns). Sensory-specific satiety research (Rolls, 1986 onward) shows that habituation is stimulus-specific — changing even superficial properties reduces satiety. Cosmetic variety (water colors, seasonal themes, shop items) has functional anti-habituation value beyond decoration.

### Reward density over time

Reward density should decrease as use continues. During onboarding, users need rich feedback and reassurance. As behavior becomes habitual, the cue-routine link strengthens and the reward becomes less critical (Wood & Runger, 2016; PRODUCT.md: Habit Formation). The progressive disclosure system (daysCompleted gating features) already implements this principle. The system should continue reducing reward salience over time — not removing rewards, but making them quieter, more ambient, less attention-demanding. The goal is for the water to become ready-to-hand — worked through rather than looked at.

---

## Evidence-Backed Strategies

The neuroscience above explains *why*. This section catalogs *what works*, ranked by strength of evidence, with effect sizes and boundary conditions.

### ADHD-specific

**1. Implementation intentions (if-then plans).** d = 0.99 (mental health populations meta-analysis, Toli et al., 29 studies, n=1,636); d = 0.65 (general population, Gollwitzer & Sheeran, 2006, 94 studies). Children with ADHD who formed implementation intentions improved response inhibition to the level of children without ADHD (Gawrilow & Gollwitzer, 2008). EEG shows implementation intentions recruit bottom-up automatic control rather than top-down deliberate control (Paul et al., 2007) — a fundamentally different cognitive pathway that bypasses the executive dysfunction. Strongest for discrete actions; weaker for repeated behaviors unless plans address barriers. **Confidence: High.** Time-blocking *is* a system of implementation intentions.

**2. WOOP / Mental Contrasting with Implementation Intentions (MCII).** Oettingen's four-step strategy (Wish, Outcome, Obstacle, Plan) combines motivational goal-setting with implementation intentions. Shows greater benefits for people with more severe self-regulation difficulties (Wittleder et al., 2019). In an RCT, residents using WOOP spent 2.9x more time on goals than controls (g = 0.66; Saddawi-Konefka et al., 2017). MCII outperforms either component alone (Adriaanse et al., 2010). Requires the wish to feel attainable; low expectations trigger disengagement by design. **Confidence: Moderate-high.**

**3. CBT targeting organization, time management, and planning (OTMP).** Safren et al. (2010, *JAMA*) and Solanto et al. (2010, *AJP*): independent RCTs showing CBT focused on organizational skills outperforms active controls in medicated ADHD adults. A meta-analysis found psychosocial interventions had larger effect sizes than pharmacological interventions on work-relevant outcomes (Lauder et al., 2024) because skills transfer across domains. The system operationalizes several CBT-OTMP principles without a therapist: structured time blocks (organization), visible timers (time estimation scaffolding), daily planning (routine building). **Confidence: High** for therapist-delivered; lower for app-based adaptations.

**4. External structure.** Meta-analysis of organizational skills interventions: 12 RCTs, 1,054 children with ADHD (Bikic et al., 2021). Adult evidence is primarily qualitative. Tool adoption itself requires executive function — overly complex systems become new failure modes. The progressive disclosure design (simple on day 0, features emerge gradually) directly addresses this boundary condition. **Confidence: Moderate.**

### General population

**5. Specific, difficult goals.** d = 0.42–0.80 (Locke & Latham, ~400 studies, ~40,000 participants). The most replicated finding in motivational psychology. Goals direct attention, energize effort, increase persistence, and stimulate strategy. Boundary: for novel/complex tasks, specific performance goals can *interfere* with learning — learning goals outperform (Kanfer & Ackerman, 1989). The block structure creates specific, difficult goals by default. The water provides the required feedback. **Confidence: High.**

**6. Task-focused feedback.** d = 0.41 (Kluger & DeNisi, 1996, 607 effect sizes, 23,663 observations). But over one-third of feedback interventions *decreased* performance. The critical moderator: feedback effectiveness decreases as attention moves from task → self. Task-level feedback helps; self-level feedback hurts. The water is task-focused feedback — it shows progress without evaluating the user. **Confidence: High** that feedback matters; **moderate** for design specifics.

**7. Externalizing plans.** Masicampo & Baumeister (2011) found that making specific plans for unfulfilled goals eliminated the cognitive interference those goals caused, even without completing them. The mechanism: the plan gives the brain "permission to forget." The daily plan is the externalization; it discharges Zeigarnik tension. **Confidence: Moderate.**

**8. Single-tasking.** Task-switching incurs 30-60 second refocus costs (Dux et al., 2006; Mark, Gudith & Klocke, 2008). The invariant "only one task may have `running: true` at a time" (VERIFICATION.md) is behavioral, not just technical. **Confidence: High** for direction; specific percentage claims in productivity literature are unreliable.

---

## Strategies Excluded or Demoted

**Zeigarnik effect (memory for unfinished tasks).** A 2025 systematic review found no universal memory advantage for unfinished tasks. The related intrusive-thoughts finding (Masicampo & Baumeister, 2011) is better supported but distinct from the classic claim.

**"Just start" / 10-minute rule.** Plausible, consistent with adjacent science. No standalone RCT.

**Dopamine micro-completions.** The claim that checking off a sub-task triggers a meaningful dopamine hit is neuroscience-flavored folk psychology. See Dopamine: Prediction, Not Reward above for what the science actually says.

**Proximal sub-goals as performance enhancers.** A meta-analysis in sport found performance outcomes did not vary based on goal proximity (Burton & Naylor, 2002). Proximal goals help motivation and self-efficacy but the performance advantage is inconsistent.

---

## Existing Mechanisms: Research Alignment

| Mechanism | Research basis | Pathway |
|---|---|---|
| Water rising during work | Embodied metaphor (Lakoff), goal gradient (Kivetz), Blue Mind (Nichols), biophilia (Gaekwad) | Sensory → affect → wanting |
| Immediate feedback on block start | Dopamine transfer deficit (Tripp & Wickens), delay aversion (Sonuga-Barke) | Compensating for impaired cue-reward transfer |
| Haptic pulses on completion | C-tactile → accumbens dopamine (Cell 2023), haptic reward (Hampton 2025) | Direct reward circuit activation |
| Completion sounds (ascending tones) | Anticipatory dopamine (Salimpoor), evaluative conditioning (Juslin), consonance (psychoacoustics) | Caudate anticipation → accumbens peak |
| Coins per block (not scored) | Informational feedback (SDT), small wins (Amabile), reinforcement timing (Hulsbosch) | Competence signal without controlling contingency |
| Sister messages at 30% probability | Variable ratio (Skinner), prediction error (Schultz), novelty (Bunzeck) | Positive prediction error without anxiety |
| Warm color palette | Color-affect associations, aesthetic-usability (Tractinsky) | Perceived warmth → approach behavior |
| Block structure | Implementation intentions (Gollwitzer/Gawrilow, d=0.99), mastery experiences (Bandura), specific goals (Locke & Latham, d=0.42-0.80) | Externalizing executive function, building self-efficacy |
| Daily planning | Externalizing plans (Masicampo & Baumeister), Zeigarnik discharge, CBT-OTMP (Safren, Solanto) | Cognitive offloading, intrusive-thought elimination |
| Single-task enforcement | Context-switching costs (Dux et al.), processing bottleneck research | Preventing refocus penalty |
| Progressive disclosure | Reward density tapering, hedonic adaptation prevention (Sheldon & Lyubomirsky) | Scaffold early, fade as habit forms |
| Night sky / time-of-day transitions | Novelty (Bunzeck), variety prevents adaptation (HAP model) | Ambient environmental change maintains engagement |
| Shop / personalization | IKEA effect (Norton et al.), conviviality (Illich), relatedness (SDT) | Labor → attachment, tool as inhabited space |
| Battery saver mode | Narrow stimulation window (ADHD sensory processing research) | User-controlled modulation of sensory load |

---

## Gaps and Opportunities

Research-backed triggers that the system does not yet fully exploit:

**Procedural micro-variation.** The prediction error model (Schultz) and novelty research (Bunzeck) suggest that small, ambient variation in the water's sensory details — bubble patterns, surface texture, subtle color shifts — would maintain dopamine signaling that currently habituates. The variation should be procedural (algorithmically generated, never identical twice) rather than designed (a fixed set of alternatives that the user learns and predicts).

**Anticipatory build in the final minutes.** Salimpoor et al. showed that anticipatory dopamine (caudate) fires before the peak (accumbens). The system could subtly intensify sensory feedback as a block approaches completion — increasing bubble density, deepening ambient sound, brightening water color — creating a musical-style build toward resolution. Currently, the last minute is visually identical to the fifth minute.

**Water audio.** Buxton et al.'s meta-analysis found water sounds are the #1 natural sound for positive affect. The system has visual water but no persistent water audio (only discrete sound effects). Subtle procedural water sound during active blocks — adjusted for volume and character based on water level — would engage both the Blue Mind pathway and rhythmic entrainment (Juslin's BRECVEMA).

**Cross-modal reward rotation.** Sensory-specific satiety research suggests rotating emphasis across modalities (visual, auditory, haptic) reduces habituation in any single channel. The system could vary which modality is most prominent in completion feedback across sessions.

**Endowed progress at block start.** Nunes & Dreze showed that perceived head starts increase completion. When a block begins, the water could start at a non-zero level (e.g., 2-3%) rather than absolutely empty, acknowledging that the act of starting is itself progress.

---

## Anti-Patterns

**Overstimulation.** The ADHD narrow-window research means that adding sensory richness has diminishing and eventually negative returns. More particles, more sounds, more haptics can push past the stimulation ceiling into overwhelm. Every addition must be weighed against the cumulative sensory load.

**Habituation through repetition.** Frederick & Loewenstein's hedonic adaptation research means identical rewards lose impact. If the completion sound never varies, it will become neurally invisible within weeks. Variation is not a luxury but a maintenance requirement.

**Wanting directed at the app.** Berridge's wanting/liking distinction means dopaminergic cues direct approach behavior toward whatever they are associated with. If the most rewarding moments in the system are associated with opening the app, checking scores, or browsing the shop, wanting will point at the app rather than the work. The most rewarding moments must be during or immediately after real work.

**IKEA effect reversal on failure.** Norton et al. showed that labor leads to love only on successful completion. If the user invests effort in planning a day and then fails to execute, the IKEA effect reverses — the tool becomes associated with failure rather than investment. Graceful recovery (PRODUCT.md) is not just a UX concern but a neurochemical one: the system must prevent invested effort from being experienced as wasted.

**Zeigarnik overload.** Unfinished tasks create intrusive thoughts (Masicampo & Baumeister). A screen full of incomplete blocks generates toxic cognitive load for ADHD users. The current block should be salient; remaining blocks should be perceptually backgrounded.

**Feedback that evaluates the person.** Kluger & DeNisi found that over one-third of feedback interventions decreased performance. The common thread: feedback that shifts attention from the task to the self. "You completed 5 blocks today!" evaluates. Water that fills evaluates nothing.

---

## Evidence Summary

| Strategy | Population | Effect Size | Confidence |
|---|---|---|---|
| Implementation intentions | ADHD | d = 0.99 | High |
| WOOP / MCII | ADHD | g = 0.66 | Moderate-High |
| CBT for OTMP | ADHD | Significant over active control | High |
| External structure | ADHD | Varies | Moderate |
| Specific difficult goals | General | d = 0.42–0.80 | High |
| Implementation intentions | General | d = 0.65 | High |
| Task-focused feedback | General | d = 0.41 (high variance) | High (direction) |
| Externalizing plans | General | Not quantified | Moderate |
| Single-tasking | General | Not quantified | High (direction) |

---

## References

### Dopamine and Reward
- Schultz, W., Dayan, P. & Montague, P.R. (1997). A neural substrate of prediction and reward. *Science*, 275, 1593-1599.
- Berridge, K.C. & Robinson, T.E. (2016). Liking, wanting, and the incentive-sensitization theory of addiction. *American Psychologist*, 71(8), 670-679.
- Bunzeck, N. & Duzel, E. (2006). Absolute coding of stimulus novelty in the human substantia nigra/VTA. *Neuron*, 51(3), 369-379.
- Bromberg-Martin, E.S., Matsumoto, M. & Hikosaka, O. (2010). Dopamine in motivational control. *Neuron*, 68(5), 815-834.
- Blood, A.J. & Zatorre, R.J. (2001). Intensely pleasurable responses to music. *PNAS*, 98(20), 11818-11823.
- Salimpoor, V.N. et al. (2011). Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. *Nature Neuroscience*, 14, 257-262.

### ADHD
- Sonuga-Barke, E.J.S. (2003). The dual pathway model of AD/HD. *Neuroscience & Biobehavioral Reviews*, 27(7), 593-604.
- Tripp, G. & Wickens, J.R. (2008). Dopamine transfer deficit. *JCPP*, 49(7), 691-704.
- Volkow, N.D. et al. (2009). Evaluating dopamine reward pathway in ADHD. *JAMA*, 302(10), 1084-1091.
- Volkow, N.D. et al. (2011). Motivation deficit in ADHD. *Molecular Psychiatry*, 16(11), 1147-1154.
- Jackson, J.N.S. & MacKillop, J. (2016). ADHD and monetary delay discounting: a meta-analysis. *Biological Psychiatry: CNNI*, 1(4), 316-325.
- Hulsbosch, A.K. et al. (2023). Instrumental learning and behavioral persistence in children with ADHD. *JCPP*, 64(7).

### Behavioral Strategies
- Gollwitzer, P.M. & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis. *AESP*, 38, 69-119.
- Gawrilow, C. & Gollwitzer, P.M. (2008). Implementation intentions facilitate response inhibition in children with ADHD. *Cognitive Therapy and Research*, 32, 261-280.
- Gawrilow, C. et al. (2013). Mental contrasting with implementation intentions enhances self-regulation in schoolchildren at risk for ADHD. *Motivation and Emotion*, 37, 134-145.
- Toli, A., Webb, T.L. & Hardy, G.E. (2016). Implementation intentions for mental health problems: A meta-analysis. *British Journal of Clinical Psychology*, 55, 69-90.
- Locke, E.A. & Latham, G.P. (2002). Building a practically useful theory of goal setting and task motivation. *American Psychologist*, 57(9), 705-717.
- Kluger, A.N. & DeNisi, A. (1996). The effects of feedback interventions on performance. *Psychological Bulletin*, 119(2), 254-284.
- Safren, S.A. et al. (2010). CBT vs relaxation for medication-treated adults with ADHD. *JAMA*, 304(8), 875-880.
- Solanto, M.V. et al. (2010). Efficacy of meta-cognitive therapy for adult ADHD. *AJP*, 167(8), 958-968.
- Lauder, K. et al. (2024). A meta-analysis of interventions for work-relevant outcomes for adults with ADHD. *Journal of Attention Disorders*.
- Masicampo, E.J. & Baumeister, R.F. (2011). Consider it done! *JPSP*, 101(4), 667-683.

### Sensory and Embodied
- Nichols, W.J. (2014). *Blue Mind*. Little, Brown.
- Buxton, R.T. et al. (2021). A synthesis of health benefits of natural sounds. *PNAS*, 118(14), e2013097118.
- Hampton, W.H. & Hildebrand, C. (2025). Haptic rewards. *Journal of Consumer Research*.
- Lakoff, G. & Johnson, M. (1980). *Metaphors We Live By*. University of Chicago Press.
- Gaekwad, J.S. et al. (2022). A meta-analysis of emotional evidence for the biophilia hypothesis. *Frontiers in Psychology*, 13, 750245.
- Juslin, P.N. (2013). From everyday emotions to aesthetic emotions. *Physics of Life Reviews*, 10(3), 235-266.

### Progress, Goals, and Completion
- Kivetz, R., Urminsky, O. & Zheng, Y. (2006). The goal-gradient hypothesis resurrected. *JMR*, 43(1), 39-58.
- Amabile, T. & Kramer, S. (2011). *The Progress Principle*. HBR Press.
- Nunes, J.C. & Dreze, X. (2006). The endowed progress effect. *JCR*, 32(4), 504-512.
- Bandura, A. (1977). Self-efficacy. *Psychological Review*, 84(2), 191-215.

### Game Design, Adaptation, and Aesthetics
- Norton, M.I., Mochon, D. & Ariely, D. (2012). The IKEA effect. *JCP*, 22(3), 453-460.
- Tractinsky, N. et al. (2000). What is beautiful is usable. *Interacting with Computers*, 13, 127-145.
- Deterding, S. et al. (2011). Gamification: toward a definition. *CHI 2011 Workshop*.
- Sheldon, K.M. & Lyubomirsky, S. (2012). The challenge of staying happier. *PSPB*, 38(5), 670-680.
- Frederick, S. & Loewenstein, G. (1999). Hedonic adaptation. In *Well-Being*, Russell Sage Foundation.
