# Tu cerebro no te cuenta toda la verdad — contexto del proyecto

> Este archivo lo lee Claude Code automáticamente al abrir el proyecto.
> Resume TODO el contexto para poder seguir el trabajo en otra máquina sin perder nada.

## ⚠️ REGLA DE EQUIPO — mantener este archivo actualizado (leer siempre)
Este `CLAUDE.md` es el **cerebro compartido** del grupo: es lo que mantiene a todos (personas y sus Claude Code)
en la misma página. **Si cambiás algo que mueve el estado del proyecto, actualizalo acá en el MISMO commit.**
- **Para Claude Code:** cuando termines una tarea que cambia el estado (sumás/cambiás una escena o un gráfico,
  tomás una decisión de diseño, tocás la arquitectura), **antes de cerrar** actualizá las secciones
  **"Progreso por fases"** y/o **"Decisiones ya tomadas"** (y el bloque "Estado actual" del `README.md`),
  y avisale al usuario que lo commitee y pushee junto con el código.
- **Para las personas:** `git pull` **antes** de empezar y `git push` **al terminar**. Si actualizaste el
  código pero no este archivo, el contexto del resto queda desactualizado → siempre van juntos.
- Si algo de acá ya no es cierto, corregilo (no agregues notas sueltas que se contradigan).

## ⚡ ACTUALIZACIÓN jun-2026 (4ª vuelta — Percepción) — MANDA sobre todo lo de abajo
- **REGLA DE DATOS (vale para SIEMPRE, todos los gráficos):** si un cambio de gráfico necesita tocar los
  números, **se actualiza el database**: primero `data/datos_visualizaciones.json` (es el motor: charts.js
  SIEMPRE lee de ahí, nunca hardcodear) y, si se puede, también `data/datos_visualizaciones.xlsx` (espejo
  para inspección). Nunca dejar el copy y el JSON diciendo cosas distintas.
- **Percepción ya NO es violeta:** usa el **celeste `#8FD8FF`** (el mismo azul del título de portada). Se logra
  **no** seteándole override en `setupModuleColors()` → hereda el `--accent` global. Decisión sigue cobalto, Sesgos carmesí.
- **Portada:** se sacó la pregunta "¿Y si nada de lo que ves…" (`.cover__q`) → título más impactante, menos texto.
  El **logo de Gemini** (abajo-derecha del video) se **enmascara** con `#coverPatch` (disco oscuro feather, lo
  posiciona `placeReplay()` en main.js con la misma cuenta de object-fit; siempre visible, no solo al final).
- **Portal 1 (Percepción) SIN espiral:** era mucha intro antes de los gráficos. Quedó como **título plano**
  (`.portal--plain`, 110vh, sin canvas/dot/after; head siempre visible). Portales 2 y 3 conservan el espiral.
- **G1 (pato/conejo):** el dato ya es Pato 57,5% / Conejo 42,5% → el copy dice "**más** lo ve pato que conejo"
  (NO "mitad y mitad").
- **E2 anotaciones AFUERA:** los puntos `.annot` siguen marcando la anatomía (giran con la imagen), pero los
  rótulos `.annot-label` viven en `.e2-figwrap` (NO rotan) y se ubican **fuera** del recuadro de la figura, con
  flecha. La pista nombra **orejas Y hocico** (antes solo orejas).
- **G2 (contexto):** título reescrito para que se entienda solo (% que pasa a ver la otra perspectiva con la pista).
- **E3 (snakes):** lede sin spoiler (se sacó "inventan movimiento"); el deszoom ya **no se pixela** (zoom máx
  ~3×, antes 200× → magnificaba el PNG y serruchaba; `tick()` usa `z = 1 + 2*(1-p)²`).
- **G post-audio (04b):** ahora **Con contexto 85% vs Sin contexto 15%** (suma 100). Cambió la hoja
  `04b_auditiva_con_pista` en el JSON y el handler (2 barras).
- **E5 (cierre Percepción):** el ≈50% del gorila se muestra como **gráfico real** (dona ECharts, `05_cierre_percepcion`
  reescrita a 2 grupos 50/50), una sola tarjeta de texto (se sacó el paso repetido y el texto-por-scroll) → pasa directo a Decisión.

