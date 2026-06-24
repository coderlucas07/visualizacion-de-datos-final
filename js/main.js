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
let introEl = null, duoEl = null, introAfterEl = null;
let e2Sec = null, e2Fig = null, e2Step = null, e2ChartEl = null, e2ChartStep = null;
let e2LinesCanvas = null, e2LinesDraw = null;
let e3Img = null, e3Step = null, e3TitleCard = null, e3TitleStep = null, e3FinalCard = null;
let e3bSec = null, waffleEl = null, e3CountEl = null, e3bGraphicEl = null;
let fmEl = null, e4FmStep = null;
let e5Sec = null, gorilaStatEl = null;
let e7Sec = null, e7ChartEl = null;
let e9Sec = null, dkEl = null;
let e10Sec = null, e10ChartEl = null;
let fantSec = null, ghostFunnelEl = null;
let e12Sec = null, e12Track = null;
let e13Sec = null, brechaEl = null;

const state = { first: null, e2rotate: true, e1answered: false };
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
  setupE2Lines();
  setupCover();
  setupGorila();
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
   Cada módulo tiene su acento: decisión azul cobalto, sesgos carmesí. Se setea
   --accent en cada sección ANTES de que los gráficos se inicialicen, así
   charts.js (accentOf) lo hereda solo. PERCEPCIÓN no se setea acá a propósito:
   hereda el celeste global #8FD8FF (el mismo azul del título de portada). */
