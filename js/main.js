/* =====================================================================
   main.js — orquestación del scrollytelling.
   El SCROLL es el motor: cada .scrolly tiene un gráfico sticky y una
   columna de pasos (.step). Al cruzar cada paso el centro de la pantalla
   se cambia la capa visible del gráfico (.viz__layer) y se inicializa
   su gráfico (lazy). Algunos efectos (waffle, ruido→señal) se "scrubean"
   de forma continua con el scroll.
   Respeta prefers-reduced-motion.
   ===================================================================== */

import { NoiseToSignal } from './noise.js';
import { CHARTS } from './charts.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let DATA = null;
let dataReady = false;
const scrubbers = [];        // motivos ruido→señal: { section, cb }
const noiseInstances = [];

// Refs del waffle (E3) para pintarlo con el scroll
let waffleEl = null, waffleStep = null, e3CountEl = null;

const progressBar = document.getElementById('progressBar');

async function init() {
  setupReveal();
  setupActAccent();
  setupNoise();
  setupScrolly();
  setupInteractions();
  cacheWaffleRefs();
  setupScroll();

  try {
    DATA = await loadData();
    dataReady = true;
    // El waffle se inicializa de entrada para que el scrub lo llene desde 0.
    initCharts(waffleEl);
    // Gráficos de capas activas que YA están en pantalla (las de más abajo
    // se inicializan solas al scrollear, para que animen al entrar).
    document.querySelectorAll('.viz__layer.is-active').forEach((layer) => {
      const r = layer.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) initCharts(layer);
    });
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

/* ----------------------------- Revelado puntual de texto ----------------------------- */
function setupReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (REDUCED) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => obs.observe(el));
}

/* =====================================================================
   MOTOR DE PASOS — el centro del scrollytelling.
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
      if (active) initCharts(active);     // asegura el init aunque el paso ya sea el "actual"
      if (idx === current) return;        // el cambio visual solo si cambió el paso
      current = idx;
      layers.forEach((l) => l.classList.toggle('is-active', l.dataset.layer === layerId));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      scrolly.dispatchEvent(new CustomEvent('stepchange', { detail: { index: idx, layer: layerId } }));
    };

    // El paso "activo" es el que cruza una franja fina en el centro de la pantalla.
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    steps.forEach((s) => obs.observe(s));

    activate(0); // estado inicial: primera capa visible
  });
}

/* ----------------------------- Lazy-init de gráficos ----------------------------- */
function initOne(el) {
  if (!el || el.dataset.inited) return;
  const id = el.dataset.chart;
  const fn = CHARTS[id];
  el.dataset.inited = '1';
  if (fn) {
    try { fn(el, DATA, { reduced: REDUCED }); }
    catch (err) { console.error('[chart] error en', id, err); }
  } else {
    console.warn('[chart] sin handler para', id);
  }
}
/* Inicializa el gráfico de un elemento o de todos los [data-chart] que contenga. */
function initCharts(scope) {
  if (!dataReady || !scope) return;
  if (scope.dataset && scope.dataset.chart) initOne(scope);
  scope.querySelectorAll?.('[data-chart]:not([data-inited])').forEach(initOne);
}

/* ----------------------------- Acento por tramo ----------------------------- */
/* El acento del tramo más visible tiñe la barra de progreso (sin rótulos de acto). */
function setupActAccent() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const accent = getComputedStyle(e.target).getPropertyValue('--accent').trim();
        if (accent) document.documentElement.style.setProperty('--accent', accent);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-act]').forEach((s) => obs.observe(s));
}

/* ----------------------------- Motivo ruido→señal ----------------------------- */
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

    const vis = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? n2s.start() : n2s.stop())),
      { threshold: 0 }
    );
    vis.observe(canvas);
    noiseInstances.push(n2s);
  });
}

/* Dibuja un ojo (para el Interludio B, fase 3). drawFn(ctx, w, h). */
function drawEye(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const rw = Math.min(w, h) * 0.42, rh = rw * 0.52;
  ctx.fillStyle = '#fff';
  ctx.lineWidth = Math.max(2, rw * 0.04);
  ctx.strokeStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, rh * 0.66, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, rh * 0.28, 0, Math.PI * 2); ctx.fill();
}

/* ----------------------------- Interacciones ----------------------------- */
/* Estado del recorrido. Las interacciones NO gatean contenido (se ve igual sin tocar). */
const state = { first: null };

