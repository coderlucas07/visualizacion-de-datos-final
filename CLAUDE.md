# Tu cerebro no te cuenta toda la verdad — contexto del proyecto

> Este archivo lo lee Claude Code automáticamente al abrir el proyecto.
> Resume TODO el contexto para poder seguir el trabajo en otra máquina sin perder nada.

## Qué es
Sitio de **scrollytelling** (una sola historia, scroll nativo) para **Visualización de Datos (UTDT)**.
**Tesis:** el cerebro no registra la realidad, la construye; rellenar lo ambiguo aparece cuando vemos
(percepción), decidimos (neuroeconomía) y creemos (sesgos). **3 actos:** Percepción · Decisión · Sesgos.
**Idioma:** español rioplatense (voseo). **Estética:** oscura, editorial, inmersiva (tipo The Pudding /
Reuters en dark). NADA de laboratorio/HUD/sujeto/registro/personalización.

## Documentos que MANDAN (leerlos antes de tocar código)
- `prompt_claude_code.md` → especificación técnica, estética y estructura escena por escena.
- `propuesta_v2_storytelling.md` → storyboard con TODOS los textos y el orden exacto.
- `datos_visualizaciones.json` (en `/data`) → **motor de los 13 gráficos. NUNCA hardcodear números: leerlos del JSON.**
  Cada clave = una hoja con `headers` y `rows` (algunas con `resumen`, `params`, `nota`/`tooltip`).
  `datos_visualizaciones.xlsx` es la misma data por si hay que inspeccionarla.

## Cómo correr (necesita server estático; el fetch del JSON no anda con file://)
```
python3 -m http.server 8000     # en la carpeta del proyecto
# abrir http://localhost:8000
```

## Stack y estructura
HTML + CSS + JS vanilla con **módulos ES**. ECharts vía CDN para barras/líneas/curva.
**Waffle (E3) y motivo ruido→señal en Canvas/HTML, NO ECharts.**
```
index.html            portada + escenas (data-chart, data-reveal, data-act, data-noise)
css/styles.css        paleta, tipografías, layout, reveal, reduced-motion, responsive
js/main.js            loader JSON · IntersectionObserver (reveal + lazy-init) · motor de scroll · interacciones
js/charts.js          registro CHARTS[id](container, data, opts) + tema oscuro ECharts + helpers
js/noise.js           clase NoiseToSignal (Canvas): ruido que cuaja en figura
data/datos_visualizaciones.json
assets/               imágenes y audio (ver "Mapa de assets")
```

## Convenciones de arquitectura (respetarlas al sumar escenas)
- **Gráficos:** un `<div class="chart" data-chart="CLAVE_DEL_JSON">` en el HTML. En `js/charts.js`,
  `CHARTS['CLAVE'](container, data, opts)` lo construye. `main.js` hace **lazy-init** cuando entra al
  viewport (IntersectionObserver). Usar `rowsToObjects(sheet)` para pasar `{headers, rows}` a objetos.
- **Acento por acto:** la `<section data-act="perception|decision|bias">` define la variable CSS `--accent`
  (cian / ámbar / violeta). Los gráficos la leen con `accentOf(container)`. La barra de progreso también.
- **Revelado:** elementos con `data-reveal` aparecen con fade-up al entrar (clase `is-visible`).
- **Ruido→señal:** `<canvas data-noise="image|text|eye" data-src=... data-glyph=...>`. La clase `NoiseToSignal`
  muestrea la figura (imagen por luminancia / glifo de texto / función de dibujo) y la "cuaja" según el
  progreso de scroll de su sección. Reutilizable en portada e interludios.
- **Solo 2 interacciones** en todo el sitio: E1 (click Pato/Conejo) y E4 (play del audio + Bicicleta/Alquiler).
  Están en `setupInteractions()` de `main.js`. NO agregar más interactividad.
- **Accesibilidad:** `alt` en imágenes, `aria-label` en gráficos, foco visible, contraste alto,
  `prefers-reduced-motion` (muestra estados finales sin animación). Las interacciones NO gatean contenido.

