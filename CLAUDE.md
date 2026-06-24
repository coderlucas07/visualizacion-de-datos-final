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

## ⚡ ACTUALIZACIÓN jun-2026 (10ª vuelta — REDISEÑO PREMIUM multi-pasada, EN CURSO) — MANDA sobre todo lo de abajo
- **Objetivo (brief del usuario):** subir el sitio a nivel editorial (The Pudding/Reuters/Guardian): romper la
  monotonía "fondo oscuro + gráfico + tarjeta translúcida", variar la gramática de escenas (hero / prueba dividida /
  dato limpio / full-screen / sticky por pasos / frase editorial / galería / antes-después), higiene de scroll
  (escenas que no se pisen, matar negros vacíos, centrar vertical, auditar min-height/sticky/z-index), gráficos
  SIN texto encima, mejores transiciones entre módulos, copy más corto/claro, y responsive mobile (usar `svh`).
  NO rehacer desde cero ni cambiar la esencia. Se hace en PASADAS (el usuario revisa en localhost cada una).
- **PASADA 1 (transversal) — HECHA:**
  - **Legibilidad global de TODOS los gráficos** (helpers de charts.js, un solo lugar): título 24→28, subtítulo
    14→16, ejes de categoría 14→16, ejes de valor/% 12→14, leyendas →14, tooltips →14.5, y se barrieron los
    overrides chicos inline (12/13/11 → 14/15/13). Si agregás gráficos, NO bajes de estos tamaños.
  - **Coherencia texto↔gráfico:** G2 (contexto, E2) — el morph Pato/Conejo se CONSERVA (es la firma "mismas
    barras que se vuelcan"); se reescribió el texto para que coincida con las barras: "Con la pista, la lectura se
    da vuelta: 3 de cada 4 pasan a ver al conejo / No cambió el estímulo. Cambió la interpretación." (se descartó
    la Opción B de "cambió/no cambió" porque mataba el morph). E3 (snakes) suma "A veces el cerebro agrega algo
    que no está". El typo "No todas las ilusiones son ambiguas" ya estaba bien.
- **PASADA (a) — gráficos sin tarjeta encima — HECHA.** Dos patrones según el tipo de gráfico:
  - **Texto en columna IZQUIERDA + gráfico corrido a la derecha** (barras verticales/agrupadas):
    **brecha ciencia↔público** (`grid.left:'40%'`, legend top-right; `.e13--brecha .step` flex-start) y
    **framing/enfermedad de 600** (`08_framing` `grid.left:'46%'`; `#e8 .step[data-layer="1"]` columna izq.).
  - **Texto en BANDA INFERIOR + gráfico comprimido arriba** (barras horizontales / líneas que ocupan todo el
    ancho): **mejor que el promedio** (`10_` `grid.bottom:'42%'`; `#e10 .step` banda abajo) y **Dunning-Kruger**
    (`09_` `grid.bottom:'40%'`; `#e9 .step` banda abajo).
  - **Ya estaban bien (sin cambio):** bate y pelota (texto izq. / barras der.) y gorila/ceguera atencional (texto
    izq. / dona der.). **aversión a la pérdida**: solape mínimo, se dejó como está (revisar si molesta).
  - ⚠️ OJO para futuras escenas Sesgos/cierre: la regla con especificidad de ID
    `#sesgos-intro,#cierre .step__card{max-width:46rem;text-align:center}` (carteles full-bleed, 6ª vuelta) centra
    y agranda. Si un panel "no se mueve" aunque cambies `.e1X`/clase, buscá reglas `#id .step__card` (ganan por ID).
- **PASADA (b) — higiene de scroll — EN CURSO:**
  - **Alturas recortadas** (matan scroll/negro muerto; el scrub se normaliza a la altura, no se rompe):
    portada `.cover` 460→320vh (mobile 380→260), portales `.portal` 380→270vh, `.step--tall` 220→180vh
    (rotación pato/conejo), `#e3b .step` 240→180vh (waffle). Verificado que el morph del pato/conejo y el waffle
    completan dentro de la altura nueva.
  - **Cue de scroll de portada eliminado** (`.cover__scrollcue` "Bajá").
  - **🐛 BUG IMPORTANTE corregido (morph pato/conejo "con contexto"):** el handler `02_contexto_cambio` elegía la
    fila con `/con/i.test(estado)`, que matchea **"Sin contexto"** (por "**con**texto") → mostraba Pato 74/Conejo 26
    CON la pista (al revés, contradecía la tesis y el copy "3 de cada 4 ven al conejo"). Fix: `/^con/i`. Ahora con
    contexto = Conejo 74 / Pato 26. (Si tocás textos de estado, ojo con regex que matcheen subcadenas de "contexto".)
  - **Escenas que se pisan:** verificado en los límites complejos (serpientes full-bleed → waffle): corte limpio,
    sin bleed. El `padding-top:55vh` del título de snakes se dejó (se lee como "frase editorial", intencional).