function setupInteractions() {
  // INTERACCIÓN 1 — E1: ¿qué ves? Guarda la primera lectura para personalizar E2.
  const e1 = document.getElementById('e1');
  if (e1) {
    const btns = e1.querySelectorAll('[data-choice]');
    btns.forEach((b) =>
      b.addEventListener('click', () => {
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        state.first = b.dataset.choice;       // 'pato' | 'conejo'
        configureE2(state.first);             // adelanta la pista correcta
      })
    );
  }

  // E2 — la pista apunta SIEMPRE al animal que todavía no viste.
  configureE2(state.first || 'pato'); // default: la mayoría ve pato → lo guiamos al conejo
  const e2 = document.getElementById('e2');
  if (e2) {
    const btns = e2.querySelectorAll('[data-choice]');
    btns.forEach((b) =>
      b.addEventListener('click', () =>
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      )
    );
  }

  // INTERACCIÓN 2 — E4: play del audio + elegir bicicleta / alquiler.
  const audio = document.getElementById('audioEl');
  const play = document.getElementById('audioPlay');
  const wave = document.getElementById('e4Wave');
  if (play && audio) {
    const icon = play.querySelector('.audio__icon');
    const setState = (playing) => {
      play.classList.toggle('is-playing', playing);
      if (wave) wave.classList.toggle('is-playing', playing);
      play.setAttribute('aria-label', playing ? 'Pausar audio' : 'Reproducir audio');
      if (icon) icon.textContent = playing ? '❚❚' : '▶';
    };
    play.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
    audio.addEventListener('play', () => setState(true));
    audio.addEventListener('pause', () => setState(false));
    audio.addEventListener('ended', () => setState(false));
  }
  const e4 = document.getElementById('e4');
  if (e4) {
    const btns = e4.querySelectorAll('[data-choice]');
    btns.forEach((b) =>
      b.addEventListener('click', () =>
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      )
    );
  }
}

/* Configura la escena E2 según lo que el lector vio primero:
   si vio pato → le damos contexto para ver el conejo (y viceversa). */
function configureE2(firstChoice) {
  const fig = document.getElementById('e2Fig');
  const cues = document.getElementById('e2Cues');
  const titleEl = document.querySelector('#e2 [data-e2-title]');
  const ledeEl = document.querySelector('#e2 [data-e2-lede]');
  if (!fig || !cues || !titleEl || !ledeEl) return;

  const target = firstChoice === 'conejo' ? 'pato' : 'conejo'; // el animal que falta

  if (target === 'conejo') {
    fig.classList.add('is-rot'); // orejas hacia arriba: domina el conejo
    titleEl.textContent = 'Dale vuelta la cabeza.';
    ledeEl.innerHTML = 'Pensá en <strong>Pascua</strong>. Eso que parecía un pico ahora son dos <strong>orejas</strong> largas, y al lado, una zanahoria. ¿Aparece el conejo?';
    cues.innerHTML = '<span class="cue cue--accent">Pascua</span><span class="cue">orejas largas</span><span class="cue">zanahoria</span>';
  } else {
    fig.classList.remove('is-rot'); // horizontal: domina el pato
    titleEl.textContent = 'Mirá otra vez, con otra idea.';
    ledeEl.innerHTML = 'Imaginá un <strong>estanque</strong>. Eso que parecían orejas es un <strong>pico</strong> abierto, y el ojo mira hacia el agua. ¿Aparece el pato?';
    cues.innerHTML = '<span class="cue cue--accent">estanque</span><span class="cue">pico</span><span class="cue">mira al agua</span>';
  }
}

/* ----------------------------- Waffle por scroll (E3) ----------------------------- */
function cacheWaffleRefs() {
  waffleEl = document.getElementById('e3Waffle');
  waffleStep = document.querySelector('#e3 .step[data-layer="1"]');
  e3CountEl = document.getElementById('e3Count');
}

/* ----------------------------- Motor de scroll ----------------------------- */
function setupScroll() {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { tick(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();
}

function tick() {
  // Barra de progreso de lectura
  const sh = document.documentElement.scrollHeight - window.innerHeight;
  const read = sh > 0 ? clamp(window.scrollY / sh) : 0;
  if (progressBar) progressBar.style.width = (read * 100).toFixed(2) + '%';

  // Scrub de cada motivo ruido→señal
  for (const s of scrubbers) if (s.section) s.cb(sectionProgress(s.section));

  // Scrub del waffle: las personitas se pintan a medida que se scrollea el paso.
  if (!REDUCED && waffleEl && waffleEl.__setWaffle && waffleStep) {
    const p = stepFill(waffleStep);
    waffleEl.__setWaffle(p);
    if (e3CountEl) e3CountEl.textContent = Math.round(p * 96);
  }
}

/* Progreso 0→1 a medida que se scrollea a través de una sección (motivo ruido). */
function sectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const scrollable = rect.height - vh;
  if (scrollable > 0) return clamp(-rect.top / scrollable);
  return clamp((vh - rect.top) / (vh + rect.height));
}

/* Relleno 0→1 de un paso a medida que sube por la pantalla (para el waffle). */
function stepFill(el) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.85, end = vh * 0.35;
  return clamp((start - r.top) / (start - end));
}

/* Arranque. Como es un módulo (deferred), el DOM ya está listo y todas las
   declaraciones de arriba (incluido `state`) ya se evaluaron. */
init();