function setupModuleColors() {
  const DECISION = ['portal2', 'pausa2', 'e6', 'e7', 'e8', 'e9'];                 // Decisión (naranja cálido)
  const SESGOS = ['portal3', 'sesgos-intro', 'pausa3', 'fantasmas', 'e12', 'e10', 'e13', 'cierre'];
  const mods = { '#F7943D': DECISION, '#E11D48': SESGOS };
  const soft = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };
  for (const [hex, ids] of Object.entries(mods)) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) { el.style.setProperty('--accent', hex); el.style.setProperty('--accent-soft', soft(hex, 0.16)); }
    }
  }
  // Decisión NO usa verde/rojo: gan/pérd se distinguen con TONALIDADES del naranja
  // del módulo (claro = ganancia, profundo = pérdida). Así moneda, filas de apuesta
  // y gráficos (G7/G8) heredan la identidad del módulo y no rompen el color.
  for (const id of DECISION) {
    const el = document.getElementById(id);
    if (el) { el.style.setProperty('--gain', '#F6C28A'); el.style.setProperty('--loss', '#D9641B'); }
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
    try {
      fn(el, DATA, { reduced: REDUCED }); addSource(el, id);
      // En escenas a PANTALLA COMPLETA (.scrolly--stage) el panel de texto flotante
      // es el titular → ocultamos el título interno del gráfico para que no compita
      // y dejamos que el dato use toda la pantalla.
      if (el.closest('.scrolly--stage') && el.__chart) {
        el.__chart.setOption({ title: { show: false } });
      }
    } catch (err) { console.error('[chart] error en', id, err); }
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
  const patch = document.getElementById('coverPatch');
  if (!coverEl || !video) return;

  // ----- Riser de portada: un "whoosh" que dispara al empezar a bajar (la
  // zambullida en el cerebro). El navegador bloquea el audio hasta que hay un
  // gesto del usuario; probamos en el primer wheel/touch/click/tecla. Con
  // prefers-reduced-motion no suena. Se rearma al reiniciar con el ↺. -----
  const audio = document.getElementById('coverAudio');
  const soundBtn = document.getElementById('coverSound');
  let soundOn = false, audioDur = 0, lastTargetA = -1, idleA = 0;
  const VOL = 0.6;
  if (audio) {
    const onMetaA = () => { audioDur = audio.duration || 0; };
    if (audio.readyState >= 1) onMetaA();
    else audio.addEventListener('loadedmetadata', onMetaA, { once: true });
  }
  const setSound = (on) => {
    soundOn = on;
    if (soundBtn) { soundBtn.classList.toggle('is-on', on); soundBtn.setAttribute('aria-pressed', String(on)); }
    if (!audio) return;
    if (on) audio.play().catch(() => { /* el loop reintenta */ });  // el click desbloquea; frame() maneja posición/volumen
    else audio.pause();
  };
  // El click del botón es un gesto válido → desbloquea el audio.
  if (soundBtn && audio && !REDUCED) soundBtn.addEventListener('click', () => setSound(!soundOn));
  if (soundBtn && REDUCED) soundBtn.style.display = 'none';   // sin animación, sin sonido

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

    // Riser atado al scroll: la POSICIÓN del audio sigue al descenso, así dura
    // TODO el scroll de la portada y el clímax cae en el quiebre. Avanza solo
    // mientras scrolleás (se congela si frenás); fade-in al entrar y fade-out
    // pasado el quiebre.
    if (audio && soundOn && audioDur > 0) {
      const target = clamp(p / SCRUB_END) * (audioDur - 0.05);
      const moving = Math.abs(target - lastTargetA) > 0.0008;
      lastTargetA = target;
      if (moving) {
        idleA = 0;
        const diff = target - audio.currentTime;
        if (diff > 0.16) {            // el scroll fue más rápido → adelanto el audio (nunca rebobina)
          if (audio.paused) audio.play().catch(() => { /* noop */ });
          try { audio.currentTime = target; } catch { /* noop */ }
        } else if (diff < -0.06) {    // el audio se adelantó al scroll → espero (no rebobinar)
          if (!audio.paused) audio.pause();
        } else if (audio.paused) {    // en sync → reproduzco
          audio.play().catch(() => { /* noop */ });
        }
      } else if (++idleA > 6 && !audio.paused) {
        audio.pause();               // scroll quieto → congelo el riser donde está
      }
      audio.volume = VOL * clamp(p / 0.05) * (1 - clamp((p - 0.76) / 0.14));
    }

    if (visible) raf = requestAnimationFrame(frame);
  };

  const vis = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      visible = e.isIntersecting;
      // Mientras la portada está a la vista se apaga el grano global
      // (mix-blend-mode sobre video es caro y serrucha el scroll).
      document.body.classList.toggle('cover-vis', visible);
      if (!visible && audio) audio.pause();   // el riser solo suena en la portada
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }),
    { threshold: 0 }
  );
  vis.observe(coverEl);

  if (replay) replay.addEventListener('click', () => {
    const top = coverEl.getBoundingClientRect().top + window.scrollY;
    animateScrollTo(top, 1400 + 1800 * sectionProgress(coverEl));
    // Con el sonido activado, al volver al inicio el riser se rebobina solo
    // (frame() lo lleva a la posición 0) y vuelve a sonar en la próxima bajada.
    if (audio && soundOn) { try { audio.currentTime = 0; } catch { /* noop */ } }
  });

  // El botón se planta EXACTAMENTE sobre el sparkle de Gemini del video.
  // El sparkle está centrado en (1743, 902) del frame de 1920×1080; acá se
  // replica la cuenta del object-fit: cover para cualquier pantalla.
  const placeReplay = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.max(vw / 1920, vh / 1080);
    const x = 1743 * s - (1920 * s - vw) / 2;
    const y = 902 * s - (1080 * s - vh) / 2;
    const d = Math.round(Math.max(64, 92 * s)); // el sparkle mide ~80px @1080p; el disco lo tapa entero
    if (replay) {
      replay.style.left = x.toFixed(0) + 'px';
      replay.style.top = y.toFixed(0) + 'px';
      replay.style.right = 'auto';
      replay.style.bottom = 'auto';
      replay.style.width = replay.style.height = d + 'px';
    }
    // La máscara del watermark va en el mismo centro, más grande y con feather:
    // tapa el logo de Gemini SIEMPRE (no solo cuando aparece el botón ↺).
    if (patch) {
      const pd = Math.round(d * 2.3);
      patch.style.left = x.toFixed(0) + 'px';
      patch.style.top = y.toFixed(0) + 'px';
      patch.style.width = patch.style.height = pd + 'px';
    }
  };
  placeReplay();
  window.addEventListener('resize', placeReplay);
}

