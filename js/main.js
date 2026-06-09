/* =====================================================================
   main.js — orquestación del scrollytelling.
   - Carga el JSON (motor de los 13 gráficos).
   - IntersectionObserver: revelado de texto + lazy-init de cada gráfico.
   - Motor de scroll nativo (sin hijack): progreso de lectura, acento por
     acto y "scrub" del motivo ruido→señal.
   - Respeta prefers-reduced-motion.
   ===================================================================== */

import { NoiseToSignal } from './noise.js';
import { CHARTS } from './charts.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let DATA = null;
const scrubbers = [];        // { section, cb } — se actualizan en cada scroll
const noiseInstances = [];

const progressBar = document.getElementById('progressBar');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  setupReveal();
  setupActAccent();
  setupNoise();
  setupInteractions();
  setupScroll();

  try {
    DATA = await loadData();
    setupCharts();
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

/* ----------------------------- Revelado de texto ----------------------------- */
function setupReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (REDUCED) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => obs.observe(el));
}

/* ----------------------------- Lazy-init de gráficos ----------------------------- */
function setupCharts() {
  const els = document.querySelectorAll('[data-chart]');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.dataset.inited) return;
        e.target.dataset.inited = '1';
        const id = e.target.dataset.chart;
        const fn = CHARTS[id];
        if (fn) {
          try { fn(e.target, DATA, { reduced: REDUCED }); }
          catch (err) { console.error('[chart] error en', id, err); }
        } else {
          console.warn('[chart] sin handler todavía para', id);
        }
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.25 }
  );
  els.forEach((el) => obs.observe(el));
}

/* ----------------------------- Acento por acto ----------------------------- */
/* El acento del acto más visible pinta la barra de progreso. */
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

    // Scrub: el progreso depende de cuánto se scrolleó por la sección contenedora.
    const section = canvas.closest('section') || canvas.parentElement;
    scrubbers.push({ section, cb: (p) => n2s.setProgress(p) });

    // Arranca/para el loop según visibilidad (performance).
    const vis = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? n2s.start() : n2s.stop())),
      { threshold: 0 }
    );
    vis.observe(canvas);
    noiseInstances.push(n2s);
  });
}

/* Dibuja un ojo (para el Interludio B). drawFn(ctx, w, h). */
function drawEye(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const rw = Math.min(w, h) * 0.42; // semieje horizontal
  const rh = rw * 0.52;             // semieje vertical
  ctx.fillStyle = '#fff';
  ctx.lineWidth = Math.max(2, rw * 0.04);
  ctx.strokeStyle = '#fff';
  // Contorno almendrado
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Iris
  ctx.beginPath();
  ctx.arc(cx, cy, rh * 0.66, 0, Math.PI * 2);
  ctx.stroke();
  // Pupila
  ctx.beginPath();
  ctx.arc(cx, cy, rh * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

/* ----------------------------- Interacciones (las únicas 2) ----------------------------- */
function setupInteractions() {
  // INTERACCIÓN 1 — E1: pato / conejo. Al elegir, se revela el OTRO animal.
  const e1 = document.getElementById('e1');
  if (e1) {
    const btns = e1.querySelectorAll('[data-choice]');
    btns.forEach((b) =>
      b.addEventListener('click', () => {
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        e1.classList.add('is-answered');
        e1.classList.remove('show-pato', 'show-conejo');
        // Elegiste pato → te muestro el conejo (y viceversa)
        e1.classList.add(b.dataset.choice === 'pato' ? 'show-conejo' : 'show-pato');
      })
    );
  }

  // INTERACCIÓN 2 — E4: play del audio + elegir bicicleta / alquiler.
  const audio = document.getElementById('audioEl');
  const play = document.getElementById('audioPlay');
  if (play && audio) {
    const icon = play.querySelector('.audio__icon');
    const setState = (playing) => {
      play.classList.toggle('is-playing', playing);
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
      b.addEventListener('click', () => {
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        e4.classList.add('is-answered');
      })
    );
  }
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
  tick(); // estado inicial
}

function tick() {
  // Barra de progreso de lectura
  const sh = document.documentElement.scrollHeight - window.innerHeight;
  const read = sh > 0 ? clamp(window.scrollY / sh) : 0;
  if (progressBar) progressBar.style.width = (read * 100).toFixed(2) + '%';

  // Scrub de cada motivo ruido→señal
  for (const s of scrubbers) {
    if (s.section) s.cb(sectionProgress(s.section));
  }
}

/* Progreso 0→1 a medida que se scrollea a través de una sección. */
function sectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const scrollable = rect.height - vh;
  if (scrollable > 0) return clamp(-rect.top / scrollable);
  // Sección más corta que el viewport: progreso por centrado
  return clamp((vh - rect.top) / (vh + rect.height));
}