## ⚡ ACTUALIZACIÓN jun-2026 (3ª vuelta de feedback) — MANDA sobre lo de más abajo
- **Color POR MÓDULO (no un acento único):** Percepción **púrpura `#9333EA`**, Decisión **azul cobalto `#2563EB`**,
  Sesgos **carmesí `#E11D48`**. Se setea `--accent` por sección en `setupModuleColors()` (main.js) y charts.js
  lo hereda con `accentOf`. La portada-video sigue celeste.
- **Espiral = hipnótico B&W** (como `espiral_referencia.jpg`), NO el túnel celeste: gira + zoom al centro hasta el
  negro; el **título del módulo aparece RECIÉN sobre el negro** (p>0.8), no sobre los colores del espiral. Portales 380vh.
- **Menú = drawer** que entra desde la izquierda y cierra al tocar afuera (ya no es overlay centrado).
- **Audio (E4):** el gráfico es una **onda de radio FM** (canvas, se estira con el scroll vía `__setFM`); datos 67/33
  (se sacó "otra"); los botones bici/alquiler van en la misma sección que el play; el "con pista" (04b) quedó con 2 barras.
- **Cierre de Percepción:** se reemplazó confianza/acierto (en percepción no hay "respuestas correctas") por
  **ceguera atencional** (`05_cierre_percepcion`: gorila invisible ≈50%, Simons & Chabris) + puente a Decisión.
- **Video del gorila (`#gorila`, antes de E5):** el test original de atención selectiva (Simons & Chabris,
  YouTube `vJG698U2Mvo`) **a pantalla completa**, intercalado entre E4 y E5 como SETUP del dato del cierre
  (consigna "contá los pases" → en E5 se revela que la mitad no ve al gorila). **Arranca solo** cuando la
  sección queda alineada al viewport: `setupGorila()` (main.js) carga el **IFrame API de YouTube** y un
  IntersectionObserver lo reproduce al superar el 90% de cobertura y lo pausa al salir. Empieza **muteado**
  (autoplay garantizado) con botón "Sonido" para el audio original; `controls:0` (inmersivo) salvo con
  `prefers-reduced-motion`, donde NO autoplaya y deja los controles nativos. El video es el 16:9 más grande
  que entra (franjas casi-negras que se funden con el fondo: no se recorta la entrada del gorila). Sumado a
  `setupModuleColors` (púrpura) y al menú.
- **E3:** se sacó el fondo rosa `#CF807F`; conserva la paleta oscura del sitio.
- **Decisión:** E6 con botones para responder + Sistema 1/2 + bate de madera (foto `bate y pelota.jpeg`); E7 intro
  "Ahora un juego" + el λ nombra **"aversión a las pérdidas"**; E8 el "600" con planteo claro + bifurcación vidas/muertes.
- **Sesgos:** nueva escena `sesgos-intro` ("¿Qué es un sesgo?" + diana de tiros sistemáticos) antes de E10.
- **E1:** una vez respondido, el estado sigue al scroll (arriba=imagen, abajo=gráfico): volver con el scroll no rompe.
- **E2:** gira **45°** (no 90°); rótulos alejados para no tapar la figura.
- **Fuentes** de cada gráfico reescritas como datasets con nombre realista (`SOURCES` en charts.js).
- **Teóricas** (Módulos 5/12/13 en PDF) commiteadas al repo. Para leerlas: `pip install --user pypdf` (poppler no está).

## Qué es
Sitio de **scrollytelling** (una sola historia, scroll nativo) para **Visualización de Datos (UTDT)**.
**Tesis:** el cerebro no registra la realidad, la construye; rellenar lo ambiguo aparece cuando vemos
(percepción), decidimos (neuroeconomía) y creemos (sesgos). **3 actos:** Percepción · Decisión · Sesgos.
**Idioma:** español rioplatense (voseo). **Estética:** oscura, editorial, inmersiva (tipo The Pudding /
"21hrs on the Moon"). NADA de laboratorio/HUD/sujeto/registro ni guardar datos del usuario (la pista de E2 se adapta
a lo que respondiste, pero no persiste nada).

