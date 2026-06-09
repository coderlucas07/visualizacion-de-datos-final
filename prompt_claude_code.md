# PROMPT PARA CLAUDE CODE — "Tu cerebro no te cuenta toda la verdad"

> Copiá todo lo que sigue como primer mensaje a Claude Code, dentro de una carpeta de proyecto vacía, junto con los archivos que se listan al final.

---

## CONTEXTO DEL PROYECTO

Quiero que construyas un **sitio web de scrollytelling** (narrativa visual interactiva que se recorre haciendo scroll) para un trabajo universitario de Visualización de Datos. Es **una sola historia**, contada en **3 actos**, con el **texto como protagonista** y **visualizaciones de datos que aparecen y se animan con el scroll**. No es un dashboard ni una galería de gráficos: es un relato.

**Tesis:** el cerebro no registra la realidad, la construye; y esa misma operación —rellenar lo ambiguo con una interpretación— aparece cuando vemos (percepción), cuando decidimos (neuroeconomía) y cuando creemos (sesgos).

**Título:** "Tu cerebro no te cuenta toda la verdad."

**Tres actos:** 1) Percepción · 2) Decisión · 3) Sesgos.

**Idioma:** español rioplatense (Argentina). Respetá el tuteo/voseo de los textos que te paso.

**Importante:** hay **solo 2 interacciones del usuario** en todo el sitio (un click pato/conejo y un audio). Todo lo demás es scroll + lectura + gráficos animados. No agregues más interactividad.

---

## STACK Y ARQUITECTURA

- **HTML + CSS + JavaScript vanilla.** Un solo proyecto estático, sin framework pesado. (Podés usar módulos JS.)
- **Gráficos: ECharts** (vía CDN) para barras, líneas y la curva de valor. Para el **waffle de 100 personas** y las animaciones de "ruido→señal" usá **HTML/CSS/Canvas** (queda mejor que ECharts).
- **Scroll:** usá **IntersectionObserver** para disparar la entrada de cada escena y la animación de cada gráfico. **Scroll nativo, sin scroll-hijacking.** Escenas tipo *full-screen* con `position: sticky` donde el gráfico queda fijo mientras el texto avanza.
- **Datos:** cargá desde `data/datos_visualizaciones.json` (te lo paso). No hardcodees los números en el JS; leelos del JSON.
- **Responsive:** desktop-first, pero que funcione en mobile (una columna, gráficos que se reescalan). Respetá `prefers-reduced-motion` (si está activo, mostrá los estados finales sin animación).
- **Estructura de archivos sugerida:**
  ```
  /index.html
  /css/styles.css
  /js/main.js        (scroll/observer + orquestación)
  /js/charts.js      (cada gráfico ECharts/Canvas)
  /data/datos_visualizaciones.json
  /assets/           (imágenes y audio)
  ```
- Entregá el sitio listo para abrir con un server estático y para subir a Netlify/Vercel/GitHub Pages.

---

## ESTÉTICA (clave)

- **Oscura, editorial e inmersiva**, tipo scrollytelling de *The Pudding* / *Reuters* en modo oscuro. **NO** uses estética de "laboratorio", ni HUD, ni interfaz de software, ni números de sujeto, ni registro.
- Fondo casi negro (`#0B0C10` / `#0E0F14`), texto color hueso (`#E8E6E0`).
- **Acento por acto:** Percepción = cian/azul (`#3AA0FF`), Decisión = ámbar (`#FF8A3D`), Sesgos = violeta (`#9B6BFF`). Pérdidas/ganancias en la curva: rojo (`#E24B4A`) / verde (`#1D9E75`).
- Tipografía: una **grotesca de alto contraste** para títulos (ej. Inter Tight, Archivo o Space Grotesk) y una **legible** para cuerpo. Títulos grandes, frases cortas. Mayúsculas/minúsculas naturales (no todo en mayúscula).
- Mucho aire, escenas a pantalla completa, una idea por viewport.
- **Motivo visual recurrente:** un campo de **ruido/puntos** que, al scrollear, "cuaja" en una forma reconocible (en la portada → figura pato-conejo; en los interludios → un signo $ y un ojo). Es la metáfora de "el cerebro rellena lo ambiguo". Hacelo con Canvas, sutil.
- Tooltips de los gráficos: **narrativos**, no solo el número (usá el campo `tooltip` del JSON).
- Evitá que parezca dashboard: nada de grilla de gráficos, nada de cajas con ejes primero; cada gráfico nace dentro de su escena y se anima al entrar.