/* =====================================================================
   GORILA — test de atención selectiva (Simons & Chabris), video original.
   El video de YouTube ocupa toda la pantalla y ARRANCA SOLO cuando la
   sección queda perfectamente alineada (cuando llena el viewport): un
   IntersectionObserver lo reproduce al superar el 90% de cobertura y lo
   pausa al salir. Empieza muteado (así el autoplay nunca lo bloquea el
   navegador); el botón de sonido activa el audio original. Con
   prefers-reduced-motion NO hay autoplay: se muestran los controles
   nativos para reproducirlo a mano.
   ===================================================================== */
function setupGorila() {
  const stage = document.getElementById('gorilaStage');
  const mount = document.getElementById('gorilaPlayer');
  const soundBtn = document.getElementById('gorilaSound');
  if (!stage || !mount) return;

  const VIDEO_ID = 'vJG698U2Mvo';   // youtu.be/vJG698U2Mvo — "selective attention test"
  let player = null, ready = false, wantPlay = false;

  const play = () => { try { player.playVideo(); } catch { /* aún no listo */ } };
  const pause = () => { try { player.pauseVideo(); } catch { /* noop */ } };

  const build = () => {
    player = new YT.Player(mount, {
      width: '100%', height: '100%',
      videoId: VIDEO_ID,
      playerVars: {
        controls: REDUCED ? 1 : 0,   // sin chrome para la inmersión; con reduced, controles nativos
        disablekb: 1, modestbranding: 1, rel: 0, fs: 0,
        playsinline: 1, iv_load_policy: 3, mute: 1,
      },
      events: {
        onReady: () => {
          ready = true;
          try { player.mute(); } catch { /* noop */ }
          if (wantPlay) play();   // si ya estaba alineado mientras cargaba el API
        },
        onStateChange: (e) => {
          // La consigna se repliega mientras corre el video y vuelve al pausar/terminar.
          if (e.data === YT.PlayerState.PLAYING) stage.classList.add('is-playing');
          else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) stage.classList.remove('is-playing');
        },
      },
    });
  };

  // Carga del IFrame API de YouTube una sola vez; si ya está, construye al toque.
  if (window.YT && window.YT.Player) build();
  else {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof prev === 'function') prev(); build(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }

  // Botón de sonido: arranca muteado (autoplay seguro) → activa el audio original.
  if (soundBtn) soundBtn.addEventListener('click', () => {
    if (!ready) return;
    const muted = player.isMuted();
    if (muted) { player.unMute(); player.setVolume(100); }
    else player.mute();
    soundBtn.classList.toggle('is-on', muted);
    soundBtn.setAttribute('aria-pressed', String(muted));
  });

  // Con reduced-motion no autoreproducimos: quedan los controles nativos.
  if (REDUCED) return;

  // Arranca SOLO cuando el escenario llena la pantalla (alineado al viewport)
  // y se pausa al salir. La franja de thresholds da una transición estable.
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const fills = e.intersectionRatio >= 0.9;
      wantPlay = fills;
      if (!ready) return;
      fills ? play() : pause();
    }),
    { threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] }
  );
  io.observe(stage);
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
    state.e1answered = true;          // a partir de acá el estado sigue al scroll
    configureE2(state.first);
    intro.dataset.state = 'chart';
    // Arrancar el scrub desde el inicio de la sección: las barras crecen al bajar.
    const top = intro.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + 8, behavior: REDUCED ? 'auto' : 'smooth' });
  }));

  // "Volver a la imagen": scrollea al tope de la escena → tick() pone estado "img".
  const back = document.getElementById('backToImg');
  if (back) back.addEventListener('click', () => {
    const top = intro.getBoundingClientRect().top + window.scrollY;
    animateScrollTo(top, 600);
  });
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

  // E6 (bate), E7 (apuesta) y E8 (framing): elegir marca el botón y auto-avanza.
  ['e6', 'e7', 'e8'].forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const btns = sec.querySelectorAll('[data-choice]');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      scrollToNextStep(b);
    }));
  });
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
  const l1 = document.getElementById('e2Label1');
  const l2 = document.getElementById('e2Label2');
  if (!titleEl || !ledeEl || !a1 || !a2 || !l1 || !l2) return;
  const target = firstChoice === 'conejo' ? 'pato' : 'conejo';
  state.e2rotate = target === 'conejo';

  // Punto + rótulo ANCLADOS al mismo rasgo (en % de la imagen): viven dentro de
  // la figura, giran con ella y caen siempre sobre la anatomía correcta. El
  // texto del rótulo se contra-rota por CSS (var --rot) para quedar horizontal.
  const mark = (dotEl, labelEl, text, left, top) => {
    dotEl.style.left = left + '%';  dotEl.style.top = top + '%';
    labelEl.textContent = text;
    labelEl.style.left = left + '%'; labelEl.style.top = top + '%';
  };

  if (target === 'conejo') {
    titleEl.textContent = 'Dale vuelta la cabeza.';
    ledeEl.innerHTML = 'La figura gira: eso que era un pico ahora son <strong>dos orejas</strong>, y atrás aparece el <strong>hocico</strong>. ¿Ves el conejo?';
    mark(a1, l1, 'las orejas', 20, 22);   // las puntas (pico del pato → orejas)
    mark(a2, l2, 'el hocico',  90, 64);   // el morro redondeado, abajo a la derecha
  } else {
    titleEl.textContent = 'Mirá otra vez.';
    ledeEl.innerHTML = 'Eso que parecían <strong>orejas</strong> es un <strong>pico</strong>, y el ojo mira hacia el agua. ¿Aparece el pato?';
    mark(a1, l1, 'el pico', 20, 22);
    mark(a2, l2, 'el ojo',  68.5, 30);
  }
}

