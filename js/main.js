/* =====================================================================
   main.js — orquestación del scrollytelling (layout full-bleed).
   - Motor de pasos: cada .scrolly tiene un gráfico fijo a pantalla completa
     y pasos (.step) superpuestos; al cruzar el centro se cambia la capa.
   - Portales de espiral entre módulos (SpiralPortal), scrubeados por scroll.
   - Gráficos pre-inicializados al cargar los datos → scroll fluido (sin lag).
   - Interacciones: E1/E4 auto-avanzan al elegir; E2 gira la figura con el scroll.
   Respeta prefers-reduced-motion.
   ===================================================================== */

import { NoiseToSignal, SpiralPortal } from './noise.js';
import { CHARTS } from './charts.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let DATA = null;
let dataReady = false;
const scrubbers = [];      // motivos ruido→señal (si hubiera): { section, cb }
const portals = [];        // espirales: { sp, section, title }

// Refs del waffle (E3) y de la figura de E2 para scrubbear con el scroll
let waffleEl = null, waffleStep = null, e3CountEl = null;
let e2Fig = null, e2Step = null;

const state = { first: null, e2rotate: true };
const progressBar = document.getElementById('progressBar');

async function init() {
  setupReveal();
  setupActAccent();
  setupNoise();
  setupSpiral();
  setupScrolly();
  setupInteractions();
  cacheScrubRefs();
  setupScroll();

  try {
    DATA = await loadData();
    dataReady = true;
    // Pre-init de TODOS los gráficos → al scrollear ya están dibujados (sin lag).
    document.querySelectorAll('[data-chart]').forEach(initOne);
  } catch (err) {
    console.error('[data] no se pudo cargar el JSON:', err);
    const box = document.getElementById('dataError');
    if (box) box.hidden = false;
  }
}

/* ----------------------------- Datos ----------------------------- */
async function loadData() {
  const res = await fetch('./data/datos_visualizaciones.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

/* ----------------------------- Revelado puntual ----------------------------- */
function setupReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (REDUCED) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => obs.observe(el));
}

/* =====================================================================
   MOTOR DE PASOS
   ===================================================================== */
function setupScrolly() {
  document.querySelectorAll('.scrolly').forEach((scrolly) => {
    const steps = [...scrolly.querySelectorAll('.step')];
    const layers = [...scrolly.querySelectorAll('.viz__layer')];
    if (!steps.length) return;
    let current = -1;

    const activate = (idx) => {
      if (idx < 0) return;
      const layerId = steps[idx].dataset.layer ?? String(idx);
      const active = layers.find((l) => l.dataset.layer === layerId);
      if (active) initCharts(active);
      if (idx === current) return;
      current = idx;
      layers.forEach((l) => l.classList.toggle('is-active', l.dataset.layer === layerId));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    };

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target)); }),
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    steps.forEach((s) => obs.observe(s));
    activate(0);
  });
}

/* ----------------------------- Init de gráficos ----------------------------- */
function initOne(el) {
  if (!el || !dataReady || el.dataset.inited) return;
  const id = el.dataset.chart;
  const fn = CHARTS[id];
  el.dataset.inited = '1';
  if (fn) { try { fn(el, DATA, { reduced: REDUCED }); } catch (err) { console.error('[chart] error en', id, err); } }
  else console.warn('[chart] sin handler para', id);
}
function initCharts(scope) {
  if (!dataReady || !scope) return;
  if (scope.dataset && scope.dataset.chart) initOne(scope);
  scope.querySelectorAll?.('[data-chart]:not([data-inited])').forEach(initOne);
}

/* ----------------------------- Acento por tramo ----------------------------- */
function setupActAccent() {
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const accent = getComputedStyle(e.target).getPropertyValue('--accent').trim();
      if (accent) document.documentElement.style.setProperty('--accent', accent);
    }),
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-act]').forEach((s) => obs.observe(s));
}

