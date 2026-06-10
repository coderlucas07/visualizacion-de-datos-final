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
js/main.js            loader JSON · setupScrolly (motor de pasos sticky) · lazy-init por capa · scrub (ruido/waffle) · interacciones
js/charts.js          registro CHARTS[id](container, data, opts) + tema oscuro ECharts + helpers
js/noise.js           clase NoiseToSignal (Canvas): ruido que cuaja en figura
data/datos_visualizaciones.json
assets/               imágenes y audio (ver "Mapa de assets")
```

## Convenciones de arquitectura (respetarlas al sumar escenas)
- **Motor de scrollytelling (lo CENTRAL — el scroll es el protagonista):** cada escena de datos es una
  `<section class="scrolly">` con un **gráfico fijo** (`.scrolly__graphic`, `position:sticky`) y una columna
  de **pasos de texto** (`.step`) que scrollean. Cada `.step` lleva `data-layer="N"` que apunta a una capa del
  gráfico (`.viz__layer[data-layer="N"]`). `setupScrolly()` (main.js) usa un IntersectionObserver con franja
  central (`rootMargin:-45% 0 -45%`): cuando un paso cruza el centro, intercambia la capa visible y hace
  **lazy-init del gráfico de esa capa** (anima al entrar). Varios pasos pueden compartir capa (cambia el texto,
  el gráfico queda). Desktop = 2 columnas (texto izq / gráfico der). Mobile = gráfico sticky arriba, pasos debajo.
  **Patrón para sumar escenas del Acto 2/3: copiar esta estructura, NO volver a las viejas `.scene`.**
- **Gráficos:** `<div class="chart" data-chart="CLAVE_DEL_JSON">` dentro de una `.viz__layer`. En `js/charts.js`,
  `CHARTS['CLAVE'](container, data, opts)` lo construye; se inicializa cuando su capa se activa. Usar
  `rowsToObjects(sheet)` para pasar `{headers, rows}` a objetos y `accentOf(container)` para el acento.
- **Acento por tramo (IMPLÍCITO, sin rótulos):** `data-act="perception|decision|bias"` setea `--accent`
  (cian/ámbar/violeta) y tiñe la barra de progreso. **NO se muestran títulos de "Acto" ni kickers de acto en
  pantalla** — la división en actos es organización interna nuestra, el lector ve una sola historia continua.
- **Waffle por scroll (E3):** el handler arma 100 celdas apagadas y expone `container.__setWaffle(p)`; `main.js`
  lo llama en `tick()` con el progreso del paso (`stepFill`) y las 96 personitas se pintan de a poco; el número
  (`#e3Count`) cuenta en vivo. Mismo recurso reutilizable si otra escena necesita "pintar con el scroll".
- **Ruido→señal:** `<canvas data-noise="image|text|eye" data-src=... data-glyph=...>`. La clase `NoiseToSignal`
  muestrea la figura (imagen por luminancia / glifo de texto / función de dibujo) y la "cuaja" según el
  progreso de scroll de su sección. Reutilizable en portada e interludios.
- **Revelado puntual:** elementos sueltos con `data-reveal` aparecen con fade-up al entrar (clase `is-visible`).
- **Interacciones:** E1 (Pato/Conejo) **guarda la respuesta y personaliza E2** (`configureE2`): la pista apunta
  al animal que NO viste (pato→conejo rota la figura 90° + chips Pascua/orejas/zanahoria; conejo→pato horizontal
  + estanque/pico/agua) y vuelve a preguntar (Sí/No). E4 (play audio + Bicicleta/Alquiler). **No se guarda nada
  del usuario**; las interacciones **NO gatean** contenido (todo se ve igual sin tocar). Están en `setupInteractions()`.
- **Accesibilidad:** `alt` en imágenes, `aria-label` en gráficos, foco visible, contraste alto,
  `prefers-reduced-motion` (estados finales sin animación; el waffle se llena solo, los pasos quedan legibles).

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
- **Fase 2 — Acto 1: HECHA y RECONSTRUIDA como scrollytelling real (jun-2026).** Portada + E1–E5 + Interludio A,
  ahora con el **motor de pasos sticky** (ver arriba), **sin pantallas de apertura de acto ni kickers de acto**.
  Ritmo situación-por-situación: en E1 primero ves la imagen y respondés, y recién al seguir scrolleando aparece
  el gráfico. E2 da la pista **personalizada** (al animal que no viste) y re-pregunta. E3 pinta el waffle con el
  scroll. Gráficos G1–G5 sin cambios de datos. **Este Acto 1 es el TEMPLATE para los Actos 2 y 3.**
- **Fase 3 — Acto 2: HECHA (jun-2026).** Mismo patrón scrolly que el Acto 1, acento ámbar (`data-act="decision"`).
  E6 bate y pelota (G6 `06_bate_pelota`, barras h.: trampa $0,10 apagada / correcta $0,05 en ámbar con ✓) ·
  E7 aversión (G7 `07_aversion_perdidas`: curva de valor roja/verde, ejes cruzando en el origen, glow hacia el
  cero, λ=2,25 contado en el texto del paso) · E8 framing (G8 `08_framing_enfermedad`, agrupadas: "elige lo
  seguro" cae 72%→22%) · E9 Dunning-Kruger (G9 `09_dunning_kruger`, 2 líneas: creen vs saben; conecta con E5).
  E6/E7/E8 abren con una **tarjeta de planteo** (`.statement`/`.gamble`) en la capa 0 y el gráfico aparece al
  scrollear. **Interludio B** (ruido→ojo, `data-noise="eye"`, `drawEye()`) en **violeta** (`data-act="bias"`),
  como teaser del Acto 3.
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
- **El scroll es el protagonista:** cada idea entra de a una con el scroll (motor sticky de pasos). NO volcar
  toda la info de una escena junta; NO usar las viejas `.scene` de dos bloques apilados.
- **Nada de actos explícitos en pantalla:** sin "Acto 1 / Percepción", sin kickers de acto. El color de acento
  cambia solo y los interludios hacen de puente. La división en actos es interna.
- **E1 → E2 personalizado:** E1 muestra la imagen y pregunta (sin "no hay respuesta correcta"). La respuesta se
  guarda en memoria (no se persiste) y E2 le da la pista del animal que le falta y re-pregunta (Sí/No). Si no
  respondió E1, E2 cae por default en pato→conejo. (Esto suma micro-interacción a las 2 originales; es a propósito.)
- **E3 waffle se pinta con el scroll** (no animación de un solo tiro).
- **Interludio A va en ámbar** (teaser del tramo siguiente). Estética oscura/editorial, scroll nativo (sin hijack),
  lazy-init por capa, sin login ni storage del usuario.
