/* =====================================================================
   charts.js — registro de gráficos.
   Cada gráfico lee su data del JSON (nunca hardcodeado), se anima al
   entrar en viewport y toma el acento del acto desde el CSS.
   ECharts para barras/líneas/curvas; Canvas/HTML para waffle y números.
   ===================================================================== */

/* Convierte una hoja {headers, rows} en array de objetos por header. */
export function rowsToObjects(sheet) {
  if (!sheet || !sheet.headers || !sheet.rows) return [];
  return sheet.rows.map((r) =>
    Object.fromEntries(sheet.headers.map((h, i) => [h, r[i]]))
  );
}

/* Lee el acento activo del acto desde las variables CSS del contenedor. */
export function accentOf(el) {
  const v = getComputedStyle(el).getPropertyValue('--accent').trim();
  return v || '#3AA0FF';
}

/* Paleta base para tooltips/ejes en modo oscuro. */
const INK = '#E8E6E0';
const INK_DIM = '#A7A59E';
const LINE = 'rgba(232,230,224,0.10)';
const FONT = 'Inter, system-ui, sans-serif';
const DISPLAY = 'Space Grotesk, sans-serif';

/* Opción base compartida (sin título: lo da el texto de la escena). */
function baseOption(accent) {
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: FONT, color: INK_DIM },
    color: [accent],
    grid: { left: 6, right: 18, top: 24, bottom: 6, containLabel: true },
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'rgba(16,17,22,0.96)',
      borderColor: 'rgba(232,230,224,0.14)',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: INK, fontSize: 13, fontFamily: FONT },
      extraCssText: 'border-radius:10px; max-width:280px; white-space:normal; line-height:1.5;',
    },
  };
}

function catAxis(extra = {}) {
  return {
    type: 'category',
    axisLine: { lineStyle: { color: LINE } },
    axisTick: { show: false },
    axisLabel: { color: INK, fontSize: 14, fontWeight: 500 },
    ...extra,
  };
}
function valAxis(extra = {}) {
  return {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: LINE } },
    axisLabel: { color: INK_DIM, fontSize: 12 },
    ...extra,
  };
}

/* Monta una instancia de ECharts con resize automático y reduce-motion. */
export function mountChart(container, option, opts = {}) {
  const chart = echarts.init(container, null, { renderer: 'canvas' });
  if (opts.reduced) option = { ...option, animation: false };
  chart.setOption(option);
  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(container);
  container.__chart = chart;
  return chart;
}

/* Color hex (#RRGGBB) con alpha → rgba(). */
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* Número grande con count-up (respeta reduce-motion). */
function bigNumber(container, { value, suffix = '', label = '', accent, reduced }) {
  container.classList.add('bignum');
  const num = document.createElement('div');
  num.className = 'bignum__value';
  num.style.color = accent;
  const lab = document.createElement('div');
  lab.className = 'bignum__label';
  lab.textContent = label;
  container.append(num, lab);

  const isNum = typeof value === 'number';
  if (reduced || !isNum) {
    num.textContent = (isNum ? value : value) + suffix;
    return;
  }
  const dur = 1200;
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    num.textContent = Math.round(value * eased) + suffix;
    if (k < 1) requestAnimationFrame(step);
  })(performance.now());
}

/* =====================================================================
   REGISTRO DE GRÁFICOS — clave = data-chart del HTML / hoja del JSON.
   Firma: (container, data, opts) => void
   ===================================================================== */
