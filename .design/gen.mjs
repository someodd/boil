import { readFileSync, writeFileSync } from "node:fs";
const head = readFileSync("_head.part", "utf8");
const tail = `</x-dc>\n</body>\n</html>\n`;

const PAPER = "#EFEFEA", INK = "#17171C", MUTE = "#6B6B63", ALARM = "#CE3118", WASH = "#FFE1D9";
const K = 0.86;
const DUSK = "#CECEC9";                     /* paper x 0.86 */
const dim = (hex) => "#" + [1,3,5].map(i => Math.round(parseInt(hex.slice(i,i+2),16)*K).toString(16).padStart(2,"0")).join("");

const Q = [
  { n: "Drex",         num: "8<i>h</i>",  at: "19:37", solid: "#2438D6", tint: "#B8D3FF", night: "#1B225B", h: 330 },
  { n: "Chinese",      num: "46<i>m</i>", at: "03:37", solid: "#FF6B00", tint: "#FFC2A2", night: "#663312", h: 26 },
  { n: "Reading",      num: "30<i>m</i>", at: "04:24", solid: "#7B2FF7", tint: "#D5C9FF", night: "#391F67", h: 26 },
  { n: "Adulting",     num: "30<i>m</i>", at: "04:54", solid: "#2E9E1F", tint: "#B5E3AE", night: "#1F451D", h: 26 },
  { n: "Job Hunt",     num: "30<i>m</i>", at: "05:24", solid: "#00A88E", tint: "#AEE1D3", night: "#0F4843", h: 26 },
  { n: "ML",           num: "1<i>h</i>",  at: "05:54", solid: "#FFC400", tint: "#EBD197", night: "#665212", h: 34 },
  { n: "Lecter Study", num: "25<i>m</i>", at: "06:54", solid: "#D01070", tint: "#FFB9D2", night: "#561539", h: 26 },
];
const BEDY = 16, MIDY = 190;

/* ---------------------------------------------------------------- chrome */
const chrome = (queue, o = {}) => {
  const done = o.done ?? "0/7", hero = o.hero ?? "13<i>m</i>", sub = o.sub ?? "banked &middot; 11h 20m past bed",
        nowAt = o.nowAt ?? "19:37", g1 = o.g1 ?? 62, g2 = o.g2 ?? 72, past = o.past ?? { at: "11:10", c: "#FF6B00", n: "Chinese", num: "13<i>m</i>" };
  return `
<div class="app">
  <div class="row nano" style="height:34px;align-items:center;padding-left:64px;padding-right:20px">
    <span>Sun 23 Aug &middot; ${done} done</span><span style="margin-left:auto">Settings</span>
  </div>
  <div class="row" style="height:24px;align-items:center">
    <div class="gut nano">06:00</div>
    <div style="flex:1;position:relative;height:100%;display:flex;align-items:center">
      <div style="position:absolute;left:0;right:0;top:50%;border-top:1.5px dashed ${INK};opacity:.28"></div>
      <span class="nano" style="color:${MUTE};background:${PAPER};padding:0 8px 0 12px;position:relative">up</span>
    </div>
  </div>
  <div style="height:${g1}px;flex:none"></div>
  <div class="row" style="height:28px">
    <div class="gut nano">${past.at}</div>
    <div class="bd" style="background:${past.c};color:${INK}">
      <span class="nm">${past.n}</span><span class="q">${past.num}</span>
    </div>
  </div>
  <div style="height:${g2}px;flex:none"></div>
  <div class="row" style="height:84px;align-items:center;background:${INK};color:${PAPER};padding-right:20px;z-index:4">
    <div style="width:52px;flex:none;text-align:right;padding-right:12px">
      <div class="nano" style="color:rgba(239,239,234,.55)">now</div>
      <div class="nano" style="color:${PAPER};margin-top:4px">${nowAt}</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div class="hero">${hero}</div>
      <div class="nano" style="color:rgba(239,239,234,.55);margin-top:-2px">${sub}</div>
    </div>
  </div>
${queue}
  <div class="row nano" style="margin-top:auto;height:34px;align-items:center;padding-right:20px">
    <span style="margin-left:auto">New timer</span>
  </div>
</div>`;
};

const row = (b, { fill, shadow, name = INK, num = INK, stamp = MUTE, showStamp = true, last, h }) => `
  <div class="row" style="height:${h ?? b.h}px;${last ? "" : "margin-bottom:2px;"}">
    <div class="gut nano" style="color:${stamp}">${showStamp ? b.at : ""}</div>
    <div class="bd" style="background:${fill};box-shadow:${shadow}">
      <span class="nm" style="color:${name}">${b.n}</span><span class="q" style="color:${num}">${b.num}</span>
    </div>
  </div>`;

