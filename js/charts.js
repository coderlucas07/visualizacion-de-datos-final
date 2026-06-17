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
  '07_aversion_perdidas': 'Modelo: Teoría Prospectiva (Kahneman & Tversky, 1979) · perder pesa ≈ el doble que ganar lo mismo.',
  '08_framing_enfermedad': 'Dataset: Problema de la Enfermedad Asiática (n=307) · Tversky & Kahneman (1981).',
  '09_dunning_kruger': 'Dataset: Habilidad Real vs. Autopercepción (n=84) · Kruger & Dunning (1999).',
  '10_mejor_que_promedio': 'Dataset: Encuesta “Mejor que el Promedio” · Svenson (1981) · Cross (1977).',
  '11_efecto_forer': 'Dataset: Validación de Perfiles Genéricos (n=39) · Forer (1948).',
  '11b_texto_barnum': 'Dataset: Técnicas de Lectura en Frío (efecto Barnum) · Forer (1948).',
  '12_pareidolia_paranormal': 'Dataset: Encuesta de Experiencias Paranormales (YouGov, 2021, n=1.000).',
  '13_brecha_consenso': 'Dataset: Brecha Ciencia–Público · Pew Research (2015) + Pulsar UBA (Argentina, 2023).',
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
      padding: [10, 14], textStyle: { color: INK, fontSize: 13, fontFamily: FONT },
      extraCssText: 'border-radius:10px; max-width:280px; white-space:normal; line-height:1.5;',
    },
  };
}

/* Título + subtítulo dentro del gráfico (como cualquier gráfico). */
function titleBlock(text, subtext) {
  return {
    text, subtext, left: 'center', top: 12,
    textStyle: { color: INK, fontFamily: DISPLAY, fontWeight: 600, fontSize: 24, overflow: 'truncate' },
    subtextStyle: { color: INK_DIM, fontFamily: FONT, fontSize: 14, overflow: 'truncate' },
    itemGap: 8,
  };
}

