import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";

/* =========================================================================
   TOKENS
   Type: 7 roles, no exceptions. Tracking moves inversely to size.
   Colour: Swiss poster inks. Tints hand tuned in OKLab to one lightness
           (L 0.901 to 0.916) so every hue reads as the same family.
   ========================================================================= */

const SLOT_MIN = 5;      /* storage resolution: where time is placed */
const TICK_MIN = 15;     /* the unit projected time is drawn from */
const KEY = "timeblock:v6:state";
const BAK = "timeblock:v6:backup";
/* v5 already stored five minute slots but every save stamped itself v:4, so its
   files cannot be trusted to say what they are. The KEY is the truth instead: a v5
   file is five minute data whatever it claims, a v4 file is fifteen. */
const OLD5 = ["timeblock:v5:state", "timeblock:v5:backup"];
const OLD4 = ["timeblock:v4:state", "timeblock:v4:backup"];
const KEEP_DAYS = 21;
const MILESTONE = 30 * 60;
/* 0.8px a minute is the keystone of the whole system: 5 minutes (one storage
   bucket) is exactly 4px (one baseline unit), a 30 minute brick is 24px, an hour is
   48px, a 16 hour day is 768px. The time grid and the type grid are the same grid. */
const PXM = 0.8;
const BASE = 4;
const BRICK = 30;   /* the block is built from half hours, aligned to the day grid */
/* Past the deadline the field is multiplied by one scalar, ground and blocks together.
   A multiply is monotone per channel, so ground > tint > solid cannot invert — which is
   exactly what a dark ground does to cobalt and violet, whose solids are dark enough that
   any night tint bright enough to clear the ground crosses them. Below 0.84 the block
   labels drop under the readable floor, so the dial has almost no travel: if this reads as
   nothing on a phone the answer is to remove it, not to deepen it. */
const DIM_K = 0.86;

const P = {
  paper: "#EFEFEA",
  sheet: "#F7F7F3",
  ink: "#17171C",
  mute: "#6B6B63",   /* 4.66:1 on paper. the old #8C8C84 was 2.94:1 and failed */
  hair: "#D6D6CD",
  ghost: "#E0E0D8",
  well: "#E5E5DE",
};

const INKS = [
  { name: "Signal red", solid: "#CE3118", tint: "#FFBFAF", wash: "#FFE1D9", on: P.sheet },
  { name: "Orange",     solid: "#FF6B00", tint: "#FFC2A2", wash: "#FFE3D3", on: P.ink },
  { name: "Chrome",     solid: "#FFC400", tint: "#EBD197", wash: "#F6EACF", on: P.ink },
  { name: "Grass",      solid: "#2E9E1F", tint: "#B5E3AE", wash: "#DCF3D9", on: P.ink },
  { name: "Jade",       solid: "#00A88E", tint: "#AEE1D3", wash: "#D9F1EA", on: P.ink },
  { name: "Cobalt",     solid: "#2438D6", tint: "#B8D3FF", wash: "#DDEBFF", on: P.sheet },
  { name: "Violet",     solid: "#7B2FF7", tint: "#D5C9FF", wash: "#EBE6FF", on: P.sheet },
  { name: "Magenta",    solid: "#D01070", tint: "#FFB9D2", wash: "#FFDEEA", on: P.sheet },
];
const PALETTE = INKS.map((i) => i.solid);
/* red is a member of the palette now, not an orphan introduced for alarms */
const ALARM = INKS[0];

function ink(hex) {
  return INKS.find((i) => i.solid === hex) || { solid: hex, tint: hex + "33", wash: hex + "18", on: P.ink };
}

/* the same sheet with less light on it. derived, never authored, so a ninth ink costs
   nothing and no two families can drift apart. */
const dim = (hex) =>
  "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * DIM_K).toString(16).padStart(2, "0")).join("");
const DUSK = dim(P.paper);

const F = '"Archivo", ui-rounded, -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif';

/* Tracking is a function of size, so it can never be guessed or overridden.
   Big type tightens, small caps open up, and the curve is monotone. */
const track = (px) => `${(-0.052 * Math.pow(px / 64, 0.9)).toFixed(4)}em`;
const caps = (px) => `${(0.3 - 0.012 * px).toFixed(3)}em`;
/* line boxes are a count of baseline units, not a ratio */
const leading = (units) => `${units * BASE}px`;

const T = {
  hero: { fontSize: 52, fontWeight: 800, fontStretch: "112%", letterSpacing: track(52), lineHeight: leading(11) },
  display: { fontSize: 104, fontWeight: 800, fontStretch: "125%", letterSpacing: track(104), lineHeight: leading(22) },
  title:   { fontSize: 30, fontWeight: 800, fontStretch: "108%", letterSpacing: track(30), lineHeight: leading(8) },
  data:    { fontSize: 22, fontWeight: 700, fontStretch: "105%", letterSpacing: track(22), lineHeight: leading(6) },
  body:    { fontSize: 16, fontWeight: 500, letterSpacing: track(16), lineHeight: leading(6) },
  action:  { fontSize: 15, fontWeight: 700, letterSpacing: track(15), lineHeight: leading(5) },
  label:   { fontSize: 13, fontWeight: 650, letterSpacing: track(13), lineHeight: leading(4) },
  micro:   { fontSize: 11, fontWeight: 700, letterSpacing: caps(11), lineHeight: leading(3), textTransform: "uppercase" },
  chip:    { fontSize: 10.5, fontWeight: 800, letterSpacing: caps(10.5), lineHeight: leading(3), textTransform: "uppercase" },
  nano:    { fontSize: 9.5, fontWeight: 800, letterSpacing: caps(9.5), lineHeight: leading(3), textTransform: "uppercase" },
};

const S = { 1: 4, 2: 8, 3: 12, 4: 20, 5: 32, 6: 52 };
/* radius scale, grid values only. shape-state radii are computed from the
   element's own size instead (Rule 4), so they are literal by design. */
const R = { sm: 4, md: 12, lg: 20, xl: 24, pill: 999 };

/* Motion is physics, not curves. Two schemes, per the 2026 consensus: a spatial
   spring that overshoots for anything that moves or changes shape, and an effects
   spring that settles dead for colour and opacity. Emitted as CSS linear() so a
   real damped spring runs on the compositor. */
function spring(k, c, dur, steps = 34) {
  const w = Math.sqrt(k);
  const z = c / (2 * Math.sqrt(k));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (dur / 1000);
    let x;
    if (z < 1) {
      const wd = w * Math.sqrt(1 - z * z);
      x = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    } else {
      x = 1 - Math.exp(-w * t) * (1 + w * t);
    }
    pts.push(Math.round(x * 1e4) / 1e4);
  }
  pts[pts.length - 1] = 1;
  return `linear(${pts.join(",")})`;
}

const SPATIAL = spring(210, 20, 440);   /* visible overshoot, about 5% */
const EFFECTS = spring(260, 34, 240);   /* critically damped, no bounce */
const SNAPPY = spring(430, 27, 320);    /* fast overshoot, for the reward beat */

const M = {
  tap: `130ms ${EFFECTS}`,
  state: `260ms ${EFFECTS}`,
  promo: `440ms ${SPATIAL}`,
  shape: `440ms ${SPATIAL}`,
  snap: `320ms ${SNAPPY}`,
  exit: "160ms cubic-bezier(.4,0,1,1)",
};

const PRAISE = ["goal met", "that is the goal", "locked in", "banked", "clean"];

const DEFAULT_CFG = {
  timers: [
    { id: "a", name: "Deep work", color: "#2438D6", goal: 240 * 60, perWeek: 0 },
    { id: "b", name: "Chinese",   color: "#FF6B00", goal: 60 * 60,  perWeek: 0 },
    { id: "c", name: "Move",      color: "#2E9E1F", goal: 30 * 60,  perWeek: 4 },
    { id: "d", name: "Reading",   color: "#7B2FF7", goal: 30 * 60,  perWeek: 0 },
  ],
  wake: "07:00",
  bed: "23:00",
  weekStart: 1,
  sound: true,
  notify: false,
};

/* running[id] is not when the timer was started. It is the moment that timer has been
   paid up to — a watermark. Every path credits from the watermark to now and then
   moves it, so nothing can be counted twice and nothing can be dropped, whether the
   next event is a tick, a tap, a tab going away or the phone killing the process.
   wm marks a log whose running values follow that rule; files written before it are
   read the old way once and then rewritten. */
const DEFAULT_LOG = { days: {}, running: {}, flowStart: null, savedAt: 0, wakes: {}, wm: 1 };

/* ============================== time ============================== */

const pad = (n) => String(n).padStart(2, "0");
const toMin = (hhmm) => {
  const [h, m] = String(hhmm || "07:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const hour12 = (mins) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60) % 12;
  return h === 0 ? 12 : h;
};
const clock = (mins) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${hour12(m)}:${pad(m % 60)}`;
};
/* the margin runs on 24 hour time. Four characters, never ambiguous, never
   wraps, and it sorts the way the day does. */
const stampTime = (mins) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};
/* SLOT_MIN is the grid the column is drawn on and the finest thing storage knows, so a
   projection assembled from a dozen self-set goals may not claim a minute inside it.
   "11h 19m" asserts a precision nothing in the system ever had. */
const round5 = (min) => Math.round(min / SLOT_MIN) * SLOT_MIN;
const suffix = (mins) => ((((Math.round(mins) % 1440) + 1440) % 1440) < 720 ? "am" : "pm");
const dayKey = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const minOfDay = (ms) => {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
};
const nextMidnight = (ms) => {
  const d = new Date(ms);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
};
/* Bed is a wall clock time, not a length of day. This mattered once a day could
   begin at its own edge: with a 07:00 wake and a 23:00 bed the window is 16h, but
   if you tap "start Mon" at 01:00 then the day begins at 01:00 and bed is still
   23:00, four hours short of that window, not 17:00. So the deadline is found by
   asking when cfg.bed next comes round after this day began, never by adding a
   duration to the edge. Clamped to the day's own end so it can never be drawn
   inside tomorrow. */
function bedMin(cfg, log, f) {
  let bed = dateStart(f.key) + toMin(cfg.bed) * 60000;
  while (bed <= f.start) bed += 86400000;
  const end = edgeAt(cfg, log, dayKey(f.start + 86400000));
  return Math.max(15, Math.min(bed, end) - f.start) / 60000;
}
/* storage covers the whole logical day, not just the waking window, so work after
   bedtime has real slots to land in instead of piling into the last cell */
const SLOTS_DAY = Math.ceil(1440 / SLOT_MIN);
const slotCountOf = () => SLOTS_DAY;

const dateStart = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
};

/* Where a day begins. Normally the wake time, but a single date can carry its own
   edge, which is how "I slept, and I am starting a new day at 1am" gets expressed
   without inventing a second concept. */
const edgeAt = (cfg, log, key) =>
  dateStart(key) + ((log && log.wakes && log.wakes[key] != null ? log.wakes[key] : toMin(cfg.wake)) * 60000);

/* The day you are in: its key and the instant it began. With a 7am wake, 1am Sunday
   still belongs to Saturday, so a session past midnight books to the day it belongs
   to and you never clock in for yesterday. Wake is the boundary, bed is a deadline. */
function frame(cfg, log, ms) {
  const k = dayKey(ms);
  const e = edgeAt(cfg, log, k);
  if (ms >= e) return { key: k, start: e };
  const prev = dayKey(ms - 86400000);
  return { key: prev, start: edgeAt(cfg, log, prev) };
}
const frameEnd = (cfg, log, f) => edgeAt(cfg, log, dayKey(f.start + 86400000));
const logicalKey = (cfg, log, ms) => frame(cfg, log, ms).key;
/* noon of a logical date: a DST safe reference for week and streak maths */
const refTime = (key) => dateStart(key) + 43200000;

function slotAt(ms, cfg, log) {
  const f = frame(cfg, log, ms);
  const rel = (ms - f.start) / 60000;
  const idx = Math.max(0, Math.min(Math.floor(rel / SLOT_MIN), SLOTS_DAY - 1));
  return { idx, nextBoundary: f.start + (idx + 1) * SLOT_MIN * 60000, f };
}

/* minutes since this day began. no wrapping, no branch, no heuristic. */
function dayPos(cfg, log, now) {
  const f = frame(cfg, log, now);
  const total = bedMin(cfg, log, f);
  const cursor = Math.max(0, (now - f.start) / 60000);
  return { cursor, phase: cursor <= total ? "in" : "late", total, startMin: minOfDay(f.start), key: f.key };
}

/* numerals and their units are not the same thing typographically */
function split(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h && m) return [`${h}`, "h", `${pad(m)}`, ""];
  if (h) return [`${h}`, "h", "", ""];
  return [`${m}`, "m", "", ""];
}
function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
function fmtShort(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
function fmtMargin(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  if (h && m) return `${h}h${pad(m)}`;
  if (h) return `${h}h`;
  return `${m}m`;
}
function fmtTight(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h${m ? pad(m) : ""}` : `${m}m`;
}

