# Tu cerebro no te cuenta toda la verdad
### Propuesta v2 — storytelling interactivo (scrollytelling) · Visualización de Datos UTDT

Cambios aplicados respecto de la v1: se eliminó todo el contenedor de "experimento / laboratorio / sujeto / registro / expediente / personalización". Esto es **un storytelling**, con el **texto como columna vertebral** y **2 interacciones puntuales** (no más). El motor de los gráficos son **datos reales o simulados coherentes, ya provistos** (archivo `datos_visualizaciones.xlsx` / `.json`), no las respuestas del usuario. Se sacó el Sankey. Se conservan tesis, actos, puentes, la variable *confianza* y el motivo visual. Se agregó Forer/Barnum sin experimento personalizado. Cierre de impacto, no interactivo.

---

## Título y bajada

**Título:** **Tu cerebro no te cuenta toda la verdad.**
*(alternativas si querés: "La realidad que tu cerebro inventa" · "No ves el mundo: lo construís")*

**Bajada:**
> Estás convencido de que ves lo que hay, elegís lo que te conviene y creés lo que es cierto.
> Las próximas pantallas muestran, una por una, que las tres cosas son una construcción de tu cerebro —y que esa construcción se puede medir, predecir y usar en tu contra.

**Tesis (el hilo único):** el cerebro no *registra* la realidad, la *construye*; y esa misma operación —rellenar lo ambiguo con una interpretación— aparece cuando **ves** (percepción), cuando **decidís** (neuroeconomía) y cuando **creés** (sesgos).

**Los tres actos:**
1. **Percepción — "No ves lo que creés que ves."**
2. **Decisión — "Tampoco decidís lo que creés que decidís."**
3. **Sesgos — "Y otros lo saben — y lo usan."**

**Los dos puentes (se conservan):**
- A1 → A2: *si el cerebro tiene que decidir qué es lo que ve, ¿cómo decide qué le conviene?*
- A2 → A3: *si tus errores son predecibles y universales, alguien los conoce; y si los conoce, los diseña.*

**La variable que cose todo — la confianza (sin medir al usuario):**
No se mide al lector. La confianza es un **hilo de datos** que se muestra en cada acto:
- Acto 1: cuanta **más confianza**, **peor acierto** (gráfico de confianza vs precisión).
- Acto 2: los que menos saben son los más seguros (Dunning-Kruger).
- Acto 3: esa seguridad infundada es la **palanca** que aprovechan el horóscopo, el psíquico y los "mercaderes de la duda".
Una sola idea —*la confianza no es señal de acierto*— recorre los tres módulos y le da unidad.

**El motivo visual único (se conserva, sin estética de laboratorio):**
*Ruido que se resuelve en señal.* Un campo granulado/de puntos que, al scrollear, "cuaja" en una forma reconocible. Es literalmente lo que hace el cerebro en los tres actos: rellenar lo ambiguo. Se usa en la portada y en los dos interludios entre actos.

**Estética:** oscura, editorial e inmersiva (tipo scrollytelling de *The Pudding* / *Reuters* en modo oscuro), **sin** interfaz de laboratorio ni HUD. Tipografía grande, textos cortos pero protagonistas, escenas full-screen. Acento por acto: **percepción = cian/azul**, **decisión = ámbar**, **sesgos = violeta**.

---

## STORYBOARD (escena por escena, con texto narrativo)

> Cada escena: objetivo · texto en pantalla (borrador real para usar) · gráfico (dato/archivo/tipo) · interacción (solo donde se indica) · cómo conecta con el hilo.
> Gráficos numerados G1–G13. Datos en `datos_visualizaciones.xlsx` / `.json`.

### PORTADA
- **Texto:** título + bajada (arriba). El fondo es el motivo de ruido que, al hacer scroll, se resuelve en la figura **pato-conejo**.
- **Sin gráfico. Sin interacción** (solo invita a bajar).

---

### ACTO 1 — PERCEPCIÓN · *No ves lo que creés que ves* · acento cian