---

## ESTRUCTURA NARRATIVA (escena por escena, con el copy y el gráfico)

Cada escena ocupa al menos una pantalla. El texto va en bloques grandes; el gráfico aparece/anima al hacer scroll.

### PORTADA
- Título: **"Tu cerebro no te cuenta toda la verdad."**
- Bajada: "Estás convencido de que ves lo que hay, elegís lo que te conviene y creés lo que es cierto. Las próximas pantallas muestran, una por una, que las tres cosas son una construcción de tu cerebro."
- Fondo: ruido que se resuelve en la figura pato-conejo al bajar.

### ACTO 1 — PERCEPCIÓN (acento cian)

**E1 · Pato o conejo — INTERACCIÓN 1**
- Texto: "Mirá esta imagen. ¿Qué ves primero?"
- Interacción: imagen pato-conejo + dos botones **Pato / Conejo**. Al elegir, revelá suavemente el otro animal sobre el mismo trazo. **No midas el tiempo.** No guardes ni muestres datos del usuario.
- Reveal: "No había una respuesta correcta. La imagen nunca cambió: cambió tu cerebro."
- **Gráfico G1** (`01_pato_conejo`): barras Pato 57,5% / Conejo 42,5%, que crecen al scrollear.

**E2 · El contexto reescribe lo que ves**
- Mecanismo: antes de re-mostrar la figura, cebá la lectura "conejo" (mostrá orejas/zanahoria, la palabra "Pascua", y rotá la figura 90° para que las orejas apunten hacia arriba). La mayoría ahora ve conejo.
- Texto: "Le dimos una sola pista a tu cerebro. Con eso alcanzó. 7 de cada 10 personas cambian lo que ven cuando aparece el contexto."
- **Gráfico G2** (`02_contexto_cambio`): barras **antes/después** del "% que ve conejo" (42% → 74%), con el titular grande **"70% cambió"** (de `02b_resumen_cambio`). Animá la transición con el scroll. (No uses Sankey.)

**E3 · Ilusiones que se mueven (sin moverse)**
- Texto: "No todas las ilusiones son ambiguas. Algunas te muestran movimiento donde no hay. Esta imagen está completamente quieta. Y sin embargo…"
- Visual: imagen **Rotating Snakes**.
- **Gráfico G3** (`03_ilusiones_movimiento_waffle`): **waffle de 100 figuritas**; al scrollear se pintan **96**. Remate: "96 de cada 100 personas ven movimiento en una imagen estática." (Hacelo en Canvas/HTML, no ECharts.)

**E4 · No es solo la vista: también el oído — INTERACCIÓN 2 + transición**
- Puente: "La percepción no es un problema de los ojos, es del cerebro. Y si interpreta lo que ve, también interpreta lo que oye."
- Interacción: botón **play** de un audio ambiguo + elegir **Bicicleta / Alquiler**.
- Reveal: "Es el mismo audio para todos. Lo que oís depende de lo que tu cerebro esperaba oír."
- **Gráfico G4** (`04_ilusion_auditiva`): barras Bicicleta 47% / Alquiler 44% / Otra 9%. Y al seguir: mostrá que **leer la palabra antes cambia lo que oís** (`04b_auditiva_con_pista`).

**E5 · Confianza no es lo mismo que acierto — cierre del acto + puente**
- Texto: "Cuanto más seguro estás, peor ves. Mirá qué pasó con las personas que respondieron con máxima confianza." → "Esa seguridad que no garantiza nada va a volver: el cerebro que interpreta lo que ve es el mismo que interpreta qué le conviene."
- **Gráfico G5** (`05_confianza_precision`): línea/barras **confianza (1→5) vs % de acierto**. Resaltá que el pico está en confianza media (48%) y que la confianza máxima (5/5) tiene el peor acierto (35,8%).

### INTERLUDIO A
Pantalla full-screen, ruido que se resuelve en un signo **$**. Texto: *"Si el cerebro tiene que decidir qué es lo que ve… ¿cómo decide qué le conviene?"*

### ACTO 2 — DECISIÓN (acento ámbar)

**E6 · El atajo (bate y pelota)**
- Texto: "Un bate y una pelota cuestan \$1,10. El bate cuesta \$1 más que la pelota. ¿Cuánto cuesta la pelota?" → "Si pensaste \$0,10, te pasó lo mismo que a la mayoría. Está mal: la pelota cuesta \$0,05. Tu cabeza tiene un sistema rápido (casi siempre alcanza) y uno lento (casi nunca lo encendés)."
- **Gráfico G6** (`06_bate_pelota`): barras con las 4 respuestas más elegidas (\$0,10 58% · \$0,05 33% · \$1,00 5% · \$0,01 4%). (Puede tener un input opcional antes del reveal, pero no es obligatorio.)

