(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const F = "static/frames/";

/* ================= pixel icons (same art as the paper's figures) ================= */
const PAL = {
  k:"#1C1C1C", w:"#EEEEEE", b:"#60402A", B:"#8A5A36", y:"#C9A56E", Y:"#D6BEA0",
  g:"#5E9E43", G:"#3F7A2E", l:"#6A4E2E", m:"#9C7A4A", u:"#3C7BD9", U:"#8CC0F2",
  p:"#F0A4B0", q:"#CC6E80", d:"#2C602C", e:"#569654", s:"#808080", t:"#A8A8A8",
  v:"#5C5C5C", o:"#D8AF93", c:"#1C1C1C"
};
const ICONS = {
  river:["gGgggGgg","uuuuuuuu","UUuuuUUu","uuUUuuuU","uuuuuuuu","uUUuuuUU","UuuUUuuu","gggGgggG"],
  bank:["gGggGggG","gggggggg","bbbBbbbb","bBbbbbBb","bbbbBbbb","bbBbbbbB","bbbbbbbb","BbbbBbbb"],
  tree:["..gGgg..",".gggGgg.","gGgggGgg","ggGggggg",".ggggGg.","...ll...","...ll...","..gllg.."],
  log:["mmmmmmmm","myyyyyym","mylllyym","mylmlyym","mylllyym","myyyyyym","mmmmmmmm","lmlmlmlm"],
  collect:["........","mmmm....","myym....","mmmmmmmm","lmlmmyym","....mmmm","....lmlm","........"],
  cow:["bbbbbbbb","bbwwwwbb","wkwwwwkw","wwwwwwww","bYYYYYYb","bYkYYkYb","bYYYYYYb","bbbbbbbb"],
  sheep:["wwwwwwww","wwwwwwww","wYYYYYYw","wYkYYkYw","wYYYYYYw","wYYppYYw","wwYYYYww","wwwwwwww"],
  pig:["pppppppp","pppppppp","pkwppwkp","pppppppp","ppqqqqpp","pqkqqkqp","pqqqqqqp","pppppppp"],
  zombie:["dddddddd","deeddeed","eeeeeeee","ekkeekke","eeeddeee","eeddddee","edeeeede","eeeeeeee"],
  oak:["lmllmllm","lmllmllm","mllmllml","llmllmll","lmllmllm","mllmllml","llmllmll","lmllmllm"],
  mine:["sstsssvs","sooststs","tosvsoot","sssssoss","stoossts","vsotssos","ssvssoov","ssssvsss"]
};
const iconCache = {};
function iconURL(name) {
  if (iconCache[name]) return iconCache[name];
  const rows = ICONS[name]; if (!rows) return "";
  const c = document.createElement("canvas"); c.width = c.height = 8;
  const x = c.getContext("2d");
  rows.forEach((r, i) => [...r].forEach((ch, j) => {
    if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(j, i, 1, 1); }
  }));
  return (iconCache[name] = c.toDataURL());
}
function pix(name, cls = "pix") {
  const s = document.createElement("span");
  s.className = cls; s.style.background = `url(${iconURL(name)}) center/100% 100% no-repeat`;
  s.style.imageRendering = "pixelated"; return s;
}
function paintIcons(root = document) {
  $$("[data-icon]", root).forEach(el => {
    el.style.background = `url(${iconURL(el.dataset.icon)}) center/100% 100% no-repeat`;
    el.style.imageRendering = "pixelated";
  });
}
paintIcons();

