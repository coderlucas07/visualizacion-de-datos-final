/* =====================================================================
   main.js — orquestación del scrollytelling.
   - Layout 2 columnas: texto a la izquierda que scrollea, visual fija a
     la derecha (el texto nunca tapa el gráfico). Momentos full-bleed
     deliberados (snakes) con chips flotantes.
   - Menú de módulos (arriba a la izquierda) para saltar a cada módulo.
   - Portada: el cerebro asoma como una luna y se revela con el scroll.
   - Portales: disco de espiral bajo el título; al scrollear te traga.
   - E1 (pato-conejo): máquina de estados imagen ⇄ gráfico (sin scroll de
     texto); las barras crecen de 0 al % esperado con el scroll.
   - E2: la figura gira con el scroll; marcas ancladas A LA IMAGEN.
   Respeta prefers-reduced-motion.
   ===================================================================== */

import { SpiralPortal } from './noise.js';
import { CHARTS, addSource } from './charts.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let DATA = null;
let dataReady = false;
const portals = [];   // espirales: { sp, section, head, after }

/* Refs cacheadas para el scrub */
let coverEl = null, brainEl = null, cueEl = null;
let introEl = null, duoEl = null;
let e2Sec = null, e2Fig = null, e2Step = null;
let e3bSec = null, waffleEl = null, e3CountEl = null;

const state = { first: null, e2rotate: true };
const progressBar = document.getElementById('progressBar');

async function init() {
  setupMenu();
  setupReveal();
  setupSpiral();
  setupScrolly();
  setupIntro();
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

/* ----------------------------- Menú de módulos ----------------------------- */
function setupMenu() {
  const btn = document.getElementById('menuBtn');
  const panel = document.getElementById('menu');
  const closeBtn = document.getElementById('menuClose');
  if (!btn || !panel) return;

  const open = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  };
  const shut = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  };
  shut();

  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', shut);
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', shut));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') shut(); });
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
   MOTOR DE PASOS (texto izq. → cambia la capa visual der.)
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
  if (fn) {
    try { fn(el, DATA, { reduced: REDUCED }); addSource(el, id); }
    catch (err) { console.error('[chart] error en', id, err); }
  } else console.warn('[chart] sin handler para', id);
}
function initCharts(scope) {
  if (!dataReady || !scope) return;
  if (scope.dataset && scope.dataset.chart) initOne(scope);
  scope.querySelectorAll?.('[data-chart]:not([data-inited])').forEach(initOne);
}

/* ----------------------------- Portales de espiral ----------------------------- */
function setupSpiral() {
  document.querySelectorAll('[data-spiral]').forEach((canvas) => {
    const sp = new SpiralPortal(canvas, { reduced: REDUCED });
    const section = canvas.closest('.portal');
    portals.push({
      sp,
      section,
      head: section ? section.querySelector('.portal__head') : null,
      after: section ? section.querySelector('.portal__after') : null,
    });
    const vis = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? sp.start() : sp.stop())),
      { threshold: 0 }
    );
    vis.observe(canvas);
  });
}

/* =====================================================================
   E1 — máquina de estados imagen ⇄ gráfico (sin scroll de texto que cae)
   ===================================================================== */
function setupIntro() {
  const intro = document.getElementById('e1');
  if (!intro) return;

  intro.querySelectorAll('.choice').forEach((b) => b.addEventListener('click', () => {
    intro.querySelectorAll('.choice').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    state.first = b.dataset.choice;
    configureE2(state.first);
    intro.dataset.state = 'chart';
    // Arrancar el scrub desde el inicio de la sección: las barras crecen al bajar.
    const top = intro.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + 8, behavior: REDUCED ? 'auto' : 'smooth' });
  }));

  const back = document.getElementById('backToImg');
  if (back) back.addEventListener('click', () => { intro.dataset.state = 'img'; });
}

