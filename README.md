# Tu cerebro no te cuenta toda la verdad

Scrollytelling para **Visualización de Datos (UTDT)**: cómo el cerebro construye la realidad
(percepción · decisión · sesgos). HTML/CSS/JS vanilla + ECharts (CDN) + Canvas.

> **El contexto completo del proyecto está en [`CLAUDE.md`](CLAUDE.md)** (arquitectura, decisiones,
> estado de avance). Claude Code lo lee automáticamente al abrir la carpeta.

---

## Estado actual (jun-2026, tras la portada de video + identidad gris/celeste)

La historia completa está armada (3 módulos + cierre) con la **identidad nueva**: gris frío + **celeste
neuronal `#8FD8FF`** (el celeste del cerebro del video), tipografías **Unbounded / Spectral / Hanken
Grotesk / IBM Plex Mono**. Layout **dos columnas** (el texto scrollea a la izquierda y **nunca tapa** el
visual fijo de la derecha), con momentos full-bleed deliberados (Rotating Snakes a pantalla completa).
La **portada** es un **video a pantalla completa scrubeado por el scroll** (el hombre que grita y su cabeza
se rompe en neuronas): arranca solo, "respira" mientras nadie scrollea, y al final funde a negro y aparece
el título (con botón ↺ para rebobinar en reversa). Cada módulo abre con el **túnel de espiral**: el título
aparece ya adentro y un **puntito crece con el scroll hasta tragarte**. Hay **menú de módulos** arriba a la
izquierda; **E1 es interactivo** (imagen ⇄ gráfico con barras que crecen con el scroll) y **cada gráfico
cita su fuente**.

- ✅ **Módulo 1 — Percepción** (E1–E5, con E3 snakes full-bleed + E3b waffle).
- ✅ **Módulo 2 — Decisión** (E6–E9).
- ✅ **Módulo 3 — Sesgos** (E10–E13) + **cierre** (Checker Shadow) + **pie** (créditos/fuentes).
- ⬜ **Pendiente:** completar los nombres de autores en el pie y pulido fino mobile/performance.

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

> Leé `CLAUDE.md` completo (manda sobre los docs viejos) y mirá `data/datos_visualizaciones.json`.
> Decime en qué fase está el proyecto antes de tocar nada. Reglas clave: el **scroll es el protagonista**
> (motor de pasos en dos columnas: el texto nunca tapa el visual), identidad **gris + celeste neuronal**
> (Unbounded/Spectral) sobre gris-negro frío, y los números **siempre** se leen del JSON (no hardcodear).

---

## Estructura

- `index.html` — escenas del relato (cada escena de datos es una `<section class="scrolly">`).
- `css/styles.css` — estilos (paleta, motor scrolly, animaciones, responsive).
- `js/` — `main.js` (motor de scroll + interacciones), `charts.js` (gráficos ECharts/Canvas), `noise.js` (ruido→señal).
- `data/datos_visualizaciones.json` — datos de los 13 gráficos (el motor de todo).
- `assets/` — imágenes y audio.

## Deploy

Sitio estático: subir la carpeta tal cual a Netlify, Vercel o GitHub Pages.
