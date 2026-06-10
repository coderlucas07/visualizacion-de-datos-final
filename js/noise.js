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
   Un espiral hipnótico (bandas claro/oscuro) que GIRA todo el tiempo y,
   a medida que se scrollea (progress 0→1), hace ZOOM hacia el centro como
   si uno se metiera dentro, hasta que el punto central se traga la pantalla
   y queda en negro. Después, sobre el negro, aparece el título del módulo.
   ===================================================================== */
export class SpiralPortal {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = { reduced: false, ink: '#0B0C10', paper: '#ECE9E2', turns: 13, ...opts };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0; this.h = 0;
    this.progress = 0;
    this.targetProgress = 0;
    this.running = false;
    this.raf = null;
    this.t0 = performance.now();
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
    this.progress += (this.targetProgress - this.progress) * 0.12;
    this._draw(now || 0);
    this.raf = requestAnimationFrame(this._render);
  }

  _draw(now) {
    const { ctx, w, h } = this;
    const cx = w / 2, cy = h / 2;
    const p = this.opts.reduced ? this.targetProgress : this.progress;
    const ink = this.opts.ink;

    ctx.clearRect(0, 0, w, h);
    // Base del sitio (para que los bordes se fundan con el fondo oscuro)
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, w, h);

    // Zoom acelerado: "te metés" en el espiral. Giro continuo + empuje por scroll.
    const zoom = 1 + Math.pow(p, 1.6) * 9;
    const spin = (this.opts.reduced ? 0 : (now - this.t0) * 0.00020) + p * Math.PI * 3;
    const R = Math.hypot(w, h) / 2 + 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.scale(zoom, zoom);

    // Disco de "papel" (claro) sobre el que vive el espiral oscuro
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = this.opts.paper;
    ctx.fill();

    // Brazo del espiral (Arquímedes): estela oscura con huecos claros del mismo ancho
    const turns = this.opts.turns;
    const pitch = R / turns;
    const steps = turns * 64;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * turns * Math.PI * 2;
      const r = (pitch * th) / (Math.PI * 2);
      const x = Math.cos(th) * r, y = Math.sin(th) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineWidth = pitch * 0.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = ink;
    ctx.stroke();
    ctx.restore();

    // El centro se va volviendo negro y se traga todo a medida que entrás
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.72);
    g.addColorStop(0, `rgba(11,12,16,${clamp(0.25 + p * 1.1)})`);
    g.addColorStop(clamp(0.55 - p * 0.45), `rgba(11,12,16,${clamp(p * 0.85)})`);
    g.addColorStop(1, 'rgba(11,12,16,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Tramo final: a negro pleno (acá aparece el título del módulo, por HTML)
    if (p > 0.8) {
      ctx.fillStyle = `rgba(11,12,16,${clamp((p - 0.8) / 0.2)})`;
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