**E7 · Perder duele más que ganar (aversión a las pérdidas)**
- Texto: "Tiro una moneda: cara ganás \$50, ceca perdés \$50. ¿Aceptás? Casi nadie. Para tu cerebro el juego no es justo: perder \$50 duele más de lo que alegra ganar \$50. El sistema aversivo (amígdala, ínsula) grita más fuerte que el de recompensa (estriado, NAcc)."
- **Gráfico G7** (`07_aversion_perdidas`): **función de valor** — X = resultado monetario (−100 a +100), Y = valor psicológico subjetivo; curva **roja en pérdidas / verde en ganancias**, punto de referencia en el origen, anotación **λ = 2,25×**. (Líneas ECharts; replica el estilo de la imagen de referencia que te paso.)

**E8 · El mismo problema, dos respuestas (encuadre/framing)**
- Texto: "Una enfermedad amenaza a 600 personas. Si te lo cuentan en vidas salvadas, elegís lo seguro. Si te cuentan exactamente lo mismo en muertes, te arriesgás. Mismo resultado. Cambió solo la palabra."
- **Gráfico G8** (`08_framing_enfermedad`): barras agrupadas — encuadre ganancia (opción segura 72%) vs encuadre pérdida (opción segura 22%).
- Conexión: "El mismo estímulo, leído distinto según el contexto —igual que el pato-conejo."

**E9 · Los que menos saben, más seguros están (Dunning-Kruger)**
- Texto: "Los que peor hacen una tarea son los que más se sobreestiman: no les alcanza ni para darse cuenta de lo que les falta. Y los mejores creen que cualquiera podría hacer lo que ellos hacen."
- **Gráfico G9** (`09_dunning_kruger`): competencia real vs autopercepción por cuartil (el cuartil inferior real ~p12 se cree ~p62). Misma forma que la curva de confianza del Acto 1.

### INTERLUDIO B
Ruido que se resuelve en un **ojo** / una mano con hilos. Texto: *"Si tus errores son predecibles y universales… alguien los puede diseñar."*

### ACTO 3 — SESGOS (acento violeta)
> Regla: **cada escena conecta con las ilusiones ya vistas.** El texto repite que es *el mismo cerebro* que falló antes.

**E10 · La ilusión de ser mejor que el promedio**
- Texto: "El 93% de los conductores se cree mejor que el promedio. Es matemáticamente imposible: solo la mitad puede estar por encima de la media. No es soberbia, es una ilusión. El mismo cerebro que vio moverse una imagen quieta se ve mejor de lo que es."
- **Gráfico G10** (`10_mejor_que_promedio`): barras del % que se cree por encima del promedio por dominio, con **línea de referencia en 50%**.

**E11 · Un texto hecho a tu medida (Forer / Barnum)**
- Mostrá el párrafo Barnum en pantalla como si fuera para el lector: "Tenés una gran necesidad de que los demás te aprecien. A veces sos sociable y otras reservado. Sentís que todavía no explotaste tu verdadero potencial…"
- Reveal (al scrollear): "¿Te sentiste identificado? Este texto se lo mostramos a todos. En 1948, Bertram Forer dio la misma descripción genérica a sus alumnos y la calificaron 4,26 sobre 5 de precisión. Es el truco del horóscopo y del tarot."
- **Gráfico G11** (`11_efecto_forer` + `11b_texto_barnum`): dato grande **4,26/5** y "1 de cada 6 cree haber recibido una lectura psíquica acertada"; y el mismo párrafo **anotado** mostrando qué frase explota qué sesgo.
- Conexión con ilusiones: "Tu cerebro completó un texto vago con tu propia vida, igual que completó un triángulo que no estaba en la pantalla."

**E12 · El cerebro que ve fantasmas (apofenia / pareidolia)**
- Texto: "Somos tan buenos detectando patrones que los vemos donde no hay: una cara en un enchufe, una presencia en una habitación vacía. El mismo cerebro que encontró movimiento en las víboras quietas encuentra fantasmas en el ruido."
- Visual: imágenes de **pareidolia** (caras en objetos).
- **Gráfico G12** (`12_pareidolia_paranormal`): barras de experiencias 'paranormales' (presencia 37%, sonido 33%, etc.) con su **explicación científica** en el tooltip.