**E1 · Pato o conejo** — **INTERACCIÓN 1**
- **Objetivo:** que el lector se comprometa con una lectura antes de pensar.
- **Texto:** "Mirá esta imagen. ¿Qué ves primero?" → (tras elegir) "No había una respuesta correcta. La imagen nunca cambió: cambió tu cerebro."
- **Interacción:** dos botones **Pato / Conejo**. *No se mide el tiempo de respuesta.* Al elegir, se revela suavemente el otro animal sobre el mismo trazo.
- **Gráfico G1:** barras "qué vio la gente": Pato 57,5% / Conejo 42,5% (`01_pato_conejo`). Aparece al scrollear, no como gráfico suelto: las dos columnas crecen desde la figura.
- **Hilo:** abre la tesis. Un mismo estímulo, dos interpretaciones válidas.

**E2 · El contexto reescribe lo que ves**
- **Objetivo:** mostrar que una pista basta para invertir la percepción de la mayoría.
- **Mecanismo de contexto (para que la mayoría vea *el otro* animal):** antes de volver a mostrar la figura, el texto y la imagen ceban la lectura "conejo": se muestran orejas largas, una zanahoria, la palabra "Pascua", y se rota la figura 90° para que las "orejas" queden hacia arriba (es la orientación en la que el conejo domina). Casi todos ven ahora conejo.
- **Texto:** "Le dimos una sola pista a tu cerebro. Con eso alcanzó. **7 de cada 10 personas cambian lo que ven cuando aparece el contexto.** El dato no estaba en la imagen: lo puso el contexto."
- **Gráfico G2 (reemplaza al Sankey):** dos opciones —
  (a) **barras antes/después**: "% que ve conejo" salta de 42% a 74% (`02_contexto_cambio`); o
  (b) un **número grande "70%"** con una barra 70/30 *cambió / mantuvo* (`02b_resumen_cambio`).
  Recomiendo (a) animado al scroll + el titular "70% cambió".
- **Hilo:** la interpretación depende del contexto. Semilla del Acto 2 (el contexto también enmarca decisiones → framing en E8).

**E3 · Ilusiones que se mueven (sin moverse)**
- **Objetivo:** mostrar que hay distintos *tipos* de ilusiones y que el error es del sistema visual, no de la imagen.
- **Texto:** "No todas las ilusiones son ambiguas. Algunas te muestran movimiento donde no hay ninguno. Esta imagen está completamente quieta." (mostrar *Rotating Snakes*) "Y sin embargo…"
- **Gráfico G3 (waffle 100 personas):** una grilla de 100 figuritas; al scrollear se **pintan 96**. Conclusión: "**96 de cada 100 personas ven movimiento** en una imagen estática" (`03_ilusiones_movimiento_waffle`). Opcional: mini-tabla con otras ilusiones de movimiento y su % (`03b`).
- **Hilo:** el cerebro *agrega* información (movimiento) que no existe. Conecta con E11/E12 del Acto 3 (apofenia: agrega patrones que no existen).

**E4 · No es solo la vista: también el oído** — **INTERACCIÓN 2 + TRANSICIÓN SENSORIAL**
- **Objetivo:** extender la percepción a otro sentido y demostrar que el contexto sesga también lo auditivo.
- **Transición (texto puente desde E3):** "La percepción no es un problema de los ojos. Es un problema del cerebro. Y si el cerebro interpreta lo que ve… también interpreta lo que **oye**."
- **Interacción:** botón de **play** de un audio ambiguo; el lector elige qué escuchó: **Bicicleta / Alquiler**.
- **Texto (reveal):** "Es exactamente el mismo audio para todos. Lo que oís depende de lo que tu cerebro esperaba oír."
- **Gráfico G4:** barras "qué escucha la gente": Bicicleta 47% / Alquiler 44% / Otra 9% (`04_ilusion_auditiva`). Plus, al scrollear, el remate: **leer la palabra antes cambia lo que oís** (`04b_auditiva_con_pista`: con la palabra "BICICLETA" en pantalla, 81% oye bicicleta). Mismo mecanismo que el contexto visual de E2.
- **Hilo:** cierra "percepción = interpretación, en cualquier sentido". Refuerza el rol del contexto.