- **PASADA (d, parcial) — video del gorila des-embebido:** el embed de YouTube mostraba título/logo (rompía la
  estética). Se reforzó `.gorila__scrim` (bandas arriba/abajo casi opacas hasta ~9%, fade a 0) para TAPAR el título
  (arriba-izq) y el logo (abajo) sin recortar al gorila (la acción es centrada). Los playerVars ya estaban bien
  (`controls:0, modestbranding:1, rel:0, fs:0, iv_load_policy:3, playsinline, mute`). La placa "Selective Attention
  Test" que se ve es del propio video (contenido), no chrome.
- **PASADA (e, parcial) — responsive mobile:** los charts de columna lateral (brecha, framing) rompían en
  mobile (`grid.left:40%` aplastaba las barras). Ahora son **responsive por `container.clientWidth < 640`**:
  desktop = columna lateral; mobile = full-width arriba + texto en banda inferior (CSS `@media (max-width:640px)`
  reposiciona la tarjeta). Patrón a reusar para cualquier chart de columna lateral. Los de banda (mejor que el
  promedio, Dunning-Kruger, aversión) ya andaban en mobile. Intro pato/conejo y demás apilan ok.
- **PASADA (e) — responsive mobile — HECHA en lo crítico:** todos los charts que rompían en mobile ahora son
  responsive por `container.clientWidth<640`: brecha y framing (columna→banda), aversión (márgenes/labels/barras
  reducidos). La galería de caras (E12) se APILA vertical en mobile (`@media max-width:640` con las mismas reglas
  que `prefers-reduced-motion`). Intro/charts de banda (E10/E9) ya andaban. El gorila en mobile es un strip 16:9
  centrado estándar (el scrim de desktop no aplica; aceptable, el brief prioriza desktop).
- **PASADA (f) — SISTEMA TIPOGRÁFICO (4 tiers con intención):** se sumó **Syne** (display geométrica con
  carácter) SOLO para el **tier de IMPACTO** → `--font-hero` ahora es Syne (portada hero `.cover__title .t2` weight
  800, nombres de módulo `.portal__name` 600, cierre `.closing-line` 600). El resto NO cambia: **Spectral**
  (`--font-display`) = títulos de escena + citas/itálicas + frases-pausa; **Hanken Grotesk** = cuerpo; **IBM Plex
  Mono** = datos/UI/kickers/fuentes. Esto reemplaza la regla vieja de "Spectral para todo lo de impacto" (la 6ª
  vuelta había sacado Unbounded; ahora el impacto vuelve a tener una display propia, pero distinta). Para cambiar la
  display de impacto: 1 línea (`--font-hero`) + el `family=Syne:...` del link de fuentes.
- **PASADA (g) — escenas protagonistas + achicar repetido:**
  - **Diana de sesgo ANIMADA** (`sesgos-intro`): dejó de ser SVG estático. `setupBiasDiana()` (main.js) genera 9
    puntos y los scrubea por `sectionProgress(#sesgos-intro)`: aparecen DISPERSOS (error aleatorio) → se AGRUPAN a
    un lado (sesgo) + línea de mira. Diana protagonista a la derecha (`#sesgos-intro .viz__layer justify-items:end`),
    texto en columna izquierda (no tapa centro ni cluster). Se sacó la animación CSS `biasIn` (la maneja el JS).
  - **Cierre Adelson en 3 pasos** (pregunta "¿cuál casillero parece más claro?" → "Son iguales." → "Saberlo no
    apaga la ilusión" + tesis "Tu cerebro no te cuenta toda la verdad" en Syne, full-circle con la portada). El
    tablero pasó a protagonista a la DERECHA (casilleros A/B siempre visibles), texto en columna izquierda; antes
    la tarjeta tapaba la ilusión. Bajó de 4 pasos a 3.
  - **Ciencia vs público (brecha):** NO se tocó — ya es UN solo gráfico que evoluciona en 3 etapas (no son varias
    pantallas de barras rojas repetidas). El brief pedía "achicar si repite": no repite.
- **PAUSAS editoriales (coreografía):** se sumaron 3 escenas `.interlude` full-screen (1 frase fuerte por módulo,
  2ª línea en itálica del color del módulo, fade-up con `data-reveal`): `#pausa1` Percepción "La imagen no cambió.
  Cambió el contexto." (celeste, tras pato/conejo) · `#pausa2` Decisión "Elegir también es interpretar." (naranja,
  tras bate) · `#pausa3` Sesgos "Cuando el error se repite, deja de ser ruido." (carmesí, tras la diana). pausa2/3
  sumadas a `setupModuleColors` (pausa1 hereda el celeste global).