/* ----------------------------- Interacciones (E4) ----------------------------- */
function setupInteractions() {
  configureE2(state.first || 'pato'); // default: la mayoría ve pato → guiamos al conejo

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

/* Configura E2 según lo que se vio primero (pista hacia el animal que falta).
   Las marcas van en % de la IMAGEN (anatomía real de la figura de Jastrow):
   pico/orejas ≈ (20, 22) · ojo ≈ (68,5, 30) · hocico del conejo ≈ (92, 51). */
function configureE2(firstChoice) {
  const titleEl = document.querySelector('#e2 [data-e2-title]');
  const ledeEl = document.querySelector('#e2 [data-e2-lede]');
  const a1 = document.getElementById('e2Annot1');
  const a2 = document.getElementById('e2Annot2');
  if (!titleEl || !ledeEl || !a1 || !a2) return;
  const target = firstChoice === 'conejo' ? 'pato' : 'conejo';
  state.e2rotate = target === 'conejo';

  const place = (el, label, left, top) => {
    el.dataset.label = label;
    el.style.left = left + '%';
    el.style.top = top + '%';
  };

  if (target === 'conejo') {
    titleEl.textContent = 'Dale vuelta la cabeza.';
    ledeEl.innerHTML = 'Seguí bajando: la figura gira. Eso que era un pico ahora son <strong>dos orejas</strong>. ¿Aparece el conejo?';
    place(a1, 'las orejas', 20, 22);
    place(a2, 'el hocico', 92, 51);
  } else {
    titleEl.textContent = 'Mirá otra vez.';
    ledeEl.innerHTML = 'Eso que parecían orejas es un <strong>pico</strong>, y el ojo mira hacia el agua. ¿Aparece el pato?';
    place(a1, 'el pico', 20, 22);
    place(a2, 'el ojo', 68.5, 30);
  }
}

/* ----------------------------- Refs para el scrub ----------------------------- */
function cacheScrubRefs() {
  coverEl = document.getElementById('portada');
  brainEl = document.getElementById('coverBrain');
  cueEl = document.querySelector('.cover__scrollcue');
  introEl = document.getElementById('e1');
  duoEl = document.getElementById('duoChart');
  e2Sec = document.getElementById('e2');
  e2Fig = document.getElementById('e2Fig');
  e2Step = document.querySelector('#e2 .step[data-layer="0"]');
  e3bSec = document.getElementById('e3b');
  waffleEl = document.getElementById('e3Waffle');
  e3CountEl = document.getElementById('e3Count');
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

  // Portada: el cerebro se revela con el scroll; al final aparece la pregunta
  if (coverEl && brainEl) {
    const p = sectionProgress(coverEl);
    if (!REDUCED) {
      const rise = 58 * (1 - easeOut(clamp(p / 0.7)));
      brainEl.style.setProperty('--rise', rise.toFixed(2) + '%');
    }
    coverEl.classList.toggle('q-on', p > 0.6);
    if (cueEl) cueEl.style.opacity = String(1 - clamp(p / 0.2));
  }

  // Portales: el disco te traga; el título se va, la frase aparece en el negro
  for (const pt of portals) {
    if (!pt.section) continue;
    const prog = sectionProgress(pt.section);
    pt.sp.setProgress(prog);
    if (pt.head) {
      const fade = 1 - clamp((prog - 0.45) / 0.25);
      pt.head.style.opacity = fade.toFixed(3);
      pt.head.style.transform = `translateY(${(-14 * (1 - fade)).toFixed(1)}px)`;
    }
    if (pt.after) pt.after.style.opacity = clamp((prog - 0.84) / 0.14).toFixed(3);
  }

  // E1: en estado gráfico, las barras crecen de 0 al % esperado con el scroll
  if (introEl && introEl.dataset.state === 'chart' && duoEl && duoEl.__setDuo && !REDUCED) {
    const p = clamp((sectionProgress(introEl) - 0.04) / 0.76);
    duoEl.__setDuo(easeOut(p));
  }

  // E2: la figura gira con el scroll (si toca girar) y aparecen las marcas
  if (e2Fig && e2Step) {
    const p = stepScrub(e2Step);
    const deg = state.e2rotate ? (REDUCED ? 90 : easeOut(p) * 90) : 0;
    e2Fig.style.setProperty('--rot', deg.toFixed(1) + 'deg');
    if (e2Sec) e2Sec.classList.toggle('cues-on', p > (state.e2rotate ? 0.55 : 0.3));
  }

  // Waffle (E3b): se pinta con el scroll
  if (!REDUCED && waffleEl && waffleEl.__setWaffle && e3bSec) {
    const p = clamp((sectionProgress(e3bSec) - 0.08) / 0.72);
    waffleEl.__setWaffle(p);
    if (e3CountEl) e3CountEl.textContent = Math.round(p * 96);
  }
}

/* Progreso 0→1 de una sección sticky (cuánto de su recorrido ya scrolleaste) */
function sectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const scrollable = rect.height - vh;
  if (scrollable > 0) return clamp(-rect.top / scrollable);
  return clamp((vh - rect.top) / (vh + rect.height));
}

/* Progreso 0→1 de un paso largo a través del viewport (para scrubs por paso) */
function stepScrub(el) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp((vh * 0.7 - r.top) / Math.max(1, r.height - vh * 0.3));
}

/* Arranque (módulo deferred: el DOM ya está listo y todo lo de arriba evaluado). */
init();
