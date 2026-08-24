# design.md — the law of the column

The graph is the app. This file records the rules it is built on, so a change can
be checked against a rule instead of against taste.

Sources, in order of authority: **the brief** (§0 — thirty-three prompts, quoted
verbatim), the design rationale in `timeblock.jsx`'s own comments, and the
decisions taken in review on 17–18 Aug 2026, and the research of 24 Aug.

The `docs/*.md` manifesto still in git describes the *retired* bubble app
(`boil.html`); its **mechanics** are dead. Its **doctrine** was inherited and is
still live — the anti-punishment posture of `PRODUCT.md`, the Goodhart analysis
of `CYBERNETICS.md`, and `NEUROSCIENCE.md`'s line that *"a rising water level is
a salience signal; a flashing red countdown is an anxiety trigger."* Where this
file and those disagree on doctrine, say why.

Neither of the two session transcripts on disk predates `timeblock.jsx`. **§0 is
the only surviving record of the brief that produced this app.**

*Register note, inherited from the old `CLAUDE.md`: these documents are written
formally on purpose. Reasoning calibrates to the register of its input.*

---

## 0. The brief, in the author's words

The fragments below are the load-bearing ones — sentences that decided something
and are still deciding it. Everything after this section is downstream of them.

**Scope.** The feature set was fixed in the first prompt and has never been
reopened.

> "All it does is have x timers." … "But above all else make it as simple as
> possible and easy to use as possible." — *#1*

> "apply some of these uxui Joy dopamine hacking lessons from the design world
> in 2026 into the app **in a way it's not adding features**. It's just making
> the design better, more opinionated." — *#19*

**The graph is the whole screen.**

> "Stop putting shit outside the graph. Also really the graph is the main thing.
> Focus on that. I almost want the entire screen to just be the graph at 100
> viewport" — *#23*

> "no more outside the graph timers shown by default (hide that by default). Make
> it so timers are generally edited and ran by tapping it in the graph" — *#13*

This is the origin of *the block **is** the timer*, and the reason nothing may
live in furniture around the column.

**What the graph shows.**

> "its purpose is to both record what you have done with your time thus far and
> then have a current blip for where you're at now. And then ahead of that blip
> … it should show you what's left for the timers" — *#3*

> "I really want everything at a glance" — *#2*

**The ruler.**

> "we don't need the quarter hour markers throughout the time block that's ugly.
> Can put them to side or something" — *#15*

The 52px left margin exists because of this sentence: time was moved out of the
field and into the margin.

**Overrun — the founding charter of everything past bed.**

> "if there's not enough time in the day for the timers it should indicate that
> somehow. I'm not sure how it should do that, but it should let you know like
> hey buddy, it's like you're fucked" — *#5*

> "everything's just a stack on the grid. And to see everything, it just, like,
> stacks into the future. **Nothing gets clipped off.** So if you just have a
> shit ton of timers with a shit ton of time left, it can just go into the next
> day. It's fine. But in the red zone, basically. … Under the graph, you can just
> say plus x more" — *#16*

Three rulings in one paragraph: stack into tomorrow, clip nothing, count whatever
could not be drawn. "Red zone" is shorthand for *marked as bad* — it is not a
specification of the colour.

**Bed as its own concept.**

> "what about a feature for if I'm still awake past bedtime? … Like the actual
> 'deadline time' is separate?" — *#11*

> "If I start Monday it… assumes I want to go to bed at 1700 hours or so rather
> than bedtime" — *#24*

§6 is the answer to both.

**Aesthetic.**

> "go Swiss design or Danish … lots of great contrast and just dope typography"
> — *#4, repeated verbatim at #22 after a pass that failed to land*

> "think like Duolingo crossed with Ikea" — *#18*

> "Do the colors invoke joy and great design? It's ok to be opinionated." — *#10*

**Where joy is supposed to live.**

> "The biggest point of joy, like, needs to be the time blocks themselves and the
> experience of whittling away at a time block as well as a time block just being
> completed. Needs to be totally joyful." — *#18*

