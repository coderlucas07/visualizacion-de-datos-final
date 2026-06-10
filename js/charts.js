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

const INK = '#E8E6E0';
const INK_DIM = '#A7A59E';
const LINE = 'rgba(232,230,224,0.10)';
const FONT = 'Inter, system-ui, sans-serif';
const DISPLAY = 'Space Grotesk, sans-serif';

function baseOption(accent) {
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: FONT, color: INK_DIM },
    color: [accent],
    tooltip: {
      trigger: 'item', confine: true,
      backgroundColor: 'rgba(16,17,22,0.96)', borderColor: 'rgba(232,230,224,0.14)', borderWidth: 1,
      padding: [10, 14], textStyle: { color: INK, fontSize: 13, fontFamily: FONT },
      extraCssText: 'border-radius:10px; max-width:280px; white-space:normal; line-height:1.5;',
    },
  };
}

/* Título + subtítulo dentro del gráfico (como cualquier gráfico). */
function titleBlock(text, subtext) {
  return {
    text, subtext, left: 'center', top: 14,
    textStyle: { color: INK, fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, overflow: 'truncate' },
    subtextStyle: { color: INK_DIM, fontFamily: FONT, fontSize: 15, overflow: 'truncate' },
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
  /* ---------- G1 · Pato vs conejo (E1) ---------- */
  '01_pato_conejo'(container, data, opts) {
    const rows = rowsToObjects(data['01_pato_conejo']);
    const accent = accentOf(container);
    const max = Math.max(...rows.map((r) => r.porcentaje));
    const ordered = rows.slice().reverse();
    const option = {
      ...baseOption(accent),
      title: titleBlock('Se reparten casi por la mitad', 'Qué vio la gente al mirar la figura por primera vez'),
      grid: { left: 6, right: 60, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: Math.ceil(max / 10) * 10, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: ordered.map((r) => r.respuesta), axisLabel: { fontSize: 18 } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong><br>${p.data.tip}` },
      series: [{
        type: 'bar', barWidth: '46%',
        data: ordered.map((r) => ({ value: r.porcentaje, tip: r.tooltip, itemStyle: { color: r.porcentaje === max ? accent : hexA(accent, 0.45), borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, formatter: (p) => `${p.value}%` },
        animationDuration: 1100, animationEasing: 'cubicOut', animationDelay: (i) => i * 180,
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
      title: titleBlock('Una pista, y la mayoría cambia', '% que ve el conejo, antes y después del contexto'),
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

  /* ---------- G4 · Ilusión auditiva (E4) ---------- */
  '04_ilusion_auditiva'(container, data, opts) {
    const rows = rowsToObjects(data['04_ilusion_auditiva']);
    const accent = accentOf(container);
    const max = Math.max(...rows.map((r) => r.porcentaje));
    const ordered = rows.slice().reverse();
    const option = {
      ...baseOption(accent),
      title: titleBlock('El mismo audio, distinta palabra', 'Qué escucha la gente al reproducir el mismo sonido'),
      grid: { left: 6, right: 40, top: 96, bottom: 24, containLabel: true },
      xAxis: valAxis({ max: 60, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      yAxis: catAxis({ data: ordered.map((r) => r.palabra_escuchada), axisLabel: { color: INK, fontSize: 14, width: 150, overflow: 'truncate' } }),
      tooltip: { ...baseOption(accent).tooltip, formatter: (p) => `<strong>${p.name}</strong><br>${p.data.tip}` },
      series: [{
        type: 'bar', barWidth: '50%',
        data: ordered.map((r) => ({ value: r.porcentaje, tip: r.tooltip, itemStyle: { color: r.porcentaje === max ? accent : hexA(accent, 0.45), borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: INK, fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, formatter: (p) => `${p.value}%` },
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
      title: titleBlock('La palabra que ves cambia lo que oís', 'Qué se oye según la palabra mostrada antes del audio'),
      grid: { left: 6, right: 16, top: 118, bottom: 24, containLabel: true },
      legend: { data: ['Oye “bicicleta”', 'Oye “alquiler”'], top: 74, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({ data: rows.map((r) => r.condicion), axisLabel: { color: INK, fontSize: 12, interval: 0, width: 130, overflow: 'break' } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (ps) => `<strong>${ps[0].name}</strong><br>${rows[ps[0].dataIndex].nota}` },
      series: [
        { name: 'Oye “bicicleta”', type: 'bar', data: rows.map((r) => r.ve_bicicleta_pct), itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }, animationDelay: (i) => i * 120 },
        { name: 'Oye “alquiler”', type: 'bar', data: rows.map((r) => r.ve_alquiler_pct), itemStyle: { color: hexA(accent, 0.4), borderRadius: [4, 4, 0, 0] }, animationDelay: (i) => i * 120 + 60 },
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
        lineStyle: { width: 3, color: accent }, itemStyle: { color: accent, borderColor: '#0B0C10', borderWidth: 2 },
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

  /* ---------- G7 · Aversión a las pérdidas — función de valor (E7) ----------
     Réplica de aversion_referencia.jpeg pero SIN sombras bajo la curva. */
  '07_aversion_perdidas'(container, data, opts) {
    const sheet = data['07_aversion_perdidas'];
    const rows = rowsToObjects(sheet);
    const loss = '#E24B4A', gain = '#1D9E75';
    const lossPts = rows.filter((r) => r.resultado_monetario <= 0).map((r) => [r.resultado_monetario, r.valor_subjetivo]);
    const gainPts = rows.filter((r) => r.resultado_monetario >= 0).map((r) => [r.resultado_monetario, r.valor_subjetivo]);
    const grid05 = 'rgba(232,230,224,0.05)';
    const option = {
      ...baseOption(loss),
      title: titleBlock('Perder pesa más que ganar', 'Valor psicológico de cada resultado monetario · λ = 2,25'),
      grid: { left: 8, right: 18, top: 100, bottom: 40, containLabel: true },
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
          markPoint: {
            symbolSize: 8,
            data: [{ coord: [100, gainPts[gainPts.length - 1][1]], itemStyle: { color: gain }, label: { show: true, formatter: 'GANANCIAS', position: 'left', color: gain, fontFamily: DISPLAY, fontWeight: 600, fontSize: 12 } }],
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
      title: titleBlock('La misma cuenta, decisión opuesta', '% que elige la opción segura, según cómo se enuncia'),
      grid: { left: 6, right: 16, top: 118, bottom: 30, containLabel: true },
      legend: { data: ['Elige lo seguro', 'Prefiere arriesgar'], top: 74, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({ data: ['Te lo cuentan en\nvidas salvadas', 'Te lo cuentan en\nmuertes'], axisLabel: { color: INK, fontSize: 13, lineHeight: 16, interval: 0 } }),
      yAxis: valAxis({ max: 100, axisLabel: { formatter: '{value}%', color: INK_DIM, fontSize: 12 } }),
      tooltip: {
        ...baseOption(accent).tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps) => { const i = ps[0].dataIndex; const seg = find(frames[i], 'Segura'), rie = find(frames[i], 'Riesgosa'); return `<strong>${frames[i]}</strong><br>Seguro (${seg.descripcion}): ${seg.porcentaje}%<br>Arriesgar (${rie.descripcion}): ${rie.porcentaje}%`; },
      },
      series: [
        { name: 'Elige lo seguro', type: 'bar', barWidth: '30%', data: segura, itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: INK, fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, formatter: '{c}%' }, animationDuration: 1100, animationDelay: (i) => i * 150 },
        { name: 'Prefiere arriesgar', type: 'bar', barWidth: '30%', data: riesgosa, itemStyle: { color: hexA(accent, 0.3), borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: INK_DIM, fontFamily: DISPLAY, fontSize: 14, formatter: '{c}%' }, animationDuration: 1100, animationDelay: (i) => i * 150 + 80 },
      ],
    };
    mountChart(container, option, opts);
  },

  /* ---------- G9 · Dunning-Kruger (E9) ---------- */
  '09_dunning_kruger'(container, data, opts) {
    const rows = rowsToObjects(data['09_dunning_kruger']);
    const accent = accentOf(container);
    const cats = rows.map((r) => r.cuartil_real);
    const real = rows.map((r) => r.competencia_real_pct);
    const self = rows.map((r) => r.autopercepcion_pct);
    const option = {
      ...baseOption(accent),
      title: titleBlock('Los que menos saben, más se creen', 'Habilidad real frente a la autopercepción, por cuartil'),
      grid: { left: 10, right: 28, top: 118, bottom: 28, containLabel: true },
      legend: { data: ['Lo que creen que saben', 'Lo que realmente saben'], top: 74, textStyle: { color: INK_DIM }, icon: 'roundRect' },
      xAxis: catAxis({
        data: cats, boundaryGap: false,
        axisLabel: { color: INK, fontSize: 12, interval: 0, formatter: (v) => ({ 'Inferior (peores)': 'Peores', '2do cuartil': '2º', '3er cuartil': '3º', 'Superior (mejores)': 'Mejores' }[v] || v) },
        name: 'habilidad real (peor → mejor)', nameLocation: 'middle', nameGap: 32, nameTextStyle: { color: INK_DIM, fontSize: 11 },
      }),
      yAxis: valAxis({ min: 0, max: 100, axisLabel: { formatter: '{value}', color: INK_DIM, fontSize: 12 }, name: 'percentil', nameTextStyle: { color: INK_DIM, fontSize: 11, align: 'left' } }),
      tooltip: { ...baseOption(accent).tooltip, trigger: 'axis', formatter: (ps) => `<strong>${ps[0].name}</strong><br>${rows[ps[0].dataIndex].tooltip}` },
      series: [
        { name: 'Lo que creen que saben', type: 'line', smooth: true, symbolSize: 9, data: self, lineStyle: { width: 3, color: accent }, itemStyle: { color: accent, borderColor: '#0B0C10', borderWidth: 2 }, animationDuration: 1400, animationEasing: 'cubicOut' },
        { name: 'Lo que realmente saben', type: 'line', smooth: true, symbolSize: 9, data: real, lineStyle: { width: 3, color: INK_DIM, type: 'dashed' }, itemStyle: { color: INK_DIM }, animationDuration: 1400, animationEasing: 'cubicOut' },
      ],
    };
    mountChart(container, option, opts);
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