/* =====================================================================
   E2 — transición de "líneas que viajan" (entrada desde E1).
   Un canvas sobre la figura: muestrea la silueta del pato-conejo y manda
   partículas-estela desde afuera que CONVERGEN y la dibujan. Cuando termina
   de armarse, se funde con la figura real (que después rota). Scrubeado por
   el scroll en tick() (e2LinesDraw). Con reduced-motion no corre.
   ===================================================================== */
function setupE2Lines() {
  if (REDUCED) return;
  const wrap = document.querySelector('#e2 .e2-figwrap');
  const fig = document.getElementById('e2Fig');
  if (!wrap || !fig) return;
  const accent = (getComputedStyle(e2Sec || document.getElementById('e2')).getPropertyValue('--accent').trim()) || '#8FD8FF';
  const n = parseInt(accent.replace('#', ''), 16);
  const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;

  const cv = document.createElement('canvas');
  cv.className = 'e2-lines'; cv.setAttribute('aria-hidden', 'true');
  wrap.appendChild(cv);
  e2LinesCanvas = cv;
  const ctx = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, pts = [];

  const img = new Image();
  img.src = './assets/840_560.jpg';

  const build = () => {
    const r = fig.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!img.complete || !img.naturalWidth) return;
    const wi = Math.round(W), hi = Math.round(H);
    const off = document.createElement('canvas'); off.width = wi; off.height = hi;
    const o = off.getContext('2d'); o.drawImage(img, 0, 0, wi, hi);
    const data = o.getImageData(0, 0, wi, hi).data;
    pts = [];
    const N = 540; let tries = 0;
    while (pts.length < N && tries < N * 60) {
      tries++;
      const x = (Math.random() * wi) | 0, y = (Math.random() * hi) | 0;
      const i = (y * wi + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum < 95) {   // pixel de la FIGURA (oscura sobre fondo claro)
        const ang = Math.random() * Math.PI * 2, d = Math.max(W, H) * (0.45 + Math.random() * 0.75);
        pts.push({ ex: x, ey: y, sx: x + Math.cos(ang) * d, sy: y + Math.sin(ang) * d });
      }
    }
  };
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  e2LinesDraw = (p) => {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    if (!pts.length) return;
    const e = ease(clamp(p));
    const e0 = ease(clamp(p - 0.07));   // posición de la cola (estela)
    ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
    for (const pt of pts) {
      const x = pt.sx + (pt.ex - pt.sx) * e, y = pt.sy + (pt.ey - pt.sy) * e;
      const tx = pt.sx + (pt.ex - pt.sx) * e0, ty = pt.sy + (pt.ey - pt.sy) * e0;
      ctx.strokeStyle = `rgba(${rgb},${(0.18 + 0.62 * e).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
    }
  };

  img.onload = () => build();
  if (img.complete && img.naturalWidth) build();
  new ResizeObserver(build).observe(fig);
}

/* ----------------------------- Refs para el scrub ----------------------------- */
function cacheScrubRefs() {
  coverEl = document.getElementById('portada');
  introEl = document.getElementById('e1');
  duoEl = document.getElementById('duoChart');
  introAfterEl = document.querySelector('#e1 .intro__after');
  e2Sec = document.getElementById('e2');
  e2Fig = document.getElementById('e2Fig');
  e2Step = document.querySelector('#e2 .step[data-layer="0"]');
  e2ChartEl = document.querySelector('#e2 [data-chart="02_contexto_cambio"]');
  e2ChartStep = document.querySelector('#e2 .step[data-layer="1"]');
  e3Img = document.querySelector('#e3 .snakes');
  e3Step = document.querySelector('#e3 .step[data-layer="1"]');
  e3TitleCard = document.getElementById('e3TitleCard');
  e3TitleStep = document.querySelector('#e3 .step[data-layer="0"]');
  e3FinalCard = document.querySelector('#e3 .step__card--final');
  e3bSec = document.getElementById('e3b');
  waffleEl = document.getElementById('e3Waffle');
  e3CountEl = document.getElementById('e3Count');
  e3bGraphicEl = document.getElementById('e3bGraphic');
  fmEl = document.querySelector('#e4 [data-chart="04_ilusion_auditiva"]');
  e4FmStep = document.querySelector('#e4 .step[data-layer="1"]');
  e5Sec = document.getElementById('e5');
  gorilaStatEl = document.querySelector('#e5 [data-chart="05_cierre_percepcion"]');
  e7Sec = document.getElementById('e7');
  e7ChartEl = document.querySelector('#e7 [data-chart="07_aversion_perdidas"]');
  e9Sec = document.getElementById('e9');
  dkEl = document.querySelector('#e9 [data-chart="09_dunning_kruger"]');
  e10Sec = document.getElementById('e10');
  e10ChartEl = document.querySelector('#e10 [data-chart="10_mejor_que_promedio"]');
  fantSec = document.getElementById('fantasmas');
  ghostFunnelEl = document.getElementById('ghostFunnel');
  e12Sec = document.getElementById('e12');
  e12Track = document.getElementById('e12Track');
  e13Sec = document.getElementById('e13');
  brechaEl = document.getElementById('brechaChart');
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
    // El espiral gira y te mete al centro (zoom); cerca del final queda todo
    // negro y RECIÉN AHÍ aparece el título del módulo (legible sobre negro).
    const headIn = REDUCED ? 1 : clamp((prog - 0.8) / 0.08);
    const afterIn = clamp((prog - 0.92) / 0.06);
    if (pt.head) {
      pt.head.style.opacity = (easeOut(headIn) * (1 - afterIn)).toFixed(3);
      pt.head.style.transform = `translateY(${(16 * (1 - easeOut(headIn))).toFixed(1)}px)`;
    }
    if (pt.dot) pt.dot.style.opacity = '0';   // el zoom del espiral ya te mete adentro
    if (pt.after) pt.after.style.opacity = afterIn.toFixed(3);
  }

  // E1: una vez respondido, el estado SIGUE al scroll (arriba = imagen, abajo =
  // gráfico). Así volver con el scroll no rompe la escena ni hace desaparecer la figura.
  if (introEl && state.e1answered && !REDUCED) {
    introEl.dataset.state = introEl.getBoundingClientRect().top > 60 ? 'img' : 'chart';
  }

  // E1: en estado gráfico, las barras crecen de 0 al % esperado con el scroll.
  // Se llenan RÁPIDO (en el primer tramo del scroll); después el texto de cierre
  // sube y aparece a medida que seguís bajando (sensación de scroll, no de pared).
  if (introEl && introEl.dataset.state === 'chart' && !REDUCED) {
    const prog = sectionProgress(introEl);
    if (duoEl && duoEl.__setDuo) duoEl.__setDuo(easeOut(clamp((prog - 0.03) / 0.26)));
    if (introAfterEl) {
      const a = clamp((prog - 0.30) / 0.34);
      introAfterEl.style.opacity = (0.25 + 0.75 * a).toFixed(3);
      introAfterEl.style.transform = `translateY(${(34 * (1 - easeOut(a))).toFixed(1)}px)`;
    }
  }

  // E2 · TRANSICIÓN + MORPH. Al entrar desde E1, líneas celestes VIAJAN y se
  // arman en la figura (no aparece de golpe); recién cuando la silueta está
  // formada, la MISMA figura rota ~90° con el scroll (el pico → las orejas). Las
  // marcas aparecen al final, ya con el conejo a la vista.
  if (e2Fig && e2Step) {
    const p = stepScrub(e2Step);
    if (!REDUCED) {
      const assemble = clamp(p / 0.30);                 // 0→1 las líneas se arman
      if (e2LinesDraw) e2LinesDraw(assemble);
      if (e2LinesCanvas) e2LinesCanvas.style.opacity = (1 - clamp((p - 0.24) / 0.12)).toFixed(3);
      e2Fig.style.opacity = clamp((p - 0.22) / 0.12).toFixed(3);  // la figura real revela cuando las líneas terminan
    }
    const rot = REDUCED ? 1 : clamp((p - 0.34) / 0.66);  // la rotación arranca DESPUÉS de armarse
    const MAXDEG = 90;
    const deg = state.e2rotate ? (REDUCED ? MAXDEG : easeOut(rot) * MAXDEG) : 0;
    e2Fig.style.setProperty('--rot', deg.toFixed(1) + 'deg');
    if (e2Sec) e2Sec.classList.toggle('cues-on', rot > (state.e2rotate ? 0.62 : 0.3));
  }

  // E2 (gráfico del contexto): al llegar, las barras son IDÉNTICAS al gráfico
  // anterior (Pato 57,5 / Conejo 42,5); al scrollear un poco se vuelcan a la
  // distribución con la pista (26 / 74) → se ve el efecto del contexto.
  if (!REDUCED && e2ChartEl && e2ChartEl.__setMorph && e2ChartStep) {
    const m = clamp((stepScrub(e2ChartStep) - 0.35) / 0.4);
    e2ChartEl.__setMorph(easeOut(m));
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
    // Deszoom suave que NO pixela: el PNG es 3840px; magnificarlo 200× (como
    // antes) lo serruchaba. Tope ~3× (por debajo del umbral de upscaling),
    // así la imagen se mantiene nítida en TODO el recorrido.
    const p = clamp((raw - 0.16) / 0.64);
    const z = 1 + 2.4 * Math.pow(1 - p, 2);   // ~3,4× (llena la pantalla al entrar) → 1× final, sin pixelar
    e3Img.style.setProperty('--snake-zoom', z.toFixed(3));
    // El texto final aparece SOLO con la imagen ya en su tamaño mínimo.
    if (e3FinalCard) e3FinalCard.style.opacity = clamp((raw - 0.84) / 0.1).toFixed(3);
  }

  // Waffle (E3b): el "96" se ordena en grilla con el scroll y, una vez armado,
  // TODO el bloque se apaga (fundido) → da paso a la sección del audio.
  if (!REDUCED && waffleEl && waffleEl.__setWaffle && e3bSec) {
    const sp = sectionProgress(e3bSec);
    const p = clamp((sp - 0.08) / 0.58);   // el morph completa antes (deja cola para el fundido)
    waffleEl.__setWaffle(p);
    if (e3CountEl) e3CountEl.textContent = Math.round(p * 96);
    if (e3bGraphicEl) e3bGraphicEl.style.opacity = (1 - clamp((sp - 0.72) / 0.22)).toFixed(3);
  }

  // E4 (onda FM): las ondas se alargan a medida que scrolleás el resultado
  if (!REDUCED && fmEl && fmEl.__setFM && e4FmStep) {
    fmEl.__setFM(stepScrub(e4FmStep));
  }

  // E5 (cierre): la pantalla queda CONGELADA (pin sticky) y el número sube de
  // 0% a 50% siguiendo el scroll (lineal, 1:1); llega al 50% cerca del final del
  // recorrido y ahí se libera para seguir scrolleando normal hacia Decisión.
  if (!REDUCED && gorilaStatEl && gorilaStatEl.__setGorila && e5Sec) {
    gorilaStatEl.__setGorila(clamp(sectionProgress(e5Sec) / 0.85));
  }

  // E7 (aversión): la moneda dispara un "rayito" que dibuja primero la barra de
  // pérdida (abajo, grande) y después la de ganancia (arriba, chica), con el scroll.
  if (!REDUCED && e7ChartEl && e7ChartEl.__setG7 && e7Sec) {
    const p = clamp((sectionProgress(e7Sec) - 0.42) / 0.5);
    e7ChartEl.__setG7(p);
  }

  // E9 (Dunning-Kruger): la línea avanza de "Peores" a "Mejores" a medida que
  // bajás por la teórica (el scroll dibuja el gráfico).
  if (!REDUCED && dkEl && dkEl.__setProgress && e9Sec) {
    const p = clamp((sectionProgress(e9Sec) - 0.05) / 0.7);
    dkEl.__setProgress(p);
  }

  // E10 (mejor que el promedio): al seguir scrolleando, sale la flecha que
  // apunta a la barra del 93% (manejar).
  if (!REDUCED && e10ChartEl && e10ChartEl.__showCallout && e10Sec) {
    e10ChartEl.__showCallout(sectionProgress(e10Sec) > 0.4);
  }

  // Fantasmas: el embudo (50 creen → 15 sintieron → 1 vio) se arma con el scroll.
  if (!REDUCED && ghostFunnelEl && ghostFunnelEl.__setFunnel && fantSec) {
    const p = clamp((sectionProgress(fantSec) - 0.04) / 0.42);
    ghostFunnelEl.__setFunnel(easeOut(p));
  }

  // E12 (caras): scroll vertical → recorrido HORIZONTAL del track.
  if (!REDUCED && e12Track && e12Sec) {
    const p = sectionProgress(e12Sec);
    const max = Math.max(0, e12Track.scrollWidth - window.innerWidth);
    e12Track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
  }

  // E13 (la brecha): 3 etapas con el scroll → Ciencia, luego Público, luego la brecha.
  if (!REDUCED && brechaEl && brechaEl.__setBrecha && e13Sec) {
    brechaEl.__setBrecha(sectionProgress(e13Sec));
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
