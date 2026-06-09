# Tu cerebro no te cuenta toda la verdad

Scrollytelling para **Visualización de Datos (UTDT)**: cómo el cerebro construye la realidad
(percepción · decisión · sesgos). HTML/CSS/JS vanilla + ECharts (CDN) + Canvas.

## Correr localmente
Necesita un server estático (el `fetch` del JSON no funciona con `file://`):

```bash
# Mac / Linux
python3 -m http.server 8000

# Windows
python -m http.server 8000
```
Abrir http://localhost:8000

## Estructura
- `index.html` — escenas del relato.
- `css/styles.css` — estilos (paleta, layout, animaciones).
- `js/` — `main.js` (orquestación), `charts.js` (gráficos), `noise.js` (motivo ruido→señal).
- `data/datos_visualizaciones.json` — datos de los 13 gráficos.
- `assets/` — imágenes y audio.

El contexto completo del proyecto y el estado de avance están en **`CLAUDE.md`**.

## Deploy
Sitio estático: subir la carpeta tal cual a Netlify, Vercel o GitHub Pages.
