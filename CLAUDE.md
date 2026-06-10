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

## Qué es
Sitio de **scrollytelling** (una sola historia, scroll nativo) para **Visualización de Datos (UTDT)**.
**Tesis:** el cerebro no registra la realidad, la construye; rellenar lo ambiguo aparece cuando vemos
(percepción), decidimos (neuroeconomía) y creemos (sesgos). **3 actos:** Percepción · Decisión · Sesgos.
**Idioma:** español rioplatense (voseo). **Estética:** oscura, editorial, inmersiva (tipo The Pudding /
Reuters en dark). NADA de laboratorio/HUD/sujeto/registro ni guardar datos del usuario (la pista de E2 se adapta
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
python3 -m http.server 8000     # en la carpeta del proyecto
# abrir http://localhost:8000
```

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
  `<section class="scrolly">` con un **gráfico fijo** (`.scrolly__graphic`, `position:sticky`) y una columna
  de **pasos de texto** (`.step`) que scrollean. Cada `.step` lleva `data-layer="N"` que apunta a una capa del
  gráfico (`.viz__layer[data-layer="N"]`). `setupScrolly()` (main.js) usa un IntersectionObserver con franja
  central (`rootMargin:-45% 0 -45%`): cuando un paso cruza el centro, intercambia la capa visible. **Layout
  FULL-BLEED:** el `.scrolly__graphic` ocupa toda la pantalla (sticky) y los `.step` van **superpuestos** encima
  (`margin-top:-100vh`), con texto abajo + scrim suave (NADA de dos columnas: el texto va sobre el visual).
  Los gráficos se **pre-inicializan** al cargar el JSON (scroll fluido, sin lag). Varios pasos comparten capa
  (cambia el texto, el gráfico queda). **Patrón para sumar escenas: copiar esta estructura full-bleed.**
- **Portales de espiral entre módulos:** `<section class="portal">` con `<canvas data-spiral>` (clase
  `SpiralPortal` en noise.js): el espiral gira y hace zoom al scrollear hasta tragar la pantalla en negro, y
  ahí aparece el **título del módulo** (`.portal__title`, lo revela `tick()` cuando el progreso pasa 0,8).
- **Gráficos:** `<div class="chart" data-chart="CLAVE_DEL_JSON">` dentro de una `.viz__layer`. En `js/charts.js`,
  `CHARTS['CLAVE'](container, data, opts)` lo construye; se inicializa cuando su capa se activa. Usar
  `rowsToObjects(sheet)` para pasar `{headers, rows}` a objetos y `accentOf(container)` para el acento.
- **Acento por tramo:** `data-act="perception|decision|bias"` setea `--accent` (cian/ámbar/violeta) y tiñe la
  barra de progreso. Los **módulos SÍ se nombran** (Percepción / Decisión / Sesgos) pero **solo tras el espiral**
  (no hay kickers "E1 · Percepción" sueltos en cada escena). Es decir: el portal del espiral hace de apertura de módulo.
- **Waffle por scroll (E3):** el handler arma 100 celdas apagadas y expone `container.__setWaffle(p)`; `main.js`
  lo llama en `tick()` con el progreso del paso (`stepFill`) y las 96 personitas se pintan de a poco; el número
  (`#e3Count`) cuenta en vivo. Mismo recurso reutilizable si otra escena necesita "pintar con el scroll".
- **Ruido→señal:** `<canvas data-noise="image|text|eye" data-src=... data-glyph=...>`. La clase `NoiseToSignal`
  muestrea la figura (imagen por luminancia / glifo de texto / función de dibujo) y la "cuaja" según el
  progreso de scroll de su sección. **Hoy NO se usa en pantalla** (la portada quedó limpia y al espiral lo hace
  `SpiralPortal`); queda disponible para el ojo/figura del Acto 3 si hace falta.
- **Revelado puntual:** elementos sueltos con `data-reveal` aparecen con fade-up al entrar (clase `is-visible`).
- **Interacciones:** E1 (Pato/Conejo) guarda la respuesta y **personaliza E2** (`configureE2`) hacia el animal que
  NO viste; al elegir **auto-avanza** al paso siguiente (`scrollToNextStep`). E2 **gira la figura con el scroll**
  (0→90° si toca ver el conejo) y marca el rasgo **sobre la imagen** (`.annot`), **sin chips** (nada de Pascua/zanahoria).
  E4 (play del audio **separado** de los botones Bicicleta/Alquiler; también auto-avanza). **No se guarda nada del
  usuario**; las interacciones **NO gatean** contenido. En `setupInteractions()` + el scrub en `tick()`.
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