## Documentos que MANDAN (leerlos antes de tocar código)
- `prompt_claude_code.md` → especificación técnica, estética y estructura escena por escena.
- `propuesta_v2_storytelling.md` → storyboard con TODOS los textos y el orden exacto.
> ⚠️ **OJO:** esos dos docs son la VISIÓN ORIGINAL; el proyecto evolucionó (layout full-bleed, portales de
> espiral, módulos con título, E2 que gira con el scroll, etc.). **Donde contradigan a este CLAUDE.md, manda
> CLAUDE.md.** Úsalos para el copy/storyboard y los datos, no para el layout ni las reglas viejas (p. ej. ya
> NO es "solo 2 interacciones" ni "sin actos en pantalla").
- `datos_visualizaciones.json` (en `/data`) → **motor de los 13 gráficos. NUNCA hardcodear números: leerlos del JSON.**
  Cada clave = una hoja con `headers` y `rows` (algunas con `resumen`, `params`, `nota`/`tooltip`).
  `datos_visualizaciones.xlsx` es la misma data por si hay que inspeccionarla.

## Cómo correr (necesita server estático; el fetch del JSON no anda con file://)
```
python3 serve.py            # server SIN CACHÉ + multi-hilo → http://localhost:8000
python3 serve.py 8090       # (opcional) otro puerto si el 8000 está ocupado
# abrir http://localhost:8000  →  con UN reload normal (Cmd/Ctrl+R) ya ves los cambios
```
> ⚠️ **Usar `serve.py`, NO `python -m http.server`.** El `http.server` deja que el navegador
> cachee CSS/JS viejos (parece que "no se aplican los cambios"). `serve.py` manda `Cache-Control:
> no-store`, así cada reload trae lo último sin levantar un server nuevo ni hacer hard-reload.

## Stack y estructura
HTML + CSS + JS vanilla con **módulos ES**. ECharts vía CDN para barras/líneas/curva.
**Waffle (E3) y motivo ruido→señal en Canvas/HTML, NO ECharts.**
```
index.html            portada + escenas (data-chart, data-reveal, data-act, data-noise)
css/styles.css        paleta, tipografías, layout, reveal, reduced-motion, responsive
js/main.js            loader JSON · setupScrolly (motor full-bleed) · setupSpiral · pre-init de charts · scrub (espiral/waffle/E2) · interacciones
js/charts.js          registro CHARTS[id](container, data, opts) + título/subtítulo + tema oscuro ECharts + helpers
js/noise.js           NoiseToSignal (ruido→señal) + SpiralPortal (espiral hipnótico de los portales de módulo)
data/datos_visualizaciones.json
assets/               imágenes y audio (ver "Mapa de assets")
```

## Convenciones de arquitectura (respetarlas al sumar escenas)
- **Motor de scrollytelling (lo CENTRAL — el scroll es el protagonista):** cada escena de datos es una
  `<section class="scrolly">` con **DOS COLUMNAS**: pasos de texto (`.scrolly__steps`, IZQUIERDA, scrollean)
  y **visual fija** (`.scrolly__graphic`, `position:sticky`, DERECHA). **El texto NUNCA tapa el visual**
  (pedido explícito del equipo, jun-2026; revierte el viejo full-bleed superpuesto). Cada `.step` lleva
  `data-layer="N"` que apunta a una capa (`.viz__layer[data-layer="N"]`). `setupScrolly()` (main.js) usa un
  IntersectionObserver con franja central (`rootMargin:-45% 0 -45%`): al cruzar el centro cambia la capa.
  Pasos largos: `.step--tall` (el texto queda **sticky** mientras el visual se anima, p. ej. E2).
  Los gráficos se **pre-inicializan** al cargar el JSON. **Patrón para sumar escenas: copiar esta estructura.**