/* ============================== data ops ============================== */

function addSpan(log, id, from, to, cfg) {
  if (!(to > from)) return log;
  const days = { ...log.days };
  let cur = from;
  let guard = 0;
  while (cur < to && guard++ < 6000) {
    const { idx, nextBoundary, f } = slotAt(cur, cfg, log);
    const key = f.key;
    const end = Math.min(to, nextBoundary, frameEnd(cfg, log, f));
    const secs = (end - cur) / 1000;
    const day = { ...(days[key] || {}) };
    const prev = day[id];
    const rec = prev ? { ...prev, slots: { ...prev.slots } } : { sec: 0, done: false, slots: {} };
    rec.sec += secs;
    rec.slots[idx] = (rec.slots[idx] || 0) + secs;
    day[id] = rec;
    days[key] = day;
    cur = end;
  }
  return { ...log, days };
}

function nudgeTime(log, id, deltaSec, cfg) {
  const key = logicalKey(cfg, log, Date.now());
  const day = { ...(log.days[key] || {}) };
  const prev = day[id];
  const rec = prev ? { ...prev, slots: { ...prev.slots } } : { sec: 0, done: false, slots: {} };
  if (deltaSec > 0) {
    /* fill the current slot, then walk backwards, so added time never exceeds
       what a slot can physically hold and never becomes invisible */
    let add = deltaSec;
    let idx = slotAt(Date.now(), cfg, log).idx;
    while (add > 0.01 && idx >= 0) {
      const room = SLOT_MIN * 60 - (rec.slots[idx] || 0);
      if (room > 0) {
        const put = Math.min(add, room);
        rec.slots[idx] = (rec.slots[idx] || 0) + put;
        rec.sec += put;
        add -= put;
      }
      idx--;
    }
  } else {
    let left = Math.min(-deltaSec, rec.sec);
    rec.sec = Math.max(0, rec.sec - left);
    for (const k of Object.keys(rec.slots).map(Number).sort((x, y) => y - x)) {
      if (left <= 0) break;
      const take = Math.min(rec.slots[k], left);
      rec.slots[k] -= take;
      left -= take;
      if (rec.slots[k] <= 0.01) delete rec.slots[k];
    }
  }
  day[id] = rec;
  return { ...log, days: { ...log.days, [key]: day } };
}

function prune(log) {
  const cutoff = Date.now() - KEEP_DAYS * 86400000;
  const days = {};
  for (const k of Object.keys(log.days || {})) {
    const [y, m, d] = k.split("-").map(Number);
    if (new Date(y, m - 1, d).getTime() >= cutoff) days[k] = log.days[k];
  }
  return { ...log, days };
}

function weekDays(weekStart, now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const back = (d.getDay() - weekStart + 7) % 7;
  const start = d.getTime() - back * 86400000;
  return Array.from({ length: 7 }, (_, i) => ({
    key: dayKey(start + i * 86400000),
    future: i > back,
    today: i === back,
    initial: new Date(start + i * 86400000).toLocaleDateString(undefined, { weekday: "narrow" }).slice(0, 1),
  }));
}

const qualifies = (rec, t) => (t.goal ? !!rec?.done : (rec?.sec || 0) >= 60);

function weekProgress(log, t, weekStart, now) {
  const days = weekDays(weekStart, now);
  let hit = 0, ahead = 0, todayOk = false;
  for (const d of days) {
    if (d.future) { ahead++; continue; }
    const ok = qualifies(log.days[d.key]?.[t.id], t);
    if (ok) hit++;
    if (d.today) todayOk = ok;
  }
  const target = t.perWeek || 0;
  const need = Math.max(0, target - hit);
  const open = ahead + (todayOk ? 0 : 1);
  return { hit, target, need, met: target > 0 && hit >= target, tight: target > 0 && need > open };
}

function weekStats(log, id, weekStart, now) {
  const days = weekDays(weekStart, now);
  let total = 0;
  let ran = 0;
  for (const d of days) {
    const rec = log.days[d.key]?.[id];
    if (rec && rec.sec >= 60) { total += rec.sec; ran += 1; }
  }
  return { total, ran, avg: ran ? total / ran : 0, days };
}

function streak(log, id, now) {
  let n = 0;
  for (let i = 0; i < KEEP_DAYS; i++) {
    const rec = log.days[dayKey(now - i * 86400000)]?.[id];
    if (rec?.done) n++;
    else if (i > 0) break;
  }
  return n;
}

function projectDay(cfg, log, today, running, now) {
  const { cursor, phase, total, startMin } = dayPos(cfg, log, now);
  const plan = [];
  const late = new Set();
  let head = cursor;
  for (const t of [...cfg.timers].sort((a, b) => (running[b.id] ? 1 : 0) - (running[a.id] ? 1 : 0))) {
    if (!t.goal) continue;
    if (weekProgress(log, t, cfg.weekStart, now).met) continue;
    const left = Math.max(0, t.goal - (today[t.id]?.sec || 0)) / 60;
    if (left < 0.5) continue;
    if (head + left > total + 0.5) late.add(t.id);
    plan.push({ key: t.id, top: head, h: left, color: t.color, name: t.name, live: !!running[t.id] });
    head += left;
  }
  return { cursor, phase, total, startMin, plan, head, late, spill: Math.max(0, head - total) };
}

/* ============================== sound and touch ============================== */

let AC = null;
function audio() {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    return AC;
  } catch (e) { return null; }
}
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];
function play(notes, { vol = 0.09, dur = 0.42, gap = 0.075, delay = 0 } = {}) {
  const ctx = audio();
  if (!ctx) return;
  notes.forEach((f, i) => {
    const t0 = ctx.currentTime + delay + i * gap;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  });
}
const CUE = {
  start: () => play([SCALE[2], SCALE[4]], { vol: 0.05, dur: 0.2, gap: 0.055 }),
  pause: () => play([SCALE[3], SCALE[1]], { vol: 0.04, dur: 0.22, gap: 0.055 }),
  tick: () => play([SCALE[5]], { vol: 0.022, dur: 0.07 }),
  flow: (n) => play([SCALE[Math.min(n, 5)], SCALE[Math.min(n + 2, 8)]], { vol: 0.06, dur: 0.32, gap: 0.07 }),
  /* payoff lands on beat two of the choreography, not beat one */
  goal: () => play([SCALE[0], SCALE[2], SCALE[3], SCALE[5]], { vol: 0.1, dur: 0.55, gap: 0.085, delay: 0.09 }),
  week: () => play([SCALE[2], SCALE[3], SCALE[5], SCALE[7]], { vol: 0.1, dur: 0.62, gap: 0.09, delay: 0.09 }),
  perfect: () => play([SCALE[0], SCALE[2], SCALE[3], SCALE[5], SCALE[7], SCALE[8]], { vol: 0.1, dur: 0.75, gap: 0.1 }),
};
const H = {
  tap: 5, start: [0, 14], pause: [0, 8, 40, 8], pip: 4, hold: 14,
  flow: [0, 12, 60, 12, 60, 20], goal: [0, 30, 60, 30, 60, 120],
  week: [0, 22, 50, 22, 50, 22, 50, 160], perfect: [0, 40, 80, 40, 80, 40, 140, 220],
};
const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
/* whether this browser can hold a notification for a future moment. Without it there
   is no way for a page with no server behind it to wake itself once the phone has
   closed it, and the settings copy has to admit that rather than promise otherwise. */
const BOOKABLE = typeof window !== "undefined" && typeof Notification !== "undefined" &&
  typeof window.TimestampTrigger !== "undefined" && "showTrigger" in Notification.prototype;
function notify(title, body, tag) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    /* Android Chrome throws on the Notification constructor: on a phone the only
       way through is the service worker registration. Desktop takes either. */
    const reg = typeof window !== "undefined" && window.__sw;
    /* tagged, so a repeat replaces itself instead of stacking — and so the copy the
       service worker booked in advance and the one fired live are the same one */
    const key = tag || "timeblock:" + title;
    if (reg) reg.showNotification(title, { body, tag: key, vibrate: [200, 100, 200] });
    else new Notification(title, { body });
  } catch (e) {}
}

/* v4 stored 15 minute buckets. index i covered the same minutes as v5 indexes
   3i..3i+2, so the old block lands at the start of the time it always meant. */
/* fifteen minute slots to five: each old slot spills forward into at most three new
   ones. Indices are clamped, because a bad multiply used to push work past the end
   of the day where it vanished. */
function migrate15to5(saved) {
  const days = {};
  for (const [dk, day] of Object.entries(saved.log.days || {})) {
    const nd = {};
    for (const [id, rec] of Object.entries(day)) {
      const slots = {};
      for (const [i, sec] of Object.entries(rec.slots || {})) {
        let left = sec;
        let k = Number(i) * 3;
        while (left > 0.01 && k < Number(i) * 3 + 3) {
          if (k >= 0 && k < SLOTS_DAY) {
            const put = Math.min(left, SLOT_MIN * 60);
            slots[k] = (slots[k] || 0) + put;
            left -= put;
          }
          k++;
        }
      }
      nd[id] = { ...rec, slots };
    }
    days[dk] = nd;
  }
  return { ...saved, v: 6, log: { ...saved.log, days } };
}

async function loadState() {
  const tryKey = async (k) => {
    try {
      const r = await window.storage.get(k);
      if (!r || !r.value) return null;
      const p = JSON.parse(r.value);
      if (!p || !p.cfg || !p.log || !Array.isArray(p.cfg.timers)) return null;
      return p;
    } catch (e) { return null; }
  };
  /* current, then last generation at the same resolution, then the old resolution */
  for (const k of [KEY, BAK, ...OLD5]) {
    const got = await tryKey(k);
    if (got) return { ...got, v: 6 };
  }
  for (const k of OLD4) {
    const got = await tryKey(k);
    if (got) return migrate15to5(got);
  }
  return null;
}

/* ============================== primitives ============================== */

/* a numeral and its unit are two different type styles */
function Num({ sec, role = "data", unitScale = 0.42, color = P.ink, dim = 0.45 }) {
  const [a, ua, b] = split(sec);
  const st = T[role];
  return (
    <span style={{ ...st, color, display: "inline-flex", alignItems: "baseline" }}>
      {a}
      {/* Rule 3: the unit is derived from its numeral, never chosen. 0.42x, one
          weight lighter, tracking zero, 42% ink. */}
      <span style={{ fontSize: st.fontSize * unitScale, fontWeight: 600, fontStretch: "100%", letterSpacing: "0", opacity: dim, marginLeft: st.fontSize * 0.03 }}>{ua}</span>
      {b && <span style={{ marginLeft: st.fontSize * 0.05 }}>{b}</span>}
    </span>
  );
}

