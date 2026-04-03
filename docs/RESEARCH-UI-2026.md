# Standout Web UI in 2026: Research Findings for Boil

Research conducted April 2026. Findings ranked by impact-to-effort for a single-file PWA targeting Firefox on GrapheneOS (Android) as the primary platform.

---

## Impact Matrix

| Technique | Visual Impact | Effort | Mobile-safe | Single-file | Firefox Mobile | Priority |
|---|---|---|---|---|---|---|
| WebGL 2 water shaders | **Very High** | Medium | Yes (0.5x DPR) | Yes (inline GLSL) | Yes | **1** |
| Procedural water audio (AudioWorklet) | **High** | Medium | Yes | Yes (Blob URL) | Yes | **2** |
| CSS `@starting-style` | Medium | **Very Low** | Yes | Yes | Yes | **3** |
| View Transitions API | Medium-High | Low | Yes | Yes | Yes (133+) | **4** |
| CSS `linear()` spring easing | Medium | **Very Low** | Yes | Yes | Yes | **5** |
| Relative oklch() color syntax | Low-Medium | **Very Low** | Yes | Yes | Yes | **6** |
| Spring physics (JS, ~20 lines) | Medium | Low | Yes | Yes | Yes | **7** |
| iOS haptics (checkbox-switch hack) | Low | Low | iOS only | Yes | N/A | **8** |
| WebGPU compute shaders | **Very High** | High | No (FF Android) | Yes | **No** | Watch |
| CSS anchor positioning | Low | Low | Yes | Yes | Yes (149+) | Nice-to-have |
| Scroll-driven animations | Medium | Low | No (FF flag only) | Yes | **No** | Watch |
| Paint Worklets (Houdini) | Medium | Medium | No | Yes | **No** | Dead |
| Rive / Lottie | Medium | Low | Yes | **No** (runtime) | Yes | Skip |

---

## Tier 1: Highest Impact, Feasible Now

### A. WebGL 2 Water Shaders

**What**: Replace Canvas 2D heightfield water with a GPU fragment shader. Real-time caustics, refraction, volumetric light, foam — all impossible in Canvas 2D.

**Why it's the #1 upgrade**: The water IS the product. A lighting-capable water surface is the single largest visual quality jump available. The current heightfield simulation is clever but flat — no specular highlights, no caustics, no depth.

**Feasibility**: WebGL 2 is universal on modern mobile browsers including Firefox Android. Shaders are just strings — fully inlineable. The minimal boilerplate is ~50 lines of JS (create canvas, compile shaders, set uniforms, draw full-screen quad per frame).

**Recommended approach** (80-120 lines GLSL):
- Sine-wave displacement for surface shape (replaces current heightfield or composites with it)
- FBM noise for organic surface texture
- Voronoi caustics for the "boiling" effect
- Fresnel-based color gradient (surface vs depth)
- Render at 0.5x DPR, pause when `document.hidden`, disable under `batterySaver`

**Mobile performance**: Fragment shaders under ~50 ops/pixel run at 60fps on phone GPUs. Thermal throttling is the main risk — mitigate with DPR reduction and `batterySaver` bypass.

**AI workflow**: LLMs generate working GLSL for water effects on first attempt for simple-to-moderate complexity. Iterative refinement with visual feedback produces good results. Shadertoy has hundreds of reference implementations. Tools: ShaderGPT, ChatGL, or just Claude with a "generate a WebGL 2 water fragment shader" prompt.

**Key reference shaders**: "Seascape" by TDM (~80 lines), "Water Caustics" by Dave Hoskins (~60 lines), various 2D water surfaces (30-50 lines).

### B. Procedural Water Audio via AudioWorklet

**What**: Continuous ambient water soundscape synthesized in real-time, modulated by water level. No audio files.

**Why it matters**: NEUROSCIENCE.md identifies this as the #1 gap. Buxton et al.'s meta-analysis: water sounds are the most effective natural sound category for positive affect (Hedges' g = 1.63 for natural sounds overall). Currently Boil has only discrete sound effects.

**Architecture** (all inline, zero files):