- **Momentos full-bleed deliberados:** `.scrolly--bleed`. Hoy lo usa SOLO E3 (Rotating Snakes, jun-2026,
  **inmersión en rosa**): toda la escena es `#CF807F` (el color del centro de los círculos del PNG);
  entrás con un **notch negro** arriba (`.e3-notch`, clip-path) que **sube con el scroll normal**; con la
  pantalla toda rosa, el **título blanco** (sticky centrado, `#e3TitleCard`) **se desvanece** (scrub en
  `tick()`); después **salís (deszoom 14×→1×) del centro de un círculo** de la ilusión
  (`transform-origin: 62.5% 50%`, calibrado por píxeles al círculo más cercano al medio; CSS var
  `--snake-zoom`) hasta el tamaño final (`max-height:60vh`). El texto final va **sin chip**
  (`.step__card--final`): blanco, grande, sticky a media altura a la izquierda. El waffle vive aparte
  en `#e3b` (dos columnas).
- **Menú de módulos:** botón fijo arriba-izquierda (`#menuBtn`) abre overlay (`#menu`) con links a
  portada/portales/escenas/cierre. Cierra con Esc, con el botón o al elegir un link (`setupMenu()`).
- **Portada (rediseño jun-2026, VIDEO):** `#coverVideo` (`assets/video/portada_cerebro_scrub.mp4`, el hombre
  que grita y su cabeza se rompe en neuronas celestes), **scrubeado por el scroll** (`setupCover()` en
  main.js: rAF propio). La persecución del scroll es **física con inercia**: velocidad mínima 0.5× apenas
  scrolleás (nunca "de a fotos"), tope 3.5×, acelera vivo (`ACCEL`) y al soltar **frena flotando, gravedad
  cero** (`DECEL` bajo, con histéresis de −0.25s para que el derrape no rebote en reversa); seeks cuantizados
  al frame (120fps) y solo cuando terminó el anterior. El video va a pantalla completa (`object-fit: cover`,
  escala 1). Al inicio NO hay nada en pantalla (menú/progreso ocultos vía `body.at-top`; el grano global se
  apaga sobre la portada vía `body.cover-vis`, por performance — quieto NO se mueve, se descartó la
  "respiración"). Al romperse las neuronas (p≈0.74) **funde a negro** (`#coverDark`) y aparece el título
  escalonado (clase `title-on`, Unbounded uppercase con glow celeste). Botón de reiniciar redondo
  (`#coverReplay`, solo ícono ↺): `placeReplay()` lo planta **exactamente sobre el sparkle de Gemini**
  replicando la cuenta del object-fit:cover (centro del logo ≈ (1155, 598) @1280×720) y lo escala con la
  pantalla; **rebobina en reversa** hasta el inicio (scroll animado propio que pisa el `scroll-behavior:
  smooth` global — sin eso no anda). El mp4 se bufferea entero a blob para seeks instantáneos.
- **Portales de espiral entre módulos (rediseño jun-2026):** `<section class="portal">` con
  `<canvas data-spiral>` (clase `SpiralPortal` en noise.js). Ahora es un **TÚNEL volumétrico** a pantalla
  completa (brazos de espiral logarítmico en grises + anillos de profundidad + polvo orbitando + núcleo de
  luz celeste), acorde a la estética del video. Coreografía: entrás al túnel → el título del módulo aparece
  **ya adentro** (p≈0.3) → debajo del título nace un **puntito** (`.portal__dot`) que **crece con el scroll
  hasta tragarte** (p 0.5→0.92, escala manejada en `tick()`) → en el negro aparece la frase (`.portal__after`).
- **Gráficos:** `<div class="chart" data-chart="CLAVE_DEL_JSON">` dentro de una `.viz__layer`. En `js/charts.js`,
  `CHARTS['CLAVE'](container, data, opts)` lo construye; se inicializa cuando su capa se activa. Usar
  `rowsToObjects(sheet)` para pasar `{headers, rows}` a objetos y `accentOf(container)` para el acento.
  **Toda visualización cita su fuente:** `addSource(el, id)` (main.js lo llama tras `initOne`) toma el texto
  de `SOURCES` (charts.js) y lo pone en el slot `[data-src-for="id"]` de la sección o en un caption
  `.chart-src` dentro del contenedor.
- **G1 (pato/conejo) es HTML, no ECharts:** dos barras (`.duo`) SIN ejes que **crecen de 0% al esperado con
  el scroll** (`container.__setDuo(p)` desde `tick()` mientras E1 está en estado "chart").