/* the grab handle now tells the truth: this sheet drags, rubber bands and flicks away */
function Sheet({ open, onClose, title, children }) {
  const [y, setY] = useState(0);
  const [live, setLive] = useState(false);
  const drag = useRef(null);
  const box = useRef(null);
  useEffect(() => { if (open) { setY(0); setLive(false); } }, [open]);
  if (!open) return null;

  const start = (e) => {
    const el = box.current;
    if (el && el.scrollTop > 0) return;
    drag.current = { y0: e.clientY, t0: Date.now(), last: e.clientY };
    setLive(true);
  };
  const moveD = (e) => {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.y0;
    drag.current.last = e.clientY;
    setY(dy > 0 ? dy : dy / 4);   /* rubber band upward */
  };
  const endD = () => {
    if (!drag.current) return;
    const dy = drag.current.last - drag.current.y0;
    const v = dy / Math.max(1, Date.now() - drag.current.t0);
    drag.current = null;
    setLive(false);
    if (dy > 110 || v > 0.55) { buzz(H.tap); onClose(); } else setY(0);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60, background: "rgba(23,23,28,.32)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fade 160ms ease",
      }}
    >
      <div
        ref={box}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460, background: P.sheet,
          borderRadius: `${R.xl}px ${R.xl}px 0 0`,
          padding: `${S[2]}px ${S[4]}px calc(${S[5]}px + env(safe-area-inset-bottom))`,
          animation: `up 440ms ${SPATIAL}`,
          maxHeight: "90vh", overflowY: "auto", overscrollBehavior: "contain",
          transform: `translateY(${y}px)`, transition: live ? "none" : `transform ${M.promo}`,
          boxShadow: "0 -24px 60px rgba(23,23,28,.16)",
        }}
      >
        <div
          onPointerDown={start} onPointerMove={moveD} onPointerUp={endD} onPointerCancel={endD}
          style={{ padding: `${S[2]}px 0 ${S[3]}px`, cursor: "grab", touchAction: "none" }}
        >
          <div style={{ width: 40, height: 4, borderRadius: R.sm, background: P.hair, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: S[3], marginBottom: S[4] }}>
          {title && (
            <div style={{ ...T.title, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", maskImage: "linear-gradient(90deg,#000 88%,transparent)", WebkitMaskImage: "linear-gradient(90deg,#000 88%,transparent)" }}>
              {title}
            </div>
          )}
          <button
            onClick={onClose}
            style={{ ...T.nano, flex: "none", background: "none", border: "none", padding: `${S[2]}px 0`, cursor: "pointer", color: P.mute }}
          >
            done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* The OS time picker and the OS dropdown were the only two things on the screen
   drawn by someone else: system font, AM/PM, a chrome arrow. Both are replaced by
   the same stepper and segment language used everywhere else. */
function TimeField({ value, onChange, buzz }) {
  const step = (mins) => {
    const [h, m] = value.split(":").map(Number);
    let t = (h * 60 + m + mins + 1440) % 1440;
    buzz(H.tap);
    onChange(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  };
  const nudge = (label, mins) => (
    <button onClick={() => step(mins)} aria-label={label}
      style={{ ...T.chip, minWidth: 44, minHeight: 44, background: P.sheet, border: "none", borderRadius: R.md,
               color: P.ink, cursor: "pointer", flex: "none" }}>{label}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: S[1], background: P.well, borderRadius: R.md, padding: S[1] }}>
      {nudge("−1h", -60)}
      {nudge("−15", -15)}
      <span style={{ ...T.data, minWidth: 76, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {nudge("+15", 15)}
      {nudge("+1h", 60)}
    </div>
  );
}

function DayPicker({ value, onChange, buzz }) {
  const d = ["S", "M", "T", "W", "T", "F", "S"];
  const full = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return (
    <div style={{ display: "flex", gap: S[1] }}>
      {d.map((ch, i) => (
        <button key={i} onClick={() => { buzz(H.tap); onChange(i); }} aria-label={full[i]}
          style={{ ...T.chip, width: 32, minHeight: 44, border: "none", borderRadius: R.md, cursor: "pointer",
                   background: value === i ? P.ink : P.well, color: value === i ? P.paper : P.ink,
                   transition: `background ${M.state}` }}>{ch}</button>
      ))}
    </div>
  );
}

/* A duration is a length, and this app already knows what a minute is worth: 0.8px,
   the rate the day column is drawn at. So the control that sets a goal is cut from
   the same material as the thing it feeds, at the same scale — a 4h goal here is
   exactly as long as the 4h brick is tall out there. It snaps to the five minute
   bucket storage uses and magnetises to the half hour the day is built from, so the
   values people actually mean are the easy ones to land on. Full bleed, because the
   width of the screen is then a real quantity: about eight hours. */
function GoalBar({ value, color, onChange }) {
  const track = useRef(null);
  const [w, setW] = useState(0);
  const [live, setLive] = useState(false);
  const last = useRef(-1);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    setW(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxMin = w ? Math.floor(w / PXM / SLOT_MIN) * SLOT_MIN : 480;
  const mins = Math.min(maxMin, Math.round(value / 60));

  const set = (raw) => {
    const brick = Math.round(raw / BRICK) * BRICK;
    /* a three minute magnet: wide enough that half hours are easy, narrow enough
       that every five minute step in between is still reachable */
    const snapped = Math.abs(raw - brick) <= 3 ? brick : Math.round(raw / SLOT_MIN) * SLOT_MIN;
    const m = Math.max(0, Math.min(maxMin, snapped));
    if (m === last.current) return;
    buzz(m % BRICK === 0 ? H.tap : H.pip);
    last.current = m;
    onChange(m * 60);
  };
  const at = (e) => {
    const r = track.current.getBoundingClientRect();
    set((e.clientX - r.left) / PXM);
  };

  const hours = [];
  for (let h = 1; h * 60 <= maxMin; h++) hours.push(h);
  const halves = [];
  for (let b = BRICK; b <= maxMin; b += BRICK) if (b % 60) halves.push(b);

  return (
    <div style={{ margin: `0 -${S[4]}px`, userSelect: "none", WebkitUserSelect: "none" }}>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="How much a day"
        aria-valuemin={0}
        aria-valuemax={maxMin}
        aria-valuenow={mins}
        aria-valuetext={mins ? fmtShort(mins * 60) : "no goal"}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = mins; setLive(true); at(e); }}
        onPointerMove={(e) => { if (live) at(e); }}
        onPointerUp={() => setLive(false)}
        onPointerCancel={() => setLive(false)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? BRICK : SLOT_MIN;
          const go = { ArrowRight: mins + step, ArrowUp: mins + step, ArrowLeft: mins - step, ArrowDown: mins - step, Home: 0, End: maxMin }[e.key];
          if (go === undefined) return;
          e.preventDefault();
          last.current = -1;
          set(go);
        }}
        style={{ position: "relative", height: 48, background: P.well, overflow: "hidden", touchAction: "none", cursor: "ew-resize" }}
      >
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: Math.max(0, Math.min(w, mins * PXM)),
          background: color, transition: live ? "none" : `width ${M.snap}`,
        }} />
        {mins > 0 && (
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: Math.min(w - 2, mins * PXM - 2), width: 2,
            background: P.ink, transition: live ? "none" : `left ${M.snap}`,
          }} />
        )}
      </div>
      {/* the ruler is the day grid, not decoration: a tick every half hour brick,
          a taller one and a numeral every hour */}
      <div style={{ position: "relative", height: 18, marginTop: 3 }} aria-hidden="true">
        {halves.map((b) => (
          <i key={b} style={{ position: "absolute", left: b * PXM, top: 0, width: 1, height: 4, background: P.ghost }} />
        ))}
        {hours.map((h) => (
          <span key={h} style={{ position: "absolute", left: h * 60 * PXM, top: 0 }}>
            <i style={{ position: "absolute", left: 0, top: 0, width: 1, height: 6, background: P.hair }} />
            <span style={{ ...T.nano, color: P.mute, position: "absolute", left: 0, top: 8, transform: "translateX(-50%)" }}>{h}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* A quota reads as a week, not as a number pulled from a list. Seven cells, fill n.
   Seven filled is every day, which is what perWeek 0 has always meant — so the state
   that used to be spelled "Any" in the control, "every day" in the value and "Owed
   every day" in the caption is now one shape with one name. */
function WeekBar({ value, color, on, onChange }) {
  const n = value || 7;
  return (
    <div style={{ display: "flex", gap: S[1] }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <button
          key={i}
          onClick={() => {
            /* the haptic counts out loud: one pulse per day of the quota */
            const p = [];
            for (let k = 0; k < i; k++) { if (k) p.push(34); p.push(5); }
            buzz(p);
            onChange(i === 7 ? 0 : i);
          }}
          aria-label={i === 7 ? "every day" : `${i} days a week`}
          aria-pressed={i <= n}
          style={{
            ...T.chip, flex: 1, minHeight: 48, padding: 0, border: "none", borderRadius: R.md,
            cursor: "pointer", fontFamily: F,
            background: i <= n ? color : P.well,
            color: i <= n ? on : P.mute,
            transition: `background ${M.state} ${i * 24}ms, color ${M.state} ${i * 24}ms`,
          }}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => { buzz(H.tap); onChange(!on); }}
      aria-pressed={on}
      style={{
        width: 52, height: 32, borderRadius: 16, border: "none", cursor: "pointer",
        background: on ? P.ink : P.hair, position: "relative", transition: `background ${M.state}`, flex: "none",
      }}
    >
      <span style={{ position: "absolute", top: 4, left: on ? 24 : 4, width: 24, height: 24, borderRadius: 12, background: P.sheet, transition: `left ${M.state}` }} />
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: S[3], minHeight: 56, borderBottom: `1px solid ${P.hair}`, ...T.body }}>
      <span>{label}</span>
      {children}
    </div>
  );
}

function Btn({ children, onClick, tone = "plain", style, label, ...rest }) {
  const tones = {
    plain: { background: P.well, color: P.ink },
    key: { background: P.ink, color: P.sheet },
    bad: { background: "transparent", color: ALARM.solid, boxShadow: `inset 0 0 0 1.5px ${ALARM.tint}` },
  };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      {...rest}
      style={{
        border: "none", borderRadius: R.md, minHeight: 48, padding: `0 ${S[4]}px`,
        ...T.action, fontFamily: F, cursor: "pointer", flex: "none",
        transition: `transform ${M.tap}, background ${M.state}`,
        ...tones[tone], ...style,
      }}
      onPointerDown={(e) => { e.currentTarget.style.transform = "scale(.96)"; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

/* Not confetti. The container overflows and the colour runs out of it, which is
   the same bar language the rest of the app is built from. */
function Overflow({ event }) {
  const ref = useRef(null);
  const bars = useRef([]);
  const raf = useRef(0);
  useEffect(() => {
    if (!event) return;
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = window.innerWidth * dpr;
    cv.height = window.innerHeight * dpr;
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { x, y, w, color } = event;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const bw = w / n;
      bars.current.push({
        x: x + i * bw + 1, w: bw - 2, y, h: 8,
        v: 3 + Math.random() * 3, a: 1, wob: Math.random() * 3, c: color,
        delay: i * 26 + Math.random() * 40,
      });
    }
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const loop = (t) => {
      const el = t - t0;
      ctx.clearRect(0, 0, cv.width, cv.height);
      bars.current = bars.current.filter((b) => b.a > 0);
      for (const b of bars.current) {
        if (el < b.delay) { drawBar(ctx, b); continue; }
        b.v += 0.55;
        b.y += b.v;
        b.h = Math.min(120, b.h + b.v * 0.5);
        if (b.y > window.innerHeight * 0.72) b.a -= 0.045;
        drawBar(ctx, b);
      }
      if (bars.current.length) raf.current = requestAnimationFrame(loop);
    };
    const drawBar = (c, b) => {
      c.globalAlpha = Math.max(0, b.a);
      c.fillStyle = b.c;
      const r = Math.min(b.w / 2, 4);
      c.beginPath();
      c.roundRect ? c.roundRect(b.x, b.y, b.w, b.h, [0, 0, r, r]) : c.rect(b.x, b.y, b.w, b.h);
      c.fill();
      c.globalAlpha = 1;
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [event]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 90 }} />;
}

/* ============================== the graph ==============================
   The block IS the timer. Tap it to run, hold it to edit. The queue stacks
   forward from now and is never clipped: it runs into tomorrow if that is the
   truth. Past bed the field is multiplied by one scalar, ground and blocks
   together, and the margin stops printing start times it cannot know. Anything
   with no block at all is counted under the graph instead of being hidden.
   ====================================================================== */

const DRAW_CAP = 2880;   /* two days of drawing, a guard rail, not a design limit */

/* the app's own geometry, not a borrowed symbol font */
function Mark({ state, color, ink: dial }) {
  /* radius is computed from the size, never 9999, so a morph can interpolate */
  const base = { width: 16, height: 16, flex: "none", transition: `border-radius ${M.shape}, background ${M.state}` };
  /* A dial: solid ground, hand knocked out of it in the band's own ink. An outlined
     face at 16px is all hairline and no mass, which at this size reads as debris —
     a solid disc is one shape and survives being small. The hand is the second hand
     only, one real minute per turn, stepped so it jumps six degrees on the second
     rather than drifting, because a jump is visible at this size and a drift is not.
     It is not trying to tell you the time; the numeral beside it does that, larger.
     Three hands would be mud, and a twelve hour face cannot hold a 25 minute goal. */
  if (state === "running")
    return (
      <span style={{ ...base, borderRadius: 8, background: color, position: "relative", overflow: "hidden" }}>
        <span style={{
          position: "absolute", left: "50%", top: "50%", width: 2, height: 5.5,
          marginLeft: -1, marginTop: -5.5, background: dial || P.ink, borderRadius: 1,
          transformOrigin: "50% 100%", animation: "sweep 60s steps(60, end) infinite",
        }} />
      </span>
    );
  if (state === "done" || state === "week")
    return (
      <span style={{ ...base, borderRadius: 4, background: color, opacity: state === "week" ? 0.45 : 1, clipPath: "polygon(0 0,100% 0,100% 56%,56% 100%,0 100%)" }} />
    );
  if (state === "open") return <span style={{ ...base, borderRadius: 4, boxShadow: `inset 0 0 0 1.5px ${P.hair}` }} />;
  return <span style={{ ...base, borderRadius: 4, boxShadow: `inset 0 0 0 2px ${color}` }} />;
}

/* ============================================================================
   THE GRAPH IS THE APP. It owns the whole viewport. Nothing lives outside it:
   the day total sits in the unused future, the ruler sits in the left margin,
   the week sits on the bottom edge. Time is scaled so wake to bed fits the
   screen exactly, which is why there is no scrolling and no dead space.
   ========================================================================== */

/* contiguous 5 minute slots become one labelled run, per timer */
function runs(cfg, today, upto) {
  const out = [];
  for (const t of cfg.timers) {
    const sl = today[t.id]?.slots;
    if (!sl) continue;
    const keys = Object.keys(sl).map(Number).filter((i) => i < upto).sort((x, y) => x - y);
    let i = 0;
    while (i < keys.length) {
      let j = i;
      let secs = sl[keys[i]] || 0;
      while (j + 1 < keys.length && keys[j + 1] === keys[j] + 1) { j++; secs += sl[keys[j]] || 0; }
      out.push({
        key: `${t.id}-${keys[i]}`, id: t.id, name: t.name, color: ink(t.color).solid,
        top: keys[i] * SLOT_MIN, h: (keys[j] - keys[i] + 1) * SLOT_MIN, secs,
      });
      i = j + 1;
    }
  }
  /* start order, longest first on a tie, so that the run which spans the others is
     the one holding the left hand column when lanes are handed out downstream. */
  out.sort((x, y) => x.top - y.top || y.h - x.h);
  return out;
}

/* =========================================================================
   THE GRAPH IS THE SCREEN.
   Proportional time wastes a phone: a real day is mostly gaps, so a true
   scale gives you acres of grey and 20px slivers of colour. So time is
   piecewise: worked and owed time is proportional, and empty time collapses
   to a thin paper gutter. Colour fills the screen, the order is still
   chronological, and the day always occupies exactly one viewport.
   ========================================================================= */

const MINROW = 24;   /* a block shorter than this cannot hold its own name */
/* Two axes for the whole screen: time is right aligned inside the margin, and every
   other piece of type starts at CONTENT_X. Continuity is the weakest cue to lose and
   the cheapest to keep. */
const GUT = 52;
const CONTENT_X = GUT + S[3];
/* empty time is a rest, not a void. Its height is banded, not proportional,
   so an hour of nothing and four hours of nothing both read as "a while". */
const gapPx = (min) => (min < 15 ? 10 : min < 45 ? 16 : min < 150 ? 24 : 32);

function Graph({ cfg, today, proj, running, handlers, pressed, first, flood, chew, replay, dayTotal, viewH, owedSec, status, pop, flash }) {
  const { cursor, total, startMin, plan } = proj;
  const wake = startMin;

  const past = runs(cfg, today, Math.ceil(cursor / SLOT_MIN));
  const live = cfg.timers.filter((t) => running[t.id]);

  /* ---- 1. the day as an ordered list of rows ---- */
  const rows = [];
  let at = 0;
  const gap = (from, to) => { if (to - from >= 3) rows.push({ kind: "gap", min: to - from, at: from }); };

  rows.push({ kind: "wake", at: 0, fixed: 24 });
  const groups = [];
  for (const r of past.filter((r) => r.secs >= 30)) {
    const g = groups[groups.length - 1];
    if (g && r.top < g.end - 0.5) { g.items.push(r); g.end = Math.max(g.end, r.top + r.h); }
    else groups.push({ top: r.top, end: r.top + r.h, items: [r] });
  }
  /* A group is a chain of runs that overlap, so it needs columns. They are handed out
     greedily in start order: a run takes the leftmost column whose last block has
     already finished. Two sittings of the same timer with a break between them land in
     the same column, one above the other, because a column is a place on the screen
     and not a timer. Working on one thing all evening while a second comes and goes is
     two columns, however many times the second one comes back. */
  for (const g of groups) {
    const busy = [];
    for (const it of g.items) {
      let k = 0;
      while (busy[k] !== undefined && busy[k] > it.top + 0.5) k++;
      it.lane = k;
      busy[k] = it.top + it.h;
    }
    g.lanes = busy.length;
  }
  /* Bed is not a row. A row cannot cross a block, and the deadline lands mid-block nearly
     every evening — a row had to be pushed aside to somewhere it did not belong, which is
     how 20:00 came to be drawn underneath 06:54. It is an overlay at its own offset now.
     What the list still owes it is a rest to fall inside when nothing else reaches. */
  for (const g of groups) {
    gap(at, g.top);
    rows.push({ kind: "work", min: g.end - g.top, at: g.top, items: g.items, lanes: g.lanes });
    at = Math.max(at, g.end);
  }
  gap(at, cursor);
  rows.push({ kind: "now", at: cursor, fixed: 84 });
  for (const t of live) rows.push({ kind: "live", t, fixed: 76 });
  let qat = cursor;
  plan.forEach((s, i) => { rows.push({ kind: "queue", min: s.h, at: s.top, s, first: i === 0 }); qat = s.top + s.h; });
  if (total > qat) gap(qat, total);

  /* ---- 2. heights. content proportional, gaps take the slack ---- */
  const fixed = rows.filter((r) => r.fixed).reduce((n, r) => n + r.fixed, 0);
  const gaps = rows.filter((r) => r.kind === "gap");
  const content = rows.filter((r) => r.kind === "work" || r.kind === "queue");
  const mins = content.reduce((n, r) => n + r.min, 0);
  for (const g of gaps) g.px = gapPx(g.min);
  const gapSum = gaps.reduce((n, g) => n + g.px, 0);
  const qgapSum = 2 * rows.filter((r) => r.kind === "queue").length;
  const room = Math.max(120, viewH - fixed - gapSum - qgapSum - 2);
  let lo = 0.05, hi = 2.2;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const used = content.reduce((n, r) => n + Math.max(MINROW, r.min * mid), 0);
    if (used > room) hi = mid; else lo = mid;
  }
  const pxm = mins ? lo : 0.8;
  for (const r of content) r.px = Math.round(Math.max(MINROW, r.min * pxm));

  /* Every row has a floor height, so past a certain number of them no scale can make
     the day fit, and the tail was being clipped by overflow:hidden. Owed time must
     never vanish quietly: the rows that cannot fit are dropped deliberately and
     counted on one line. The 2px between queue rows counts too, which is what the
     first version of this arithmetic missed. */
  const QGAP = 2;
  const height = () =>
    fixed + gaps.reduce((n, g) => n + g.px, 0) +
    rows.reduce((n, r) => n + (r.kind === "queue" ? r.px + QGAP : r.kind === "work" ? r.px : 0), 0);
  let cut = { n: 0, sec: 0 };
  /* a few pixels of rounding are not worth a whole block, so the rests give up their
     space first. only when empty time has nothing left to give does owed work go. */
  let over = height() - viewH;
  for (const g of gaps) {
    if (over <= 0) break;
    const give = Math.min(Math.max(0, g.px - 4), over);
    g.px -= give;
    over -= give;
  }
  if (over > 0) {
    for (let i = rows.length - 1; i >= 0 && height() > viewH - 28; i--) {
      if (rows[i].kind !== "queue") continue;
      cut = { n: cut.n + 1, sec: cut.sec + rows[i].s.h * 60 };
      rows.splice(i, 1);
    }
  }

  /* whatever is left over is spent on the rests, evenly, so the day fills the screen
     exactly without stretching a single block out of proportion */
  const slack = Math.max(0, viewH - height() - (cut.n ? 28 : 0) - 2);
  if (gaps.length && slack > 0) {
    const each = Math.floor(slack / gaps.length / 4) * 4;
    for (const g of gaps) g.px += Math.min(each, 28);
  }

  /* The column is piecewise, so the deadline's offset is walked, not multiplied: work,
     owed and rest rows carry time; the now band and a running timer take space without
     taking any. The rests above guarantee some row reaches it. */
  let bedTop = 0;
  {
    let y = 0, found = false;
    for (const r of rows) {
      const px = r.px ?? r.fixed ?? 0;
      const span = r.kind === "gap" || r.kind === "work" || r.kind === "queue" ? r.min : 0;
      if (!found && span > 0 && total >= r.at && total <= r.at + span) {
        bedTop = y + ((total - r.at) / span) * px;
        found = true;
      }
      y += px + (r.kind === "queue" ? QGAP : 0);
    }
    if (!found) bedTop = Math.min(y, viewH);
  }

  /* one fill, cut where the deadline runs through it. the block is not split in two —
     splitting reads as two tasks; the line crosses one block and the ground changes under
     it, which is the honest drawing of a deadline that falls mid-block. */
  const fill = (color, top, h, px) => {
    if (top >= total) return dim(color);
    if (top + h <= total) return color;
    const y = Math.round(((total - top) / h) * px);
    return `linear-gradient(${color} 0 ${y}px, ${dim(color)} ${y}px)`;
  };

  const stamp = (m) => (
    <div style={{ width: GUT, flex: "none", textAlign: "right", paddingRight: S[3], ...T.nano, color: P.mute }}>
      {stampTime(wake + m)}
    </div>
  );

  return (
    <div style={{ height: viewH, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {flood && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", animation: "flood 1400ms ease both", zIndex: 9 }}>
          {cfg.timers.map((t) => <div key={t.id} style={{ flex: 1, background: ink(t.color).solid }} />)}
        </div>
      )}

      {/* The ground past the deadline. The 52px margin is the axis and keeps its paper for
          the full height, so no stamp ever straddles two grounds and the change reads as a
          change to the column rather than to the screen. */}
      <div style={{ position: "absolute", left: GUT, right: 0, top: bedTop, bottom: 0, background: DUSK, zIndex: 0 }} />

      {rows.map((r, i) => {
        /* ---- empty time: a paper rest with its duration in the margin ---- */
        if (r.kind === "gap") return (
          <div key={`g${i}`} style={{ height: r.px, flex: "none" }} />
        );

        /* ---- worked time: solid, drawn where it happened, laned when concurrent ----
           A row is a span of the day, and a block sits at its own offset inside that
           span with its own height. Two sittings of the same timer are two blocks in
           one column with paper between them, which is the record: when you started,
           when you stopped, how long the break was. */
        if (r.kind === "work") {
          const span = Math.max(1, r.min);
          const laneW = 100 / r.lanes;
          const blocks = r.items.map((it) => {
            const h = Math.max(3, Math.round((it.h / span) * r.px));
            return { it, h, y: Math.min(r.px - h, Math.round(((it.top - r.at) / span) * r.px)) };
          });
          /* the margin keeps time for every block that does not begin where the row
             does, dropping any stamp that would land unreadably close to the one above */
          const ticks = [];
          let lastY = -99;
          for (const b of [...blocks].sort((x, y) => x.y - y.y)) {
            if (b.y < 11 || b.y - lastY < 13) continue;
            lastY = b.y;
            ticks.push({ y: b.y, at: b.it.top });
          }
          return (
            <div key={`w${i}`} style={{ height: r.px, flex: "none", display: "flex", alignItems: "stretch", position: "relative", zIndex: 1 }}>
              {stamp(r.at)}
              {ticks.map((t) => (
                <div key={t.y} style={{
                  position: "absolute", top: t.y - 1, left: 0, width: GUT, textAlign: "right",
                  paddingRight: S[3], ...T.nano, color: P.mute, pointerEvents: "none",
                }}>{stampTime(wake + t.at)}</div>
              ))}
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                {blocks.map(({ it, y, h }, k) => {
                  const c = ink(it.color);
                  return (
                    <div
                      key={it.key}
                      {...handlers(it.id)}
                      title={`${it.name} · ${fmtShort(it.secs)}`}
                      style={{
                        position: "absolute", top: y, height: h,
                        left: `${it.lane * laneW}%`, width: `calc(${laneW}% - ${r.lanes > 1 ? 2 : 0}px)`,
                        background: fill(it.color, it.top, it.h, h), color: c.on,
                        display: "flex", alignItems: "center", gap: S[2], paddingLeft: S[3], paddingRight: S[4],
                        cursor: "pointer", overflow: "hidden", userSelect: "none", WebkitUserSelect: "none",
                        transform: pressed === it.id ? "scale(.995)" : "scale(1)", transition: `transform ${M.tap}`,
                        animation: replay?.id === it.id ? `reveal 560ms ${EFFECTS} ${Math.min(k * 40, 700)}ms both`
                          : first ? `fadeIn 300ms ease ${Math.min(i * 26, 340)}ms both` : "none",
                      }}
                    >
                      {/* a block only has to be tall enough for one line, because the
                          name and the number sit beside each other rather than stacked.
                          Below that the colour is the whole label, as it is elsewhere. */}
                      {h >= 17 && <>
                        <span style={{ ...(h >= 26 ? T.action : T.label), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
                        <span style={{ marginLeft: "auto", flex: "none" }}>
                          <Num sec={it.secs} role={h >= 56 ? "data" : "label"} color={c.on} dim={0.5} />
                        </span>
                      </>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        /* ---- now: the only ink band on the screen, carrying the day total ---- */
        if (r.kind === "now") return (
          <div key="now" style={{
            height: r.fixed, flex: "none", display: "flex", alignItems: "center",
            background: P.ink, color: P.paper, paddingRight: S[4], zIndex: 4,
            animation: pop ? `beats 620ms ${SPATIAL} both` : "none",
          }}>
            <div style={{ width: GUT, flex: "none", textAlign: "right", paddingRight: S[3] }}>
              <div style={{ ...T.nano, color: "rgba(239,239,234,.55)" }}>now</div>
              <div style={{ ...T.nano, color: P.paper, marginTop: 4 }}>{stampTime(wake + cursor)}</div>
            </div>
            <div style={{ marginLeft: "auto", flex: "none", textAlign: "right" }}>
              <Num sec={dayTotal} role={live.length ? "title" : "hero"} color={P.paper} dim={0.42} />
              <div style={{ ...T.nano, color: "rgba(239,239,234,.55)", marginTop: -2 }}>
                {/* The overrun is a state of the day, not a property of the deadline: bed
                    does not overshoot, the queue does. Hanging it on the rule would also
                    make a fixed landmark carry a number that jitters on every edit. */}
                banked{status ? ` · ${status}` : ""}
              </div>
            </div>
          </div>
        );

        /* ---- running: its colour owns the widest band on the screen ---- */
        if (r.kind === "live") {
          const c = ink(r.t.color);
          const rec = today[r.t.id] || { sec: 0 };
          return (
            <div key={`l${r.t.id}`} {...handlers(r.t.id)} aria-label={`Pause ${r.t.name}`}
              style={{
                height: r.fixed, flex: "none", display: "flex", alignItems: "center",
                paddingRight: S[4], background: c.solid, color: c.on, zIndex: 3,
                cursor: "pointer", userSelect: "none", WebkitUserSelect: "none",
                transform: pressed === r.t.id ? "scale(.995)" : "scale(1)", transition: `transform ${M.tap}`,
                animation: flash ? `beats 520ms ${SPATIAL} both` : "none",
              }}>
              <span style={{ width: GUT, flex: "none", display: "flex", justifyContent: "flex-end", paddingRight: S[3] }}>
                <Mark state={r.t.goal && rec.sec >= r.t.goal ? "done" : "running"} color={c.on} ink={c.solid} />
              </span>
              <span style={{ ...T.action, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, paddingLeft: S[3] }}>{r.t.name}</span>
              {/* Counts up. What is left is already drawn directly below it, to scale,
                  as the rest of the block, and one quantity does not need two numbers. */}
              <span style={{ marginLeft: "auto", ...T.title, flex: "none", fontVariantNumeric: "tabular-nums" }}>{fmt(rec.sec)}</span>
            </div>
          );
        }

        /* ---- owed: tint, half hour bricks, tap to start ---- */
        if (r.kind === "queue") {
          const s2 = r.s, c = ink(s2.color), hot = pressed === s2.key;
          const U = Math.max(6, BRICK * pxm);
          return (
            <div key={s2.key} id={`blk-${s2.key}`} {...handlers(s2.key)} title={`${s2.name} · ${fmtShort(s2.h * 60)} left`}
              style={{ height: r.px, flex: "none", display: "flex", alignItems: "stretch", marginBottom: 2, position: "relative", zIndex: 1 }}>
              {/* Durations are facts — you set them. Start times past the deadline are the
                  accumulated error of a dozen self-set goals, printed in the same face at
                  the same authority as the wake time you actually committed to. And the
                  first row's stamp always reprints the time the now band shows directly
                  above it. Both go; the margin keeps only what it knows. */}
              {r.first || s2.top >= total ? <div style={{ width: GUT, flex: "none" }} /> : stamp(s2.top)}
              <div style={{
                flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: S[2], paddingLeft: S[3], paddingRight: S[4],
                background: fill(c.tint, s2.top, s2.h, r.px),
                boxShadow: hot ? `inset 0 0 0 2.5px ${c.solid}` : `inset 4px 0 0 0 ${s2.top >= total ? dim(c.solid) : c.solid}`,
                borderRadius: hot ? 12 : 0, cursor: "pointer", overflow: "hidden",
                filter: hot ? "brightness(.97)" : "none",
                transition: `filter ${M.tap}, box-shadow ${M.tap}, border-radius ${M.shape}`,
                animation: chew?.id === s2.key ? `chew 420ms ${SNAPPY}` : "none",
                userSelect: "none", WebkitUserSelect: "none",
              }}>
                <span style={{ ...T.action, color: P.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s2.name}</span>
                <span style={{ marginLeft: "auto", flex: "none" }}><Num sec={s2.h * 60} role="label" color={P.ink} dim={0.45} /></span>
              </div>
            </div>
          );
        }

        if (r.kind === "wake") return (
          <div key="wake" style={{ height: r.fixed, flex: "none", display: "flex", alignItems: "center" }}>
            {stamp(r.at)}
            <div style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: `1.5px dashed ${P.ink}`, opacity: 0.28 }} />
              <span style={{ ...T.nano, color: P.mute, background: P.paper, padding: `0 ${S[2]}px 0 ${S[3]}px`, position: "relative" }}>up</span>
            </div>
          </div>
        );

        return null;
      })}

      {cut.n > 0 && (
        <div style={{ height: 28, flex: "none", display: "flex", alignItems: "center", gap: S[2], paddingLeft: CONTENT_X }}>
          <span style={{ ...T.nano, color: P.mute }}>
+{cut.n} owed · {fmtShort(cut.sec)} below the fold
          </span>
        </div>
      )}

      {/* Bed. A rule in the field, a stamp in the margin, one word — the wake marker with a
          different colour and a different offset. Nothing here is conditional. The rule is
          always red, the stamp always mute, and the word does not conjugate: names never
          do. One projection-derived boolean used to fire the colour, the opacity and the
          wording together, which is how the app came to say "past bed" in the afternoon.
          The tense is carried by where this rule sits relative to the now band, and by
          nothing else, so it cannot be got wrong. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bedTop, height: 0, zIndex: 6, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: GUT, right: 0, top: 0, borderTop: `1.5px dashed ${ALARM.solid}` }} />
        <div style={{ position: "absolute", left: 0, top: -6, width: GUT, textAlign: "right", paddingRight: S[3], ...T.nano, color: P.mute }}>
          {stampTime(wake + total)}
        </div>
        {/* sits above the rule, never on it: the rule stays continuous across the field,
            and a label centred on it would straddle the two grounds it separates. Ink, not
            red — at this size a pure-red glyph carries about one stroke width of chromatic
            blur, and red on a tint measures a third of ink's contrast. */}
        <div style={{ position: "absolute", left: GUT, top: -14, ...T.chip, color: P.ink, background: P.paper, padding: `0 ${S[2]}px 0 ${S[3]}px` }}>
          {stampTime(wake + total) === cfg.bed ? "bed" : "day ends"}
        </div>
      </div>
    </div>
  );
}

/* ============================== app ============================== */

export default function Timeblock() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [log, setLog] = useState(DEFAULT_LOG);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [spillFx, setSpillFx] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [press, setPress] = useState(null);
  const [pop, setPop] = useState(null);
  const [flash, setFlash] = useState(false);
  const [weekPop, setWeekPop] = useState(null);
  const [first, setFirst] = useState(true);
  const [flood, setFlood] = useState(false);
  const [armed, setArmed] = useState(null);
  const [more, setMore] = useState(false);
  const [chew, setChew] = useState(null);
  const [replay, setReplay] = useState(null);

  const stage = useRef(null);
  const [viewH, setViewH] = useState(0);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewH(el.clientHeight));
    ro.observe(el);
    setViewH(el.clientHeight);
    return () => ro.disconnect();
  }, [ready]);

  const cfgRef = useRef(cfg);
  const logRef = useRef(log);
  const fired = useRef(new Set());
  const fx = useRef([]);
  const lastTick = useRef(Date.now());
  const sess = useRef({});   /* when this sitting began, per timer. not persisted */
  const booked = useRef("");  /* signature of the goal notifications the worker holds */
  const lastSave = useRef(0);
  const saveTimer = useRef(null);
  const milestone = useRef(0);
  const hold = useRef({ t: null, id: null, fired: false, x: 0, y: 0 });
  const quarter = useRef({});
  const brickRef = useRef({});
  const primed = useRef(false);
  const perfect = useRef(null);
  const weekFired = useRef(new Set());
  const rects = useRef({});
  const flipping = useRef(null);
  cfgRef.current = cfg;
  logRef.current = log;

  const running = log.running || {};
  const anyRunning = Object.keys(running).length > 0;
  const lkey = logicalKey(cfg, log, now);     /* every "today" in this app means this */
  const lnow = refTime(lkey);
  const today = log.days[lkey] || {};
  const pastMidnight = dayKey(now) !== lkey;  /* up late, still on the earlier day */
  const shifted =
    log.wakes && log.wakes[dayKey(now)] != null &&
    !Object.values(log.days[dayKey(now)] || {}).some((r) => r.sec > 0);

  const say = useCallback((msg, tone) => setToast({ msg, tone, id: Math.random() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const t = setTimeout(() => setFirst(false), 900);
    return () => clearTimeout(t);
  }, []);

  /* ---------- load ---------- */
  useEffect(() => {
    let dead = false;
    (async () => {
      const saved = await loadState();
      if (dead) return;
      if (saved) {
        const c = { ...DEFAULT_CFG, ...saved.cfg };
        /* read off the file itself, not the merged log: DEFAULT_LOG carries wm, so
           merging first would make every old file look like a new one */
        const wasWatermarked = !!saved.log.wm;
        let l = prune({ ...DEFAULT_LOG, ...saved.log });
        const ids = Object.keys(l.running || {});
        if (ids.length) {
          /* A running timer keeps running. The phone killing the tab is not the user
             pausing it, and it used to be treated as one: past five minutes away the
             run was dropped and the time thrown out, which on Android is most of the
             time. The gap is credited and the run is left alone. Only the user stops
             a timer. */
          const gap = Date.now() - (l.savedAt || Date.now());
          /* a watermark is the whole truth about what has been paid. a log written
             before watermarks holds a start time instead, which the save has already
             been credited past, so that one is floored at savedAt exactly once. */
          for (const id of ids) l = addSpan(l, id, wasWatermarked ? l.running[id] : Math.max(l.running[id], l.savedAt || 0), Date.now(), c);
          l = { ...l, wm: 1, running: Object.fromEntries(ids.map((id) => [id, Date.now()])) };
          if (gap > 120000) {
            const names = ids.map((id) => (c.timers.find((t) => t.id === id) || {}).name).filter(Boolean).join(", ");
            if (names) say(`${names} kept running · ${fmtShort(gap / 1000)}`);
          }
        }
        setCfg(c);
        setLog(l);
      }
      lastTick.current = Date.now();
      setReady(true);
    })();
    return () => { dead = true; };
  }, [say]);

  /* ---------- save ---------- */
  const write = useCallback(async (key) => {
    try {
      await window.storage.set(key, JSON.stringify({ v: 6, cfg: cfgRef.current, log: { ...logRef.current, savedAt: Date.now() } }));
    } catch (e) {}
  }, []);
  const save = useCallback((force) => {
    if (!ready) return;
    const gap = Date.now() - lastSave.current;
    const go = () => { lastSave.current = Date.now(); write(KEY); };
    clearTimeout(saveTimer.current);
    if (force || gap > 4000) go();
    else saveTimer.current = setTimeout(go, 4000 - gap);
  }, [ready, write]);
  useEffect(() => { save(false); }, [cfg, log, save]);
  useEffect(() => {
    if (!ready) return;
    const iv = setInterval(() => write(BAK), 4 * 60 * 1000);
    const flush = () => write(KEY);
    const vis = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", flush);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pagehide", flush);
    };
  }, [ready, write]);

  /* ---------- tick ---------- */
  useEffect(() => {
    if (!ready) return;
    const iv = setInterval(() => {
      const t = Date.now();
      const from = lastTick.current;
      lastTick.current = t;
      if (!Object.keys(logRef.current.running || {}).length) {
        if (logicalKey(cfgRef.current, logRef.current, t) !== logicalKey(cfgRef.current, logRef.current, from) || Math.floor(t / 20000) !== Math.floor(from / 20000)) setNow(t);
        return;
      }
      setLog((prev) => {
        let next = prev;
        const run = { ...prev.running };
        for (const id of Object.keys(run)) {
          const paid = Math.max(from, run[id]);
          if (t <= paid) continue;
          next = addSpan(next, id, paid, t, cfgRef.current);
          run[id] = t;
        }
        if (next !== prev) next = { ...next, running: run };
        const key = logicalKey(cfgRef.current, logRef.current, t);
        const day = next.days[key] || {};
        for (const tm of cfgRef.current.timers) {
          const rec = day[tm.id];
          if (!rec || rec.done || !tm.goal || rec.sec < tm.goal) continue;
          const stamp = `${key}:${tm.id}`;
          if (fired.current.has(stamp)) continue;
          fired.current.add(stamp);
          next = { ...next, days: { ...next.days, [key]: { ...day, [tm.id]: { ...rec, done: true } } } };
          fx.current.push(tm);
        }
        return next;
      });
      setNow(t);
    }, 500);
    return () => clearInterval(iv);
  }, [ready]);

  /* ---------- goal met: anticipation, payoff, settle ---------- */
  useEffect(() => {
    if (!fx.current.length) return;
    const list = fx.current;
    fx.current = [];
    for (const tm of list) {
      setPop({ id: tm.id, n: Math.random() });
      setReplay({ id: tm.id, n: Math.random() });
      setTimeout(() => setReplay(null), 1400);
      const el = document.getElementById(`tile-${tm.id}`) || document.getElementById(`blk-${tm.id}`);
      const r = el && el.getBoundingClientRect();
      /* payoff on beat two, 90ms after the compression */
      setTimeout(() => {
        if (cfg.sound) CUE.goal();
        buzz(H.goal);
        setSpillFx({ x: r ? r.left : window.innerWidth * 0.2, y: r ? r.bottom - 6 : 300, w: r ? r.width : 110, color: ink(tm.color).solid, id: Math.random() });
      }, 90);
      if (cfg.notify) notify("Goal met", `${tm.name} · ${fmtShort(tm.goal)}`, `tb-goal-${tm.id}`);
    }
    const goaled = cfgRef.current.timers.filter((t) => t.goal > 0);
    const key = logicalKey(cfgRef.current, logRef.current, Date.now());
    const day = logRef.current.days[key] || {};
    /* owed, by the same rule the graph queues by: a goal still short, unless its weekly
       cadence is already met and it is therefore not owed today at all */
    const stillOwed = goaled.some((t) => {
      if (weekProgress(logRef.current, t, cfgRef.current.weekStart, Date.now()).met) return false;
      return (day[t.id]?.sec || 0) < t.goal - 30;
    });
    if (goaled.length && !stillOwed && perfect.current !== key) {
      perfect.current = key;
      setTimeout(() => {
        if (cfg.sound) CUE.perfect();
        buzz(H.perfect);
        setFlood(true);
        setTimeout(() => setFlood(false), 1500);
      }, 1000);
    }
  }, [log, cfg.sound, cfg.notify, say]);

  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(null), 800);
    return () => clearTimeout(t);
  }, [pop]);

  /* week reached: the seven squares fill left to right, then the chip inverts */
  useEffect(() => {
    if (!ready) return;
    const wk = weekDays(cfg.weekStart, lnow)[0].key;
    for (const t of cfg.timers) {
      if (!t.perWeek) continue;
      const stamp = `${wk}:${t.id}`;
      if (!weekProgress(log, t, cfg.weekStart, lnow).met || weekFired.current.has(stamp)) continue;
      weekFired.current.add(stamp);
      if (!primed.current) continue;
      setWeekPop(t.id);
      setTimeout(() => {
        if (cfg.sound) CUE.week();
        buzz(H.week);
      }, 90);
      setTimeout(() => setWeekPop(null), 900);
    }
  }, [log, cfg, now, lnow, ready]);

  /* The quarter of goal pips are gone. Bricks already mark progress every 30
     minutes with more meaning, and stacking rewards flattens all of them. */
  useEffect(() => { if (ready) primed.current = true; }, [ready, log]);

  /* flow milestones */
  useEffect(() => {
    if (!log.flowStart) { milestone.current = 0; return; }
    const sec = (now - log.flowStart) / 1000;
    const step = Math.floor(sec / MILESTONE);
    if (step > milestone.current) {
      milestone.current = step;
      buzz(H.flow);
      if (cfg.sound) CUE.flow(step);
      setFlash(true);
      setTimeout(() => setFlash(false), 650);
      if (cfg.notify) notify("Still in flow", `${fmtShort(sec)} without a break`);
    }
  }, [now, log.flowStart, cfg.sound, cfg.notify]);

  /* A goal is reached at a moment the phone has usually already killed the page, so
     the tick that watches for it is not running and the notification cannot be fired
     then. It is booked in advance instead: the worker holds one triggered
     notification per running timer, timed to the second the goal lands on, and the
     OS delivers it whether or not the app still exists. Starting, stopping, nudging
     or re-aiming a timer rebooks it. Reaching the goal while the app is awake
     replaces the booking with the live one, because they share a tag. */
  useEffect(() => {
    if (!ready) return;
    const reg = typeof window !== "undefined" && window.__sw;
    if (!reg || !reg.active) return;
    const items = [];
    if (cfg.notify) {
      const key = logicalKey(cfgRef.current, logRef.current, Date.now());
      const day = logRef.current.days[key] || {};
      for (const id of Object.keys(logRef.current.running || {})) {
        const tm = cfg.timers.find((t) => t.id === id);
        if (!tm || !tm.goal) continue;
        const rec = day[id];
        if (rec && rec.done) continue;
        const leftMs = (tm.goal - (rec ? rec.sec : 0)) * 1000;
        if (leftMs <= 1000) continue;
        items.push({ tag: `tb-goal-${id}`, title: "Goal met", body: `${tm.name} \u00b7 ${fmtShort(tm.goal)}`, at: Date.now() + leftMs });
      }
    }
    /* a landing time barely moves while its timer runs, so a coarse signature stops
       this from talking to the worker twice a second for no change */
    const sig = items.map((i) => `${i.tag}@${Math.round(i.at / 15000)}`).sort().join(",");
    if (sig === booked.current) return;
    booked.current = sig;
    reg.active.postMessage({ type: "schedule", prefix: "tb-goal-", items });
  }, [ready, log, cfg.notify, cfg.timers]);

  useEffect(() => {
    if (!cfg.notify) return;
    const iv = setInterval(() => {
      const ids = Object.keys(logRef.current.running || {});
      if (!ids.length) return;
      notify("Timer running", cfgRef.current.timers.filter((t) => ids.includes(t.id)).map((t) => t.name).join(", ") + " is still going");
    }, 20 * 60 * 1000);
    return () => clearInterval(iv);
  }, [cfg.notify]);

  /* ---------- FLIP: the tile actually travels to its row ---------- */
  useLayoutEffect(() => {
    const job = flipping.current;
    if (!job) return;
    flipping.current = null;
    const el = document.getElementById(`tile-${job.id}`);
    if (!el || !job.rect) return;
    const to = el.getBoundingClientRect();
    const dx = job.rect.left - to.left;
    const dy = job.rect.top - to.top;
    const sx = Math.max(0.2, job.rect.width / Math.max(1, to.width));
    const sy = Math.max(0.2, job.rect.height / Math.max(1, to.height));
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2 && Math.abs(sx - 1) < 0.02) return;
    try {
      el.animate(
        [
          { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0.85 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 440, easing: SPATIAL }
      );
    } catch (e) {}
  }, [log.running]);

  /* ---------- actions ---------- */
  const toggle = useCallback((id) => {
    const el = document.getElementById(`tile-${id}`);
    flipping.current = { id, rect: el ? el.getBoundingClientRect() : null };
    const t = Date.now();
    lastTick.current = t;
    const starting = !logRef.current.running[id];
    /* running[id] is a watermark now, so it cannot say how long this sitting was.
       That belongs to the session, not to the record, so it lives in a ref: lose it
       to a reload and the only cost is a toast that does not appear. */
    if (starting) sess.current[id] = t;
    const startedAt = sess.current[id] || logRef.current.running[id];
    setLog((prev) => {
      const run = { ...prev.running };
      let next = prev;
      if (run[id]) { next = addSpan(next, id, run[id], t, cfgRef.current); delete run[id]; }
      else run[id] = t;
      const on = Object.keys(run).length > 0;
      return { ...next, running: run, flowStart: on ? prev.flowStart || t : null };
    });
    buzz(starting ? H.start : H.pause);
    if (cfg.sound) (starting ? CUE.start : CUE.pause)();
    if (!starting) {
      const tm = cfgRef.current.timers.find((x) => x.id === id);
      const gained = (t - startedAt) / 1000;
      const last = Object.keys(logRef.current.running).length === 1;
      const flow = logRef.current.flowStart ? (t - logRef.current.flowStart) / 1000 : 0;
      if (last && flow >= 300) say(`Flow ended · ${fmtShort(flow)} unbroken`);
      else if (gained >= 60 && tm) say(`${tm.name} +${fmtShort(gained)}`);
    }
    save(true);
  }, [cfg.sound, save, say]);

  const pauseAll = useCallback(() => {
    const t = Date.now();
    lastTick.current = t;
    setLog((prev) => {
      let next = prev;
      for (const id of Object.keys(prev.running)) next = addSpan(next, id, prev.running[id], t, cfgRef.current);
      return { ...next, running: {}, flowStart: null };
    });
    const flow = logRef.current.flowStart ? (t - logRef.current.flowStart) / 1000 : 0;
    buzz(H.pause);
    if (cfg.sound) CUE.pause();
    if (flow >= 300) say(`Flow ended · ${fmtShort(flow)} unbroken`);
    save(true);
  }, [cfg.sound, save, say]);

  const adjust = useCallback((id, delta) => {
    setLog((prev) => nudgeTime(prev, id, delta, cfgRef.current));
    buzz(H.tap);
    if (cfg.sound) CUE.tick();
  }, [cfg.sound]);

  const patch = (id, p) => setCfg((c) => ({ ...c, timers: c.timers.map((t) => (t.id === id ? { ...t, ...p } : t)) }));

  const addTimer = () => {
    const id = Math.random().toString(36).slice(2, 8);
    setCfg((c) => ({ ...c, timers: [...c.timers, { id, name: "New timer", color: PALETTE[c.timers.length % PALETTE.length], goal: 25 * 60, perWeek: 0 }] }));
    setSheet({ kind: "timer", id });
    buzz(H.tap);
    /* adding and deleting are structural, so they do not wait for the save throttle */
    setTimeout(() => save(true), 0);
  };

  const removeTimer = (id) => {
    setCfg((c) => ({ ...c, timers: c.timers.filter((t) => t.id !== id) }));
    setLog((p) => {
      const run = { ...p.running };
      delete run[id];
      return { ...p, running: run, flowStart: Object.keys(run).length ? p.flowStart : null };
    });
    setSheet(null);
    setTimeout(() => save(true), 0);
    say("Timer removed");
    save(true);
  };

  /* press: transform origin follows the thumb, movement cancels, hold edits */
  const down = (id) => (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    hold.current = { t: null, id, fired: false, x: e.clientX, y: e.clientY };
    setPress({ id, ox: `${((e.clientX - r.left) / r.width) * 100}%`, oy: `${((e.clientY - r.top) / r.height) * 100}%` });
    hold.current.t = setTimeout(() => {
      hold.current.fired = true;
      buzz(H.hold);
      setPress(null);
      setSheet({ kind: "timer", id });
    }, 450);
  };
  const move = (e) => {
    const h = hold.current;
    if (!h.id) return;
    if (Math.abs(e.clientX - h.x) > 10 || Math.abs(e.clientY - h.y) > 10) {
      clearTimeout(h.t);
      h.id = null;
      setPress(null);
    }
  };
  const up = (id) => () => {
    const h = hold.current;
    clearTimeout(h.t);
    setPress(null);
    if (h.id === id && !h.fired) toggle(id);
    h.id = null;
  };
  const off = () => { clearTimeout(hold.current.t); hold.current.id = null; setPress(null); };
  const keys = (id) => (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(id); }
  };
  const handlers = (id) => ({
    onPointerDown: down(id), onPointerMove: move, onPointerUp: up(id),
    onPointerCancel: off, onPointerLeave: off, onKeyDown: keys(id),
    onContextMenu: (e) => e.preventDefault(),
  });

  /* ---------- derived ---------- */
  const dayTotal = cfg.timers.reduce((a, t) => a + (today[t.id]?.sec || 0), 0);
  const stars = cfg.timers.filter((t) => today[t.id]?.done).length;
  const proj = projectDay(cfg, log, today, running, now);
  const { cursor, total } = proj;
  const overBed = Math.max(0, cursor - total) * 60;
  const owedSec = proj.plan.reduce((a, s2) => a + s2.h * 60, 0);
  const spill = proj.spill;
  const flowSec = log.flowStart ? (now - log.flowStart) / 1000 : 0;
  /* how many of today's timers have already met their weekly cadence */
  const weekCovered = cfg.timers.filter((t) => (t.goal ? (today[t.id]?.sec || 0) >= t.goal : (today[t.id]?.sec || 0) >= 60)).length;
  const onGraph = new Set([...proj.plan.map((b) => b.key), ...Object.keys(running)]);
  const extra = cfg.timers
    .filter((t) => !onGraph.has(t.id))
    .map((t) => {
      const rec = today[t.id] || { sec: 0 };
      const state = weekProgress(log, t, cfg.weekStart, lnow).met
        ? "week"
        : (t.goal ? rec.sec >= t.goal : rec.sec >= 60)
        ? "done"
        : "open";
      return { t, state };
    });
  const wkDays = weekDays(cfg.weekStart, lnow);
  const dayIndex = wkDays.findIndex((d) => d.today) + 1;

  const todayRight = !cfg.timers.some((t) => t.goal > 0)
    ? "no goals yet"
    : owedSec === 0
    ? "clear for today"
    : spill > 0
    ? `${fmtShort(round5(spill) * 60)} past bed`
    : `done by ${clock(round5(proj.startMin + proj.head))}${suffix(proj.startMin + proj.head)}`;

  if (!ready) return <div style={{ minHeight: "100vh", background: P.paper }} />;
  const editing = sheet?.kind === "timer" ? cfg.timers.find((t) => t.id === sheet.id) : null;

  return (
    <div style={{ minHeight: "100vh", background: P.paper, color: P.ink, fontFamily: F, fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum" 1', fontOpticalSizing: "auto", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@85..125,400..800&display=swap');
        @keyframes up { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.32 } }
        @keyframes sweep { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes punch { 0% { transform:scale(0) rotate(-35deg) } 65% { transform:scale(1.4) rotate(4deg) } 100% { transform:scale(1) rotate(0) } }
        @keyframes beats { 0% { transform:scale(1) } 12% { transform:scale(.972) } 46% { transform:scale(1.028) } 72% { transform:scale(.994) } 100% { transform:scale(1) } }
        @keyframes sq { from { transform:scale(.3); opacity:0 } to { transform:scale(1); opacity:1 } }
        @keyframes chew { 0%{transform:scaleX(1)} 30%{transform:scaleX(1.012)} 100%{transform:scaleX(1)} }
        @keyframes reveal { 0%{filter:brightness(1)} 35%{filter:brightness(1.5) saturate(1.15)} 100%{filter:brightness(1)} }
        @keyframes flood { 0%{opacity:0} 18%{opacity:.92} 60%{opacity:.92} 100%{opacity:0} }
        @keyframes toastIn { from { opacity:0; transform:translate(-50%,12px) } to { opacity:1; transform:translate(-50%,0) } }
        * { box-sizing:border-box; -webkit-font-smoothing:antialiased }
        body { margin:0; background:${P.paper} }
        input, button, select { font-family:${F} }
        ::-webkit-scrollbar { display:none }
        button:focus-visible, [role=button]:focus-visible { outline:2.5px solid ${P.ink}; outline-offset:3px }
        [role=slider]:focus-visible { outline:2.5px solid ${P.ink}; outline-offset:-3px }
        /* reduced motion keeps confirmations, removes travel */
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.12s !important }
        }
      `}</style>

      <Overflow event={spillFx} />

      <div style={{
        maxWidth: 430, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column",
        padding: `${S[2]}px 0 calc(${S[1]}px + env(safe-area-inset-bottom))`, boxSizing: "border-box", overflow: "hidden",
      }}>
        {/* top edge: two words of type, nothing else. */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", height: 32, flex: "none", padding: `0 ${S[4]}px 0 ${CONTENT_X}px` }}>
          <button
            onClick={() => { buzz(H.tap); setSheet({ kind: "week" }); }}
            style={{ ...T.nano, color: P.ink, background: "none", border: "none", padding: `${S[3]}px ${S[2]}px ${S[3]}px 0`, cursor: "pointer", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}
          >
            {pastMidnight ? "still " : ""}
            {(() => {
              const dt = new Date(lnow);
              return `${dt.toLocaleDateString(undefined, { weekday: "short" })} ${dt.getDate()} ${dt.toLocaleDateString(undefined, { month: "short" })}`;
            })()}
            {" · "}
            <span style={{ display: "inline-block", animation: weekPop ? `punch 420ms ${SNAPPY} both` : "none" }}>
              {weekCovered}/{cfg.timers.length || 0} done
            </span>

          </button>
          <div style={{ display: "flex", alignItems: "baseline", gap: S[4] }}>
            {(pastMidnight || shifted) && (
              <button
                onClick={() => {
                  buzz(H.tap);
                  const cal = dayKey(now);
                  if (shifted) {
                    setLog((l) => { const w = { ...(l.wakes || {}) }; delete w[cal]; return { ...l, wakes: w }; });
                    say("Back on the earlier day");
                  } else {
                    setLog((l) => ({ ...l, wakes: { ...(l.wakes || {}), [cal]: Math.floor(minOfDay(now)) } }));
                    say(`New day started. Logging to ${new Date(now).toLocaleDateString(undefined, { weekday: "long" })}.`);
                  }
                  save(true);
                }}
                /* This rewrites which logical day the work books to, so it carries more
                   weight than its neighbours. The weight comes from the chip already in
                   the vocabulary, not from an underline borrowed from hyperlinks. Undo
                   is the quiet counterpart, the same key/plain pair the sheets use. */
                style={{
                  ...T.nano, border: "none", borderRadius: 8, cursor: "pointer",
                  padding: `${S[2]}px ${S[2]}px`, whiteSpace: "nowrap", flex: "none",
                  background: shifted ? P.well : P.ink,
                  color: shifted ? P.ink : P.paper,
                  transition: `background ${M.state}`,
                }}
              >
                {shifted ? "undo" : `start ${new Date(now).toLocaleDateString(undefined, { weekday: "short" })}`}
              </button>
            )}
            <button
              onClick={() => { buzz(H.tap); setSheet({ kind: "settings" }); }}
              style={{ ...T.nano, background: "none", border: "none", padding: `${S[3]}px 0`, cursor: "pointer", color: P.ink }}
            >
              settings
            </button>
          </div>
        </div>

        {/* the graph gets every pixel that is not the two edges */}
        <div ref={stage} style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {viewH > 0 && (
            <Graph
              cfg={cfg} today={today} proj={proj} running={running}
              handlers={handlers} pressed={press?.id} first={first} flood={flood}
              chew={chew} replay={replay} dayTotal={dayTotal} viewH={viewH} owedSec={owedSec}
              status={todayRight} pop={pop} flash={flash}
            />
          )}
        </div>

        <div style={{ height: 28, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: `0 ${S[4]}px` }}>
          <button
            onClick={addTimer}
            style={{ ...T.nano, background: "none", border: "none", padding: `${S[2]}px 0 ${S[2]}px ${S[4]}px`, cursor: "pointer", color: P.ink }}
          >
            new timer
          </button>
        </div>

      </div>

      {/* toast now means "read this". rewards are carried by the tile and the sound. */}
      {toast && (
        <div style={{
          position: "fixed", left: "50%", bottom: `calc(${S[4]}px + env(safe-area-inset-bottom))`,
          transform: "translateX(-50%)", background: P.ink, color: P.paper,
          padding: `${S[3]}px ${S[4]}px`, borderRadius: 24, ...T.action,
          zIndex: 80, maxWidth: "88vw", textAlign: "center", animation: "toastIn 200ms ease",
          boxShadow: "0 14px 32px rgba(23,23,28,.22)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ---------- timer sheet: two zones, ranges scroll, delete is far away ---------- */}
      <Sheet open={!!editing} onClose={() => { setArmed(null); setSheet(null); save(true); }} title={editing?.name}>
        {editing && (() => {
          const c = ink(editing.color);
          const rec = today[editing.id] || { sec: 0 };
          return (
            <>
              <div style={{ ...T.micro, color: P.mute, marginBottom: S[3] }}>Today</div>
              {/* one row, not two. the steps grow outward from the number so the
                  gesture matches the size of the change. */}
              <div style={{ background: P.well, borderRadius: R.lg, padding: S[2], marginBottom: S[5] }}>
                <div style={{ display: "flex", alignItems: "center", gap: S[1] }}>
                  {[-900, -300, -60].map((d) => (
                    <Btn key={d} onClick={() => adjust(editing.id, d)} label={`minus ${Math.abs(d) / 60} minutes`}
                      style={{ flex: "none", width: 38, minHeight: 44, padding: 0, justifyContent: "center", background: P.sheet, ...T.chip }}>
                      −{Math.abs(d) / 60}
                    </Btn>
                  ))}
                  <span style={{ flex: 1, textAlign: "center", minWidth: 64, whiteSpace: "nowrap" }}><Num sec={rec.sec} role="data" /></span>
                  {[60, 300, 900].map((d) => (
                    <Btn key={d} onClick={() => adjust(editing.id, d)} label={`plus ${d / 60} minutes`}
                      style={{ flex: "none", width: 38, minHeight: 44, padding: 0, justifyContent: "center", background: P.sheet, ...T.chip }}>
                      +{d / 60}
                    </Btn>
                  ))}
                </div>
                <div style={{ ...T.nano, color: P.mute, textAlign: "center", marginTop: S[2] }}>minutes</div>
              </div>

              <div style={{ ...T.micro, color: P.mute, marginBottom: S[3] }}>This timer</div>
              <input
                value={editing.name}
                onChange={(e) => patch(editing.id, { name: e.target.value })}
                style={{ width: "100%", background: P.well, border: "none", color: P.ink, borderRadius: R.md, padding: `${S[3]}px ${S[3]}px`, ...T.action, marginBottom: S[3] }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: S[1] }}>
                {INKS.map((k) => (
                  <button
                    key={k.solid}
                    onClick={() => { buzz(H.tap); patch(editing.id, { color: k.solid }); }}
                    aria-label={k.name}
                    style={{
                      width: "100%", height: 44, borderRadius: R.md, background: k.solid, border: "none",
                      cursor: "pointer",
                      boxShadow: editing.color === k.solid ? `inset 0 0 0 3px ${P.sheet}, inset 0 0 0 5px ${P.ink}` : "none",
                      transition: `transform ${M.tap}`, transform: editing.color === k.solid ? "scale(1.06)" : "scale(1)",
                    }}
                  />
                ))}
              </div>

              {/* label is caption, value is content: they used to be the same type */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: `${S[5]}px 0 ${S[2]}px` }}>
                <span style={{ ...T.nano, color: P.mute }}>How much a day</span>
                {editing.goal
                  ? <Num sec={editing.goal} role="data" />
                  : <span style={{ ...T.data, color: P.mute }}>None</span>}
              </div>
              <GoalBar value={editing.goal} color={c.solid} onChange={(sec) => patch(editing.id, { goal: sec })} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: `${S[5]}px 0 ${S[2]}px` }}>
                <span style={{ ...T.nano, color: P.mute }}>How often a week</span>
                {/* Rule 3 again: the unit is derived from its numeral, never chosen */}
                <span style={{ ...T.data, color: P.ink }}>
                  {editing.perWeek || 7}
                  <span style={{ fontSize: T.data.fontSize * 0.42, fontWeight: 600, letterSpacing: "0", opacity: 0.45, marginLeft: 2 }}>
                    {(editing.perWeek || 7) === 1 ? "day" : "days"}
                  </span>
                </span>
              </div>
              <WeekBar value={editing.perWeek || 0} color={c.solid} on={c.on}
                onChange={(v) => patch(editing.id, { perWeek: v })} />
              <div style={{ ...T.label, color: P.mute, marginTop: S[3] }}>
                {editing.perWeek
                  ? `Hit ${editing.perWeek} and it stops being owed for the rest of the week.`
                  : "Owed every day."}
              </div>

              <div style={{ height: S[6] + S[4] }} />
              {/* deleting takes the timer's history with it, so it asks once */}
              {armed === editing.id ? (
                <div style={{ display: "flex", gap: S[2] }}>
                  <Btn onClick={() => setArmed(null)} style={{ flex: 1 }}>Keep</Btn>
                  <Btn tone="bad" onClick={() => { setArmed(null); removeTimer(editing.id); }}
                    style={{ flex: 1, background: ALARM.solid, color: P.sheet, boxShadow: "none" }}>
                    Delete for good
                  </Btn>
                </div>
              ) : (
                <Btn tone="bad" onClick={() => { buzz(H.tap); setArmed(editing.id); }} style={{ width: "100%" }}>Delete timer</Btn>
              )}
              {armed === editing.id && (
                <div style={{ ...T.label, color: P.mute, marginTop: S[2] }}>
                  This removes {editing.name} and everything it has logged.
                </div>
              )}
            </>
          );
        })()}
      </Sheet>

      {/* ---------- the week: seven bars a timer, height is that day's share of goal.
           the date in the top line has always pointed here; until now nothing was
           listening, so tapping it did nothing at all. ---------- */}
      <Sheet open={sheet?.kind === "week"} onClose={() => setSheet(null)} title="This week">
        {sheet?.kind === "week" && (
          <div style={{ display: "flex", flexDirection: "column", gap: S[4] }}>
            {cfg.timers.length === 0 && (
              <div style={{ ...T.label, color: P.mute }}>No timers yet.</div>
            )}
            {cfg.timers.map((t) => {
              const c = ink(t.color);
              const w = weekStats(log, t.id, cfg.weekStart, lnow);
              const wp = weekProgress(log, t, cfg.weekStart, lnow);
              const st = streak(log, t.id, lnow);
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "flex-end", gap: S[3] }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: S[2] }}>
                      <span style={{ ...T.action, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                      {t.perWeek > 0 && (
                        <span style={{ ...T.chip, flex: "none", color: wp.met ? c.solid : P.mute }}>{wp.hit}/{t.perWeek}</span>
                      )}
                    </div>
                    <div style={{ ...T.nano, color: P.mute, marginTop: 4 }}>
                      {w.ran
                        ? `${fmtShort(w.avg)} avg on ${w.ran}d${st > 1 ? ` · ${st}d streak` : ""}`
                        : "nothing yet this week"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, flex: "none" }}>
                    {w.days.map((d, k) => {
                      const rec = log.days[d.key]?.[t.id];
                      const sec = rec?.sec || 0;
                      const frac = t.goal ? Math.min(1.25, sec / t.goal) : sec > 0 ? 1 : 0;
                      const h = sec > 0 ? Math.max(4, Math.round((frac * 28) / 4) * 4) : 0;
                      /* every day gets a full height track, so an empty day reads as
                         an empty bar instead of a dash floating on the baseline */
                      return (
                        <div key={k} title={`${d.key}: ${sec ? fmtShort(sec) : "nothing"}`}
                          style={{
                            width: 12, height: 36, borderRadius: 4, position: "relative",
                            background: d.future ? "transparent" : P.well,
                            boxShadow: d.future ? `inset 0 0 0 1.5px ${P.hair}` : d.today ? `inset 0 0 0 1.5px ${P.ink}` : "none",
                            overflow: "hidden",
                          }}>
                          {sec > 0 && (
                            <div style={{
                              position: "absolute", left: 0, right: 0, bottom: 0, height: h,
                              background: rec.done ? c.solid : c.tint,
                              transformOrigin: "50% 100%",
                              animation: weekPop === t.id ? `sq 300ms ${SNAPPY} ${k * 40}ms both` : "none",
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ ...T.nano, color: P.mute, marginTop: S[2] }}>
              solid means the day met its goal · outlined is today
            </div>
          </div>
        )}
      </Sheet>

      {/* ---------- settings ---------- */}
      <Sheet open={sheet?.kind === "settings"} onClose={() => { setSheet(null); save(true); }} title="Settings">
        {[["Wake", "wake"], ["Bed", "bed"]].map(([label, k]) => (
          <Field key={k} label={label}>
            <TimeField value={cfg[k]} buzz={buzz} onChange={(v) => setCfg((p) => ({ ...p, [k]: v }))} />
          </Field>
        ))}
        <div style={{ ...T.label, color: P.mute, margin: `${S[3]}px 0 ${S[4]}px` }}>
          A day runs wake to wake, so a session past midnight still counts for the day
          before. Bed is a deadline, not a cut off.
        </div>
        <Field label="Week">
          <DayPicker value={cfg.weekStart} buzz={buzz} onChange={(i) => setCfg((p) => ({ ...p, weekStart: i }))} />
        </Field>
        <Field label="Sound and haptics">
          <Toggle on={cfg.sound} onChange={(v) => setCfg((p) => ({ ...p, sound: v }))} />
        </Field>
        <Field label="Reminders while running">
          <Toggle on={cfg.notify} onChange={async (v) => {
            if (v) {
              try {
                if ((await Notification.requestPermission()) !== "granted") return say("Your browser blocked notifications");
              } catch (e) { return say("Notifications are not available here"); }
            }
            setCfg((p) => ({ ...p, notify: v }));
          }} />
        </Field>
        {/* Say plainly what will and will not arrive. A browser that cannot hold a
            booked notification cannot wake a closed app at all, and a reminder the
            user is counting on and does not get is worse than no reminder. */}
        <div style={{ ...T.label, color: P.mute, margin: `${S[2]}px 0 0` }}>
          {cfg.notify
            ? (BOOKABLE
                ? "A goal is booked with the phone when its timer starts, so it lands on time with the app closed."
                : "This browser only delivers while the app is open. With it closed, a met goal waits until you come back.")
            : "Off. Nothing is sent."}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: `${S[5]}px 0 ${S[2]}px` }}>
          <span style={{ ...T.micro, color: P.mute }}>Your data</span>
          <span style={{ ...T.nano, color: P.mute }}>build 20 · rewards</span>
        </div>
        <div style={{ ...T.label, color: P.mute, marginBottom: S[3] }}>
          Saves continuously and keeps a second backup copy. Three weeks of history is kept.
        </div>
        <div style={{ display: "flex", gap: S[2] }}>
          <Btn style={{ flex: 1 }} onClick={async () => {
            try { await navigator.clipboard.writeText(JSON.stringify({ cfg, log })); say("Backup copied"); }
            catch (e) { say("Clipboard is blocked here"); }
          }}>Copy backup</Btn>
          <Btn style={{ flex: 1 }} onClick={async () => {
            try {
              const p = JSON.parse(await navigator.clipboard.readText());
              if (!p.cfg || !p.log) throw new Error("bad");
              setCfg({ ...DEFAULT_CFG, ...p.cfg });
              setLog(prune({ ...DEFAULT_LOG, ...p.log, running: {}, flowStart: null }));
              say("Backup restored");
            } catch (e) { say("Nothing valid on the clipboard"); }
          }}>Restore</Btn>
        </div>
      </Sheet>
    </div>
  );
}