/* the deadline: one hairline, one stamp, one quantity. never a rail. */
const bedLine = (top, { label = "bed", ground = PAPER } = {}) => `
  <div style="position:absolute;left:52px;right:0;top:${top}px;height:0;border-top:1.5px dashed ${ALARM};z-index:6"></div>
  <div class="nano" style="position:absolute;left:0;top:${top - 6}px;width:52px;text-align:right;padding-right:12px;color:${MUTE};z-index:7">20:00</div>
  <div class="nano" style="position:absolute;left:52px;top:${top - 7}px;font-size:10.5px;letter-spacing:.124em;color:${INK};background:${ground};padding:0 8px 0 12px;z-index:7">${label}</div>`;

/* midnight is a fact about the axis, not about the plan, so it keeps its stamp */
const midnight = (y, line, text) => `
  <div style="position:absolute;left:52px;right:0;top:${y}px;height:0;border-top:1px dashed ${line};z-index:5"></div>
  <div style="position:absolute;left:0;top:${y - 15}px;width:52px;text-align:right;padding-right:12px;z-index:6">
    <div class="nano" style="color:${text}">00:00</div>
    <div class="nano" style="color:${text};opacity:.66">mon</div>
  </div>`;

/* =============================================== TODAY — the bug as shipped */
const today = chrome(`
  <div class="queue">
${Q.map((b, i) => row(b, { fill: b.tint, shadow: `inset 4px 0 0 0 ${b.solid}`, h: i === 0 ? 302 : b.h, last: i === Q.length - 1 })).join("")}
  </div>
  <div class="row" style="height:28px;align-items:center;flex:none">
    <div class="gut nano" style="color:${ALARM}">20:00</div>
    <div style="flex:1;position:relative;height:100%;display:flex;align-items:center">
      <div style="position:absolute;left:0;right:0;top:50%;border-top:1.5px dashed ${ALARM}"></div>
      <span class="nano" style="color:${ALARM};background:${PAPER};padding:0 8px 0 12px;position:relative">past bed</span>
    </div>
  </div>`);

/* ===================================================== MAIN — what ships */
const main = chrome(`
  <div class="queue">
    <div style="position:absolute;left:52px;right:0;top:${BEDY}px;bottom:0;background:${DUSK};z-index:0"></div>
${Q.map((b, i) => row(b, {
    fill: i === 0 ? `linear-gradient(${b.tint} 0 ${BEDY}px, ${dim(b.tint)} ${BEDY}px)` : dim(b.tint),
    shadow: i === 0
      ? `inset 4px 0 0 0 ${b.solid}`
      : `inset 4px 0 0 0 ${dim(b.solid)}`,
    showStamp: false,            /* row 0 duplicates NOW; everything below the line is a guess */
    last: i === Q.length - 1,
  })).join("")}
${midnight(MIDY, "rgba(23,23,28,.30)", MUTE)}
${bedLine(BEDY, { ground: Q[0].tint })}
  </div>`);

/* ============================ SLIVER — the same rule, a small overrun */
const S2 = [
  { n: "Drex",    num: "2<i>h</i>10", at: "17:12", solid: "#2438D6", tint: "#B8D3FF", h: 315 },
  { n: "Chinese", num: "46<i>m</i>",  at: "19:22", solid: "#FF6B00", tint: "#FFC2A2", h: 113 },
  { n: "Reading", num: "30<i>m</i>",  at: "",      solid: "#7B2FF7", tint: "#D5C9FF", h: 74 },
];
const SBED = 413;   /* 20:00 lands inside Chinese */
const sliver = chrome(`
  <div class="queue">
    <div style="position:absolute;left:52px;right:0;top:${SBED}px;bottom:0;background:${DUSK};z-index:0"></div>
${S2.map((b, i) => {
    const topOf = [0, 317, 432][i], bot = topOf + b.h;
    const cut = SBED > topOf && SBED < bot ? SBED - topOf : null;
    const under = topOf >= SBED;
    return row(b, {
      fill: cut !== null ? `linear-gradient(${b.tint} 0 ${cut}px, ${dim(b.tint)} ${cut}px)` : under ? dim(b.tint) : b.tint,
      shadow: `inset 4px 0 0 0 ${under ? dim(b.solid) : b.solid}`,
      showStamp: i !== 0 && !under,
      last: i === S2.length - 1,
    });
  }).join("")}
${bedLine(SBED, { ground: S2[1].tint })}
  </div>`, { done: "3/7", hero: "4<i>h</i>20", sub: "banked &middot; 40m past bed", nowAt: "17:12", g1: 67, g2: 67,
             past: { at: "09:40", c: "#2438D6", n: "Drex", num: "4<i>h</i>20" } });

/* ================================================= BOUNDARY — the spec */
const pair = (label, a) => `
  <div style="display:flex;align-items:center;gap:12px">
    <span class="nano" style="color:${MUTE};width:96px;flex:none">${label}</span>
    <span style="width:56px;height:22px;flex:none;background:${a}"></span>
    <span class="nano" style="color:${MUTE};width:62px;flex:none">${a.toUpperCase()}</span>
    <span class="nano" style="color:${MUTE};flex:none">&rarr;</span>
    <span style="width:56px;height:22px;flex:none;background:${dim(a)}"></span>
    <span class="nano" style="color:${MUTE};width:62px;flex:none">${dim(a).toUpperCase()}</span>
  </div>`;