**E5 · Confianza no es lo mismo que acierto** — **CIERRE DE ACTO 1 + PUENTE AL ACTO 2**
- **Objetivo:** instalar la variable confianza con datos y abrir la puerta a las decisiones.
- **Texto:** "Hasta acá viste que tu cerebro se equivoca. Lo inquietante es lo otro: **cuanto más seguro estás, peor ves.** Mirá qué pasó con las personas que respondieron con máxima confianza." → "Esa seguridad que no garantiza nada va a volver. Porque el cerebro que interpreta lo que ve es el mismo que va a interpretar **qué le conviene**."
- **Gráfico G5:** curva/barras **confianza (1→5) vs % de acierto** (`05_confianza_precision`). El pico de acierto está en confianza media (48%); la confianza máxima (5/5) tiene el **peor** acierto (35,8%). Marcar ese punto.
- **Hilo:** es el corazón del hilo *confianza*. Puente literal al Acto 2.

---

### INTERLUDIO A
Pantalla full-screen, motivo de ruido que se resuelve en un signo **$** / una balanza. Texto único, grande:
> *"Si el cerebro tiene que decidir qué es lo que ve… ¿cómo decide qué le conviene?"*

---

### ACTO 2 — DECISIÓN · *Tampoco decidís lo que creés que decidís* · acento ámbar

**E6 · El atajo (cómo decidimos en realidad)**
- **Objetivo:** dar contexto sobre el Sistema 1 / Sistema 2 con un caso, no con teoría.
- **Texto:** "Un bate y una pelota cuestan \$1,10 en total. El bate cuesta \$1 más que la pelota. ¿Cuánto cuesta la pelota?" → (reveal) "Si pensaste \$0,10, te pasó lo mismo que a la mayoría. Es la respuesta que el cerebro tira sola. Y está mal: la pelota cuesta \$0,05." → "Tu cabeza tiene un sistema rápido y barato (casi siempre alcanza) y uno lento y costoso (casi nunca lo encendés)."
- **Gráfico G6:** barras con las **4 respuestas más elegidas**: \$0,10 (intuitiva incorrecta) 58% · \$0,05 (correcta) 33% · \$1,00 5% · \$0,01 4% (`06_bate_pelota`). Fuente: Frederick 2005 — más del 50% de estudiantes de Harvard/MIT/Princeton lo erran; "10 centavos" concentra ~86% de los errores.
- **Interacción:** mínima/opcional (puede ser solo narrado, o un input rápido antes del reveal). No suma una "interacción fuerte".
- **Hilo:** decidir también es un acto rápido y poco vigilado. Prepara el terreno para los sesgos de decisión.

**E7 · Perder duele más que ganar (aversión a las pérdidas)**
- **Objetivo:** que se entienda visualmente que una pérdida pesa más que una ganancia equivalente.
- **Texto:** "Imaginá: tiro una moneda. Si sale cara ganás \$50; si sale ceca, perdés \$50. ¿Aceptás? Casi nadie acepta. Y eso que el juego es 'justo'. Para tu cerebro no lo es: **perder \$50 duele más de lo que alegra ganar \$50.**" → fundamentar con Molins & Serrano: el sistema **aversivo** (amígdala, ínsula) grita más fuerte que el **apetitivo** (estriado ventral / NAcc).
- **Gráfico G7 (el que mostraste en la imagen):** función de valor — eje X = resultado monetario objetivo (−\$100 a +\$100), eje Y = valor psicológico subjetivo; curva **roja en pérdidas / verde en ganancias**, marco de referencia en el origen, anotación **λ = 2,25×** ("perder \$50 duele 2,25 veces más que lo que alegra ganar \$50") (`07_aversion_perdidas`). Clara, grande, llamativa.
- **Hilo:** primer error sistemático y medible de la decisión. La asimetría pérdida/ganancia.

**E8 · El mismo problema, dos respuestas (el encuadre)**
- **Objetivo:** mostrar que cómo se *presenta* una opción cambia la decisión —el "contexto" del Acto 1, ahora en decisiones.
- **Texto:** "Una enfermedad amenaza a 600 personas. Hay dos programas. Cuando te los cuentan en términos de **vidas salvadas**, la gente elige lo seguro. Cuando te cuentan exactamente lo mismo en términos de **muertes**, la gente se arriesga. Es el mismo resultado. Cambió solo la palabra."
- **Gráfico G8:** barras agrupadas — encuadre "ganancia" (opción segura **72%**) vs encuadre "pérdida" (opción segura **22%**) (`08_framing_enfermedad`). Tversky & Kahneman, 1981.
- **Hilo:** conexión explícita con el Acto 1 — *el mismo estímulo, leído distinto según el contexto.* La percepción y la decisión usan la misma maquinaria.

