/* =====================================================================
   charts.js — registro de gráficos.
   Cada gráfico lee su data del JSON (nunca hardcodeado), ocupa la pantalla
   y trae su título + subtítulo (como un gráfico normal). Toma el acento del
   acto desde el CSS. ECharts para barras/líneas/curvas; HTML para el waffle.
   ===================================================================== */

export function rowsToObjects(sheet) {
  if (!sheet || !sheet.headers || !sheet.rows) return [];
  return sheet.rows.map((r) => Object.fromEntries(sheet.headers.map((h, i) => [h, r[i]])));
}

export function accentOf(el) {
  const v = getComputedStyle(el).getPropertyValue('--accent').trim();
  return v || '#3AA0FF';
}

/* Lee una CSS var del contenedor (con fallback). Permite que cada módulo defina
   sus propias tonalidades (p. ej. Decisión sobrescribe --gain/--loss a naranjas)
   y que el gráfico las herede en vez de hardcodear verde/rojo. */
export function cssVar(el, name, fallback) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

const INK = '#E4EAEF';
const INK_DIM = '#94A1AC';
const INK_FAINT = '#5C6873';
const GAIN = '#3FA76E';   // ganancias / alegría (semántico, coherente con --gain del CSS)
const LOSS = '#E5484D';   // pérdidas / dolor (coherente con --loss del CSS)
const LINE = 'rgba(228,234,239,0.10)';
const FONT = 'Hanken Grotesk, system-ui, sans-serif';
const DISPLAY = 'Spectral, Georgia, serif';
const MONO = 'IBM Plex Mono, ui-monospace, monospace';

/* ---------- Fuente de cada gráfico (pedido: todo gráfico cita su dataset) ---------- */
const SOURCES = {
  '01_pato_conejo': 'Dataset: Percepción Biestable UTDT-2024 (n=412) · figura de Jastrow (1899).',
  '02_contexto_cambio': 'Dataset: Priming Contextual UTDT-2024 (n=412) · efecto de la pista previa.',
  '03_ilusiones_movimiento_waffle': 'Dataset: Encuesta de Movimiento Ilusorio (n=1.000) · “Rotating Snakes”, Kitaoka (2003).',
  '04_ilusion_auditiva': 'Dataset: Relevamiento de Audio Ambiguo (n=600) · estímulo “bici / alquiler”.',
  '04b_auditiva_con_pista': 'Dataset: Audio Ambiguo con texto-pista (n=600) · el rótulo previo sesga lo que se oye.',
  '05_cierre_percepcion': 'Dataset: Ceguera atencional — Simons & Chabris (1999), “gorilas invisibles”.',
  '05_confianza_precision': 'Dataset: Confianza vs. Acierto UTDT-2024 (n=1.120 respuestas).',
  '06_bate_pelota': 'Dataset: Cognitive Reflection Test (n=3.428) · Frederick (2005).',
  /* 07_aversion_perdidas: SIN cita en pantalla (pedido del usuario: se sacó el
     "Modelo: Teoría Prospectiva…" que quedaba superpuesto al gráfico). */
  '08_framing_enfermedad': 'Dataset: Problema de la Enfermedad Asiática (n=307) · Tversky & Kahneman (1981).',
  '09_dunning_kruger': 'Dataset: Habilidad Real vs. Autopercepción (n=84) · Kruger & Dunning (1999).',
  '10_mejor_que_promedio': 'Dataset: Encuesta “Mejor que el Promedio” · Svenson (1981) · Cross (1977).',
  '11_efecto_forer': 'Dataset: Validación de Perfiles Genéricos (n=39) · Forer (1948).',
  '11b_texto_barnum': 'Dataset: Técnicas de Lectura en Frío (efecto Barnum) · Forer (1948).',
  '12_pareidolia_paranormal': 'Dataset: Encuesta de Experiencias Paranormales (YouGov, 2021, n=1.000).',
  '13_brecha_consenso': 'Dataset: Brecha Ciencia–Público · Pew Research (2015) + Pulsar UBA (Argentina, 2023).',
  '14_fantasmas_embudo': 'Dataset: Creencia y experiencias paranormales · Módulo 13 (cátedra) + Ipsos Global Advisor (2018).',
  '14b_fantasmas_reportes': 'Dataset: Tipos de reporte “paranormal” · Módulo 13 — Sesgos (cátedra).',
};

/* Inserta la cita: usa el slot [data-src-for] de la sección si existe;
   si no, agrega un caption dentro/junto al contenedor del gráfico. */
export function addSource(container, id) {
  const text = SOURCES[id];
  if (!text) return;
  const section = container.closest('section');
  const slot = section && section.querySelector(`[data-src-for="${id}"]`);
  if (slot) { slot.textContent = text; return; }
  const p = document.createElement('p');
  p.textContent = text;
  const wrap = container.closest('.viz__chart');
  if (wrap) { p.className = 'chart-src'; wrap.appendChild(p); }
  else { p.className = 'chart-src chart-src--static'; container.appendChild(p); }
}

function baseOption(accent) {
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: FONT, color: INK_DIM },
    color: [accent],
    tooltip: {
      trigger: 'item', confine: true,
      backgroundColor: 'rgba(13,17,21,0.96)', borderColor: 'rgba(228,234,239,0.14)', borderWidth: 1,
      padding: [11, 15], textStyle: { color: INK, fontSize: 14.5, fontFamily: FONT },
      extraCssText: 'border-radius:10px; max-width:300px; white-space:normal; line-height:1.55;',
    },
  };
}

/* Título + subtítulo dentro del gráfico (como cualquier gráfico). */
function titleBlock(text, subtext) {
  return {
    text, subtext, left: 'center', top: 10,
    textStyle: { color: INK, fontFamily: DISPLAY, fontWeight: 600, fontSize: 28, overflow: 'truncate' },
    subtextStyle: { color: INK_DIM, fontFamily: FONT, fontSize: 16, overflow: 'truncate' },
    itemGap: 9,
  };
}

function catAxis(extra = {}) {
  return { type: 'category', axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, axisLabel: { color: INK, fontSize: 16, fontWeight: 500 }, ...extra };
}
function valAxis(extra = {}) {
  return { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: LINE } }, axisLabel: { color: INK_DIM, fontSize: 14 }, ...extra };
}