const boundary = `
<div style="width:660px;height:600px;background:${PAPER};color:${INK};padding:28px 32px;box-sizing:border-box;
     font-family:'Archivo',ui-rounded,-apple-system,'Helvetica Neue',system-ui,sans-serif;
     font-variant-numeric:tabular-nums;display:flex;gap:32px">

  <div style="width:220px;flex:none">
    <div class="nano" style="color:${MUTE};margin-bottom:14px">the boundary, 2&times;</div>
    <div style="position:relative;width:220px;height:300px;background:${PAPER};overflow:hidden">
      <div style="position:absolute;left:104px;right:0;top:96px;bottom:0;background:${DUSK}"></div>
      <div style="position:absolute;left:0;top:0;bottom:0;width:104px"></div>
      <div style="position:absolute;left:104px;right:0;top:0;height:96px;background:#B8D3FF;box-shadow:inset 8px 0 0 0 #2438D6"></div>
      <div style="position:absolute;left:104px;right:0;top:96px;bottom:0;background:${dim("#B8D3FF")};box-shadow:inset 8px 0 0 0 #2438D6"></div>
      <div style="position:absolute;left:104px;right:0;top:96px;height:0;border-top:3px dashed ${ALARM}"></div>
      <div class="nano" style="position:absolute;left:0;top:70px;width:104px;text-align:right;padding-right:16px;color:${MUTE};font-size:19px;letter-spacing:.124em">20:00</div>
      <div class="nano" style="position:absolute;left:128px;top:104px;color:${INK};background:#B8D3FF;padding:0 10px 0 14px;font-size:21px;letter-spacing:.124em">bed</div>
      <div style="position:absolute;left:128px;top:190px;font-size:26px;font-weight:700;letter-spacing:-.02em">Drex</div>
    </div>
    <div class="nano" style="color:${MUTE};margin-top:14px;line-height:15px;text-transform:none;letter-spacing:0;font-size:11px;font-weight:500">
      Red lives in the rule only. At 9.5&ndash;10.5px a pure-red glyph carries roughly one
      stroke width of chromatic blur, so the type stays ink and the mask takes whatever
      ground it stands on &mdash; here the block's own tint.
    </div>
  </div>

  <div style="flex:1;min-width:0">
    <div style="font-size:30px;font-weight:800;font-stretch:108%;letter-spacing:-.0263em;line-height:32px">Dim, don't invert</div>
    <div class="nano" style="color:${MUTE};margin-top:8px">every value past the line &times; 0.86</div>

    <div style="display:flex;flex-direction:column;gap:6px;margin-top:22px">
      ${pair("ground", PAPER)}
      ${["#B8D3FF","#FFC2A2","#D5C9FF","#B5E3AE","#AEE1D3","#EBD197","#FFB9D2"].map((t, i) => pair(["cobalt","orange","violet","grass","jade","chrome","magenta"][i], t)).join("")}
    </div>

    <div style="margin-top:26px;border-top:1.5px solid ${INK};padding-top:14px">
      <div class="nano" style="color:${INK}">why a multiply</div>
      <div style="font-size:13px;font-weight:500;line-height:19px;margin-top:8px;max-width:340px">
        Multiplication is monotone per channel, so ground &gt; tint &gt; solid cannot invert &mdash;
        which is exactly what a night ground does to cobalt and violet. One scalar, no second
        palette, and the ordering is preserved by construction rather than by tuning.
      </div>
    </div>
  </div>
</div>`;

const nightfall = chrome(`
  <div class="queue">
    <div style="position:absolute;left:0;right:0;top:${BEDY}px;bottom:0;background:${INK};z-index:0"></div>
${Q.map((b, i) => row(b, {
    fill: i === 0 ? `linear-gradient(${b.tint} 0 ${BEDY}px, ${b.night} ${BEDY}px)` : b.night,
    shadow: `inset 4px 0 0 0 ${b.solid}`,
    name: b.tint, num: b.tint,
    stamp: i === 0 ? MUTE : "rgba(239,239,234,.55)",
    last: i === Q.length - 1,
  })).join("")}
${midnight(MIDY, "rgba(239,239,234,.22)", "rgba(239,239,234,.5)")}
${bedLine(BEDY, { label: "past bed" })}
  </div>`);

const wrap = (b) => head + b + tail;
writeFileSync("Today.dc.html", wrap(today));
writeFileSync("Main.dc.html", wrap(main));
writeFileSync("Sliver.dc.html", wrap(sliver));
writeFileSync("Boundary.dc.html", wrap(boundary));
writeFileSync("Nightfall.dc.html", wrap(nightfall));
console.log("dusk", DUSK, "| cobalt tint", dim("#B8D3FF"), "| cobalt solid", dim("#2438D6"));