- **E1 es una máquina de estados, no scroll de pasos:** `#e1[data-state="img|chart"]`. Estado "img": pregunta
  **estática a la izquierda** + figura a la derecha (más chica, no full-screen). Al elegir → estado "chart"
  (título + barras + texto DEBAJO del gráfico, todo entra en una pantalla) + botón **"Volver a la imagen"**.
  No se puede "scrollear de vuelta a la foto": la foto es una capa, no una posición de scroll.
- **Waffle por scroll (E3b):** el handler arma 100 celdas y expone `container.__setWaffle(p)`; `tick()` lo
  scrubea con el progreso de la sección `#e3b`; el número (`#e3Count`) cuenta en vivo.
- **Ruido→señal:** la clase `NoiseToSignal` (noise.js) queda disponible pero hoy NO se usa en pantalla.
- **Revelado puntual:** elementos sueltos con `data-reveal` aparecen con fade-up al entrar (clase `is-visible`).
- **Interacciones:** E1 (Pato/Conejo) guarda la respuesta y **personaliza E2** (`configureE2`) hacia el animal
  que NO viste. E2 **gira la figura con el scroll** (0→90° si toca ver el conejo) y marca los rasgos con
  puntos **anclados a la anatomía de la imagen** (`.annot` DENTRO de `#e2Fig`, en % de la imagen:
  pico/orejas ≈ 20,22 · ojo ≈ 68.5,30 · hocico ≈ 92,51; el rótulo se contra-rota con `--rot` para quedar
  horizontal). E4: play del audio **separado** de los botones; la elección auto-avanza (`scrollToNextStep`).
  **No se guarda nada del usuario**; las interacciones **NO gatean** contenido.
- **Accesibilidad:** `alt` en imágenes, `aria-label` en gráficos, foco visible, contraste alto,
  `prefers-reduced-motion` (estados finales sin animación; waffle/duo llenos, cerebro revelado, espiral estático).

## Paleta y tipografías (identidad jun-2026 v2 — gris + celeste neuronal)
- Fondo `#0A0D10` (gris-negro frío) / `#10151A`. Texto gris claro `#E4EAEF`. Secundario `#94A1AC`. Tenue `#5C6873`.
- **Acento ÚNICO celeste `#8FD8FF`** (el celeste del cerebro del video de portada) para TODO
  (highlight de gráficos, marcas, menú, núcleo del espiral). Reemplaza al bermellón `#FF5A36`.
- Curva de valor (G7): pérdidas `#E24B4A` / ganancias `#1D9E75`. Figuras claras: `#E9EEF2`.
- Fonts (Google): **Unbounded** (`--font-hero`: portada, nombres de portales, cierre — uppercase, peso liviano)
  + **Spectral** (`--font-display`: títulos de escenas y citas, con itálicas) + **Hanken Grotesk** (cuerpo) +
  **IBM Plex Mono** (kickers, fuentes de datos, menú). Reemplazan a Fraunces.

## Mapa de assets (nombres exactos, en /assets)
- **Video de portada:** `video/portada_cerebro_120.mp4` — es el que usa el sitio: **1920×1080 interpolado
  a 120fps** (minterpolate: el original es 24fps y scrubearlo se veía "de a fotos") y **all-intra** (un
  keyframe por frame, sin audio) para que el scrubbing por scroll sea continuo y fluido. Si se cambia el
  fps, actualizar la constante `FPS` en `setupCover()` (main.js). `video/portada_cerebro.mp4` es el original
  de Gemini **en 1080p** (fuente, no tocar; si se reemplaza el video, regenerar con:
  `ffmpeg -i in.mp4 -vf "minterpolate=fps=120:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -an -c:v libx264 -preset medium -crf 19 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart out.mp4`
  — y recalibrar el centro del sparkle de Gemini en `placeReplay()` si el watermark cambia de lugar:
  hoy ≈ (1743, 902) en 1920×1080).
- Pato-conejo (E1/E2): `840_560.jpg`
- Rotating snakes (E3): `Rotating_snakes_illusion.png` (3840×2880, a color: centros rosa `#CF807F`,
  fondo negro — clave para la inmersión de E3). El gif viejo
  `rotsnake-grayscale_custom-4b8924c1c70b79314017cd1200b900fc7d067758.gif` quedó sin uso.