**E13 · Más seguros que los que saben (brecha con la ciencia)**
- Texto: "Aunque nos equivoquemos, sentimos que tenemos razón, incluso frente a miles de científicos. La misma sobreconfianza que te hizo creerte mejor conductor te hace confiar en tu intuición por encima del consenso experto. Y hay industrias que lo saben: 'La duda es nuestro producto', escribió una tabacalera en 1969. Hoy las mismas técnicas niegan el cambio climático."
- **Gráfico G13** (`13_brecha_consenso` + `13b`): **brecha** ciencia vs público por tema, con **quién se beneficia** del hueco (clima 87 vs 50/59; evolución 98 vs 65; y "la cura del cáncer está oculta" 67% en Argentina).
- Conexión: "Es la ilusión más cara: creer que tu percepción le gana al método que se inventó justamente para corregir las ilusiones del cerebro."

### CIERRE (sin interacción)
> No podés apagar la ilusión. El tablero de ajedrez te va a seguir mostrando dos grises distintos aunque sepas que son el mismo. Tu cerebro no te miente para hacerte mal: te miente porque construir una versión útil de la realidad es lo único que sabe hacer. Lo hace cuando mirás, cuando elegís y cuando creés. La única diferencia entre caer en la trampa y verla venir no es ser más inteligente: es saber que la trampa existe. **Ahora lo sabés.**

**Pie:** créditos, autores, materia (Visualización de Datos, UTDT) y fuentes.

---

## ESPECIFICACIONES DE LOS GRÁFICOS

- Todos leen su data de `data/datos_visualizaciones.json` (cada clave = una hoja; cada objeto tiene `headers` y `rows`).
- Todos **se animan al entrar en viewport** (barras que crecen, línea que se dibuja, waffle que se pinta).
- Paleta según el acto. Tooltips con el texto del campo `tooltip`/`nota` cuando exista.
- Sin títulos de gráfico tipo "Figura 1"; el título lo da el texto de la escena.
- G3 (waffle) y los interludios (ruido→señal): **Canvas/HTML**, no ECharts.
- G7 (curva de valor): replicá el estilo de la imagen de referencia (pérdidas en rojo, ganancias en verde, marco de referencia en el origen, λ anotado).

---

## RESTRICCIONES

- No inventes datos: usá solo los del JSON. Si falta algo, dejá un placeholder y avisame.
- No agregues interacciones más allá de las 2 indicadas (pato/conejo y audio).
- Nada de login, registro, almacenamiento de respuestas del usuario, ni contenido personalizado.
- Accesible: contraste suficiente, `alt` en imágenes, `prefers-reduced-motion`.
- Performance: lazy-init de cada gráfico cuando entra en viewport.

---

## ENTREGABLE

El sitio completo (HTML/CSS/JS + data + assets), corriendo localmente con un server estático y listo para deploy. Dejame comentado dónde reemplazar imágenes/audio si uso placeholders.

---

# ARCHIVOS QUE TENÉS QUE SUBIRLE A CLAUDE CODE

**Imprescindibles:**
1. `datos_visualizaciones.json` — **el motor de todos los gráficos** (ponelo en `/data`).
2. Este prompt (`prompt_claude_code.md`) como primer mensaje.
3. `propuesta_v2_storytelling.md` — el storyboard con los textos completos (para que tenga el copy y el orden exacto).
4. La **imagen de referencia de la curva de aversión a las pérdidas** (la que ya hiciste) para que replique el estilo de G7.

**Assets que conviene conseguir y subir (si no, Claude Code pone placeholders):**
5. **Imagen pato-conejo** (Jastrow 1899, dominio público).
6. **Imagen Rotating Snakes** (Kitaoka) — ojo con licencia; conseguí una de uso libre o una recreación.
7. **Audio de la ilusión auditiva** "bicicleta / alquiler" (un `.mp3`/`.wav` corto). **Esto Claude Code no lo puede generar: tenés que subirlo vos.**
8. 2–3 **imágenes de pareidolia** (caras en objetos/enchufes) de uso libre.
9. (Opcional) imagen del **Checker Shadow** (Adelson) para el cierre.

**Opcional:**
10. `datos_visualizaciones.xlsx` — la misma data en Excel, por si querés revisarla a mano.

> Nota: `datos_visualizaciones.json` y `.xlsx` ya están generados y contienen los 13 datasets (reales + simulados coherentes) con sus tooltips y una hoja `_metodologia` que aclara qué dato es real y qué dato es prototípico.