**E9 · Los que menos saben, más seguros están (Dunning-Kruger)** — sin posicionar al usuario
- **Objetivo:** retomar la confianza, ahora en el juicio propio. **No se le pide al lector ubicarse.**
- **Texto:** "Pasa algo raro con la confianza: los que peor hacen una tarea son los que más se sobreestiman. No les alcanza la habilidad ni siquiera para darse cuenta de que les falta. Y, al revés, los mejores tienden a creer que cualquiera podría hacer lo que ellos hacen."
- **Gráfico G9:** curva/barras **competencia real vs autopercepción** por cuartil (`09_dunning_kruger`): el cuartil inferior (real ~p12) se cree en el ~p62; el superior se subestima. Misma forma que la curva de confianza del Acto 1 → "esto ya lo viste".
- **Hilo:** la confianza vuelve, idéntica a E5. Puente al Acto 3: esa sobreconfianza es explotable.

---

### INTERLUDIO B
Motivo de ruido que se resuelve en un **ojo** / una mano con hilos. Texto:
> *"Si tus errores son predecibles y universales… alguien los puede diseñar."*

---

### ACTO 3 — SESGOS · *Y otros lo saben — y lo usan* · acento violeta
> Regla del acto: **cada escena se conecta explícitamente con las ilusiones ya vistas.** El texto debe decir, en cada caso, que es *el mismo cerebro* que falló con el pato-conejo, las víboras o el audio.

**E10 · La ilusión de ser mejor que el promedio**
- **Objetivo:** mostrar la sobreconfianza como una *ilusión cognitiva*, medible e imposible.
- **Texto:** "El 93% de los conductores se cree mejor que el promedio. Es matemáticamente imposible: por definición, solo la mitad puede estar por encima de la media. No es soberbia: es **una ilusión**. El mismo cerebro que vio moverse una imagen quieta se ve a sí mismo mejor de lo que es."
- **Gráfico G10:** barras del **% que se cree por encima del promedio** por dominio (manejar 93%, dar clases 94%, managers top-10% 90%…) con una **línea de referencia en 50%** que deja en evidencia lo imposible (`10_mejor_que_promedio`). Similar al que ya venían usando.
- **Conexión con ilusiones:** la sobreconfianza es a la autoimagen lo que la ilusión de movimiento es a la vista.

**E11 · Un texto hecho a tu medida (Forer / Barnum)** — sin experimento personalizado
- **Objetivo:** mostrar por qué creemos descripciones genéricas como si fueran únicas.
- **Texto (mostrar el párrafo Barnum en pantalla, como si fuera para el lector):** "Tenés una gran necesidad de que los demás te aprecien. A veces sos sociable y otras reservado. Sentís que todavía no explotaste tu verdadero potencial…" → (reveal, al scrollear) "¿Te sentiste identificado? Es normal: **este texto se lo mostramos a todos.** En 1948, el psicólogo Bertram Forer le dio a sus alumnos exactamente la misma descripción genérica y la calificaron, en promedio, **4,26 sobre 5** de precisión. Es el truco del horóscopo, del tarot y del psíquico."
- **Gráfico G11:** dato grande **4,26/5** (Forer) + "**1 de cada 6** cree haber recibido una lectura psíquica acertada" (`11_efecto_forer`); y el mismo párrafo Barnum **anotado** mostrando qué frase explota qué (`11b_texto_barnum`).
- **Conexión con ilusiones (clave):** "Tu cerebro completó un texto vago con tu propia vida —igual que completó el triángulo que no estaba en la pantalla del Acto 1. La ilusión perceptiva y la creencia funcionan con el mismo mecanismo: rellenar lo ambiguo."
- **Interacción:** ninguna fuerte; es lectura + reveal por scroll.

