/* =====================================================================
   main.js — orquestación del scrollytelling.
   - Layout 2 columnas: texto a la izquierda que scrollea, visual fija a
     la derecha (el texto nunca tapa el gráfico). Momentos full-bleed
     deliberados (snakes) con chips flotantes.
   - Menú de módulos (arriba a la izquierda) para saltar a cada módulo.
   - Portada: VIDEO a pantalla completa scrubeado por el scroll; mientras
     nadie scrollea "respira" en cámara lenta; al final funde a negro y
     aparece el título. Botón ↺ rebobina en reversa hasta el inicio.
   - Portales: túnel de espiral; el título aparece ya ADENTRO; un puntito
     crece con el scroll hasta tragarte.
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
const portals = [];   // espirales: { sp, section, head, dot, after }

/* Refs cacheadas para el scrub */
let coverEl = null;
let introEl = null, duoEl = null;
let e2Sec = null, e2Fig = null, e2Step = null;
let e3Img = null, e3Step = null, e3TitleCard = null, e3TitleStep = null, e3FinalCard = null;
let e3bSec = null, waffleEl = null, e3CountEl = null;
let fmEl = null, e4FmStep = null;

const state = { first: null, e2rotate: true };
const progressBar = document.getElementById('progressBar');

async function init() {
  setupModuleColors();
  setupMenu();
  setupReveal();
  setupSpiral();
  setupScrolly();
  setupIntro();
  setupInteractions();
  cacheScrubRefs();
  setupCover();
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

/* ----------------------------- Color por módulo -----------------------------
   Cada módulo tiene su acento: percepción púrpura, decisión azul cobalto,
   sesgos carmesí. Se setea --accent en cada sección ANTES de que los gráficos
   se inicialicen, así charts.js (accentOf) lo hereda solo. La portada (video)
   queda con su celeste propio. */
function setupModuleColors() {
  const mods = {
    '#9333EA': ['portal1', 'e1', 'e2', 'e3', 'e3b', 'e4', 'e5'],        // Percepción
    '#2563EB': ['portal2', 'e6', 'e7', 'e8', 'e9'],                      // Decisión
    '#E11D48': ['portal3', 'e10', 'e11', 'e12', 'e13', 'cierre'],        // Sesgos
  };
  const soft = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };
  for (const [hex, ids] of Object.entries(mods)) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) { el.style.setProperty('--accent', hex); el.style.setProperty('--accent-soft', soft(hex, 0.16)); }
    }
  }
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
  // Cerrar al tocar AFUERA del panel (el backdrop es #menu; el panel es hijo).
  panel.addEventListener('click', (e) => { if (e.target === panel) shut(); });
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
      dot: section ? section.querySelector('.portal__dot') : null,
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
   PORTADA — video scrubeado por el scroll.
   El scroll fija un "tiempo objetivo" y el frame real lo persigue con
   un lerp (suave, sin saltos); los seeks se cuantizan al frame (24fps)
   y solo se piden cuando el anterior terminó. Al final el negro sube y
   entra el título. ↺ rebobina: vuelve el scroll al inicio y el video
   lo sigue en reversa.
   ===================================================================== */