- Audio ilusión auditiva (E4): `download.mp3`
- Pareidolia (E12): `450_1000.webp` (cara en pared), `blog_caras.jpg` (cara en Marte), `cafe-con-cara.jpg`
- Cierre: `Checker_shadow_illusion.svg`
- **Referencia de estilo G7** (curva de aversión): `aversion_referencia.jpeg` (copia sin espacios del
  WhatsApp original). Replicar ese estilo: pérdidas en rojo, ganancias en verde, marco de referencia en
  el origen, **λ = 2,25** anotado. Params en el JSON: `07_aversion_perdidas.params` (alpha=beta=0.88, lambda=2.25).

## Progreso por fases
- **Fase 1 — Scaffold: HECHA.** Estructura, CSS con paleta+fonts, motor de scroll, loader JSON, NoiseToSignal.
- **Fase 2 — Acto 1: HECHA, y REDISEÑADA a full-bleed (jun-2026, 2ª vuelta).** Portada (limpia, con pregunta) +
  **portal de espiral → "Percepción"** + E1–E5. Motor full-bleed (ver arriba). Ritmo situación-por-situación:
  en E1 ves la imagen, respondés y auto-avanza; el gráfico aparece al scrollear. E2 personaliza la pista girando
  la figura con el scroll. E3: texto → ilusión full-screen → waffle que se pinta con el scroll. G1–G5 con
  título/subtítulo, sin cambios de datos. **Este Acto 1 es el TEMPLATE para los Actos 2 y 3.**
- **Fase 3 — Acto 2: HECHA (jun-2026).** Mismo patrón full-bleed, **portal de espiral → "Decisión"**, acento ámbar.
  E6 bate y pelota (G6 `06_bate_pelota`, barras h.: trampa $0,10 apagada / correcta $0,05 en ámbar con ✓; planteo
  con ilustración SVG de bate+pelota) · E7 aversión (G7 `07_aversion_perdidas`: curva roja/verde, ejes en el
  origen, **sin sombras** bajo la curva, λ=2,25 en el texto) · E8 framing (G8: "elige lo seguro" cae 72%→22%) ·
  E9 Dunning-Kruger (G9, 2 líneas: creen vs saben; conecta con E5). E6/E7/E8 abren con **tarjeta de planteo**
  (`.statement`/`.gamble`, la bajada va como eyebrow) y el gráfico aparece al scrollear. La transición entre
  módulos la hace el **portal de espiral** (ya NO hay interludios $/ojo).
- **Fase 4 — Acto 3: HECHA (jun-2026).** Mismo patrón full-bleed, **portal de espiral → "Sesgos"**, acento violeta.
  E10 mejor que el promedio (G10 `10_mejor_que_promedio`, barras h. + línea de ref en 50%) · E11 Forer/Barnum
  (3 capas HTML: lectura `11_lectura` → dato grande `11_efecto_forer` 4,26/5 → texto anotado `11b_texto_barnum`;
  conexión con las víboras de E3, NO con triángulo) · E12 pareidolia (3 caras en `.faces` + G12
  `12_pareidolia_paranormal` con explicación científica en el tooltip) · E13 brecha (G13 `13_brecha_consenso`,
  Ciencia vs Público; "cura del cáncer oculta" ciencia ~0 vs 67%). **Cada escena conecta con una ilusión ya vista.**
- **Fase 5 — CASI HECHA.** Cierre con **Checker Shadow** (`#cierre`, termina en "Ahora lo sabés") +
  **pie** (`footer.pie`: materia, fuentes) ya están. **Pendiente:** completar los **nombres de autores** en el pie
  (placeholder `[completar nombres del equipo]`), pulido responsive/mobile y performance.