**E12 · El cerebro que ve fantasmas (apofenia / pareidolia)**
- **Objetivo:** mostrar imágenes donde el cerebro percibe lo que no hay y respaldarlo con datos.
- **Texto:** "Somos tan buenos detectando patrones que los vemos donde no hay ninguno: una cara en un enchufe, una figura en las nubes, una presencia en una habitación vacía. El mismo cerebro que encontró movimiento en las víboras quietas encuentra fantasmas en el ruido."
- **Visual:** imágenes de **pareidolia** (caras en objetos) + el dato.
- **Gráfico G12:** barras de **experiencias 'paranormales'** y su explicación científica: sintió una presencia 37%, oyó un sonido inexplicable 33%, etc., con la columna "explicación" (pareidolia, infrasonido, alucinación hipnagógica) (`12_pareidolia_paranormal`).
- **Conexión con ilusiones:** apofenia = la versión "creencia" de completar el triángulo de Kanizsa y de ver movimiento donde no hay.

**E13 · Más seguros que los que saben (la brecha con la ciencia)**
- **Objetivo:** llevar el sesgo a escala social y cerrar el arco "otros lo usan".
- **Texto:** "Acá está la trampa final: aunque nos equivoquemos, **sentimos que tenemos razón** —incluso frente a miles de científicos que estudiaron el tema toda su vida. Esa misma sobreconfianza que te hizo creerte mejor conductor te hace confiar en tu intuición por encima del consenso experto. Y hay industrias que lo saben. *'La duda es nuestro producto'*, escribió una tabacalera en 1969. Hoy las mismas técnicas se usan para negar el cambio climático."
- **Gráfico G13:** la **brecha** entre lo que dice la ciencia y lo que cree la gente, por tema, con **quién se beneficia del hueco**: clima 87% científicos vs 50% público (EE.UU.) / 59% (Argentina); evolución 98 vs 65; y el dato estrella argentino: **67% cree que "la cura del cáncer está oculta"** (`13_brecha_consenso`). Apoyar con: *más de la mitad confía más en su propia búsqueda que en los científicos* (`13b`).
- **Conexión con ilusiones:** "Es la ilusión más cara de todas: creer que tu percepción del mundo le gana al método que justamente se inventó para corregir las ilusiones del cerebro."

---

## CIERRE (impacto, sin interacción)

> **No podés apagar la ilusión.**
> El tablero de ajedrez te va a seguir mostrando dos grises distintos aunque ya sepas que son el mismo color exacto.
>
> Tu cerebro no te miente para hacerte mal. Te miente porque construir una versión *útil* de la realidad es lo único que sabe hacer. Lo hace cuando mirás. Lo hace cuando elegís. Lo hace cuando creés.
>
> La única diferencia entre caer en la trampa y verla venir no es ser más inteligente.
> Es saber que la trampa existe.
>
> **Ahora lo sabés.**

**Pie:** créditos, autores, materia (Visualización de Datos — Neurociencia y Psicología Experimental, UTDT), y fuentes (datasets, Frederick 2005, Tversky & Kahneman 1981, Svenson 1981, Forer 1948, Kruger & Dunning 1999, Molins & Serrano 2019, Pew, Pulsar UBA, YouGov, teóricas Módulos 5/12/13).

---

## Resumen de gráficos (para repartir ≥3 por integrante)

| # | Escena | Gráfico | Tipo | Dato | Estado |
|---|---|---|---|---|---|
| G1 | E1 | Pato vs conejo | barras | `01_pato_conejo` | prototípico |
| G2 | E2 | Contexto: 70% cambia | barras antes/después | `02` / `02b` | simulado |
| G3 | E3 | 96/100 ven movimiento | waffle 100 | `03` | simulado |
| G4 | E4 | Ilusión auditiva | barras | `04` / `04b` | simulado |
| G5 | E5 | Confianza vs acierto | línea/barras | `05` | prototípico |
| G6 | E6 | Bate y pelota | barras | `06` | real (Frederick 2005) |
| G7 | E7 | Aversión a las pérdidas | curva valor | `07` | real (teoría prospectiva) |
| G8 | E8 | Encuadre (framing) | barras agrupadas | `08` | real (T&K 1981) |
| G9 | E9 | Dunning-Kruger | línea/barras | `09` | simulado |
| G10 | E10 | Mejor que el promedio | barras + línea 50% | `10` | real |
| G11 | E11 | Forer / Barnum | dato grande + texto anotado | `11` / `11b` | real + prototípico |
| G12 | E12 | Pareidolia / paranormal | barras | `12` | real (YouGov) |
| G13 | E13 | Brecha con la ciencia | barras / brecha | `13` / `13b` | real (Pew/Pulsar) |

13 gráficos: alcanza para 3–4 integrantes con margen.