/* ----------------------------- Portales de espiral ----------------------------- */
function setupSpiral() {
  document.querySelectorAll('[data-spiral]').forEach((canvas) => {
    const sp = new SpiralPortal(canvas, { reduced: REDUCED });
    const section = canvas.closest('.portal');
    const title = section ? section.querySelector('.portal__title') : null;
    portals.push({ sp, section, title });
    const vis = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? sp.start() : sp.stop())),
      { threshold: 0 }
    );
    vis.observe(canvas);
  });
}

/* ----------------------------- Ruido→señal (interludios, si hubiera) ----------------------------- */
function setupNoise() {
  document.querySelectorAll('[data-noise]').forEach((canvas) => {
    const accentHex = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#3AA0FF';
    const n2s = new NoiseToSignal(canvas, { reduced: REDUCED, colorAccent: accentHex });
    const type = canvas.dataset.noise;
    if (type === 'image') n2s.setTargetFromImage(canvas.dataset.src, { threshold: 120 });
    else if (type === 'text') n2s.setTargetFromText(canvas.dataset.glyph || '$');
    else if (type === 'eye') n2s.setTargetFromDraw(drawEye);
    const section = canvas.closest('section') || canvas.parentElement;
    scrubbers.push({ section, cb: (p) => n2s.setProgress(p) });
    const vis = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? n2s.start() : n2s.stop())), { threshold: 0 });
    vis.observe(canvas);
  });
}
function drawEye(ctx, w, h) {
  const cx = w / 2, cy = h / 2, rw = Math.min(w, h) * 0.42, rh = rw * 0.52;
  ctx.fillStyle = '#fff'; ctx.lineWidth = Math.max(2, rw * 0.04); ctx.strokeStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, rh * 0.66, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, rh * 0.28, 0, Math.PI * 2); ctx.fill();
}

/* ----------------------------- Interacciones ----------------------------- */
function setupInteractions() {
  // E1 — ¿qué ves? Guarda la primera lectura, personaliza E2 y AUTO-AVANZA.
  const e1 = document.getElementById('e1');
  if (e1) {
    const btns = e1.querySelectorAll('[data-choice]');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      state.first = b.dataset.choice;
      configureE2(state.first);
      scrollToNextStep(b);
    }));
  }

  configureE2(state.first || 'pato'); // default: la mayoría ve pato → guiamos al conejo
  const e2 = document.getElementById('e2');
  if (e2) {
    const btns = e2.querySelectorAll('[data-choice]');
    btns.forEach((b) => b.addEventListener('click', () => btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))));
  }

  // E4 — audio + elección. La elección AUTO-AVANZA.
  const audio = document.getElementById('audioEl');
  const play = document.getElementById('audioPlay');
  const wave = document.getElementById('e4Wave');
  if (play && audio) {
    const icon = play.querySelector('.audio__icon');
    const set = (playing) => {
      play.classList.toggle('is-playing', playing);
      if (wave) wave.classList.toggle('is-playing', playing);
      play.setAttribute('aria-label', playing ? 'Pausar audio' : 'Reproducir audio');
      if (icon) icon.textContent = playing ? '❚❚' : '▶';
    };
    play.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
    audio.addEventListener('play', () => set(true));
    audio.addEventListener('pause', () => set(false));
    audio.addEventListener('ended', () => set(false));
  }
  const e4 = document.getElementById('e4');
  if (e4) {
    const btns = e4.querySelectorAll('[data-choice]');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      scrollToNextStep(b);
    }));
  }
}

/* Lleva suavemente al siguiente paso (no hace falta scrollear a mano). */
function scrollToNextStep(fromEl) {
  const step = fromEl.closest('.step');
  if (!step) return;
  const next = step.nextElementSibling;
  const target = (next && next.classList.contains('step'))
    ? next
    : (step.closest('.scrolly') && step.closest('.scrolly').nextElementSibling);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }), 260);
}

