# Tu cerebro no te cuenta toda la verdad

Scrollytelling para **Visualización de Datos (UTDT)**: cómo el cerebro construye la realidad
(percepción · decisión · sesgos). HTML/CSS/JS vanilla + ECharts (CDN) + Canvas.

> **El contexto completo del proyecto está en [`CLAUDE.md`](CLAUDE.md)** (arquitectura, decisiones,
> estado de avance). Claude Code lo lee automáticamente al abrir la carpeta.

---

## Estado actual (jun-2026)

La historia completa está armada (3 módulos + cierre). Resumen de la identidad y la estructura vigentes
(el detalle fino, escena por escena, está en [`CLAUDE.md`](CLAUDE.md) — manda sobre cualquier doc viejo):

**Identidad / tipografía.** Fondo gris-negro frío + **3 familias con intención**: **Spectral** (serif) para
impacto, títulos y citas (las preguntas en itálica); **Hanken Grotesk** para el cuerpo; **IBM Plex Mono**
para datos, fuentes y UI. **Color POR MÓDULO:** Percepción **celeste `#8FD8FF`**, Decisión **naranja
`#F7943D`**, Sesgos **carmesí `#E11D48`** (verde/rojo solo para datos de ganancia/pérdida).

**Estructura = full-screen.** La base es **visualización a PANTALLA COMPLETA con el texto flotando** (variante
`.scrolly--stage`): el visual ocupa todo el viewport centrado y los pasos aparecen con el scroll. Hay además
un **scroll horizontal** (E12 · caras: título → 3 caras → gráfico, `.hscroll`) y la **portada de video**
scrubeada por el scroll (se rompe en neuronas, funde a negro, entra el título; botón ↺ y **riser de audio**
atado al scroll, opt-in). El **menú** está arriba a la izquierda y **cada gráfico cita su fuente**.

**Portales entre módulos.** Título grande + bajada en UNA pantalla (`.portal--plain`, sin espiral) + **puntitos
tipo iPhone** abajo que ubican el módulo (el actual pintado en su color, los otros grises).

- ✅ **Módulo 1 — Percepción** (E1–E5): pato/conejo interactivo, la pista, snakes (llena la pantalla al entrar
  y se achica con el scroll), oído (onda FM), **video del gorila a pantalla completa** + cierre (dona ≈50%).
- ✅ **Módulo 2 — Decisión** (E6–E9): bate y pelota (Sistema 1/2), apuesta (**moneda 3D que gira** + balanza de
  aversión a las pérdidas), encuadre (vuelco vidas/muertes), Dunning-Kruger (se dibuja con el scroll).
- ✅ **Módulo 3 — Sesgos** (E10–E13): mejor que el promedio, Forer/Barnum, caras/pareidolia (**scroll
  horizontal**), brecha con la ciencia + **cierre** (Checker Shadow) + pie.
- ⬜ **Pendiente:** completar nombres de autores en el pie, E11 (lectura Barnum) sigue en columna, pulido
  mobile/performance.

---

## Correr localmente

Necesita un server estático (el `fetch` del JSON no funciona con `file://`):

```bash
# Server SIN CACHÉ (recomendado): cada reload normal trae el último CSS/JS
python3 serve.py            # → http://localhost:8000
python3 serve.py 8090       # otro puerto si el 8000 está ocupado
```
Abrir **http://localhost:8000**. Con `serve.py` alcanza un **reload normal** (Cmd/Ctrl + R)
después de cada cambio: no hace falta levantar un server nuevo ni hacer hard-reload.
(Evitá `python -m http.server`: cachea CSS/JS viejos y parece que los cambios "no se aplican".)

---

## Sumarte al proyecto (onboarding)

1. **Clonar** (la primera vez):
   ```bash
   git clone https://github.com/coderlucas07/visualizacion-de-datos-final.git
   cd visualizacion-de-datos-final
   ```
2. **Antes de empezar a trabajar, siempre:** `git pull` (arrancás con lo último que subió el otro).
3. Hacés tus cambios → los commiteás.
4. **Antes de subir:** `git pull` otra vez y después `git push`.

> **Mantené el contexto sincronizado:** si cambiás algo importante (una escena, un gráfico, una decisión),
> actualizá [`CLAUDE.md`](CLAUDE.md) (estado / decisiones) **en el mismo commit**. Es el cerebro compartido:
> si el código avanza pero `CLAUDE.md` no, el resto del equipo (y su Claude Code) queda desactualizado.

> Para evitar choques entre dos personas: repártanse escenas/archivos (ej. uno el Acto 3, otro el pulido
> del Acto 1) así casi nunca tocan las mismas líneas. Si aparece un "conflicto", git marca las dos versiones
> en el archivo (`<<<<<<<` / `=======` / `>>>>>>>`); en VS Code se resuelve con los botones Accept Current/Incoming.

---

## Trabajar con Claude Code

Claude lee `CLAUDE.md` solo, pero para que arranque bien podés pegarle este primer mensaje:

> Leé `CLAUDE.md` completo (manda sobre los docs viejos) y mirá `data/datos_visualizaciones.json`.
> Decime en qué fase está el proyecto antes de tocar nada. Reglas clave: el **scroll es el protagonista**,
> la base es **full-screen** (visual a pantalla completa + texto flotante, `.scrolly--stage`), **3 familias**
> (Spectral/Hanken/Plex Mono) y **color por módulo**, y los números **siempre** se leen del JSON (no hardcodear).

---

## Estructura

- `index.html` — escenas del relato (cada escena de datos es una `<section class="scrolly">`).
- `css/styles.css` — estilos (paleta, motor scrolly, animaciones, responsive).
- `js/` — `main.js` (motor de scroll + interacciones), `charts.js` (gráficos ECharts/Canvas), `noise.js` (ruido→señal).
- `data/datos_visualizaciones.json` — datos de los 13 gráficos (el motor de todo).
- `assets/` — imágenes y audio.

## Deploy

Sitio estático: subir la carpeta tal cual a Netlify, Vercel o GitHub Pages.