function setupCover() {
  const video = document.getElementById('coverVideo');
  const dark = document.getElementById('coverDark');
  const replay = document.getElementById('coverReplay');
  if (!coverEl || !video) return;

  const SCRUB_END = 0.74;  // fracción de la sección en la que el video completa
  let duration = 0;
  let cur = 0;
  let visible = false;
  let raf = null;

  video.pause();

  const onMeta = () => {
    duration = video.duration || 0;
    // Bufferear el archivo completo en memoria → seeks instantáneos al scrubear.
    fetch(video.currentSrc || video.src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        const t = video.currentTime;
        video.src = URL.createObjectURL(blob);
        video.currentTime = t;
      })
      .catch(() => { /* sin blob igual funciona, solo menos fluido */ });
  };
  if (video.readyState >= 1) onMeta();
  else video.addEventListener('loadedmetadata', onMeta, { once: true });

  if (REDUCED) {
    // Sin animación: cuadro final del video de fondo, negro y título puestos.
    coverEl.classList.add('title-on', 'is-still');
    if (dark) dark.style.opacity = '0.94';
    const still = () => { try { video.currentTime = Math.max(0, (video.duration || 0) - 0.05); } catch { /* noop */ } };
    if (video.readyState >= 1) still();
    else video.addEventListener('loadedmetadata', still, { once: true });
    return;
  }

  const FPS = 120;      // el mp4 de portada está interpolado a 120fps (movimiento continuo)
  const MIN_RATE = 0.5; // velocidad MÍNIMA (× tiempo real): apenas scrolleás, ya reproduce fluido
  const MAX_RATE = 3.5; // tope al perseguir un salto grande de scroll
  const ACCEL = 4;      // rampa de entrada suave (sin tirones por cada tick de rueda)
  const DECEL = 0.95;   // la suelta MUY de a poco: inercia "gravedad cero" (1/s)
  let vel = 0;          // velocidad actual del video (× tiempo real)
  let lastTs = 0;
  const frame = (now) => {
    raf = null;
    const p = sectionProgress(coverEl);
    const dt = lastTs ? Math.min(0.05, (now - lastTs) / 1000) : 0.016;
    lastTs = now;

    if (duration > 0) {
      const target = clamp(p / SCRUB_END) * Math.max(0, duration - 0.06);
      const diff = target - cur;
      const HALF = 0.5 / FPS;

      // Velocidad deseada: proporcional a la distancia, nunca menor que MIN_RATE.
      // Para atrás recién con un retroceso real (histéresis): así el derrape de
      // la inercia no "rebota" volviendo en reversa.
      let desired = 0;
      if (diff > HALF) desired = Math.min(MAX_RATE, Math.max(MIN_RATE, diff * 2.2));
      else if (diff < -0.25) desired = Math.max(-MAX_RATE, Math.min(-MIN_RATE, diff * 2.2));

      // Asimetría: acelera vivo, frena flotando. Al soltar el scroll el video
      // sigue de largo y se va apagando solo, muy de a poco.
      const g = (Math.abs(desired) > Math.abs(vel) || desired * vel < 0) ? ACCEL : DECEL;
      vel += (desired - vel) * Math.min(1, g * dt);
      if (desired === 0 && Math.abs(vel) < 0.02) vel = 0;
      cur = clamp(cur + vel * dt, 0, Math.max(0, duration - 0.06));

      // Seek cuantizado al frame y recién cuando terminó el anterior:
      // nunca se piden decodes que no cambian el cuadro visible.
      const frameT = Math.round(cur * FPS) / FPS;
      if (!video.seeking && Math.abs(video.currentTime - frameT) > HALF) {
        try { video.currentTime = frameT; } catch { /* metadata aún no lista */ }
      }
    }

    if (dark) dark.style.opacity = clamp((p - SCRUB_END) / 0.1).toFixed(3);
    coverEl.classList.toggle('title-on', p > 0.845);
    coverEl.classList.toggle('replay-on', p > 0.02);
    coverEl.classList.toggle('cue-off', p > 0.03);

    if (visible) raf = requestAnimationFrame(frame);
  };

  const vis = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      visible = e.isIntersecting;
      // Mientras la portada está a la vista se apaga el grano global
      // (mix-blend-mode sobre video es caro y serrucha el scroll).
      document.body.classList.toggle('cover-vis', visible);
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }),
    { threshold: 0 }
  );
  vis.observe(coverEl);

  if (replay) replay.addEventListener('click', () => {
    const top = coverEl.getBoundingClientRect().top + window.scrollY;
    animateScrollTo(top, 1400 + 1800 * sectionProgress(coverEl));
  });

  // El botón se planta EXACTAMENTE sobre el sparkle de Gemini del video.
  // El sparkle está centrado en (1743, 902) del frame de 1920×1080; acá se
  // replica la cuenta del object-fit: cover para cualquier pantalla.
  const placeReplay = () => {
    if (!replay) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.max(vw / 1920, vh / 1080);
    const x = 1743 * s - (1920 * s - vw) / 2;
    const y = 902 * s - (1080 * s - vh) / 2;
    const d = Math.round(Math.max(64, 92 * s)); // el sparkle mide ~80px @1080p; el disco lo tapa entero
    replay.style.left = x.toFixed(0) + 'px';
    replay.style.top = y.toFixed(0) + 'px';
    replay.style.right = 'auto';
    replay.style.bottom = 'auto';
    replay.style.width = replay.style.height = d + 'px';
  };
  placeReplay();
  window.addEventListener('resize', placeReplay);
}

/* Scroll animado propio (suave y con duración controlada).
   OJO: hay `scroll-behavior: smooth` global; si no se pisa con 'auto',
   cada scrollTo del rAF dispara SU PROPIA animación y no se mueve nada. */