/* ================= hero wall ================= */
const V = "static/video/";
const TASKS = ["kill_cow", "kill_sheep", "kill_pig", "mine_oak"];
const wallFrames = [];
TASKS.forEach(t => [0, 1, 2, 3].forEach(i => wallFrames.push(`${F}ours_${t}_${i}.jpg`)));
["sheep", "oak"].forEach(t => [0, 1, 2, 3].forEach(i => wallFrames.push(`${F}cmp_${t}_ours_${i}.jpg`)));
const wall = $("#wall");
for (let c = 0; c < 4; c++) {
  const col = document.createElement("div"); col.className = "wcol";
  col.style.animationDuration = `${70 + c * 12}s`;
  const list = wallFrames.filter((_, i) => i % 4 === c).concat(wallFrames.filter((_, i) => i % 4 === (c + 1) % 4));
  const seq = list.concat(list);
  seq.forEach(src => { const im = new Image(); im.src = src; im.alt = ""; im.loading = "lazy"; col.appendChild(im); });
  wall.appendChild(col);
}
requestAnimationFrame(() => $$(".hero .reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), 120 + i * 140)));

/* ================= nav ================= */
const nav = $("#nav");
const secs = $$("section.block");
const links = $$(".nl a");
function onScroll() {
  nav.classList.toggle("solid", scrollY > 40);
  let cur = null;
  secs.forEach(s => { if (s.getBoundingClientRect().top < 140) cur = s.id; });
  links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === `#${cur}`));
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ================= on-visible helper ================= */
function onVisible(el, fn, threshold = 0.3) {
  if (!el) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { fn(); io.disconnect(); }
  }), { threshold });
  io.observe(el);
}

