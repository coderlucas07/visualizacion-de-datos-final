/* =====================================================================
   NoiseToSignal — motivo visual recurrente.
   Un campo de puntos (ruido) que, según el progreso de scroll, "cuaja"
   en una forma reconocible (señal): la figura pato-conejo, un signo $,
   un ojo. Metáfora del cerebro rellenando lo ambiguo.

   Canvas puro, sutil y dependiente del progreso (0 = ruido, 1 = señal).
   ===================================================================== */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
// Suavizado tipo "ease-in-out" para que la figura aparezca con gracia
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class NoiseToSignal {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = {
      maxParticles: 1100,   // tope por performance
      dotSize: 1.6,         // tamaño del punto (CSS px)
      colorInk: '232, 230, 224',     // hueso (rgb sin alpha)
      colorAccent: null,             // si se pasa, una fracción usa este color
      accentRatio: 0.22,             // proporción de puntos con acento
      jitter: 26,           // amplitud del temblor del ruido (CSS px)
      fit: 0.82,            // qué fracción del canvas ocupa la figura
      reduced: false,       // prefers-reduced-motion
      ...opts,
    };

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.particles = [];
    this.targetProgress = this.opts.reduced ? 1 : 0; // a dónde queremos llegar
    this.progress = this.opts.reduced ? 1 : 0;       // dónde estamos (eased)
    this.running = false;
    this.raf = null;
    this._source = null; // {type, args} para re-muestrear en resize

    this._render = this._render.bind(this);
    this._onResize = debounce(() => this._resize(true), 150);
    window.addEventListener('resize', this._onResize);

    this._resize(false);
  }

  /* ---------- Dimensionado (DPR-aware) ---------- */
  _resize(reseed) {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (reseed && this._source) {
      this._applySource().then(() => this._renderOnce());
    } else if (reseed) {
      this._renderOnce();
    }
  }

  /* ---------- Fuentes de la "señal" ---------- */
  setTargetFromImage(src, o = {}) {
    this._source = { type: 'image', src, o };
    return this._applySource();
  }
  setTargetFromText(glyph, o = {}) {
    this._source = { type: 'text', glyph, o };
    return this._applySource();
  }
  setTargetFromDraw(drawFn, o = {}) {
    this._source = { type: 'draw', drawFn, o };
    return this._applySource();
  }

  async _applySource() {
    const s = this._source;
    if (!s) return;
    let points = [];
    try {
      if (s.type === 'image') points = await this._sampleImage(s.src, s.o);
      else if (s.type === 'text') points = this._sampleText(s.glyph, s.o);
      else if (s.type === 'draw') points = this._sampleDraw(s.drawFn, s.o);
    } catch (err) {
      console.warn('[NoiseToSignal] no se pudo muestrear la figura:', err);
      points = [];
    }
    this._buildParticles(points);
  }

  /* Muestrea píxeles de una imagen (figura oscura sobre fondo claro por defecto) */
  _sampleImage(src, o = {}) {
    const threshold = o.threshold ?? 120; // luminancia
    const invert = o.invert ?? false;     // true = muestrear píxeles claros
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const fit = this.opts.fit;
        const scale = Math.min((this.w * fit) / img.width, (this.h * fit) / img.height);
        const dw = Math.max(1, Math.round(img.width * scale));
        const dh = Math.max(1, Math.round(img.height * scale));
        const off = document.createElement('canvas');
        off.width = dw; off.height = dh;
        const octx = off.getContext('2d', { willReadFrequently: true });
        octx.drawImage(img, 0, 0, dw, dh);
        let data;
        try { data = octx.getImageData(0, 0, dw, dh).data; }
        catch (e) { return reject(e); } // canvas "tainted" (file://)
        const offX = (this.w - dw) / 2;
        const offY = (this.h - dh) / 2;
        const step = 3; // densidad de muestreo
        const pts = [];
        for (let y = 0; y < dh; y += step) {
          for (let x = 0; x < dw; x += step) {
            const i = (y * dw + x) * 4;
            const a = data[i + 3];
            if (a < 40) continue;
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const hit = invert ? lum > 255 - threshold : lum < threshold;
            if (hit) pts.push([offX + x, offY + y]);
          }
        }
        resolve(pts);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  /* Muestrea un glifo de texto (p. ej. "$") */
  _sampleText(glyph, o = {}) {
    const off = document.createElement('canvas');
    off.width = this.w; off.height = this.h;
    const octx = off.getContext('2d', { willReadFrequently: true });
    const size = Math.min(this.w, this.h) * this.opts.fit;
    octx.fillStyle = '#fff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.font = `700 ${size}px ${o.font || 'Space Grotesk, sans-serif'}`;
    octx.fillText(glyph, this.w / 2, this.h / 2 + size * 0.02);
    return this._scanAlpha(octx, this.w, this.h);
  }

  /* Muestrea una forma dibujada por una función drawFn(ctx, w, h) */
  _sampleDraw(drawFn, o = {}) {
    const off = document.createElement('canvas');
    off.width = this.w; off.height = this.h;
    const octx = off.getContext('2d', { willReadFrequently: true });
    drawFn(octx, this.w, this.h);
    return this._scanAlpha(octx, this.w, this.h);
  }

  _scanAlpha(octx, w, h) {
    const data = octx.getImageData(0, 0, w, h).data;
    const step = 3;
    const pts = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 80) pts.push([x, y]);
      }
    }
    return pts;
  }

  /* ---------- Construcción de partículas ---------- */
  _buildParticles(points) {
    // Submuestreo aleatorio si hay más puntos que el tope
    const cap = this.opts.maxParticles;
    if (points.length > cap) {
      for (let i = points.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [points[i], points[j]] = [points[j], points[i]];
      }
      points = points.slice(0, cap);
    }
    const accentN = Math.floor(points.length * this.opts.accentRatio);
    this.particles = points.map((p, idx) => ({
      // home = posición de ruido (dispersa por todo el canvas)
      hx: Math.random() * this.w,
      hy: Math.random() * this.h,
      // target = posición en la figura
      tx: p[0],
      ty: p[1],
      // fase para el temblor
      ph: Math.random() * Math.PI * 2,
      accent: this.opts.colorAccent && idx < accentN,
    }));
    this._renderOnce();
  }

  /* ---------- Progreso y loop ---------- */
  setProgress(p) {
    this.targetProgress = clamp(p);
    if (!this.running && !this.opts.reduced) this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this._render);
  }
  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  _render(now) {
    if (!this.running) return;
    // El progreso real persigue al objetivo (suaviza el scroll)
    this.progress += (this.targetProgress - this.progress) * 0.08;
    this._draw(now || 0);
    // Si ya llegó y no tiembla, podemos frenar el loop para ahorrar CPU
    if (Math.abs(this.targetProgress - this.progress) < 0.001 && this.progress > 0.999) {
      this._draw(now || 0, true); // frame final crisp
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this._render);
  }

  _renderOnce() {
    // Para reduced-motion o estados estáticos: dibuja un frame al progreso actual
    this._draw(performance.now(), this.opts.reduced);
  }

  _draw(now, crisp = false) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const e = this.opts.reduced ? 1 : easeInOut(this.progress);
    const jitterAmp = crisp ? 0 : this.opts.jitter * (1 - e);
    const t = now * 0.001;
    const size = this.opts.dotSize;

    for (const p of this.particles) {
      // Temblor que se apaga a medida que se forma la figura
      const jx = jitterAmp ? Math.cos(t * 1.3 + p.ph) * jitterAmp : 0;
      const jy = jitterAmp ? Math.sin(t * 1.6 + p.ph) * jitterAmp : 0;
      const x = lerp(p.hx, p.tx, e) + jx;
      const y = lerp(p.hy, p.ty, e) + jy;
      // Más opacidad y nitidez a medida que cuaja
      const alpha = 0.18 + 0.62 * e;
      ctx.fillStyle = p.accent
        ? `rgba(${hexToRgb(this.opts.colorAccent)}, ${alpha})`
        : `rgba(${this.opts.colorInk}, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
  }
}

/* =====================================================================
   SpiralPortal — transición de entrada a cada módulo.
   Ya no es un disco "impreso": es un TÚNEL volumétrico a pantalla
   completa (la estética del hombre y el cerebro del video de portada):
   brazos de espiral logarítmico en grises que se hunden hacia un núcleo
   de luz celeste, anillos de profundidad que vienen hacia vos y polvo
   que orbita cayendo al centro. Con el scroll (progress 0→1) la cámara
   avanza hacia adentro; el "puntito" que te traga al final es HTML
   (.portal__dot, lo maneja main.js).
   ===================================================================== */
export class SpiralPortal {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = { reduced: false, glow: '143, 216, 255', gray: '148, 161, 172', ...opts };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0; this.h = 0;
    this.progress = 0;
    this.targetProgress = 0;
    this.running = false;
    this.raf = null;
    this.t0 = performance.now();

    // Polvo: partículas que orbitan y caen lentamente hacia el núcleo
    this.dust = Array.from({ length: 90 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random(),
      sp: 0.04 + Math.random() * 0.2,
      sz: 0.7 + Math.random() * 1.7,
    }));

    this._render = this._render.bind(this);
    this._onResize = debounce(() => this._resize(), 150);
    window.addEventListener('resize', this._onResize);
    this._resize();
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._draw(performance.now());
  }

  setProgress(p) {
    this.targetProgress = clamp(p);
    if (this.opts.reduced) {
      this.progress = this.targetProgress;
      this._draw(0);
      return;
    }
    if (!this.running) this.start();
  }

  start() {
    if (this.running || this.opts.reduced) return;
    this.running = true;
    this.raf = requestAnimationFrame(this._render);
  }
  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  _render(now) {
    if (!this.running) return;
    this.progress += (this.targetProgress - this.progress) * 0.12;
    this._draw(now || 0);
    this.raf = requestAnimationFrame(this._render);
  }

  _draw(now) {
    const { ctx, w, h } = this;
    const reduced = this.opts.reduced;
    const p = reduced ? this.targetProgress : this.progress;
    const t = reduced ? 0 : (now - this.t0) * 0.001;
    const GLOW = this.opts.glow, GRAY = this.opts.gray;

    const cx = w / 2, cy = h * 0.5;
    const diag = Math.hypot(w, h);
    // "enter": la cámara avanza hacia el fondo del túnel con el scroll
    const eRaw = clamp(p / 0.55);
    const enter = eRaw * eRaw * (3 - 2 * eRaw); // smoothstep
    const maxR = diag * (0.62 + 0.85 * enter);
    const spin = t * 0.045 + p * 2.6;

    // Fondo: gris profundo con leve luz al centro
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, diag * 0.7);
    bg.addColorStop(0, '#0D1217');
    bg.addColorStop(1, '#06080B');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Gradiente común de los trazos: celeste en el núcleo → gris en el borde
    const strokeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    strokeGrad.addColorStop(0, `rgba(${GLOW}, 0.85)`);
    strokeGrad.addColorStop(0.22, `rgba(${GLOW}, 0.4)`);
    strokeGrad.addColorStop(0.55, `rgba(${GRAY}, 0.16)`);
    strokeGrad.addColorStop(1, `rgba(${GRAY}, 0.03)`);
    ctx.strokeStyle = strokeGrad;
    ctx.lineCap = 'round';

    // Anillos de profundidad: vienen hacia vos (avance continuo + scroll)
    const drift = t * 0.5 + p * 9;
    const f = drift - Math.floor(drift);
    for (let i = 0; i < 16; i++) {
      const z = i + (1 - f);
      const r = maxR * Math.pow(0.78, z);
      if (r < 2) break;
      ctx.globalAlpha = 0.05 + 0.16 * Math.min(1, z / 4);
      ctx.lineWidth = Math.max(0.6, r * 0.012);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.965, spin * 0.18 + i * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Brazos del espiral (logarítmico, 3 brazos), grosor en perspectiva:
    // gruesos cerca tuyo, finos hundiéndose hacia el núcleo.
    const ARMS = 3, SEG = 26, STEP = 0.24;
    ctx.globalAlpha = 0.9;
    for (let a = 0; a < ARMS; a++) {
      const ph = spin + (a * Math.PI * 2) / ARMS;
      let th = 0;
      for (let s = 0; s < SEG; s++) {
        ctx.beginPath();
        for (let k = 0; k <= 4; k++) {
          const ang = th + k * STEP;
          const r = maxR * Math.exp(-0.16 * ang);
          const x = cx + Math.cos(ang + ph) * r;
          const y = cy + Math.sin(ang + ph) * r * 0.965;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const rMid = maxR * Math.exp(-0.16 * (th + 2 * STEP));
        ctx.lineWidth = Math.max(0.5, rMid * 0.16);
        ctx.stroke();
        th += 4 * STEP;
      }
    }
    ctx.globalAlpha = 1;

    // Polvo orbitando hacia el centro (se acelera al acercarse)
    ctx.fillStyle = `rgba(${GLOW}, 0.8)`;
    for (const d of this.dust) {
      const rr = (((d.r - (t * 0.012 + p * 0.3)) % 1) + 1) % 1;
      const ang = d.a + t * d.sp + p * 2.2 + (1 - rr) * 2.4;
      const rad = maxR * 0.66 * Math.pow(rr, 1.5) + 6;
      ctx.globalAlpha = (1 - rr) * 0.5 + 0.06;
      ctx.fillRect(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.965, d.sz, d.sz);
    }
    ctx.globalAlpha = 1;

    // Núcleo: la luz celeste al fondo del túnel (late despacio)
    const pulse = reduced ? 0 : Math.sin(t * 1.4) * 0.06;
    const coreR = maxR * (0.1 + 0.16 * enter);
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
    core.addColorStop(0, `rgba(214, 240, 255, ${clamp(0.5 + 0.25 * enter + pulse)})`);
    core.addColorStop(0.35, `rgba(${GLOW}, ${clamp(0.2 + 0.2 * enter)})`);
    core.addColorStop(1, `rgba(${GLOW}, 0)`);
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);

    // Viñeta: hunde los bordes (sensación de estar adentro)
    const vg = ctx.createRadialGradient(cx, cy, diag * 0.24, cx, cy, diag * 0.62);
    vg.addColorStop(0, 'rgba(4, 6, 8, 0)');
    vg.addColorStop(1, 'rgba(4, 6, 8, 0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    // Apagado final de respaldo (el puntito HTML ya cubrió casi todo)
    if (p > 0.86) {
      ctx.fillStyle = `rgba(4, 6, 8, ${clamp((p - 0.86) / 0.12)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
  }
}

/* ---------- utilidades ---------- */
function debounce(fn, ms) {
  let id;
  return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