export const CHARTS = {
  /* ---------- G1 · Pato vs conejo (E1) ---------- */
  '01_pato_conejo'(container, data, opts) {
    const rows = rowsToObjects(data['01_pato_conejo']);
    const accent = accentOf(container);
    const max = Math.max(...rows.map((r) => r.porcentaje));
    const ordered = rows.slice().reverse(); // category axis pinta de abajo→arriba

    const option = {
      ...baseOption(accent),
      grid: { left: 6, right: 28, top: 16, bottom: 10, containLabel: true },
      xAxis: valAxis({ max: Math.ceil(max / 10) * 10, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: ordered.map((r) => r.respuesta) }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong><br>${p.data.tip}` },
      series: [{
        type: 'bar',
        barWidth: '46%',
        data: ordered.map((r) => ({
          value: r.porcentaje,
          tip: r.tooltip,
          itemStyle: { color: r.porcentaje === max ? accent : hexA(accent, 0.45), borderRadius: [0, 6, 6, 0] },
        })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, formatter: (p) => `${p.value}%` },
        animationDuration: 1200, animationEasing: 'cubicOut', animationDelay: (i) => i * 180,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G2 · Contexto antes/después (E2) ---------- */
  '02_contexto_cambio'(container, data, opts) {
    const rows = rowsToObjects(data['02_contexto_cambio']);
    const accent = accentOf(container);
    const option = {
      ...baseOption(accent),
      grid: { left: 6, right: 16, top: 30, bottom: 10, containLabel: true },
      xAxis: catAxis({ data: rows.map((r) => r.estado) }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong><br>${p.data.tip}` },
      series: [{
        type: 'bar',
        barWidth: '42%',
        data: rows.map((r, i) => ({
          value: r.ve_conejo_pct,
          tip: `Ve conejo: ${r.ve_conejo_pct}%. ${r.nota}`,
          itemStyle: { color: i === rows.length - 1 ? accent : hexA(accent, 0.4), borderRadius: [6, 6, 0, 0] },
        })),
        label: { show: true, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, formatter: (p) => `${p.value}%` },
        animationDuration: 1200, animationEasing: 'cubicOut', animationDelay: (i) => i * 260,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G2 (titular) · 70% cambió (E2) ---------- */
  '02b_resumen_cambio'(container, data, opts) {
    const rows = rowsToObjects(data['02b_resumen_cambio']);
    const cambio = rows.find((r) => /cambi/i.test(r.categoria)) || rows[0];
    bigNumber(container, {
      value: cambio.porcentaje, suffix: '%',
      label: 'cambió lo que veía cuando apareció el contexto.',
      accent: accentOf(container), reduced: opts.reduced,
    });
  },

  /* ---------- G3 (remate) · 96 de cada 100 (E3) ---------- */
  '03_count'(container, data) {
    const r = data['03_ilusiones_movimiento_waffle'].resumen;
    container.classList.add('stat-line');
    container.innerHTML =
      `<span class="stat-line__num">${r.ven_movimiento} de cada 100</span> personas ven movimiento en una imagen estática.`;
  },

  /* ---------- G3 · Waffle 100 personas (E3) — Canvas/HTML, no ECharts ---------- */
  '03_ilusiones_movimiento_waffle'(container, data, opts) {
    const sheet = data['03_ilusiones_movimiento_waffle'];
    const accent = accentOf(container);
    const ven = sheet.resumen.ven_movimiento;
    container.classList.add('waffle');
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `${ven} de 100 personas ven movimiento en una imagen estática.`);
    container.style.setProperty('--accent-on', accent);

    const frag = document.createDocumentFragment();
    sheet.rows.forEach((row, i) => {
      const cell = document.createElement('span');
      cell.className = 'waffle__cell';
      if (row[1] === 1) {
        cell.classList.add('on');
        if (!opts.reduced) cell.style.setProperty('--d', (i * 11) + 'ms');
      }
      frag.appendChild(cell);
    });
    container.appendChild(frag);
    // dispara la animación de encendido en el próximo frame
    requestAnimationFrame(() => requestAnimationFrame(() => container.classList.add('is-on')));
  },

  /* ---------- G4 · Ilusión auditiva (E4) ---------- */
  '04_ilusion_auditiva'(container, data, opts) {
    const rows = rowsToObjects(data['04_ilusion_auditiva']);
    const accent = accentOf(container);
    const max = Math.max(...rows.map((r) => r.porcentaje));
    const ordered = rows.slice().reverse();
    const option = {
      ...baseOption(accent),
      grid: { left: 6, right: 34, top: 12, bottom: 10, containLabel: true },
      xAxis: valAxis({ max: 60, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: ordered.map((r) => r.palabra_escuchada), axisLabel: { color: INK, fontSize: 13, width: 120, overflow: 'truncate' } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong><br>${p.data.tip}` },
      series: [{
        type: 'bar', barWidth: '50%',
        data: ordered.map((r) => ({
          value: r.porcentaje, tip: r.tooltip,
          itemStyle: { color: r.porcentaje === max ? accent : hexA(accent, 0.45), borderRadius: [0, 6, 6, 0] },
        })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, formatter: (p) => `${p.value}%` },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 160,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G4b · Leer la palabra cambia lo que oís (E4) ---------- */
  '04b_auditiva_con_pista'(container, data, opts) {
    const rows = rowsToObjects(data['04b_auditiva_con_pista']);
    const accent = accentOf(container);
    const option = {
      ...baseOption(accent),
      grid: { left: 6, right: 16, top: 40, bottom: 10, containLabel: true },
      legend: { data: ['Oye “bicicleta”', 'Oye “alquiler”'], top: 0, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({ data: rows.map((r) => r.condicion), axisLabel: { color: INK, fontSize: 12, interval: 0, width: 110, overflow: 'break' } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => `<strong>${ps[0].name}</strong><br>${rows[ps[0].dataIndex].nota}`,
      },
      series: [
        { name: 'Oye “bicicleta”', type: 'bar', data: rows.map((r) => r.ve_bicicleta_pct),
          itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }, animationDelay: (i) => i * 120 },
        { name: 'Oye “alquiler”', type: 'bar', data: rows.map((r) => r.ve_alquiler_pct),
          itemStyle: { color: hexA(accent, 0.4), borderRadius: [4, 4, 0, 0] }, animationDelay: (i) => i * 120 + 60 },
      ],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G5 · Confianza vs acierto (E5) ---------- */
  '05_confianza_precision'(container, data, opts) {
    const rows = rowsToObjects(data['05_confianza_precision']);
    const accent = accentOf(container);
    const loss = '#E24B4A';
    const vals = rows.map((r) => r.aciertos_pct);
    const maxV = Math.max(...vals);
    const idxMax = vals.indexOf(maxV);
    const idxMaxConf = rows.length - 1; // confianza 5/5

    const option = {
      ...baseOption(accent),
      grid: { left: 6, right: 24, top: 40, bottom: 10, containLabel: true },
      xAxis: catAxis({ data: rows.map((r) => `${r.nivel_confianza}/5`), boundaryGap: false, name: 'Confianza declarada', nameLocation: 'middle', nameGap: 34, nameTextStyle: { color: INK_DIM } }),
      yAxis: valAxis({ min: 25, max: 55, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 }, name: '% de acierto', nameTextStyle: { color: INK_DIM, align: 'left' } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => `<strong>Confianza ${rows[ps[0].dataIndex].nivel_confianza}/5</strong><br>${rows[ps[0].dataIndex].tooltip}` },
      series: [{
        type: 'line', smooth: true, symbol: 'circle', symbolSize: 9,
        data: vals,
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent, borderColor: '#0B0C10', borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: hexA(accent, 0.28) }, { offset: 1, color: hexA(accent, 0) }] } },
        markPoint: {
          symbolSize: 13,
          label: { show: true, color: INK, fontFamily: DISPLAY, fontSize: 12, position: 'top', distance: 12, lineHeight: 15 },
          data: [
            { coord: [idxMax, vals[idxMax]], itemStyle: { color: accent }, label: { formatter: `el techo\n${vals[idxMax]}%` } },
            { coord: [idxMaxConf, vals[idxMaxConf]], itemStyle: { color: loss }, label: { formatter: `máx. confianza\n${vals[idxMaxConf]}%` } },
          ],
        },
        markLine: idxMaxConf !== idxMax ? {
          silent: true, symbol: 'none',
          lineStyle: { color: loss, type: 'dashed', width: 1 },
          data: [{ xAxis: `${rows[idxMaxConf].nivel_confianza}/5` }],
        } : undefined,
        animationDuration: 1600, animationEasing: 'cubicOut',
      }],
    };
    mountChart(container, option, opts);
  },
};