> "Tastefully use haptics, sounds, animations to dopamine hack." — *#7*

**Method.**

> "make sure to scrutinize and ask why every design element exists" — *#2*

> "You also must look out for LLM/ai design antipatterns" — *#9*

> "What's the design justification for the underline" — *#30*

The last is the shortest and the most useful: any element may be asked to justify
itself, and "it looked nice" is not an answer.

**Audience.**

> "it's for me and me alone to use" — *#20*

One user, one device, known habits. Generality is not a virtue here; fit is.

---

## 1. The premise

> A day is a column. You place time into it, then you spend time against it.

One viewport, no scrolling, no dead space. Everything — the day total, the ruler,
the week — is placed **inside** the column rather than in furniture around it
(*#23*).

## 2. The three regions, in order

The column is one ordered list of rows, top to bottom, monotonic in time:

| region | what it is | how it is drawn |
|---|---|---|
| above the black bar | **the record** — what actually happened | solid ink, at true scale, at the offset it happened |
| the black bar | **now** | the only ink band on the screen; carries the banked total |
| below the black bar | **the debt** — what is still owed | tint, hairline spine, half-hour bricks |

Four invariants follow, and all four have been paid for:

- **The record is an account, not a plan.** A block above the bar sits at the
  y-position of the clock time it was worked, and two sittings of one timer are
  one column with paper between them, never two columns side by side. *(Decided
  18 Aug: "everything above the black bar is an account of what you did within
  the times noted on the side.")*
- **The block is the timer.** Tap it to run, hold it to edit. There is no
  separate list, no separate control (*#13*).
- **Nothing is clipped.** The debt stacks forward into tomorrow if that is the
  truth (*#16*).
- **Owed time never vanishes quietly.** When rows cannot fit, they are dropped
  deliberately and counted on one line — `+n owed · Xh below the fold` (*#16*,
  "you can just say plus x more"). Silent clipping is the failure mode these two
  rules exist to prevent.

## 3. Time is piecewise, not proportional

A real day is mostly gaps. True scale would give acres of grey and 20px slivers
of colour. So:

- worked and owed time are **proportional** (one shared `pxm`, solved by
  bisection so the day fills the viewport exactly),
- empty time is **banded** (`gapPx`: 10 / 16 / 24 / 32px) — a rest, not a void,
- every block has a floor (`MINROW` 24px): a block too short to hold its own name
  is not a block.

The keystone is `PXM = 0.8`: 5 minutes (one storage slot) is 4px (one baseline
unit); a 30-minute brick is 24px; an hour is 48px. **The time grid and the type
grid are the same grid.**

## 4. Two axes, no third

Time is right-aligned in a 52px margin (`GUT`). Every other piece of type starts
at `CONTENT_X`. Continuity of axis is the weakest cue to lose and the cheapest to
keep.

The margin runs on 24-hour time: four characters, unambiguous, and it sorts the
way the day does.

**One stamp per 13px, and the more certain fact wins.** The work-row renderer
already drops "any stamp that would land unreadably close to the one above"
(`timeblock.jsx:1132-1138`). That policy belongs to the whole margin, not to one
row kind, and it needs a precedence to be deterministic:

> **bed > midnight > block start.**

Axis facts are true whatever the plan does; a block start is a guess. When they
collide the guess yields. This is also the answer to a red stamp landing on top
of another: **drop one, never knock one out.** A filled chip in the margin would
be an addition where a removal serves, would put a box in a column that has only
ever carried bare type, and would decide by z-order which fact survives instead
of deciding by which fact is truer.

**The first queue row never carries a stamp.** `plan[0].top === cursor` always,
so its stamp always reprints the time the NOW band shows immediately above it.
That duplicate is visible in every screenshot ever taken of this app.

Knockouts remain correct in the *content field*, where `up` and `bed` already use
them (`background: P.paper`) to interrupt their own rule. Margin and field are
different disciplines.

## 5. Colour

Swiss poster inks. Tints hand-tuned in OKLab to one lightness so every hue reads
as one family.

> **Correction, 24 Aug.** `timeblock.jsx:6` and earlier drafts of this file say
> that lightness is "L 0.901 to 0.916". Measured from the shipped hex values the
> **tints are OKLab L 0.857–0.870** (spread 0.013 — the discipline is real, the
> number is not). What measures 0.931–0.940 is the **washes**. The comment in the
> code is wrong; fix it there too. A derivation written against 0.908 produces a
> family that does not match the one on screen.

Red is **a member of the palette** (`INKS[0]`,
signal red), not an orphan introduced for alarms — which means red can be spent
on meaning, but only once, and it is currently spent on *past bed*.

Solid = done. Tint = owed. Ink = now. Paper = time not spoken for.

Five of the eight tints sit **exactly on the sRGB gamut wall** at their own
lightness (red, orange, cobalt, violet, magenta, ratio 1.000). For those, the
"hand tuning" was the boundary — chroma was never a free parameter. This is why
no constant chroma rule can carry the family to a darker ground: at low lightness
the ceiling profile inverts (cobalt 0.068 → 0.27, chrome yellow 0.15 → 0.062).

`wash` is authored for all eight, gamut-checked, at a single lightness — and
**rendered nowhere**. Eight finished values, paid for, unused.

## 6. Wake and bed are different kinds of thing

- **Wake is a boundary.** It is where the day begins; 1am on Sunday still belongs
  to Saturday. A date may carry its own edge (`log.wakes[key]`) so "I slept, I am
  starting a new day at 1am" needs no second concept (*#11*).
- **Bed is a deadline.** A wall-clock time, found by asking when `cfg.bed` next
  comes round after this day began — never by adding a length to wake (*#24*, the
  bug that produced this rule). It does not end the day and it does not cut
  anything off.

Stated in the settings sheet, in the app's own words: *"Bed is a deadline, not a
cut off."*

## 7. Motion is physics

Two springs, emitted as CSS `linear()` so a real damped spring runs on the
compositor: a **spatial** spring that overshoots ~5% for anything that moves or
changes shape, and an **effects** spring that settles dead for colour and
opacity. Reduced motion keeps the confirmation and removes the travel.

## 8. Where joy lives

Joy was specified to be **concentrated, not sprinkled** (*#18*): it belongs to
the block — whittling one down, and closing it. So the reward surface is the
block itself and the moment it completes, never badges, mascots or streak
furniture. What the code spends it on: praise words on completion, a flood of
every ink across the screen when the day goes clear, `chew` when a block takes a
bite, `beats` on the now band, `reveal` on a replayed record, sound and haptics.

**The corollary, and it is load-bearing:** if joy attaches to the block, failure
must not. When the day runs out it is the *day* that ran out, not the task that
went bad — Chinese at 04:00 is the same Chinese. A treatment that stains, hollows
or reddens the blocks says the wrong thing about them. Overrun is a fact about
the ground the blocks are standing on.

## 9. Standing prohibitions

- Nothing lives outside the graph (*#23*).
- No feature arrives under cover of a design pass (*#19*).
- Every element answers "why does this exist" or goes (*#2*, *#30*).
- No AI design slop (*#9*): gratuitous gradients, emoji, the rounded card with a
  left accent border, Inter and Roboto, decorative iconography, and "data slop" —
  numbers, stats and chips that nothing acts on.
- No borrowed symbol font. Marks are drawn from the app's own geometry.
- No radius of `9999` — radii are computed from the element's own size, so a
  shape can morph.
- No metric that can be gamed in place of the thing it stands for. The number on
  the black bar is time actually banked.
- **No display that makes faking the record rational.** Punitive daily states
  reliably produce falsified logs — invented workouts to clear a calorie goal,
  Dailies ticked that were never done, system clocks rolled back in Forest. This
  app's only asset is an honest account of where time went; a display that
  punishes the account attacks the thing it is made of.
- Nothing is added that could be removed instead.

---

## Resolved — the bed boundary (24 Aug 2026)

Four candidates were drawn (`.design/`, published as a canvas): **A SIGNAL** (red
rail in the margin), **B NIGHTFALL** (ground flips to night), **C UNFUNDED**
(blocks hollow out), **D HORIZON** (stop drawing, print the total). Research on
prior art, perception, craft and behaviour retired all four as posed, and
converged on something narrower.

### The three defects

The row list is monotonic in `at` everywhere except one line: the bed row is
appended after the queue instead of inserted at its own offset.

1. **Order.** `20:00` draws after `06:54`. §4 promised the ruler always sorts the
   way the day does.
2. **Tense.** The red line and the header string fire on `spill > 0` /
   `qat > total + 1` — **projected** overrun, not elapsed time. On 17 Aug at
   14:51 the header read `3h30 · 23:00 past bed`. The app says "past bed" in the
   afternoon. `overBed`, the one value that measures actual lateness, is computed
   every render and drawn nowhere.
3. **False precision.** `stampTime` is mod 1440, so 03:37 tomorrow draws as
   03:37 today, and nothing marks midnight. But the deeper fault is that the
   stamp exists at all — see the rule below.

### The rule that resolves it

> **Durations past the deadline are facts. Start times past the deadline are
> fiction. Draw the facts; drop the fiction.**

**Say the estimate as a duration, never as a clock time.** A duration is honest
about being an amount; a clock time impersonates a commitment. This is the crisp
form of GNOME's "about" hedge, and it is why `+11h 19m` may be printed where
`lands 07:19` may not.

*Honest caveat: the stamps before the line are estimates too — every queue start
after the first assumes the block above it runs exactly to its goal, and the
order is `cfg.timers` array order, not a plan anyone made. Precision should
really decay with horizon. Bed is used as the horizon because it is a line the
author set, already on screen, and already meaningful — reusing it costs nothing,
where a second threshold would have to be invented.*

`46m` is a goal the author set. `04:24` is the accumulated error of six duration
guesses, set in the same face, at the same size, at the same authority as the
`06:00` he actually committed to. No product in the category degrades projected
time precision with distance — and the guidance has said for two decades that it
should: Microsoft's UX Guide (*"Make estimates accurate, but don't give false
precision"*), GNOME's HIG (*"use the word 'about'"*), NN/g, and *Management
Science* 2024 (n=5,323: ranges beat point estimates, 70.7% preferring them when
incentivised, reversing only for excessively wide ranges).

This also disposes of defect 3 by subtraction rather than addition: there is no
midnight marker to build if the fabricated stamps are gone. Midnight and bed are
*clock facts* and may be marked; a projected block start is not.

### What ships

1. **The bed row moves to its true offset** and therefore **crosses** the block
   it lands in — a hard-stop `linear-gradient`, not a split into two rows.
   Splitting reads as two tasks and orphans a sliver too short to hold a name.
2. **DIM.** The past-bed region — ground *and* blocks together — is multiplied by
   one scalar, k ≈ 0.86. Not a second palette: a lighting change. Multiplication
   is monotone per channel, so no ordering can invert. Below k ≈ 0.84 the block
   labels drop under the readable floor.
3. **Hard edge, never graded.** Crispness is the standardised encoding for
   *uncertainty*; blurring the bed line would state that bedtime is approximate.
   A hard step also earns Mach-band enhancement, so a gentle step still reads
   crisply.
4. **The margin goes quiet past bed.** No per-block clock stamps. Durations stay.
5. **One number, not two.** `todayRight` already prints the overrun; fix its
   tense. Do not add a second — see the two independent reasons below.
6. **A one-gesture shed** for past-bed blocks. A warning without an adjacent
   remedy becomes wallpaper; a warning whose remedy is one gesture stays a
   decision.

**Two exemptions from the dim, both from §8.** The NOW band never dims — it is
the reference everything else is read against. **The running block never dims**,
wherever the clock is: it renders in its own `live` row above the queue, at full
solid. So the dim only ever falls on work that is *waiting*. The joy path — pull
a block up, run it bright, land it solid in the record — is entirely outside the
dimmed region, which is why dimming most of the queue does not dim the app.

**Over an evening this behaves the way NIGHTFALL was supposed to feel.** The dim
is keyed to bed's offset, not to the queue, so it applies to the record too: at
19:37 a sliver is dim; by 23:00 the line has climbed above the NOW band and half
the screen is night; by 03:00 only the morning's record is still on paper. The
screen darkens as the night goes on, at true scale, without a second palette.

Implementation: a `dim(hex, k)` sibling of `ink()`. **Not `mix-blend-mode`** — on
mobile Chrome it can force the blended subtree off the GPU path and disturb §7's
springs.

**The dial has almost no travel.** k must stay in [0.84, 0.86]: below 0.84 the
block labels fall under the readable floor, and dimming the ground harder than
the blocks is not available — it collapses ground-against-tint separation, which
is the one thing the multiply exists to protect. So if the dim reads as nothing
on the phone, the answer is **to remove it, not to deepen it.**

**The live alternative, kept on the table: k = 1.** Delete the fabricated stamps,
move the line to its true offset, print the quantity — and change no colour at
all. The margin emptying for most of the column is itself a strong signal, and it
scales with the overrun exactly as the dim does. What the dim adds over that is
selectivity at a glance, and legibility of an *overrun already worked* — at 23:00
the evening you spent past bed shows as a shaded band in the record, which the
line alone conveys poorly. Both are one constant apart; try k = 1 before assuming
the dim earns its place.

### Why not each of the four

- **B is arithmetically impossible, not merely expensive.** An exhaustive search
  over night grounds L 0.20–0.32 found **no** night-tint lightness at which all
  eight hues keep separation from both the ground and their own solid. Cobalt and
  violet invert — owed becomes lighter than done. And ink `#17171C` on any night
  ground measures **APCA Lc 0.0**, below the floor of measurable contrast, so the
  NOW band stops being a band. The cause is geometric: on paper the ground sits
  *above* the whole palette and the tint has a clear octave to itself; a dark
  ground forces the tint into the gap between ground and solids, which for cobalt
  is 0.16 wide. **Inverting the ground does not move the palette; it collapses
  the space the palette lives in.**
  It is also unattested. Apple Health draws nine hours of night on paper white;
  Yr.no draws 48 hours with no ground change; meteoblue bands the *day*, not the
  night; Apple's sleep dial draws the sleep window *lighter*. Charting libraries
  ship washes at α 0.1 or no default at all. And in Swiss terms the NOW band is
  already the black form on the sheet — a second, larger black that is an
  *environment* rather than a form is illustration, not notation.
- **A habituates in two exposures.** fMRI shows a dramatic drop in visual
  processing after the *second* viewing of a warning; the follow-up paper is
  titled *From Warning to Wallpaper*. Banner blindness is immune to colour and
  animation, because the mechanism is categorisation, not salience. A renewal
  alert — the same objection to a decision already lived with — is overridden at
  ~17.7× the base rate, and a nightly bed warning is structurally a renewal.
  Habituating that slot also poisons anything later placed in it. Concretely:
  `ALARM` is `INKS[0]`, a user-selectable block colour, so a red rail collides
  with red blocks. Red is better spent on the nights the debt is *unusual*.
- **C is the right instinct in the wrong channel.** Motion's Ghost state (dotted
  border, lighter fill) and Outlook's hatching are real precedent — but for
  *epistemic* status, not for failure, and they never remove the fill. A hairline
  outline is the minimum-size mark, where colour discriminability is at its
  worst, and the app's own `Mark` comment already rejects outlines at small size
  as "all hairline and no mass, which at this size reads as debris." What C was
  reaching for is delivered by the false-precision rule instead.
- **D contradicts §2 and reverts a decision.** *#16*: "Nothing gets clipped off."
  It also restores the retired app's semantics — bed as cut-off, daybar blanked,
  *"past bedtime, nothing is ahead"* — which this generation was rewritten to
  abandon (*"Bed is a deadline, not a cut off"*). Its one good idea, the printed
  magnitude, already ships in the header.

### Register

**Unsentimental and factual. Neither ominous nor consoling.**

Consolation is rejected by users as loudly as punishment: *"If I killed it today,
I know I killed it. If I didn't kill it, I don't need you to tell me I did,
because I know it's a lie."* Nothing written over a four-hour overflow survives
contact with the person who lived that evening.

Oura supplies the naming convention: its worst band is not "Poor" but **"Pay
Attention"** — an attentional posture tied to an action, never a verdict.

### Two independent arguments against a second number

- Etkin, *The Hidden Cost of Personal Quantification* (JCR 2016, six
  experiments): measurement raises output while lowering enjoyment, and the
  enjoyment loss eventually takes the output with it.
- The author killed a redundant number himself on 17 Aug, in five minutes
  — *"nonono get rid of 'banked'… revert that!"* — leaving the principle in the
  code: **"one quantity does not need two numbers."**

### The precedent this project has already set

Every lateness escalation ever built here was later removed: a five-rung
notification ladder, night lockdown, arrival dimming, nudge copy, the `+overtime`
band, the `"Xm over"` caption, the green slack bar. Sort them and the pattern is
sharp — **what died was nagging or redundancy; what survived was static honest
marking** (the red bed line, the overrun string, a failed day rendered black in
the history calendar). DIM is static honest marking. It is the shape of thing
this project keeps.

### Still open — upstream, not downstream

Whether the past-bed state is rare or nightly does **not** change the treatment;
it changes what else is needed. The chronic case makes the loud options actively
harmful (habituation, and the record-faking prohibition in §9), and the
literature on goal disengagement says an unremediated 11h41m debt makes a person
stop caring about the goals rather than work harder. The observed failure mode is
not deletion — it is the app going quietly unopened for a fortnight.

Two upstream moves, neither yet decided:

- **Replace the nightly binary with a rolling rate.** "11 of the last 14 evenings
  finished by bed" is honest, cannot be broken tonight, cannot become a monument,
  and self-cleans. It *replaces* a number rather than adding one, so it survives
  the Etkin objection. Apple's own VP of Fitness Technologies on the rings: *"a
  ring is either closed or not closed. So we've found there's a real addictive
  behavior in making sure that final ring gets closed."* Apple shipped Pause
  Rings in watchOS 11.
- **Treat repeated overflow as misconfiguration, not character.** The unbuilt
  17 Aug proposal is the same instinct landing at the right end: *"Past 7h it
  pins and takes the ALARM tint… Nobody sets a 9h daily goal without being told
  something."* The intervention belongs at goal-setting time, where it fires
  once, not at display time, where it fires nightly.

### The bed marker, specified

Every value below is either measured or derived from a cited finding; none is taste.

**Anatomy — bed is the wake marker, with a different colour and a different position.**

| piece | where | value |
|---|---|---|
| the rule | **the field only**, `left: GUT` — never across the margin | 1.5px dashed, `ALARM.solid`, **constant**: same colour, same weight, both tenses |
| the stamp | the margin, right-aligned, centred on the rule | `P.mute`, like every other stamp in the column |
| the word | on the rule at `CONTENT_X`, masked | `bed`, always; `T.chip` (10.5px), `P.ink` |
| the quantity | **not here** — the NOW band's caption | `banked · 11h 20m past bed` |

**Why each.**

- **The rule stops at the margin** because the margin is the axis. A rule drawn through
  it strikes the stamp that names it. Wake already does this correctly; bed did not.
- **The stamp is mute, not red.** Measured, red buys nothing there — Lc 64.2 against
  mute's 67.1 — and it spends the palette's one semantic colour on a fact that is not
  the alarm, on a row that already states the alarm twice.
- **The word is ink, not red.** Longitudinal chromatic aberration between the sRGB red
  and green primaries is 0.295 D, and `ALARM.solid` draws 85% of its luminance from the
  red primary, so the blur circle is 2.5–3.1′ against an Archivo-800 stem of 2.9′ at this
  size: **on a phone the chromatic blur on a red glyph is about one stroke width.** Red
  on a tint also measures Lc 31 with visible chromostereopsis, where ink on any tint is
  Lc 62 — and identical across all eight, because they share one lightness. **Red lives
  in the rule; type stays ink.**
- **`T.chip`, not `T.nano`.** At a measured 32cm phone viewing distance, nano's cap
  height subtends 11.1′ — just under the 12′ critical print size below which reading
  speed falls away. `chip` gives 12.3′ and clears it. The role already exists.
- **The mask takes the ground it stands on**, per cartographic practice, so the label
  reads as a hole rather than a sticker. `background: P.paper` is hard-coded at
  `timeblock.jsx:1259` and `:1270`; the moment the dim ships that is a light rectangle
  floating on dusk. Over a block the ground is the block's own tint, which means no
  visible chip at all — ink type, dashes suppressed behind it.
- **Nothing is conditional.** The shipped `r.over` ternary fires the rule's colour, its
  opacity *and* its wording from one projection-derived boolean — which is why the app
  says "past bed" at 09:00. Making all three constant deletes the bug class rather than
  patching it: **the tense is carried by the rule's position relative to the NOW band,
  and by nothing else.** Names do not conjugate.
- **The quantity is a state of the day, not a property of the deadline.** Bed does not
  overshoot; the queue does. It is also the same number as `11h 41m to go` measured from
  the other end — `19:37 + 11h41m = 07:18`, `07:18 − 20:00 = 11h18m` — so printing it on
  the rule encodes one datum three times.
- **Round it to five minutes.** `SLOT_MIN = 5` is the grid the column is drawn on, and a
  projection assembled from a dozen self-set goals cannot be finer than the grid it is
  drawn on. §"the rule that resolves it" applied to our own number.

**The word survives a challenge it looked like losing.** Under deuteranopia
`#CE3118 → #7C7C00` and grass `#2E9E1F → #898927` are nearly the same colour, and seven
of the eight inks are user-assignable — paint a timer green and an unlabelled red rule
stops being distinguishable. Rule *plus* word *plus* position is what makes the marker
robust. The silent variant is not available.

### Two defects this pass found outside the bed marker

- **`Num`'s unit letters are below the acuity limit.** `unitScale: 0.42` at `opacity:
  0.45` puts the `h` and `m` at 3.99px — cap height 4.7′ against the 5′ of a 20/20
  letter — measuring Lc 19–35. Not hard to read: below the size at which a letter can be
  identified with unlimited viewing time. This affects every `46m` and `30m` on the
  screen. Clamp `unitScale` so the unit never falls under ~8px effective, and clamp the
  dim above 0.7 below `T.data`.
- **`caps()` over-tracks by ~55% at the bottom.** Butterick's ceiling for caps is
  0.12em; the curve emits 0.186em at nano. Chung (2002) measured the premise away —
  reading speed rises with letter spacing only to the font's own critical spacing, then
  goes flat, and the critical value "did not depend on eccentricity or print size." Same
  monotone shape, corrected constants: `caps(px) = 0.24 − 0.011·px`. Note the gutter was
  never the constraint: `20:00` is 34px of ink in a 40px slot, and the whole tracking
  range costs 3.3px.

### Not designed

The one-gesture shed for past-bed blocks is specified as a requirement and has no
design. Nothing in the dimmed region can currently be dropped in one touch.

### The ghosts this closes

`LATE_CAP` (210), `OVERFLOW_CAP` (200), `DRAW_CAP` (2880), `proj.late`, `phase`,
`overBed`, `nextMidnight` — declared or computed, read by nothing, every one a
trace of the past-bed design that was specified and never built. Plus the eight
unrendered `wash` values. Either wire them or delete them; leaving them is how
`timeblock.jsx:906` came to describe an app that does not exist (*"past bed it
runs into the red, and past that it runs into tomorrow"*).