- **RE-ESCENAS con coreografía de scroll (batch de pulido, EN CURSO):**
  - **Mejor que el promedio (E10) — REHECHA (pedido del usuario):** se SACARON los cuadros/`.step__card`. Ahora la
    sección (`#e10`, sin `.scrolly`; markup propio `.e10__pin/.e10__lead/.e10__chart/.e10__after`, 280vh, pin
    sticky) arranca con el **título centrado sobre negro**; al scrollear, el **título se va a la izquierda y se
    achica** (`.e10__lead-in` translateX/scale), el **gráfico entra desde la derecha** (`.e10__chart` translateX+
    opacity, `left:36%`) y las **barras se ESTIRAN de 0 al tope** (`__setGrow(p)` en el handler `10_mejor_que_promedio`,
    `animation:false`, sin título interno ni flecha/markPoint); al llegar al tope aparece la **conclusión** ("El 93%
    dice manejar mejor…") **donde estaba el título** (`.e10__after`, centrada, scrim radial; el gráfico se atenúa).
    Todo scrubeado en `tick()` por `sectionProgress(#e10)` (`enter=(sp-0.06)/0.5`, `concl=(sp-0.66)/0.18`; refs
    `e10Pin/e10Lead/e10LeadIn/e10ChartWrap/e10After/e10ChartEl`). Fallbacks: mobile `@max-width:760` apila (título
    arriba, gráfico abajo, sin corrimiento); `prefers-reduced-motion` apila todo estático con barras llenas
    (`__setGrow(1)`). La fuente sale en el slot `[data-src-for]` dentro de `.e10__after`.
  - **Bate y pelota (#12) — HECHA:** `scrolly--stage e6--bate`, sin cuadro; las barras crecen → flecha a la más
    elegida → marca roja en la trampa → ✓ en $0,05 (`__setBate`, scrubeado por `sectionProgress(#e6)`).
  - **Moneda +$50/−$50 (E7, #13) — HECHA:** `scrolly--stage e7--coin`, SIN cuadro/tarjeta (se sacó el texto
    redundante del `.step__card`, oculto con `display:none`). La moneda (`.coin-scene`, id `e7Coin`) hace un
    **viaje completo con el scroll**: asoma arriba → **CAE hasta abajo** girando → gira un par de veces abajo →
    **vuelve a SUBIR y se acomoda arriba** (CSS var `--ty` = viaje vertical relativo a su posición natural, que
    es la asentada=0; `--cscale` 1.25→1; el spin es el keyframe `coinflip` infinito). Empieza apenas asomada
    arriba (`--ty:-42vh`, evita el negro muerto del arranque, antes "se bugeaba" porque la moneda popeaba). Al
    asentarse **aparece abajo** la apuesta (`.gamble__row` cara/ceca) + `¿Aceptás jugar?` + botones Acepto/No
    juego (`.coin-scene__body`, var `--reveal`; `.is-ready` habilita pointer-events; los botones tienen borde+fill
    propios para ser bien visibles sobre el negro). Scrubeado en `tick()`, piecewise por `clamp(sectionProgress(#e7)
    /0.5)` (la moneda ocupa el primer ~50%; `#e7 .step[data-layer="0"]` mide 260vh para el recorrido; después
    entra el gráfico G7 en capa 1). Los botones viven en el stage (no en un `.step`): el handler de choice los
    detecta y avanza al primer `.step[data-layer="1"]`.
  - **Aversión (G7 `07_aversion_perdidas`, #14) — HECHA:** todo el texto vive PINNEADO en el stage (`.aversion-stage`
    dentro de `viz__layer[data-layer="1"]`), así NO se mueve con el scroll. Barras **centradas verticalmente**
    (grid simétrico `top/bottom 32%`; el chart va `position:absolute` centrado). Con el scroll: primero la **línea**
    punteada del centro, después crece la barra de **PÉRDIDA** (−$50) y la frase arranca **"Perder $50"**
    (`.aversion-cap__a`), después crece la de **GANANCIA** (+$50) y la frase CONTINÚA **"duele casi el doble de lo
    que alegra ganarlos."** (`.aversion-cap__b`), y al terminar aparece la **caja ESTÁTICA** abajo
    (`.aversion-box`, opaca) con "Se llama aversión a las pérdidas…". Rótulos de barra = sólo el valor (−$50/+$50);
    se sacó la frase descriptiva de las barras y los 2 `.step__card` de texto viejos. Scrubeado en `tick()` por
    `stepScrub(#e7 .step[data-layer="1"])` (220vh): `__setG7(p)` dibuja las barras, y por `lossP=p/0.55` /
    `gainP=(p-0.5)/0.5` se prenden las clases `.show-a`/`.show-b`/`.show`. El handoff moneda→gráfico crossfadea
    (IntersectionObserver de capas).
- **SESGOS (pulido por pedido del usuario) — EN CURSO:**
  - **Diana (`sesgos-intro`) MÁS GRANDE:** `.bias-intro` pasó a `width:min(94vh,58vw)` y el `padding-right` del
    layer bajó a `clamp(1rem,2.5vw,3rem)` → la diana ocupa casi todo el lado derecho (texto en columna izquierda).
  - **Embudo "de cada 100" — el texto DURA más:** los pasos de capa 0 (`#fantasmas .step[data-layer="0"]`) miden
    150vh y el build del embudo es **lineal y más lento** (`(sectionProgress−0.03)/0.6`, sin easeOut) → la última
    fila ("1 · Vio una aparición") se completa mientras el texto del paso sigue en pantalla.
  - **Tercios (33%) — cuadros GRANDES y llamativos, sin texto de abajo:** se sacó `.thirds__sub`, los `<p>` de
    ejemplos de cada celda y la tarjeta flotante de la capa 1 (`#fantasmas .step[data-layer="1"] .step__card`
    `display:none`; la fuente cae sola en `.viz__chart` vía addSource). El grid es `flex:1` (llena el alto), celdas
    con gradiente carmesí + borde acentuado, % gigante (`clamp(3.2rem…7rem)`) e íconos grandes. Cada celda tiene
    **tooltip** con el ejemplo (`r.ejemplos` del JSON) que SUBE desde abajo al pasar el mouse / con foco (`.thirds__tip`),
    con una pista "ⓘ" (`.thirds__info`) arriba a la derecha; en touch (`@media hover:none`) el ejemplo queda fijo abajo.
  - **Galería de caras (E12, scroll horizontal) — HECHA:** se reemplazó la cara de la pared (`450_1000.webp`) por
    **`assets/cara2.jpg`** (un árbol con cara, pareidolia más fuerte), al MISMO tamaño que las otras (la regla
    `.hpanel--face img{max-height:64vh}` lo hace solo; se sacó el override `[src*="450_1000"]`). Epígrafe nuevo:
    "Una cara en el tronco de un árbol." Quedan café y Marte sin cambios.
- **CIERRE (Adelson) — la PRUEBA con scroll antes de "Son iguales" — HECHA:** sobre la imagen del tablero hay un
  overlay SVG (`.checker__proof`, `#checkerProof`, viewBox `0 0 1011 769` = tamaño natural del SVG) con un **puente
  del MISMO gris** (`#proofBridge`, `stroke:#6F6F6F` = color real muestreado de A y B, ambos `rgb(111,111,111)`)
  que UNE el casillero A `(546,254)` con el B `(506,423)` (≈54%,33% y 50%,55% de la imagen; calibrados muestreando
  los píxeles) + dos aros (`#proofA/#proofB`). Con el scroll: aparecen los aros y el puente se **dibuja**
  (`stroke-dashoffset` por `sectionProgress(#cierre)` en `tick()`, refs `proofBridge/proofA/proofB`) ANTES de que el
  paso revele "Son iguales". Se sumó un paso nuevo de "prueba" ("Tendemos un puente del mismo gris…") entre la
  pregunta y la revelación (el cierre pasó de 3 a 4 pasos). `.checker` ahora es `position:relative` y la imagen es
  GRANDE (`#cierre .checker width:min(94vh,60vw)`, ocupa gran parte de la derecha). Si se cambia el SVG del tablero,
  re-muestrear A/B y recalibrar las coords del puente.
  - **AÍSLA + ZOOM (sin línea, pedido del usuario):** se SACÓ el puente/línea que unía A y B (y los aros). Ahora,
    al arrancar la prueba con el scroll, el **tablero se BORRA** (la `<img>` se funde a 0) y quedan **SOLO los dos
    casilleros, grandes y zoomeados**, marcados **A** y **B**. Los cuadrados son `<rect id="proofSqA/proofSqB">`
    (88×88) pintados con el **mismo gris real `#6F6F6F`** (por eso sobreviven al fundido de la foto) + dos `<text
    id="proofLblA/proofLblB">` (IBM Plex Mono, sobre cada cuadrado), todo dentro del grupo `#proofZoom`. El zoom es
    un `transform` `translate+scale` del grupo (S=2.6) centrado en el punto medio de A/B → centro del viewBox,
    scrubeado por `sectionProgress(#cierre)` en `tick()` (`zoom = easeOut((sp-0.20)/0.22)`; refs
    `proofZoom/proofSqA/proofSqB/proofLblA/proofLblB/cierreImg`). El copy del paso 2 ya no habla de "puente/tira"
    sino de aislar los dos casilleros. Si se recalibran A/B, mover también los `rect` y los `text`
    (centro = A`(546,254)`/B`(506,423)`).
- **PENDIENTE (lo que queda):** **nombres del equipo en el `<footer>`** → el usuario los dio: **Lucas Dayan,
  Gerónimo Cantalejos, Marcos Bustamante** (2026). Verificar que estén en el colofón del `<footer>` (`.pie__authors`).
  Opcional/subjetivo: seguir variando tarjetas / acortar más copy.

## ⚡ ACTUALIZACIÓN jun-2026 (9ª vuelta — E13 a 3 etapas + limpieza de cues) — MANDA sobre todo lo de abajo
- **COPY de SESGOS rehilado para narrativa clara (pedido del usuario):** progresión = qué es un sesgo (no es
  equivocarse una vez, es equivocarse siempre parecido) → son predecibles (anticipar = aprovechar) → patrones/
  fantasmas ("No buscamos fantasmas, buscamos patrones"; tercios = "El misterio cambia de forma" + "distintas
  experiencias, mismo mecanismo: el cerebro completa lo ambiguo") → exceso de confianza (E10) → brecha
  ciencia/público (E13: "gana lo que ya creemos, lo que nos da miedo o lo que se repite más fuerte") → cierre
  ("Saberlo no apaga la ilusión / con los sesgos pasa algo parecido" … "Conocer el truco no lo apaga, pero te
  permite verlo venir"). Textos cortos, tono inquietante. NO volver a meter los callbacks viejos a las víboras
  en E12/fantasmas (se sacaron a propósito).
- **E13 (la brecha) REHECHO como scrollytelling de 3 momentos** (`#e13` sigue `.scrolly--stage`, gráfico pinneado):
  (1) crecen SOLO las barras de **Ciencia** (texto IZQUIERDA), (2) crecen las de **Público** (texto DERECHA),
  (3) aparecen **conectores punteados = la brecha** con el `−pp` (texto CENTRADO). Copy nuevo y breve
  ("La ciencia sí tiene respuestas" / "Pero el público no acompaña" / "Esa distancia no es casual"). Pasos con
  entrada slide/fade por `.is-active` (clases `.brechastep--left/right/center` en CSS). El handler
  `13_brecha_consenso` expone `container.__setBrecha(p)` (scrubeado por `sectionProgress(#e13)` en `tick()`,
  ref `brechaEl`/`#brechaChart`); **filtra los 4 temas de consenso fuerte** (ciencia ≥60: clima/evolución/
  transgénicos/vacunas) y deja afuera "cura del cáncer oculta" (es inverso: público>ciencia, rompía el relato).
- **CUES de scroll ELIMINADOS en TODO el sitio (pedido del usuario):** nada de "seguí bajando / seguí
  scrolleando / pasá el cursor / esto se mueve de costado". Sacados de portada (`cover__go`), E1, E2 (lede +
  `configureE2`), E3, gorila (`gorila__cue`), E12 (`hscroll__cue` + `hpanel__note`) y subtítulos de gráficos
  (pareidolia). Si sumás escenas, NO vuelvas a poner textos-guía de scroll.
- **E10 (flecha del 93%):** la flecha ahora **apunta a la barra** (rotada 90°, sin el rótulo "el 93%" duplicado
  que flotaba al lado).
- **Fantasmas · tercios:** las tarjetas van ARRIBA (`.thirds` flex-start con `padding-top`) y el panel de texto
  ABAJO-CENTRO (`#fantasmas .step[data-layer="1"]` centrado) para que el texto no tape los cuadros.
- **Cierre:** pasos 2 y 3 entran SUBIENDO, uno a la izquierda y otro a la derecha (`.cierrestep--left/right`),
  para no tapar el tablero centrado; el kicker del 1º arranca con "**Para concluir**" para anticipar el cierre.

## ⚡ ACTUALIZACIÓN jun-2026 (8ª vuelta — SESGOS reconstruido, centro = FANTASMAS) — MANDA sobre todo lo de abajo
- **Tesis del módulo Sesgos = espejo de Percepción:** "creer es ver lo que no está / no ver lo que sí".
  Todo cuelga del *"el mismo cerebro que…"* (snakes/gorila). El Sesgos viejo (sesgos sueltos) estaba
  desconectado; las teóricas (Módulo 13, PDFs Sesgos 1 y 2) aportan el material que sí conecta.
- **NUEVA escena CENTRO `#fantasmas`** (insertada después de `sesgos-intro`, antes de E10; sumada a `SESGOS`
  en `setupModuleColors` para heredar el carmesí, y al menú): el cerebro INVENTA presencias. Hero viz = **EMBUDO
  que se arma con el scroll** (`14_fantasmas_embudo`, HTML `.funnel`, `container.__setFunnel(p)` scrubeado por
  `sectionProgress(#fantasmas)` en `tick()`): de cada 100, **50 creen → 15 sintieron algo → 1 vio una aparición**
  (el desplome 50→1 ES el dato; el cerebro infla la creencia más allá de la experiencia). Layer 1 = **reportes en
  tercios** (`14b_fantasmas_reportes`, HTML `.thirds`: 33% visual / 33% sonoro / 34% sensorial, íconos
  ojo/oído/mano). Copy clave: *"el mismo cerebro que le agregó movimiento a las víboras quietas te agrega una
  presencia en una habitación vacía"* + parálisis nocturna (miedo + parálisis + alucinación = fantasma). Datos
  reales de la cátedra + Ipsos 2018 (Argentina lidera la creencia en fantasmas).
- **Arco nuevo de Sesgos (REORDENADO, E11 ELIMINADO — pedido del usuario):** portal3 → ¿qué es un sesgo? →
  **fantasmas** (embudo *de cada 100* + reportes en tercios) → **E12** (caras/pareidolia, scroll horizontal — el
  cerebro que ve fantasmas → aparecen las caras, conecta directo) → **E10** (confianza / "mejor que el promedio",
  ya pulida: "la mayoría se cree mejor que la mayoría" + flecha al 93%) → E13 (la brecha / "la duda es nuestro
  producto") → cierre (Checker Shadow). **E11 (Forer/Barnum, "leé esto con atención" + 4,26/5) se SACÓ por completo**
  (sección, link de menú y `e11` de `SESGOS`); los handlers `11_*` quedan en charts.js sin uso. El `.thirds`
  (reportes) se centró vertical (antes el `.viz__chart .chart{height:100%}` lo estiraba y el contenido caía arriba:
  ahora `.thirds` es flex column centrado con `padding-top` para que el título no quede tapado por el menú).
- **PENDIENTE de evaluar con el usuario (quedaron afuera de esta vuelta, eran candidatos fuertes de las teóricas):**
  survivorship bias (el avión de Wald, callback directo al gorila), "sos predecible" (Forer interactivo
  color+martillo), Ouija/efecto ideomotor (Faraday), disponibilidad (lo que tememos vs lo que mata).

## ⚡ ACTUALIZACIÓN jun-2026 (7ª vuelta — MORPHS entre visuales, pilotos) — MANDA sobre todo lo de abajo
- **DIRECCIÓN nueva (decidida con el usuario):** romper la repetición "texto izq / visual der" con **morphs**:
  un visual SE TRANSFORMA en el siguiente con el scroll. Layouts centrados con aire. Se arranca por pocas
  escenas piloto.
- **Piloto #1 — pato → conejo (E2):** la MISMA silueta de Jastrow **rota ~90°** con el scroll (`--rot`,
  `MAXDEG=90` en `tick()`); el pico se vuelve orejas → aparece el conejo; las marcas (`cues-on`) salen al final
  (p>0.72). El morph ES el concepto: mismo estímulo, dos lecturas.
- **Piloto #2 — número → waffle (E3b):** el handler `03_ilusiones_movimiento_waffle` ya NO es grilla HTML; es un
  **canvas de partículas** (`.morphwaffle`): 100 puntos arrancan formando el número (96, muestreado del texto) y
  con el scroll vuelan a una **grilla 10×10** (96 en acento + 4 grises). Mantiene `__setWaffle(p)` (lo scrubea
  `tick()`). E3b pasó a `.scrolly--stage` con recorrido (`#e3b .step min-height 240vh`) para que el morph complete.
  **Patrón reutilizable** para otros datos (gorila 50%, 93%, etc.).
- **Piloto #3 — barras que se reordenan:** PENDIENTE de definición; ojo que el patrón YA existe en el G1→G2 del
  compañero (las barras pato/conejo 57/42 se vuelcan a 26/74 con contexto).
- **PENDIENTE:** re-arreglar lo que se repite en esta versión (ejes Y de % que sobran en barras, el scrim del
  stage que funde las barras al negro = "se ven como fondo", paneles que tapan datos). Verificación con scroll
  real vía puppeteer-core (en /tmp, Chrome del sistema), porque el headless `--dump-dom` no dispara el IntersectionObserver.

## ⚡ ACTUALIZACIÓN jun-2026 (6ª vuelta — TIPOGRAFÍA + ESTRUCTURA) — MANDA sobre todo lo de abajo
- **TIPOGRAFÍA = 3 familias con intención (se eliminó Unbounded):** **Spectral** (serif) para IMPACTO + TÍTULOS
  + CITAS (las preguntas van en itálica); **Hanken Grotesk** para CUERPO (ledes, apoyo, subtítulos y ejes de
  gráficos); **IBM Plex Mono** para DATOS/FUENTES/UI (kickers, citas de dataset, menú, botones). `--font-hero` y
  `--font-display` apuntan ambos a Spectral; se diferencian por peso (600/700) y estilo. Pesos de los títulos
  subidos (Spectral pide más cuerpo que Unbounded). Los gráficos (charts.js) ya usaban este sistema.
- **ESTRUCTURA: el FULL-SCREEN es la nueva BASE (se descartó "texto izq / gráfico der con mucho negro").**
  - **`.scrolly--stage` = visualización a PANTALLA COMPLETA con texto flotante:** el visual (sticky) ocupa todo
    el viewport, CENTRADO, y los pasos flotan como panel abajo-izquierda (scrim + blur, aparecen con el scroll).
    Aplicado a **E2, E3b, E4, E5, E6, E7, E8, E9, E10, E13, sesgos-intro, cierre** (E1 y E11 siguen aparte).
    `initOne()` oculta el título interno del gráfico (`title:{show:false}`) en stage (el panel es el titular).
    Centrado: `.viz__chart`/`.gorilla` con place-items/align-content center; en los planteos con botones
    (`#e6/#e7/#e8 .viz__layer[data-layer="0"]`) se centra en la mitad superior (`padding-bottom`) para no tapar
    el panel de botones. Modificadores `stage--top` / `stage--right`.
  - **`.hscroll` = SCROLL HORIZONTAL (E12 · caras):** sección 500vh; `#e12Track` (flex) se recorre de costado con
    el scroll vertical (transform en `tick()`). Paneles: título → 3 caras → gráfico. Reduced-motion → stack vertical.
- **PORTALES = título + bajada en UNA pantalla (`.portal--plain`, SIN espiral) + puntitos de módulo:** `.modot`
  (tipo iPhone, abajo) con el punto del módulo actual como pill en su color (`var(--accent)`) y los otros grises.
  Percepción/Decisión/Sesgos. El espiral (`SpiralPortal`/`data-spiral`) quedó SIN uso.
- **Arreglos:** snakes (E3) entra llenando la pantalla (`transform-origin:50% 50%`, zoom ~3,4×→1×); moneda 3D que
  gira en E7 (`.coin`, cara verde/ceca roja); G9 leyendas más grandes (CREEN/SABEN fontSize 16, leyenda 15); G8
  con las dos barras juntas (grid 26%/26%).

## ⚡ ACTUALIZACIÓN jun-2026 (6ª vuelta — pulido de gráficos y espacios) — MANDA sobre todo lo de abajo
- **Pato-conejo = CONTORNO, no tarjeta de papel:** la figura de Jastrow (E1 y E2) se invierte
  (`filter: invert(1) contrast/brightness` + `mix-blend-mode: screen`) → el fondo blanco del JPG
  desaparece y queda solo el contorno blanco integrado al fondo oscuro; por eso se agrandó mucho
  (E1 `min(86vh,100%)`, grid 4fr/8fr; E2 `.e2-figwrap min(60vh,78%)`). Se le sacó `figure-card` a E1
  y se anuló el papel en `#e2 .figure-card`.
- **G1 (pato vs conejo):** barras y gráfico **más grandes** (`.duo height min(56vh,540px)`, tracks más
  anchos). Las barras se **llenan rápido** (primer ~26% del scroll, antes /0.76) y después el texto de
  cierre (`.intro__after`) **sube y aparece** con el scroll (scrub en `tick()`). `.intro` bajó a 200vh
  (menos scroll muerto).
- **G2 (contexto) rehecho:** ya NO es ECharts. Ahora son **las mismas barras duo que G1** (HTML,
  `.duo-morph` + `container.__setMorph(p)`): al llegar son **idénticas al gráfico anterior**
  (Pato 57,5 / Conejo 42,5, leídas de `01_pato_conejo`) y al scrollear un poco se **vuelcan** a la
  distribución con la pista (**26 / 74**, de `02_contexto_cambio` "Con contexto"). Un rótulo de estado
  arriba cambia "sin pista → con la pista". Scrub en `tick()` por `stepScrub(#e2` step layer1`)`.
- **E3b (waffle 96/100):** pasó de `scrolly--stage` a **dos columnas** (`.scrolly`): el texto ya no cae
  al fondo, queda alineado con el waffle (sticky a la derecha).
- **E4 (onda FM):** la onda se **achicó** (`.fmwave max-width 880px / max-height 60vh`, centrada) y el
  **dial tiene mucho más contraste** (bici celeste pleno, alquiler en blanco con borde; números más
  grandes). En el canvas, el tramo "alquiler" pasó de gris tenue a **blanco** (`second = INK`).
- **E5 (gorila):** sección `.closer-stat` de **dos columnas CONGELADAS** (pin `position:sticky`, 200vh):
  título a la **izquierda** y el porcentaje (anillo más chico) a la **derecha**. **Solo se muestra el
  porcentaje**: el handler `05_cierre_percepcion` (charts.js) ahora dibuja únicamente el anillo + número
  (se sacaron del HTML la figura del gorila `__icon`, el `__title`, el `__lbl` y el `__cap`). El número
  **sube de 0% a 50% siguiendo el scroll** (lineal, `__setGorila` scrubeado en `tick()` con
  `sectionProgress(#e5)/0.85`); al 50% se **libera** el pin y se sigue a Decisión. Reduced-motion: 50% fijo,
  sin pin alto. (Reemplaza al `.scrolly` de dos columnas que tenía el gorila visible.)
- **E6 (bate):** pasó a **dos columnas** (problema a la derecha, tarea/explicación a la izquierda; ya no
  queda espacio negro). Foto del bate y textos **más grandes** (`#e6 .batball-photo min(34vh,420px)`).
- **DECISIÓN sin verde/rojo:** regla nueva → **cada módulo usa SOLO sus colores**. Decisión define
  `--gain`/`--loss` como **tonalidades del naranja** (claro `#F6C28A` = ganancia, profundo `#D9641B` =
  pérdida) en `setupModuleColors()`. La moneda (E7), las filas de apuesta y G7/G8 las heredan
  (charts.js las lee con `cssVar()`; ya no usa los `GAIN/LOSS` verde/rojo). **No volver a meter verde/rojo
  en Decisión** (ni en ningún módulo que no sea su color).
- **G9 (Dunning-Kruger):** la leyenda de "lo que realmente saben" ahora se dibuja como **línea punteada
  gris** (legend `icon:'line'` + `itemStyle.color` por serie), no como bloque naranja.
- **SESGOS:** los carteles de las escenas full-bleed (sesgos-intro, E10, E13, cierre) son **más grandes,
  centrados y con más texto legible** (`max-width 46rem`, `text-align:center`, lede/muted más grandes).
- **E11 (frases Barnum, capa 2):** la slide "cada frase explota un sesgo" se **rediseñó**: tarjetas
  numeradas, frase en Spectral grande + el truco con etiqueta clara (fuente de cuerpo, no mono apretado).
- **Cierre (tablero de Adelson):** se le **agregó contexto y explicación** (descuenta la sombra → corrige
  solo; no se puede apagar). El SVG no trae rótulos A/B, así que el copy nombra los cuadrados por su
  posición (a plena luz vs. en sombra), no por letras.
- **Scroll horizontal (E12):** NO se tocó (quedó excelente).

## ⚡ ACTUALIZACIÓN jun-2026 (5ª vuelta — Decisión: narrativa + colores) — MANDA sobre todo lo de abajo
- **NARRATIVA = objetivo principal** (junto con gráficos/colores/tipografía/scroll): cada módulo conecta con el
  anterior. La teórica (Módulo 12) lo dice literal: abre con "¿cómo hace el cerebro para decidir qué es lo que
  ve?" (pato/conejo = ilusión biestable) y cita a Sigman: *"el mismo órgano que mira… es el que toma todas
  nuestras decisiones… siguen los mismos principios"*. Eso es el eje: el mismo cerebro que **construye lo que
  ves** (y lo que NO ves: el gorila) **construye lo que elegís**; el contexto que cambiaba la percepción ahora
  cambia la decisión (framing).
- **Decisión ya NO es cobalto:** usa **naranja `#F7943D`** (cálido, combina con el celeste/gris; distinto del
  carmesí de Sesgos). Set en `setupModuleColors()`. El glow del título de portal usa `var(--accent-soft)` (cada
  módulo brilla con su color).
- **Color semántico del módulo:** ganancia/alegría = **verde `#3FA76E`** (`GAIN`), pérdida/dolor/muerte = **rojo
  `#E5484D`** (`LOSS`), definidos en charts.js. El naranja es la identidad (portal, kickers, botones, bate);
  verde/rojo solo para datos gan/pérd. NO usar el rojo/verde viejos chillones.
- **Portal 2:** conector GENERAL como pregunta: "Lo que viste lo construyó tu cerebro. ¿Pasa lo mismo con tus
  decisiones?"
- **E6 bate:** foto REAL (`assets/bate_pelota.jpeg`) en tarjeta de papel (`.batball-photo` + `.figure-card`),
  completa y nítida (se descartó el SVG cortado). Sin eyebrow. **El primer paso es SOLO para responder** (la
  pregunta + botones); la explicación de los **dos motores** (Sistema 1 rápido / Sistema 2 lento) va recién en
  el paso del gráfico.
- **E7 apuesta:** moneda 50/50 + **botones** (Acepto / No juego). Gráfico G7 = **balanza emocional** (verde corta
  = alegría de ganar; roja al doble = dolor de perder) con línea espejo "igual que ganar". **SIN λ ni "×2"** (el
  2,25 se usa desde `params`, no se muestra). El lede NO dice "en promedio no ganás ni perdés".
- **E8 framing (reordenado por scroll):** a la DERECHA el planteo grande y simple (`.statement--framing`: 600
  personas + 2 `plan-card` **A/B SIN pista** de seguro/arriesgado; opción B explicada con la moneda "1 de cada 3
  se salvan las 600…"). **NO dar pistas** ni decir "salvan lo mismo". A la IZQUIERDA primero la tarea + botones
  (Plan A/Plan B), después scroll → gráfico + explicación (el truco vidas/muertes, el vuelco 72→22). Sin pato-conejo.
- **E9 Dunning-Kruger:** abre con INTRO (¿cuánto te das cuenta de lo que no sabés?). El gráfico **se DIBUJA con el
  scroll**: `__setProgress(p)` (scrubeado en `tick()` por `sectionProgress(#e9)`) avanza la línea de "Peores" a
  "Mejores" a medida que bajás por la teórica (cumple el objetivo "scroll protagonista"). xAxis de valor 0-3
  densificado a N puntos; endLabels **CREEN**/**SABEN** + brecha en "Peores" (+50 pts).

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
