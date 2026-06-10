# Tu cerebro no te cuenta toda la verdad

Scrollytelling para **Visualización de Datos (UTDT)**: cómo el cerebro construye la realidad
(percepción · decisión · sesgos). HTML/CSS/JS vanilla + ECharts (CDN) + Canvas.

> **El contexto completo del proyecto está en [`CLAUDE.md`](CLAUDE.md)** (arquitectura, decisiones,
> estado de avance). Claude Code lo lee automáticamente al abrir la carpeta.

---

## Estado actual (jun-2026)

La historia completa está armada (3 módulos + cierre). Layout **full-bleed**: el visual ocupa toda la pantalla,
el texto va superpuesto, y cada módulo abre con un **portal de espiral** (gira → negro → título del módulo).

- ✅ **Módulo 1 — Percepción** (E1–E5).
- ✅ **Módulo 2 — Decisión** (E6–E9).
- ✅ **Módulo 3 — Sesgos** (E10–E13) + **cierre** (Checker Shadow) + **pie** (créditos/fuentes).
- ⬜ **Pendiente:** completar los nombres de autores en el pie, pulido responsive/mobile y performance.

Detalle escena por escena y convenciones: en [`CLAUDE.md`](CLAUDE.md).

---

## Correr localmente

Necesita un server estático (el `fetch` del JSON no funciona con `file://`):

```bash
# Mac / Linux
python3 -m http.server 8000
#   (en Windows: python -m http.server 8000)
```
Abrir **http://localhost:8000** y refrescar con **Cmd/Ctrl + Shift + R** después de cada cambio.

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

> Leé `CLAUDE.md`, `prompt_claude_code.md` y `propuesta_v2_storytelling.md` completos, y mirá
> `data/datos_visualizaciones.json`. Decime en qué fase está el proyecto antes de tocar nada.
> Regla clave: el **scroll es el protagonista** (motor sticky de pasos, una idea por vez), **nada de
> "actos" explícitos en pantalla**, y los números **siempre** se leen del JSON (no hardcodear).
> Cuando entiendas el estado, seguimos con el Acto 3 (E10–E13).

---

## Estructura

- `index.html` — escenas del relato (cada escena de datos es una `<section class="scrolly">`).
- `css/styles.css` — estilos (paleta, motor scrolly, animaciones, responsive).
- `js/` — `main.js` (motor de scroll + interacciones), `charts.js` (gráficos ECharts/Canvas), `noise.js` (ruido→señal).
- `data/datos_visualizaciones.json` — datos de los 13 gráficos (el motor de todo).
- `assets/` — imágenes y audio.

## Deploy

Sitio estático: subir la carpeta tal cual a Netlify, Vercel o GitHub Pages.