- **Fase 6 — REDISEÑO INTEGRAL (jun-2026, feedback del equipo): HECHA.** Cambios que MANDAN sobre lo anterior:
  (1) **Identidad nueva**: negro cálido + hueso + acento único bermellón; Fraunces/Hanken Grotesk/IBM Plex Mono.
  (2) **Layout dos columnas** (texto izq. nunca tapa el visual der.); full-bleed solo deliberado (snakes).
  (3) **Portada estilo "21hrs on the Moon"**: solo título centrado + cerebro SVG gris que asoma y se revela
  con el scroll; después viene el espiral. (4) **Espiral = disco** bajo el título del módulo que te traga.
  (5) **Menú de módulos** arriba a la izquierda. (6) **E1 interactivo** (imagen ⇄ gráfico con botón Volver,
  barras HTML que crecen 0→% con el scroll, sin ejes). (7) **Anotaciones de E2 ancladas a la imagen**
  (estaban "en cualquier lado": eran % de la pantalla). (8) **Snakes a pantalla completa** sin fondo blanco
  (`object-fit:cover`). (9) **Fuente citada en cada gráfico** (`SOURCES`/`addSource`). (10) Ilustración del
  bate y la pelota rehecha según la foto de referencia (`bate y pelota.jpeg`, en la raíz del repo).
- **Fase 7 — PORTADA DE VIDEO + IDENTIDAD GRIS/CELESTE (jun-2026, pedido de Gero): HECHA.** Manda sobre la
  Fase 6 donde contradiga: (1) **Portada = video scrubeado por el scroll** (`portada_cerebro_120.mp4`,
  a pantalla completa; sin nada más en pantalla al inicio, ni menú ni progreso; quieto se queda quieto
  (la "respiración" se probó y se descartó) pero al soltar el scroll frena con inercia "gravedad cero";
  al romperse las neuronas funde a negro y ahí entra el título; botón ↺ redondo que rebobina en reversa
  y tapa el logo de Gemini; ya NO existe el cerebro SVG). (2) **Paleta gris + celeste `#8FD8FF`** (el celeste del
  cerebro del video) en todo el sitio; el bermellón quedó descartado. (3) **Tipografías nuevas:**
  Unbounded (hero) + Spectral (display) + Hanken + Plex Mono; Fraunces quedó descartada. (4) **Portales
  rediseñados:** espiral = túnel volumétrico realista (grises + núcleo celeste); el título del módulo aparece
  **ya adentro** del espiral; debajo del título un **puntito crece con el scroll hasta tragarte**; la frase
  aparece en el negro.

## CORRECCIÓN DE COPY importante (E11)
En E11 (Forer/Barnum) la frase de conexión **NO** debe mencionar un triángulo (esa escena no existe).
Usar la conexión con las víboras de E3:
> "tu cerebro completó un texto vago con tu propia vida, igual que le agregó movimiento a una imagen que estaba quieta."

## Decisiones ya tomadas (no volver a preguntar salvo bloqueo real)
- **El scroll es el protagonista:** cada idea entra de a una con el scroll (motor sticky de pasos). NO volcar
  toda la info de una escena junta; NO usar las viejas `.scene` de dos bloques apilados.
- **Layout full-bleed, NO dos columnas:** el visual ocupa toda la pantalla y el texto va superpuesto (scrim).
  Los gráficos van a pantalla completa, con su **título + subtítulo** adentro (como un gráfico normal).
- **Módulos CON título, tras el espiral** (revierte la vieja regla de "sin actos"): cada módulo abre con el portal
  de espiral → negro → nombre del módulo (Percepción / Decisión / Sesgos). El espiral reemplaza a los interludios ($/ojo).
- **Portada SIN partículas** (era mucha intro): título + una **pregunta disparadora** (sin spoilear la tesis).
- **E1 → E2 personalizado y scrubeado:** E1 muestra la imagen y pregunta; al elegir **auto-avanza**. E2 gira la
  figura **con el scroll** (no aparece ya invertida) y marca el rasgo **sobre la imagen** (sin chips Pascua/zanahoria),
  hacia el animal que no viste. E4 también auto-avanza al elegir; el play del audio va **separado** de los botones.
- **E3:** primero el texto, después la ilusión a pantalla completa, después el waffle que se pinta con el scroll.
- **G7 (aversión):** curva roja/verde **sin sombras** bajo la curva (areaStyle sacado), cruz en el origen, λ en el texto.
- Sin métricas tipo "n=80" en el copy. Estética oscura/editorial, scroll nativo (sin hijack), sin login ni storage.