function catAxis(extra = {}) {
  return { type: 'category', axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, axisLabel: { color: INK, fontSize: 14, fontWeight: 500 }, ...extra };
}
function valAxis(extra = {}) {
  return { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: LINE } }, axisLabel: { color: INK_DIM, fontSize: 12 }, ...extra };
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
      item.className = 'duo__item' + (r.porcentaje === max ? ' duo__item--max' : '');
      item.innerHTML = `
        <div class="duo__track"><div class="duo__bar"></div><span class="duo__pct">0%</span></div>
        <span class="duo__name">${r.respuesta}</span>`;
      item.title = r.tooltip;
      container.appendChild(item);
      return { pct: item.querySelector('.duo__pct'), track: item.querySelector('.duo__track'), value: r.porcentaje };
    });
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

  /* ---------- G2 · Contexto antes/después (E2) ---------- */
  '02_contexto_cambio'(container, data, opts) {
    const rows = rowsToObjects(data['02_contexto_cambio']);
    const accent = accentOf(container);
    const option = {
      ...baseOption(accent),
      title: titleBlock('Con la pista, ves la otra figura', '% que logra ver el conejo: sin contexto vs. con la pista'),
      grid: { left: 6, right: 16, top: 100, bottom: 24, containLabel: true },
      xAxis: catAxis({ data: rows.map((r) => r.estado) }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong><br>${p.data.tip}` },
      series: [{
        type: 'bar', barWidth: '40%',
        data: rows.map((r, i) => ({ value: r.ve_conejo_pct, tip: `Ve conejo: ${r.ve_conejo_pct}%. ${r.nota}`, itemStyle: { color: i === rows.length - 1 ? accent : hexA(accent, 0.4), borderRadius: [8, 8, 0, 0] } })),
        label: { show: true, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, formatter: (p) => `${p.value}%` },
        animationDuration: 1200, animationEasing: 'cubicOut', animationDelay: (i) => i * 260,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G3 · Waffle 100 personas (E3) — HTML, se pinta con el scroll ---------- */
  '03_ilusiones_movimiento_waffle'(container, data, opts) {
    const sheet = data['03_ilusiones_movimiento_waffle'];
    const accent = accentOf(container);
    const onTotal = sheet.resumen.ven_movimiento;
    container.classList.add('waffle');
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `${onTotal} de 100 personas ven movimiento en una imagen estática.`);
    container.style.setProperty('--accent-on', accent);

    const cells = [];
    const frag = document.createDocumentFragment();
    sheet.rows.forEach((row) => {
      const cell = document.createElement('span');
      cell.className = 'waffle__cell';
      cell.dataset.eligible = row[1] === 1 ? '1' : '0';
      frag.appendChild(cell);
      cells.push(cell);
    });
    container.appendChild(frag);

    let lit = -1;
    container.__setWaffle = (p) => {
      const n = Math.max(0, Math.min(onTotal, Math.round(p * onTotal)));
      if (n === lit) return;
      lit = n;
      let count = 0;
      for (const c of cells) {
        if (c.dataset.eligible === '1') { const on = count < n; c.classList.toggle('on', on); if (on) count++; }
        else c.classList.remove('on');
      }
    };
    if (opts.reduced) container.__setWaffle(1);
  },

  /* ---------- G4 · Ilusión auditiva (E4) — ONDA FM (canvas), se estira con el scroll ----------
     Onda de radio FM: amplitud constante, frecuencia que varía. La señal es
     una sola; cada cerebro la "sintoniza" distinto. El tramo izquierdo (67%)
     va en el acento = bicicleta; el derecho (33%) en gris = alquiler. Expone
     container.__setFM(p): al scrollear, las ondas se ALARGAN. */
  '04_ilusion_auditiva'(container, data, opts) {
    const rows = rowsToObjects(data['04_ilusion_auditiva']);
    const accent = accentOf(container);
    const second = INK_DIM;
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
      grid: { left: 6, right: 64, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: items.map((i) => i.label), axisLabel: { color: INK, fontSize: 15 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong>: ${p.value}%<br>${items[p.dataIndex].nota}` },
      series: [{
        type: 'bar', barWidth: '46%',
        data: items.map((i) => ({ value: i.value, itemStyle: { color: /Con/i.test(i.label) ? accent : hexA(accent, 0.32), borderRadius: [0, 8, 8, 0] } })),
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
    container.innerHTML = `
      <p class="gorilla__title">La mitad no vio al gorila</p>
      <div class="gorilla__ring" style="--deg:0deg">
        <svg class="gorilla__icon" viewBox="0 0 64 64" aria-hidden="true">
          <path fill="currentColor" d="M32 8c-7 0-12 4-13 10-5 1-9 5-9 11 0 4 2 7 5 9 0 8 7 14 17 14s17-6 17-14c3-2 5-5 5-9 0-6-4-10-9-11-1-6-6-10-13-10Zm-9 21a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM24 44c2 2 5 3 8 3s6-1 8-3c-2 3-5 4-8 4s-6-1-8-4Z"/>
        </svg>
        <span class="gorilla__num">0%</span>
        <span class="gorilla__lbl">no vio al gorila</span>
      </div>
      <p class="gorilla__cap">De quienes contaban los pases, la mitad no registró un gorila que cruzó la pantalla y se golpeó el pecho.</p>`;
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
      yAxis: valAxis({ min: 25, max: 55, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => `<strong>Confianza ${rows[ps[0].dataIndex].nivel_confianza}/5</strong><br>${rows[ps[0].dataIndex].tooltip}` },
      series: [{
        type: 'line', smooth: true, symbol: 'circle', symbolSize: 10, data: vals,
        lineStyle: { width: 3, color: accent }, itemStyle: { color: accent, borderColor: '#0A0D10', borderWidth: 2 },
        markPoint: {
          symbolSize: 13,
          label: { show: true, color: INK, fontFamily: DISPLAY, fontSize: 12, position: 'top', distance: 12, lineHeight: 15 },
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

  /* ---------- G6 · Bate y pelota (E6) ---------- */
  '06_bate_pelota'(container, data, opts) {
    const rows = rowsToObjects(data['06_bate_pelota']);
    const accent = accentOf(container);
    const correct = '$0,05';
    const ordered = rows.slice().reverse();
    const etiBy = Object.fromEntries(rows.map((r) => [r.respuesta, r.etiqueta]));
    const option = {
      ...baseOption(accent),
      title: titleBlock('La respuesta que salta sola está mal', 'Las cuatro respuestas más elegidas · la correcta es $0,05'),
      grid: { left: 16, right: 56, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: 70, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({
        data: ordered.map((r) => r.respuesta),
        axisLabel: {
          formatter: (val) => `{p|${val}}\n{e|${etiBy[val]}}`,
          rich: { p: { fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: INK, lineHeight: 18 }, e: { fontSize: 11, color: INK_DIM, lineHeight: 14 } },
        },
      }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong> · ${p.data.eti}<br>${p.data.tip}` },
      series: [{
        type: 'bar', barWidth: '54%',
        data: ordered.map((r) => ({ value: r.porcentaje, eti: r.etiqueta, tip: r.tooltip, itemStyle: { color: r.respuesta === correct ? accent : hexA(accent, 0.32), borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, formatter: (p) => (p.name === correct ? `${p.value}%  ✓` : `${p.value}%`) },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 150,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G7 · Aversión a las pérdidas — BALANZA EMOCIONAL (E7) ----------
     Reemplaza la función de valor (con λ, poco intuitiva) por una balanza: dos
     barras que salen del centro ($50 en juego). La de ARRIBA es la alegría de
     ganar $50; la de ABAJO, el dolor de perder los mismos $50 → casi el doble.
     Sin jerga ("λ"): se lee de un vistazo. Usa la asimetría real de la curva. */
  '07_aversion_perdidas'(container, data, opts) {
    const sheet = data['07_aversion_perdidas'];
    const rows = rowsToObjects(sheet);
    const at = (m) => { const r = rows.find((x) => x.resultado_monetario === m); return r ? Math.abs(r.valor_subjetivo) : 0; };
    const joy = at(50) || 35;          // alegría de ganar $50
    const pain = at(-50) || 79;        // dolor de perder $50 (≈ 2,25× la alegría)
    const lim = pain * 1.95;           // deja aire en los extremos para los rótulos
    const option = {
      ...baseOption(GAIN),
      title: titleBlock('Perder pesa el doble que ganar', 'Cuánto pesa, para tu cerebro, ganar o perder los mismos $50'),
      grid: { left: 12, right: 12, top: 104, bottom: 30, containLabel: true },
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
        ...baseOption(GAIN).tooltip, trigger: 'item',
        formatter: (p) => (p.dataIndex === 1
          ? '<strong>Ganar $50</strong><br>Se siente bien… pero moderado.'
          : '<strong>Perder $50</strong><br>Duele casi el <strong>doble</strong> de lo que alegra ganarlos.'),
      },
      series: [{
        type: 'bar', barWidth: 44,
        label: {
          show: true, fontFamily: DISPLAY, fontSize: 14, lineHeight: 18,
          rich: {
            t: { fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: INK, lineHeight: 19 },
            g: { fontFamily: FONT, fontSize: 12, color: GAIN, lineHeight: 16 },
            l: { fontFamily: FONT, fontSize: 12, color: LOSS, lineHeight: 16 },
          },
        },
        data: [
          { value: -pain, itemStyle: { color: LOSS, borderRadius: [6, 0, 0, 6] },       // Perdés → izquierda
            label: { position: 'left', formatter: '{t|Perdés $50}\n{l|casi el DOBLE de dolor}' } },
          { value: joy, itemStyle: { color: GAIN, borderRadius: [0, 6, 6, 0] },          // Ganás → derecha
            label: { position: 'right', formatter: '{t|Ganás $50}\n{g|la alegría de ganar}' } },
        ],
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: 'rgba(228,234,239,0.35)', type: 'dashed', width: 1.5 },
          label: { show: true, fontFamily: MONO, fontSize: 11 },
          data: [
            { xAxis: 0, label: { position: 'insideEndTop', formatter: 'mismos $50', color: INK_DIM } },
            // línea espejo: hasta acá el dolor sería "igual" que la alegría; la barra
            // roja la pasa de largo → el resto es el dolor de más (lo hace el doble).
            { xAxis: -joy, lineStyle: { color: hexA(GAIN, 0.7), type: 'dashed', width: 1.5 },
              label: { position: 'insideEndBottom', formatter: 'igual que ganar', color: GAIN } },
          ],
        },
        animationDuration: 1300, animationEasing: 'elasticOut', animationDelay: (i) => i * 220,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G8 · Encuadre / framing (E8) — el VUELCO ----------
     Es el MISMO plan seguro en los dos casos; lo único que cambia es si se
     cuenta en "vidas salvadas" o en "muertes". El % que lo elige se desploma de
     72% a 22%. Dos barras (verde = vidas / rojo = muertes) lo dejan a la vista. */
  '08_framing_enfermedad'(container, data, opts) {
    const rows = rowsToObjects(data['08_framing_enfermedad']);
    const find = (f, o) => rows.find((r) => r.encuadre.includes(f) && r.opcion === o) || { porcentaje: 0, descripcion: '' };
    const items = [
      { label: 'Contado en\n«vidas salvadas»', value: find('vidas', 'Segura').porcentaje, color: GAIN, desc: find('vidas', 'Segura').descripcion },
      { label: 'Contado en\n«muertes»', value: find('muertes', 'Segura').porcentaje, color: LOSS, desc: find('muertes', 'Segura').descripcion },
    ];
    const option = {
      ...baseOption(GAIN),
      title: titleBlock('El mismo plan, decisión opuesta', '% que elige el plan SEGURO según cómo se cuenta el resultado'),
      grid: { left: '26%', right: '26%', top: 104, bottom: 40, containLabel: true },
      xAxis: catAxis({ data: items.map((i) => i.label), axisLabel: { color: INK, fontSize: 13, lineHeight: 17, interval: 0 } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: {
        ...baseOption(GAIN).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => { const it = items[ps[0].dataIndex]; return `<strong>Plan seguro</strong> · ${it.desc}<br>Lo elige el <strong>${it.value}%</strong>`; },
      },
      series: [{
        type: 'bar', barWidth: '58%',
        data: items.map((i) => ({ value: i.value, itemStyle: { color: i.color, borderRadius: [6, 6, 0, 0] } })),
        label: { show: true, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, formatter: '{c}%' },
        markLine: {
          silent: true, symbol: ['none', 'none'],
          lineStyle: { color: 'rgba(228,234,239,0.25)', type: 'dashed', width: 1 },
          label: { show: true, position: 'middle', formatter: 'mismo plan', color: INK_DIM, fontFamily: MONO, fontSize: 10 },
          data: [[{ coord: [0, items[0].value] }, { coord: [1, items[1].value] }]],
        },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 220,
      }],
    };
    mountChart(container, option, opts);
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
      grid: { left: 10, right: 86, top: 132, bottom: 30, containLabel: true },
      legend: { data: ['Lo que creen que saben', 'Lo que realmente saben'], top: 78, textStyle: { color: INK, fontSize: 15, fontFamily: FONT }, itemWidth: 26, itemHeight: 14, itemGap: 24, icon: 'roundRect' },
      xAxis: {
        type: 'value', min: 0, max: 3, interval: 1,
        axisLine: { lineStyle: { color: LINE } }, axisTick: { show: false }, splitLine: { show: false },
        axisLabel: { color: INK, fontSize: 12, formatter: (v) => labelFor[v] || '' },
      },
      yAxis: valAxis({ min: 0, max: 100, axisLabel: { formatter: '{value}', color: INK_DIM, fontSize: 12 }, name: 'nivel', nameTextStyle: { color: INK_DIM, fontSize: 11, align: 'left' } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => { const qi = Math.round(ps[0].data[0]); return `<strong>${labelFor[qi]}</strong><br>${rows[qi].tooltip}`; } },
      series: [
        {
          name: 'Lo que creen que saben', type: 'line', smooth: true, symbol: 'none', data: selfD,
          lineStyle: { width: 3.5, color: accent }, z: 3,
          endLabel: { show: true, formatter: 'CREEN', color: accent, fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, distance: 10 },
          markLine: {
            silent: true, symbol: ['none', 'arrow'], symbolSize: 7,
            lineStyle: { color: accent, width: 1.5, opacity: 0.6 },
            label: { show: true, position: 'middle', formatter: `se creen\n+${gap} pts`, color: INK, fontFamily: FONT, fontSize: 11, lineHeight: 14, backgroundColor: 'rgba(10,13,16,0.85)', padding: [3, 5], borderRadius: 4 },
            data: [[{ coord: [0, real[0]] }, { coord: [0, self[0]] }]],
          },
        },
        {
          name: 'Lo que realmente saben', type: 'line', smooth: true, symbol: 'none', data: realD,
          lineStyle: { width: 3, color: INK_DIM, type: 'dashed' },
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

  /* ---------- G10 · Mejor que el promedio (E10) ---------- */
  '10_mejor_que_promedio'(container, data, opts) {
    const rows = rowsToObjects(data['10_mejor_que_promedio']);
    const accent = accentOf(container);
    const lbl = (r) => /EE\.UU\./.test(r.muestra) ? 'Manejar (EE.UU.)' : /Suecia/.test(r.muestra) ? 'Manejar (Suecia)' : r.dominio;
    const items = rows.map((r) => ({ label: lbl(r), value: r.pct_arriba_del_promedio, muestra: r.muestra, fuente: r.fuente }))
      .sort((a, b) => a.value - b.value); // asc: el más alto queda arriba (category pinta abajo→arriba)
    const option = {
      ...baseOption(accent),
      title: titleBlock('Casi todos se creen por encima de la media', '% que se cree mejor que el promedio · la línea marca el 50% (lo posible)'),
      grid: { left: 16, right: 60, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: items.map((i) => i.label), axisLabel: { fontSize: 14 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong> — ${p.value}%<br>${items[p.dataIndex].muestra} · ${items[p.dataIndex].fuente}` },
      series: [{
        type: 'bar', barWidth: '58%',
        data: items.map((i) => ({ value: i.value, itemStyle: { color: hexA(accent, 0.45 + 0.5 * (i.value / 100)), borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, formatter: '{c}%' },
        markLine: { silent: true, symbol: 'none', lineStyle: { color: INK_DIM, type: 'dashed', width: 1.5 }, label: { show: true, formatter: '50%', position: 'end', color: INK_DIM, fontFamily: DISPLAY }, data: [{ xAxis: 50 }] },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 110,
      }],
    };
    mountChart(container, option, opts);
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

  /* ---------- G11b · Texto Barnum anotado (E11, capa 2) — HTML ---------- */
  '11b_texto_barnum'(container, data) {
    const rows = rowsToObjects(data['11b_texto_barnum']);
    const accent = accentOf(container);
    container.classList.add('annotated');
    container.innerHTML = rows.map((r) => `
      <div class="annotated__item">
        <p class="annotated__frase">“${r.frase}”</p>
        <p class="annotated__tech" style="color:${accent}">↳ ${r.tecnica_lectura_en_frio}</p>
      </div>`).join('');
  },

  /* ---------- G12 · Pareidolia / paranormal (E12) ---------- */
  '12_pareidolia_paranormal'(container, data, opts) {
    const rows = rowsToObjects(data['12_pareidolia_paranormal']);
    const accent = accentOf(container);
    const ordered = rows.slice().sort((a, b) => a.pct_si - b.pct_si);
    const option = {
      ...baseOption(accent),
      title: titleBlock('Cuántos vivieron algo “paranormal”', 'Experiencias reportadas · pasá el cursor para ver la explicación científica'),
      grid: { left: 16, right: 48, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: 50, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: ordered.map((r) => r.experiencia), axisLabel: { color: INK, fontSize: 13, width: 250, overflow: 'break' } }),
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

  /* ---------- G13 · Brecha ciencia vs público (E13) ---------- */
  '13_brecha_consenso'(container, data, opts) {
    const rows = rowsToObjects(data['13_brecha_consenso']);
    const accent = accentOf(container);
    const lbl = (t) => ({
      'Cambio climático humano': 'Cambio\nclimático', 'Evolución humana': 'Evolución', 'Transgénicos seguros': 'Transgénicos',
      'Vacunas (seguras)': 'Vacunas', "'La cura del cáncer está oculta'": '“Cura del\ncáncer oculta”',
    }[t] || t);
    const items = rows.map((r) => ({ tema: r.tema, ciencia: r.pct_cientificos, publico: r.pct_publico_arg != null ? r.pct_publico_arg : r.pct_publico_usa, brecha: r.brecha_pp, ben: r.beneficiario_del_hueco }));
    const option = {
      ...baseOption(accent),
      title: titleBlock('La ciencia dice una cosa; la gente, otra', '% de acuerdo: consenso científico vs. público · pasá el cursor: ¿quién se beneficia?'),
      grid: { left: 6, right: 16, top: 122, bottom: 30, containLabel: true },
      legend: { data: ['Ciencia', 'Público'], top: 78, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({ data: items.map((i) => lbl(i.tema)), axisLabel: { color: INK, fontSize: 12, interval: 0, lineHeight: 15 } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => { const it = items[ps[0].dataIndex]; return `<strong>${it.tema}</strong><br>Ciencia: ${it.ciencia}% · Público: ${it.publico}%<br>Brecha: ${it.brecha} pp<br><span style="color:${accent}">Se beneficia:</span> ${it.ben}`; },
      },
      series: [
        { name: 'Ciencia', type: 'bar', barWidth: '30%', data: items.map((i) => i.ciencia), itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 13, formatter: '{c}%' } },
        { name: 'Público', type: 'bar', barWidth: '30%', data: items.map((i) => i.publico), itemStyle: { color: hexA(accent, 0.32), borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: INK_DIM, fontFamily: DISPLAY, fontSize: 13, formatter: '{c}%' } },
      ],
    };
    mountChart(container, option, opts);
  },
};