/* ================= stats count-up ================= */
onVisible($("#stats"), () => {
  $$("[data-count]").forEach(el => {
    const to = +el.dataset.count, t0 = performance.now(), dur = 1300;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
});

/* ================= KaTeX ================= */
function renderMath() {
  if (!window.katex) return setTimeout(renderMath, 100);
  $$(".eq").forEach(el => katex.render(el.dataset.eq, el, { displayMode: true, throwOnError: false }));
  $$(".m").forEach(el => katex.render(el.textContent, el, { throwOnError: false }));
}
renderMath();

/* ================= two-rate simulation ================= */
const PLAN = [
  { icon: "river", name: "Cross river", frames: [0, 1, 2].map(i => `${F}river_${i}.jpg`) },
  { icon: "bank", name: "Climb bank", frames: [3, 4].map(i => `${F}river_${i}.jpg`) },
  { icon: "tree", name: "Reach tree", frames: [`${F}river_5.jpg`] },
  { icon: "log", name: "Break log", frames: [1, 2].map(i => `${F}ours_mine_oak_${i}.jpg`) },
  { icon: "collect", name: "Collect", frames: [`${F}ours_mine_oak_3.jpg`] }
];
// Illustrative key/button patterns per goal (not recorded actions).
const PATTERN = [
  { keys: ["W"], alt: ["W", "SPACE"], btn: [], cam: [0.15, 0] },
  { keys: ["W", "SPACE"], alt: ["W"], btn: [], cam: [0.1, -0.25] },
  { keys: ["W"], alt: ["W", "A"], btn: [], cam: [-0.2, -0.05] },
  { keys: [], alt: [], btn: ["L"], cam: [0.04, 0.02] },
  { keys: ["W"], alt: ["S"], btn: [], cam: [0, 0.3] }
];
const STEPS_PER_GOAL = 70; // ~3.5 s at 20 Hz
const sim = { running: true, phase: "plan", tick: 0, goal: 0, timer: null, planT: [] };
const stepsEl = $("#sim-steps"), film = $("#filmstrip");
PLAN.forEach((p, i) => {
  const d = document.createElement("div"); d.className = "step";
  d.innerHTML = `<span class="n">${i + 1}</span><span class="z">z<sub>${i + 1}</sub></span>`;
  d.insertBefore(pix(p.icon), d.children[1]);
  d.appendChild(document.createTextNode(p.name));
  stepsEl.appendChild(d);
});
for (let i = 0; i < 4; i++) { const im = new Image(); im.alt = ""; film.appendChild(im); }
const stepEls = $$(".step", stepsEl), filmImgs = $$("img", film);
const keyEls = $$(".hud .key"), btnEls = $$(".hud .mbtn");
let camX = 0, camY = 0;

function simReset() {
  clearInterval(sim.timer); sim.planT.forEach(clearTimeout); sim.planT = [];
  sim.phase = "plan"; sim.tick = 0; sim.goal = 0; camX = camY = 0;
  stepEls.forEach(s => s.className = "step");
  $("#m-plan").textContent = "0"; $("#m-ctrl").textContent = "0"; $("#m-goal").textContent = "\u2013";
  $("#active-z").style.opacity = 0;
  filmImgs.forEach(im => { im.removeAttribute("src"); im.className = ""; });
  keyEls.concat(btnEls).forEach(k => k.classList.remove("on"));
  const pb = $("#planner-box"); pb.classList.add("think");
  sim.planT.push(setTimeout(() => {
    pb.classList.remove("think");
    $("#m-plan").textContent = "1";
    stepEls.forEach((s, i) => sim.planT.push(setTimeout(() => s.classList.add("show"), i * 260)));
    sim.planT.push(setTimeout(startControl, PLAN.length * 260 + 300));
  }, 1300));
}
function setGoal(j) {
  sim.goal = j;
  stepEls.forEach((s, i) => { s.classList.toggle("active", i === j); s.classList.toggle("done", i < j); });
  const az = $("#active-z"); az.innerHTML = `z<sub>${j + 1}</sub>`; az.style.opacity = 1;
  $("#m-goal").innerHTML = `z<sub>${j + 1}</sub> \u00b7 ${PLAN[j].name}`;
}
function startControl() {
  sim.phase = "ctrl"; setGoal(0);
  sim.timer = setInterval(() => { if (sim.running) ctrlTick(); }, 50);
}
function ctrlTick() {
  sim.tick++;
  $("#m-ctrl").textContent = sim.tick;
  const local = sim.tick % STEPS_PER_GOAL;
  if (local === 0) {
    if (sim.goal + 1 < PLAN.length) setGoal(sim.goal + 1);
    else { simReset(); return; }
  }
  const p = PLAN[sim.goal], pat = PATTERN[sim.goal];
  // filmstrip: sliding window of the latest frames for this goal
  if (sim.tick % 6 === 0 || local === 1) {
    const fr = p.frames, n = Math.floor(local / 6);
    filmImgs.forEach((im, i) => {
      im.src = fr[(n + i) % fr.length];
      im.classList.toggle("cur", i === 3);
    });
  }
  const useAlt = Math.floor(sim.tick / 9) % 3 === 2;
  const keys = useAlt ? pat.alt : pat.keys;
  keyEls.forEach(k => k.classList.toggle("on", keys.includes(k.dataset.k)));
  const btnOn = pat.btn.length && (sim.tick % 6) < 3;
  btnEls.forEach(b => b.classList.toggle("on", !!btnOn && pat.btn.includes(b.dataset.k)));
  camX = Math.max(-18, Math.min(18, camX * 0.85 + pat.cam[0] * 18 + (Math.random() - 0.5) * 5));
  camY = Math.max(-18, Math.min(18, camY * 0.85 + pat.cam[1] * 18 + (Math.random() - 0.5) * 3));
  $("#cam-dot").style.transform = `translate(${camX}px,${camY}px)`;
  const cb = $("#ctrl-box"); cb.classList.add("tick"); setTimeout(() => cb.classList.remove("tick"), 25);
}
$("#sim-toggle").addEventListener("click", e => {
  sim.running = !sim.running; e.target.textContent = sim.running ? "Pause" : "Play";
});
$("#sim-restart").addEventListener("click", () => { sim.running = true; $("#sim-toggle").textContent = "Pause"; simReset(); });
onVisible($("#sim"), simReset, 0.35);

/* ================= stage tabs ================= */
$$(".stage-tab").forEach(btn => btn.addEventListener("click", () => {
  const k = +btn.dataset.stage;
  $$(".stage-tab").forEach((b, i) => b.classList.toggle("active", i === k));
  $$(".stage-panel").forEach((p, i) => p.classList.toggle("active", i === k));
  $("#stage-bar").style.transform = `translateX(${k * 100}%)`;
}));

/* ================= reward playground (toy) ================= */
const TOY = [
  { id: 0, icon: "river", name: "Cross river" },
  { id: 1, icon: "bank", name: "Climb bank" },
  { id: 2, icon: "tree", name: "Reach tree" },
  { id: 3, icon: "log", name: "Break log" },
  { id: 4, icon: "collect", name: "Collect" }
];
const DEPS = [[0, 1], [2, 3], [3, 4]]; // illustrative must-precede pairs
let order = [0, 1, 2, 3, 4], dropped = new Set();
const toyEl = $("#toy");
function toyRender() {
  toyEl.innerHTML = "";
  const kept = order.filter(i => !dropped.has(i));
  const pos = {}; kept.forEach((id, p) => pos[id] = p);
  const k = TOY.length, kh = kept.length;
  const full = kh === k;
  const violated = new Set();
  if (full) DEPS.forEach(([a, b]) => { if (pos[a] > pos[b]) { violated.add(a); violated.add(b); } });
  order.forEach((id, idx) => {
    const t = TOY[id];
    const li = document.createElement("li");
    if (dropped.has(id)) li.classList.add("dropped");
    if (violated.has(id)) li.classList.add("viol");
    li.appendChild(pix(t.icon));
    const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = t.name; li.appendChild(nm);
    const pre = DEPS.filter(d => d[1] === id).map(d => TOY[d[0]].name);
    if (pre.length) { const dp = document.createElement("span"); dp.className = "deps"; dp.textContent = `after ${pre.join(", ")}`; li.appendChild(dp); }
    [["\u2191", () => swap(idx, idx - 1)], ["\u2193", () => swap(idx, idx + 1)],
     [dropped.has(id) ? "+" : "\u00d7", () => { dropped.has(id) ? dropped.delete(id) : dropped.add(id); toyRender(); }]]
      .forEach(([lab, fn]) => { const b = document.createElement("button"); b.textContent = lab; b.onclick = fn; li.appendChild(b); });
    toyEl.appendChild(li);
  });
  const Rk = Math.max(0, 1 - Math.abs(kh - k) / k);
  let Sdep = null, Sconv = null, Rord = 0;
  if (full) {
    const dset = new Set(DEPS.map(d => d.join("-")));
    let dOk = 0; DEPS.forEach(([a, b]) => { if (pos[a] < pos[b]) dOk++; });
    Sdep = dOk / DEPS.length;
    let fN = 0, fOk = 0;
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
      if (dset.has(`${i}-${j}`) || dset.has(`${j}-${i}`)) continue;
      fN++; if (pos[i] < pos[j]) fOk++;
    }
    Sconv = fOk / fN;
    Rord = 0.8 * Sdep + 0.2 * Sconv;
  }
  const R = 0.3 * Rk + 0.7 * Rord;
  $("#t-rk").textContent = Rk.toFixed(2);
  $("#t-sdep").textContent = Sdep === null ? "n/a" : Sdep.toFixed(2);
  $("#t-sconv").textContent = Sconv === null ? "n/a" : Sconv.toFixed(2);
  $("#t-r").textContent = R.toFixed(2);
  $("#t-rbar").style.width = `${R * 100}%`;
}
function swap(a, b) {
  if (b < 0 || b >= order.length) return;
  [order[a], order[b]] = [order[b], order[a]]; toyRender();
}
$("#toy-reset").onclick = () => { order = [0, 1, 2, 3, 4]; dropped = new Set(); toyRender(); };
toyRender();

/* ================= closed-loop chart (Table 1) ================= */
const CL = {
  models: ["VPT-BC", "VPT-RL", "STEVE-1", "JARVIS-VLA-7B", "TaskFrame (Ours)"],
  views: [
    { key: "kill", label: "Kill avg.", icon: null, v: [15, 8, 13, 31, 51], e: [5.4, 4.5, 5.2, 6.6, 7.0],
      note: "Average over the four kill tasks; error bars show a binomial estimate of the standard deviation across seeds." },
    { key: "cow", label: "Cow", icon: "cow", v: [17, 8, 17, 17, 67] },
    { key: "sheep", label: "Sheep", icon: "sheep", v: [17, 17, 8, 33, 58] },
    { key: "pig", label: "Pig", icon: "pig", v: [17, 8, 17, 50, 42] },
    { key: "zombie", label: "Zombie", icon: "zombie", v: [8, 0, 8, 25, 35] },
    { key: "mine", label: "Mine avg.", icon: "mine", v: [38, 29, 62, 100, 96], e: [9.2, 8.8, 9.2, 5.3, 6.2],
      note: "Average over stone, iron ore, coal ore, and oak log. Mining is close to saturated in this setting: TaskFrame and JARVIS-VLA-7B succeed in almost every episode." }
  ]
};
const clBars = $("#cl-bars"), clSeg = $("#cl-seg");
[0, 25, 50, 75, 100].forEach(g => {
  const d = document.createElement("div"); d.className = "gl"; d.style.bottom = `${g * 0.9}%`;
  d.innerHTML = `<span>${g}</span>`; clBars.appendChild(d);
});
const clCols = CL.models.map((m, i) => {
  const c = document.createElement("div"); c.className = "bcol" + (i === 4 ? " ours" : "");
  c.innerHTML = `<div class="bar"><div class="val"></div><div class="err"></div></div>`;
  clBars.appendChild(c); return c;
});
const lab = document.createElement("div"); lab.className = "blabels";
lab.innerHTML = CL.models.map((m, i) => `<div class="${i === 4 ? "ours" : ""}">${m}</div>`).join("");
clBars.after(lab);
function clShow(vi) {
  const v = CL.views[vi], best = Math.max(...v.v);
  $$("button", clSeg).forEach((b, i) => b.classList.toggle("on", i === vi));
  clCols.forEach((c, i) => {
    const h = v.v[i] * 0.9;
    c.classList.toggle("best", v.v[i] === best);
    $(".bar", c).style.height = `${h}%`;
    const err = $(".err", c);
    let span = 0;
    if (v.e) {
      span = v.e[i] * 0.9 / Math.max(h, 0.1) * 100;
      err.style.display = "block"; err.style.height = `${2 * span}%`; err.style.top = `${-span}%`;
    } else err.style.display = "none";
    $(".val", c).style.bottom = h ? `calc(${100 + span}% + 6px)` : "6px";
    $(".val", c).innerHTML = v.e ? `${v.v[i]}<small> \u00b1${v.e[i]}</small>` : `${v.v[i]}`;
  });
  $("#cl-note").textContent = v.note || "Per-task success rate; best result in each column is highlighted.";
}
CL.views.forEach((v, i) => {
  const b = document.createElement("button");
  if (v.icon) b.appendChild(pix(v.icon));
  b.appendChild(document.createTextNode(v.label));
  b.onclick = () => clShow(i); clSeg.appendChild(b);
});
clCols.forEach(c => $(".bar", c).style.height = "0");
onVisible($("#cl-bars"), () => clShow(0));

/* ================= planner chart (Table 2) ================= */
const PL = [
  { n: "Gemini 3.5 Flash", g: "prop", ssf1: 0.3815, acc: 44.4, unp: 13.6 },
  { n: "Gemini 3.6 Flash", g: "prop", ssf1: 0.3808, acc: 46.8, unp: 15.2 },
  { n: "GPT-4o", g: "prop", ssf1: 0.2720, acc: 36.0, unp: 14.0 },
  { n: "Qwen3-Omni-30B-A3B", g: "open", ssf1: 0.2643, acc: 34.0, unp: 11.6 },
  { n: "Qwen3.5-397B-A17B", g: "open", ssf1: 0.2990, acc: 35.6, unp: 12.4 },
  { n: "Qwen3.6-35B-A3B", g: "open", ssf1: 0.2951, acc: 34.4, unp: 8.4 },
  { n: "BAGEL-7B-MoT", g: "open", ssf1: null, acc: 28.0, unp: 14.4 },
  { n: "SenseNova-U1-8B-MoT", g: "open", ssf1: null, acc: 27.6, unp: 14.4 },
  { n: "Qwen3.5-9B (backbone)", g: "abl", ssf1: 0.2874, acc: 23.2, unp: 23.2, sep: true },
  { n: "+ SFT", g: "abl", ssf1: 0.3312, acc: 38.8, unp: 14.0 },
  { n: "+ GRPO (TaskFrame planner)", g: "ours", ssf1: 0.3459, acc: 40.0, unp: 11.6 }
];
const PLM = [
  { k: "ssf1", label: "SSF1 \u2191", max: 0.4, fmt: v => v.toFixed(4) },
  { k: "acc", label: "Task2 Acc. (%) \u2191", max: 50, fmt: v => v.toFixed(1) },
  { k: "unp", label: "Unparsed (%) \u2193", max: 25, fmt: v => v.toFixed(1) }
];
const plBars = $("#pl-bars"), plSeg = $("#pl-seg");
const plRows = PL.map(r => {
  const d = document.createElement("div");
  d.className = `hrow ${r.g}${r.sep ? " sep" : ""}`;
  const grp = { prop: "API", open: "open", abl: "ours", ours: "ours" }[r.g];
  d.innerHTML = `<div class="nm"><span class="grp">${grp}</span>${r.n}</div><div class="track"><div class="fill"></div><span class="num"></span></div>`;
  plBars.appendChild(d); return d;
});
const leg = document.createElement("div"); leg.className = "legend";
leg.innerHTML = `<span><i style="background:#6f86c9"></i>proprietary</span><span><i style="background:#4f8a96"></i>open-source</span><span><i style="background:#8a6cc0"></i>our training stages</span><span><i style="background:#56d38a"></i>TaskFrame planner (9B)</span>`;
plBars.after(leg);
function plShow(mi) {
  const m = PLM[mi];
  $$("button", plSeg).forEach((b, i) => b.classList.toggle("on", i === mi));
  plRows.forEach((d, i) => {
    const v = PL[i][m.k], w = v === null ? 0 : Math.min(100, v / m.max * 100);
    $(".fill", d).style.width = `${w}%`;
    const num = $(".num", d); num.style.left = `${w}%`;
    num.textContent = v === null ? "\u2013" : m.fmt(v);
  });
}
PLM.forEach((m, i) => { const b = document.createElement("button"); b.textContent = m.label; b.onclick = () => plShow(i); plSeg.appendChild(b); });
onVisible(plBars, () => plShow(0));

/* ================= ablations ================= */
const GOAL = [
  { n: "TaskFrame (full)", v: 51, e: 3.5, ours: true },
  { n: "Empty goal", v: 25, e: 3.0 },
  { n: "Mismatched goal", v: 13, e: 2.3 },
  { n: "Planner w/o obs.", v: 31, e: 3.1 }
];
const gb = $("#goal-bars");
const gRows = GOAL.map(g => {
  const d = document.createElement("div"); d.className = "hrow" + (g.ours ? " ours" : "");
  d.innerHTML = `<div class="nm">${g.n}</div><div class="track"><div class="fill"></div><span class="num"></span></div>`;
  gb.appendChild(d); return d;
});
onVisible(gb, () => gRows.forEach((d, i) => {
  const w = GOAL[i].v / 80 * 100;
  $(".fill", d).style.width = `${w}%`; const n = $(".num", d); n.style.left = `${w}%`;
  n.textContent = `${GOAL[i].v} \u00b1${GOAL[i].e}`;
}));

const ROLES = [
  ["Planner only", 0.21, 0.38, 6.6], ["Controller only", 0.16, 0.32, 6.8],
  ["Cascade (text)", 0.24, 0.45, 5.9], ["TaskFrame", 0.27, 0.49, 5.6, "ours"],
  ["Oracle goals", 0.29, 0.52, 5.4, "oracle"]
];
$("#roles-tbl").innerHTML = `<tr><th>Method</th><th>Key F1 \u2191</th><th>Btn. F1 \u2191</th><th>Cam. RMSE \u2193</th></tr>` +
  ROLES.map(r => `<tr class="${r[4] || ""}"><td>${r[0]}</td><td>${r[1].toFixed(2)}</td><td>${r[2].toFixed(2)}</td><td>${r[3].toFixed(1)}</td></tr>`).join("");

const MAE = [{ axis: "Yaw", d: 2.1, f: 1.7 }, { axis: "Pitch", d: 1.2, f: 1.0 }];
const maeEl = $("#mae");
maeEl.innerHTML = MAE.map(m => `<div class="mae-row"><div class="lbl">${m.axis} MAE (\u00b0) \u2193</div>
  <div class="mae-pair d"><span>Discrete bins</span><div class="t"><div data-w="${m.d / 2.5 * 100}"></div></div><b>${m.d.toFixed(1)}</b></div>
  <div class="mae-pair f"><span>Flow matching</span><div class="t"><div data-w="${m.f / 2.5 * 100}"></div></div><b>${m.f.toFixed(1)}</b></div></div>`).join("");
onVisible(maeEl, () => $$("[data-w]", maeEl).forEach(d => d.style.width = `${d.dataset.w}%`));

/* ================= rollout player ================= */
const RT = [
  { key: "ours_kill_cow", label: "kill cow", icon: "cow" },
  { key: "ours_kill_sheep", label: "kill sheep", icon: "sheep" },
  { key: "ours_kill_pig", label: "kill pig", icon: "pig" },
  { key: "ours_kill_zombie", label: "kill zombie", icon: "zombie" },
  { key: "ours_mine_oak", label: "mine oak log", icon: "oak" }
];
let pTask = 0;
const ptabs = $("#ptabs"), pmain = $("#pmain");
RT.forEach((t, i) => {
  const b = document.createElement("button"); b.className = "ptab";
  b.appendChild(pix(t.icon)); b.appendChild(document.createTextNode(t.label));
  b.onclick = () => { pTask = i; pShow(); };
  ptabs.appendChild(b);
});
function pShow() {
  $$(".ptab", ptabs).forEach((b, i) => b.classList.toggle("on", i === pTask));
  const t = RT[pTask];
  pmain.poster = `${V}posters/${t.key}.jpg`;
  pmain.src = `${V}${t.key}.mp4`;
  pmain.play().catch(() => {});
  $("#ptask").textContent = t.label;
  $("#pbadge").textContent = "SUCCESS";
  $("#pbadge").className = "pbadge ok";
}
pmain.addEventListener("timeupdate", () => {
  if (!pmain.duration) return;
  $("#pframe").textContent = `${pmain.currentTime.toFixed(1)}s`;
});
pShow();
onVisible($("#player"), () => { pmain.play().catch(() => {}); });

/* ================= comparison ================= */
const CMP = [
  { key: "sheep", label: "kill sheep", icon: "sheep",
    ours: "ours_kill_sheep", jarvis: "jarvis_kill_sheep", oursOk: true, jarvisOk: false,
    cap: "On kill sheep, TaskFrame turns, closes in, and kills the sheep. JARVIS-VLA-7B walks the forest with the sword out and never engages." },
  { key: "oak", label: "mine oak log", icon: "oak",
    ours: "ours_mine_oak", jarvis: "jarvis_mine_oak", oursOk: true, jarvisOk: true,
    cap: "Mining oak logs is easier: both TaskFrame and JARVIS-VLA-7B succeed." }
];
const cmpTabs = $("#cmp-tabs"), cmp = $("#cmp");
function cmpShow(ci) {
  $$(".ptab", cmpTabs).forEach((b, i) => b.classList.toggle("on", i === ci));
  const c = CMP[ci];
  const cell = (name, file, ok) => `<div class="ccol"><video src="${V}${file}.mp4" poster="${V}posters/${file}.jpg" muted loop playsinline autoplay controls></video><div class="who ${ok ? "ok" : "no"}">${name}<small>${ok ? "SUCCESS" : "FAILURE"}</small></div></div>`;
  cmp.innerHTML = cell("TaskFrame", c.ours, c.oursOk) + cell("JARVIS-VLA-7B", c.jarvis, c.jarvisOk);
  $$("video", cmp).forEach(v => v.play().catch(() => {}));
  $("#cmp-cap").textContent = c.cap + " Videos are recorded first-person episodes from the same evaluation protocol.";
}
CMP.forEach((c, i) => {
  const b = document.createElement("button"); b.className = "ptab";
  b.appendChild(pix(c.icon)); b.appendChild(document.createTextNode(c.label));
  b.onclick = () => cmpShow(i); cmpTabs.appendChild(b);
});
onVisible(cmp, () => cmpShow(0), 0.1);

/* ================= lightbox & copy ================= */
const lb = $("#lightbox");
$$("[data-zoom] img").forEach(im => im.addEventListener("click", () => { $("img", lb).src = im.src; lb.classList.add("on"); }));
lb.addEventListener("click", () => lb.classList.remove("on"));
addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("on"); });
$("#copy-bib").addEventListener("click", e => {
  navigator.clipboard.writeText($("#bib").textContent).then(() => {
    e.target.textContent = "Copied!"; setTimeout(() => e.target.textContent = "Copy", 1500);
  });
});
})();