```
AudioWorklet (via Blob URL — works in all browsers including Firefox)
├── Base layer: bandpass-filtered white noise (~200-800Hz, LFO-modulated)
├── Bubble layer: stochastic short sine oscillators (10-20ms, random pitch)
├── Surface detail: granular noise bursts (Gaussian envelope, random pitch mod)
└── All parameters modulated by water level (0-100%)
```

**Water level → sound mapping**:
- Low water: quiet, sparse bubbles, low filter cutoff
- Mid water: richer noise bed, moderate bubble density
- High water / near completion: thicker texture, higher cutoff, more bubbles → anticipatory build (Salimpoor's caudate dopamine)

**Inline AudioWorklet pattern**: Stringify processor class → `new Blob([code], {type:'text/javascript'})` → `URL.createObjectURL()` → `audioContext.audioWorklet.addModule(url)`. Confirmed working in Chrome, Firefox, Safari. No external files.

**Sync with visuals**: On each rAF, read water level from state, set AudioParam values via `setTargetAtTime()`. AudioParams run on the audio clock — stays synchronized regardless of main-thread jank.

**Mobile CPU**: Audio thread is real-time priority, separate from layout/paint. Pre-allocate buffers, zero allocation in `process()`. Suspend AudioContext when hidden or battery-saving.

### C. CSS @starting-style

**What**: Animate elements appearing from `display: none` in pure CSS — no JS timing hacks.

**Browser support**: Chrome 117+, Firefox 129+, Safari 17.5+. All mobile. Baseline.

**Application in Boil**: Toasts, modals, task card entry, sheet panels. Currently likely using JS class toggling with setTimeout for entry animations. `@starting-style` eliminates that entirely.

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s;
}
@starting-style {
  .toast {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

**Why it ranks high**: Near-zero effort, removes JS complexity, aligns with "subtract before adding."

### D. View Transitions API (same-document)

**What**: Browser-managed animated transitions between DOM states. Replaces manual FLIP choreography.

**Browser support**: Chrome 111+, Firefox 133+, Safari 18+. All mobile.

**Application in Boil**: Begin screen → timer view, task editing transitions, screen state changes. Wrap state changes in `document.startViewTransition(() => { /* update DOM */ })`. The browser snapshots before/after and cross-fades with `::view-transition-*` pseudo-elements controllable via CSS.

**Effort**: Low — wrap existing state-change functions in `startViewTransition()`, add CSS rules for the pseudo-elements.

---

## Tier 2: Quick Wins

### E. CSS `linear()` Spring Easing

Pure CSS spring/bounce curves via computed stop points. No JS for non-interactive animations.

**Use cases**: Bubble pop animations, card entry, completion celebrations, FAB press feedback.

**Tools**: CSS Spring Easing Generator computes stop points from stiffness/damping/mass → paste into CSS.

**Browser support**: Chrome 113+, Firefox 112+, Safari 17.2+. Universal.

### F. Relative oklch() Color Syntax

Derive all color variants in CSS instead of JS:

```css
.card-hover {
  background: oklch(from var(--task-color) calc(l + 0.05) c h);
}
.card-active {
  background: oklch(from var(--task-color) calc(l - 0.1) c h);
}
```

Eliminates JS color math for hover/active/disabled states. Simplifies the task color system.

**Browser support**: Chrome 111+, Firefox 128+, Safari 16.4+. Universal.

### G. JS Spring Physics (~20 lines)

For interactive/dynamic animations where CSS `linear()` doesn't apply (drag, gesture response):

```js
// Damped harmonic oscillator
// F = -stiffness * x - damping * v
// v += F/mass * dt, x += v * dt
```

Three parameters: stiffness, damping, mass. Springs naturally handle interruption (key advantage over duration-based easing — you can retarget mid-animation). The `wobble` library (1.7KB) is a clean reference implementation if needed.

**Use cases**: Water surface response to interaction, bubble physics, drag-and-drop task reordering, gesture momentum.

### H. iOS Haptics via Checkbox-Switch Hack

`navigator.vibrate()` doesn't work on iOS. Safari 17.4+ supports `<input type="checkbox" switch>` which triggers native haptic feedback on toggle. The trick: create a hidden switch, programmatically click its label → system haptic fires.

**Library reference**: `ios-haptics` (github.com/tijnjh/ios-haptics) wraps this pattern.

**Application**: If Boil ever targets iOS users, this is the only web-based haptic path.

---

## Tier 3: Watch / Future

### WebGPU Compute Shaders

**Status**: Chrome ships it. Firefox enabled on Windows/macOS (v141-145) but **not Android**. Safari requires iOS 26.

**What it enables**: GPU-side particle physics, 1M-particle fluid sim, post-processing passes. Major leap over WebGL 2.

**Single-file feasibility**: Yes — WGSL shaders are strings, the `webgpu-examples` repo by tsherif has all-in-one HTML files.

**Blocker**: Firefox on Android. Monitor for 2026 landing. When it arrives, progressive enhancement (Canvas 2D → WebGL 2 → WebGPU) is the path.

### Scroll-Driven Animations

**Status**: Chrome 115+, Safari 18+, Firefox flag-only. In Interop 2026 — likely to ship in Firefox later this year.

**Application**: Tie task list scroll position to ambient effects, parallax water depth.

### CSS Anchor Positioning

**Status**: Chrome 127+, Firefox 149+, Safari 26.1+. Recent Firefox addition.

**Application**: Tooltip/popover positioning without JS math. Progressive enhancement candidate.

---

## Not Recommended

| Tool | Why not |
|---|---|
| **Rive** | 200KB WASM runtime, can't inline, violates no-dependency constraint |
| **Lottie** | 60KB runtime, marginal benefit over procedural code |
| **Motion Canvas** | Requires Node.js build step, exports video not interactive web |
| **Paint Worklets** | No Firefox or Safari support. Dead for cross-browser |
| **v0 / bolt.new** | Target React/Next.js. Output unusable in single-file vanilla HTML |
| **HRTF spatial audio** | Expensive on mobile, overkill for a 2D water app |

---

## AI Workflow Recommendations

**Best use case**: Iterative GLSL shader generation. Describe the effect, generate, preview in browser, refine. LLMs produce working water shaders on first attempt for moderate complexity.

**Good use cases**: CSS animations, Canvas 2D particle systems, Web Audio procedural sound code.

**Workflow**: Describe → Generate → Test in browser → Refine prompt or hand-edit → Ship. Expect 60-80% quality on first generation, manual tuning for the remaining polish.

**Tools**: Claude (best for WebGL specifically per user reports), ShaderGPT for live GLSL preview, ChatGL for quick shader iteration.

**Limitation**: Complex choreographed animation, physically accurate fluid sim, and nuanced timbral audio design still require hand-tuning. LLMs hallucinate GLSL functions and produce performance-unaware code (objects in hot loops, unnecessary branching).

---

## Recommended Prototyping Order

1. **WebGL 2 water shader** — Highest visual impact. Start with a simple sine-wave + FBM noise shader, iterate with Claude to add caustics and Fresnel lighting. Composite as a layer behind existing DOM.

2. **AudioWorklet water soundscape** — Highest sensory impact. Implement the filtered-noise + stochastic-bubble architecture inline via Blob URL. Wire water level to synthesis parameters.

3. **@starting-style + View Transitions** — Quick CSS wins that modernize all screen transitions and element entry animations with minimal code.

4. **Spring physics** — Replace easing curves with spring-based motion for interactive elements. Use `linear()` in CSS where possible, JS spring for dynamic/interactive cases.

---

## Browser Support Summary (Firefox Mobile on GrapheneOS)

| API | Status |
|---|---|
| WebGL 2 | Supported |
| WebGPU | Not yet (flag only) |
| AudioWorklet | Supported |
| AudioWorklet via Blob URL | Supported |
| View Transitions (same-doc) | Supported (133+) |
| @starting-style | Supported (129+) |
| linear() easing | Supported (112+) |
| oklch relative color | Supported (128+) |
| CSS anchor positioning | Supported (149+) |
| navigator.vibrate() | Supported |
| Scroll-driven animations | Flag only |
| Paint Worklets | Not supported |