## Paleta y tipografías
- Fondo `#0B0C10` / `#0E0F14`. Texto hueso `#E8E6E0`. Secundario `#A7A59E`.
- Acentos: Percepción `#3AA0FF` (cian) · Decisión `#FF8A3D` (ámbar) · Sesgos `#9B6BFF` (violeta).
- Curva de valor: pérdidas `#E24B4A` (rojo) / ganancias `#1D9E75` (verde).
- Fonts (Google): **Space Grotesk** (títulos) + **Inter** (cuerpo).

## Mapa de assets (nombres exactos, en /assets)
- Pato-conejo (E1/E2): `840_560.jpg`
- Rotating snakes (E3): `rotsnake-grayscale_custom-4b8924c1c70b79314017cd1200b900fc7d067758.gif`
- Audio ilusión auditiva (E4): `download.mp3`
- Pareidolia (E12): `450_1000.webp` (cara en pared), `blog_caras.jpg` (cara en Marte), `cafe-con-cara.jpg`
- Cierre: `Checker_shadow_illusion.svg`
- **Referencia de estilo G7** (curva de aversión): `aversion_referencia.jpeg` (copia sin espacios del
  WhatsApp original). Replicar ese estilo: pérdidas en rojo, ganancias en verde, marco de referencia en
  el origen, **λ = 2,25** anotado. Params en el JSON: `07_aversion_perdidas.params` (alpha=beta=0.88, lambda=2.25).

## Progreso por fases
- **Fase 1 — Scaffold: HECHA.** Estructura, CSS con paleta+fonts, motor de scroll, loader JSON, NoiseToSignal.
- **Fase 2 — Acto 1: HECHA.** Portada + apertura de acto + E1–E5 + Interludio A. Gráficos G1–G5 (incluye
  waffle HTML en E3, números grandes 70%/96, audio en E4, curva confianza G5). Las 2 interacciones funcionando.
- **Fase 3 — Acto 2: PENDIENTE.** E6 bate y pelota (`06_bate_pelota`) · E7 aversión a las pérdidas
  (`07_aversion_perdidas`, replicar `aversion_referencia.jpeg`) · E8 framing (`08_framing_enfermedad`,
  barras agrupadas 72% vs 22%) · E9 Dunning-Kruger (`09_dunning_kruger`) · Interludio B (ruido→ojo,
  `data-noise="eye"`, ya hay `drawEye()` en main.js). Acento ámbar (`data-act="decision"`).
- **Fase 4 — Acto 3: PENDIENTE.** E10 mejor que el promedio (`10_mejor_que_promedio`, línea ref 50%) ·
  E11 Forer/Barnum (`11_efecto_forer` dato 4,26/5 + `11b_texto_barnum` anotado) · E12 pareidolia
  (`12_pareidolia_paranormal` + las 3 imágenes) · E13 brecha con la ciencia (`13_brecha_consenso` + `13b`).
  Acento violeta (`data-act="bias"`). **Regla del acto: cada escena conecta explícitamente con una ilusión ya vista.**
- **Fase 5 — PENDIENTE.** Cierre (Checker Shadow, sin interacción) + pie (créditos, autores, materia, fuentes)
  + pulido responsive + performance.

## CORRECCIÓN DE COPY importante (E11)
En E11 (Forer/Barnum) la frase de conexión **NO** debe mencionar un triángulo (esa escena no existe).
Usar la conexión con las víboras de E3:
> "tu cerebro completó un texto vago con tu propia vida, igual que le agregó movimiento a una imagen que estaba quieta."

## Decisiones ya tomadas (no volver a preguntar salvo bloqueo real)
- "Revelar el otro animal" en E1: se hace con **anotaciones** que señalan los rasgos del animal opuesto
  (hay una sola imagen). Revisable si se prefiere otro tratamiento.
- Hay una **pantalla de apertura** por acto (estructura) y el **Interludio A va en ámbar** (teaser del Acto 2).
- Estética oscura/editorial, scroll nativo (sin hijack), lazy-init de cada gráfico, sin login ni storage del usuario.
