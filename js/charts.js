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

  /* ---------- G3 · Waffle 100 personas (E3) — HTML, se pinta con el scroll ----------
     No anima solo: expone container.__setWaffle(p) y main.js lo llama con el
     progreso de scroll del paso, encendiendo de a poco las 96 personitas. */
  '03_ilusiones_movimiento_waffle'(container, data, opts) {
    const sheet = data['03_ilusiones_movimiento_waffle'];
    const accent = accentOf(container);
    const onTotal = sheet.resumen.ven_movimiento; // 96
    container.classList.add('waffle');
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `${onTotal} de 100 personas ven movimiento en una imagen estática.`);
    container.style.setProperty('--accent-on', accent);

    const cells = [];
    const frag = document.createDocumentFragment();
    sheet.rows.forEach((row) => {
      const cell = document.createElement('span');
      cell.className = 'waffle__cell';
      cell.dataset.eligible = row[1] === 1 ? '1' : '0'; // las primeras 96 pueden encenderse
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
        if (c.dataset.eligible === '1') {
          const on = count < n;
          c.classList.toggle('on', on);
          if (on) count++;
        } else {
          c.classList.remove('on');
        }
      }
    };

    // Con reduce-motion: mostrar el estado final (las 96) sin depender del scroll.
    if (opts.reduced) container.__setWaffle(1);
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
            // El último punto va pegado al borde: el label se ancla a la izquierda para no cortarse.
            { coord: [idxMaxConf, vals[idxMaxConf]], itemStyle: { color: loss },
              label: { position: 'left', distance: 16, formatter: `máx. confianza\n${vals[idxMaxConf]}%` } },
          ],
        },
        markLine: idxMaxConf !== idxMax ? {
          silent: true, symbol: 'none',
          label: { show: false },
          lineStyle: { color: loss, type: 'dashed', width: 1 },
          data: [{ xAxis: `${rows[idxMaxConf].nivel_confianza}/5` }],
        } : undefined,
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
    const ordered = rows.slice().reverse();          // category pinta abajo→arriba
    const etiBy = Object.fromEntries(rows.map((r) => [r.respuesta, r.etiqueta]));

    const option = {
      ...baseOption(accent),
      grid: { left: 16, right: 56, top: 10, bottom: 10, containLabel: true },
      xAxis: valAxis({ max: 70, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({
        data: ordered.map((r) => r.respuesta),
        axisLabel: {
          formatter: (val) => `{p|${val}}\n{e|${etiBy[val]}}`,
          rich: {
            p: { fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: INK, lineHeight: 18 },
            e: { fontSize: 11, color: INK_DIM, lineHeight: 14 },
          },
        },
      }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong> · ${p.data.eti}<br>${p.data.tip}` },
      series: [{
        type: 'bar',
        barWidth: '54%',
        data: ordered.map((r) => ({
          value: r.porcentaje, eti: r.etiqueta, tip: r.tooltip,
          itemStyle: { color: r.respuesta === correct ? accent : hexA(accent, 0.32), borderRadius: [0, 6, 6, 0] },
        })),
        label: {
          show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600,
          formatter: (p) => (p.name === correct ? `${p.value}%  ✓` : `${p.value}%`),
        },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 150,
      }],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G7 · Aversión a las pérdidas — función de valor (E7) ----------
     Réplica de aversion_referencia.jpeg: pérdidas en rojo / ganancias en verde,
     ejes cruzando en el origen (marco de referencia) y λ=2,25 contado en el texto. */
  '07_aversion_perdidas'(container, data, opts) {
    const sheet = data['07_aversion_perdidas'];
    const rows = rowsToObjects(sheet);
    const loss = '#E24B4A', gain = '#1D9E75';
    const lossPts = rows.filter((r) => r.resultado_monetario <= 0).map((r) => [r.resultado_monetario, r.valor_subjetivo]);
    const gainPts = rows.filter((r) => r.resultado_monetario >= 0).map((r) => [r.resultado_monetario, r.valor_subjetivo]);
    const grid05 = 'rgba(232,230,224,0.05)';

    const option = {
      ...baseOption(loss),
      grid: { left: 8, right: 18, top: 16, bottom: 28, containLabel: true },
      xAxis: {
        type: 'value', min: -110, max: 110, interval: 50,
        name: 'resultado monetario', nameLocation: 'middle', nameGap: 30, nameTextStyle: { color: INK_DIM, fontSize: 11 },
        axisLine: { show: true, lineStyle: { color: LINE } }, axisTick: { show: false },
        splitLine: { lineStyle: { color: grid05 } },
        axisLabel: { color: INK_DIM, fontSize: 11, formatter: (v) => (v > 0 ? `+$${v}` : `$${v}`) },
      },
      yAxis: {
        type: 'value', min: -130, max: 65, interval: 30,
        name: 'valor subjetivo', nameTextStyle: { color: INK_DIM, fontSize: 11, align: 'left' },
        axisLine: { show: true, lineStyle: { color: LINE } }, axisTick: { show: false },
        splitLine: { lineStyle: { color: grid05 } },
        axisLabel: { color: INK_DIM, fontSize: 11 },
      },
      tooltip: {
        ...baseOption(loss).tooltip, trigger: 'axis',
        formatter: (ps) => {
          const p = ps[0]; const x = p.data[0], y = p.data[1];
          const cuanto = x > 0 ? `Ganar $${x}` : x < 0 ? `Perder $${-x}` : 'Punto de referencia';
          return `<strong>${cuanto}</strong><br>vale ${y.toFixed(0)} en valor psicológico subjetivo.`;
        },
      },
      series: [
        {
          name: 'Pérdidas', type: 'line', smooth: true, symbol: 'none', data: lossPts,
          lineStyle: { width: 3.5, color: loss }, z: 3,
          areaStyle: { origin: 'auto', color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: hexA(loss, 0) }, { offset: 1, color: hexA(loss, 0.22) }] } },
          markLine: { silent: true, symbol: 'none', label: { show: false }, lineStyle: { color: 'rgba(232,230,224,0.28)', width: 1 }, data: [{ xAxis: 0 }, { yAxis: 0 }] },
          markPoint: {
            symbolSize: 8,
            data: [
              { coord: [-100, lossPts[0][1]], itemStyle: { color: loss }, label: { show: true, formatter: 'PÉRDIDAS', position: 'top', color: loss, fontFamily: DISPLAY, fontWeight: 600, fontSize: 12 } },
              { coord: [0, 0], itemStyle: { color: INK }, label: { show: true, formatter: 'marco de\nreferencia', position: 'bottom', distance: 8, color: INK_DIM, fontSize: 11, lineHeight: 13 } },
            ],
          },
          animationDuration: 1500, animationEasing: 'cubicOut',
        },
        {
          name: 'Ganancias', type: 'line', smooth: true, symbol: 'none', data: gainPts,
          lineStyle: { width: 3.5, color: gain }, z: 3,
          areaStyle: { origin: 'auto', color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: hexA(gain, 0.22) }, { offset: 1, color: hexA(gain, 0) }] } },
          markPoint: {
            symbolSize: 8,
            data: [
              { coord: [100, gainPts[gainPts.length - 1][1]], itemStyle: { color: gain }, label: { show: true, formatter: 'GANANCIAS', position: 'left', color: gain, fontFamily: DISPLAY, fontWeight: 600, fontSize: 12 } },
            ],
          },
          animationDuration: 1500, animationEasing: 'cubicOut',
        },
      ],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G8 · Encuadre / framing (E8) ---------- */
  '08_framing_enfermedad'(container, data, opts) {
    const rows = rowsToObjects(data['08_framing_enfermedad']);
    const accent = accentOf(container);
    const frames = ['Ganancia (vidas salvadas)', 'Pérdida (muertes)'];
    const find = (f, o) => rows.find((r) => r.encuadre === f && r.opcion === o) || { porcentaje: 0, descripcion: '' };
    const segura = frames.map((f) => find(f, 'Segura').porcentaje);
    const riesgosa = frames.map((f) => find(f, 'Riesgosa').porcentaje);

    const option = {
      ...baseOption(accent),
      grid: { left: 6, right: 16, top: 42, bottom: 30, containLabel: true },
      legend: { data: ['Elige lo seguro', 'Prefiere arriesgar'], top: 0, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({ data: ['Te lo cuentan en\nvidas salvadas', 'Te lo cuentan en\nmuertes'], axisLabel: { color: INK, fontSize: 13, lineHeight: 16, interval: 0 } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => {
          const i = ps[0].dataIndex;
          const seg = find(frames[i], 'Segura'), rie = find(frames[i], 'Riesgosa');
          return `<strong>${frames[i]}</strong><br>Seguro (${seg.descripcion}): ${seg.porcentaje}%<br>Arriesgar (${rie.descripcion}): ${rie.porcentaje}%`;
        },
      },
      series: [
        { name: 'Elige lo seguro', type: 'bar', barWidth: '30%', data: segura,
          itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, formatter: '{c}%' },
          animationDuration: 1100, animationDelay: (i) => i * 150 },
        { name: 'Prefiere arriesgar', type: 'bar', barWidth: '30%', data: riesgosa,
          itemStyle: { color: hexA(accent, 0.3), borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: 'top', color: INK_DIM, fontFamily: DISPLAY, fontSize: 14, formatter: '{c}%' },
          animationDuration: 1100, animationDelay: (i) => i * 150 + 80 },
      ],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G9 · Dunning-Kruger (E9) — misma forma que la curva de confianza (E5) ---------- */
  '09_dunning_kruger'(container, data, opts) {
    const rows = rowsToObjects(data['09_dunning_kruger']);
    const accent = accentOf(container);
    const cats = rows.map((r) => r.cuartil_real);
    const real = rows.map((r) => r.competencia_real_pct);
    const self = rows.map((r) => r.autopercepcion_pct);

    const option = {
      ...baseOption(accent),
      grid: { left: 10, right: 28, top: 42, bottom: 28, containLabel: true },
      legend: { data: ['Lo que creen que saben', 'Lo que realmente saben'], top: 0, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({ data: cats, boundaryGap: false,
        axisLabel: { color: INK, fontSize: 12, interval: 0, formatter: (v) => ({ 'Inferior (peores)': 'Peores', '2do cuartil': '2º', '3er cuartil': '3º', 'Superior (mejores)': 'Mejores' }[v] || v) },
        name: 'habilidad real (peor → mejor)', nameLocation: 'middle', nameGap: 32, nameTextStyle: { color: INK_DIM, fontSize: 11 } }),
      yAxis: valAxis({ min: 0, max: 100, axisLabel: { formatter: '{value}', color: INK_DIM, fontSize: 12 }, name: 'percentil', nameTextStyle: { color: INK_DIM, fontSize: 11, align: 'left' } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => `<strong>${ps[0].name}</strong><br>${rows[ps[0].dataIndex].tooltip}` },
      series: [
        {
          name: 'Lo que creen que saben', type: 'line', smooth: true, symbolSize: 9, data: self,
          lineStyle: { width: 3, color: accent }, itemStyle: { color: accent, borderColor: '#0B0C10', borderWidth: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: hexA(accent, 0.22) }, { offset: 1, color: hexA(accent, 0) }] } },
          animationDuration: 1400, animationEasing: 'cubicOut',
        },
        {
          name: 'Lo que realmente saben', type: 'line', smooth: true, symbolSize: 9, data: real,
          lineStyle: { width: 3, color: INK_DIM, type: 'dashed' }, itemStyle: { color: INK_DIM },
          animationDuration: 1400, animationEasing: 'cubicOut',
        },
      ],
    };
    mountChart(container, option, opts);
  },
};