export function mountChart(container, option, opts = {}) {
  const chart = echarts.init(container, null, { renderer: 'canvas' });
  if (opts.reduced) option = { ...option, animation: false };
  chart.setOption(option);
  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(container);
  container.__chart = chart;
  return chart;
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* =====================================================================
   REGISTRO DE GRÁFICOS — clave = data-chart del HTML / hoja del JSON.
   ===================================================================== */
export const CHARTS = {
  /* ---------- G1 · Pato vs conejo (E1) — HTML, las barras crecen con el scroll ----------
     Sin ejes: solo las dos barras (juntas), el % arriba contando de 0 al esperado. */
  '01_pato_conejo'(container, data, opts) {
    const rows = rowsToObjects(data['01_pato_conejo']);
    const max = Math.max(...rows.map((r) => r.porcentaje));
    container.classList.add('duo');
    const fmt = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
    const items = rows.map((r) => {
      const item = document.createElement('div');
      item.className = 'duo__item';
      item.dataset.k = r.respuesta.toLowerCase();
      item.innerHTML = `
        <div class="duo__track"><div class="duo__bar"></div><span class="duo__pct">0%</span></div>
        <span class="duo__name">${r.respuesta}</span>`;
      item.title = r.tooltip;
      container.appendChild(item);
      return { el: item, k: r.respuesta.toLowerCase(), pct: item.querySelector('.duo__pct'), track: item.querySelector('.duo__track'), value: r.porcentaje };
    });
    // Resalta (barra en acento) la barra elegida; sin elección, la más votada.
    container.__highlight = (animal) => {
      const key = String(animal || '').toLowerCase();
      items.forEach((it) => it.el.classList.toggle('duo__item--max', key ? it.k === key : it.value === max));
    };
    container.__highlight(null);
    let last = -1;
    container.__setDuo = (p) => {
      if (p === last) return;
      last = p;
      for (const it of items) {
        const v = it.value * p;
        it.track.style.setProperty('--p', (v / 100).toFixed(4));
        it.pct.textContent = fmt(v) + '%';
      }
    };
    container.__setDuo(opts.reduced ? 1 : 0);
  },

  /* ---------- G2 · Contexto antes/después (E2) — MISMAS barras que G1, que se VUELCAN con el scroll ----------
     Idéntico formato a G1 (dos barras Pato/Conejo). Arranca en los valores de la
     primera mirada (= el gráfico anterior) y, al scrollear, las barras se vuelcan
     a la distribución CON la pista (26% / 74%): se ve el efecto directo del
     contexto sobre la percepción. Expone container.__setMorph(p). */
  '02_contexto_cambio'(container, data, opts) {
    const base = rowsToObjects(data['01_pato_conejo']);          // estado inicial = gráfico anterior
    const ctxRows = rowsToObjects(data['02_contexto_cambio']);
    const withCtx = ctxRows.find((r) => /^con/i.test(r.estado)) || ctxRows[ctxRows.length - 1];
    const pato0 = (base.find((r) => /pato/i.test(r.respuesta)) || {}).porcentaje ?? 57.5;
    const conejo0 = (base.find((r) => /conejo/i.test(r.respuesta)) || {}).porcentaje ?? 42.5;
    const pato1 = withCtx.ve_pato_pct, conejo1 = withCtx.ve_conejo_pct;   // 26 / 74
    const fmt = (v) => String(Math.round(v * 10) / 10).replace('.', ',');

    container.classList.add('duo-morph');
    container.innerHTML = `
      <p class="duo-morph__state"><span data-state-off>Primera mirada, sin pista</span><span data-state-on>Con la pista de contexto</span></p>
      <div class="duo">
        <div class="duo__item" data-k="pato">
          <div class="duo__track"><div class="duo__bar"></div><span class="duo__pct">0%</span></div>
          <span class="duo__name">Pato</span>
        </div>
        <div class="duo__item duo__item--max" data-k="conejo">
          <div class="duo__track"><div class="duo__bar"></div><span class="duo__pct">0%</span></div>
          <span class="duo__name">Conejo</span>
        </div>
      </div>`;
    const get = (k) => { const it = container.querySelector(`.duo__item[data-k="${k}"]`); return { track: it.querySelector('.duo__track'), pct: it.querySelector('.duo__pct') }; };
    const pato = get('pato'), conejo = get('conejo');
    // Resalta el animal REVELADO por el contexto (el otro al que elegiste).
    container.__highlight = (animal) => {
      const key = String(animal || 'conejo').toLowerCase();
      container.querySelectorAll('.duo__item').forEach((el) => el.classList.toggle('duo__item--max', el.dataset.k === key));
    };
    let last = -1;
    container.__setMorph = (p) => {
      p = Math.max(0, Math.min(1, p));
      if (p === last) return; last = p;
      const pv = pato0 + (pato1 - pato0) * p;
      const cv = conejo0 + (conejo1 - conejo0) * p;
      pato.track.style.setProperty('--p', (pv / 100).toFixed(4)); pato.pct.textContent = fmt(pv) + '%';
      conejo.track.style.setProperty('--p', (cv / 100).toFixed(4)); conejo.pct.textContent = fmt(cv) + '%';
      container.classList.toggle('is-on', p >= 0.5);
    };
    container.__setMorph(opts.reduced ? 1 : 0);
  },

  /* ---------- G3 · Waffle (E3) — grilla 10×10 que se PINTA con el scroll ----------
     100 personitas GRISES, grandes y quietas desde el arranque (NO crecen). Con el
     scroll se pintan de a una en celeste hasta llegar a las `onTotal` (96) que ven
     movimiento; las 4 restantes quedan grises. Expone __setWaffle(p) (lo scrubea main.js). */
  '03_ilusiones_movimiento_waffle'(container, data, opts) {
    const sheet = data['03_ilusiones_movimiento_waffle'];
    const accent = accentOf(container);
    const onTotal = sheet.resumen.ven_movimiento;  // 96
    const dim = 'rgba(120,134,146,0.55)';
    container.classList.add('morphwaffle');
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `${onTotal} de 100 personas ven movimiento donde no lo hay.`);
    container.innerHTML = '<canvas class="morphwaffle__cv"></canvas>';
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = 100, cols = 20;   // 20×5 = rectángulo ancho (usa el espacio horizontal)
    let W = 0, H = 0, cells = [], cellSize = 0, lastP = opts.reduced ? 1 : 0;

    // Dibuja una "personita" (cabeza + torso) centrada en (x,y), alto ≈ h.
    function person(x, y, h, color) {
      const head = h * 0.30, bw = h * 0.52, bh = h * 0.56;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y - h * 0.30, head / 2, 0, Math.PI * 2);   // cabeza
      ctx.fill();
      const top = y - h * 0.06;                              // hombros
      ctx.beginPath();                                       // torso (cápsula)
      ctx.moveTo(x - bw / 2, top + bh);
      ctx.lineTo(x - bw / 2, top + bw * 0.45);
      ctx.quadraticCurveTo(x - bw / 2, top, x, top);
      ctx.quadraticCurveTo(x + bw / 2, top, x + bw / 2, top + bw * 0.45);
      ctx.lineTo(x + bw / 2, top + bh);
      ctx.closePath();
      ctx.fill();
    }

    function build() {
      // rectángulo 20×5 ancho y centrado: usa casi todo el ancho (sin llegar al margen)
      const rows = Math.ceil(N / cols);   // 5
      const cell = Math.min((W * 0.97) / cols, (H * 0.84) / rows);
      cellSize = cell;
      const gridW = cell * cols, gridH = cell * rows;
      const gx0 = W / 2 - gridW / 2 + cell / 2, gy0 = H / 2 - gridH / 2 + cell / 2;
      cells = [];
      for (let i = 0; i < N; i++) {
        const r = (i / cols) | 0, c = i % cols;
        cells.push({ x: gx0 + c * cell, y: gy0 + r * cell });
      }
    }
    function draw(p) {
      lastP = p; ctx.clearRect(0, 0, W, H);
      if (!W || !cells.length) return;
      const lit = Math.round(Math.max(0, Math.min(1, p)) * onTotal);  // 0 → 96 con el scroll
      const h = cellSize * 0.72;
      for (let i = 0; i < N; i++) {
        person(cells[i].x, cells[i].y, h, i < lit ? accent : dim);
      }
    }
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(); draw(lastP);
    };
    container.__setWaffle = (p) => draw(p);
    new ResizeObserver(resize).observe(canvas);
    requestAnimationFrame(resize);
  },

  /* ---------- G4 · Ilusión auditiva (E4) — ONDA FM (canvas), se estira con el scroll ----------
     Onda de radio FM: amplitud constante, frecuencia que varía. La señal es
     una sola; cada cerebro la "sintoniza" distinto. El tramo izquierdo (67%)
     va en el acento = bicicleta; el derecho (33%) en gris = alquiler. Expone
     container.__setFM(p): al scrollear, las ondas se ALARGAN. */
  '04_ilusion_auditiva'(container, data, opts) {
    const rows = rowsToObjects(data['04_ilusion_auditiva']);
    const accent = accentOf(container);
    const second = INK;   // alquiler en blanco (antes gris tenue, costaba leerlo)
    const bici = rows.find((r) => /Bicicleta/i.test(r.palabra_escuchada)) || rows[0];
    const alq = rows.find((r) => /Alquiler/i.test(r.palabra_escuchada)) || rows[1];
    const pBici = bici.porcentaje, pAlq = alq.porcentaje;
    const splitX = pBici / (pBici + pAlq);

    container.classList.add('fmwave');
    container.innerHTML = `
      <p class="fmwave__title">El mismo audio, dos estaciones</p>
      <p class="fmwave__sub">Una sola señal; cada cerebro la sintoniza distinto</p>
      <canvas class="fmwave__canvas"></canvas>
      <div class="fmdial">
        <div class="fmdial__seg fmdial__seg--bici" style="flex:${pBici}"><span>Bicicleta</span><b>${pBici}%</b></div>
        <div class="fmdial__seg fmdial__seg--alq"  style="flex:${pAlq}"><span>Alquiler</span><b>${pAlq}%</b></div>
      </div>`;
    const canvas = container.querySelector('.fmwave__canvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, lastP = opts.reduced ? 1 : 0;

    function draw(p) {
      lastP = p;
      ctx.clearRect(0, 0, W, H);
      if (!W || !H) return;
      const midY = H / 2, amp = H * 0.34;
      const base = 30 * (1 - 0.5 * p);   // menos ondas (más largas) al scrollear
      const depth = 0.62, sigCycles = 1.7;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, accent); grad.addColorStop(Math.max(0, splitX - 0.002), accent);
      grad.addColorStop(Math.min(1, splitX + 0.002), second); grad.addColorStop(1, second);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      let phase = 0; const step = 2;
      for (let x = 0; x <= W; x += step) {
        const t = x / W;
        const inst = base * (1 + depth * Math.sin(2 * Math.PI * sigCycles * t));
        phase += (inst / W) * step * 2 * Math.PI;
        const y = midY + amp * Math.sin(phase);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(228,234,239,0.16)'; ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(splitX * W, 8); ctx.lineTo(splitX * W, H - 8); ctx.stroke();
      ctx.setLineDash([]);
    }
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(lastP);
    };
    container.__setFM = (p) => draw(p);
    new ResizeObserver(resize).observe(canvas);
    requestAnimationFrame(resize);
  },

  /* ---------- G4b · Leer la palabra cambia lo que oís (E4) — claro: Con vs Sin contexto (suma 100) ---------- */
  '04b_auditiva_con_pista'(container, data, opts) {
    const rows = rowsToObjects(data['04b_auditiva_con_pista']);
    const accent = accentOf(container);
    // Orden asc por valor → la barra más alta queda arriba en eje categórico.
    const items = rows.map((r) => ({ label: r.condicion, value: r.porcentaje, nota: r.nota }))
      .sort((a, b) => a.value - b.value);
    const option = {
      ...baseOption(accent),
      title: titleBlock('El contexto decide lo que oís', '% que oye la palabra sugerida, con y sin pista de texto'),
      // Barras corridas a la izquierda: el espacio de la derecha queda libre para
      // el título de la escena (.pista-cap, a la derecha de la barra "sin contexto").
      grid: { left: 6, right: '50%', top: 56, bottom: 40, containLabel: true },
      xAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      yAxis: catAxis({ data: items.map((i) => i.label), axisLabel: { color: INK, fontSize: 15 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong>: ${p.value}%<br>${items[p.dataIndex].nota}` },
      series: [{
        type: 'bar', barWidth: '46%',
        // OJO: /Con/i matchea también "Sin CONtexto" → hay que anclar al inicio.
        // La barra CON pista va en acento; la SIN pista (15%) va en GRIS.
        data: items.map((i) => ({ value: i.value, itemStyle: { color: /^con/i.test(i.label) ? accent : 'rgba(148,161,172,0.55)', borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, formatter: '{c}%' },
        animationDuration: 1000, animationEasing: 'cubicOut', animationDelay: (i) => i * 150,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G5 · Cierre de Percepción — ceguera atencional (E5), ANILLO con scroll ----------
     Gráfico HTML: un anillo (conic-gradient) que se LLENA con el scroll hasta la
     mitad y un número gigante que cuenta de 0% al ≈50%. La materia es de gráficos
     y esto da impacto + scroll: quienes contaban pases, la mitad no vio al gorila
     (Simons & Chabris, 1999). Expone container.__setGorila(p). */
  '05_cierre_percepcion'(container, data, opts) {
    const rows = rowsToObjects(data['05_cierre_percepcion']);
    const accent = accentOf(container);
    const noVio = rows.find((r) => /no/i.test(r.grupo)) || rows[0];
    const target = noVio.porcentaje;   // 50
    container.classList.add('gorilla');
    container.style.setProperty('--accent', accent);
    // Solo el porcentaje: un anillo que se llena con el scroll y el número en el
    // centro. (Se sacaron la figura del gorila y los textos: el dato manda solo.)
    container.innerHTML = `
      <div class="gorilla__ring" style="--deg:0deg">
        <span class="gorilla__num">0%</span>
      </div>`;
    const ring = container.querySelector('.gorilla__ring');
    const num = container.querySelector('.gorilla__num');
    let last = -1;
    container.__setGorila = (p) => {
      const v = Math.round(Math.max(0, Math.min(1, p)) * target);
      if (v === last) return;
      last = v;
      ring.style.setProperty('--deg', (v / 100 * 360) + 'deg');
      num.textContent = v + '%';
      container.classList.toggle('is-full', v >= target);
    };
    container.__setGorila(opts.reduced ? 1 : 0);
  },

  /* ---------- G5 (viejo) · Confianza vs acierto — ya no se usa en E5 ---------- */
  '05_confianza_precision'(container, data, opts) {
    const rows = rowsToObjects(data['05_confianza_precision']);
    const accent = accentOf(container);
    const loss = '#E24B4A';
    const vals = rows.map((r) => r.aciertos_pct);
    const maxV = Math.max(...vals);
    const idxMax = vals.indexOf(maxV);
    const idxMaxConf = rows.length - 1;
    const option = {
      ...baseOption(accent),
      title: titleBlock('Más seguridad, menos acierto', 'Confianza declarada (1 a 5) frente al % de acierto'),
      grid: { left: 6, right: 28, top: 100, bottom: 24, containLabel: true },
      xAxis: catAxis({ data: rows.map((r) => `${r.nivel_confianza}/5`), boundaryGap: false, name: 'confianza declarada', nameLocation: 'middle', nameGap: 34, nameTextStyle: { color: INK_DIM } }),
      yAxis: valAxis({ min: 25, max: 55, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => `<strong>Confianza ${rows[ps[0].dataIndex].nivel_confianza}/5</strong><br>${rows[ps[0].dataIndex].tooltip}` },
      series: [{
        type: 'line', smooth: true, symbol: 'circle', symbolSize: 10, data: vals,
        lineStyle: { width: 3, color: accent }, itemStyle: { color: accent, borderColor: '#0A0D10', borderWidth: 2 },
        markPoint: {
          symbolSize: 13,
          label: { show: true, color: INK, fontFamily: DISPLAY, fontSize: 14, position: 'top', distance: 12, lineHeight: 15 },
          data: [
            { coord: [idxMax, vals[idxMax]], itemStyle: { color: accent }, label: { formatter: `el techo\n${vals[idxMax]}%` } },
            { coord: [idxMaxConf, vals[idxMaxConf]], itemStyle: { color: loss }, label: { position: 'left', distance: 16, formatter: `máx. confianza\n${vals[idxMaxConf]}%` } },
          ],
        },
        markLine: idxMaxConf !== idxMax ? { silent: true, symbol: 'none', label: { show: false }, lineStyle: { color: loss, type: 'dashed', width: 1 }, data: [{ xAxis: `${rows[idxMaxConf].nivel_confianza}/5` }] } : undefined,
        animationDuration: 1600, animationEasing: 'cubicOut',
      }],
    };
    mountChart(container, option, opts);
  },

  /* ===================== ACTO 2 · DECISIÓN (acento ámbar) ===================== */

  /* ---------- G6 · Bate y pelota (E6) — ESCENA con el scroll (sin título) ----------
     container.__setBate(p): las barras CRECEN (sin marcar) → una flecha señala la
     más elegida ($0,10) → esa se marca MAL (rojo) → se marca la CORRECTA ($0,05, ✓).
     El texto de cada momento vive en los pasos del HTML (scrubeado por #e6). */
  '06_bate_pelota'(container, data, opts) {
    const rows = rowsToObjects(data['06_bate_pelota']);
    const accent = accentOf(container);
    const loss = cssVar(container, '--loss', LOSS);
    const correct = '$0,05';
    const ordered = rows.slice().reverse();
    const etiBy = Object.fromEntries(rows.map((r) => [r.respuesta, r.etiqueta]));
    const maxV = Math.max(...ordered.map((r) => r.porcentaje));
    const mostResp = (ordered.find((r) => r.porcentaje === maxV) || {}).respuesta;   // $0,10
    const neutral = hexA(accent, 0.3);
    const option = {
      ...baseOption(accent), animation: false,
      grid: { left: 16, right: 130, top: 56, bottom: 44, containLabel: true },
      xAxis: valAxis({ max: 70, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      yAxis: catAxis({
        data: ordered.map((r) => r.respuesta),
        axisLabel: {
          formatter: (val) => `{p|${val}}\n{e|${etiBy[val]}}`,
          rich: { p: { fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: INK, lineHeight: 23 }, e: { fontSize: 13, color: INK_DIM, lineHeight: 15 } },
        },
      }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong> · ${etiBy[p.name] || ''}` },
      series: [{
        type: 'bar', barWidth: '58%',
        data: ordered.map(() => 0),
        itemStyle: { color: neutral, borderRadius: [0, 8, 8, 0] },
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, formatter: '{c}%' },
      }],
    };
    const chart = mountChart(container, option, opts);

    let last = -1;
    container.__setBate = (p) => {
      p = Math.max(0, Math.min(1, p));
      if (Math.abs(p - last) < 0.004) return; last = p;
      const grow = Math.max(0, Math.min(1, p / 0.2));   // las barras crecen
      const pointOn = p > 0.16 && p < 0.64;             // flecha a la más elegida
      const wrongOn = p > 0.4;                          // la más elegida se marca MAL (rojo)
      const correctOn = p > 0.62;                       // se marca la CORRECTA (✓)
      const dataArr = ordered.map((r) => {
        const isMost = r.respuesta === mostResp, isCorrect = r.respuesta === correct;
        let color = neutral;
        if (correctOn && isCorrect) color = accent;
        // Mientras la flecha señala la más elegida (1er texto), esa barra va en
        // NARANJA pleno; a partir del 2º texto vuelve al color neutro de las
        // últimas dos, para no sacarle el resalte a la correcta ($0,05).
        else if (isMost && pointOn && !wrongOn) color = accent;
        return {
          value: Math.round(r.porcentaje * grow),
          itemStyle: { color, borderRadius: [0, 8, 8, 0] },
          label: { formatter: (correctOn && isCorrect) ? '{c}%  ✓' : '{c}%', color: (correctOn && isCorrect) ? accent : INK },
        };
      });
      chart.setOption({ series: [{
        data: dataArr,
        markPoint: {
          symbol: 'arrow', symbolRotate: 90, symbolSize: pointOn ? [16, 22] : 0, symbolOffset: [40, 0],
          itemStyle: { color: wrongOn ? loss : accent }, label: { show: false }, animation: false, silent: true,
          data: pointOn ? [{ coord: [Math.round(maxV * grow), mostResp] }] : [],
        },
      }] }, false, true);
    };
    container.__setBate(opts.reduced ? 1 : 0);
  },

  /* ---------- G7 · Aversión a las pérdidas — BALANZA EMOCIONAL (E7) ----------
     Reemplaza la función de valor (con λ, poco intuitiva) por una balanza: dos
     barras que salen del centro ($50 en juego). La de ARRIBA es la alegría de
     ganar $50; la de ABAJO, el dolor de perder los mismos $50 → casi el doble.
     Sin jerga ("λ"): se lee de un vistazo. Usa la asimetría real de la curva. */
  '07_aversion_perdidas'(container, data, opts) {
    const sheet = data['07_aversion_perdidas'];
    const rows = rowsToObjects(sheet);
    const accent = accentOf(container);
    const gain = cssVar(container, '--gain', GAIN);   // tonalidad clara del módulo
    const loss = cssVar(container, '--loss', LOSS);   // tonalidad profunda del módulo
    const at = (m) => { const r = rows.find((x) => x.resultado_monetario === m); return r ? Math.abs(r.valor_subjetivo) : 0; };
    const joy = at(50) || 35;          // alegría de ganar $50
    const pain = at(-50) || 79;        // dolor de perder $50 (≈ 2,25× la alegría)
    // Mobile: barras más cortas (más lim) y rótulos/márgenes chicos para que entren en pantalla angosta.
    const narrow = container.clientWidth < 640;
    const lim = pain * (narrow ? 2.0 : 1.28);  // barras LARGAS (se nota el doble); deja sólo aire para los rótulos
    // El rótulo de cada barra es sólo el valor (−$50 / +$50); la frase narrativa
    // ("Perder $50 duele casi el doble…") la lleva la caption del stage (#e7Cap).
    const lblFor = (which) => (which === 'loss' ? '−$50' : '+$50');
    const numLbl = { fontFamily: DISPLAY, fontWeight: 700, fontSize: narrow ? 22 : 40, color: INK };
    const option = {
      ...baseOption(accent), animation: false,
      title: titleBlock('Perder pesa el doble que ganar', 'Cuánto pesa, para tu cerebro, ganar o perder los mismos $50'),
      // las dos barras quedan CENTRADAS verticalmente (grid simétrico); la caption va
      // arriba y la caja estática abajo (HTML del stage), sin tocar las barras.
      grid: narrow
        ? { left: 10, right: 10, top: '30%', bottom: '30%', containLabel: true }
        : { left: 90, right: 90, top: '32%', bottom: '32%', containLabel: true },
      xAxis: {
        type: 'value', min: -lim, max: lim,
        axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'category', data: ['Perdés $50', 'Ganás $50'],  // índice 0 = abajo
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false },
      },
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'item',
        formatter: (p) => (p.dataIndex === 1
          ? '<strong>Ganar $50</strong><br>Se siente bien… pero moderado.'
          : '<strong>Perder $50</strong><br>Duele casi el <strong>doble</strong> de lo que alegra ganarlos.'),
      },
      series: [{
        type: 'bar', barWidth: narrow ? 40 : 78,
        label: { show: true, ...numLbl },
        data: [
          { value: 0, itemStyle: { color: loss, borderRadius: [6, 0, 0, 6] },
            label: { position: 'left', formatter: '' } },
          { value: 0, itemStyle: { color: gain, borderRadius: [0, 6, 6, 0] },
            label: { position: 'right', formatter: '' } },
        ],
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: 'rgba(228,234,239,0.35)', type: 'dashed', width: 1.5 },
          label: { show: true, fontFamily: MONO, fontSize: 13 },
          data: [{ xAxis: 0, label: { position: 'insideEndTop', formatter: 'mismos $50', color: INK_DIM } }],
        },
      }],
    };
    const chart = mountChart(container, option, opts);

    // ----- Transición con SCROLL: la moneda dispara un "rayito" que dibuja la
    // barra de PÉRDIDA (abajo, grande) y después otro para la de GANANCIA (arriba,
    // chica). El número (−$50 / +$50) lo lleva el rayo hasta la punta. -----
    let lastP = -1;
    container.__setG7 = (p) => {
      p = Math.max(0, Math.min(1, p));
      if (p === lastP) return; lastP = p;
      const lossP = Math.min(1, p / 0.55);                 // primero la pérdida
      const gainP = Math.max(0, Math.min(1, (p - 0.5) / 0.5)); // después la ganancia
      const lossV = -pain * lossP, gainV = joy * gainP;
      // chispa en la punta de la barra que se está dibujando (el "rayito")
      const sparks = [];
      if (lossP > 0.02 && lossP < 0.999) sparks.push({ coord: [lossV, 'Perdés $50'], itemStyle: { color: '#fff', shadowBlur: 16, shadowColor: loss }, symbol: 'circle', symbolSize: 16 });
      if (gainP > 0.02 && gainP < 0.999) sparks.push({ coord: [gainV, 'Ganás $50'], itemStyle: { color: '#fff', shadowBlur: 16, shadowColor: gain }, symbol: 'circle', symbolSize: 16 });
      chart.setOption({ series: [{
        data: [
          { value: lossV, itemStyle: { color: loss, borderRadius: [6, 0, 0, 6] },
            label: { position: 'left', formatter: lossP > 0.6 ? lblFor('loss') : '' } },
          { value: gainV, itemStyle: { color: gain, borderRadius: [0, 6, 6, 0] },
            label: { position: 'right', formatter: gainP > 0.6 ? lblFor('gain') : '' } },
        ],
        markPoint: { data: sparks, animation: false, silent: true },
      }] });
    };
    container.__setG7(opts.reduced ? 1 : 0);
  },

  /* ---------- G8 · Encuadre / framing (E8) — el VUELCO, resaltado por paso ----------
     Es el MISMO plan seguro en los dos casos; lo único que cambia es si se
     cuenta en "vidas salvadas" o en "muertes". Las barras están SIEMPRE completas
     (no se scrubean); lo que sigue al TEXTO activo es el RESALTADO
     (container.__setG8Highlight('vidas'|'muertes'|null), lo llama tick()):
       · texto de lo seguro → grita el 72% (glow, la otra columna se atenúa);
       · texto de muertes → grita el desplome al 22% (+ el 78% saturado). */
  '08_framing_enfermedad'(container, data, opts) {
    const rows = rowsToObjects(data['08_framing_enfermedad']);
    const accent = accentOf(container);
    const gain = cssVar(container, '--gain', GAIN);   // tonalidad clara (plan seguro)
    const loss = cssVar(container, '--loss', LOSS);   // tonalidad profunda (plan arriesgado)
    const find = (f, o) => rows.find((r) => r.encuadre.includes(f) && r.opcion === o) || { porcentaje: 0, descripcion: '' };
    const items = [
      { label: 'Contado en\n«vidas salvadas»', seguro: find('vidas', 'Segura').porcentaje, descS: find('vidas', 'Segura').descripcion, descR: find('vidas', 'Riesgosa').descripcion },
      { label: 'Contado en\n«muertes»', seguro: find('muertes', 'Segura').porcentaje, descS: find('muertes', 'Segura').descripcion, descR: find('muertes', 'Riesgosa').descripcion },
    ];
    // Desktop: barras a la derecha, texto en columna izquierda. Mobile: full width + texto en banda inferior.
    const narrow = container.clientWidth < 640;
    const option = {
      ...baseOption(accent),
      // sin animación de entrada (el chart se pre-inicializa oculto), pero el
      // cambio de resaltado transiciona suave
      animation: true, animationDuration: 0, animationDurationUpdate: 400, animationEasingUpdate: 'cubicOut',
      title: titleBlock('El mismo plan, decisión opuesta', '% que elige el plan SEGURO vs. el arriesgado · según cómo se cuenta'),
      grid: narrow
        ? { left: 8, right: 16, top: 92, bottom: '42%', containLabel: true }
        : { left: '46%', right: '8%', top: 100, bottom: 40, containLabel: true },
      xAxis: catAxis({ data: items.map((i) => i.label), axisLabel: { color: INK, fontSize: 15, lineHeight: 17, interval: 0 } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => { const it = items[ps[0].dataIndex]; return `<strong>Plan seguro · ${it.seguro}%</strong> — ${it.descS}<br><strong>Plan arriesgado · ${100 - it.seguro}%</strong> — ${it.descR}`; },
      },
      legend: { data: ['Plan seguro', 'Plan arriesgado'], top: 70, textStyle: { color: INK_DIM, fontSize: 14, fontFamily: FONT }, icon: 'roundRect' },
      series: [
        {
          name: 'Plan seguro', type: 'bar', stack: 'f', barWidth: '52%', itemStyle: { color: gain },
          data: items.map((i) => ({ value: i.seguro, itemStyle: { color: gain, borderRadius: [6, 6, 0, 0] } })),
          label: { show: true, position: 'inside', color: '#0A0D10', fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, formatter: '{c}%' },
        },
        {
          name: 'Plan arriesgado', type: 'bar', stack: 'f', barWidth: '52%', itemStyle: { color: hexA(loss, 0.55) },
          data: items.map((i) => ({ value: 100 - i.seguro, itemStyle: { color: hexA(loss, 0.55) } })),
          label: { show: true, position: 'inside', color: INK, fontFamily: DISPLAY, fontWeight: 600, fontSize: 18, formatter: '{c}%' },
        },
      ],
    };
    const chart = mountChart(container, option, opts);

    // Resaltado que sigue al paso de texto activo (no hay scrub de barras).
    let lastHi = 'init';
    container.__setG8Highlight = (which) => {
      if (which === lastHi) return; lastHi = which;
      const hiV = which === 'vidas', hiM = which === 'muertes';
      const segData = items.map((it, i) => {
        const hi = (i === 0 && hiV) || (i === 1 && hiM);
        const dim = (hiV && i === 1) || (hiM && i === 0);
        const st = { color: gain, borderRadius: [6, 6, 0, 0], opacity: dim ? 0.3 : 1 };
        if (hi) { st.shadowBlur = 28; st.shadowColor = hexA(gain, 0.85); }
        return { value: it.seguro, itemStyle: st, label: { fontSize: hi ? 34 : 22 } };
      });
      const riskData = items.map((it, i) => {
        const hi = i === 1 && hiM;   // en «muertes», el 78% que arriesga también grita
        const dim = (hiV && i === 1) || (hiM && i === 0);
        const st = { color: hexA(loss, hi ? 0.9 : 0.55), opacity: dim ? 0.3 : 1 };
        if (hi) { st.shadowBlur = 22; st.shadowColor = hexA(loss, 0.7); }
        return { value: 100 - it.seguro, itemStyle: st, label: { fontSize: hi ? 24 : 18 } };
      });
      chart.setOption({ series: [{ data: segData }, { data: riskData }] }, false, true);
    };
    container.__setG8Highlight(null);
  },

  /* ---------- G9 · Dunning-Kruger (E9) — se DIBUJA con el scroll ----------
     Dos líneas: lo que la gente CREE que sabe (naranja, casi plana) vs. lo que
     REALMENTE sabe (gris, sube). A medida que bajás por la teórica, las líneas
     AVANZAN de "Peores" a "Mejores" (container.__setProgress(p)). En los peores
     la brecha es enorme: se creen mucho mejores de lo que son. */
  '09_dunning_kruger'(container, data, opts) {
    const rows = rowsToObjects(data['09_dunning_kruger']);
    const accent = accentOf(container);
    const real = rows.map((r) => r.competencia_real_pct);
    const self = rows.map((r) => r.autopercepcion_pct);
    const gap = Math.round(self[0] - real[0]);
    const labelFor = { 0: 'Peores', 1: '2º', 2: '3º', 3: 'Mejores' };
    // Densifico los 4 cuartiles (x = 0..3) a N puntos para que la línea avance suave.
    const N = 37;
    const dense = (arr) => Array.from({ length: N }, (_, i) => {
      const x = (i * 3) / (N - 1);
      const k = Math.min(2, Math.floor(x)); const t = x - k;
      return [x, +(arr[k] + (arr[k + 1] - arr[k]) * t).toFixed(2)];
    });
    const selfD = dense(self), realD = dense(real);
    const option = {
      ...baseOption(accent), animation: false,
      title: titleBlock('Los que menos saben, más se creen', 'Lo que la gente cree que sabe vs. lo que realmente sabe'),
      // las líneas ocupan la franja superior; el texto va en una BANDA INFERIOR (no las tapa).
      grid: { left: 10, right: 86, top: 96, bottom: '40%', containLabel: true },
      // icon 'line' → la leyenda dibuja CADA serie con su lineStyle: "creen"
      // como línea sólida naranja y "saben" como línea PUNTEADA gris (así la
      // leyenda indica que es la línea de puntos, no un bloque naranja).
      legend: { data: ['Lo que creen que saben', 'Lo que realmente saben'], top: 78, textStyle: { color: INK, fontSize: 15, fontFamily: FONT }, itemWidth: 36, itemHeight: 12, itemGap: 24, icon: 'line' },
      xAxis: {
        type: 'value', min: 0, max: 3, interval: 1,
        axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, splitLine: { show: false },
        axisLabel: { color: INK, fontSize: 15, formatter: (v) => labelFor[v] || '' },
      },
      yAxis: valAxis({ min: 0, max: 100, axisLabel: { formatter: '{value}', color: INK_DIM, fontSize: 14 }, name: 'nivel', nameTextStyle: { color: INK_DIM, fontSize: 13, align: 'left' } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => { const qi = Math.round(ps[0].data[0]); return `<strong>${labelFor[qi]}</strong><br>${rows[qi].tooltip}`; } },
      series: [
        {
          name: 'Lo que creen que saben', type: 'line', smooth: true, symbol: 'none', data: selfD,
          lineStyle: { width: 3.5, color: accent }, itemStyle: { color: accent }, z: 3,
          endLabel: { show: true, formatter: 'CREEN', color: accent, fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, distance: 10 },
          markLine: {
            silent: true, symbol: ['none', 'arrow'], symbolSize: 7,
            lineStyle: { color: accent, width: 1.5, opacity: 0.6 },
            label: { show: true, position: 'middle', formatter: `se creen\n+${gap} pts`, color: INK, fontFamily: FONT, fontSize: 13, lineHeight: 14, backgroundColor: 'rgba(10,13,16,0.85)', padding: [3, 5], borderRadius: 4 },
            data: [[{ coord: [0, real[0]] }, { coord: [0, self[0]] }]],
          },
        },
        {
          name: 'Lo que realmente saben', type: 'line', smooth: true, symbol: 'none', data: realD,
          lineStyle: { width: 3, color: INK_DIM, type: 'dashed' }, itemStyle: { color: INK_DIM },
          endLabel: { show: true, formatter: 'SABEN', color: INK_DIM, fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, distance: 10 },
        },
      ],
    };
    const chart = mountChart(container, option, opts);
    let lastK = -1;
    container.__setProgress = (p) => {
      const k = Math.max(1, Math.round(Math.max(0, Math.min(1, p)) * (N - 1)));
      if (k === lastK) return; lastK = k;
      chart.setOption({ series: [{ data: selfD.slice(0, k + 1) }, { data: realD.slice(0, k + 1) }] });
    };
    container.__setProgress(opts.reduced ? 1 : 0.0001);
  },

  /* ===================== ACTO 3 · SESGOS (acento violeta) ===================== */

  /* ---------- G10 · Mejor que el promedio (E10) — las barras se ESTIRAN con el scroll ----------
     El titular vive en el HTML (el texto que se corre a la izquierda), así que el gráfico
     NO lleva título. Un solo scrub container.__render(g, h) maneja el crecimiento de las
     barras (g) y el remarcado de la barra de "manejar" (h), llamado desde tick(). */
  '10_mejor_que_promedio'(container, data, opts) {
    const rows = rowsToObjects(data['10_mejor_que_promedio']);
    const accent = accentOf(container);
    const lbl = (r) => /EE\.UU\./.test(r.muestra) ? 'Manejar (EE.UU.)' : /Suecia/.test(r.muestra) ? 'Manejar (Suecia)' : r.dominio;
    const items = rows.map((r) => ({ label: lbl(r), value: r.pct_arriba_del_promedio, muestra: r.muestra, fuente: r.fuente }))
      .sort((a, b) => a.value - b.value); // asc: el más alto queda arriba (category pinta abajo→arriba)
    const barStyle = items.map((i) => ({ color: hexA(accent, 0.45 + 0.5 * (i.value / 100)), borderRadius: [0, 8, 8, 0] }));
    // Barra de "manejar" (el 93%): es la que se REMARCA antes de quedar sola.
    const driveIdx = items.reduce((best, it, i) => (/Manejar/i.test(it.label) && it.value > items[best].value ? i : best), 0);
    const option = {
      ...baseOption(accent),
      title: { show: false },     // el titular es el texto del HTML (lead), no compite
      grid: { left: 12, right: 92, top: '12%', bottom: '11%', containLabel: true },
      xAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      yAxis: catAxis({ data: items.map((i) => i.label), axisLabel: { fontSize: 15 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong> — ${items[p.dataIndex].value}%<br>${items[p.dataIndex].muestra} · ${items[p.dataIndex].fuente}` },
      series: [{
        type: 'bar', barWidth: '60%', animation: false,
        data: items.map((i, idx) => ({ value: 0, itemStyle: barStyle[idx] })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, formatter: (pm) => pm.value >= 1 ? Math.round(pm.value) + '%' : '' },
        markLine: { silent: true, symbol: 'none', lineStyle: { color: INK_DIM, type: 'dashed', width: 1.5 }, label: { show: true, formatter: '50%', position: 'end', color: INK_DIM, fontFamily: DISPLAY }, data: [{ xAxis: 50 }] },
      }],
    };
    const chart = mountChart(container, option, opts);
    // Un solo scrub (desde tick()): g = crecimiento de las barras (0→valor); h = remarcado
    // de la barra de "manejar" (color pleno + glow) mientras las demás se atenúan, justo
    // antes de que el gráfico se desvanezca y quede sólo esa barra (en el HTML).
    let lastKey = '';
    container.__render = (g, h) => {
      g = Math.max(0, Math.min(1, g)); h = Math.max(0, Math.min(1, h));
      const key = Math.round(g * 100) + ':' + Math.round(h * 100);
      if (key === lastKey) return; lastKey = key;
      chart.setOption({ series: [{ data: items.map((it, idx) => {
        const value = +(it.value * g).toFixed(1);
        if (idx === driveIdx) {
          const st = { ...barStyle[idx] };
          if (h > 0) { st.color = accent; st.shadowBlur = 22 * h; st.shadowColor = hexA(accent, 0.7); st.borderColor = accent; st.borderWidth = 2 * h; }
          return { value, itemStyle: st };
        }
        return { value, itemStyle: { ...barStyle[idx], opacity: 1 - 0.62 * h } };
      }) }] });
    };
    container.__render(opts.reduced ? 1 : 0, 0);
  },

  /* ---------- G11 · Lectura Barnum (E11, capa 0) — HTML ---------- */
  '11_lectura'(container, data) {
    const rows = rowsToObjects(data['11b_texto_barnum']);
    container.classList.add('reading');
    container.innerHTML = `<p class="reading__quote">${rows.map((r) => r.frase).join(' ')}</p>`;
  },

  /* ---------- G11 · Dato grande Forer (E11, capa 1) — HTML ---------- */
  '11_efecto_forer'(container, data) {
    const rows = rowsToObjects(data['11_efecto_forer']);
    const accent = accentOf(container);
    const main = rows[0];
    container.classList.add('bigstat');
    container.innerHTML = `
      <div class="bigstat__num" style="color:${accent}">${main.valor}</div>
      <p class="bigstat__cap">${main.detalle}</p>
      <ul class="bigstat__list">
        ${rows.slice(1).map((r) => `<li><strong>${r.valor}</strong> · ${r.item}</li>`).join('')}
      </ul>`;
  },

  /* ---------- G11b · Texto Barnum anotado (E11, capa 2) — HTML ----------
     Cada frase del texto "tuyo" + el truco de lectura en frío que la hace
     parecer personal. Rediseñado a tarjetas numeradas legibles (la frase en
     Spectral, el truco con una etiqueta clara), en vez de una lista apretada. */
  '11b_texto_barnum'(container, data) {
    const rows = rowsToObjects(data['11b_texto_barnum']);
    container.classList.add('annotated');
    container.innerHTML = `
      <p class="annotated__head">Cada frase usa un truco distinto</p>
      ${rows.map((r, i) => `
        <div class="annotated__item">
          <span class="annotated__n">${i + 1}</span>
          <div class="annotated__body">
            <p class="annotated__frase">“${r.frase}”</p>
            <p class="annotated__tech"><span class="annotated__tag">El truco</span>${r.tecnica_lectura_en_frio}</p>
          </div>
        </div>`).join('')}`;
  },

  /* ---------- G12 · Pareidolia / paranormal (E12) ---------- */
  '12_pareidolia_paranormal'(container, data, opts) {
    const rows = rowsToObjects(data['12_pareidolia_paranormal']);
    const accent = accentOf(container);
    const ordered = rows.slice().sort((a, b) => a.pct_si - b.pct_si);
    const option = {
      ...baseOption(accent),
      title: titleBlock('Cuántos vivieron algo “paranormal”', 'Experiencias reportadas · cada una tiene explicación científica'),
      grid: { left: 16, right: 48, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: 50, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      yAxis: catAxis({ data: ordered.map((r) => r.experiencia), axisLabel: { color: INK, fontSize: 15, width: 250, overflow: 'break' } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong>: ${p.value}%<br><span style="color:${accent}">Explicación:</span> ${ordered[p.dataIndex].explicacion_cientifica}` },
      series: [{
        type: 'bar', barWidth: '56%',
        data: ordered.map((r) => ({ value: r.pct_si, itemStyle: { color: accent, borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, formatter: '{c}%' },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 120,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G13 · Brecha ciencia vs público (E13) — 3 etapas con el scroll ----------
     Relato en 3 momentos (container.__setBrecha(p), scrubeado por sectionProgress(#e13)):
       (1) crecen SOLO las barras de Ciencia (consenso alto);
       (2) crecen las de Público (más bajas);
       (3) aparecen los conectores punteados = la brecha entre ambas.
     Se quedan solo los temas de consenso fuerte (ciencia alta) para que la
     secuencia ciencia↑ / público↓ / brecha se lea limpia. */
  '13_brecha_consenso'(container, data, opts) {
    const rows = rowsToObjects(data['13_brecha_consenso']);
    const accent = accentOf(container);
    const lbl = (t) => ({
      'Cambio climático humano': 'Cambio\nclimático', 'Evolución humana': 'Evolución',
      'Transgénicos seguros': 'Transgénicos', 'Vacunas (seguras)': 'Vacunas',
    }[t] || t);
    const items = rows
      .map((r) => { const publico = r.pct_publico_arg != null ? r.pct_publico_arg : r.pct_publico_usa; return { tema: r.tema, ciencia: r.pct_cientificos, publico, brecha: r.pct_cientificos - publico }; })
      .filter((i) => i.ciencia >= 60);
    const cats = items.map((i) => lbl(i.tema));
    const publicoCol = hexA(accent, 0.34);
    // Desktop: el gráfico vive en el ~58% derecho y el texto en columna izquierda.
    // Mobile: no hay lugar para columna → full width arriba y el texto en banda inferior.
    const narrow = container.clientWidth < 640;
    const option = {
      ...baseOption(accent),
      title: titleBlock('La ciencia dice una cosa; la gente, otra', 'Consenso científico vs. acuerdo del público (% de acuerdo)'),
      grid: narrow
        ? { left: 8, right: 16, top: 60, bottom: '46%', containLabel: true }
        : { left: '40%', right: 36, top: 74, bottom: 30, containLabel: true },
      legend: narrow
        ? { data: ['Ciencia', 'Público'], top: 28, textStyle: { color: INK_DIM, fontSize: 13, fontFamily: FONT }, icon: 'roundRect' }
        : { data: ['Ciencia', 'Público'], right: '5%', top: 30, textStyle: { color: INK_DIM, fontSize: 14, fontFamily: FONT }, icon: 'roundRect' },
      xAxis: catAxis({ data: cats, axisLabel: { color: INK, fontSize: 15, interval: 0, lineHeight: 16 } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 14 } }),
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => { const it = items[ps[0].dataIndex]; return `<strong>${it.tema}</strong><br>Ciencia: ${it.ciencia}% · Público: ${it.publico}%<br><span style="color:${accent}">Brecha:</span> ${it.brecha} pp`; },
      },
      series: [
        { name: 'Ciencia', type: 'bar', barWidth: '32%', data: items.map(() => 0), itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }, label: { show: false, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 15, formatter: '{c}%' },
          markLine: { silent: true, symbol: ['none', 'none'], lineStyle: { width: 0 }, data: [] } },
        { name: 'Público', type: 'bar', barWidth: '32%', data: items.map(() => 0), itemStyle: { color: publicoCol, borderRadius: [4, 4, 0, 0] }, label: { show: false, position: 'top', color: INK_DIM, fontFamily: DISPLAY, fontSize: 15, formatter: '{c}%' } },
      ],
    };
    const chart = mountChart(container, option, opts);

    let last = -1;
    container.__setBrecha = (p) => {
      p = Math.max(0, Math.min(1, p));
      if (Math.abs(p - last) < 0.004) return; last = p;
      const s1 = Math.max(0, Math.min(1, p / 0.32));          // Ciencia
      const s2 = Math.max(0, Math.min(1, (p - 0.36) / 0.30)); // Público
      const s3 = Math.max(0, Math.min(1, (p - 0.68) / 0.28)); // brecha
      const gapLines = s3 > 0.02 ? items.map((i) => ([
        { coord: [lbl(i.tema), i.publico] },
        { coord: [lbl(i.tema), i.ciencia], value: i.brecha },
      ])) : [];
      chart.setOption({ series: [
        {
          data: items.map((i) => Math.round(i.ciencia * s1)),
          label: { show: s1 > 0.05 },
          markLine: {
            silent: true, symbol: ['none', 'none'],
            lineStyle: { color: hexA(accent, 0.85 * s3), type: 'dashed', width: 2 },
            label: { show: s3 > 0.25, position: 'middle', color: accent, fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, formatter: (d) => `−${d.value}` },
            data: gapLines,
          },
        },
        { data: items.map((i) => Math.round(i.publico * s2)), label: { show: s2 > 0.05 } },
      ] }, false, true);
    };
    if (opts.reduced) container.__setBrecha(1);
  },

  /* ---------- G14 · El embudo de los fantasmas (Sesgos) — HTML, se arma con el scroll ----------
     De cada 100: 50 CREEN, 15 sintieron algo, 1 vio una aparición. El desplome
     50→1 es el dato: el cerebro infla la creencia mucho más allá de la experiencia
     real. Tres niveles que aparecen escalonados y cuentan con el scroll
     (container.__setFunnel(p), scrubeado en main.js). */
  '14_fantasmas_embudo'(container, data, opts) {
    const rows = rowsToObjects(data['14_fantasmas_embudo']);
    const accent = accentOf(container);
    const maxV = Math.max(...rows.map((r) => r.de_cada_100));   // 50
    container.classList.add('funnel');
    container.style.setProperty('--accent', accent);
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', 'De cada 100 personas, 50 creen en fantasmas, 15 dicen haber sentido algo y solo 1 vio una aparición.');
    container.innerHTML = `
      <p class="funnel__head">De cada <strong>100</strong> personas…</p>
      <div class="funnel__levels">
        ${rows.map((r, i) => `
          <div class="funnel__row" data-i="${i}" style="--w:${(r.de_cada_100 / maxV).toFixed(3)}">
            <span class="funnel__num">0</span>
            <div class="funnel__bar"></div>
            <p class="funnel__label"><strong>${r.etapa}</strong><span>${r.detalle}</span></p>
          </div>`).join('')}
      </div>`;
    const els = rows.map((_, i) => container.querySelector(`.funnel__row[data-i="${i}"]`));
    const nums = els.map((e) => e.querySelector('.funnel__num'));
    const vals = rows.map((r) => r.de_cada_100);
    const N = vals.length;
    let last = -1;
    container.__setFunnel = (p) => {
      p = Math.max(0, Math.min(1, p));
      if (p === last) return; last = p;
      els.forEach((row, i) => {
        const start = (i / (N + 0.4)) * 0.9;
        const a = Math.max(0, Math.min(1, (p - start) / 0.28));
        row.style.setProperty('--p', a.toFixed(3));
        nums[i].textContent = Math.round(vals[i] * a);
        row.classList.toggle('is-on', a > 0.02);
      });
    };
    container.__setFunnel(opts.reduced ? 1 : 0);
  },

  /* ---------- G14b · Tipos de reporte (Sesgos) — HTML ----------
     Lo que la gente "sintió" se reparte casi en tercios entre vista, oído y
     sensación corporal: el cerebro completa con CUALQUIER sentido. Cierra el
     puente con el módulo Percepción (la misma máquina, ahora inventando). */
  '14b_fantasmas_reportes'(container, data) {
    const rows = rowsToObjects(data['14b_fantasmas_reportes']);
    const ico = {
      Visual: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      Sonoro: '<path d="M3 10v4h4l5 5V5L7 10H3Z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
      Sensorial: '<path d="M8 13V5a2 2 0 0 1 4 0v6m0-1a2 2 0 0 1 4 0v3m0-1a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-3l-3-5a2 2 0 0 1 3-2l1 1"/>',
    };
    container.classList.add('thirds');
    container.innerHTML = `
      <p class="thirds__head">¿Qué forma toma ese <strong>“algo”</strong>?</p>
      <div class="thirds__grid">
        ${rows.map((r) => `
          <div class="thirds__cell" tabindex="0" aria-label="${r.tipo}: ${r.pct}%. ${r.ejemplos}">
            <span class="thirds__info" aria-hidden="true">i</span>
            <svg class="thirds__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico[r.tipo] || ''}</svg>
            <span class="thirds__pct">${r.pct}%</span>
            <strong>${r.tipo}</strong>
            <p class="thirds__tip">${r.ejemplos}</p>
          </div>`).join('')}
      </div>`;
  },
};