/* Configura E2 según lo que se vio primero (pista al animal que falta). */
function configureE2(firstChoice) {
  const titleEl = document.querySelector('#e2 [data-e2-title]');
  const ledeEl = document.querySelector('#e2 [data-e2-lede]');
  const a1 = document.getElementById('e2Annot1');
  const a2 = document.getElementById('e2Annot2');
  if (!titleEl || !ledeEl || !a1 || !a2) return;
  const target = firstChoice === 'conejo' ? 'pato' : 'conejo';
  state.e2rotate = target === 'conejo';

  if (target === 'conejo') {
    titleEl.textContent = 'Dale vuelta la cabeza.';
    ledeEl.innerHTML = 'Seguí bajando: la figura gira. Eso que era un pico ahora son <strong>dos orejas</strong>. ¿Aparece el conejo?';
    a1.textContent = 'las orejas'; a1.className = 'annot annot--down'; a1.style.left = '50%'; a1.style.top = '30%';
    a2.textContent = 'el hocico'; a2.className = 'annot annot--up'; a2.style.left = '54%'; a2.style.top = '70%';
  } else {
    titleEl.textContent = 'Mirá otra vez.';
    ledeEl.innerHTML = 'Eso que parecían orejas es un <strong>pico</strong>, y el ojo mira hacia el agua. ¿Aparece el pato?';
    a1.textContent = 'el pico'; a1.className = 'annot annot--up'; a1.style.left = '24%'; a1.style.top = '56%';
    a2.textContent = 'el ojo'; a2.className = 'annot annot--down'; a2.style.left = '60%'; a2.style.top = '40%';
  }
}

/* ----------------------------- Refs para el scrub ----------------------------- */
function cacheScrubRefs() {
  waffleEl = document.getElementById('e3Waffle');
  waffleStep = document.querySelector('#e3 .step[data-layer="2"]') || document.querySelector('#e3 .step[data-layer="1"]');
  e3CountEl = document.getElementById('e3Count');
  e2Fig = document.getElementById('e2Fig');
  e2Step = document.querySelector('#e2 .step[data-layer="0"]');
}

/* ----------------------------- Motor de scroll ----------------------------- */
function setupScroll() {
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { tick(); ticking = false; }); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();
}

function tick() {
  // Progreso de lectura
  const sh = document.documentElement.scrollHeight - window.innerHeight;
  const read = sh > 0 ? clamp(window.scrollY / sh) : 0;
  if (progressBar) progressBar.style.width = (read * 100).toFixed(2) + '%';

  // Ruido→señal (si hubiera)
  for (const s of scrubbers) if (s.section) s.cb(sectionProgress(s.section));

  // Espirales: progreso + revelado del título tras el negro
  for (const p of portals) {
    if (!p.section) continue;
    const prog = sectionProgress(p.section);
    p.sp.setProgress(prog);
    if (p.title) {
      const tp = clamp((prog - 0.8) / 0.18);
      p.title.style.opacity = tp.toFixed(3);
      p.title.style.transform = `translateY(${((1 - tp) * 18).toFixed(1)}px)`;
    }
  }

  // Waffle: se pinta con el scroll
  if (!REDUCED && waffleEl && waffleEl.__setWaffle && waffleStep) {
    const p = stepFill(waffleStep);
    waffleEl.__setWaffle(p);
    if (e3CountEl) e3CountEl.textContent = Math.round(p * 96);
  }

  // E2: la figura gira con el scroll (si toca girar) y aparecen las marcas
  if (e2Fig && e2Step) {
    const p = stepFill(e2Step);
    const deg = state.e2rotate ? (REDUCED ? 90 : p * 90) : 0;
    e2Fig.style.setProperty('--rot', deg.toFixed(1) + 'deg');
    const e2 = document.getElementById('e2');
    if (e2) e2.classList.toggle('cues-on', p > 0.45);
  }
}

function sectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const scrollable = rect.height - vh;
  if (scrollable > 0) return clamp(-rect.top / scrollable);
  return clamp((vh - rect.top) / (vh + rect.height));
}

function stepFill(el) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.85, end = vh * 0.35;
  return clamp((start - r.top) / (start - end));
}

/* Arranque (módulo deferred: el DOM ya está listo y todo lo de arriba evaluado). */
init();