function animateScrollTo(targetY, ms) {
  const startY = window.scrollY;
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  const step = (now) => {
    const k = clamp((now - t0) / ms);
    window.scrollTo(0, startY + (targetY - startY) * ease(k));
    if (k < 1) requestAnimationFrame(step);
    else html.style.scrollBehavior = prev;
  };
  requestAnimationFrame(step);
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
  introEl = document.getElementById('e1');
  duoEl = document.getElementById('duoChart');
  e2Sec = document.getElementById('e2');
  e2Fig = document.getElementById('e2Fig');
  e2Step = document.querySelector('#e2 .step[data-layer="0"]');
  e3Img = document.querySelector('#e3 .snakes');
  e3Step = document.querySelector('#e3 .step[data-layer="1"]');
  e3TitleCard = document.getElementById('e3TitleCard');
  e3TitleStep = document.querySelector('#e3 .step[data-layer="0"]');
  e3FinalCard = document.querySelector('#e3 .step__card--final');
  e3bSec = document.getElementById('e3b');
  waffleEl = document.getElementById('e3Waffle');
  e3CountEl = document.getElementById('e3Count');
  fmEl = document.querySelector('#e4 [data-chart="04_ilusion_auditiva"]');
  e4FmStep = document.querySelector('#e4 .step[data-layer="1"]');
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
  if (progressBar) progressBar.style.transform = `scaleX(${read.toFixed(4)})`;

  // Arriba de todo no se muestra ningún chrome: el video va solo
  document.body.classList.toggle('at-top', window.scrollY < 40);

  // Portales: entrás al túnel; el título aparece ya ADENTRO; el puntito
  // crece debajo del título hasta tragarte; la frase aparece en el negro.
  for (const pt of portals) {
    if (!pt.section) continue;
    const prog = sectionProgress(pt.section);
    pt.sp.setProgress(prog);
    if (pt.head) {
      const tIn = REDUCED ? 1 : clamp((prog - 0.3) / 0.14);
      const tOut = 1 - clamp((prog - 0.8) / 0.12);
      pt.head.style.opacity = (easeOut(tIn) * tOut).toFixed(3);
      pt.head.style.transform = `translateY(${(18 * (1 - easeOut(tIn))).toFixed(1)}px)`;
    }
    if (pt.dot) {
      const appear = clamp((prog - 0.5) / 0.05);
      const grow = clamp((prog - 0.5) / 0.42);
      const dotMax = Math.hypot(window.innerWidth, window.innerHeight) / 8;
      const s = appear * (1 + Math.pow(grow, 2.7) * dotMax);
      pt.dot.style.opacity = appear.toFixed(3);
      pt.dot.style.transform = `translate(-50%, -50%) scale(${s.toFixed(2)})`;
    }
    if (pt.after) pt.after.style.opacity = clamp((prog - 0.9) / 0.08).toFixed(3);
  }

  // E1: en estado gráfico, las barras crecen de 0 al % esperado con el scroll
  if (introEl && introEl.dataset.state === 'chart' && duoEl && duoEl.__setDuo && !REDUCED) {
    const p = clamp((sectionProgress(introEl) - 0.04) / 0.76);
    duoEl.__setDuo(easeOut(p));
  }

  // E2: la figura gira con el scroll (si toca girar) y aparecen las marcas
  if (e2Fig && e2Step) {
    const p = stepScrub(e2Step);
    // El conejo aparece cerca de los 45°: girar 90° era demasiado y mostraba
    // las marcas muy rápido. Tope en 45° y curva más pausada.
    const MAXDEG = 45;
    const deg = state.e2rotate ? (REDUCED ? MAXDEG : easeOut(p) * MAXDEG) : 0;
    e2Fig.style.setProperty('--rot', deg.toFixed(1) + 'deg');
    if (e2Sec) e2Sec.classList.toggle('cues-on', p > (state.e2rotate ? 0.6 : 0.35));
  }

  // E3 (snakes): el notch negro sube con el scroll normal; con la pantalla
  // toda rosa el título se desvanece en el lugar; después salís (deszoom)
  // del centro de un círculo de la ilusión hasta el tamaño final, y recién
  // ahí aparece el texto blanco.
  if (e3TitleCard && e3TitleStep && !REDUCED) {
    const p = stepScrub(e3TitleStep);
    e3TitleCard.style.opacity = (1 - clamp((p - 0.72) / 0.18)).toFixed(3);
  }
  if (e3Img && e3Step && !REDUCED) {
    const raw = stepScrub(e3Step);
    // Mantiene el zoom máximo el primer tramo (estás ADENTRO del círculo,
    // todo rosa) y recién después suelta; el deszoom termina al 80% del paso.
    const p = clamp((raw - 0.16) / 0.64);
    const z = 1 + 200 * Math.pow(1 - p, 3);   // 120× adentro del círculo → 1× final
    e3Img.style.setProperty('--snake-zoom', z.toFixed(3));
    // El texto final aparece SOLO con la imagen ya en su tamaño mínimo.
    if (e3FinalCard) e3FinalCard.style.opacity = clamp((raw - 0.84) / 0.1).toFixed(3);
  }

  // Waffle (E3b): se pinta con el scroll
  if (!REDUCED && waffleEl && waffleEl.__setWaffle && e3bSec) {
    const p = clamp((sectionProgress(e3bSec) - 0.08) / 0.72);
    waffleEl.__setWaffle(p);
    if (e3CountEl) e3CountEl.textContent = Math.round(p * 96);
  }

  // E4 (onda FM): las ondas se alargan a medida que scrolleás el resultado
  if (!REDUCED && fmEl && fmEl.__setFM && e4FmStep) {
    fmEl.__setFM(stepScrub(e4FmStep));
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
